
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePNAE } from '../contexts/PNAEContext';
import { useToast } from '../contexts/ToastContext';
import { Building2, MapPin, ShieldCheck, Palette, Save, ArrowRight, Lock, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Onboarding: React.FC = () => {
    const { letterhead, updateLetterhead } = usePNAE();
    const { addToast } = useToast();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [setup, setSetup] = useState({
        municipio: '',
        uf: 'BA',
        secretaria: 'SECRETARIA MUNICIPAL DE EDUCAÇÃO',
        responsavelSME: '',
        prefeitoNome: '',
        secretariaNome: '',
        nutricionistaNome: '',
        nutricionistaCrn: '',
        primaryColor: '#10b981',
        logoEmoji: '🥗'
    });

    const handleFinish = async () => {
        const finalConfig = {
            ...letterhead,
            ...setup,
            onboardingComplete: true,
            ultimaAtualizacao: new Date().toISOString().split('T')[0]
        };

        try {
            await updateLetterhead(finalConfig);
            addToast("Sistema configurado com sucesso!", 'success');
            navigate('/');
        } catch (error) {
            addToast("Erro ao salvar configurações iniciais.", 'error');
        }
    };

    const StepIndicator = () => (
        <div className="flex gap-2 mb-12">
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-200'
                        }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
            <div className="max-w-[1000px] w-full grid lg:grid-cols-2 bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100">

                {/* LEFT: VISUAL CONTEXT */}
                <div className="bg-[#020617] p-12 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -mr-64 -mt-64"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-2xl">🥗</div>
                        <h1 className="text-4xl font-black tracking-tighter leading-tight mb-4">
                            Configure sua <br /><span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">Instância Local</span>
                        </h1>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            O NutriAssist precisa saber qual ente federativo você representa para personalizar documentos oficiais e relatórios nutricionais.
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Totalmente Parametrizável</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                                <Lock size={20} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Criptografia de Dados SME</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: FORM STEPS */}
                <div className="p-12 lg:p-20 relative">
                    <StepIndicator />

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <header>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mb-4">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Identificação Municipal</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Qual o seu município?</h2>
                            </header>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nome da Cidade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Brotas de Macaúbas"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.municipio}
                                        onChange={(e) => setSetup({ ...setup, municipio: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Estado (UF)</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
                                        value={setup.uf}
                                        onChange={(e) => setSetup({ ...setup, uf: e.target.value })}
                                    >
                                        {['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'].map(uf => (
                                            <option key={uf} value={uf}>{uf} - Brasil</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!setup.municipio}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all disabled:opacity-30"
                            >
                                Próximo Passo <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <header>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 mb-4">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Responsabilidade Técnica</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quem é o RT?</h2>
                            </header>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nutricionista RT</label>
                                    <input
                                        type="text"
                                        placeholder="Nome Completo do Responsável"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.responsavelSME}
                                        onChange={(e) => setSetup({ ...setup, responsavelSME: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Secretário(a) Titular (Pessoa)</label>
                                    <input
                                        type="text"
                                        placeholder="Nome da Secretária de Educação"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.secretariaNome}
                                        onChange={(e) => setSetup({ ...setup, secretariaNome: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Prefeito Municipal</label>
                                    <input
                                        type="text"
                                        placeholder="Nome do Prefeito"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.prefeitoNome}
                                        onChange={(e) => setSetup({ ...setup, prefeitoNome: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nutricionista RT (Nome)</label>
                                    <input
                                        type="text"
                                        placeholder="Alexandra Fernandes"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.nutricionistaNome}
                                        onChange={(e) => setSetup({ ...setup, nutricionistaNome: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">CRN do Nutricionista</label>
                                    <input
                                        type="text"
                                        placeholder="CRN-5/XXXX"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.nutricionistaCrn}
                                        onChange={(e) => setSetup({ ...setup, nutricionistaCrn: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Órgão / Secretaria (Departamento)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={setup.secretaria}
                                        onChange={(e) => setSetup({ ...setup, secretaria: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!setup.responsavelSME}
                                    className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all disabled:opacity-30"
                                >
                                    Continuar <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <header>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 mb-4">
                                    <Palette className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Identidade Visual</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Estilo do App</h2>
                            </header>

                            <div className="space-y-6">
                                <div className="grid grid-cols-5 gap-3">
                                    {['#10b981', '#6366f1', '#f43f5e', '#f59e0b', '#020617'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSetup({ ...setup, primaryColor: color })}
                                            className={`h-12 rounded-xl transition-all ${setup.primaryColor === color ? 'ring-4 ring-offset-2 ring-emerald-200 scale-90' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pré-visualização do Timbre</p>
                                    <div className="text-center space-y-1">
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{setup.municipio} - {setup.uf}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{setup.secretaria}</p>
                                        <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-2">RT: {setup.responsavelSME}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="flex-[2] bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all"
                                >
                                    Finalizar Setup <Save size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* LOGOUT / EXIT OPTION */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            <LogOut size={12} /> Sair do Sistema
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
