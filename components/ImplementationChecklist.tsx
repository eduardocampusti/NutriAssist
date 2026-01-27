
import React, { useState } from 'react';

interface Task {
  id: string;
  category: 'Administrativa' | 'Organizacional' | 'Operacional' | 'Capacitação' | 'Validação' | 'Oficialização';
  label: string;
  completed: boolean;
}

const ImplementationChecklist: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', category: 'Administrativa', label: 'Definição do administrador oficial do sistema na SEMED', completed: false },
    { id: '2', category: 'Administrativa', label: 'Publicação da Portaria de implantação no Diário Oficial', completed: false },
    { id: '3', category: 'Administrativa', label: 'Configuração do Papel Timbrado Institucional oficial', completed: false },
    { id: '4', category: 'Organizacional', label: 'Criação dos usuários para todas as Nutricionistas da rede', completed: false },
    { id: '5', category: 'Organizacional', label: 'Definição do fluxo de aprovação técnica (quem revisa quem)', completed: false },
    { id: '6', category: 'Operacional', label: 'Validação dos modelos de Parecer e Ofício com a equipe técnica', completed: false },
    { id: '7', category: 'Operacional', label: 'Configuração da rotina de conferência de backup', completed: false },
    { id: '8', category: 'Capacitação', label: 'Realização de treinamento prático com as Nutricionistas RT', completed: false },
    { id: '9', category: 'Capacitação', label: 'Distribuição do Manual do Usuário para toda a equipe', completed: false },
    { id: '10', category: 'Validação', label: 'Teste real de geração de 5 documentos oficiais no sistema', completed: false },
    { id: '11', category: 'Validação', label: 'Conferência de compatibilidade da impressão do timbrado', completed: false },
    { id: '12', category: 'Oficialização', label: 'Comunicação interna a todas as escolas sobre o novo sistema', completed: false },
    { id: '13', category: 'Oficialização', label: 'Início do uso institucional obrigatório para todos os atos PNAE', completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const categories = Array.from(new Set(tasks.map(t => t.category)));
  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* BARRA DE CONTROLE */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-20 flex justify-between items-center">
        <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
          <span>✅</span> Painel de Acompanhamento de Implantação
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
        {/* PROGRESS HEADER */}
        <div className="bg-slate-900 p-12 text-white space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight">Checklist de Ativação</h1>
              <p className="text-slate-400 text-sm max-w-xl">Roteiro operacional para garantir a conformidade institucional e técnica na implantação do NutriAssist.</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-emerald-400">{progress}%</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Concluído</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* TASKS LIST */}
        <div className="p-8 lg:p-12 space-y-12 bg-slate-50/50">
          {categories.map(cat => (
            <section key={cat} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                <span>📁</span> Etapa {cat}
              </h3>
              <div className="space-y-2">
                {tasks.filter(t => t.category === cat).map(task => (
                  <button 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
                      task.completed 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-blue-500'
                    }`}>
                      {task.completed && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-sm font-bold leading-tight">{task.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FINAL STATUS */}
        <div className="p-12 border-t border-slate-100 bg-white">
           <div className={`p-8 rounded-3xl text-center space-y-4 transition-all ${progress === 100 ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
              <span className="text-4xl">{progress === 100 ? '🎊' : '⏳'}</span>
              <h4 className="text-lg font-black uppercase">{progress === 100 ? 'Pronto para o Uso Oficial!' : 'Implantação em Andamento'}</h4>
              <p className="text-xs max-w-md mx-auto opacity-80">
                {progress === 100 
                  ? 'Todas as etapas foram cumpridas. O sistema NutriAssist está oficialmente implantado e validado para a gestão da alimentação escolar em Brotas de Macaúbas.'
                  : 'Certifique-se de que todos os itens acima sejam marcados antes de iniciar o uso obrigatório do sistema em toda a rede.'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImplementationChecklist;
