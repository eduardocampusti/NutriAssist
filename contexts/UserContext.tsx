import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { addLog } = useDocuments();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentProfileId, setCurrentProfileId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load & Migration
    useEffect(() => {
        const loadInitialData = async () => {
            // Estabilização: Somente ativa o loading global se NÃO houver perfis.
            // Isso impede o sistema de "piscar" e unmount/mount ao re-validar a sessão.
            if (profiles.length === 0) {
                setIsLoading(true);
            }
            try {
                // 1. Fetch from Supabase
                const { data: dbProfiles, error } = await supabase
                    .from('profiles')
                    .select('*');

                if (error) throw error;

                // 2. Migration if empty
                if (!dbProfiles || dbProfiles.length === 0) {
                    await seedLocalProfiles();
                } else {
                    setProfiles(dbProfiles.map(p => {
                        const rawRole = p.role || p.perfil;
                        let role = UserRole.NUTRICIONISTA;

                        // Defensive role mapping
                        if (rawRole) {
                            const upperRole = rawRole.toUpperCase();
                            if (Object.values(UserRole).includes(upperRole as UserRole)) {
                                role = upperRole as UserRole;
                            }
                        }

                        // Special case: if login is admin, force ADMIN role if not set
                        if (role === UserRole.NUTRICIONISTA && (p.login === 'admin' || p.email === 'admin@gmail.com')) {
                            role = UserRole.ADMIN;
                        }

                        return {
                            ...p,
                            role,
                            zona_id: p.zona_id || null,
                            senha_provisoria: p.senha_provisoria === true,
                            data_alteracao_senha: p.data_alteracao_senha,
                            created_at: p.created_at ? new Date(p.created_at).getTime() : Date.now()
                        };
                    }) as any);
                }

                // Initial Active Profile
                const lastId = localStorage.getItem('nutriassist_active_profile_id')?.replace(/"/g, '');
                if (lastId && user) setCurrentProfileId(lastId);
                else if (!user) setCurrentProfileId('');

            } catch (err) {
                console.error("Error loading user profiles (falling back to local):", err);
                // Fallback to local seeding on error
                await seedLocalProfiles();
            } finally {
                setIsLoading(false);
            }
        };

        const seedLocalProfiles = async () => {
            const localProfiles = JSON.parse(localStorage.getItem('nutriassist_profiles') || '[]');
            if (localProfiles.length > 0) {
                setProfiles(localProfiles.map((p: any) => ({
                    ...p,
                    role: (p.role || p.perfil || UserRole.NUTRICIONISTA).toUpperCase()
                })));
            } else {
                // Seeding
                const initial: UserProfile[] = [];
                setProfiles(initial);
                // Force Admin default ONLY if there is no user and we are seeding from scratch
                // Actually, better not to set currentProfileId to admin by default if we want security.
                // setCurrentProfileId(initial[0].id); // Removed fallback
                localStorage.removeItem('nutriassist_active_profile_id');
            }
        };

        loadInitialData();
    }, [user]); // Added dependency on user

    // Sync Active Profile ID to Local Storage for convenience
    useEffect(() => {
        if (currentProfileId && user) {
            localStorage.setItem('nutriassist_active_profile_id', currentProfileId);
        }
    }, [currentProfileId, user]);

    // Sync with Auth User
    useEffect(() => {
        if (user && profiles.length > 0) {
            const userEmailLower = user.email?.toLowerCase();

            // 1. Try exact ID match first
            let match = profiles.find(p => p.id === user.id);

            // 2. Try email/login match
            if (!match && userEmailLower) {
                match = profiles.find(p =>
                    (p.email && p.email.toLowerCase() === userEmailLower) ||
                    (p.login && p.login.toLowerCase() === userEmailLower)
                );
            }

            // 3. Admin Force logic
            if (userEmailLower === 'admin' || userEmailLower === 'admin@gmail.com') {
                const adminMatch = profiles.find(p => p.role === UserRole.ADMIN || p.login === 'admin');
                if (adminMatch) {
                    setCurrentProfileId(adminMatch.id);
                } else {
                    // Create virtual admin profile if totally missing
                    const virtualAdmin: UserProfile = {
                        id: user.id || '00000000-0000-0000-0000-000000000001',
                        nome: "Admin Municipal",
                        role: UserRole.ADMIN,
                        ativo: true,
                        email: 'admin@gmail.com',
                        login: 'admin'
                    };
                    setProfiles(prev => [virtualAdmin, ...prev]);
                    setCurrentProfileId(virtualAdmin.id);
                }
            } else if (match) {
                setCurrentProfileId(match.id);
            } else {
                // If it's a new user but no profile matched, don't just leave it at the old one
                // Check if the currentProfileId still makes sense for this user context
                if (!profiles.some(p => p.id === currentProfileId)) {
                    setCurrentProfileId('');
                }
            }
        }
    }, [user, profiles]);


    const addProfile = async (profile: Omit<UserProfile, 'id' | 'created_at'>) => {
        setIsLoading(true);
        try {
            // New "Professional" Flow: Call Edge Function
            const { data, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email: profile.login, // In our form, login field is treated as email
                    password: profile.senha,
                    nome: profile.nome,
                    role: profile.role,
                    school_id: profile.school_id,
                    cpf: profile.cpf,
                    crn: profile.crn,
                    telefone: profile.telefone,
                    endereco: profile.endereco,
                    foto: profile.foto,
                    zona_id: profile.zona_id
                }
            });

            if (error) throw new Error(error.message || 'Erro ao chamar função de criação');
            // Check for application level errors from the function
            if (data && data.error) throw new Error(data.error);

            if (!data || !data.user) {
                throw new Error('Erro desconhecido ao criar usuário (sem resposta).');
            }

            // Optimistic Update
            const newProfile: UserProfile = {
                ...profile,
                id: data.user.id,
                senha_provisoria: true,
                created_at: Date.now()
            };

            setProfiles(prev => [...prev, newProfile]);
            addToast("Usuário e Login criados com sucesso!", 'success');

            await addLog({
                usuario_id: user?.id || 'system',
                userId: user?.id || 'system',
                modulo: 'USUARIOS',
                acao: 'CADASTRO_USUARIO_COMPLETO',
                level: 'INFO',
                message: `Usuário criado: ${newProfile.nome}`,
                timestamp: Date.now(),
                dados: { id: newProfile.id, nome: newProfile.nome, role: newProfile.role }
            });

        } catch (err: any) {
            console.error("Erro ao criar usuário:", err);
            addToast(err.message || "Erro ao processar cadastro.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (id: string, updates: Partial<UserProfile>) => {
        const currentProfile = profiles.find(p => p.id === id);
        if (!currentProfile) return;

        const updatedProfile = { ...currentProfile, ...updates };

        // SYNC SUPABASE AUTH: If updating own password, sync to Auth layer
        if (updates.senha && user?.id === id) {
            const { error: authError } = await supabase.auth.updateUser({ password: updates.senha });
            if (authError) {
                console.error("Erro ao sincronizar senha com Auth:", authError);

                // If password is same as old, we can treat as success or ignore
                const msg = authError.message?.toLowerCase();
                if (msg?.includes("different") || msg?.includes("same") || msg?.includes("igual")) {
                    console.warn("Senha igual à anterior, prosseguindo...");
                } else {
                    addToast(`Erro de Autenticação: ${authError.message}`, 'error');
                    return;
                }
            }
        }

        // Use RPC to bypass RLS
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
            const msg = "Erro ao atualizar perfil: " + error.message;
            addToast(msg, 'error');
            throw new Error(msg);
        }
        addToast("Perfil atualizado!", 'success');
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        await addLog({
            usuario_id: user?.id || 'system',
            userId: user?.id || 'system',
            modulo: 'USUARIOS',
            acao: 'EDICAO_USUARIO',
            level: 'INFO',
            message: `Edição de usuário: ${updatedProfile.nome}`,
            timestamp: Date.now(),
            dados: { id, nome: updatedProfile.nome, updates }
        });
    };

    const deleteProfile = async (id: string) => {
        if (!window.confirm("ATENÇÃO: Isso excluirá permanentemente o usuário e seu acesso. Confirma?")) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { user_id: id }
            });

            if (error) throw new Error(error.message);
            if (data && data.error) throw new Error(data.error);

            setProfiles(prev => prev.filter(p => p.id !== id));
            addToast("Usuário excluído com sucesso.", 'success');

            await addLog({
                usuario_id: user?.id || 'system',
                userId: user?.id || 'system',
                modulo: 'USUARIOS',
                acao: 'EXCLUSAO_USUARIO',
                level: 'WARN',
                message: `Exclusão de usuário: ${id}`,
                timestamp: Date.now(),
                dados: { id }
            });

        } catch (err: any) {
            console.error("Erro ao excluir:", err);
            addToast("Falha ao excluir usuário: " + err.message, 'error');
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
