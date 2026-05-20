import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { useToast } from './ToastContext';
import { useDocuments } from './DocumentContext';

interface UserContextType {
    profiles: UserProfile[];
    currentProfileId: string;
    activeProfile: UserProfile | undefined;
    addProfile: (profile: Omit<UserProfile, 'id' | 'created_at'>) => Promise<void>;
    updateProfile: (id: string, updates: Partial<UserProfile>) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
    setCurrentProfileId: (id: string) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const normalizeProfile = (p: any): UserProfile => {
    const rawRole = p.role || p.perfil || UserRole.NUTRICIONISTA;
    const upperRole = String(rawRole).toUpperCase();
    const role = Object.values(UserRole).includes(upperRole as UserRole)
        ? upperRole as UserRole
        : UserRole.NUTRICIONISTA;
    const status = p.status || (p.bloqueado ? 'BLOQUEADO' : p.ativo === false ? 'INATIVO' : 'ATIVO');

    return {
        ...p,
        role,
        status,
        ativo: p.ativo !== false && status !== 'INATIVO',
        bloqueado: p.bloqueado === true || status === 'BLOQUEADO',
        email: p.email || p.login || '',
        zona_id: p.zona_id || null,
        senha_provisoria: p.senha_provisoria === true,
        data_alteracao_senha: p.data_alteracao_senha,
        created_at: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    } as UserProfile;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { addLog } = useDocuments();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentProfileId, setCurrentProfileId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const loadProfiles = useCallback(async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;
        setProfiles((data || []).map(normalizeProfile));
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                await loadProfiles();

                const lastId = localStorage.getItem('nutriassist_active_profile_id')?.replace(/"/g, '');
                if (lastId && user) setCurrentProfileId(lastId);
                else if (!user) setCurrentProfileId('');
            } catch (err) {
                console.error('Error loading user profiles:', err);
                setProfiles([]);
                setCurrentProfileId('');
                addToast('Erro ao carregar perfis de usuarios do banco.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [user, loadProfiles, addToast]);

    useEffect(() => {
        if (currentProfileId && user) {
            localStorage.setItem('nutriassist_active_profile_id', currentProfileId);
        }
    }, [currentProfileId, user]);

    useEffect(() => {
        if (!user) {
            setCurrentProfileId('');
            return;
        }

        const userEmailLower = user.email?.toLowerCase();
        let match = profiles.find(p => p.id === user.id);

        if (!match && userEmailLower) {
            match = profiles.find(p =>
                (p.email && p.email.toLowerCase() === userEmailLower) ||
                (p.login && p.login.toLowerCase() === userEmailLower)
            );
        }

        setCurrentProfileId(match?.id || '');
    }, [user, profiles]);

    const addProfile = async (profile: Omit<UserProfile, 'id' | 'created_at'>) => {
        setIsLoading(true);
        try {
            const email = (profile.email || profile.login || '').trim().toLowerCase();
            const password = profile.senha?.trim();

            if (!email || !password || !profile.nome?.trim()) {
                throw new Error('Nome, email/login e senha inicial sao obrigatorios.');
            }

            const profilePayload = {
                ...profile,
                email,
                login: email,
                role: profile.role || UserRole.NUTRICIONISTA,
                perfil: profile.role || UserRole.NUTRICIONISTA,
                ativo: true,
                status: 'ATIVO',
                bloqueado: false
            };

            const { data, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email,
                    password,
                    nome: profilePayload.nome,
                    role: profilePayload.role,
                    perfil: profilePayload.perfil,
                    school_id: profilePayload.school_id || null,
                    cpf: profilePayload.cpf || null,
                    crn: profilePayload.crn || null,
                    telefone: profilePayload.telefone || null,
                    endereco: profilePayload.endereco || null,
                    foto: profilePayload.foto || null,
                    zona_id: profilePayload.zona_id || null,
                    ativo: true,
                    status: 'ATIVO'
                }
            });

            if (error) throw new Error(error.message || 'Erro ao chamar funcao de criacao.');
            if (data?.error) throw new Error(data.error);
            if (!data?.user?.id) throw new Error('Usuario criado sem id de Auth retornado.');

            const { data: createdProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError || !createdProfile) {
                throw new Error(profileError?.message || 'Auth user criado, mas o profile nao foi encontrado no banco.');
            }

            const normalizedProfile = normalizeProfile(createdProfile);
            if (normalizedProfile.role !== profilePayload.role || !normalizedProfile.ativo || normalizedProfile.status !== 'ATIVO') {
                throw new Error('Profile criado com role, status ou ativo incompatibeis com a listagem.');
            }

            await loadProfiles();
            addToast('Usuario e login criados com sucesso!', 'success');

            await addLog({
                usuario_id: user?.id || 'system',
                userId: user?.id || 'system',
                modulo: 'USUARIOS',
                acao: 'CADASTRO_USUARIO_COMPLETO',
                level: 'INFO',
                message: `Usuario criado: ${normalizedProfile.nome}`,
                timestamp: Date.now(),
                dados: { id: normalizedProfile.id, nome: normalizedProfile.nome, role: normalizedProfile.role }
            });
        } catch (err: any) {
            console.error('Erro ao criar usuario:', err);
            addToast(err.message || 'Erro ao processar cadastro.', 'error');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (id: string, updates: Partial<UserProfile>) => {
        const currentProfile = profiles.find(p => p.id === id);
        if (!currentProfile) return;

        const updatedProfile = { ...currentProfile, ...updates };

        if (updates.senha && user?.id === id) {
            const { error: authError } = await supabase.auth.updateUser({ password: updates.senha });
            if (authError) {
                console.error('Erro ao sincronizar senha com Auth:', authError);

                const msg = authError.message?.toLowerCase();
                if (msg?.includes('different') || msg?.includes('same') || msg?.includes('igual')) {
                    console.warn('Senha igual a anterior, prosseguindo...');
                } else {
                    addToast(`Erro de Autenticacao: ${authError.message}`, 'error');
                    throw authError;
                }
            }
        }

        const { error } = await supabase.rpc('manage_user_profile', {
            p_id: id,
            p_nome: updatedProfile.nome,
            p_role: updatedProfile.role,
            p_school_id: updatedProfile.school_id || null,
            p_cpf: updatedProfile.cpf || null,
            p_crn: updatedProfile.crn || null,
            p_telefone: updatedProfile.telefone || null,
            p_endereco: updatedProfile.endereco || null,
            p_foto: updatedProfile.foto || null,
            p_login: updatedProfile.login || null,
            p_senha: updatedProfile.senha || null,
            p_ativo: updatedProfile.ativo,
            p_bloqueado: updatedProfile.bloqueado,
            p_zona_id: updatedProfile.zona_id || null,
            p_senha_provisoria: updatedProfile.senha_provisoria ?? false,
            p_data_alteracao_senha: updatedProfile.data_alteracao_senha || null
        });

        if (error) {
            console.error(error);
            const msg = 'Erro ao atualizar perfil: ' + error.message;
            addToast(msg, 'error');
            throw new Error(msg);
        }

        await loadProfiles();
        addToast('Perfil atualizado!', 'success');

        await addLog({
            usuario_id: user?.id || 'system',
            userId: user?.id || 'system',
            modulo: 'USUARIOS',
            acao: 'EDICAO_USUARIO',
            level: 'INFO',
            message: `Edicao de usuario: ${updatedProfile.nome}`,
            timestamp: Date.now(),
            dados: { id, nome: updatedProfile.nome, updates }
        });
    };

    const deleteProfile = async (id: string) => {
        if (!window.confirm('ATENCAO: Isso excluira permanentemente o usuario e seu acesso. Confirma?')) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { user_id: id }
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            await loadProfiles();
            addToast('Usuario excluido com sucesso.', 'success');

            await addLog({
                usuario_id: user?.id || 'system',
                userId: user?.id || 'system',
                modulo: 'USUARIOS',
                acao: 'EXCLUSAO_USUARIO',
                level: 'WARN',
                message: `Exclusao de usuario: ${id}`,
                timestamp: Date.now(),
                dados: { id }
            });
        } catch (err: any) {
            console.error('Erro ao excluir:', err);
            addToast('Falha ao excluir usuario: ' + err.message, 'error');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const activeProfile = profiles.find(p => p.id === currentProfileId);

    return (
        <UserContext.Provider value={{
            profiles, currentProfileId, activeProfile,
            addProfile, updateProfile, deleteProfile, setCurrentProfileId,
            isLoading
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};
