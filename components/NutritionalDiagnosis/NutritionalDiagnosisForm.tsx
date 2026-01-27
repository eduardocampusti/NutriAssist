
import React, { useState, useEffect } from 'react';
import { UserProfile, Student, SisvanClassification, EvaluationPurpose } from '../../types';
import { nutritionalService } from '../../services/nutritionalService';
import { useToast } from '../../contexts/ToastContext';
import { OfficialDocumentViewer } from '../OfficialDocumentViewer';
import { FileText, Save, Calculator, AlertCircle, CheckCircle, Activity, Stethoscope, Utensils, ClipboardList, ChevronRight } from 'lucide-react';

interface NutritionalDiagnosisFormProps {
    student: Student;
    activeProfile: UserProfile;
    onClose: () => void;
    onSaveSuccess: () => void;
}

type Tab = 'ANTROPOMETRIA' | 'ANAMNESE' | 'EXAME_FISICO' | 'PARECER';

export const NutritionalDiagnosisForm: React.FC<NutritionalDiagnosisFormProps> = ({ student, activeProfile, onClose, onSaveSuccess }) => {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<Tab>('ANTROPOMETRIA');

    // 1. Anthropometry
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [bmi, setBmi] = useState<number>(0);
    const [classification, setClassification] = useState<SisvanClassification | null>(null);

    // 2. Anamnesis / Food Consumption
    const [anamnesis, setAnamnesis] = useState({
        frutas: 'SEMANAL',
        verduras: 'RARO',
        leguminosas: 'DIARIO',
        ultraprocessados: 'SEMANAL',
        agua: '1-2L',
        cafeDaManha: true,
        medicamentos: '',
        historicoFamiliar: ''
    });

    // 3. Physical Exam (Sinais Clínicos)
    const [physicalExam, setPhysicalExam] = useState({
        cabelo: 'BRILHOSO',
        unhas: 'NORMAIS',
        pele: 'HIDRATADA',
        mucosas: 'CORADAS',
        abdomen: 'PLANO',
        denticao: 'COMPLETA'
    });

    // 4. Clinical Conditions
    const [conditions, setConditions] = useState<string[]>([]);
    const [conditionInput, setConditionInput] = useState('');

    // 5. Diagnosis & Plan
    const [recommendations, setRecommendations] = useState('');
    const [technicalOpinion, setTechnicalOpinion] = useState('');
    const [purpose, setPurpose] = useState<EvaluationPurpose>(EvaluationPurpose.VIGILANCIA);
    const [encaminhamentos, setEncaminhamentos] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [showPdf, setShowPdf] = useState(false);
    const [pdfContent, setPdfContent] = useState<any>(null);

    // --- EFFECTS ---

    // BMI Calculation
    useEffect(() => {
        const w = parseFloat(weight.replace(',', '.'));
        const h = parseFloat(height.replace(',', '.'));

        if (w > 0 && h > 0) {
            const calculatedBmi = nutritionalService.calculateBMI(w, h);
            setBmi(calculatedBmi);
            // Mock Age/Gender for prototype (Should come from student prop)
            const ageMonths = 120;
            const cls = nutritionalService.classifyBMI(calculatedBmi, ageMonths, 'M');
            setClassification(cls);
        } else {
            setBmi(0);
            setClassification(null);
        }
    }, [weight, height]);

    // Enhanced Auto-Opinion Generator
    useEffect(() => {
        if (classification) {
            // Build a rich text based on all collected data
            let text = `AVALIAÇÃO NUTRICIONAL COMPLETA\n\n`;

            // Antropometria
            text += `1. DIAGNÓSTICO ANTROPOMÉTRICO\n`;
            text += `O aluno apresenta IMC de ${bmi} kg/m², classificado como ${classification.replace(/_/g, ' ')} segundo curvas da OMS.\n\n`;

            // Anamnese
            text += `2. ANÁLISE DO CONSUMO ALIMENTAR\n`;
            text += `Relata consumo ${anamnesis.frutas.toLowerCase()} de frutas e ${anamnesis.verduras.toLowerCase()} de verduras. `;
            text += `Consumo de ultraprocessados é ${anamnesis.ultraprocessados.toLowerCase()}. `;
            text += anamnesis.cafeDaManha ? "Realiza café da manhã regularmente.\n\n" : "Pula o café da manhã regularmente.\n\n";

            // Exame Físico
            text += `3. AVALIAÇÃO CLÍNICA\n`;
            text += `Apresenta pele ${physicalExam.pele.toLowerCase()}, mucosas ${physicalExam.mucosas.toLowerCase()} e cabelos ${physicalExam.cabelo.toLowerCase()}.\n\n`;

            // Conclusão
            text += `4. PARECER TÉCNICO FINAL\n`;
            if (classification === SisvanClassification.EUTROFIA) {
                text += "Estado nutricional adequado. Incentivar manutenção de hábitos saudáveis.";
            } else if (classification.includes('OBESIDADE') || classification.includes('SOBREPESO')) {
                text += "Identificado risco nutricional para excesso de peso. Necessária adequação qualitativa da dieta e aumento de atividade física.";
            } else {
                text += "Identificado risco nutricional para magreza. Necessário investigação de insegurança alimentar ou causas clínicas base.";
            }

            setTechnicalOpinion(text);
        }
    }, [classification, activeTab]); // Update logic when moving tabs/data changes


    // --- HANDLERS ---

    const handleSave = async () => {
        const w = parseFloat(weight.replace(',', '.'));
        const h = parseFloat(height.replace(',', '.'));

        if (!classification || w <= 0 || h <= 0) {
            alert("Dados antropométricos obrigatórios incompletos.");
            return;
        }

        setIsLoading(true);
        try {
            // Save logic would go here mapping all new fields to DB
            // allow implementation in next step if required, for now using previous service signature and expanding later
            const savedData = await nutritionalService.saveAssessment({
                alunoId: student.id,
                nutricionistaId: activeProfile.id,
                peso: w,
                estatura: h,
                imc: bmi,
                classificacaoImc: classification,
                condicoesClinicas: conditions,
                parecerTecnico: technicalOpinion,
                recomendacoes: recommendations,
                finalidade: purpose,
                dataAfericao: new Date().toISOString(),
                // Extended fields would be passed here once service is updated
            });

            const { documentGenerator } = await import('../../services/documentGeneratorService');
            const docContent = documentGenerator.generateOfficialNutritionalOpinion(savedData, student, "Unidade Escolar Padrão");

            setPdfContent(docContent);
            setShowPdf(true);
            // We removed onSaveSuccess() here to allow the user to see the PDF first.
            // onSaveSuccess will be called when the user explicitly closes the viewer/process.
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar avaliação.");
        } finally {
            setIsLoading(false);
        }
    };

    if (showPdf && pdfContent) {
        const { OfficialDocumentViewer } = require('../OfficialDocumentViewer');
        return (
            <OfficialDocumentViewer
                content={pdfContent}
                onClose={() => {
                    setShowPdf(false);
                    onSaveSuccess(); // Now we finish the flow
                }}
            />
        );
    }

    // --- RENDER ---

    const renderTabButton = (id: Tab, label: string, icon: React.ReactNode) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${activeTab === id ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50' : 'border-transparent text-slate-400 hover:text-slate-600 font-medium'}`}
        >
            {icon}
            <span className="text-xs uppercase tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Avaliação Nutricional <span className="text-indigo-600">PRO</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Aluno: <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px]">{student.nome}</span>
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition-all">Cancelar</button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 px-8 flex overflow-x-auto">
                {renderTabButton('ANTROPOMETRIA', 'Antropometria', <Calculator className="w-4 h-4" />)}
                {renderTabButton('ANAMNESE', 'Marcadores de Consumo', <Utensils className="w-4 h-4" />)}
                {renderTabButton('EXAME_FISICO', 'Exame Físico', <Stethoscope className="w-4 h-4" />)}
                {renderTabButton('PARECER', 'Diagnóstico & Conduta', <ClipboardList className="w-4 h-4" />)}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto">

                    {/* --- TAB 1: ANTROPOMETRIA --- */}
                    {activeTab === 'ANTROPOMETRIA' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 fade-in duration-300">
                            {/* Inputs */}
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-8">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Dados de Aferição</h3>
                                <div className="grid grid-cols-2 gap-6 leading-none">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Peso (kg)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={weight}
                                                onChange={e => setWeight(e.target.value)}
                                                className="w-full text-3xl font-black text-slate-700 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                                placeholder="00.0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">KG</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estatura (m)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={height}
                                                onChange={e => setHeight(e.target.value)}
                                                className="w-full text-3xl font-black text-slate-700 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                                placeholder="0.00"
                                                step="0.01"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">M</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 rounded-2xl p-6 flex items-center justify-between border border-indigo-100">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">IMC Calculado</p>
                                        <p className="text-4xl font-black text-indigo-700">{bmi > 0 ? bmi : '--.--'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Status (Curva OMS)</p>
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase inline-block
                                            ${classification?.includes('EUTROFIA') ? 'bg-emerald-200 text-emerald-800' :
                                                classification?.includes('OBESIDADE') ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                                            {classification?.replace(/_/g, ' ') || 'AGUARDANDO DADOS'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Graphics / Visualization Placeholder */}
                            <div className="bg-slate-800 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                                <div className="relative z-10">
                                    <div className="w-32 h-32 rounded-full border-8 border-slate-700 flex items-center justify-center mb-6 relative">
                                        <div className={`absolute inset-0 rounded-full border-8 border-t-emerald-500 border-r-emerald-500 rotate-45 opacity-50 ${bmi > 0 ? 'block' : 'hidden'}`}></div>
                                        <span className="text-2xl font-black">{bmi > 0 ? bmi : '?'}</span>
                                    </div>
                                    <h4 className="text-lg font-bold uppercase mb-2">Análise de Crescimento</h4>
                                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                        A avaliação utiliza os padrões de crescimento da OMS (2007) para 5-19 anos baseada em Escores-Z.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: ANAMNESE --- */}
                    {activeTab === 'ANAMNESE' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Frequência Alimentar (Marcadores do Sispnaes)</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[['Frutas', 'frutas'], ['Verduras/Legumes', 'verduras'], ['Leguminosas (Feijão)', 'leguminosas'], ['Ultraprocessados (Salgadinhos/Biscoitos)', 'ultraprocessados']].map(([label, key]) => (
                                        <div key={key} className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['DIARIO', 'SEMANAL', 'RARO', 'NUNCA'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setAnamnesis({ ...anamnesis, [key]: opt })}
                                                        className={`py-2 rounded-xl text-[9px] font-bold uppercase transition-all
                                                            ${anamnesis[key as keyof typeof anamnesis] === opt
                                                                ? 'bg-slate-800 text-white shadow-lg scale-105'
                                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Hábitos e Histórico</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Consumo de Água</label>
                                        <select
                                            value={anamnesis.agua}
                                            onChange={(e) => setAnamnesis({ ...anamnesis, agua: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                        >
                                            <option value="<1L">Menos de 1 Litro</option>
                                            <option value="1-2L">Entre 1 e 2 Litros</option>
                                            <option value=">2L">Mais de 2 Litros</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4 bg-amber-50 rounded-xl p-4 border border-amber-100">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">Café da Manhã</p>
                                            <p className="text-[9px] text-amber-600">O aluno realiza esta refeição antes da escola?</p>
                                        </div>
                                        <button
                                            onClick={() => setAnamnesis({ ...anamnesis, cafeDaManha: !anamnesis.cafeDaManha })}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${anamnesis.cafeDaManha ? 'bg-amber-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${anamnesis.cafeDaManha ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: EXAME FISICO --- */}
                    {activeTab === 'EXAME_FISICO' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Sinais Clínicos de Carências</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[
                                        { key: 'cabelo', label: 'Cabelos', options: ['BRILHOSO', 'OPACO', 'QUEDA', 'DESPIGMENTADO'] },
                                        { key: 'pele', label: 'Pele', options: ['HIDRATADA', 'RESSECADA', 'DESCAMAÇÃO', 'PÁLIDA'] },
                                        { key: 'unhas', label: 'Unhas', options: ['NORMAIS', 'QUEBRADIÇAS', 'MANCHAS', 'FORMATO_ALTERADO'] },
                                        { key: 'mucosas', label: 'Mucosas (Olhos/Gengiva)', options: ['CORADAS', 'PÁLIDAS/DESCORADAS', 'INFLAMADAS'] },
                                        { key: 'abdomen', label: 'Abdômen', options: ['PLANO', 'DISTENDIDO', 'DOLOROSO'] },
                                    ].map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">{field.label}</label>
                                            <select
                                                value={physicalExam[field.key as keyof typeof physicalExam]}
                                                onChange={(e) => setPhysicalExam({ ...physicalExam, [field.key]: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold uppercase outline-none focus:border-indigo-500"
                                            >
                                                {field.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Condições Clínicas / Alergias</h3>
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {conditions.map(c => (
                                        <span key={c} className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2">
                                            {c}
                                            <button onClick={() => setConditions(prev => prev.filter(x => x !== c))} className="hover:text-red-500 ml-1 font-black">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={conditionInput}
                                        onChange={e => setConditionInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && setConditions([...conditions, conditionInput.toUpperCase()])}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                                        placeholder="Ex: Alergia a Proteína do Leite (APLV), Diabetes..."
                                    />
                                    <button onClick={() => setConditions([...conditions, conditionInput.toUpperCase()])} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-slate-300">+</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 4: PARECER --- */}
                    {activeTab === 'PARECER' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Parecer Técnico Nutricional</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Texto do Laudo (Editável)</label>
                                        <textarea
                                            value={technicalOpinion}
                                            onChange={e => setTechnicalOpinion(e.target.value)}
                                            className="w-full h-48 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 leading-relaxed outline-none focus:border-indigo-500 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Conduta & Recomendações</label>
                                        <textarea
                                            value={recommendations}
                                            onChange={e => setRecommendations(e.target.value)}
                                            className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs outline-none focus:border-indigo-500"
                                            placeholder="Descreva as orientações para a família e escola..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || !classification}
                                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                                >
                                    <Save className="w-5 h-5" />
                                    {isLoading ? 'Salvando...' : 'Finalizar e Gerar Documento'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Next Step Fab (if not on last step) */}
            {activeTab !== 'PARECER' && (
                <div className="absolute bottom-8 right-8">
                    <button
                        onClick={() => {
                            if (activeTab === 'ANTROPOMETRIA') setActiveTab('ANAMNESE');
                            else if (activeTab === 'ANAMNESE') setActiveTab('EXAME_FISICO');
                            else if (activeTab === 'EXAME_FISICO') setActiveTab('PARECER');
                        }}
                        className="bg-slate-900 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};
