import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProcurementPlan, LetterheadConfig } from '../types';
import { supabase } from '../services/supabase';
import { useDocuments } from './DocumentContext';
import { useAuth } from './AuthContext';

interface PNAEContextType {
    procurements: ProcurementPlan[];
    letterhead: LetterheadConfig;
    addProcurement: (plan: Omit<ProcurementPlan, 'id' | 'created_at' | 'authorId'>, authorId: string) => Promise<void>;
    updateLetterhead: (config: LetterheadConfig) => Promise<void>;
    isLoading: boolean;
}

const PNAEContext = createContext<PNAEContextType | undefined>(undefined);

export const PNAEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const defaultLetterhead: LetterheadConfig = {
        municipio: "BROTAS DE MACAÚBAS",
        showMunicipio: true,
        uf: "BA",
        orgao: "PREFEITURA MUNICIPAL",
        showOrgao: true,
        secretaria: "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
        showSecretaria: true,
        setor: "DEPARTAMENTO DE ALIMENTAÇÃO ESCOLAR",
        showSetor: true,
        textoPersonalizado: "ESTADO DA BAHIA",
        showTextoPersonalizado: true,
        rodapeTexto: "NutriAssist v1.0 — Gestão Técnica PNAE",
        showRodapeTexto: true,
        logoEmoji: "🥗",
        primaryColor: '#10b981',
        sidebarColor: '#020617',
        accentColor: '#6366f1',
        sistemaVersao: "v2.6.0",
        dataCriacao: "2025",
        ultimaAtualizacao: new Date().toISOString().split('T')[0],
        responsavelSME: "Responsável Técnico",
        prefeitoNome: "Dr. Antônio Kleber Ribeiro",
        secretariaNome: "Gislene Leite Santos Araújo",
        nutricionistaNome: "Alexandra Fernandes",
        nutricionistaCrn: "CRN-5/16149",
        onboardingComplete: true
    };

    const [procurements, setProcurements] = useState<ProcurementPlan[]>([]);
    const [letterhead, setLetterhead] = useState<LetterheadConfig>(defaultLetterhead);
    const [isLoading, setIsLoading] = useState(false);
    const { addLog } = useDocuments();
    const { user } = useAuth();

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // Load Procurements
                const { data: dbProcurements, error: pErr } = await supabase.from('procurements').select('*');
                if (pErr) throw pErr;

                if (dbProcurements.length === 0) {
                    const localProcurements = JSON.parse(localStorage.getItem('nutriassist_procurement') || '[]') as ProcurementPlan[];
                    if (localProcurements.length > 0) {
                        const toInsert = localProcurements.map(p => ({
                            id: p.id,
                            titulo: p.titulo,
                            ano_referencia: p.anoReferencia,
                            status: p.status,
                            itens: p.itens,
                            justificativa_tecnica: p.justificativaTecnica,
                            author_id: p.authorId || null,
                            created_at: new Date(p.created_at).toISOString()
                        }));
                        await supabase.from('procurements').insert(toInsert);
                        setProcurements(localProcurements);
                    }
                } else {
                    setProcurements(dbProcurements.map(p => ({
                        id: p.id,
                        titulo: p.titulo,
                        anoReferencia: p.ano_referencia,
                        status: p.status,
                        itens: p.itens,
                        justificativaTecnica: p.justificativa_tecnica,
                        authorId: p.author_id,
                        created_at: new Date(p.created_at).getTime()
                    })));
                }

                // Load Letterhead
                const { data: dbSettings, error: sErr } = await supabase.from('application_settings').select('*').eq('id', 'letterhead').single();

                if (sErr && sErr.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
                    throw sErr;
                }

                if (!dbSettings) {
                    const localLetterhead = localStorage.getItem('nutriassist_letterhead');
                    const initialLetterhead = localLetterhead ? JSON.parse(localLetterhead) : defaultLetterhead;

                    await supabase.from('application_settings').insert({
                        id: 'letterhead',
                        data: initialLetterhead
                    });
                    setLetterhead(initialLetterhead);
                } else {
                    let data = dbSettings.data as LetterheadConfig;
                    // Auto-migration: Update version if old
                    if (data.sistemaVersao === 'v1.1.0' || !data.sistemaVersao) {
                        data.sistemaVersao = 'v2.6.0';
                        await supabase.from('application_settings').update({ data }).eq('id', 'letterhead');
                    }
                    setLetterhead(data);
                }

            } catch (error) {
                console.error("Falha ao carregar dados do PNAE:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const addProcurement = async (p: Omit<ProcurementPlan, 'id' | 'created_at' | 'authorId'>, authorId: string) => {
        const newPlan: ProcurementPlan = {
            ...p,
            id: crypto.randomUUID(),
            created_at: Date.now(),
            authorId
        };

        const { error } = await supabase.from('procurements').insert({
            id: newPlan.id,
            titulo: newPlan.titulo,
            ano_referencia: newPlan.anoReferencia,
            status: newPlan.status,
            itens: newPlan.itens,
            justificativa_tecnica: newPlan.justificativaTecnica,
            author_id: authorId || null,
            created_at: new Date(newPlan.created_at).toISOString()
        });

        if (!error) {
            setProcurements(prev => [...prev, newPlan]);
            await addLog({
                usuario_id: user?.id || 'system',
                modulo: 'LICITACAO',
                acao: 'GERACAO_PLANO_COMPRA',
                dados: { id: newPlan.id, titulo: newPlan.titulo }
            });
        }
    };

    const updateLetterhead = async (config: LetterheadConfig) => {
        // Persistência local imediata
        localStorage.setItem('nutriassist_letterhead', JSON.stringify(config));
        setLetterhead(config);

        try {
            // Using upsert to ensure it saves even if the row was somehow deleted or missed
            const { error } = await supabase.from('application_settings').upsert({
                id: 'letterhead',
                data: config,
                updated_at: new Date().toISOString()
            });

            if (error) {
                console.error("Erro ao sincronizar configurações com Supabase:", error);
                // Não interrompemos o fluxo, pois já salvamos localmente
            } else {
                await addLog({
                    usuario_id: user?.id || 'system',
                    modulo: 'CONFIGURACOES',
                    acao: 'ALTERACAO_INSTITUCIONAL',
                    dados: { municipio: config.municipio }
                });
            }
        } catch (err) {
            console.error("Falha crítica ao atualizar configurações:", err);
        }
    };

    return (
        <PNAEContext.Provider value={{
            procurements, letterhead,
            addProcurement, updateLetterhead,
            isLoading
        }}>
            {children}
        </PNAEContext.Provider>
    );
};

export const usePNAE = () => {
    const context = useContext(PNAEContext);
    if (context === undefined) {
        throw new Error('usePNAE must be used within a PNAEProvider');
    }
    return context;
};
