import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { AppProviders } from './contexts/AppProviders';
import { useUsers } from './contexts/UserContext';
import { useSchools } from './contexts/SchoolContext';
import { useInventory } from './contexts/InventoryContext';
import { useDocuments } from './contexts/DocumentContext';
import { useMenu } from './contexts/MenuContext';
import { usePNAE } from './contexts/PNAEContext';
import { useToast } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout Components
import AppShell from './components/Layout/AppShell';
import { AccessGate } from './components/Security/AccessGate';
import { ErrorBoundary } from './components/Security/ErrorBoundary';

/**
 * Trava de Segurança: Captura o hash de recuperação do Supabase (#type=recovery)
 * e força o redirecionamento para a página de troca de senha.
 * Impede que o usuário caia logado no dashboard ao clicar no e-mail.
 */
const SecurityRecoveryLock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash.includes('type=recovery')) {
      console.warn("🔐 Trava de Segurança: Link de recuperação detectado. Forçando redirecionamento.");
      navigate('/reset-password', { replace: true });
    }
  }, [location.hash, navigate]);

  return null;
};

// Page & Feature Components (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const NotFound = lazy(() => import('./pages/NotFound'));
const TechnicalNoteForm = lazy(() => import('./components/TechnicalNoteForm'));
const ResultDisplay = lazy(() => import('./components/ResultDisplay'));
const SchoolManager = lazy(() => import('./components/SchoolManager'));
const CookManager = lazy(() => import('./components/CookManager'));
const StudentManager = lazy(() => import('./components/Students/StudentManager'));
const SpecialNeedsStudentManager = lazy(() => import('./components/SpecialNeedsStudentManager'));
const OccurrenceManager = lazy(() => import('./components/Inventory/OccurrenceManager'));
const InstitutionalReportManager = lazy(() => import('./components/InstitutionalReportManager'));
const ProfileManager = lazy(() => import('./components/ProfileManager'));
const DocumentArchive = lazy(() => import('./components/DocumentArchive'));
const InstitutionalSettings = lazy(() => import('./components/InstitutionalSettings'));
const InventoryManager = lazy(() => import('./components/InventoryManager'));
const NutritionalEvaluationManager = lazy(() => import('./components/NutritionalEvaluationManager'));
const TrainingManager = lazy(() => import('./components/TrainingManager'));
const ProcurementManager = lazy(() => import('./components/ProcurementManager'));
const InstitutionalDashboard = lazy(() => import('./components/InstitutionalDashboard'));
const MenuIntegrationManager = lazy(() => import('./components/MenuIntegrationManager'));
const MerendeiraTerminal = lazy(() => import('./components/MerendeiraTerminal'));
const SchoolDirectorDashboard = lazy(() => import('./components/SchoolDirectorDashboard'));
const NucleoDashboard = lazy(() => import('./components/NucleoDashboard'));
const StudentImportManager = lazy(() => import('./components/Students/StudentImportManager'));
const AboutSystem = lazy(() => import('./components/AboutSystem'));
const SystemLogManager = lazy(() => import('./components/SystemLogManager'));
const BackupManager = lazy(() => import('./components/BackupManager'));
const UserManual = lazy(() => import('./components/UserManual'));
const SystemTR = lazy(() => import('./components/SystemTR'));
const ReportingCenter = lazy(() => import('./components/Reporting/ReportingCenter'));
const OperationalReports = lazy(() => import('./components/Reporting/OperationalReports'));
const DistributionReceiptView = lazy(() => import('./components/Inventory/DistributionReceiptView'));
const UnifiedNutritionalPanel = lazy(() => import('./components/UnifiedNutritionalPanel'));
const NutritionalImpactSimulator = lazy(() => import('./components/NutritionalImpactSimulator'));
const NutritionalRiskDashboard = lazy(() => import('./components/NutritionalRiskDashboard'));
const EarlyWarningCenter = lazy(() => import('./components/EarlyWarningCenter'));
const ForcePasswordChange = lazy(() => import('./components/Security/ForcePasswordChange'));
const ComplianceDashboard = lazy(() => import('./components/ComplianceDashboard'));
const EvolutionDashboard = lazy(() => import('./components/EvolutionDashboard'));
const TransparencyPanel = lazy(() => import('./pages/public/TransparencyPanel'));
const FNDEImportManager = lazy(() => import('./components/FNDEImportManager'));
const SchoolNutritionalDashboard = lazy(() => import('./components/SchoolNutritionalDashboard'));
const SecretaryExecutiveDashboard = lazy(() => import('./components/SecretaryExecutiveDashboard'));
const PublicTransparencyPanel = lazy(() => import('./components/PublicTransparencyPanel'));
const InternalEvolutionRanking = lazy(() => import('./components/InternalEvolutionRanking'));
const PreparacoesManager = lazy(() => import('./components/PreparacoesManager'));

// Types
import { UserRole, DocStatus, FormalDocument } from './types';

const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-brand-500 uppercase tracking-widest animate-pulse">Carregando Módulo...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { profiles, activeProfile, isLoading } = useUsers();
  const { schools } = useSchools();
  const { inventory, movements, addMovement } = useInventory();
  const { formalDocs, docTypes, generatedContent, currentDocId, currentDocStatus, setGeneratedContent, setCurrentDocId, setCurrentDocStatus, setIsGenerating, isGenerating, addDocument, updateDocumentStatus, deleteDocument } = useDocuments();
  const { executeMenu } = useMenu();
  const { letterhead, addProcurement, updateLetterhead } = usePNAE();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (isLoading) return <LoadingScreen />;
  if (activeProfile?.senha_provisoria) return <Suspense fallback={<LoadingScreen />}><ForcePasswordChange /></Suspense>;

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
      addToast("Erro ao gerar documento.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<LoadingScreen />}>
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
                <NucleoDashboard activeProfile={activeProfile} />
              ) : (
                <InstitutionalDashboard onNavigate={(view) => navigate(`/${view}`)} />
              )
            } />

            <Route path="/terminal" element={<MerendeiraTerminal activeProfile={activeProfile} school={schools.find(s => s.id === activeProfile?.school_id)} inventory={inventory} movements={movements} onRegisterConsumption={async (mov) => await addMovement(mov, activeProfile?.id || '')} onClose={() => navigate('/')} />} />
            <Route path="/elaborar" element={<TechnicalNoteForm onSubmit={handleGenerateDocument} isLoading={isGenerating} schools={schools} docTypes={docTypes.length > 0 ? docTypes : [{ id: '1', label: 'Parecer Técnico', category: 'PARECER', active: true, description: 'Parecer padrão' }]} activeProfile={activeProfile} />} />
            <Route path="/elaborar/resultado/:id" element={generatedContent ? <ResultDisplay documentId={currentDocId} data={generatedContent} status={currentDocStatus} aiDrafts={[]} workflowHistory={[]} activeProfile={activeProfile} letterhead={letterhead} onClose={() => navigate('/')} onUpdateStatus={async (s) => { setCurrentDocStatus(s); await updateDocumentStatus(currentDocId, s); }} /> : <Navigate to="/" />} />
            <Route path="/cardapio" element={<MenuIntegrationManager onClose={() => navigate('/')} initialTab="planos" />} />
            <Route path="/estoque" element={<InventoryManager onClose={() => navigate('/')} initialTab="DASHBOARD" />} />
            <Route path="/estoque/recebimento" element={<ProtectedRoute><DistributionReceiptView school={schools.find(s => s.id === activeProfile?.school_id)!} activeProfile={activeProfile!} /></ProtectedRoute>} />
            <Route path="/estoque/contingencia" element={<ProtectedRoute><OccurrenceManager /></ProtectedRoute>} />
            <Route path="/estoque/:tab" element={<InventoryRouter navigate={navigate} />} />
            <Route path="/escolas" element={<AccessGate permission="MANAGE_SCHOOLS" fallback={<Navigate to="/" />}><SchoolManager onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/merendeiras" element={<CookManager onClose={() => navigate('/')} />} />
            <Route path="/alunos" element={<AccessGate permission="VIEW_STUDENTS_SENSITIVE" fallback={<Navigate to="/" />}><StudentManager schools={schools} activeProfile={activeProfile} onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/importar-alunos" element={<AccessGate permission="MANAGE_STUDENTS_IMPORT" fallback={<Navigate to="/" />}><StudentImportManager activeProfile={activeProfile!} schools={schools} onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/controle-nutricional" element={<AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}><UnifiedNutritionalPanel onNavigate={(view) => navigate(`/${view}`)} /></AccessGate>} />
            <Route path="/fichas-tecnicas" element={<AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}><div className="p-4 sm:p-8"><PreparacoesManager onClose={() => navigate('/')} /></div></AccessGate>} />
            <Route path="/simulador-nutricional" element={<AccessGate permission="USE_NUTRITIONAL_SIMULATOR" fallback={<Navigate to="/" />}><div className="p-4 sm:p-8"><NutritionalImpactSimulator onClose={() => navigate('/controle-nutricional')} /></div></AccessGate>} />
            <Route path="/risco-nutricional" element={<AccessGate permission="VIEW_RISK_INDICATORS" fallback={<Navigate to="/" />}><div className="p-4 sm:p-8"><NutritionalRiskDashboard onClose={() => navigate('/controle-nutricional')} /></div></AccessGate>} />
            <Route path="/vigilancia-preventiva" element={<AccessGate permission="MANAGE_PREVENTIVE_REPORTS" fallback={<Navigate to="/" />}><div className="p-4 sm:p-8"><EarlyWarningCenter onClose={() => navigate('/controle-nutricional')} /></div></AccessGate>} />
            <Route path="/avaliacao-nutricional" element={<NutritionalEvaluationManager onClose={() => navigate('/')} />} />
            <Route path="/treinamentos" element={<AccessGate permission="MANAGE_STAFF" fallback={<Navigate to="/" />}><TrainingManager onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/arquivo" element={<DocumentArchive documents={formalDocs} profiles={profiles} schools={schools} activeProfile={activeProfile} onSelectItem={() => { }} onDelete={async (id) => await deleteDocument(id)} onClose={() => navigate('/')} />} />
            <Route path="/pnae" element={<AccessGate permission="VIEW_PROCUREMENT" fallback={<Navigate to="/" />}><ProcurementManager plans={[]} menuPlans={[]} inventory={inventory} activeProfile={activeProfile} onSave={async () => { }} onRequestDocument={handleGenerateDocument} onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/relatorios" element={<ReportingCenter activeProfile={activeProfile} onClose={() => navigate('/')} />} />
            <Route path="/relatorios-gestao" element={<OperationalReports activeProfile={activeProfile} onClose={() => navigate('/')} />} />
            <Route path="/usuarios" element={<AccessGate permission="MANAGE_USERS" fallback={<Navigate to="/" />}><ProfileManager profiles={profiles} schools={schools} onAdd={async () => { }} onUpdate={async () => { }} onDelete={async () => { }} onClose={() => navigate('/')} activeUser={activeProfile} /></AccessGate>} />
            <Route path="/configuracoes" element={<AccessGate permission="MANAGE_SYSTEM_SETTINGS" fallback={<Navigate to="/" />}><InstitutionalSettings config={letterhead} onUpdate={async (c) => await updateLetterhead(c)} onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/logs" element={<AccessGate permission="VIEW_LOGS" fallback={<Navigate to="/" />}><SystemLogManager onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/conformidade" element={<AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}><ComplianceDashboard /></AccessGate>} />
            <Route path="/evolucao" element={<AccessGate permission="VIEW_REPORTS_TECHNICAL" fallback={<Navigate to="/" />}><EvolutionDashboard onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/painel-fnde" element={<AccessGate permission="VIEW_NUTRITIONAL_PANEL" fallback={<Navigate to="/" />}><SchoolNutritionalDashboard onBack={() => navigate('/controle-nutricional')} /></AccessGate>} />
            <Route path="/painel-secretario" element={<AccessGate permission="VIEW_SECRETARY_PANEL" fallback={<Navigate to="/" />}><SecretaryExecutiveDashboard /></AccessGate>} />
            <Route path="/transparencia-pnae" element={<PublicTransparencyPanel />} />
            <Route path="/ranking-evolucao" element={<AccessGate permission="VIEW_INTERNAL_RANKING" fallback={<Navigate to="/" />}><InternalEvolutionRanking /></AccessGate>} />
            <Route path="/manual" element={<UserManual activeProfile={activeProfile} onClose={() => navigate('/')} />} />
            <Route path="/sobre" element={<AboutSystem config={letterhead} onClose={() => navigate('/')} />} />
            <Route path="/importar-fnde" element={<AccessGate permission="MANAGE_FNDE_IMPORT" fallback={<Navigate to="/" />}><FNDEImportManager activeProfile={activeProfile!} onClose={() => navigate('/')} /></AccessGate>} />
            <Route path="/projeto/tr" element={<SystemTR />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
};

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

  return <InventoryManager onClose={() => navigate('/')} initialTab={tabMap[tab || ''] || 'DASHBOARD'} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <AppProviders>
          <SecurityRecoveryLock />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/transparencia" element={<TransparencyPanel />} />
              <Route path="/*" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </AppProviders>
      </HelmetProvider>
    </BrowserRouter>
  );
};

export default App;
