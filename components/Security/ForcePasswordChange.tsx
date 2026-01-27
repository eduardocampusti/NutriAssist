import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useUsers } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const ForcePasswordChange: React.FC = () => {
    const { activeProfile, updateProfile } = useUsers();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const passwordRules = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    const isPasswordValid = Object.values(passwordRules).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('A senha não atende a todos os requisitos de segurança.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!activeProfile) return;

        setIsLoading(true);
        try {
            // 2. Update Profile Metadata (UserContext will handle Auth Sync)
            await updateProfile(activeProfile.id, {
                senha: newPassword, // Update local ref if needed
                senha_provisoria: false,
                data_alteracao_senha: new Date().toISOString()
            });
            // Force reload to ensure all contexts (Auth/User) are 100% in sync and clear any cached state
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6 overflow-y-auto">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative w-full max-w-xl animate-in fade-in zoom-in duration-700">
                <div className="bg-white/95 backdrop-blur-2xl rounded-[48px] shadow-2xl border border-white/20 overflow-hidden">

                    {/* Header */}
                    <div className="bg-slate-900 p-10 text-white relative">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Segurança Obrigatória</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight uppercase leading-tight">Troca de Senha<br />No Primeiro Acesso</h2>
                        <p className="text-white/40 text-xs font-medium mt-4 max-w-sm">
                            Olá, <span className="text-white font-bold">{activeProfile?.nome}</span>. Para garantir a segurança dos dados do PNAE, é necessário definir uma senha pessoal forte antes de continuar.
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Inputs */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center px-1">
                                        Nova Senha
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] pl-14 pr-6 py-4 text-sm font-bold placeholder:text-slate-300 focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirme a Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] pl-14 pr-6 py-4 text-sm font-bold placeholder:text-slate-300 focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rules Checklist */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <RuleItem valid={passwordRules.length} text="Mínimo 8 caracteres" />
                                <RuleItem valid={passwordRules.uppercase} text="Letra Maiúscula" />
                                <RuleItem valid={passwordRules.lowercase} text="Letra Minúscula" />
                                <RuleItem valid={passwordRules.number} text="Pelo menos 1 número" />
                                <RuleItem valid={passwordRules.special} text="Caractere Especial" />
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-[11px] font-bold leading-relaxed">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!isPasswordValid || isLoading || newPassword !== confirmPassword}
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Redefinir e Acessar Sistema
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            NutriAssist SME • Protocolo de Auditoria e Governança TI
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RuleItem = ({ valid, text }: { valid: boolean, text: string }) => (
    <div className={`flex items-center gap-2 ${valid ? 'text-emerald-600' : 'text-slate-400'}`}>
        <CheckCircle2 className={`w-3.5 h-3.5 ${valid ? 'opacity-100' : 'opacity-20'}`} />
        <span className="text-[10px] font-bold uppercase tracking-tight">{text}</span>
    </div>
);

export default ForcePasswordChange;
