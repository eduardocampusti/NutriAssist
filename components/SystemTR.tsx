import React from 'react';
import {
    FileText,
    Target,
    Settings,
    Users,
    CheckCircle,
    Printer,
    ArrowLeft,
    Shield,
    Zap,
    GraduationCap,
    Layout,
    ClipboardList,
    TrendingUp,
    RefreshCw,
    Calendar,
    DollarSign,
    CreditCard,
    BarChart3,
    Activity,
    LineChart,
    PieChart,
    Eye,
    Database,
    ShieldCheck,
    Scale,
    Apple,
    LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePNAE } from '../contexts/PNAEContext';
import { OfficialLetterhead } from './OfficialLetterhead';

const SystemTR: React.FC = () => {
    const navigate = useNavigate();
    const { letterhead } = usePNAE();

    const handlePrint = () => window.print();

    const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-slate-100 transition-colors"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
                </div>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );

    const ListItem = ({ text }: { text: string }) => (
        <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
            <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
        </div>
    );

    const ListItemWhite = ({ text }: { text: string }) => (
        <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
            <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 print:p-0 print:m-0 print:space-y-0">
            <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { 
            position: absolute; left: 0; top: 0; width: 100%; 
            color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

            {/* WRAPPER DE IMPRESSÃO - Controla o fluxo de visibilidade */}
            <div className="print-content">

                {/* HEADER IMPRESSÃO */}
                <div className="hidden print:block mb-10">
                    <OfficialLetterhead
                        config={letterhead}
                        title="Termo de Referência: Sistema NutriAssist SME"
                        className="mb-8"
                    />
                </div>

                {/* HEADER - Tela Apenas */}
                <div className="bg-[#020617] p-10 lg:p-14 rounded-[56px] text-white relative overflow-hidden shadow-2xl no-print">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                            >
                                <ArrowLeft className="w-3 h-3" /> Voltar ao Início
                            </button>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-none">
                                Termo de <span className="text-emerald-400">Referência</span>
                            </h1>
                            <p className="text-slate-400 text-sm max-w-xl font-medium">
                                Documento fundamental que rege os objetivos, requisitos técnicos e finalidades institucionais do Sistema NutriAssist SME.
                            </p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="px-8 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" /> Impressão Oficial
                        </button>
                    </div>
                </div>

                {/* SUMÁRIO EXECUTIVO - VISÃO ESTRATÉGICA - Tela Apenas */}
                <div className="bg-white p-10 lg:p-14 rounded-[56px] border border-slate-100 shadow-sm space-y-12 relative overflow-hidden no-print">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Sumário Executivo:<br /><span className="text-emerald-500">Visão Estratégica</span></h2>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    <strong className="text-slate-900">NutriAssist SME</strong> é um sistema inteligente de gestão da alimentação escolar desenvolvido para fortalecer a política pública de nutrição no âmbito municipal, garantindo conformidade legal, segurança técnica e eficiência administrativa.
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                    Mais do que um sistema de registros, o NutriAssist SME transforma dados em documentos oficiais prontos para fiscalização, reduz riscos administrativos e assegura transparência perante o FNDE, CAE, TCE e CGU.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resultados Estratégicos</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'Blindagem administrativa e técnica da gestão municipal',
                                        'Conformidade integral com a legislação do PNAE',
                                        'Transparência e rastreabilidade total de dados'
                                    ].map(res => (
                                        <div key={res} className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span className="text-xs font-semibold text-slate-700">{res}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-8 lg:p-10 rounded-[48px] border border-slate-100 space-y-8">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Diferenciais de Governança</h4>
                            <div className="space-y-4">
                                {[
                                    { title: 'Inteligência Legal', desc: 'Regras automáticas que bloqueiam alimentos proibidos e sinalizam restrições.' },
                                    { title: 'Segurança da RT', desc: 'Proteção imutável da autonomia técnica da nutricionista responsável.' },
                                    { title: 'Rastreabilidade', desc: 'Histórico confiável e pronto para auditorias do FNDE, TCE e CGU.' },
                                    { title: 'Eficiência Fiscal', desc: 'Apoio à licitação e controle de estoque com foco em responsabilidade pública.' }
                                ].map(ben => (
                                    <div key={ben.title} className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-800">{ben.title}</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">{ben.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* INTRODUÇÃO (FULL WIDTH IN PRINT) */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">1. Objeto</h2>
                                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                    Contratação de sistema informatizado de gestão da alimentação escolar, denominado <strong className="text-slate-900">NutriAssist SME</strong>, destinado ao apoio técnico, administrativo e legal da política pública de alimentação escolar da rede municipal de ensino, em conformidade com o Programa Nacional de Alimentação Escolar (PNAE).
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">2. Justificativa</h2>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    A adoção de sistema informatizado específico para a gestão da alimentação escolar é medida essencial para garantir conformidade legal, eficiência administrativa, transparência e segurança técnica, atendendo às exigências do FNDE, CAE, TCE, CGU e demais órgãos de controle.
                                </p>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    O NutriAssist SME possibilita a organização, padronização e rastreabilidade das informações nutricionais, documentais e operacionais, fortalecendo a atuação da Nutricionista Responsável Técnica e subsidiando a tomada de decisão da gestão pública.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIÇÃO DO SISTEMA / FUNCIONALIDADES */}
                    <Section icon={Target} title="3. Descrição do Sistema">
                        <div className="space-y-1 text-xs">
                            <ListItem text="Gestão de usuários e perfis de acesso." />
                            <ListItem text="Controle de documentos de Responsabilidade Técnica." />
                            <ListItem text="Elaboração e histórico de cardápios por modalidade." />
                            <ListItem text="Bloqueio inteligente de alimentos proibidos/restritos." />
                            <ListItem text="Gestão de alunos com necessidades especiais." />
                            <ListItem text="Controle de estoque, consumo e desperdícios." />
                            <ListItem text="Geração de documentos técnicos/legais automáticos." />
                            <ListItem text="Apoio à licitação e compras públicas do PNAE." />
                            <ListItem text="Relatórios gerenciais e de auditoria." />
                            <ListItem text="Armazenamento seguro e rastreabilidade total." />
                        </div>
                    </Section>

                    {/* ABRANGÊNCIA E DISPONIBILIDADE */}
                    <Section icon={Layout} title="4. Abrangência e Plataforma">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h5 className="text-[9px] font-black text-slate-400 uppercase">Abrangência Mural</h5>
                                <p className="text-[10px] text-slate-600 leading-relaxed">
                                    Todas as unidades da rede municipal: Regular, Infantil, Fundamental, EJA e Tempo Integral.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h5 className="text-[9px] font-black text-slate-400 uppercase">Forma de Disponibilização</h5>
                                <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                                    Sistema WEB com escalabilidade para Aplicativo Móvel.
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* RESULTADOS ESPERADOS */}
                    <Section icon={CheckCircle} title="5. Resultados Esperados">
                        <div className="space-y-2">
                            <ListItem text="Redução de riscos administrativos e técnicos." />
                            <ListItem text="Conformidade integral com a legislação do PNAE." />
                            <ListItem text="Padronização e qualidade dos documentos oficiais." />
                            <ListItem text="Transparência plena na gestão pública municipal." />
                            <ListItem text="Criação de histórico confiável para exercícios futuros." />
                        </div>
                    </Section>

                    {/* PÚBLICO */}
                    <Section icon={Users} title="6. Público Usuário">
                        <div className="flex flex-wrap gap-2">
                            {['Nutricionista RT', 'SME', 'Diretores', 'Merendeiras', 'Técnicos'].map(user => (
                                <span key={user} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                    {user}
                                </span>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                            O sistema provê interfaces personalizadas para cada perfil, garantindo hierarquia e segurança operacional.
                        </p>
                    </Section>

                    {/* SEÇÃO 7: NÚCLEO INTELIGENTE (REGRAS E LÓGICA) */}
                    <div className="lg:col-span-2 bg-[#F8FAFC] p-10 lg:p-14 rounded-[56px] border border-slate-200 shadow-sm space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">7. Regras e Lógica de Funcionamento</h2>
                                <p className="text-sm text-slate-500 font-medium">Núcleo inteligente que garante conformidade legal e segurança técnica automática.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-slate-900 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Cérebro do Sistema
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {[
                                { title: 'Regras por Faixa Etária', desc: 'Associação automática de modalidades a restrições legais específicas do PNAE.' },
                                { title: 'Bloqueio Automático', desc: 'Travamento imediato de alimentos proibidos com indicação da base legal.' },
                                { title: 'Alertas Inteligentes', desc: 'Avisos visuais para alérgenos e altos teores de sódio/açúcar/gordura.' },
                                { title: 'Regras de Substituição', desc: 'Exigência de equivalência nutricional e justificativa técnica obrigatória.' },
                                { title: 'Validação Técnica (RT)', desc: 'Assinatura digital obrigatória e controle automático de versões de cardápio.' },
                                { title: 'Controle de Validade', desc: 'Alertas de vencimento de RT e bloqueio de emissão de documentos vencidos.' },
                                { title: 'Controle de Acesso (RLS)', desc: 'Permissões rígidas por perfil, garantindo a autonomia da nutricionista.' },
                                { title: 'Rastreabilidade e Logs', desc: 'Registro imutável de usuário, ação e data/hora para fins de auditoria.' },
                                { title: 'Inteligência em Compras', desc: 'Cálculo de quantitativos para licitação baseados no consumo real histórico.' }
                            ].map((rule, i) => (
                                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 space-y-3 hover:border-indigo-500/20 transition-all group">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{rule.title}</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{rule.desc}</p>
                                </div>
                            ))}

                            <div className="p-8 bg-indigo-600 rounded-[40px] text-white flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                <div className="space-y-4 relative z-10">
                                    <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">10. Integridade de Dados</h4>
                                    <p className="text-xs leading-relaxed font-medium">Bloqueio de exclusões definitivas. Apenas inativação de registros para preservação do histórico institucional.</p>
                                </div>
                                <div className="pt-6 border-t border-white/10 mt-4 relative z-10">
                                    <p className="text-[9px] text-indigo-200 font-black uppercase tracking-[0.2em]">Finalidade do Núcleo</p>
                                    <p className="text-[10px] text-white/80 italic leading-tight">Garantir a redução de riscos na gestão pública da alimentação escolar.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 8: ARQUITETURA E MODELO DE DADOS (SUPABASE) */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">8. Arquitetura e Modelo de Dados</h2>
                                <p className="text-sm text-slate-500 font-medium">Estrutura lógica de banco de dados (Supabase) desenhada para segurança e escalabilidade.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                Padrão de Governança de Dados
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Módulo A: Núcleo */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> Módulo Core
                                </h5>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">users <span className="text-slate-300 font-normal">(RBAC)</span></div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">escolas</div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">alunos</div>
                                </div>
                            </div>

                            {/* Módulo B: Nutrição */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Planejamento
                                </h5>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">alimentos <span className="text-slate-300 font-normal">(PNAE)</span></div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">cardapios</div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">cardapio_itens</div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">alunos_nae <span className="text-slate-300 font-normal">(Saúde)</span></div>
                                </div>
                            </div>

                            {/* Módulo C: Operacional */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Estoque & RT
                                </h5>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">estoque</div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">movimentacoes</div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-600 font-bold">documentos_rt</div>
                                </div>
                            </div>

                            {/* Módulo D: Auditoria */}
                            <div className="p-6 bg-slate-900 rounded-3xl space-y-4">
                                <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Auditoria
                                </h5>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white/10 rounded-xl border border-white/5 text-[10px] text-slate-300 font-bold">logs_sistema <span className="text-slate-500 font-normal">(Audit)</span></div>
                                    <div className="p-3 bg-white/10 rounded-xl border border-white/5 text-[10px] text-slate-300 font-bold">relatorios</div>
                                    <div className="p-3 bg-white/10 rounded-xl border border-white/5 text-[10px] text-slate-300 font-bold">formacoes</div>
                                    <div className="p-3 bg-white/10 rounded-xl border border-white/5 text-[10px] text-slate-300 font-bold">presencas</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-8 items-center text-slate-500">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase">RLS - Segurança por Perfil</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase">Exclusão Lógica (Ativo/Inativo)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase">Storage Segregado por Módulo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase">Integridade Referencial (UUID)</span>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 9: FLUXO DE TELAS E NAVEGAÇÃO */}
                    <div className="lg:col-span-2 bg-[#F8FAFC] p-10 lg:p-14 rounded-[56px] border border-slate-200 shadow-sm space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">9. Fluxo de Telas e Navegação</h2>
                                <p className="text-sm text-slate-500 font-medium">Arquitetura de informação desenhada para usabilidade, clareza e separação de deveres.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-slate-900 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Mapa Operacional do Sistema
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            {[
                                { title: '1. Tela de Login', desc: 'Autenticação segura por e-mail e perfil, com RLS dinâmico.' },
                                { title: '2. Dashboard Geral', desc: 'Visão estratégica personalizada com alertas de prazos, estoque e NAE.' },
                                { title: '3. Módulo de RT', desc: 'Gestão de documentos de responsabilidade técnica e portarias.' },
                                { title: '4. Editor de Cardápios', desc: 'Interface de planejamento com travas PNAE e assinatura digital.' },
                                { title: '5. Módulo Alunos NAE', desc: 'Controle de laudos e elaboração de cardápios adaptados.' },
                                { title: '6. Gestão de Estoque', desc: 'Controle de movimentações, perdas e alertas de estoque mínimo.' },
                                { title: '7. Módulo de Licitação', desc: 'Geração de mapas de consumo e apoio técnico ao TR de compras.' },
                                { title: '8. Central de Relatórios', desc: 'Exportação de documentos oficiais em PDF institucional timbrado.' },
                                { title: '9. Módulo de Formação', desc: 'Capacitação de merendeiras com lista de presença e certificados.' },
                                { title: '10. Administrativo', desc: 'Gestão de usuários, perfis de acesso e auditoria de logs.' },
                                { title: '11. Portal do Gestor', desc: 'Tela de aprovação administrativa e despacho institucional.' },
                                { title: '12. Terminal da Escola', desc: 'Interface simplificada para registro de consumo e consulta local.' }
                            ].map((module, i) => (
                                <div key={i} className="flex gap-5 items-start p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:border-emerald-500/20 transition-all group">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black text-xs shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{module.title}</h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">{module.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-slate-200 flex items-center justify-between relative z-10">
                            <div className="flex gap-4 items-center">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Layout className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Padrão NutriAssist UX 3.0</p>
                            </div>
                            <p className="text-[9px] text-slate-400 italic font-medium">Finalidade: Garantir usabilidade e separação de responsabilidades.</p>
                        </div>
                    </div>

                    {/* SEÇÃO 10: DIRETRIZES NUTRICIONAIS (FNDE 06/2020) */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">10. Diretrizes Nutricionais por Faixa Etária</h2>
                                <p className="text-sm text-slate-500 font-medium">Base normativa: Resolução FNDE nº 06/2020 e Guia Alimentar para a População Brasileira.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                PNAE Compliance 06/2020
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Creche */}
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div> 10.1 Creche (0 a 3 anos)
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-rose-600 uppercase">Proibição Total</p>
                                        <p className="text-[10px] text-slate-600 leading-tight">Açúcares, mel, refrigerantes, frituras, embutidos, ultraprocessados e café.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Restrições</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">Sal e gorduras em níveis mínimos e apenas para preparo.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pré-escola */}
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div> 10.2 Pré-escola (4 a 5 anos)
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-rose-600 uppercase">Proibição</p>
                                        <p className="text-[10px] text-slate-600 leading-tight">Refrigerantes, embutidos, frituras frequentes e excesso de gordura/sódio.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Restrições</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">Açúcar limitado e industrializados ocasionais com alerta do sistema.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fundamental / EJA */}
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> 10.3 Fundamental e EJA
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-rose-600 uppercase">Proibição</p>
                                        <p className="text-[10px] text-slate-600 leading-tight">Bebidas artificiais e ultraprocessados como regra no cardápio.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Excepcionalidade</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">Embutidos e frituras exigem justificativa técnica nutricional imutável.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tempo Integral */}
                            <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> 10.4 Tempo Integral
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-emerald-400 uppercase">Prioridade Máxima</p>
                                        <p className="text-[10px] text-slate-300 leading-tight">Alimentos in natura, minimamente processados e fracionamento adequado.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-rose-400 uppercase">Regras Rígidas</p>
                                        <p className="text-[10px] text-slate-400 leading-tight">Proibição de ultraprocessados como base alimentar e controle rigoroso de sódio.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                Regras Gerais Obrigatórias (Transversais)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { t: 'Regionalidade', d: 'Respeito aos hábitos saudáveis locais.' },
                                    { t: 'Variedade', d: 'Equilíbrio nutricional em todos os ciclos.' },
                                    { t: 'Anti-Publicidade', d: 'Proibição de marketing alimentar no sistema.' },
                                    { t: 'Atendimento NAE', d: 'Suporte obrigatório a alunos especiais.' },
                                    { t: 'Soberania Técnica', d: 'Bloqueio automático baseado em base legal.' }
                                ].map((rule, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-800">{rule.t}</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">{rule.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 11: ARGUMENTAÇÃO TÉCNICA PARA ADOÇÃO */}
                    <div className="lg:col-span-2 bg-slate-900 p-10 lg:p-14 rounded-[56px] text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">11. Argumentação Técnica para Adoção</h2>
                                    <p className="text-sm text-slate-400 font-medium">Justificativa estratégica para o fortalecimento da gestão pública.</p>
                                </div>
                                <div className="px-5 py-2.5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Valor Institucional
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { t: 'Segurança Jurídica', d: 'Alinhamento permanente à legislação do PNAE e órgãos de controle.' },
                                    { t: 'Pronto para Auditoria', d: 'Padronização total para fiscalizações do FNDE, CAE, TCE e CGU.' },
                                    { t: 'Eficiência Administrativa', d: 'Automação de processos manuais, planilhas e arquivos físicos.' },
                                    { t: 'Valorização da RT', desc: 'Fortalecimento da autonomia técnica da Nutricionista.' },
                                    { t: 'Governança Transparente', d: 'Relatórios consolidadores, rastreáveis e auditáveis.' },
                                    { t: 'Inteligência Financeira', d: 'Compras baseadas em consumo real, evitando desperdício.' },
                                    { t: 'Sustentabilidade', d: 'Histórico confiável para transições de gestão e continuidade.' }
                                ].map((arg, i) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3 hover:bg-white/10 transition-all">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                                            {i + 1}
                                        </div>
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{arg.t}</h4>
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{arg.d || arg.desc}</p>
                                    </div>
                                ))}

                                <div className="p-8 bg-emerald-500 rounded-[40px] text-slate-950 flex flex-col justify-between group overflow-hidden relative lg:col-span-1">
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conclusão Estratégica</h4>
                                    <p className="text-xs font-black leading-tight">
                                        A implantação do NutriAssist SME não é um custo, mas um investimento estratégico na segurança, organização e eficiência da gestão da alimentação escolar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 12: ROADMAP DE IMPLANTAÇÃO (0-120 DIAS) */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">12. Roadmap de Implantação</h2>
                                <p className="text-sm text-slate-500 font-medium">Cronograma estratégico para assegurar a adesão, conformidade e o funcionamento seguro do sistema.</p>
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
                                Implantação Segura e Gradual
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
                            {/* Phase 1 */}
                            <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                <div className="text-3xl font-black text-slate-200 group-hover:text-emerald-500/20 transition-colors">01</div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Planejamento</h4>
                                    <p className="text-[9px] text-emerald-600 font-black">0 a 30 dias</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[9px] text-slate-500 leading-tight">• Definição de equipe</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Validação de escopo</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Levantamento de escolas</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Perfis de acesso</li>
                                </ul>
                            </div>
                            {/* Phase 2 */}
                            <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                <div className="text-3xl font-black text-slate-200 group-hover:text-emerald-500/20 transition-colors">02</div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Configuração</h4>
                                    <p className="text-[9px] text-emerald-600 font-black">30 a 60 dias</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[9px] text-slate-500 leading-tight">• Cadastro de usuários</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Parametrização legal</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Base de alimentos</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Alertas automáticos</li>
                                </ul>
                            </div>
                            {/* Phase 3 */}
                            <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                <div className="text-3xl font-black text-slate-200 group-hover:text-emerald-500/20 transition-colors">03</div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Migração</h4>
                                    <p className="text-[9px] text-emerald-600 font-black">60 a 90 dias</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[9px] text-slate-500 leading-tight">• Importação de cardápios</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Dados de estoque</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Cadastro Alunos NAE</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Validação de dados</li>
                                </ul>
                            </div>
                            {/* Phase 4 */}
                            <div className="space-y-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 relative group hover:bg-white hover:shadow-xl transition-all border-dashed">
                                <div className="text-3xl font-black text-indigo-200 group-hover:text-indigo-500/20 transition-colors">04</div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Capacitação</h4>
                                    <p className="text-[9px] text-indigo-600 font-black uppercase">Fase Paralela</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[9px] text-indigo-700 leading-tight font-medium">• Treinamento RT/SME</li>
                                    <li className="text-[9px] text-indigo-700 leading-tight font-medium">• Gestores e Diretores</li>
                                    <li className="text-[9px] text-indigo-700 leading-tight font-medium">• Formação Merendeiras</li>
                                </ul>
                            </div>
                            {/* Phase 5 */}
                            <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                <div className="text-3xl font-black text-slate-200 group-hover:text-emerald-500/20 transition-colors">05</div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Operação</h4>
                                    <p className="text-[9px] text-emerald-600 font-black">90 a 120 dias</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[9px] text-slate-500 leading-tight">• Uso em ambiente real</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Monitoramento de erros</li>
                                    <li className="text-[9px] text-slate-500 leading-tight">• Acompanhamento técnico</li>
                                </ul>
                            </div>
                            {/* Phase 6 */}
                            <div className="space-y-4 p-6 bg-slate-900 rounded-3xl border border-slate-800 relative group hover:shadow-xl transition-all">
                                <div className="text-3xl font-black text-white/10 group-hover:text-emerald-500/20 transition-colors">06</div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Consolidação</h4>
                                    <p className="text-[9px] text-emerald-400 font-black">Após 120 dias</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[9px] text-slate-400 leading-tight">• Avaliação de resultados</li>
                                    <li className="text-[9px] text-slate-400 leading-tight">• Relatórios consolidados</li>
                                    <li className="text-[9px] text-slate-400 leading-tight">• Institucionalização</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-slate-400">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <p className="text-xs italic font-medium">Resultado esperado: Implantação segura, gradual, com adesão total e conformidade legal.</p>
                            </div>
                        </div>
                    </div>

                    {/* CRONOGRAMA E VIABILIDADE (NEW FULL WIDTH SECTION) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 lg:p-14 rounded-[48px] border border-slate-100 shadow-sm space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Cronograma e Viabilidade Financeira</h2>
                                    <p className="text-sm text-slate-500 font-medium">Planejamento focado em eficiência técnica e controle rigoroso de custos públicos.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        Baixo Custo Operacional
                                    </div>
                                </div>
                            </div>

                            {/* WEEKLY TIMELINE */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                {[
                                    { week: 'Semana 1', title: 'Infraestrutura & Base', items: ['Organização base legal', 'Modelagem de dados', 'Configuração segurança'] },
                                    { week: 'Semana 2', title: 'Cardápios & Regras', items: ['Módulo de cardápios', 'Regras automáticas', 'Alertas e bloqueios'] },
                                    { week: 'Semana 3', title: 'Fluxos & Documentos', items: ['Fluxo de aprovação', 'Relatórios oficiais', 'Gerador de documentos'] },
                                    { week: 'Semana 4', title: 'Implantação', items: ['Ajustes finais', 'Capacitação usuários', 'Implantação inicial'] },
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-4 p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                        <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.week}</p>
                                            <h4 className="text-xs font-black text-slate-800 uppercase">{item.title}</h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {item.items.map((li, i) => (
                                                <li key={i} className="text-[10px] text-slate-500 leading-tight flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div> {li}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* COSTS AND GUIDELINES */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                                <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Estimativa de Custos
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-600/60 uppercase">Desenvolvimento</p>
                                            <p className="text-xs font-bold text-emerald-900 leading-tight">Conforme escopo definido em proposta técnica.</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-600/60 uppercase">Infraestrutura</p>
                                            <p className="text-xs font-bold text-emerald-900 leading-tight">Serviços escaláveis (Supabase) com baixo custo inicial.</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-600/60 uppercase">Manutenção</p>
                                            <p className="text-xs font-bold text-emerald-900 leading-tight">Focada em suporte técnico e atualizações normativas.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 p-8 bg-slate-900 rounded-[40px] text-white relative overflow-hidden flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">Diretrizes de Eficiência Orçamentária</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-100 mb-1">Sem Licenças Caras</p>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic">"Priorizamos soluções de código aberto e escaláveis sem dependência de licenças proprietárias."</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-100 mb-1">Proteção de Investimento</p>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic">"Garantimos previsibilidade de prazos e controle orçamentário total da implantação."</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INDICADORES DE SUCESSO (NEW FULL WIDTH SECTION) */}
                    <div className="lg:col-span-2 bg-[#F8FAFC] p-10 lg:p-14 rounded-[56px] border border-slate-200 shadow-sm space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Indicadores de Sucesso e Avaliação</h2>
                                <p className="text-sm text-slate-500 font-medium">Métricas claras para mensurar efetividade, eficiência e conformidade legal.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-slate-900 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 shadow-lg">
                                Monitoramento de Performance
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            <div className="bg-white p-8 rounded-[38px] border border-slate-100 shadow-sm space-y-4 hover:border-emerald-500/30 transition-colors group">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Conformidade Legal</h4>
                                <ul className="space-y-2">
                                    <ListItem text="Percentual de cardápios sem inconformidades." />
                                    <ListItem text="Redução de proibidos/inadequados." />
                                    <ListItem text="Conformidade em prestações de contas." />
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-[38px] border border-slate-100 shadow-sm space-y-4 hover:border-indigo-500/30 transition-colors group">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Eficiência Operacional</h4>
                                <ul className="space-y-2">
                                    <ListItem text="Tempo médio de elaboração/aprovação." />
                                    <ListItem text="Volume de documentos oficiais gerados." />
                                    <ListItem text="Redução de apontamentos em auditorias." />
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-[38px] border border-slate-100 shadow-sm space-y-4 hover:border-emerald-500/30 transition-colors group">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <PieChart className="w-6 h-6" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engajamento</h4>
                                <ul className="space-y-2">
                                    <ListItem text="Grau de adesão dos usuários ao sistema." />
                                    <ListItem text="Frequência de acesso por perfil." />
                                    <ListItem text="Redução do retrabalho manual." />
                                </ul>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[38px] text-white space-y-4 shadow-xl shadow-slate-900/10">
                                <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                                    <LineChart className="w-6 h-6" />
                                </div>
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Metodologia de Avaliação</h4>
                                <div className="space-y-3 pt-2">
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">• Monitoramento periódico de KPIs.</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">• Análise comparativa entre períodos.</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">• Melhoria contínua baseada em dados.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/50 border border-slate-200 p-8 rounded-[40px] flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl shrink-0">📈</div>
                            <div>
                                <p className="text-xs font-black text-slate-800 uppercase mb-1">Objetivo da Mensuração</p>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Garantir transparência total na alimentação escolar, comprovar a efetividade da gestão e fortalecer o controle social e institucional.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 13: CHECKLIST PRÉ-IMPLANTAÇÃO */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">13. Checklist Pré-Implantação</h2>
                                <p className="text-sm text-slate-500 font-medium">Guia técnico para garantir prontidão técnica e legal desde o primeiro dia.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                Pronto para Uso
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                { t: '1. Validação', d: 'Autorização SME, Nutricionista RT e perfis.' },
                                { t: '2. Base Legal', d: 'Legislação PNAE e regras por faixa etária.' },
                                { t: '3. Estrutura', d: 'Lista de escolas, modalidades e alunos.' },
                                { t: '4. Documentos', d: 'CRN, Termo de RT e Portarias de nomeação.' },
                                { t: '5. Alimentos', d: 'Lista padronizada, categorias e alérgenos.' },
                                { t: '6. NAE', d: 'Laudos médicos e regras de acesso restrito.' },
                                { t: '7. Acessos', d: 'Cadastro de usuários e teste de permissões.' },
                                { t: '8. Infra', d: 'Acesso à internet e equipamentos nas escolas.' },
                                { t: '9. Comunicação', d: 'Informa rede e define canal de suporte.' },
                                { t: '10. Validação', d: 'Teste geral e liberação oficial para uso.' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-3 group hover:border-emerald-500/30 transition-all">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-800 leading-tight">{item.t}</p>
                                        <p className="text-[9px] text-slate-500 leading-tight mt-1">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SEÇÃO 14: PLANO DE CAPACITAÇÃO INICIAL */}
                    <div className="lg:col-span-2 bg-slate-900 p-10 lg:p-14 rounded-[56px] text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">14. Plano de Capacitação Inicial</h2>
                                    <p className="text-sm text-slate-400 font-medium">Programa estruturado para garantir eficiência operacional e conformidade legal.</p>
                                </div>
                                <div className="px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Certificação NutriAssist
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">1. Nutricionista RT</h4>
                                        <p className="text-[9px] font-black text-slate-400">CARGA HORÁRIA: 8 HORAS</p>
                                    </div>
                                    <ul className="space-y-2">
                                        <ListItemWhite text="Regras por faixa etária FNDE." />
                                        <ListItemWhite text="Gestão de Cardápios & NAE." />
                                        <ListItemWhite text="Emissão de Documentos Oficiais." />
                                        <ListItemWhite text="Auditoria e Rastreabilidade." />
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">2. Gestão SME</h4>
                                        <p className="text-[9px] font-black text-slate-400">CARGA HORÁRIA: 3 HORAS</p>
                                    </div>
                                    <ul className="space-y-2">
                                        <ListItemWhite text="Leitura de Dashboards." />
                                        <ListItemWhite text="Aprovação Administrativa." />
                                        <ListItemWhite text="Relatórios Gerenciais." />
                                        <ListItemWhite text="Transparência e Governança." />
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">3. Diretores/Técnicos</h4>
                                        <p className="text-[9px] font-black text-slate-400">CARGA HORÁRIA: 4 HORAS</p>
                                    </div>
                                    <ul className="space-y-2">
                                        <ListItemWhite text="Consulta de Cardápios." />
                                        <ListItemWhite text="Relatórios por Escola." />
                                        <ListItemWhite text="Acompanhamento Local." />
                                        <ListItemWhite text="Comunicação com a RT." />
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">4. Merendeiras</h4>
                                        <p className="text-[9px] font-black text-slate-400">CARGA HORÁRIA: 4 HORAS</p>
                                    </div>
                                    <ul className="space-y-2">
                                        <ListItemWhite text="Registro de Consumo Diário." />
                                        <ListItemWhite text="Consulta de Cardápios." />
                                        <ListItemWhite text="Procedimentos de Alerta." />
                                        <ListItemWhite text="Boas Práticas no Sistema." />
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metodologia e Certificação</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-[10px] text-slate-300 font-medium leading-relaxed italic">• Demonstração prática e suporte PDF.</div>
                                        <div className="text-[10px] text-slate-300 font-medium leading-relaxed italic">• Emissão de certificado digital SME.</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-emerald-500 rounded-3xl text-slate-950 flex flex-col justify-center shrink-0">
                                    <p className="text-[9px] font-black uppercase text-emerald-950">Finalidade</p>
                                    <p className="text-xs font-black">Padronização dos processos e segurança técnica plena.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ENTREGA */}
                    <div className="lg:col-span-2 p-10 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-500" /> Forma de Entrega e Suporte
                            </h3>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                        <Layout className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase text-slate-700">Sistema Funcional</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                        <ClipboardList className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase text-slate-700">Manual por Perfil</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase text-slate-700">Treinamento Inicial</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 15: TERMO DE USO E RESPONSABILIDADE */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">15. Termo de Uso e Responsabilidade</h2>
                                <p className="text-sm text-slate-500 font-medium">Governança legal, responsabilidades e compromissos éticos dos usuários.</p>
                            </div>
                            <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                Blindagem Jurídica
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { t: '1. Finalidade', d: 'Estabelece regras de uso, responsabilidades e compromissos institucionais.' },
                                { t: '2. Usuários', d: 'Abrange RT, Gestores, Diretores, Técnicos e Merendeiras da rede municipal.' },
                                { t: '3. Acesso', d: 'Pessoal e intransferível. É vedado o compartilhamento de login e senha.' },
                                { t: '4. Obrigações', d: 'Inserção de dados verdadeiros, sigilo e uso estritamente institucional.' },
                                { t: '5. Autonomia da RT', d: 'Decisões nutricionais são de competência exclusiva da Nutricionista RT.' },
                                { t: '6. Valor Legal', d: 'Todas as ações são registradas em log com valor administrativo e legal.' },
                                { t: '7. Dados e Sigilo', d: 'Proibida a exclusão indevida e exposição de dados sensíveis (NAE).' },
                                { t: '8. Penalidades', d: 'Suspensão de acesso e medidas administrativas conforme legislação vigente.' },
                                { t: '9. Aceite Tácito', d: 'O uso do sistema implica na ciência e concordância integral com este Termo.' }
                            ].map((clause, idx) => (
                                <div key={idx} className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-indigo-500/30 transition-all">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> {clause.t}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{clause.d}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center text-3xl shrink-0">⚖️</div>
                            <div className="space-y-1 flex-1">
                                <p className="text-xs font-black uppercase text-emerald-400">Compromisso Institucional</p>
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                    "A utilização do NutriAssist SME pressupõe a responsabilidade técnica e ética de cada agente público na garantia da qualidade da alimentação escolar."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 16: POLÍTICA DE SEGURANÇA DA INFORMAÇÃO */}
                    <div className="lg:col-span-2 bg-slate-900 p-10 lg:p-14 rounded-[56px] text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">16. Política de Segurança da Informação</h2>
                                    <p className="text-sm text-slate-400 font-medium">Normas de proteção, confidencialidade e integridade de dados (PSI).</p>
                                </div>
                                <div className="px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Conformidade LGPD
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Classificação</h4>
                                    <ul className="space-y-3">
                                        <li className="text-[10px] text-slate-300 flex gap-3">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0"></span>
                                            Públicos: Relatórios oficiais.
                                        </li>
                                        <li className="text-[10px] text-slate-300 flex gap-3">
                                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1 shrink-0"></span>
                                            Restritos: Dados administrativos.
                                        </li>
                                        <li className="text-[10px] text-slate-300 flex gap-3">
                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0"></span>
                                            Sensíveis: Alunos NAE e Laudos.
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Controle de Acesso</h4>
                                    <ul className="space-y-2">
                                        <ListItemWhite text="Autenticação individual." />
                                        <ListItemWhite text="Princípio do menor privilégio." />
                                        <ListItemWhite text="Rastreabilidade total (Logs)." />
                                        <ListItemWhite text="Gestão por perfis técnicos." />
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Infraestrutura</h4>
                                    <ul className="space-y-2">
                                        <ListItemWhite text="Bancos de dados criptografados." />
                                        <ListItemWhite text="Backups periódicos automáticos." />
                                        <ListItemWhite text="Cloud de alta disponibilidade." />
                                        <ListItemWhite text="Proteção contra exclusão indevida." />
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mb-4">🛡️</div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Auditoria Permanente</h4>
                                    <p className="text-[9px] text-slate-500 mt-2">Monitoramento contínuo de incidentes e conformidade.</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Lei Federal 13.709/2018</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                        "O tratamento de dados sensíveis de menores é realizado com o melhor interesse do aluno, garantindo sigilo absoluto."
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Segurança de Logs</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                        "Registros imutáveis com identificação única de usuário, timestamp e IP para fins de convalidação administrativa."
                                    </p>
                                </div>
                                <div className="flex items-center justify-end">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-right">
                                        <p className="text-[9px] font-black text-slate-500 uppercase">Status da Política</p>
                                        <p className="text-xs font-bold text-emerald-400">ATIVO EM TODA A REDE SME</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 17: MINUTA DE PORTARIA MUNICIPAL */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 p-10 lg:p-14 rounded-[56px] shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">17. Minuta de Portaria Municipal</h2>
                                    <p className="text-sm text-slate-500 font-medium">Instrumento legal de oficialização do sistema na rede municipal.</p>
                                </div>
                                <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">📜</div>
                            </div>

                            <div className="bg-slate-50 rounded-[40px] p-10 lg:p-16 border border-slate-100 shadow-inner space-y-8 font-serif leading-relaxed text-slate-800">
                                <div className="text-center space-y-4 mb-12">
                                    <p className="text-lg font-black uppercase underline decoration-2 underline-offset-8 decoration-slate-300">PORTARIA Nº _____ / ______</p>
                                    <p className="text-sm font-bold max-w-lg mx-auto italic">Institui o Sistema NutriAssist SME como ferramenta oficial de gestão da alimentação escolar no âmbito da rede municipal de ensino e dá outras providências.</p>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <p>O(A) SECRETÁRIO(A) MUNICIPAL DE EDUCAÇÃO, no uso de suas atribuições legais, CONSIDERANDO a Lei nº 11.947/2009 (PNAE) e a Resolução FNDE nº 06/2020;</p>

                                    <p className="font-bold uppercase tracking-widest text-center text-xs py-4">RESOLVE:</p>

                                    <p><span className="font-black">Art. 1º</span> Instituir o <span className="font-black">Sistema NutriAssist SME</span> como ferramenta oficial para a gestão, controle e organização da alimentação escolar.</p>

                                    <p><span className="font-black">Art. 2º</span> O sistema será utilizado para elaboração de cardápios, gestão de NAE, controle de estoque, suporte a licitações e auditoria.</p>

                                    <p><span className="font-black">Art. 3º</span> A Nutricionista Responsável Técnica é a autoridade máxima no sistema para decisões técnicas e nutricionais.</p>

                                    <p><span className="font-black">Art. 4º</span> Todos os usuários deverão observar o Termo de Uso e a Política de Segurança da Informação do sistema.</p>
                                </div>

                                <div className="pt-12 text-center space-y-16">
                                    <p className="text-sm">Local e data: ____________________, ____ de ________ de 202__.</p>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-64 h-px bg-slate-400"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Secretário(a) Municipal de Educação</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 18: TERMO DE ADESÃO ESCOLAR */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 p-10 lg:p-14 rounded-[56px] shadow-xl overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-50 rounded-full translate-x-1/2 translate-y-1/2 opacity-50"></div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">18. Termo de Adesão Escolar</h2>
                                    <p className="text-sm text-slate-500 font-medium">Compromisso formal da Unidade Escolar com as normas do sistema.</p>
                                </div>
                                <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center text-3xl shadow-xl">🤝</div>
                            </div>

                            <div className="bg-slate-50 rounded-[40px] p-10 lg:p-16 border border-slate-100 shadow-inner space-y-8 font-serif leading-relaxed text-slate-800">
                                <div className="text-center space-y-4 mb-12">
                                    <p className="text-lg font-black uppercase underline decoration-2 underline-offset-8 decoration-emerald-300">TERMO DE ADESÃO AO SISTEMA NUTRIASSIST SME</p>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <p>Pelo presente instrumento, a Unidade Escolar <span className="font-black">___________________________________________</span>, declara sua adesão ao Sistema NutriAssist SME, comprometendo-se a:</p>

                                    <ul className="space-y-4 pl-6">
                                        <li className="list-disc">Registrar corretamente o consumo diário das refeições;</li>
                                        <li className="list-disc">Informar intercorrências e seguir orientações da Nutricionista RT;</li>
                                        <li className="list-disc">Preservar o sigilo de informações sensíveis e logins individuais;</li>
                                    </ul>

                                    <p>Este Termo entra em vigor na data de sua assinatura e fundamenta a responsabilidade administrativa dos gestores escolares no uso da plataforma.</p>
                                </div>

                                <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full max-w-[200px] h-px bg-slate-400"></div>
                                        <p className="text-[10px] font-black uppercase">Diretor(a) da Unidade Escolar</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full max-w-[200px] h-px bg-slate-400"></div>
                                        <p className="text-[10px] font-black uppercase">Secretaria de Educação</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 19: REGULAMENTO INTERNO DO SISTEMA */}
                    <div className="lg:col-span-2 bg-slate-50 border border-slate-200 p-10 lg:p-14 rounded-[56px] shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-slate-900/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">19. Regulamento Interno do Sistema</h2>
                                    <p className="text-sm text-slate-500 font-medium">Normatização detalhada de condutas, perfis e competências técnicas.</p>
                                </div>
                                <div className="w-16 h-16 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-xl">⚖️</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-8 font-serif text-slate-800 bg-white p-10 lg:p-16 rounded-[40px] border border-slate-100 shadow-sm leading-relaxed text-sm">
                                    <div className="space-y-6">
                                        <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 border-b border-slate-100 pb-2">Capítulo II – Dos Perfis e Competências</h4>

                                        <div className="space-y-4">
                                            <p><span className="font-black">Art. 3º Nutricionista RT:</span> Autoridade máxima para elaboração, validação e assinatura de cardápios e pareceres técnicos.</p>
                                            <p><span className="font-black">Art. 4º Gestor/Secretário:</span> Acompanhamento da política de alimentação e validação administrativa de planos e relatórios.</p>
                                            <p><span className="font-black">Art. 5º Diretores Escolares:</span> Garantia do registro correto das informações e comunicação de intercorrências.</p>
                                            <p><span className="font-black">Art. 6º Merendeiras:</span> Execução dos cardápios e registro fidedigno do consumo diário.</p>
                                        </div>

                                        <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 border-b border-slate-100 pb-2 pt-6">Capítulo III – Do Uso do Sistema</h4>
                                        <p><span className="font-black">Art. 7º</span> É vedada a alteração de informações técnicas sem autorização da Nutricionista Responsável Técnica.</p>
                                        <p><span className="font-black">Art. 9º</span> O sistema mantém histórico e rastreabilidade (Logs) de todas as ações para fins de auditoria.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Pilar Normativo</h5>
                                        <p className="text-xs text-slate-400 leading-relaxed italic">
                                            "Este regulamento transforma a tecnologia em processo institucional, definindo o 'quem faz o quê' com precisão jurídica."
                                        </p>
                                    </div>
                                    <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conformidade</h5>
                                        <ul className="space-y-3">
                                            <li className="text-[10px] font-bold text-slate-600 flex gap-2">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5"></div>
                                                Alinhado à Resolução CD/FNDE nº 06/2020.
                                            </li>
                                            <li className="text-[10px] font-bold text-slate-600 flex gap-2">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5"></div>
                                                Base para Auditorias de Controle Interno.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 20: MINUTA DE RESOLUÇÃO DO CAE */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 p-10 lg:p-14 rounded-[56px] shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-40"></div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">20. Minuta de Resolução do CAE</h2>
                                    <p className="text-sm text-slate-500 font-medium">Reconhecimento do Conselho de Alimentação Escolar para fins de fiscalização.</p>
                                </div>
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">🔍</div>
                            </div>

                            <div className="bg-slate-50 rounded-[40px] p-10 lg:p-16 border border-slate-100 shadow-inner space-y-8 font-serif leading-relaxed text-slate-800">
                                <div className="text-center space-y-4 mb-12">
                                    <p className="text-lg font-black uppercase underline decoration-2 underline-offset-8 decoration-indigo-300">RESOLUÇÃO CAE Nº _____ / ______</p>
                                    <p className="text-sm font-bold max-w-lg mx-auto italic">Dispõe sobre o acompanhamento, a fiscalização e a validação das ações de alimentação escolar por meio do Sistema NutriAssist SME.</p>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <p>O CONSELHO DE ALIMENTAÇÃO ESCOLAR (CAE), no uso de suas atribuições legais, CONSIDERANDO a Lei nº 11.947/2009 e a necessidade de fortalecer a transparência e o controle social;</p>

                                    <p className="font-bold uppercase tracking-widest text-center text-xs py-4">RESOLVE:</p>

                                    <p><span className="font-black">Art. 1º</span> Reconhecer o <span className="font-black">Sistema NutriAssist SME</span> como ferramenta oficial de apoio ao acompanhamento e à fiscalização da execução do PNAE.</p>

                                    <p><span className="font-black">Art. 2º</span> O CAE utilizará os relatórios e documentos gerados pelo sistema para fins de análise, monitoramento e emissão de pareceres.</p>

                                    <p><span className="font-black">Art. 3º</span> O sistema assegura transparência, rastreabilidade e conformidade técnica para atuação do controle social.</p>

                                    <p><span className="font-black">Art. 4º</span> A Nutricionista Responsável Técnica mantém autonomia técnica absoluta sobre as decisões nutricionais registradas.</p>
                                </div>

                                <div className="pt-12 text-center space-y-16">
                                    <p className="text-sm">Sala das Sessões, ____ de __________________ de 202__.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-full max-w-[200px] h-px bg-slate-400"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Presidente do CAE</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-full max-w-[200px] h-px bg-slate-400"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Secretário(a) do CAE</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 21: PLANO DE GOVERNANÇA DO SISTEMA */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 p-10 lg:p-14 rounded-[56px] text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex justify-between items-center border-b border-white/10 pb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">21. Plano de Governança do Sistema</h2>
                                    <p className="text-sm text-slate-400 font-medium tracking-tight">Estratégia de sustentabilidade, processos decisórios e gestão de ativos institucionais.</p>
                                </div>
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">🏛️</div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">1. Estrutura de Governança</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { t: 'SME', d: 'Instância Máxima Administrativa' },
                                                { t: 'Nutricionista RT', d: 'Autoridade Técnica Soberana' },
                                                { t: 'CAE', d: 'Fiscalização e Controle Social' },
                                                { t: 'Unidades', d: 'Execução Operacional e Registro' }
                                            ].map((item, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-white uppercase mb-1">{item.t}</p>
                                                    <p className="text-[9px] text-slate-400 font-medium">{item.d}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">2. Processos Decisórios</h4>
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                                                <p className="text-[11px] text-slate-300 leading-relaxed"><span className="text-white font-bold">Decisões Técnicas:</span> Competência exclusiva da RT, baseada em normativas do FNDE e CFN.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                                                <p className="text-[11px] text-slate-300 leading-relaxed"><span className="text-white font-bold">Decisões Administrativas:</span> Competência da SME, visando provimento de recursos e continuidade.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Gestão de Riscos e Continuidade
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                'Alertas automáticos de inconsistência nutricional.',
                                                'Registro e tratamento de incidentes de segurança.',
                                                'Preservação do histórico institucional através de backups redundantes.',
                                                'Atualização periódica conforme mudanças na legislação federal.'
                                            ].map((text, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-slate-400 font-medium">{text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-emerald-500 rounded-[40px] text-slate-950 space-y-2">
                                        <p className="text-[10px] font-black uppercase">Foco na Sustentabilidade</p>
                                        <p className="text-xs font-black">"O NutriAssist SME é uma ferramenta de Estado, desenhada para transcender gestões e manter a excelência do PNAE."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 22. INDICADORES DE DESEMPENHO (KPIs) (NEW SECTION) */}
                    <div className="lg:col-span-2 bg-slate-950 p-10 lg:p-14 rounded-[56px] text-white overflow-hidden relative border border-white/5">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 blur-[120px] rounded-full"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                                        Métricas & Performance
                                    </div>
                                    <h3 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                        22. Indicadores de <span className="text-indigo-500">Desempenho (KPIs)</span>
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                        Monitoramento da eficiência, conformidade legal e qualidade da execução por meio de indicadores mensuráveis em tempo real.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PNAE Compliance</p>
                                        <p className="text-2xl font-black text-white">100% Data-Driven</p>
                                    </div>
                                    <BarChart3 className="w-12 h-12 text-indigo-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {[
                                    {
                                        title: 'Conformidade',
                                        icon: Scale,
                                        items: [
                                            'Cardápios planejados vs executados.',
                                            'Assinatura digital da Nutricionista RT.',
                                            'Integralidade dos registros por escola.'
                                        ],
                                        color: 'indigo'
                                    },
                                    {
                                        title: 'Nutricionais',
                                        icon: Apple,
                                        items: [
                                            'Adequação por faixa etária.',
                                            'Frequência de alimentos in natura.',
                                            'Redução de ultraprocessados.'
                                        ],
                                        color: 'emerald'
                                    },
                                    {
                                        title: 'Operacionais',
                                        icon: Zap,
                                        items: [
                                            'Taxa de registro diário do consumo.',
                                            'Número de intercorrências.',
                                            'Tempo de regularização de não conformidades.'
                                        ],
                                        color: 'amber'
                                    },
                                    {
                                        title: 'Controle Social',
                                        icon: Users,
                                        items: [
                                            'Relatórios disponibilizados ao CAE.',
                                            'Frequência de pareceres do Conselho.',
                                            'Atendimento às recomendações.'
                                        ],
                                        color: 'blue'
                                    },
                                    {
                                        title: 'Gestão',
                                        icon: LayoutDashboard,
                                        items: [
                                            'Adesão das unidades ao sistema.',
                                            'Consistência dos dados de estoque.',
                                            'Uso de relatórios para decisões.'
                                        ],
                                        color: 'rose'
                                    }
                                ].map((kpi, i) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/[0.07] transition-all">
                                        <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-500/20 flex items-center justify-center text-${kpi.color}-400`}>
                                            <kpi.icon className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">{kpi.title}</h4>
                                        <ul className="space-y-2">
                                            {kpi.items.map((item, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <div className={`w-1 h-1 rounded-full bg-${kpi.color}-500 mt-1.5 shrink-0`} />
                                                    <p className="text-[10px] text-slate-400 font-medium leading-tight">{item}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 23. MATRIZ DE RESPONSABILIDADES (RACI) (NEW SECTION) */}
                    <div className="lg:col-span-2 bg-white p-10 lg:p-14 rounded-[56px] text-slate-950 overflow-hidden relative border border-slate-200">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="space-y-2">
                                <h3 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                    23. Matriz de <span className="text-slate-400">Responsabilidades (RACI)</span>
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">DEFINIÇÃO DE PAPÉIS: R (RESPONSÁVEL) | A (APROVADOR) | C (CONSULTADO) | I (INFORMADO)</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900">
                                            <th className="py-4 px-4 text-[13px] font-black uppercase tracking-wider">Atividade Principal</th>
                                            <th className="py-4 px-4 text-[13px] font-black uppercase tracking-wider text-center">SME</th>
                                            <th className="py-4 px-4 text-[13px] font-black uppercase tracking-wider text-center">RT Nutri</th>
                                            <th className="py-4 px-4 text-[13px] font-black uppercase tracking-wider text-center">CAE</th>
                                            <th className="py-4 px-4 text-[13px] font-black uppercase tracking-wider text-center">Escola</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            ['Diretrizes Administrativas', 'A', 'C', 'I', 'I'],
                                            ['Elaboração de Cardápios', 'I', 'R/A', 'C', 'I'],
                                            ['Validação Técnica', 'I', 'R/A', 'C', 'I'],
                                            ['Execução do Cardápio', 'I', 'I', 'I', 'R'],
                                            ['Registro do Consumo', 'I', 'C', 'I', 'R'],
                                            ['Monitoramento Nutricional', 'I', 'R', 'C', 'I'],
                                            ['Fiscalização e Controle Social', 'I', 'I', 'R/A', 'I'],
                                            ['Geração de Relatórios', 'A', 'R', 'C', 'I'],
                                            ['Auditorias e Contas', 'A', 'C', 'R', 'I'],
                                            ['Gestão de Contingências', 'A', 'R', 'I', 'R']
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4 text-xs font-bold text-slate-700">{row[0]}</td>
                                                <td className="py-4 px-4 text-xs font-black text-center text-blue-600">{row[1]}</td>
                                                <td className="py-4 px-4 text-xs font-black text-center text-emerald-600">{row[2]}</td>
                                                <td className="py-4 px-4 text-xs font-black text-center text-indigo-600">{row[3]}</td>
                                                <td className="py-4 px-4 text-xs font-black text-center text-slate-900">{row[4]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-[11px] text-slate-500 font-medium">
                                Esta matriz visa garantir clareza institucional, evitar sobreposição de funções e fortalecer a governança, assegurando que cada ator conheça seu papel no ciclo de alimentação escolar.
                            </div>
                        </div>
                    </div>

                    {/* 24. PLANO DE CONTINUIDADE E CONTINGÊNCIA (NEW SECTION) */}
                    <div className="lg:col-span-2 bg-amber-50 p-10 lg:p-14 rounded-[56px] text-slate-950 overflow-hidden relative border border-amber-200 shadow-xl shadow-amber-900/5">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/40"></div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-bold uppercase tracking-widest">
                                        Resiliência Operacional
                                    </div>
                                    <h3 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                        24. Plano de <span className="text-amber-600">Continuidade & Contingência</span>
                                    </h3>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                        Protocolos de segurança e planos de ação para garantir que a alimentação escolar não pare, independente de falhas técnicas ou externas.
                                    </p>
                                </div>
                                <Shield className="w-16 h-16 text-amber-600 opacity-20" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black">1</div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">Cenários de Risco</h4>
                                    </div>
                                    <div className="space-y-3 bg-white/50 p-6 rounded-3xl border border-amber-100">
                                        {[
                                            'Falhas de acesso à internet.',
                                            'Indisponibilidade do sistema.',
                                            'Manutenção emergencial.',
                                            'Panes elétricas ou falhas físicas.'
                                        ].map((text, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                <p className="text-[11px] text-slate-600 font-bold">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black">2</div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">Ações Imediatas</h4>
                                    </div>
                                    <div className="space-y-3 bg-white/50 p-6 rounded-3xl border border-amber-100 italic">
                                        {[
                                            'Uso compulsório do cardápio impresso validado.',
                                            'Registro manual do consumo por turma.',
                                            'Preenchimento de formulário de intercorrências.',
                                            'Comunicação oficial imediata à SME.'
                                        ].map((text, i) => (
                                            <div key={i} className="flex gap-3">
                                                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                <p className="text-[11px] text-slate-600 font-bold">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black">3</div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">Restabelecimento</h4>
                                    </div>
                                    <div className="space-y-3 bg-white/50 p-6 rounded-3xl border border-amber-100">
                                        {[
                                            'Migração dos dados manuais para o sistema.',
                                            'Validação técnica pela Nutricionista RT.',
                                            'Auditoria de consistência das informações.',
                                            'Registro do histórico para transparência.'
                                        ].map((text, i) => (
                                            <div key={i} className="flex gap-3">
                                                <RefreshCw className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-slate-600 font-bold">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-600 rounded-3xl text-white">
                                <p className="text-xs font-black uppercase tracking-widest mb-2">Compromisso Institucional</p>
                                <p className="text-[11px] font-medium leading-relaxed opacity-90">
                                    Este plano assegura a continuidade do PNAE e a segurança das informações mesmo em situações adversas.
                                    "A tecnologia é o meio, a alimentação do aluno é o fim inegociável."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MODERNIZAÇÃO E ESCALABILIDADE (NEW SECTION) */}
                    <div className="lg:col-span-2 bg-slate-900 p-10 lg:p-14 rounded-[56px] text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Modernização e Longevidade</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        O NutriAssist SME foi projetado para ser um ativo tecnológico permanente do município, permitindo expansão sem obsolescência.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Diretrizes de Escalabilidade</h4>
                                    <ul className="space-y-3">
                                        <ListItemWhite text="Estrutura modular para inclusão de novas funcionalidades." />
                                        <ListItemWhite text="Separação clara entre regras de negócio e interface." />
                                        <ListItemWhite text="Base normativa centralizada e reutilizável pelo sistema." />
                                        <ListItemWhite text="Histórico permanente para análise longitudinal de dados." />
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-sm">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <RefreshCw className="w-3 h-3" /> Possibilidades de Evolução
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            'Aplicativo Móvel',
                                            'Integração Administrativa',
                                            'Painéis de BI Avançados',
                                            'Novos Perfis de Usuário',
                                            'Atualização Legal Automática'
                                        ].map(item => (
                                            <div key={item} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                <span className="text-[10px] font-bold uppercase text-slate-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-6 items-center pt-4 border-t border-white/10">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Princípio Central</p>
                                        <p className="text-xs font-bold text-slate-200">"Crescer sem refazer o sistema. Manter simplicidade e conformidade legal."</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[9px] text-emerald-500 font-black uppercase">Homologado SME V2.1</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* FOOTER IMPRESSÃO */}
                    <div className="hidden print:block mt-20 pt-10 border-t border-slate-200">
                        <OfficialLetterhead
                            config={letterhead}
                            type="footer"
                            className="opacity-80"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemTR;
