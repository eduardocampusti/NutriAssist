import React from 'react';
import { LetterheadConfig } from '../types';
import {
  ShieldCheck,
  Cpu,
  Database,
  FileCheck,
  Users,
  Award,
  Terminal,
  Code2,
  HeartPulse,
  ChefHat,
  GraduationCap,
  Building2,
  X,
  Scale,
  CheckCircle2
} from 'lucide-react';

interface AboutSystemProps {
  config: LetterheadConfig;
  onClose: () => void;
}

const AboutSystem: React.FC<AboutSystemProps> = ({ config, onClose }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-24 font-inter">

      {/* HEADER: TITULO & FECHAR */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Informações Institucionais</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Sobre o <span className="text-emerald-600">Sistema</span>
          </h1>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-90 shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* COLUNA ESQUERDA: BRANDING & ADMINISTRAÇÃO (4 Colunas) */}
        <div className="lg:col-span-4 space-y-8">

          {/* CARTÃO BRANDING */}
          <div className="bg-[#020617] p-10 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-slate-900/20 text-white min-h-[320px] flex flex-col justify-between border border-slate-800">
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 mb-6 group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/5">
                🥗
              </div>
              <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">
                NutriAssist <span className="text-emerald-400">SME</span>
              </h2>
              <p className="text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.3em]">Gestão Inteligente</p>
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Versão do Sistema</p>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {config.sistemaVersao || 'v2.6.0 (Stable)'}
              </p>
            </div>
          </div>

          {/* CARTÃO ADMINISTRAÇÃO */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-[40px] -mr-4 -mt-4 z-0"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Administração Municipal</h3>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">Prefeito Municipal</p>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{config.prefeitoNome || 'Dr. Antônio Kleber Ribeiro'}</p>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div className="group">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">Secretária de Educação</p>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{config.secretariaNome || 'Gislene Leite Santos Araújo'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: EQUIPE TÉCNICA E DNA (8 Colunas) */}
        <div className="lg:col-span-8 space-y-8">

          {/* EQUIPE TÉCNICA (GRID DUPLO) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ALEXANDRA */}
            <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[32px] border border-slate-200/60 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <HeartPulse className="w-24 h-24 text-rose-500" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">Responsabilidade Técnica</p>
                  <h3 className="text-xl font-black text-slate-800 uppercase mb-1">{config.nutricionistaNome || 'Alexandra Fernandes'}</h3>
                  <p className="text-xs font-bold text-slate-500">Nutricionista • {config.nutricionistaCrn || 'CRN-5/16149'}</p>
                </div>
                <div className="pt-4 border-t border-slate-200/60">
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    "Supervisão rigorosa dos parâmetros nutricionais, conformidade com o PNAE e garantia da segurança alimentar."
                  </p>
                </div>
              </div>
            </div>

            {/* EDUARDO */}
            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-slate-700 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Terminal className="w-24 h-24 text-emerald-400" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="w-12 h-12 bg-slate-800 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner border border-slate-700">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Arquitetura & Desenvolvimento</p>
                  <h3 className="text-xl font-black text-white uppercase mb-1">Carlos Eduardo</h3>
                  <p className="text-xs font-bold text-slate-400">Engenheiro de Software • Full Stack</p>
                </div>
                <div className="pt-4 border-t border-slate-700/60">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    "Desenvolvimento do ecossistema digital focado em segurança de dados, alta performance e usabilidade governamental."
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* DNA DO SISTEMA (MODULOS) */}
          <div className="bg-white px-8 py-10 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Módulos de Conformidade & Tecnologia</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: ShieldCheck, label: "Compliance PNAE" },
                { icon: Database, label: "Banco de Dados Seguro" },
                { icon: Users, label: "Gestão por Papéis (RBAC)" },
                { icon: FileCheck, label: "Auditoria Digital" },
                { icon: Cpu, label: "Automação Inteligente" },
                { icon: Award, label: "Certificação de Qualidade" },
                { icon: GraduationCap, label: "Módulo Capacitação" },
                { icon: HeartPulse, label: "Saúde Escolar (PSE)" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group cursor-default">
                  <item.icon className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors mb-3" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase text-center group-hover:text-emerald-700 transition-colors">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* APRESENTAÇÃO INSTITUCIONAL */}
          <div className="bg-emerald-50/50 px-10 py-12 rounded-[40px] border border-emerald-100/60 shadow-inner space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShieldCheck className="w-32 h-32 text-emerald-600" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Apresentação Institucional</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{config.secretaria || 'SME'} {config.municipio || 'Brotas de Macaúbas/BA'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/60 p-8 rounded-[32px] border border-white shadow-sm">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    O **Sistema NutriAssist SME** organiza o fluxo da alimentação: a nutricionista planeja, o sistema controla o estoque, os alimentos chegam às escolas e a direção confirma o recebimento.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tudo fica registrado de forma simples para sabermos exatamente o que foi comprado, entregue e consumido, protegendo quem trabalha e evitando desperdícios.
                    </p>
                    <ul className="space-y-2 text-[11px] font-bold text-slate-500 uppercase">
                      <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /> Redução de Burocracia</li>
                      <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /> Segurança para a Gestão</li>
                      <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /> Transparência Total</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Fortalece o papel do **Conselho de Alimentação Escolar (CAE)**, garantindo informações acessíveis para o controle social e a transparência pública.
                    </p>
                    <div className="p-4 bg-emerald-600/5 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-800 font-bold leading-relaxed italic">
                        "Reafirmamos nosso compromisso com a boa aplicação dos recursos públicos e com o direito dos nossos estudantes a uma alimentação de excelência."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-emerald-100 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-[9px] font-black text-slate-400 uppercase">
                    <Scale size={14} /> Validade Administrativa
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-[9px] font-black text-slate-400 uppercase">
                    <FileCheck size={14} /> Conformidade PNAE
                  </div>
                </div>

                {/* NOVO: RESPALDO AUDITORIA E REPOSIÇÃO */}
                <div className="mt-12 p-8 bg-white/40 border border-emerald-200/50 rounded-[32px] space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                  <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Governança & Base Normativa
                  </h4>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
                      <Scale size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Portaria Normativa - {config.secretaria || 'SME'}</p>
                      <p className="text-[9px] text-slate-500 font-medium leading-none mt-1">Designação do Núcleo Cocal para gestão administrativa PNAE.</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-[11px] text-slate-600 font-medium leading-relaxed">
                    <p>
                      O **Módulo de Auditoria e Solicitação de Reposição de Estoque Escolar** integra o Sistema NutriAssist SME como instrumento de apoio à gestão da alimentação escolar, com fundamento nos princípios da legalidade, eficiência, transparência e controle administrativo.
                    </p>
                    <p>
                      A funcionalidade não transfere à unidade escolar a responsabilidade pela gestão centralizada do estoque, cabendo à direção apenas o acompanhamento, a auditoria local e a comunicação formal das necessidades da escola.
                    </p>
                    <p>
                      As solicitações registradas no sistema possuem caráter administrativo, servindo como subsídio para planejamento, distribuição de alimentos e prestação de contas, em conformidade com as normas do Programa Nacional de Alimentação Escolar – PNAE.
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-emerald-600/10 rounded-xl border border-emerald-200 mt-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <p className="text-[10px] font-bold text-emerald-900 uppercase">
                        Todos os registros possuem rastreabilidade, data, identificação do responsável e histórico, garantindo segurança jurídica aos gestores, à Nutricionista RT e à SME.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="text-center pt-8 border-t border-slate-100 opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Desenvolvido exclusivamente para a Secretaria Municipal de Educação
        </p>
        <p className="text-[9px] text-slate-300 font-medium mt-1">
          {config.municipio || 'Brotas de Macaúbas'} — {config.uf || 'Bahia'} • {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
};

export default AboutSystem;
