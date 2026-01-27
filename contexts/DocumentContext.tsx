import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormalDocument, HistoryItem, SystemLog, DocStatus, GeneratedContent, DocumentCategory, UserRole } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface DocumentContextType {
    formalDocs: FormalDocument[];
    docTypes: any[];
    history: HistoryItem[];
    systemLogs: SystemLog[];
    generatedContent: GeneratedContent | null;
    currentDocId: string;
    currentDocStatus: DocStatus;
    isGenerating: boolean;
    addDocument: (doc: FormalDocument) => Promise<void>;
    updateDocumentStatus: (id: string, status: DocStatus) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    addLog: (log: Omit<SystemLog, 'id' | 'created_at'>) => Promise<void>;
    clearLogs: () => Promise<void>;
    setGeneratedContent: (content: GeneratedContent | null) => void;
    setCurrentDocId: (id: string) => void;
    setCurrentDocStatus: (status: DocStatus) => void;
    setIsGenerating: (status: boolean) => void;
    isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [formalDocs, setFormalDocs] = useState<FormalDocument[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

    const [docTypes] = useState<any[]>([
        { id: '1', label: 'Ofício Administrativo', category: 'OFICIO', active: true, description: 'Comunicação formal externa/interna.' },
        { id: '2', label: 'Parecer Técnico Nutricional', category: 'PARECER', active: true, description: 'Análise técnica fundamentada.' },
        { id: '3', label: 'Nota Técnica', category: 'NOTA_TECNICA', active: true, description: 'Orientação normativa para a rede.' },
        { id: '4', label: 'Minuta de Portaria', category: 'MINUTA_PORTARIA', active: true, description: 'Instituição de normas oficiais.' },
        { id: '5', label: 'Termo de Referência (Licitação)', category: 'TERMO_REFERENCIA', active: true, description: 'Esp. técnica para licitação.' },
        { id: '6', label: 'Justificativa Técnica (Agricultura Familiar)', category: 'CHAMADA_PUBLICA', active: true, description: 'Para Chamada Pública.' },
        { id: '7', label: 'Cardápio Técnico', category: 'CARDAPIO', active: true, description: 'Planejamento e adequação Nutricional.' },
        { id: '8', label: 'Ficha Técnica de Preparação (FTP)', category: 'FICHA_TECNICA', active: true, description: 'Detalhamento de preparações.' },
        { id: '9', label: 'Laudo Técnico Nutricional', category: 'LAUDO_TECNICO', active: true, description: 'Diagnóstico e recomendações.' },
        { id: '10', label: 'Especificação Técnica de Gêneros', category: 'ESPECIFICACAO_TECNICA', active: true, description: 'Padrões de qualidade para compras.' },
        { id: '11', label: 'Declaração de Responsabilidade Técnica', category: 'DECLARACAO_RT', active: true, description: 'Documento para o CRN/PNAE.' },
        { id: '12', label: 'Diagnóstico Nutricional da Rede', category: 'DIAGNOSTICO_NUTRICIONAL', active: true, description: 'Laudo coletivo antropométrico.' },
        { id: '13', label: 'Ata de Capacitação', category: 'ATA_CAPACITACAO', active: true, description: 'Registro de treinamento.' },
        { id: '14', label: 'Relatório Mensal PNAE', category: 'MENSAL', active: true, description: 'Prestação de contas regular.' },
        { id: '15', label: 'Balanço de Estoque', category: 'ESTOQUE', active: true, description: 'Entradas, saídas e saldo.' },
    ]);

    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [currentDocId, setCurrentDocId] = useState<string>('');
    const [currentDocStatus, setCurrentDocStatus] = useState<DocStatus>(DocStatus.ELABORACAO);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial Load from Supabase
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const { data: dbDocs, error: dErr } = await supabase.from('formal_documents').select('*').order('created_at', { ascending: false });
                const { data: dbHistory, error: hErr } = await supabase.from('history_items').select('*').order('timestamp', { ascending: false });
                const { data: dbLogs, error: lErr } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false });

                if (dErr || hErr || lErr) throw new Error("Erro ao buscar dados do arquivo.");

                // Migration from LocalStorage if DB is empty
                if (dbDocs.length === 0) {
                    const localDocs = JSON.parse(localStorage.getItem('nutriassist_archive') || '[]') as FormalDocument[];
                    if (localDocs.length > 0) {
                        const docsToInsert = localDocs.map(d => ({
                            id: d.id,
                            document_type: d.document_type,
                            titulo: d.titulo,
                            status: d.status,
                            responsavel_id: d.responsavel_id || null, // Supabase expects UUID or null
                            school_id: d.school_id || null,
                            content: d.content,
                            created_at: new Date(d.created_at).toISOString(),
                            is_deleted: !!d.isDeleted,
                            deleted_at: d.deletedAt ? new Date(d.deletedAt).toISOString() : null
                        }));
                        await supabase.from('formal_documents').insert(docsToInsert);
                        setFormalDocs(localDocs);
                    } else {
                        setFormalDocs([]);
                    }
                } else {
                    setFormalDocs(dbDocs.map(d => ({
                        id: d.id,
                        document_type: d.document_type,
                        titulo: d.titulo,
                        status: d.status,
                        responsavel_id: d.responsavel_id,
                        school_id: d.school_id,
                        content: d.content,
                        created_at: new Date(d.created_at).getTime(),
                        isDeleted: d.is_deleted,
                        deletedAt: d.deleted_at ? new Date(d.deleted_at).getTime() : undefined
                    })));
                }

                if (dbHistory.length === 0) {
                    const localHistory = JSON.parse(localStorage.getItem('nutriassist_history_v4') || '[]') as HistoryItem[];
                    if (localHistory.length > 0) {
                        const historyToInsert = localHistory.map(h => ({
                            id: h.id,
                            timestamp: new Date(h.timestamp).toISOString(),
                            type: h.type,
                            category: h.category,
                            title: h.title,
                            content: h.content,
                            status: h.status,
                            author_role: h.authorRole,
                            author_name: h.authorName,
                            profile_id: h.profileId || null
                        }));
                        await supabase.from('history_items').insert(historyToInsert);
                        setHistory(localHistory);
                    } else {
                        setHistory([]);
                    }
                } else {
                    setHistory(dbHistory.map(h => ({
                        id: h.id,
                        timestamp: new Date(h.timestamp).getTime(),
                        type: h.type,
                        category: h.category,
                        title: h.title,
                        content: h.content,
                        status: h.status,
                        authorRole: h.author_role,
                        authorName: h.author_name,
                        profileId: h.profile_id
                    })));
                }

                if (dbLogs.length === 0) {
                    const localLogs = JSON.parse(localStorage.getItem('nutriassist_logs') || '[]') as SystemLog[];
                    if (localLogs.length > 0) {
                        const logsToInsert = localLogs.map(l => ({
                            id: l.id,
                            usuario_id: l.usuario_id || null,
                            modulo: l.modulo,
                            acao: l.acao,
                            dados: l.dados,
                            created_at: new Date(l.created_at).toISOString()
                        }));
                        await supabase.from('system_logs').insert(logsToInsert);
                        setSystemLogs(localLogs);
                    } else {
                        setSystemLogs([]);
                    }
                } else {
                    setSystemLogs(dbLogs.map(l => ({
                        id: l.id,
                        usuario_id: l.usuario_id,
                        modulo: l.modulo,
                        acao: l.acao,
                        dados: l.dados,
                        created_at: new Date(l.created_at).getTime()
                    })));
                }

            } catch (error) {
                console.error("Falha ao carregar arquivo do Supabase:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const addDocument = async (doc: FormalDocument) => {
        const newDoc = {
            id: doc.id,
            document_type: doc.document_type,
            titulo: doc.titulo,
            status: doc.status,
            responsavel_id: doc.responsavel_id || null,
            school_id: doc.school_id || null,
            content: doc.content,
            created_at: new Date(doc.created_at).toISOString()
        };
        const { error } = await supabase.from('formal_documents').insert(newDoc);
        if (!error) {
            setFormalDocs(prev => [doc, ...prev]);

            // Auto-add to history
            const historyItem: HistoryItem = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: 'GERACAO_DOCUMENTO',
                category: doc.document_type,
                title: doc.titulo,
                content: doc.content,
                status: doc.status,
                authorRole: doc.responsavel_id ? UserRole.NUTRICIONISTA : UserRole.VISUALIZADOR, // Fallback
                profileId: doc.responsavel_id
            };

            await supabase.from('history_items').insert({
                id: historyItem.id,
                timestamp: new Date(historyItem.timestamp).toISOString(),
                type: historyItem.type,
                category: historyItem.category,
                title: historyItem.title,
                content: historyItem.content,
                status: historyItem.status,
                author_role: historyItem.authorRole,
                profile_id: historyItem.profileId || null
            });
            setHistory(prev => [historyItem, ...prev]);

            await addLog({
                usuario_id: user?.id || 'system',
                modulo: 'DOCUMENTOS',
                acao: 'GERACAO_DOC',
                dados: { id: doc.id, titulo: doc.titulo, tipo: doc.document_type }
            });
        }
    };

    const updateDocumentStatus = async (id: string, status: DocStatus) => {
        const { error } = await supabase.from('formal_documents').update({ status }).eq('id', id);
        if (!error) {
            setFormalDocs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
            await addLog({
                usuario_id: user?.id || 'system',
                modulo: 'DOCUMENTOS',
                acao: 'ALTERACAO_STATUS',
                dados: { id, status_novo: status }
            });
        }
    };

    const deleteDocument = async (id: string) => {
        const deletedAt = Date.now();
        const { error } = await supabase.from('formal_documents').update({
            is_deleted: true,
            deleted_at: new Date(deletedAt).toISOString()
        }).eq('id', id);

        if (!error) {
            setFormalDocs(prev => prev.map(d => d.id === id ? { ...d, isDeleted: true, deletedAt } : d));
            await addLog({
                usuario_id: user?.id || 'system',
                modulo: 'DOCUMENTOS',
                acao: 'EXCLUSAO_DOC',
                dados: { id }
            });
        }
    };

    const addLog = async (log: Omit<SystemLog, 'id' | 'created_at'>) => {
        const timestamp = Date.now();
        const id = crypto.randomUUID();
        const { error } = await supabase.from('system_logs').insert({
            id,
            usuario_id: log.usuario_id || null,
            modulo: log.modulo,
            acao: log.acao,
            dados: log.dados,
            created_at: new Date(timestamp).toISOString()
        });

        if (!error) {
            setSystemLogs(prev => [{ ...log, id, created_at: timestamp }, ...prev]);
        }
    };

    const clearLogs = async () => {
        const { error } = await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (!error) {
            setSystemLogs([]);
        }
    };

    return (
        <DocumentContext.Provider value={{
            formalDocs, docTypes, history, systemLogs,
            generatedContent, currentDocId, currentDocStatus, isGenerating,
            addDocument, updateDocumentStatus, deleteDocument, addLog, clearLogs,
            setGeneratedContent, setCurrentDocId, setCurrentDocStatus, setIsGenerating,
            isLoading
        }}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocuments = () => {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
};
