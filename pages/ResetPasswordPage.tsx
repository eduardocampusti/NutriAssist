import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Verify if user is authenticated (Supabase automatically handles the session from the magic link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, it might be an invalid or expired link
                setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo.");
            }
        });
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect after a few seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Erro ao redefinir a senha. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Helmet>
                <title>Redefinir Senha | NutriAssist</title>
            </Helmet>

            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 lg:p-12 relative overflow-hidden">
                <div className="text-center space-y-4 mb-10">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Nova Senha</h1>
                    <p className="text-slate-500 text-sm font-medium">Defina sua nova credencial de acesso ao sistema.</p>
                </div>

                {success ? (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-emerald-700">Senha Atualizada!</h3>
                            <p className="text-emerald-600/80 text-sm">Você será redirecionado para o login...</p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-400 hover:text-emerald-600 text-xs font-black uppercase tracking-widest mt-8 block w-full transition-colors"
                        >
                            Ir para o Login agora
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nova Senha</label>
                                <div className="group relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-12 py-4 text-base text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-emerald-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Confirmar Senha</label>
                                <div className="group relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-12 py-4 text-base text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 border border-rose-100 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div className="font-bold leading-relaxed">{error}</div>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#020617] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/20 relative overflow-hidden"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Redefinir Senha'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="mt-8 flex items-center gap-1.5 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">SME Cloud • Segurança</span>
            </div>
        </div>
    );
};
