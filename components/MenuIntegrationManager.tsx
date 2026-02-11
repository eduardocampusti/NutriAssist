import React, { useState, useMemo, useEffect } from 'react';
import {
  MenuPlan,
  MenuExecution,
  InventoryItem,
  School,
  UserProfile,
  UserRole,
  EducationalStage,
  Dish,
  MenuIngredient,
  MealType,
  DocStatus,
  StudentNE,
  DocumentCategory,
  Supplier,
  SupplierType,
  ProcurementProcess
} from '../types';

import { automateMenuPlanning, generateAdaptedMenu } from '../services/geminiService';
import { generateAutomatedMenu, validateMenuCompliance, calculateNutritionalTargets, getItemNormativeStatus } from '../services/menuEngine';
import { fndePreparacaoService, FNDEPreparacao } from '../services/fndePreparacaoService';
import { useToast } from '../contexts/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import { NutritionalOptimizationPanel } from './NutritionalOptimizationPanel';
import MenuReport from './MenuReport';
import MenuWizard from './MenuWizard/MenuWizard';
import ProcurementManager from './ProcurementManager';
import { documentService, OfficialDocType } from '../services/documentService';
import { documentGenerator } from '../services/documentGeneratorService';
import { LegalDashboard } from './LegalDashboard';

import { useMenu } from '../contexts/MenuContext';
import { useInventory } from '../contexts/InventoryContext';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';
import { useDocuments } from '../contexts/DocumentContext';

interface MenuIntegrationManagerProps {
  menuPlans: MenuPlan[];
  executions: MenuExecution[];
  inventory: InventoryItem[];
  schools: School[];
  studentsNE: StudentNE[];
  activeProfile?: UserProfile;
  onUpdatePlan: (id: string, updates: Partial<MenuPlan>) => Promise<void>;
  onExecute: (execution: Omit<MenuExecution, 'id' | 'authorId'>) => Promise<void>;
  onRequestDocument?: (type: string, category: DocumentCategory, context: any, details: string) => void;
  // Procurement Props
  procurements: ProcurementProcess[];
  onClose: () => void;
  initialTab?: string;
}

const MenuIntegrationManager: React.FC<{ onClose: () => void, initialTab?: string }> = ({
  onClose,
  initialTab = 'planos'
}) => {
  const { menuPlans, executions, addMenuPlan, updateMenuPlan: onUpdatePlan, executeMenu: onExecute } = useMenu();
  const { inventory } = useInventory();
  const { schools, studentsNE } = useSchools();
  const { activeProfile } = useUsers();
  const { procurements, addProcurement } = usePNAE();

  // onRequestDocument is handled via useDocuments or a prop if needed for specific flow
  const { currentDocId } = useDocuments(); // Just example, actual logic might differ
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
  const [wizardStep, setWizardStep] = useState(1); // 1: Ident, 2: Compos, 3: Review, 4: Send, 5: Approve
  const [viewingPlan, setViewingPlan] = useState<MenuPlan | null>(null);
  const [showProcurement, setShowProcurement] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState<MenuPlan | null>(null);

  // EDITOR STATE (WIZARD CONTEXT)
  const [editorPlan, setEditorPlan] = useState<Partial<MenuPlan> & { preparacoes: Dish[] }>({
    ano_letivo: new Date().getFullYear(),
    titulo: '',
    escolaId: '',
    studentNeId: '',
    etapa: EducationalStage.FUNDAMENTAL_I,
    numAlunos: 0,
    preparacoes: [],
    faixaEtariaMinMeses: 48, // Default 4 years
    faixaEtariaMaxMeses: 120, // Default 10 years
    periodo: 'SEMANAL',
    justificativaTecnica: '',
    tipoRefeicaoPrincipal: MealType.ALMOCO // New global field
  });

  const [approvalNote, setApprovalNote] = useState(''); // For Step 5


  const [composerDish, setComposerDish] = useState({
    nome: '',
    mealType: MealType.ALMOCO,
    ingredientes: [] as MenuIngredient[]
  });

  const [composerIngredient, setComposerIngredient] = useState({
    itemId: '',
    perCapita: 0
  });

  // Ingredient Picker State
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false);


  const [selectedDay, setSelectedDay] = useState(1);
  const [availablePreparacoes, setAvailablePreparacoes] = useState<FNDEPreparacao[]>([]);
  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  // COMPLIANCE STATE
  const [planCompliance, setPlanCompliance] = useState({
    isCompliant: true,
    violations: [] as string[],
    blockingViolations: [] as string[],
    warnings: [] as string[]
  });

  // CONFIRMATION STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isLoading: false
  });

  // PERMISSIONS
  const canManage = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.SECRETARIO || activeProfile?.role === UserRole.SECRETARIA;
  // APROVAÇÃO OBRIGATÓRIA PELA SME: Apenas Admin e Secretário(a) podem dar o status final de APROVADO
  const isApprover = activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.SECRETARIO || activeProfile?.role === UserRole.SECRETARIA;

  useEffect(() => {
    const loadPreps = async () => {
      try {
        const data = await fndePreparacaoService.list();
        setAvailablePreparacoes(data);
      } catch (err) {
        console.error("Erro ao carregar fichas técnicas no manager:", err);
      }
    };
    loadPreps();
  }, []);

  // --- WIZARD NAVIGATION HANDLERS ---
  const handleNextStep = () => {
    // Validation Logic per Step
    if (wizardStep === 1) {
      if (!editorPlan.titulo || !editorPlan.escolaId || !editorPlan.etapa) {
        addToast("Preencha todos os campos obrigatórios da Identificação.", "error");
        return;
      }
      if (!editorPlan.faixaEtariaMinMeses || !editorPlan.faixaEtariaMaxMeses) {
        addToast("A Faixa Etária é obrigatória para validação normativa.", "error");
        return;
      }
    }

    if (wizardStep === 2) {
      if (editorPlan.preparacoes.length === 0) {
        addToast("Adicione pelo menos uma preparação ao cardápio.", "warning");
        return;
      }
    }

    if (wizardStep === 3) {
      // Review Gatekeeper
      if (planCompliance.blockingViolations.length > 0) {
        addToast("Corrija as violações BLOQUEANTES antes de avançar.", "error");
        return;
      }
      if (planCompliance.warnings.length > 0 && !editorPlan.justificativaTecnica) {
        addToast("Justificativa Técnica é obrigatória devido às restrições identificadas.", "warning");
        return;
      }
    }

    if (wizardStep === 4) {
      // Submission Logic (Transition to Step 5 is virtual, changing status)
      handleSubmitForApproval();
      return;
    }

    setWizardStep(prev => prev + 1);
  };

  const handleSubmitForApproval = async () => {
    const finalPlan: any = {
      ...editorPlan,
      status: DocStatus.ENVIADO, // Sent for analysis
    };
    await addMenuPlan(finalPlan, activeProfile?.id || '');
    addToast("Cardápio ENVIADO para análise com sucesso!", "success");
    onClose();
  };

  const handleApproverAction = async (approved: boolean) => {
    if (!viewingPlan) return;

    if (!approved && !approvalNote) {
      addToast("Para solicitar ajustes, é obrigatório informar o motivo.", "warning");
      return;
    }

    const newStatus = approved ? DocStatus.APROVADO : DocStatus.AJUSTE;

    await onUpdatePlan(viewingPlan.id, {
      status: newStatus,
      justificativaTecnica: viewingPlan.justificativaTecnica + (approved ? `\n[APROVADO por ${activeProfile?.nome}]` : `\n[REJEITADO/AJUSTES: ${approvalNote}]`)
    });

    // SISTEMA DE DOCUMENTOS OFICIAIS (LGPD & Rastreabilidade)
    if (approved && activeProfile) {
      try {
        const schoolName = escuelasMap(viewingPlan.escolaId);

        // 1. Gerar e Salvar Cardápio Oficial
        const menuContent = documentGenerator.generateMenuOfficialContent(viewingPlan, schoolName);
        await documentService.saveDocument(
          OfficialDocType.CARDAPIO_REGULAR,
          menuContent.titulo,
          activeProfile.id,
          menuContent,
          viewingPlan.id
        );

        // 2. Gerar e Salvar Parecer Técnico
        const opinionContent = documentGenerator.generateTechnicalOpinion(viewingPlan, viewingPlan.justificativaTecnica || 'Aprovação técnica regular.');
        await documentService.saveDocument(
          OfficialDocType.PARECER_TECNICO,
          opinionContent.titulo,
          activeProfile.id,
          opinionContent,
          viewingPlan.id
        );

        addToast("Documentos Oficiais ARQUIVADOS com sucesso!", "success");
      } catch (err) {
        console.error("Erro ao arquivar documentos oficiais:", err);
        addToast("Cardápio aprovado, mas erro ao gerar documentos oficiais no histórico.", "warning");
      }
    }

    addToast(approved ? "Cardápio APROVADO!" : "Cardápio REJEITADO/DEVOLVIDO para ajustes.", approved ? "success" : "info");
    setViewingPlan(null);
  };


  const handlePrevStep = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  // --- STEP 1: IDENTIFICATION ---
  const renderStep1_Identification = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">1</span>
          Identificação do Ciclo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Título do Cardápio *</label>
            <input
              type="text"
              value={editorPlan.titulo}
              onChange={e => setEditorPlan({ ...editorPlan, titulo: e.target.value.toUpperCase() })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
              placeholder="Ex: MAIO/2025 - INTEGRAL"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Unidade Escolar / Rede *</label>
            <select
              value={editorPlan.escolaId}
              onChange={e => setEditorPlan({
                ...editorPlan,
                escolaId: e.target.value,
                numAlunos: schools.find(s => s.id === e.target.value)?.numAlunos || 0
              })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
            >
              <option value="">Selecione...</option>
              <option value="REDE_GERAL">REDE GERAL (TODAS)</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Etapa de Ensino *</label>
            <select
              value={editorPlan.etapa as any}
              onChange={e => setEditorPlan({ ...editorPlan, etapa: e.target.value as EducationalStage })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
            >
              {Object.values(EducationalStage).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Número de Alunos *</label>
            <input
              type="number"
              value={editorPlan.numAlunos}
              onChange={e => setEditorPlan({ ...editorPlan, numAlunos: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Período *</label>
            <select
              value={editorPlan.periodo}
              onChange={e => setEditorPlan({ ...editorPlan, periodo: e.target.value as 'SEMANAL' | 'MENSAL' })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
            >
              <option value="SEMANAL">SEMANAL</option>
              <option value="MENSAL">MENSAL</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Refeição Principal *</label>
            <select
              value={editorPlan.tipoRefeicaoPrincipal}
              onChange={e => {
                const newType = e.target.value as MealType;
                setEditorPlan({ ...editorPlan, tipoRefeicaoPrincipal: newType });
                // Helper: Auto-update composer too
                setComposerDish(prev => ({ ...prev, mealType: newType }));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
            >
              {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>


          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-600 uppercase">Dias Letivos (Cálculo)</label>
            <input
              type="number"
              value={editorPlan.diasLetivos}
              onChange={e => setEditorPlan({ ...editorPlan, diasLetivos: parseInt(e.target.value) || 20 })}
              className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Parâmetros Normativos (FNDE)</h4>
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Idade Mínima (Meses)</label>
              <input
                type="number"
                value={editorPlan.faixaEtariaMinMeses}
                onChange={e => setEditorPlan({ ...editorPlan, faixaEtariaMinMeses: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Idade Máxima (Meses)</label>
              <input
                type="number"
                value={editorPlan.faixaEtariaMaxMeses}
                onChange={e => setEditorPlan({ ...editorPlan, faixaEtariaMaxMeses: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-slate-400 italic">
                * Essas idades definirão quais alimentos são <strong>PROIBIDOS</strong> (ex: &lt; 36 meses).
                Verifique a Resolução 06/2020.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // --- STEP 2: COMPOSITION WITH TRAFFIC LIGHTS ---

  // Helper for adding ingredients
  const handleAddIngredientToComposer = () => {
    if (!composerIngredient.itemId || composerIngredient.perCapita <= 0) {
      addToast("Preencha item e quantidade.", "warning");
      return;
    }

    // Check traffic light status immediately
    const item = inventory.find(i => i.id === composerIngredient.itemId);
    if (item) {
      const fakeStage = editorPlan.faixaEtariaMinMeses! < 36 ? EducationalStage.CRECHE : EducationalStage.FUNDAMENTAL_I;
      const status = getItemNormativeStatus(item, fakeStage);

      if (status === 'PROHIBITED') {
        addToast(`BLOQUEADO: ${item.nome} é proibido para esta faixa etária.`, "error");
        return;
      }
      if (status === 'RESTRICTED') {
        addToast(`ATENÇÃO: ${item.nome} é restrito. Inclua justificativa ao final.`, "info");
      }
    }

    setComposerDish(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { itemId: composerIngredient.itemId, perCapitaGrams: composerIngredient.perCapita }]
    }));
    setComposerIngredient({ itemId: '', perCapita: 0 });
  };

  const handleSaveDish = () => {
    if (!composerDish.nome || composerDish.ingredientes.length === 0) {
      addToast("Preencha nome e ingredientes.", "warning");
      return;
    }
    const newDish: Dish = {
      id: crypto.randomUUID(),
      ...composerDish,
      diaSemana: selectedDay
    };
    setEditorPlan(prev => ({
      ...prev,
      preparacoes: [...prev.preparacoes, newDish]
    }));
    setComposerDish({ nome: '', mealType: MealType.ALMOCO, ingredientes: [] });
  };

  const renderStep2_Composition = () => (
    <div className="flex gap-6 h-[600px] animate-in fade-in slide-in-from-right-8 duration-500">
      {/* LEFT: CALENDAR / LIST */}
      <div className="w-1/3 bg-white rounded-[32px] border border-slate-200 p-6 overflow-y-auto">
        <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Cronograma Semanal</h3>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {diasSemana.map((d, idx) => (
            <button
              key={d}
              onClick={() => setSelectedDay(idx + 1)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${selectedDay === idx + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {editorPlan.preparacoes.filter(p => p.diaSemana === selectedDay).map(dish => (
            <div key={dish.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
              <button
                onClick={() => setEditorPlan(prev => ({ ...prev, preparacoes: prev.preparacoes.filter(p => p.id !== dish.id) }))}
                className="absolute top-2 right-2 text-slate-300 hover:text-rose-500"
              >
                x
              </button>
              <p className="text-xs font-black text-slate-700 uppercase">{dish.nome}</p>
              <p className="text-[10px] text-slate-400 mt-1">{dish.ingredientes.length} ingredientes</p>
            </div>
          ))}
          {editorPlan.preparacoes.filter(p => p.diaSemana === selectedDay).length === 0 && (
            <p className="text-center text-[10px] text-slate-400 italic py-8">Nenhuma preparação neste dia.</p>
          )}
        </div>
      </div>

      {/* RIGHT: COMPOSER */}
      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col">
        <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">2</span>
          Composição do Prato
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">Importar de Ficha Técnica (Opcional)</label>
            <select
              onChange={async (e) => {
                const prepId = e.target.value;
                if (!prepId) return;
                try {
                  const prep = await fndePreparacaoService.getById(prepId);
                  const newDish: Dish = {
                    id: crypto.randomUUID(),
                    nome: prep.nome,
                    mealType: editorPlan.tipoRefeicaoPrincipal || MealType.ALMOCO,
                    diaSemana: selectedDay,
                    ingredientes: prep.ingredientes?.map(ing => ({
                      itemId: ing.alimento_id, // Map FNDE ID to Item ID (assuming compatible or mapping needed)
                      perCapitaGrams: ing.quantidade_per_capita
                    })) || []
                  };
                  setEditorPlan(prev => ({ ...prev, preparacoes: [...prev.preparacoes, newDish] }));
                  addToast(`Ficha "${prep.nome}" importada com sucesso!`, "success");
                } catch (err) {
                  addToast("Erro ao importar ficha técnica.", "error");
                }
              }}
              className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-xs font-bold uppercase text-indigo-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              <option value="">-- SELECIONE UMA RECEITA PADRÃO --</option>
              {availablePreparacoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Preparação Personalizada</label>
            <input
              value={composerDish.nome}
              onChange={e => setComposerDish({ ...composerDish, nome: e.target.value.toUpperCase() })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold uppercase"
              placeholder="Ex: ARROZ COM FEIJÃO"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Refeição</label>
            <select
              value={composerDish.mealType}
              onChange={e => setComposerDish({ ...composerDish, mealType: e.target.value as MealType })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold uppercase"
            >
              {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex-1 flex flex-col">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Adicionar Alimento (Busca)</label>

              <div className="relative">
                {/* Trigger Button */}
                <button
                  onClick={() => setIsIngredientPickerOpen(!isIngredientPickerOpen)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold uppercase text-left flex justify-between items-center hover:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <span className={composerIngredient.itemId ? 'text-slate-800' : 'text-slate-400'}>
                    {composerIngredient.itemId
                      ? inventory.find(i => i.id === composerIngredient.itemId)?.nome
                      : 'Selecione ou Pesquise...'}
                  </span>
                  <span className="text-slate-400">▼</span>
                </button>

                {/* Dropdown Panel */}
                {isIngredientPickerOpen && (
                  <div className="absolute top-full left-0 w-full z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-200">
                    {/* Search Input */}
                    <div className="relative mb-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                      <input
                        autoFocus
                        value={ingredientSearch}
                        onChange={e => setIngredientSearch(e.target.value)}
                        placeholder="Filtrar alimentos..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold uppercase outline-none focus:bg-white focus:border-indigo-400 transition-all"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {inventory
                        .filter(i => i.ativo && i.nome.toLowerCase().includes(ingredientSearch.toLowerCase()))
                        .map(item => {
                          const fakeStage = editorPlan.faixaEtariaMinMeses! < 36 ? EducationalStage.CRECHE : EducationalStage.FUNDAMENTAL_I;
                          const status = getItemNormativeStatus(item, fakeStage);
                          let icon = '🟢';
                          let opacity = 'opacity-100';

                          if (status === 'PROHIBITED') {
                            icon = '🔴';
                            opacity = 'opacity-50 cursor-not-allowed';
                          }
                          if (status === 'RESTRICTED') icon = '🟡';

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (status !== 'PROHIBITED') {
                                  setComposerIngredient({ ...composerIngredient, itemId: item.id });
                                  setIsIngredientPickerOpen(false);
                                  setIngredientSearch(''); // Clear search on select? Optional.
                                }
                              }}
                              disabled={status === 'PROHIBITED'}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-indigo-50 transition-colors ${opacity} ${composerIngredient.itemId === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
                            >
                              <span>{icon}</span>
                              <span className="truncate">{item.nome}</span>
                              {status === 'PROHIBITED' && <span className="text-[9px] text-red-500 ml-auto font-black">PROIBIDO</span>}
                            </button>
                          );
                        })}
                      {inventory.filter(i => i.ativo && i.nome.toLowerCase().includes(ingredientSearch.toLowerCase())).length === 0 && (
                        <div className="p-4 text-center text-[10px] text-slate-400 italic">
                          Nenhum alimento encontrado.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-24">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Gramas (p/c)</label>
              <input
                type="number"
                value={composerIngredient.perCapita}
                onChange={e => setComposerIngredient({ ...composerIngredient, perCapita: parseFloat(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
            <div className="flex items-end">
              <button onClick={handleAddIngredientToComposer} className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg hover:scale-105 transition-transform">+</button>
            </div>
          </div>

          {/* INGREDIENTS LIST */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {composerDish.ingredientes.map((ing, idx) => {
              const item = inventory.find(i => i.id === ing.itemId);
              return (
                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-700">{item?.nome}</span>
                  <span className="text-[10px] font-black text-slate-400">{ing.perCapitaGrams}g</span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-right">
            <button onClick={handleSaveDish} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black">
              Confirmar Prato
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- STEP 3: REVIEW ---
  const renderStep3_Review = () => {
    // Recalculate compliance on render of this step
    const currentPlan: MenuPlan = {
      id: 'temp',
      ...editorPlan as any,
      created_at: Date.now(),
      status: DocStatus.ELABORACAO,
      authorId: activeProfile?.id || ''
    };

    const compliance = validateMenuCompliance(
      currentPlan,
      inventory,
      editorPlan.numAlunos!,
      editorPlan.etapa as EducationalStage,
      { min: editorPlan.faixaEtariaMinMeses || 0, max: editorPlan.faixaEtariaMaxMeses || 999 }
    );

    // Update local state for gatekeeper logic
    useEffect(() => {
      setPlanCompliance({
        isCompliant: compliance.isCompliant,
        violations: compliance.violations,
        blockingViolations: compliance.blockingViolations || [],
        warnings: compliance.warnings || []
      });
    }, [editorPlan.preparacoes, editorPlan.faixaEtariaMinMeses]);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="grid grid-cols-2 gap-6">
          {/* STATS */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200">
            <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Métricas do Cardápio</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Energia</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalKcal.toFixed(0)} kcal</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Proteína</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalProtein.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Carboidratos</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalCarbs.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lipídios</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalFats.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fibras</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalFiber.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sódio</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalSodium.toFixed(0)}mg</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cálcio</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalCalcium.toFixed(1)}mg</span>
              </div>
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ferro</span>
                <span className="text-sm font-black text-slate-900">{compliance.stats.totalIron.toFixed(2)}mg</span>
              </div>
              {/* Micronutrients Toggle or secondary group */}
              <div className="col-span-2 pt-2">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 opacity-60">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Vit A</span>
                    <span className="text-xs font-black text-slate-800">{compliance.stats.totalVitA.toFixed(1)}µg</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-50 pb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Vit C</span>
                    <span className="text-xs font-black text-slate-800">{compliance.stats.totalVitC.toFixed(1)}mg</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-50 pb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Magnésio</span>
                    <span className="text-xs font-black text-slate-800">{compliance.stats.totalMagnesium.toFixed(1)}mg</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-50 pb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Zinco</span>
                    <span className="text-xs font-black text-slate-800">{compliance.stats.totalZinc.toFixed(1)}mg</span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 mt-4 flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">Custo Total (Estimado)</span>
                  <span className="text-lg font-black text-emerald-600 leading-tight">R$ {compliance.stats.totalCost.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">Ultraprocessados</span>
                  <span className={`text-lg font-black leading-tight ${compliance.stats.ultraProcessedCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{compliance.stats.ultraProcessedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMPLIANCE ALERTS */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Auditoria Normativa</h3>
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] custom-scrollbar">
              {compliance.blockingViolations?.map((v, i) => (
                <div key={`b-${i}`} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-start">
                  <span className="text-lg">🚫</span>
                  <p className="text-[10px] font-bold text-rose-700 leading-tight">{v}</p>
                </div>
              ))}
              {compliance.warnings?.map((w, i) => (
                <div key={`w-${i}`} className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                  <span className="text-lg">⚠️</span>
                  <p className="text-[10px] font-bold text-amber-700 leading-tight">{w}</p>
                </div>
              ))}
              {compliance.infos?.map((info, i) => (
                <div key={`i-${i}`} className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
                  <span className="text-lg">ℹ️</span>
                  <p className="text-[10px] font-bold text-blue-700 leading-tight">{info}</p>
                </div>
              ))}
              {compliance.isCompliant && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center h-full text-center">
                  <span className="text-3xl mb-2">✅</span>
                  <p className="text-xs font-black text-emerald-700">Cardápio 100% Conforme</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROBUST JUSTIFICATION FIELD */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
            <span>🛡️</span> Justificativa Técnica / Observações
          </h3>
          <p className="text-[10px] text-slate-400 mb-6 max-w-2xl">
            * Em caso de alertas restritivos (amarelos), é <strong>OBRIGATÓRIO</strong> fundamentar a decisão técnica conforme Art. 14 da Resolução 06/2020.
            Esta justificativa ficará registrada para fins de auditoria e fiscalização do PNAE/TCU.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Contexto/Motivação Técnica *</label>
              <textarea
                value={editorPlan.justificativaTecnica}
                onChange={e => setEditorPlan({ ...editorPlan, justificativaTecnica: e.target.value })}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:border-indigo-500 outline-none resize-none"
                placeholder="Descreva as razões técnicas para as escolhas (ex: Falta de estoque, ação de EAN, sazonalidade)..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Referência Normativa / Legal</label>
              <input
                type="text"
                placeholder="Ex: Resolução FNDE 06/2020, Art 22"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:border-indigo-500 outline-none mb-4"
              />
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Responsabilidade Técnica</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                    {activeProfile?.nome?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700">{activeProfile?.nome || 'Usuário Atual'}</p>
                    <p className="text-[9px] text-slate-400">CRN/Matrícula: {activeProfile?.id}</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 text-right">Registro: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- STEP 4: FINALIZATION ---
  const renderStep4_Submission = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl">
        ✅
      </div>
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Validado e Conforme!</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        Como Nutricionista Responsável, ao confirmar, este cardápio será <strong>APROVADO</strong> e publicado imediatamente para execução nas escolas.
      </p>

      <button
        onClick={handleNextStep}
        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
      >
        Enviar para Aprovação
      </button>
    </div>
  );

  // --- STEP 5: APPROVAL INTERFACE (For Admin in View Mode) ---
  const renderApprovalPanel = () => {
    if (!viewingPlan || viewingPlan.status !== DocStatus.ENVIADO) return null;
    if (!isApprover) return (
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
        <p className="text-amber-800 font-bold text-xs uppercase">Aguardando Análise da Coordenação</p>
      </div>
    );

    return (
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl space-y-4 mt-6">
        <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
          <span>👮</span> Área do Aprovador
        </h3>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Parecer Técnico / Motivo da Devolução</p>
          <textarea
            value={approvalNote}
            onChange={e => setApprovalNote(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 outline-none"
            rows={3}
            placeholder="Escreva aqui as observações..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleApproverAction(false)}
            className="py-3 rounded-xl bg-rose-100 text-rose-700 font-black uppercase text-xs hover:bg-rose-200"
          >
            Solicitar Ajustes
          </button>
          <button
            onClick={() => handleApproverAction(true)}
            className="py-3 rounded-xl bg-emerald-600 text-white font-black uppercase text-xs hover:bg-emerald-700 shadow-lg"
          >
            Aprovar Cardápio
          </button>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (showProcurement) {
    return (
      <ProcurementManager
        plans={procurements}
        menuPlans={menuPlans}
        inventory={inventory}
        activeProfile={activeProfile}
        onSave={async (data) => await addProcurement(data, activeProfile?.id || '')}
        onRequestDocument={() => { }} // Placeholder or real logic
        onClose={() => setShowProcurement(false)}
      />
    );
  }


  if (viewMode === 'LIST') {
    // Revert to the existing list view from previous file version?
    // For brevity, I will implement a simplified robust list view here or Restore it.
    // I'll implement a clean List view.
    return (
      <>
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 print:hidden">
          {/* HEADER */}
          <div className="flex justify-between items-center p-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gestão de Cardápios</h1>
              <p className="text-sm text-slate-500 font-bold uppercase">Ciclos de Alimentação Escolar</p>
            </div>
            {canManage && (
              <div className="flex gap-4">
                <button onClick={() => setShowProcurement(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center gap-2">
                  <span>📋</span> Gestão de Licitação
                </button>
                <button onClick={() => { setViewMode('EDITOR'); setWizardStep(1); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                  + Novo Cardápio
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {menuPlans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${plan.status === DocStatus.APROVADO ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {plan.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(plan.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase mb-1">{plan.titulo}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase mb-6">{escuelasMap(plan.escolaId)}</p>

                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button onClick={() => setViewingPlan(viewingPlan?.id === plan.id ? null : plan)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">
                    {viewingPlan?.id === plan.id ? 'Fechar Detalhes' : 'Ver Detalhes'}
                  </button>
                  <button
                    onClick={() => setShowPrintReport(plan)}
                    className="px-4 bg-emerald-50 text-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 flex items-center gap-2"
                  >
                    🖨️ PDF
                  </button>
                </div>

                {/* Approval Panel embedded in Detail context */}
                {viewingPlan?.id === plan.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4 animate-in slide-in-from-top-4 duration-300">
                    {/* Compliance Check (On-the-fly) */}
                    {(() => {
                      const compliance = validateMenuCompliance(plan, inventory, plan.numAlunos, plan.etapa as EducationalStage);
                      const isFullyCompliant = !compliance.blockingViolations?.length && !compliance.warnings?.length;

                      if (isFullyCompliant) return (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">🛡️</div>
                          <div>
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Conformidade Verificada</h4>
                            <p className="text-xs text-emerald-600 font-medium">Este cardápio atende a todas as exigências nutricionais do PNAE (Resolução 06/2020).</p>
                          </div>
                        </div>
                      );
                      return null;
                    })()}

                    <div className="space-y-4 mb-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Composição do Cardápio</h4>
                        <div className="space-y-3">
                          {plan.preparacoes.map((dish, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black text-slate-700 uppercase">{dish.nome}</span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold">{plan.etapa?.replace(/_/g, ' ')}</span>
                              </div>
                              <div className="space-y-1">
                                {dish.ingredientes.map((ing, j) => {
                                  const item = inventory.find(x => x.id === ing.itemId);
                                  return (
                                    <div key={j} className="flex justify-between text-[10px] text-slate-500 border-b border-slate-50 last:border-0 py-1">
                                      <span>{item?.nome || 'Ingrediente Desconhecido'}</span>
                                      <span className="font-bold">{ing.perCapitaGrams}g</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {plan.justificativaTecnica && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Justificativa Técnica</h4>
                          <p className="text-xs text-amber-800 italic">"{plan.justificativaTecnica}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                        <p><strong>Faixa Etária:</strong> {plan.faixaEtariaMinMeses}-{plan.faixaEtariaMaxMeses} meses</p>
                        <p><strong>Criação:</strong> {new Date(plan.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {renderApprovalPanel()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PRINT VIEW OVERLAY */}
        {showPrintReport && (
          <MenuReport
            plan={showPrintReport}
            school={schools.find(s => s.id === showPrintReport.escolaId)}
            inventory={inventory}
            onClose={() => setShowPrintReport(null)}
          />
        )}
      </>
    );
  }

  // WIZARD RENDER
  return (
    <div className="bg-[#f8fafc] h-full">
      <MenuWizard
        schools={schools}
        inventory={inventory}
        activeProfile={activeProfile}
        initialPlan={editorPlan} // Pass existing draft if any
        onSave={async (planToSave) => {
          await addMenuPlan(planToSave, activeProfile?.id || '');
          setViewMode('LIST');
          setEditorPlan({ ...editorPlan, preparacoes: [] }); // Reset
        }}
        onClose={() => {
          setViewMode('LIST');
          // Optional: Verify if user wants to discard changes
        }}
      />
    </div>
  );

  // Helper
  function escuelasMap(id?: string) {
    if (!id || id === 'REDE_GERAL') return 'REDE GERAL';
    return schools.find(s => s.id === id)?.nome || 'Desconhecida';
  }
};


export default MenuIntegrationManager;
