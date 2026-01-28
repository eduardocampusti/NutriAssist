import React, { useState, useEffect } from 'react';
import { LetterheadConfig } from '../types';
import {
  ShieldCheck,
  Cpu,
  Database,
  FileCheck,
  Users,
  Award,
  Code2,
  HeartPulse,
  ChefHat,
  GraduationCap,
  Building2,
  X,
  Moon,
  Sun,
  LayoutGrid,
  ClipboardList,
  Fingerprint
} from 'lucide-react';

interface AboutSystemProps {
  config: LetterheadConfig;
  onClose: () => void;
}

const AboutSystem: React.FC<AboutSystemProps> = ({ config, onClose }) => {
  // We remove the state-based theme enforcement because standard is now Light Mode
  // But we keep the toggle for preference.

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-500 p-4 md:p-8 font-inter overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Informações Institucionais</h2>
            <h1 className="text-3xl md:text-3xl font-black text-[#1E293B] dark:text-white tracking-tighter uppercase">
              Sobre o <span className="text-emerald-600">Sistema</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-300 hover:text-rose-500 transition-all active:scale-95 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HERO BANNER - PREMIUM REDESIGN */}
        <div className="relative w-full rounded-[30px] shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center p-10 md:p-16 group transition-all hover:shadow-emerald-900/20">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[url('/premium-hero.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(6,78,59,0.95) 0%, rgba(6,78,59,0.4) 100%)' }}></div>

          {/* Content */}
          <div className="relative z-10 space-y-6 max-w-4xl animate-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl border border-white/20 text-white shadow-lg">
                🥗
              </div>
              <span className="px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-900/30 text-emerald-100 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                Versão {config.sistemaVersao || '2.6.0'}
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-white drop-shadow-sm">
              NUTRIASSIST <span className="text-emerald-400">SME</span> — <br />
              GESTÃO INTELIGENTE
            </h2>

            <p className="text-lg md:text-xl text-emerald-50 font-medium leading-relaxed max-w-2xl text-shadow-sm opacity-90">
              A solução definitiva para automação técnica nutricional, garantindo conformidade com o PNAE e eficiência operacional para a rede municipal de ensino.
            </p>

            <div className="pt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <ShieldCheck className="text-emerald-300 w-5 h-5" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Segurança PNAE</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Cpu className="text-emerald-300 w-5 h-5" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Automação IA</span>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM ROW: 2 CARDS - REFINED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 2: NUTRICIONISTA - REFINED */}
          <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[320px] group hover:border-rose-200 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5">

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center shadow-sm border border-rose-100 dark:border-rose-800/30">
                    <ChefHat className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                    RT Ativa
                  </div>
                </div>

                <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest mb-2">Responsabilidade Técnica</p>
                <h3 className="text-3xl font-black tracking-tight uppercase leading-none mb-2 text-[#1E293B] dark:text-white">{config.nutricionistaNome || 'Alexandra Fernandes'}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  CRN-5/16149
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                  "Supervisão rigorosa dos parâmetros nutricionais, conformidade com o PNAE e garantia da segurança alimentar."
                </p>
                <button className="w-full py-3 rounded-xl bg-rose-600 text-white border border-rose-600 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98]">
                  Ver Credencial Oficial
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: ARQUITETO - REFINED */}
          <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[320px] group hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5">

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100 dark:border-amber-800/30">
                    <Code2 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                    Lead Dev
                  </div>
                </div>

                <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-2">Engenharia de Software</p>
                <h3 className="text-3xl font-black tracking-tight uppercase leading-none mb-2 text-[#1E293B] dark:text-white">Carlos Eduardo</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  Full Stack Developer
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                  "Ecossistema digital focado em segurança de dados, alta performance e usabilidade governamental."
                </p>
                <button className="w-full py-3 rounded-xl bg-amber-500 text-white border border-amber-500 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]">
                  Ver Portfolio Técnico
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: 2 PANELS - REFINED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* PANEL 1: ADMIN - OFFICIAL GOVERNMENT STYLE */}
          <div className="lg:col-span-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-[24px] p-8 relative overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
            {/* Watermark Seal */}
            <div className="absolute -right-12 -bottom-12 opacity-[0.05] pointer-events-none mix-blend-multiply dark:mix-blend-screen">
              <Building2 className="w-64 h-64 text-slate-900 dark:text-white" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="p-3 bg-slate-900 rounded-xl text-emerald-400 shadow-lg shadow-slate-900/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Gestão 2025-2028</h3>
                  <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Administração Municipal</h2>
                </div>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-500 transition-colors"></span> Prefeito Municipal
                  </p>
                  <p className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight leading-tight">{config.prefeitoNome || 'Dr. Antônio Kleber Ribeiro'}</p>
                </div>

                <div className="group">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-500 transition-colors"></span> Secretária de Educação
                  </p>
                  <p className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight leading-tight">{config.secretariaNome || 'Gislene Leite Santos Araújo'}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 opacity-100">
                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[40%] h-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[8px] font-bold uppercase text-emerald-600">Transparência Ativa</span>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: MODULES - APP STORE TILES */}
          <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] p-8 border border-slate-100 dark:border-slate-700 shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white shadow-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-xl">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ecossistema Digital</h3>
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Módulos Instalados</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ModuleCard icon={ShieldCheck} label="Compliance PNAE" color="emerald" />
              <ModuleCard icon={Database} label="Banco de Dados" color="blue" />
              <ModuleCard icon={Users} label="Gestão RBAC" color="orange" />
              <ModuleCard icon={FileCheck} label="Auditoria Digital" color="slate" />

              <ModuleCard icon={Cpu} label="Automação IA" color="purple" />
              <ModuleCard icon={Award} label="Certificação Qualidade" color="blue" />
              <ModuleCard icon={GraduationCap} label="Capacitação" color="orange" />
              <ModuleCard icon={HeartPulse} label="Saúde Escolar (PSE)" color="rose" />
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800 opacity-60">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
            Desenvolvido exclusivamente para a Secretaria Municipal de Educação
          </p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-1">
            {config.municipio || 'Brotas de Macaúbas'} — {config.uf || 'Bahia'} • {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
};

// HELPER COMPONENTS

const ModuleCard = ({ icon: Icon, label, color }: { icon: any, label: string, color: string }) => {
  // App Store Tile Style
  const getColorClass = (c: string) => {
    switch (c) {
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-100 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500';
      case 'rose': return 'text-rose-600 bg-rose-50 border-rose-100 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500';
      case 'purple': return 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100 group-hover:bg-fuchsia-500 group-hover:text-white group-hover:border-fuchsia-500';
      default: return 'text-slate-600 bg-slate-50 border-slate-100 group-hover:bg-slate-500 group-hover:text-white group-hover:border-slate-500';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer aspect-square">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 border ${getColorClass(color)}`}>
        <Icon className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
      </div>
      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white uppercase text-center leading-tight transition-colors px-2">{label}</span>
    </div>
  );
};

export default AboutSystem;
