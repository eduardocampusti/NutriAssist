import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Sidebar from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';
import { AppProviders } from './contexts/AppProviders';
import { useUsers } from './contexts/UserContext';
import { useSchools } from './contexts/SchoolContext';
import { useInventory } from './contexts/InventoryContext';
import { useDocuments } from './contexts/DocumentContext';
import { useNutrition } from './contexts/NutritionContext';
import { useMenu } from './contexts/MenuContext';
import { usePNAE } from './contexts/PNAEContext';
import { useToast } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';


import { AccessGate } from './components/Security/AccessGate';
import { ErrorBoundary } from './components/Security/ErrorBoundary';
import TechnicalNoteForm from './components/TechnicalNoteForm';
import ResultDisplay from './components/ResultDisplay';
import SchoolManager from './components/SchoolManager';
import CookManager from './components/CookManager';
import StudentManager from './components/Students/StudentManager';
import SpecialNeedsStudentManager from './components/SpecialNeedsStudentManager';
import OccurrenceManager from './components/Inventory/OccurrenceManager';
import InstitutionalReportManager from './components/InstitutionalReportManager';
import ProfileManager from './components/ProfileManager';
import DocumentArchive from './components/DocumentArchive';
import InstitutionalSettings from './components/InstitutionalSettings';
import InventoryManager from './components/InventoryManager';
import NutritionalEvaluationManager from './components/NutritionalEvaluationManager';
import TrainingManager from './components/TrainingManager';
import ProcurementManager from './components/ProcurementManager';
import InstitutionalDashboard from './components/InstitutionalDashboard';
import MenuIntegrationManager from './components/MenuIntegrationManager';
import MerendeiraTerminal from './components/MerendeiraTerminal';
import SchoolDirectorDashboard from './components/SchoolDirectorDashboard';
import NucleoDashboard from './components/NucleoDashboard';
import StudentImportManager from './components/Students/StudentImportManager';
import AboutSystem from './components/AboutSystem';
import SystemLogManager from './components/SystemLogManager';
import BackupManager from './components/BackupManager';
import UserManual from './components/UserManual';
import SystemTR from './components/SystemTR';
import QuickActionsFAB from './components/QuickActionsFAB';
import NotificationCenter from './components/NotificationCenter';
import Onboarding from './components/Onboarding';
import ReportingCenter from './components/Reporting/ReportingCenter';
import OperationalReports from './components/Reporting/OperationalReports';
import DistributionReceiptView from './components/Inventory/DistributionReceiptView';
import UnifiedNutritionalPanel from './components/UnifiedNutritionalPanel';
import NutritionalImpactSimulator from './components/NutritionalImpactSimulator';
import NutritionalRiskDashboard from './components/NutritionalRiskDashboard';
import EarlyWarningCenter from './components/EarlyWarningCenter';
import ForcePasswordChange from './components/Security/ForcePasswordChange';
import ComplianceDashboard from './components/ComplianceDashboard';
import EvolutionDashboard from './components/EvolutionDashboard';
import ZoneRiskPanel from './components/ZoneRiskPanel';

// Import Types
import {
  HistoryItem, UserRole, DocStatus, School, Cook, StudentNE, UserProfile,
  FormalDocument, SystemLog, LetterheadConfig, InventoryItem, InventoryMovement, InventoryBatch,
  NutritionalEvaluation, TrainingSession, ProcurementPlan, MenuPlan, MenuExecution,
  MovementType, MovementPurpose, Supplier, GeneratedContent, InventoryCategory
} from './types';

type View =
  | 'dashboard' | 'form' | 'result' | 'schools' | 'cooks' | 'students-ne'
  | 'institutional-reports' | 'profiles' | 'archive' | 'settings'
  | 'inventory' | 'nutritional' | 'training' | 'procurement' | 'reports'
  | 'menu-integration' | 'merendeira-terminal' | 'about' | 'logs' | 'backup' | 'manual' | 'updates';

const AppContent: React.FC = () => {
  const { signOut } = useAuth();
  const { profiles, currentProfileId, activeProfile, setCurrentProfileId, isLoading, addProfile, updateProfile, deleteProfile } = useUsers();
  const { schools } = useSchools();
  const { inventory, movements, addMovement } = useInventory();
  const { formalDocs, docTypes, generatedContent, currentDocId, currentDocStatus, isGenerating, addDocument, updateDocumentStatus, deleteDocument, setGeneratedContent, setCurrentDocId, setCurrentDocStatus, setIsGenerating } = useDocuments();
  const { menuPlans, executions, executeMenu, addMenuPlan, updateMenuPlan } = useMenu();
  const { evaluations, trainings } = useNutrition();
  const { procurements, letterhead, addProcurement, updateLetterhead } = usePNAE();
  const { addToast } = useToast();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse">Carregando Ecossistema...</p>
        </div>
      </div>
    );
  }

  // Onboarding is now optional or triggered via settings

  const handleExecuteMenu = async (execution: Omit<MenuExecution, 'id' | 'authorId'>) => {
    if (!activeProfile) return;
    await executeMenu(execution, activeProfile.id);
  };

  const handleAddMenuPlan = async (p: any, authorId: string) => {
    await addMenuPlan(p, authorId);
  };

  const handleUpdatePlan = async (id: string, updates: any) => {
    await updateMenuPlan(id, updates);
  };

  const handleGenerateDocument = async (type: string, category: any, context: any, details: string) => {
    setIsGenerating(true);
    try {
      const { generateTechnicalDocument } = await import('./services/geminiService');
      const content = await generateTechnicalDocument(type, category, context, details, activeProfile?.role || UserRole.NUTRICIONISTA, letterhead);

      const newDocId = crypto.randomUUID();
      const newDoc: FormalDocument = {
        id: newDocId,
        document_type: category,
        titulo: content.titulo,
        status: DocStatus.ELABORACAO,
        responsavel_id: activeProfile?.id || '',
        created_at: Date.now(),
        content: content
      };

      await addDocument(newDoc);
      setGeneratedContent(content);
      setCurrentDocId(newDocId);
      setCurrentDocStatus(DocStatus.ELABORACAO);
      addToast("Documento técnico gerado com sucesso!", 'success');
      navigate(`/elaborar/resultado/${newDocId}`);
    } catch (error) {
      addToast("Erro ao gerar documento. Verifique sua conexão ou tente novamente.", 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (activeProfile?.bloqueado) return <div className="p-20 text-center text-red-600 font-black uppercase tracking-widest">ACESSO BLOQUEADO PELO ADMINISTRADOR</div>;
  if (activeProfile?.senha_provisoria) return <ForcePasswordChange />;

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden flex-col lg:flex-row">
        <div className="no-print print-hidden">
          <Sidebar
            profiles={profiles}
            currentProfileId={currentProfileId}
            onProfileChange={setCurrentProfileId}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={signOut}
          />
        </div>
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-12 lg:py-10 print:overflow-visible">
          <div className="container mx-auto max-w-7xl print:max-w-none print:w-full">
            <Routes>
              <Route path="/" element={
                activeProfile?.role === UserRole.MERENDEIRA ? (
                  <MerendeiraTerminal
                    activeProfile={activeProfile}
                    school={schools.find(s => s.id === activeProfile.school_id)}
                    inventory={inventory}
                    movements={movements}
                    onRegisterConsumption={async (mov) => await addMovement(mov, activeProfile?.id || '')}
                    onClose={() => navigate('/')}
                  />
                ) : (activeProfile?.role === UserRole.DIRETOR) ? (
                  <SchoolDirectorDashboard
                    activeProfile={activeProfile}
                    school={schools.find(s => s.id === activeProfile?.school_id)}
                  />
                ) : (activeProfile?.role === UserRole.NUCLEO_ESCOLAR) ? (
                  <NucleoDashboard
                    activeProfile={activeProfile}
                  />
                ) : (activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.TECNICO) ? (
                  <InstitutionalDashboard
                    onNavigate={(view) => navigate(`/${view}`)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 uppercase font-black text-[10px] tracking-widest">
                    Selecione um módulo no menu lateral
                  </div>
                )

              } />

              <Route path="/terminal" element={
                <MerendeiraTerminal
                  activeProfile={activeProfile}
                  school={schools.find(s => s.id === activeProfile?.school_id)}
                  inventory={inventory}
                  movements={movements}
                  onRegisterConsumption={async (mov) => await addMovement(mov, activeProfile?.id || '')}
                  onClose={() => navigate('/')}
                />
              } />

              <Route path="/elaborar" element={
                <TechnicalNoteForm
                  onSubmit={handleGenerateDocument}
                  isLoading={isGenerating}
                  schools={schools}
                  docTypes={docTypes.length > 0 ? docTypes : [{ id: '1', label: 'Parecer Técnico', category: 'PARECER', active: true, description: 'Parecer padrão' }]}
                  activeProfile={activeProfile}
                />
              } />

              <Route path="/elaborar/resultado/:id" element={
                generatedContent ? (
                  <ResultDisplay
                    documentId={currentDocId}
                    data={generatedContent}
                    status={currentDocStatus}
                    aiDrafts={[]}
                    workflowHistory={[]}
                    activeProfile={activeProfile}
                    letterhead={letterhead}
                    onClose={() => navigate('/')}
                    onUpdateStatus={async (s, obs) => {
                      setCurrentDocStatus(s);
                      await updateDocumentStatus(currentDocId, s);
                      if (s === DocStatus.ARQUIVADO) alert("Documento Homologado e Arquivado com Sucesso!");
                    }}
                  />
                ) : <Navigate to="/" />
              } />

              <Route path="/cardapio" element={
                <MenuIntegrationManager
                  onClose={() => navigate('/')}
                  initialTab="planos"
                />
              } />

              <Route path="/estoque" element={
                <InventoryManager
                  onClose={() => navigate('/')}
                  initialTab="DASHBOARD"
                />
              } />

              <Route path="/estoque/recebimento" element={
                <ProtectedRoute>
                  <DistributionReceiptView school={schools.find(s => s.id === activeProfile?.school_id)!} activeProfile={activeProfile!} />
                </ProtectedRoute>
              } />
              <Route path="/estoque/contingencia" element={
                <ProtectedRoute>
                  <OccurrenceManager />
                </ProtectedRoute>
              } />
              <Route path="/estoque/:tab" element={<InventoryRouter navigate={navigate} />} />

              <Route path="/escolas" element={
                <AccessGate permission="MANAGE_SCHOOLS" fallback={<Navigate to="/" />}>
                  <SchoolManager
                    onClose={() => navigate('/')}
                  />
                </AccessGate>
              } />

              <Route path="/merendeiras" element={
                <CookManager
                  onClose={() => navigate('/')}
                />
              } />

              <Route path="/alunos-ne" element={<SpecialNeedsStudentManager onClose={() => navigate('/')} />} />

              <Route path="/alunos" element={
                <AccessGate permission="VIEW_STUDENTS_SENSITIVE" fallback={<Navigate to="/" />}>
                  <StudentManager
                    schools={schools}
                    activeProfile={activeProfile}
                    onClose={() => navigate('/')}
                  />
                </AccessGate>
              } />

              <Route path="/alunos" element={
                <AccessGate permission="VIEW_STUDENTS_SENSITIVE" fallback={<Navigate to="/" />}>
                  <StudentManager
                    schools={schools}
                    activeProfile={activeProfile}
                    onClose={() => navigate('/')}
                  />
                </AccessGate>
              } />

              <Route path="/importar-alunos" element={
                <AccessGate permission="MANAGE_STUDENTS_IMPORT" fallback={<Navigate to="/" />}>
                  <StudentImportManager
                    activeProfile={activeProfile!}
                    schools={schools}
                    onClose={() => navigate('/')}
                  />
                </AccessGate>
              } />

              <Route path="/controle-nutricional" element={
                <AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}>
                  <UnifiedNutritionalPanel onNavigate={(view) => navigate(`/${view}`)} />
                </AccessGate>
              } />

              <Route path="/simulador-nutricional" element={
                <AccessGate permission="USE_NUTRITIONAL_SIMULATOR" fallback={<Navigate to="/" />}>
                  <div className="p-8">
                    <NutritionalImpactSimulator onClose={() => navigate('/controle-nutricional')} />
                  </div>
                </AccessGate>
              } />

              <Route path="/risco-nutricional" element={
                <AccessGate permission="VIEW_RISK_INDICATORS" fallback={<Navigate to="/" />}>
                  <div className="p-8">
                    <NutritionalRiskDashboard onClose={() => navigate('/controle-nutricional')} />
                  </div>
                </AccessGate>
              } />

              <Route path="/vigilancia-preventiva" element={
                <AccessGate permission="MANAGE_PREVENTIVE_REPORTS" fallback={<Navigate to="/" />}>
                  <div className="p-8">
                    <EarlyWarningCenter onClose={() => navigate('/controle-nutricional')} />
                  </div>
                </AccessGate>
              } />

              <Route path="/onboarding" element={<Onboarding />} />

              <Route path="/avaliacao-nutricional" element={
                <NutritionalEvaluationManager
                  onClose={() => navigate('/')}
                />
              } />

              <Route path="/treinamentos" element={
                <AccessGate permission="MANAGE_STAFF" fallback={<Navigate to="/" />}>
                  <TrainingManager
                    onClose={() => navigate('/')}
                  />
                </AccessGate>
              } />

              <Route path="/arquivo" element={<DocumentArchive documents={formalDocs} profiles={profiles} schools={schools} activeProfile={activeProfile} onSelectItem={() => { }} onDelete={async (id) => await deleteDocument(id)} onClose={() => navigate('/')} />} />

              <Route path="/pnae" element={
                <AccessGate permission="VIEW_PROCUREMENT" fallback={<Navigate to="/" />}>
                  <ProcurementManager
                    plans={procurements as any}
                    menuPlans={menuPlans}
                    inventory={inventory}
                    activeProfile={activeProfile}
                    onSave={async (p) => await addProcurement(p as any, activeProfile?.id || '')}
                    onRequestDocument={handleGenerateDocument}
                    onClose={() => navigate('/')}
                  />
                </AccessGate>
              } />

              <Route path="/relatorios" element={
                <ReportingCenter
                  activeProfile={activeProfile}
                  onClose={() => navigate('/')}
                />
              } />

              <Route path="/relatorios-gestao" element={
                <OperationalReports
                  activeProfile={activeProfile}
                  onClose={() => navigate('/')}
                />
              } />

              <Route path="/usuarios" element={
                <AccessGate permission="MANAGE_USERS" fallback={<Navigate to="/" />}>
                  <ProfileManager
                    profiles={profiles}
                    schools={schools}
                    onAdd={addProfile}
                    onUpdate={updateProfile}
                    onDelete={deleteProfile}
                    onClose={() => navigate('/')}
                    activeUser={activeProfile}
                  />
                </AccessGate>
              } />

              <Route path="/configuracoes" element={
                <AccessGate permission="MANAGE_SYSTEM_SETTINGS" fallback={<Navigate to="/" />}>
                  <InstitutionalSettings config={letterhead} onUpdate={async (c) => await updateLetterhead(c)} onClose={() => navigate('/')} />
                </AccessGate>
              } />

              <Route path="/logs" element={
                <AccessGate permission="VIEW_LOGS" fallback={<Navigate to="/" />}>
                  <SystemLogManager onClose={() => navigate('/')} />
                </AccessGate>
              } />
              <Route path="/conformidade" element={
                <AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}>
                  <ComplianceDashboard />
                </AccessGate>
              } />

              <Route path="/evolucao" element={
                <AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}>
                  <EvolutionDashboard onClose={() => navigate('/')} />
                </AccessGate>
              } />

              <Route path="/manual" element={<UserManual activeProfile={activeProfile} onClose={() => navigate('/')} />} />

              <Route path="/sobre" element={<AboutSystem config={letterhead} onClose={() => navigate('/')} />} />
              <Route path="/projeto/tr" element={<SystemTR />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <div className="no-print print-hidden">
          <NotificationCenter />
          <QuickActionsFAB />
        </div>
      </div >
    </ErrorBoundary >
  );
};

// Helper for sub-tabs in inventory
const InventoryRouter: React.FC<any> = ({ navigate }) => {
  const { tab } = useParams();
  const tabMap: Record<string, string> = {
    'dashboard': 'DASHBOARD',
    'entrada': 'RECEIVING',
    'catalogo': 'CATALOG',
    'fornecedores': 'SUPPLIERS',
    'saida': 'DISTRIBUTION',
    'escola': 'SCHOOL_STOCK'
  };

  return (
    <InventoryManager
      onClose={() => navigate('/')}
      initialTab={tabMap[tab || ''] || 'DASHBOARD'}
    />
  );
};

import TransparencyPanel from './pages/public/TransparencyPanel';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <AppProviders>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/transparencia" element={<TransparencyPanel />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </AppProviders>
      </HelmetProvider>
    </BrowserRouter>
  );
};

export default App;
