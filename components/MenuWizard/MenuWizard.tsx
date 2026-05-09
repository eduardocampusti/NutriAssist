import React, { useState } from 'react';
import { MenuPlan, UserProfile, School, InventoryItem, DocStatus, EducationalStage } from '../../types';
import { generateId } from '../../utils/id';
import { Step1_Identification } from './Step1_Identification';
import { Step2_Composition } from './Step2_Composition';
import { Step3_Review } from './Step3_Review';
import { Step4_Approval } from './Step4_Approval';
import { useToast } from '../../contexts/ToastContext';

interface MenuWizardProps {
    schools: School[];
    inventory: InventoryItem[];
    activeProfile?: UserProfile;
    initialPlan?: Partial<MenuPlan>;
    onSave: (plan: MenuPlan) => Promise<void>;
    onClose: () => void;
}

const MenuWizard: React.FC<MenuWizardProps> = ({ schools, inventory, activeProfile, initialPlan, onSave, onClose }) => {
    const { addToast } = useToast();
    const [step, setStep] = useState(1);

    // Editor State
    const [plan, setPlan] = useState<Partial<MenuPlan>>(initialPlan || {
        titulo: '',
        escolaId: '',
        etapa: EducationalStage.FUNDAMENTAL_I,
        numAlunos: 0,
        preparacoes: [],
        diasLetivos: 20,
        periodo: 'SEMANAL',
        status: DocStatus.ELABORACAO,
        authorId: activeProfile?.id
    });

    const [isStep3Valid, setIsStep3Valid] = useState(false);

    // Navigation Logic
    const nextStep = () => {
        if (step === 1) {
            // Validate Step 1
            const missing = [];
            if (!plan.titulo) missing.push("Título");
            if (!plan.escolaId) missing.push("Escola");
            if (!plan.etapa) missing.push("Modalidade");
            if (!plan.faixaEtariaMinMeses) missing.push("Idade Mínima");
            if (!plan.faixaEtariaMaxMeses) missing.push("Idade Máxima");

            if (missing.length > 0) {
                addToast(`Campos obrigatórios ausentes: ${missing.join(', ')}`, 'error');
                return;
            }
        }
        if (step === 2) {
            if (!plan.preparacoes || plan.preparacoes.length === 0) {
                addToast("Adicione pelo menos uma preparação.", 'warning');
                return;
            }
        }
        if (step === 3 && !isStep3Valid) {
            addToast("Corrija as pendências antes de avançar.", 'error');
            return;
        }

        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => Math.max(1, prev - 1));

    const handleSubmit = async (status: DocStatus, obs?: string) => {
        // Construct Final Object
        const finalPlan = {
            ...plan,
            id: plan.id || generateId(),
            status: status,
            created_at: plan.created_at || Date.now(),
            authorId: plan.authorId || activeProfile?.id || 'system'
            // We might save 'obs' in a separate log or history field in a real DB
        } as MenuPlan;

        await onSave(finalPlan);
        onClose();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-[#f8fafc]">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500">✕</button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase">Assistente de Cardápio</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                            ))}
                            <span className="text-[10px] font-bold text-slate-400 ml-2">ETAPA {step} DE 4</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    {step > 1 && (
                        <button onClick={prevStep} className="text-slate-500 font-bold text-xs uppercase hover:text-slate-800">Voltar</button>
                    )}
                    {step < 4 && (
                        <button onClick={nextStep} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg hover:bg-black hover:scale-105 transition-all">
                            Próxima Etapa →
                        </button>
                    )}
                </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto">
                    {step === 1 && <Step1_Identification plan={plan} schools={schools} onChange={u => setPlan(prev => ({ ...prev, ...u }))} />}
                    {step === 2 && <Step2_Composition plan={plan} inventory={inventory} onChange={u => setPlan(prev => ({ ...prev, ...u }))} />}
                    {step === 3 && <Step3_Review plan={plan as MenuPlan} inventory={inventory} onChange={u => setPlan(prev => ({ ...prev, ...u }))} onValidationChange={setIsStep3Valid} />}
                    {step === 4 && <Step4_Approval status={plan.status || DocStatus.ELABORACAO} activeProfile={activeProfile} onSubmit={handleSubmit} />}
                </div>
            </div>
        </div>
    );
};

export default MenuWizard;
