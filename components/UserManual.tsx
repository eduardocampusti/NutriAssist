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
   Download,
   HelpCircle,
   UserCircle,
   Scale,
   ShoppingBag,
   Truck,
   AlertTriangle,
   CheckCircle2,
   Database,
   Shield,
   ClipboardCheck,
   Lock,
   Gavel,
   CheckCircle,
   FileSpreadsheet,
   Navigation
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface UserManualProps {
   activeProfile?: UserProfile | null;
   onClose: () => void;
}

interface ManualSection {
   id: string;
   icon: React.ElementType;
   title: string;
   roles: UserRole[];
   content: React.ReactNode;
}

const UserManual: React.FC<UserManualProps> = ({ activeProfile, onClose }) => {
   const [activeSection, setActiveSection] = useState<string>('intro');

   const sections: ManualSection[] = [
      {
         id: 'intro',
         icon: Info,
         title: 'Apresentação Institucional',
         roles: [UserRole.ADMIN, UserRole.NUTRICIONISTA, UserRole.SECRETARIA, UserRole.DIRETOR, UserRole.MERENDEIRA, UserRole.TECNICO],
         content: (
            <div className="space-y-10">
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter print:text-2xl print:tracking-normal print:font-bold">Manual Operacional NutriAssist SME</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-lg print:text-sm print:text-slate-800">
                     O Sistema NutriAssist SME é a plataforma tecnológica oficial de gestão da alimentação escolar de Brotas de Macaúbas, desenvolvida para garantir a segurança alimentar, a transparência administrativa e a conformidade integral com o Programa Nacional de Alimentação Escolar (PNAE).
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4 print:p-6 print:rounded-2xl print:border-slate-300">
                     <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center print:bg-slate-200 print:text-slate-900">
                        <Gavel className="w-5 h-5" />
                     </div>
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-600">Base Legal</h4>
                     <p className="text-xs font-bold text-slate-700 leading-relaxed print:text-[11px] print:font-normal">Instituído conforme Lei Federal nº 11.947/2009 e Resoluções do FNDE, servindo como registro oficial para auditorias do Tribunal de Contas e do CAE.</p>
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 space-y-4 print:p-6 print:rounded-2xl print:border-slate-300 print:bg-white">
                     <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center print:bg-slate-200 print:text-slate-900">
                        <Lock className="w-5 h-5" />
                     </div>
                     <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest print:text-slate-600">Segurança de Dados</h4>
                     <p className="text-xs font-bold text-emerald-900 leading-relaxed print:text-[11px] print:font-normal print:text-slate-700">Operação em conformidade com a LGPD (Lei 13.709/2018), protegendo dados sensíveis de saúde e informações pessoais de alunos e servidores.</p>
                  </div>
                  <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-4 print:p-6 print:rounded-2xl print:border-slate-300 print:bg-white">
                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center print:bg-slate-200 print:text-slate-900">
                        <CheckCircle className="w-5 h-5" />
                     </div>
                     <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest print:text-slate-600">Validade Administrativa</h4>
                     <p className="text-xs font-bold text-indigo-900 leading-relaxed print:text-[11px] print:font-normal print:text-slate-700">As confirmações digitais e assinaturas eletrônicas realizadas no sistema possuem valor probatório legal para fins de prestação de contas.</p>
                  </div>
               </div>

               <div className="p-10 bg-slate-900 text-white rounded-[48px] shadow-2xl overflow-hidden relative group print:p-8 print:rounded-3xl print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300 print:shadow-none">
                  <Shield className="absolute top-0 right-0 w-64 h-64 opacity-5 -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000 print:hidden" />
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                     <div className="space-y-4 max-w-xl">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 print:text-indigo-600">Responsabilidade do Operador</h4>
                        <p className="text-sm font-medium mt-3 leading-relaxed text-slate-300 print:text-xs print:text-slate-700">
                           O acesso ao sistema é pessoal e intransferível. Cada operação gera um registro de auditoria (Log) vinculado ao CPF do operador, estabelecendo responsabilidade funcional sobre as informações inseridas.
                        </p>
                     </div>
                     <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md print:bg-white print:border-slate-200">
                        <p className="text-[10px] font-black uppercase mb-2 print:text-slate-900">Dica de Segurança</p>
                        <p className="text-[10px] text-slate-400 leading-normal font-bold print:text-slate-600 print:font-normal">Nunca compartilhe sua senha. A integridade dos dados de estoque e consumo depende da correta identificação do responsável.</p>
                     </div>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'security_checklist',
         icon: Shield,
         title: 'Checklist de Segurança SME',
         roles: [UserRole.ADMIN, UserRole.NUTRICIONISTA, UserRole.SECRETARIA, UserRole.DIRETOR, UserRole.MERENDEIRA, UserRole.TECNICO],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[48px] relative overflow-hidden print:p-8 print:rounded-3xl print:bg-white print:border-slate-300">
                  <ShieldCheck className="absolute top-0 right-0 w-32 h-32 text-emerald-100 -mr-6 -mt-6 print:hidden" />
                  <div className="relative z-10 space-y-4">
                     <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100 print:text-slate-600">Compliance & Segurança</span>
                     <h3 className="text-3xl font-black text-slate-900 uppercase print:text-xl">Protocolo de Integridade Digital</h3>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl print:text-xs">
                        Para garantir a segurança dos dados e a conformidade com o FNDE, todos os operadores devem observar rigorosamente os seguintes critérios de segurança do NutriAssist SME.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-1 print:gap-3">
                  {[
                     { t: 'Acesso Individual', d: 'Identificação pessoal obrigatória para cada operador.' },
                     { t: 'Senha Intransferível', d: 'O titular é o único responsável legal pela sua senha.' },
                     { t: 'Troca Obrigatória', d: 'Redefinição de senha necessária no primeiro acesso.' },
                     { t: 'Critérios de Complexidade', d: 'Exigência de caracteres especiais, números e alternância de caixa.' },
                     { t: 'Bloqueio Preventivo', d: 'Navegação impedida até a definição de senha pessoal forte.' },
                     { t: 'Rastreabilidade Inicial', d: 'Registro automático de data/hora do primeiro acesso.' },
                     { t: 'Segregação de Perfis', d: 'Permissões restritas às competências de cada função.' },
                     { t: 'Restrição Regional', d: 'Acesso delimitado por unidade ou zona de atuação.' },
                     { t: 'Auditoria de Logs', d: 'Monitoramento contínuo de ações críticas em sistema.' },
                     { t: 'Sigilo de Dados', d: 'Proibição de compartilhamento de informações sensíveis.' },
                     { t: 'Conformidade LGPD', d: 'Proteção integral conforme a Lei Geral de Proteção de Dados.' }
                  ].map((item, i) => (
                     <div key={i} className="group p-6 bg-white border border-slate-100 rounded-[32px] hover:border-emerald-500 transition-all shadow-sm print:p-4 print:rounded-xl print:border-slate-300 print:shadow-none">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform print:bg-slate-100 print:text-slate-900 print:shadow-none">
                              <CheckCircle2 className="w-4 h-4" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{item.t}</p>
                              <p className="text-[9px] font-bold text-slate-400 leading-tight print:text-slate-700 print:font-normal">{item.d}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="p-8 bg-slate-900 text-white rounded-[40px] border border-slate-800 relative overflow-hidden print:p-6 print:rounded-2xl print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300">
                  <AlertTriangle className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-6 -mt-6 print:hidden" />
                  <div className="flex gap-6 items-start relative z-10">
                     <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-rose-900/20 print:bg-rose-100 print:text-rose-600 print:shadow-none">
                        <Lock className="w-6 h-6" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-rose-400 print:text-rose-600">Atenção: Responsabilidade Funcional</h4>
                        <p className="text-xs font-medium leading-relaxed text-slate-300 print:text-slate-700">
                           O descumprimento destes protocolos pode resultar em suspensão de acesso e apuração de responsabilidade administrativa, conforme diretrizes da SME e órgãos de fiscalização (TCE/CGU).
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'responsibility_term',
         icon: Gavel,
         title: 'Termo de Responsabilidade',
         roles: [UserRole.ADMIN, UserRole.NUTRICIONISTA, UserRole.SECRETARIA, UserRole.DIRETOR, UserRole.MERENDEIRA, UserRole.TECNICO],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-12 bg-slate-900 border border-slate-800 rounded-[56px] shadow-2xl relative group overflow-hidden print:p-8 print:rounded-3xl print:bg-white print:border-slate-300 print:text-slate-900">
                  <Gavel className="absolute top-0 right-0 w-64 h-64 text-white opacity-5 -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000 print:hidden" />
                  <div className="relative z-10 space-y-6">
                     <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100 print:text-slate-600">Declaração de Ciência</span>
                     <h3 className="text-3xl font-black text-white uppercase print:text-slate-900 print:text-xl">Termo de Responsabilidade<br />de Uso do Sistema</h3>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-xl print:text-slate-700 print:text-xs">
                        Ao acessar o Sistema NutriAssist SME, o operador declara ciência inequívoca de que o acesso é pessoal, intransferível e monitorado.
                     </p>
                  </div>
               </div>

               <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 print:mb-4">Compromissos do Operador</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                     {[
                        { t: 'Sigilo de Senha', d: 'Manter sigilo absoluto sobre sua senha de acesso.' },
                        { t: 'Intransferibilidade', d: 'Não compartilhar credenciais com terceiros ou colegas.' },
                        { t: 'Finalidade Institucional', d: 'Utilizar o sistema exclusivamente para fins de gestão do PNAE.' },
                        { t: 'Responsabilidade Legal', d: 'Responder administrativa e legalmente por ações realizadas com seu login.' }
                     ].map((item, i) => (
                        <div key={i} className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm flex flex-col gap-4 print:p-6 print:rounded-2xl print:border-slate-300">
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-5 h-5" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-xs font-black text-slate-900 uppercase leading-none">{item.t}</p>
                              <p className="text-xs text-slate-500 font-bold leading-relaxed print:text-slate-700 print:font-normal">{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="p-10 bg-rose-50 rounded-[44px] border border-rose-100 space-y-6 print:p-6 print:rounded-2xl print:bg-white print:border-slate-300">
                  <div className="flex items-center gap-3 text-rose-600">
                     <AlertTriangle className="w-6 h-6" />
                     <h5 className="text-xs font-black text-rose-900 uppercase tracking-widest">Responsabilização Jurídica</h5>
                  </div>
                  <p className="text-sm text-rose-800 font-bold leading-relaxed print:text-slate-700 print:font-normal">
                     O uso indevido das informações poderá resultar em responsabilização administrativa, civil e/ou penal, conforme a legislação vigente (Lei 13.709/2018 - LGPD e Decreto Lei 2.848/1940 - Código Penal).
                  </p>
                  <div className="pt-6 border-t border-rose-200">
                     <p className="text-[10px] font-black text-rose-400 uppercase italic">
                        "Declaro que li e concordo com os termos acima ao utilizar o NutriAssist SME."
                     </p>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'admin',
         icon: ShieldCheck,
         title: 'Administrador do Sistema',
         roles: [UserRole.ADMIN],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-12 bg-slate-900 border border-slate-800 rounded-[56px] shadow-2xl relative group overflow-hidden print:p-8 print:rounded-3xl print:bg-white print:border-slate-300 print:text-slate-900">
                  <div className="absolute top-0 right-0 p-12 text-white/5 transition-transform duration-1000 group-hover:scale-110 print:hidden">
                     <ShieldCheck className="w-48 h-48" />
                  </div>
                  <div className="max-w-xl space-y-6 relative z-10">
                     <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100 print:text-slate-600">Gestão e Governança</span>
                     <h4 className="text-3xl font-black text-white uppercase print:text-slate-900 print:text-lg leading-tight">Autoridade e Controle<br />do NutriAssist SME</h4>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed print:text-slate-700 print:text-xs">
                        O Administrador detém a visão sistêmica e a responsabilidade primária pela integridade do ecossistema de dados. Suas ações refletem diretamente na segurança e eficiência da alimentação escolar municipal.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 print:mb-4">Atribuições Principais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                     {[
                        { t: 'Gestão de Usuários', d: 'Cadastrar, editar e inativar usuários em todos os níveis.' },
                        { t: 'Controle de Acessos', d: 'Definir perfis (Admin, Diretor, Núcleo, Nutricionista).' },
                        { t: 'Vinculação Geográfica', d: 'Vincular usuários a unidades ou zonas escolares.' },
                        { t: 'Configuração Global', d: 'Gerenciar parâmetros e regras de negócio do sistema.' },
                        { t: 'Auditoria e Logs', d: 'Acompanhar logs de acesso e segurança em tempo real.' },
                        { t: 'Manutenção Crítica', d: 'Garantir o correto funcionamento e atualização do sistema.' }
                     ].map((item, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 print:p-4 print:rounded-xl print:border-slate-300">
                           <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{item.t}</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-tight print:text-slate-600">{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="p-10 bg-rose-50 rounded-[48px] border border-rose-100 space-y-8 print:p-8 print:rounded-3xl print:border-slate-300 print:bg-white">
                  <div className="flex items-center gap-4">
                     <AlertTriangle className="w-6 h-6 text-rose-600" />
                     <h5 className="text-xs font-black text-rose-900 uppercase tracking-widest print:text-slate-900">Responsabilidades Inegociáveis</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">Sigilo de Dados</p>
                        <p className="text-[10px] text-rose-800 leading-relaxed font-bold print:font-normal">Manter sigilo absoluto das informações sensíveis dos alunos e da rede municipal.</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">Credenciais</p>
                        <p className="text-[10px] text-rose-800 leading-relaxed font-bold print:font-normal">Proibido o compartilhamento de credenciais de acesso em qualquer circunstância.</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">Individualidade</p>
                        <p className="text-[10px] text-rose-800 leading-relaxed font-bold print:font-normal">Assegurar que cada operador utilize seu acesso individual para fins de rastreabilidade (Logs).</p>
                     </div>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'nutricionista',
         icon: Apple,
         title: 'Nutricionista (Resp. Técnica)',
         roles: [UserRole.NUTRICIONISTA, UserRole.ADMIN],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-12 bg-white border border-slate-100 rounded-[56px] shadow-sm relative group overflow-hidden print:p-8 print:rounded-3xl print:border-slate-300 print:shadow-none">
                  <div className="absolute top-0 right-0 p-12 text-indigo-50 transition-colors opacity-10 group-hover:opacity-20 print:hidden">
                     <Apple className="w-48 h-48" />
                  </div>
                  <div className="max-w-xl space-y-6 relative z-10">
                     <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100 print:text-slate-600">Responsabilidade Técnica</span>
                     <h4 className="text-3xl font-black text-slate-900 uppercase print:text-lg leading-tight">Planejamento e<br />Inteligência Nutricional</h4>
                     <p className="text-sm font-medium text-slate-600 leading-relaxed print:text-xs">
                        A Nutricionista (RT) é o pilar técnico da alimentação escolar. Sua atuação garante que o direito constitucional do aluno à alimentação de qualidade seja atendido com rigor científico e conformidade legal.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 print:mb-4">Atribuições Principais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                     {[
                        { t: 'Gestão de Cardápios', d: 'Elaborar cardápios balanceados por etapa e faixa etária.' },
                        { t: 'Controle de Estoque', d: 'Gerenciar o estoque central e monitorar o consumo real.' },
                        { t: 'Logística de Entrega', d: 'Planejar e registrar a entrega de gêneros às unidades.' },
                        { t: 'Vigilância Preventiva', d: 'Monitorar alertas de faltas recorrentes e riscos de zona.' },
                        { t: 'Análise de Indicadores', d: 'Analisar índices antropométricos e dados nutricionais.' },
                        { t: 'Relatórios FNDE', d: 'Emitir relatórios técnicos para prestação de contas PNAE.' }
                     ].map((item, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 print:p-4 print:rounded-xl print:border-slate-300">
                           <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{item.t}</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-tight print:text-slate-600">{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="p-10 bg-slate-900 text-white rounded-[48px] shadow-2xl relative overflow-hidden print:p-8 print:rounded-3xl print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300">
                  <div className="flex items-center gap-4 mb-8">
                     <Scale className="w-6 h-6 text-indigo-400" />
                     <h5 className="text-xs font-black text-white uppercase tracking-widest print:text-slate-900">Responsabilidades Legais PNAE</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Conformidade Legislativa</p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium print:text-slate-700">Garantir que todas as preparações e aquisições sigam rigorosamente a Lei 11.947/2009 e Resoluções do FNDE.</p>
                     </div>
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Atuação Preventiva</p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium print:text-slate-700">Agir proativamente sobre alertas de risco para evitar a interrupção da oferta de merenda ou queda na qualidade nutricional.</p>
                     </div>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'diretor',
         icon: Building2,
         title: 'Diretor Escolar & Unidade',
         roles: [UserRole.DIRETOR, UserRole.ADMIN],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-12 bg-white border border-slate-100 rounded-[56px] shadow-sm relative group overflow-hidden print:p-8 print:rounded-3xl print:border-slate-300 print:shadow-none">
                  <div className="absolute top-0 right-0 p-12 text-emerald-50 transition-colors opacity-10 group-hover:opacity-20 print:hidden">
                     <Truck className="w-48 h-48" />
                  </div>
                  <div className="max-w-xl space-y-6 relative z-10">
                     <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100 print:text-slate-600">Gestão Local e Unidade</span>
                     <h4 className="text-3xl font-black text-slate-900 uppercase print:text-lg leading-tight">Gestão da Alimentação<br />no Âmbito Escolar</h4>
                     <p className="text-sm font-medium text-slate-600 leading-relaxed print:text-xs">
                        O Diretor Escolar é a autoridade máxima de conformidade dentro da unidade. Sua atuação garante que o planejamento da SME seja executado com fidelidade e que os recursos cheguem corretamente ao prato do aluno.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 print:mb-4">Atribuições Principais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                     {[
                        { t: 'Conferência Digital', d: 'Validar o recebimento físico vs sistema das entregas de merenda.' },
                        { t: 'Auditoria de Estoque', d: 'Realizar inventário e conferência dos saldos na unidade.' },
                        { t: 'Registro de Alertas', d: 'Registrar itens em falta, em baixa ou com inconsistências.' },
                        { t: 'Pedido de Reposição', d: 'Solicitar reposição de insumos via fluxo oficial do sistema.' },
                        { t: 'Monitoramento Real-Time', d: 'Acompanhar o consumo diário e o cardápio executado na escola.' },
                        { t: 'Relatórios de Unidade', d: 'Emitir demonstrativos de consumo e aceitabilidade da escola.' }
                     ].map((item, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 print:p-4 print:rounded-xl print:border-slate-300">
                           <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{item.t}</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-tight print:text-slate-600">{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="p-10 bg-slate-50 rounded-[44px] border border-slate-100 space-y-6 print:p-6 print:rounded-2xl print:bg-white print:border-slate-300">
                  <div className="flex items-center gap-3 text-slate-400">
                     <Lock className="w-5 h-5" />
                     <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Política de Acesso e Segurança</h5>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8">
                     <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escopo de Visualização</p>
                        <p className="text-xs text-slate-700 font-bold leading-relaxed print:font-normal">
                           O acesso é restrito exclusivamente às unidades escolares sob sua responsabilidade, garantindo a privacidade dos dados das demais escolas da rede.
                        </p>
                     </div>
                     <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intercorrências</p>
                        <p className="text-xs text-slate-900 font-bold leading-relaxed print:font-normal">
                           Qualquer divergência física no estoque deve ser reportada imediatamente via sistema para evitar auditorias negativas (TCE/CAE).
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'nucleo',
         icon: UserCircle,
         title: 'Núcleo - Zona Escolar',
         roles: [UserRole.SECRETARIA, UserRole.ADMIN],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-12 bg-indigo-900 border border-indigo-800 rounded-[56px] shadow-2xl relative group overflow-hidden print:p-8 print:rounded-3xl print:bg-white print:border-slate-300 print:text-slate-900">
                  <div className="absolute top-0 right-0 p-12 text-white/5 transition-transform duration-1000 group-hover:scale-110 print:hidden">
                     <UserCircle className="w-48 h-48" />
                  </div>
                  <div className="max-w-xl space-y-6 relative z-10">
                     <span className="px-4 py-1.5 bg-white/10 text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100 print:text-slate-600">Gestão Intermediária Zonal</span>
                     <h4 className="text-3xl font-black text-white uppercase print:text-slate-900 print:text-lg leading-tight">Supervisão e Suporte<br />Regional da Rede</h4>
                     <p className="text-sm font-medium text-indigo-300 leading-relaxed print:text-slate-700 print:text-xs">
                        O Perfil Núcleo atua como o elo estratégico entre a SME e as unidades escolares. Sua missão é garantir a fluidez da merenda em zonas específicas, provendo suporte direto onde não há direção constituída.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 print:mb-4">Atribuições Principais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                     {[
                        { t: 'Gestão de Zona', d: 'Acompanhar integralmente todas as escolas da sua zona vinculada.' },
                        { t: 'Suporte à Entrega', d: 'Confirmar recebimento de merenda em escolas sem diretor.' },
                        { t: 'Auditoria Zonal', d: 'Realizar auditoria de estoque individualizada por escola.' },
                        { t: 'Controle de Inconsistências', d: 'Registrar faltas, excessos ou divergências físicas detectadas.' },
                        { t: 'Reposição Emergencial', d: 'Solicitar reposição de itens para unidades sob sua guarda.' },
                        { t: 'Inteligência Regional', d: 'Emitir relatórios consolidados de performance da zona escolar.' }
                     ].map((item, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 print:p-4 print:rounded-xl print:border-slate-300">
                           <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{item.t}</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-tight print:text-slate-600">{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 space-y-6 print:p-8 print:rounded-3xl print:bg-white print:border-slate-300">
                  <div className="flex items-center gap-3 text-indigo-400">
                     <AlertTriangle className="w-5 h-5" />
                     <h5 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Protocolo de Limitação Regional</h5>
                  </div>
                  <p className="text-xs text-indigo-800 font-bold leading-relaxed print:text-slate-700 print:font-normal">
                     O acesso aos dados, estoques e relatórios é restrito exclusivamente às escolas pertencentes à zona escolar vinculada no perfil do usuário. Para visualização global da rede, é necessária autorização do perfil Administrador.
                  </p>
               </div>
            </div>
         )
      },
      {
         id: 'merendeira',
         icon: Utensils,
         title: 'Equipe de Cozinha & Terminal',
         roles: [UserRole.MERENDEIRA, UserRole.ADMIN],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="flex flex-col md:flex-row gap-12 items-center print:gap-6">
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-amber-100 text-amber-600 rounded-[56px] flex items-center justify-center shadow-2xl shrink-0 print:w-20 print:h-20 print:rounded-2xl print:shadow-none print:bg-slate-100 print:text-slate-900">
                     <Utensils className="w-16 h-16 md:w-24 md:h-24 print:w-10 print:h-10" />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter print:text-xl">Terminal da Merendeira</h4>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl print:text-xs">
                        Interface simplificada para uso diário na cozinha. O registro aqui realizado alimenta automaticamente o balanço de massa do estoque da escola.
                     </p>
                  </div>
               </div>

               <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm space-y-10 print:p-0 print:border-none">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-1 print:gap-4">
                     {[
                        { t: 'Consulta do Cardápio', d: 'Veja as preparações e ingredientes previstos para o dia.' },
                        { t: 'Registro de Alunos', d: 'Informe o número exato de alunos atendidos por refeição.' },
                        { t: 'Baixa de Insumos', d: 'Insumos baixados do estoque local proporcionalmente ao consumo.' }
                     ].map((item, i) => (
                        <div key={i} className="space-y-3 flex items-start gap-4 md:block">
                           <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black shrink-0 print:bg-slate-200 print:text-slate-900 print:w-8 print:h-8 print:text-xs">{i + 1}</div>
                           <div className="space-y-1">
                              <h5 className="text-xs font-black text-slate-900 uppercase print:text-[11px]">{item.t}</h5>
                              <p className="text-[10px] text-slate-500 font-bold leading-relaxed print:text-slate-700 print:font-normal">{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="p-8 bg-slate-900 text-white rounded-[40px] relative overflow-hidden print:p-6 print:rounded-2xl print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300">
                     <AlertTriangle className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-6 -mt-6 print:hidden" />
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2 print:text-amber-700">Prazos de Registro</h4>
                     <p className="text-xs font-medium leading-relaxed print:text-[11px] print:font-normal">O registro deve ser feito logo após o término da distribuição da refeição para viabilizar o ajuste logístico em tempo real.</p>
                  </div>
               </div>
            </div>
         )
      },
      {
         id: 'gestao',
         icon: TrendingUp,
         title: 'SME, CAE & Gestão Estratégica',
         roles: [UserRole.SECRETARIA, UserRole.TECNICO, UserRole.ADMIN],
         content: (
            <div className="space-y-12 print:space-y-8">
               <div className="p-12 bg-slate-900 text-white rounded-[64px] shadow-2xl relative overflow-hidden group print:p-8 print:rounded-3xl print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300 print:shadow-none">
                  <TrendingUp className="absolute top-0 right-0 w-64 h-64 opacity-5 -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000 print:hidden" />
                  <div className="relative z-10 space-y-6 print:space-y-2">
                     <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest print:hidden">Gestão de Governança</span>
                     <h3 className="text-3xl font-black uppercase tracking-tighter max-w-lg print:text-xl">Visão Consolidada da Política Pública</h3>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl print:text-slate-700 print:text-xs">
                        Ferramenta de apoio estratégico para monitoramento do PNAE em toda a rede municipal, atendendo ao CAE e FNDE.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1 print:gap-4">
                  <div className="p-10 bg-white border border-slate-100 rounded-[44px] shadow-sm space-y-6 print:p-6 print:rounded-2xl print:border-slate-300">
                     <div className="flex items-center gap-4">
                        <ClipboardCheck className="text-slate-400 w-8 h-8 print:w-5 print:h-5" />
                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest print:text-[11px]">Prestação de Contas</h5>
                     </div>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed print:text-slate-700">
                        Relatórios que fornecem o detalhamento de consumo e agricultura familiar, servindo de suporte para o parecer anual do CAE.
                     </p>
                  </div>
                  <div className="p-10 bg-white border border-slate-100 rounded-[44px] shadow-sm space-y-6 print:p-6 print:rounded-2xl print:border-slate-300">
                     <div className="flex items-center gap-4">
                        <ShieldCheck className="text-slate-400 w-8 h-8 print:w-5 print:h-5" />
                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest print:text-[11px]">Compliance Normativo</h5>
                     </div>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed print:text-slate-700">
                        Monitoramento da aceitabilidade dos cardápios e garantia da execução fiel do planejamento nutricional.
                     </p>
                  </div>
               </div>
            </div>
         )
      }
   ];

   const currentProfileRole = activeProfile?.role || UserRole.ADMIN;

   const visibleSections = sections.filter(s =>
      currentProfileRole === UserRole.ADMIN || s.roles.includes(currentProfileRole) || s.id === 'intro'
   );

   const currentSection = visibleSections.find(s => s.id === activeSection) || visibleSections[0];

   return (
      <div className="page-transition w-full animate-in fade-in duration-500 bg-white min-h-[calc(100vh-140px)]">
         <style>
            {`
                @media print {
                    @page {
                        margin: 20mm 15mm 20mm 15mm;
                        size: A4 portrait;
                    }
                    .no-print { display: none !important; }
                    .print-only { 
                        display: block !important; 
                        position: relative !important;
                        width: 100% !important;
                        color: #0f172a !important;
                    }
                    body, html, #root, .flex.h-screen, main, .page-transition {
                        height: auto !important;
                        overflow: visible !important;
                        position: static !important;
                        display: block !important;
                        background: white !important;
                    }
                    .manual-page { 
                        page-break-after: auto !important; 
                        break-after: auto !important;
                        padding-bottom: 40px;
                        background: white !important;
                    }
                    .section-break {
                        break-before: page;
                        padding-top: 20px;
                    }
                    .card-no-break {
                        break-inside: avoid;
                    }
                    h3, h4, h5 {
                        break-after: avoid;
                    }
                    p, ul, li {
                        break-inside: auto;
                    }
                    /* Custom Scrollbar and shadows disable for print */
                    * { 
                        box-shadow: none !important; 
                        text-shadow: none !important;
                        transition: none !important;
                    }
                }
                .print-only { display: none; }
                `}
         </style>

         {/* VISUAL PAGE CONTENT (NO-PRINT) */}
         <div className="no-print">
            <div className="bg-white w-full rounded-[40px] shadow-xl border border-slate-100 flex flex-col overflow-hidden h-full">

               {/* HEADER */}
               <div className="p-8 lg:px-12 bg-white border-b border-slate-50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-7 h-7" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Manual de Operação e Governança</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">NutriAssist SME • Protocolo v2.6 • Edição Institucional</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <button
                        onClick={() => window.print()}
                        className="flex items-center gap-3 px-8 py-5 bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                     >
                        <FileSpreadsheet className="w-5 h-5" /> Exportar Manual Profissional (PDF)
                     </button>
                     <button
                        onClick={onClose}
                        className="p-4 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
                     >
                        <X size={24} />
                     </button>
                  </div>
               </div>

               <div className="flex flex-1 min-h-[70vh] overflow-hidden">
                  {/* NAV */}
                  <div className="w-24 lg:w-80 bg-slate-50/50 border-r border-slate-100 flex flex-col p-6 lg:p-10 space-y-2 overflow-y-auto shrink-0 scrolling-touch scrollbar-hide">
                     <p className="hidden lg:block text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Conteúdo Programático</p>
                     {visibleSections.map(s => {
                        const Icon = s.icon;
                        const isActive = activeSection === s.id;
                        return (
                           <button
                              key={s.id}
                              onClick={() => setActiveSection(s.id)}
                              className={`flex items-center gap-4 p-4 lg:p-6 rounded-3xl transition-all group relative ${isActive ? 'bg-slate-900 text-white shadow-2xl' : 'hover:bg-white text-slate-400 hover:text-slate-800'}`}
                           >
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-white/10' : 'bg-slate-100 group-hover:scale-110'}`}>
                                 <Icon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-6" />
                              </div>
                              <span className="hidden lg:block text-xs font-black uppercase tracking-tight text-left leading-tight">{s.title}</span>
                              {isActive && (
                                 <div className="absolute -right-1 w-1.5 h-6 bg-indigo-500 rounded-full" />
                              )}
                           </button>
                        );
                     })}

                     <div className="mt-auto hidden lg:block p-8 bg-indigo-50/50 border border-indigo-100/50 rounded-[32px] relative overflow-hidden group">
                        <HelpCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/10 group-hover:scale-110 transition-transform" />
                        <h6 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Navigation className="w-3 h-3" /> Suporte SME
                        </h6>
                        <p className="text-[10px] font-bold text-indigo-600 leading-relaxed">Em caso de dúvidas técnicas, consulte o Gabinete da Secretaria de Educação.</p>
                     </div>
                  </div>

                  {/* CONTENT AREA */}
                  <div className="flex-1 bg-white p-8 lg:p-20 overflow-y-auto custom-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:32px_32px]">
                     <div className="max-w-4xl mx-auto">
                        <div className="mb-16 border-b-2 border-slate-50 pb-12">
                           <span className="px-4 py-2 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-lg tracking-widest mb-6 inline-block">Protocolo Técnico Institucional</span>
                           <h3 className="text-4xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">{currentSection.title}</h3>
                        </div>
                        <div className="manual-content-body transition-all duration-500 animate-in slide-in-from-bottom-4">
                           {currentSection.content}
                        </div>

                        <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">SME</div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 uppercase">Secretaria Municipal de Educação</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brotas de Macaúbas • 2026</p>
                              </div>
                           </div>
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                              Certificado NutriAssist v2.5
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* PRINT-ONLY CONTAINER (FLUID DESIGN) */}
         <div className="print-only font-serif text-slate-900">
            {/* PDF COVER (First Page Item) */}
            <div className="manual-page text-center pt-20 pb-40 border-b-4 border-slate-900 mb-20">
               <div className="text-4xl mb-6">🥗</div>
               <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">NutriAssist SME</h1>
               <h2 className="text-xl font-bold uppercase tracking-widest text-slate-600 mb-20">Manual Operador de Gestão e Governança</h2>
               <div className="space-y-2 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                  <p>Secretaria Municipal de Educação</p>
                  <p>Prefeitura de Brotas de Macaúbas — Bahia</p>
                  <p className="pt-10">Protocolo Técnico v2.5 • Edição 2026</p>
               </div>
            </div>

            {visibleSections.map((s, idx) => (
               <div key={s.id} className="manual-page card-no-break">
                  {/* HEADER PER SECTION (SIMULATED HEADER) */}
                  <div className="flex justify-between items-end border-b border-slate-300 pb-4 mb-10 opacity-60">
                     <span className="text-[9px] font-black uppercase tracking-widest">Manual Institucional • NutriAssist SME</span>
                     <span className="text-[9px] font-bold">Módulo: {s.title}</span>
                  </div>

                  <div className="mb-10">
                     <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none mb-2">{s.title}</h3>
                     <div className="w-12 h-1.5 bg-indigo-600 rounded-full"></div>
                  </div>

                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                     {s.content}
                  </div>

                  {/* FOOTER PER SECTION (SIMULATED FOOTER) */}
                  <div className="flex justify-between items-center mt-12 pt-4 border-t border-slate-100 opacity-40">
                     <span className="text-[8px] font-bold uppercase text-slate-500 italic">NutriAssist SME — Sistema Homologado FNDE/PNAE</span>
                     <span className="text-[8px] font-black uppercase tracking-widest">Pág. {idx + 1} de {visibleSections.length}</span>
                  </div>
               </div>
            ))}

            {/* FINAL AUTHENTICATION PAGE */}
            <div className="manual-page section-break card-no-break">
               <div className="bg-slate-50 p-12 rounded-3xl border border-slate-200 text-center space-y-8">
                  <div className="flex justify-center mb-6">
                     <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center text-4xl shadow-inner italic">SME</div>
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Termo de Ciência de Uso</h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-medium px-10">
                     Este manual é propriedade da SME de Brotas de Macaúbas. O uso dos fluxos aqui descritos é imperativo para a conformidade legal do Programa Nacional de Alimentação Escolar (PNAE). Os registros gerados em sistema possuem validade jurídica probatória.
                  </p>
                  <div className="pt-20 grid grid-cols-2 gap-20 px-20">
                     <div className="border-t border-slate-400 pt-3">
                        <p className="text-[8px] font-black uppercase tracking-widest">Responsável Técnico (RT)</p>
                     </div>
                     <div className="border-t border-slate-400 pt-3">
                        <p className="text-[8px] font-black uppercase tracking-widest">Secretário(a) de Educação</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default UserManual;
