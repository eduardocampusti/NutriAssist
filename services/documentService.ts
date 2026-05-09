import { generateId } from '../utils/id';
import { supabase } from './supabase';
import { DocStatus, FormalDocument, GeneratedContent } from '../types';

export enum OfficialDocType {
    CARDAPIO_REGULAR = 'CARDAPIO_REGULAR',
    CARDAPIO_ESPECIAL = 'CARDAPIO_ESPECIAL',
    PARECER_TECNICO = 'PARECER_TECNICO',
    RELATORIO_MENSAL = 'RELATORIO_MENSAL',
    MAPA_CONSUMO = 'MAPA_CONSUMO',
    TERMO_REFERENCIA = 'TERMO_REFERENCIA',
    ETP = 'ESTUDO_TECNICO_PRELIMINAR',
    RESTRICAO_ALIMENTAR = 'RESTRICAO_ALIMENTAR'
}

export const documentService = {
    /**
     * Salva um documento oficial gerado no histórico (tabela formal_documents)
     */
    saveDocument: async (
        type: OfficialDocType,
        title: string,
        authorId: string,
        content: GeneratedContent,
        referenceId?: string
    ): Promise<string> => {
        const { data, error } = await supabase.from('formal_documents').insert({
            document_type: type,
            titulo: title,
            responsavel_id: authorId,
            content: content,
            status: DocStatus.APROVADO, // Apenas dados aprovados geram documentos oficiais finais
            referencia_id: referenceId, // ID da entidade original (ex: ID do Cardápio)
            created_at: new Date().toISOString()
        }).select('id').single();

        if (error) {
            console.warn("Supabase Insert Failed (Formal Doc), switching to LocalStorage Fallback.", error);
            const fallbackId = generateId();
            const localDoc = {
                id: fallbackId,
                document_type: type,
                titulo: title,
                responsavel_id: authorId,
                content: content,
                status: DocStatus.APROVADO,
                referencia_id: referenceId,
                created_at: new Date().toISOString()
            };

            const existing = localStorage.getItem('nutriassist_official_docs_backup');
            const parsed = existing ? JSON.parse(existing) : [];
            localStorage.setItem('nutriassist_official_docs_backup', JSON.stringify([...parsed, localDoc]));

            return fallbackId;
        }

        return data.id;
    },

    /**
     * Recupera histórico de um documento por tipo ou referência
     */
    getHistory: async (type?: OfficialDocType, referenceId?: string): Promise<FormalDocument[]> => {
        let query = supabase.from('formal_documents').select('*').order('created_at', { ascending: false });

        if (type) query = query.eq('document_type', type);
        if (referenceId) query = query.eq('referencia_id', referenceId);

        const { data, error } = await query;
        if (error) throw error;
        return data as FormalDocument[];
    },

    /**
     * Formata os dados para o Papel Timbrado (Letterhead)
     */
    prepareLetterheadContent: (letterhead: any, docContent: GeneratedContent) => {
        return {
            header: {
                municipio: letterhead.municipio,
                uf: letterhead.uf,
                orgao: letterhead.orgao,
                secretaria: letterhead.secretaria,
                setor: letterhead.setor,
                logo: letterhead.logoEmoji
            },
            title: docContent.titulo,
            subject: docContent.assunto,
            body: docContent.corpo,
            footer: {
                date: new Date().toLocaleDateString('pt-BR'),
                responsavel: letterhead.responsavelSME,
                version: letterhead.sistemaVersao
            }
        };
    }
};
