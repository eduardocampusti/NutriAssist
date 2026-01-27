
import React from 'react';

interface MigrationGuideProps {
  onClose: () => void;
}

const MigrationGuide: React.FC<MigrationGuideProps> = ({ onClose }) => {
  const steps = [
    {
      id: 1,
      title: "Preparação do Projeto",
      desc: "Identificar todos os dados que atualmente estão salvos apenas no navegador dos usuários (computador local) para garantir que nada seja perdido na transição.",
      icon: "📋"
    },
    {
      id: 2,
      title: "Criação do Projeto no Supabase",
      desc: "Criar uma conta oficial da Secretaria no Supabase.com e configurar o novo 'servidor na nuvem' que guardará as informações de forma centralizada.",
      icon: "🌩️"
    },
    {
      id: 3,
      title: "Estruturação do Banco de Dados",
      desc: "Criar as 'pastas digitais' (tabelas) dentro do Supabase para receber as informações de escolas, usuários, estoque e documentos.",
      icon: "🏗️"
    },
    {
      id: 4,
      title: "Migração dos Usuários",
      desc: "Cadastrar os servidores no novo sistema de login seguro, permitindo que cada um acesse com seu próprio e-mail e senha institucional.",
      icon: "👥"
    },
    {
      id: 5,
      title: "Migração dos Documentos",
      desc: "Transferir os rascunhos e documentos arquivados do armazenamento local para o banco de dados online, tornando-os acessíveis de qualquer lugar.",
      icon: "📄"
    },
    {
      id: 6,
      title: "Migração do Controle de Estoque",
      desc: "Sincronizar os saldos atuais de alimentos e o histórico de entradas e saídas para que o almoxarifado passe a ser gerido em tempo real.",
      icon: "📦"
    },
    {
      id: 7,
      title: "Migração dos Relatórios",
      desc: "Configurar os painéis de gestão para lerem os dados diretamente da nuvem, garantindo que os gráficos reflitam as informações mais recentes de toda a rede.",
      icon: "📊"
    },
    {
      id: 8,
      title: "Segurança e Controle de Acesso",
      desc: "Ativar as regras de proteção que garantem que apenas Nutricionistas vejam dados sensíveis e que Técnicos validem apenas o que lhes compete.",
      icon: "🛡️"
    },
    {
      id: 9,
      title: "Testes e Validação",
      desc: "Realizar uma semana de uso experimental por uma equipe reduzida para verificar se a salvaguarda de dados na nuvem está ocorrendo sem erros.",
      icon: "🧪"
    },
    {
      id: 10,
      title: "Início do Uso Oficial",
      desc: "Desativar o armazenamento local e oficializar o Supabase como a única fonte da verdade para a Alimentação Escolar do município.",
      icon: "🏁"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* BARRA DE CONTROLE */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-20 flex justify-between items-center">
        <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
          <span>🚀</span> Planejamento de Evolução Tecnológica
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
        {/* HERO SECTION */}
        <div className="bg-slate-900 p-12 text-white text-center space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tight">Roteiro de Migração: Supabase</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Guia instrutivo para transição do sistema atual para uma infraestrutura de nuvem centralizada, 
            garantindo maior segurança, colaboração em tempo real e imutabilidade de dados oficiais.
          </p>
        </div>

        {/* STEPS TIMELINE */}
        <div className="p-8 lg:p-16 space-y-12 bg-slate-50/50">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex gap-8 items-start group">
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-7 top-14 w-0.5 h-16 bg-slate-200 group-hover:bg-blue-200 transition-colors"></div>
              )}
              
              {/* Step Number Circle */}
              <div className="flex-shrink-0 w-14 h-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-xl shadow-sm z-10 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                {step.icon}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">Passo {step.id}</span>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{step.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FINAL NOTE */}
        <div className="p-12 border-t border-slate-100 bg-white">
           <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl flex items-start gap-6">
              <span className="text-3xl">💡</span>
              <div className="space-y-2">
                <h4 className="text-sm font-black text-blue-900 uppercase">Por que migrar para o Supabase?</h4>
                <p className="text-xs text-blue-800 leading-relaxed italic">
                  "Atualmente, os dados residem apenas no navegador de quem os criou. Com a migração, a Secretaria de Educação passa a ter um 'Cérebro Central' online. Isso significa que se um computador estragar, nenhum dado é perdido. Além disso, o Nutricionista RT pode iniciar um parecer na Secretaria e finalizá-lo em visita técnica, com sincronização imediata."
                </p>
              </div>
           </div>
           
           <div className="mt-12 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Compromisso com a Inovação Pública</p>
              <p className="text-[10px] text-slate-500 italic max-w-xl mx-auto">
                Este plano deve ser executado por equipe técnica especializada em tecnologia da informação, sob supervisão direta da Gerência de Nutrição Escolar.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationGuide;
