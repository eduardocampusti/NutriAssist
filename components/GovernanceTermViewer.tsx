
import React from 'react';
import { useUsers } from '../contexts/UserContext';
import { Printer, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GovernanceTermViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

const GovernanceTermViewer: React.FC<GovernanceTermViewerProps> = ({ isOpen, onClose }) => {
    const { activeProfile } = useUsers();

    if (!isOpen) return null;

    const termContent = `
# TERMO DE CIÊNCIA E GOVERNANÇA
## SISTEMA NUTRIASSIST SME

Eu, **${activeProfile?.nome || '_______________________________________'}**, no exercício do cargo de Secretária Municipal de Educação, declaro que estou ciente do funcionamento, dos objetivos e dos limites de atuação do Sistema NutriAssist SME, utilizado para a gestão da alimentação escolar da rede municipal de ensino.

Declaro ciência de que:

I – O Sistema NutriAssist SME é instrumento oficial de planejamento, monitoramento, controle e transparência da alimentação escolar, em conformidade com o Programa Nacional de Alimentação Escolar – PNAE;

II – O perfil da Secretária Municipal de Educação possui caráter estratégico, gerencial e supervisor, não contemplando a execução direta de operações como lançamento de estoque, confirmação de recebimentos ou registros de consumo;

III – As informações acessadas por meio do painel executivo e dos relatórios consolidados destinam-se à tomada de decisão, à supervisão institucional, à prestação de contas e ao fortalecimento da governança pública;

IV – A responsabilidade técnica pelas decisões nutricionais cabe à Nutricionista Responsável Técnica, e a responsabilidade operacional cabe às unidades escolares e setores designados;

V – O uso do sistema observa os princípios da legalidade, impessoalidade, moralidade, publicidade, eficiência e proteção de dados, em consonância com a legislação vigente e a Lei Geral de Proteção de Dados – LGPD.

Comprometo-me a utilizar as informações do sistema de forma ética, institucional e responsável, zelando pela transparência, pelo interesse público e pela correta aplicação dos recursos da alimentação escolar.

Local e data: **${new Date().toLocaleDateString('pt-BR')}**

_________________________________  
**Assinatura**
    `;

    const handlePrint = () => {
        const printContent = document.getElementById('governance-term-content');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Simple reload to restore app state after print hack
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl h-[90vh] rounded-[32px] shadow-2xl flex flex-col relative overflow-hidden">
                <div className="absolute top-6 right-6 flex gap-2 z-10 no-print">
                    <button
                        onClick={handlePrint}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                        title="Imprimir"
                    >
                        <Printer size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar" id="governance-term-content">
                    <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-p:text-justify prose-li:text-justify">
                        <div className="text-center mb-10">
                            <img src="/brasao.png" alt="Brasão" className="h-20 mx-auto mb-4 opacity-50 grayscale" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secretaria Municipal de Educação</p>
                        </div>
                        <ReactMarkdown>{termContent}</ReactMarkdown>
                    </div>
                </div>
            </div>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                    #governance-term-content { padding: 40px !important; }
                }
            `}</style>
        </div>
    );
};

export default GovernanceTermViewer;
