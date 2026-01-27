import React, { useState } from 'react';
import {
    BookOpen,
    ChevronRight,
    ShieldCheck,
    Apple,
    Building2,
    Utensils,
    FileText,
    TrendingUp,
    Info,
    X,
    ExternalLink,
    HelpCircle,
    UserCircle,
    Download
} from 'lucide-react';
import { UserRole } from '../types';

interface ManualSection {
    id: string;
    icon: React.ElementType;
    title: string;
    role?: UserRole;
    content: React.ReactNode;
}

const ManualViewer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeSection, setActiveSection] = useState<string>('intro');

    const sections: ManualSection[] = [
        {
            id: 'intro',
            icon: Info,
            title: 'Apresentação',
            content: (
                <div className="space-y-6">
                    <p className="text-slate-600 leading-relaxed font-medium">
                        O <span className="text-slate-900 font-black tracking-tight">NUTRIASSIST SME</span> é o ecossistema digital oficial para gestão da alimentação escolar de Brotas de Macaúbas. Esta plataforma foi desenhada para garantir que cada centavo do PNAE se transforme em nutrição e saúde para nossos alunos.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Finalidade</h4>
                            <p className="text-xs font-bold text-slate-600">Eficiência logística, segurança alimentar e transparência total nas contas públicas.</p>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Sigilo (LGPD)</h4>
                            <p className="text-xs font-bold text-emerald-900">Uso estrito para fins institucionais. Proteja suas credenciais de acesso.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'nutricionista',
            icon: Apple,
            title: 'Nutricionista RT',
            role: UserRole.NUTRICIONISTA,
            content: (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Autoridade Técnica Máxima</span>
                    </div>
                    <ul className="space-y-4">
                        {[
                            { t: 'Engenharia de Cardápios', d: 'Planeje per capita, macronutrientes e custos em harmonia com as resoluções do FNDE.' },
                            { t: 'Gestão de Almoxarifado', d: 'Monitore estoques centrais, controle validades e autorize distribuições.' },
                            { t: 'Vigilância SISVAN', d: 'Conduza avaliações antropométricas e emita pareceres para restrições alimentares.' },
                            { t: 'Inteligência de Compras', d: 'Subsidie o processo licitatório com mapas de consumo baseados na demanda real.' }
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4 group">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all font-black text-[10px]">{i + 1}</div>
                                <div>
                                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.t}</h5>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.d}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )
        },
        {
            id: 'diretor',
            icon: Building2,
            title: 'Diretor Escolar',
            role: UserRole.DIRETOR,
            content: (
                <div className="space-y-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Responsabilidade pela Unidade Escolar</p>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-emerald-500 transition-all shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">✓</div>
                                <h5 className="text-sm font-black text-slate-800 uppercase">Conferência de Recebimento</h5>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">No ato da entrega, confirme digitalmente os itens. Não aceite produtos avariados sem o devido parecer técnico.</p>
                        </div>
                        <div className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-rose-500 transition-all shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-black">!</div>
                                <h5 className="text-sm font-black text-slate-800 uppercase">Gestão de Ocorrências</h5>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Faltas de insumos ou problemas logísticos devem ser registrados imediatamente para acionamento do protocolo de contingência.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'merendeira',
            icon: Utensils,
            title: 'Merendeira',
            content: (
                <div className="space-y-6 text-center py-10">
                    <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100/50">
                        <Utensils className="w-12 h-12" />
                    </div>
                    <h5 className="text-lg font-black text-slate-800 uppercase tracking-tight">O Coração da Cozinha</h5>
                    <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                        Seu trabalho garante que o cardápio planejado vire realidade no prato dos alunos.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-3xl mt-8 inline-block text-left border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suas Atividades:</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Registro de Consumo Diário
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Consulta de Cardápios Vigentes
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Reporte de Faltas de Insumos
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'nucleo',
            icon: Building2,
            title: 'Núcleo Escolar',
            role: UserRole.NUCLEO_COCAL,
            content: (
                <div className="space-y-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gestão Administrativa Regionalizada (Cocal)</p>
                    <div className="p-6 bg-[#020617] text-white rounded-[32px] shadow-xl relative overflow-hidden group">
                        <Building2 className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Regionalização PNAE</h5>
                        <p className="text-sm font-bold mt-2">Responsável administrativo pelas unidades da Zona Cocal sem direção própria.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-black">1</div>
                            <p className="text-xs font-bold text-slate-700">Recebe e confere entregas da Central para a Região.</p>
                        </div>
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600 font-black">2</div>
                            <p className="text-xs font-bold text-slate-700">Realiza auditorias de estoque e solicita reposições.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'executivo',
            icon: TrendingUp,
            title: 'SME & Gestão',
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 font-medium">Painel estratégico para a Secretária de Educação e Técnicos Administrativos.</p>
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl overflow-hidden relative">
                            <TrendingUp className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-6 -mt-6" />
                            <h5 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Compliance PNAE</h5>
                            <p className="text-sm font-bold mt-2">Monitore em tempo real o alcance da Agricultura Familiar e a conformidade dos cardápios em toda a rede.</p>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Relatórios Consolidados</h5>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">Acesse o Mapa de Consumo Anual e os índices de eficiência logística para fundamentar prestações de contas e novas licitações.</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentSection = sections.find(s => s.id === activeSection) || sections[0];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-10 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                {/* HEADER */}
                <div className="p-8 lg:px-12 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-700">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Manual do Usuário</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NutriAssist SME • Versão 2.6 • Institucional</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all text-slate-600"
                        >
                            <Download className="w-4 h-4" /> Baixar PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-24 lg:w-72 bg-slate-50/50 border-r border-slate-100 flex flex-col p-4 lg:p-8 space-y-2 overflow-y-auto">
                        <p className="hidden lg:block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Navegação</p>
                        {sections.map((s) => {
                            const Icon = s.icon;
                            const isActive = activeSection === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all group ${isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'hover:bg-white text-slate-500'}`}
                                >
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-white/10' : 'bg-slate-100 group-hover:scale-110'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="hidden lg:block text-xs font-black uppercase tracking-tight">{s.title}</span>
                                </button>
                            );
                        })}

                        <div className="mt-auto hidden lg:block p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                            <HelpCircle className="w-6 h-6 text-indigo-600 mb-3" />
                            <h6 className="text-[10px] font-black text-indigo-900 uppercase mb-1">Precisa de suporte?</h6>
                            <p className="text-[10px] font-medium text-indigo-600">Acione o administrador de TI da SME ou o Gabinete Técnico.</p>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 bg-white p-8 lg:p-16 overflow-y-auto custom-scrollbar">
                        <div className="max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-12 h-1 bg-indigo-500 rounded-full" />
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Módulo {sections.findIndex(s => s.id === activeSection) + 1}</span>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                                    {currentSection.title}
                                </h3>
                                {currentSection.role && (
                                    <span className="px-3 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-lg tracking-widest">
                                        Focado em: {currentSection.role}
                                    </span>
                                )}
                            </div>

                            <div className="content-render">
                                {currentSection.content}
                            </div>

                            <div className="mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <UserCircle className="w-10 h-10 text-slate-200" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase">Institucional SME</p>
                                        <p className="text-[9px] font-bold text-slate-400">Copyright © 2026 Brotas de Macaúbas</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">Termos de Uso</button>
                                    <button className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">LGPD</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualViewer;
