
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../services/supabase';
import { Eye, EyeOff, Lock, Mail, Loader2, ChevronDown, CheckCircle, ShieldCheck } from 'lucide-react';
import { usePNAE } from '../contexts/PNAEContext';
import { LetterheadConfig } from '../types';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'login' | 'recovery'>('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoverySent, setRecoverySent] = useState(false);
    const { letterhead } = usePNAE();

    // Unified config from context
    const config = letterhead;

    // Security: Clear any residual insecure tokens when landing on login page
    useEffect(() => {
        const clearTokens = () => {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('nutriassist') || key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            });
        };
        clearTokens();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            if (authData.user) {
                // Security Check: Verify if profile is Active/Blocked
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('bloqueado, ativo, nome')
                    .eq('id', authData.user.id)
                    .single();

                if (!profileError && profile) {
                    if (profile.bloqueado) {
                        await supabase.auth.signOut();
                        throw new Error('Acesso negado: Usuário bloqueado.');
                    }
                    if (profile.ativo === false) { // Explicit check
                        await supabase.auth.signOut();
                        throw new Error('Acesso negado: Usuário inativo.');
                    }
                }

                navigate('/');
                return;
            }
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setRecoverySent(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar e-mail de recuperação');
        } finally {
            setLoading(false);
        }
    };

    const [showTerms, setShowTerms] = useState(false);
    const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return 'Bom dia'; if (h < 18) return 'Boa tarde'; return 'Boa noite'; };
    const [showPolicy, setShowPolicy] = useState(false);

    const TermsModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTerms(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Termos de Uso e Responsabilidade</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">NutriAssist SME • Governança Legal</p>
                    </div>
                    <button onClick={() => setShowTerms(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-200">
                        <ChevronDown className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
                    {[
                        { t: '1. Finalidade', c: 'O presente Termo estabelece as regras de uso, responsabilidades e compromissos dos usuários do Sistema NutriAssist SME, destinado à gestão da alimentação escolar no âmbito da rede municipal de ensino.' },
                        { t: '2. Usuários', c: 'São considerados usuários do sistema: Nutricionista Responsável Técnica, Gestores designados, Diretores escolares, Técnicos da Secretaria e Merendeiras.' },
                        { t: '3. Acesso ao sistema', c: 'O acesso é pessoal e intransferível. Cada usuário é responsável por suas credenciais. É vedado o compartilhamento de login e senha.' },
                        { t: '4. Responsabilidades dos usuários', c: 'Utilizar o sistema exclusivamente para fins institucionais; inserir informações verdadeiras; respeitar os limites de acesso conforme o perfil; preservar o sigilo das informações sensíveis.' },
                        { t: '5. Responsabilidade técnica', c: 'As decisões nutricionais são de competência exclusiva da Nutricionista Responsável Técnica. Alterações técnicas sem autorização são terminantemente vedadas.' },
                        { t: '6. Registro de ações', c: 'Todas as ações realizadas no sistema são registradas em log. Os registros possuem valor administrativo e legal para fins de auditoria.' },
                        { t: '7. Segurança da informação', c: 'É proibida a exclusão indevida de dados. Qualquer uso indevido será apurado administrativamente junto aos órgãos competentes.' },
                        { t: '8. Penalidades', c: 'O descumprimento deste Termo poderá resultar em suspensão imediata de acesso e outras medidas administrativas conforme a legislação municipal e federal vigente.' },
                        { t: '9. Aceite Tácito', c: 'O acesso e utilização do Sistema NutriAssist SME implica na leitura integral, ciência e concordância irrevogável com este Termo de Uso e Responsabilidade.' }
                    ].map((term, i) => (
                        <div key={i} className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center text-[10px]">{i + 1}</span>
                                {term.t}
                            </h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium pl-9">{term.c}</p>
                        </div>
                    ))}
                </div>
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                    <button
                        onClick={() => setShowTerms(false)}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                    >
                        Compreendido e de Acordo
                    </button>
                </div>
            </div>
        </div>
    );

    const PolicyModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={() => setShowPolicy(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                    <div className="space-y-1">
                        <h4 className="text-xl font-black uppercase tracking-tighter">Política de Segurança da Informação</h4>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Proteção de Dados & LGPD • NutriAssist SME</p>
                    </div>
                    <button onClick={() => setShowPolicy(false)} className="p-3 hover:bg-white/10 rounded-2xl text-white/50 transition-all">
                        <ChevronDown className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar bg-slate-50/30">
                    {[
                        { t: '1. Objetivo', c: 'Proteger a confidencialidade, integridade e disponibilidade das informações no Sistema NutriAssist SME, em conformidade com a LGPD.' },
                        { t: '2. Classificação', c: 'Dados Sensíveis (NAE e Laudos) possuem proteção máxima e acesso restrito a nutricionistas e gestores autorizados.' },
                        { t: '3. Controle de Acesso', c: 'Baseado no princípio do menor privilégio. Usuários acessam apenas o necessário para suas funções técnicas.' },
                        { t: '4. Credenciais', c: 'O login é pessoal e intransferível. O usuário é o único responsável pela guarda de sua chave de acesso.' },
                        { t: '5. Rastreabilidade', c: 'Todas as ações são registradas em logs imutáveis (Auditoria Permanente), contendo ID, timestamp e IP.' },
                        { t: '6. Armazenamento', c: 'Dados armazenados em nuvem criptografada com redundância e backups periódicos automáticos.' },
                        { t: '7. Proteção LGPD', c: 'O tratamento de dados pessoais segue estritamente a finalidade institucional da alimentação escolar.' },
                        { t: '8. Incidentes', c: 'Qualquer tentativa de acesso indevido ou vazamento será apurada administrativamente com suspensão imediata.' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center text-[10px]">{i + 1}</span>
                                {item.t}
                            </h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium pl-9">{item.c}</p>
                        </div>
                    ))}
                </div>
                <div className="p-8 border-t border-slate-100 bg-white flex justify-center">
                    <button
                        onClick={() => setShowPolicy(false)}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                    >
                        Declarar Ciência e Garantir Sigilo
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans">
            <Helmet>
                <title>Login | NutriAssist</title>
            </Helmet>
            {showTerms && <TermsModal />}
            {showPolicy && <PolicyModal />}
            {/* LEFT SIDE: BRANDING IMAGE */}
            <div className="hidden lg:flex w-[45%] bg-slate-50 relative overflow-hidden items-center justify-center p-0 border-r border-slate-100">
                <img
                    src="/login-bg.jpg"
                    alt="NutriAssist branding"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative bg-white">
                <div className="absolute top-6 right-8">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-[9px] font-black uppercase text-slate-500 tracking-wider border border-slate-100">
                        <span>🇧🇷 Brasil</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>

                <div className="w-full max-w-[440px]">
                    {/* HEADER INSTITUCIONAL */}
                    <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:'16px 16px 0 0',padding:'14px 20px',display:'flex',alignItems:'center',gap:12,marginBottom:0}}>
                        <div style={{width:36,height:36,background:'rgba(255,255,255,0.10)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,0.15)',flexShrink:0,fontSize:20}}>🥗</div>
                        <div><p style={{fontSize:14,fontWeight:700,color:'#fff',margin:0,letterSpacing:'-0.01em'}}>NutriAssist</p><p style={{fontSize:9,color:'#4ade80',margin:0,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase'}}>SME · Brotas de Macaúbas</p></div>
                        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.08)',padding:'4px 10px',borderRadius:99,border:'1px solid rgba(255,255,255,0.12)'}}>
                            <div style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',flexShrink:0}}></div>
                            <span style={{fontSize:9,color:'rgba(255,255,255,0.7)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>Ativo</span>
                        </div>
                    </div>
                    {/* CARD DO FORM */}
                    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderTop:'none',borderRadius:'0 0 16px 16px',padding:'20px 22px 18px',boxShadow:'0 8px 32px rgba(0,0,0,0.08)'}}>
                    {view === 'login' ? (
                        <>
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/50 text-emerald-600 rounded-lg border border-emerald-100/50 mb-1">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Acesso Restrito</span>
                                </div>
                                <h3 style={{fontSize:20,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em",margin:"0 0 4px",lineHeight:1.2}}>{getGreeting()}, operador! 👋</h3>
                                <p style={{fontSize:12,color:"#64748b",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Sistema de Gestão Nutricional · SME Brotas de Macaúbas</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">ID Federado / E-mail</label>
                                        <div className="group relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-base text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium" style={{WebkitBoxShadow:"0 0 0 1000px #f8fafc inset",WebkitTextFillColor:"#0f172a"}}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Chave de Acesso</label>
                                        <div className="group relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-12 py-4 text-base text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium" style={{WebkitBoxShadow:"0 0 0 1000px #f8fafc inset",WebkitTextFillColor:"#0f172a"}}
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
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-emerald-500 transition-all overflow-hidden">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 transform scale-0 group-hover:scale-100 transition-transform"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Manter Conectado</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setView('recovery')}
                                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 decoration-emerald-200"
                                    >
                                        Recuperar Senha
                                    </button>
                                </div>

                                {error && (
                                    <div className="rounded-xl bg-rose-50 p-3 text-[10px] text-rose-600 border border-rose-100 flex items-start gap-2 animate-in fade-in zoom-in duration-300">
                                        <span className="text-sm">⚠️</span>
                                        <div className="font-bold uppercase tracking-widest pt-0.5">{error}</div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-emerald-600/30"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Acessar Sistema'}
                                </button>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 0 2px',borderTop:'1px solid #f1f5f9',marginTop:4}}>
                                <ShieldCheck style={{width:11,height:11,color:'#94a3b8'}} />
                                <span style={{fontSize:9.5,color:'#94a3b8',fontWeight:500}}>Conexão segura · LGPD · FNDE 06/2020</span>
                            </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Recuperar Senha</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    {recoverySent
                                        ? "Enviamos as instruções para o seu e-mail cadastrado."
                                        : "Digite seu e-mail para receber um link de redefinição de acesso."}
                                </p>
                            </div>

                            {!recoverySent ? (
                                <form onSubmit={handlePasswordRecovery} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">E-mail Cadastrado</label>
                                        <div className="group relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={recoveryEmail}
                                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-base text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rounded-xl bg-rose-50 p-3 text-[10px] text-rose-600 border border-rose-100 flex items-start gap-2 animate-in fade-in zoom-in duration-300">
                                            <span className="text-sm">⚠️</span>
                                            <div className="font-bold uppercase tracking-widest pt-0.5">{error}</div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[#020617] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/20 relative overflow-hidden group"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enviar Link de Recuperação'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                        >
                                            Voltar para o Login
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => {
                                        setRecoverySent(false);
                                        setView('login');
                                    }}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-700"
                                >
                                    Voltar para o Login
                                </button>
                            )}
                        </>
                    )}

                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex gap-4">
                            <a href="https://wa.me/5577991290375" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Suporte WhatsApp
                            </a>
                            <button onClick={() => setShowTerms(true)} className="hover:text-slate-900 uppercase">Termos</button>
                            <button onClick={() => setShowPolicy(true)} className="hover:text-slate-900 uppercase">Privacidade</button>
                        </div>
                        <div className="flex items-center gap-1.5" style={{whiteSpace:"nowrap"}}>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            SME CLOUD
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
