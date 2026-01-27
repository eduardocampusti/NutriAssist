import React, { useState, useMemo } from 'react';
import { TrainingSession, School, UserProfile, UserRole, Cook, GeneratedContent, DocStatus } from '../types';
import { documentService, OfficialDocType } from '../services/documentService';
import { documentGenerator } from '../services/documentGeneratorService';
import ResultDisplay from './ResultDisplay';

import { useNutrition } from '../contexts/NutritionContext';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';
import { useNavigate } from 'react-router-dom';

const TEMAS_PADRAO = [
  "Boas práticas de manipulação de alimentos",
  "Higiene pessoal e do ambiente escolar",
  "Armazenamento correto dos gêneros alimentícios",
  "Preparo adequado e técnicas culinárias",
  "Controle de desperdícios e sustentabilidade",
  "Atenção às necessidades alimentares especiais",
  "Normas e diretrizes do PNAE"
];

interface TrainingManagerProps {
  onClose: () => void;
}

const TrainingManager: React.FC<TrainingManagerProps> = ({ onClose }) => {
  const { trainings, addTraining: onSave } = useNutrition();
  const { schools, cooks } = useSchools();
  const { activeProfile } = useUsers();
  const { letterhead } = usePNAE();
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'analytics'>('register');
  const [formData, setFormData] = useState({
    tema: '',
    data: new Date().toISOString().split('T')[0],
    escolasParticipantesIds: [] as string[],
    cooksParticipantesIds: [] as string[],
    conteudoProgramatico: '',
    numParticipantes: 0,
    metodologia: 'Presencial / Teórico-Prática',
    observacoes: '',
    materialUrls: [] as string[],
    newMaterialUrl: '',
    cargaHoraria: 1
  });

  const [previewDoc, setPreviewDoc] = useState<{ id: string, data: GeneratedContent } | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleToggleSchool = (schoolId: string) => {
    const isRemoving = formData.escolasParticipantesIds.includes(schoolId);

    setFormData(prev => {
      const newSchools = isRemoving
        ? prev.escolasParticipantesIds.filter(id => id !== schoolId)
        : [...prev.escolasParticipantesIds, schoolId];

      // Se remover a escola, remove os cooks dela também
      const newCooks = isRemoving
        ? prev.cooksParticipantesIds.filter(cid => cooks.find(c => c.id === cid)?.escolaId !== schoolId)
        : prev.cooksParticipantesIds;

      return {
        ...prev,
        escolasParticipantesIds: newSchools,
        cooksParticipantesIds: newCooks
      };
    });
  };

  const handleToggleCook = (cookId: string) => {
    setFormData(prev => ({
      ...prev,
      cooksParticipantesIds: prev.cooksParticipantesIds.includes(cookId)
        ? prev.cooksParticipantesIds.filter(id => id !== cookId)
        : [...prev.cooksParticipantesIds, cookId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tema || formData.escolasParticipantesIds.length === 0) {
      alert("Por favor, preencha o tema e selecione ao menos uma escola.");
      return;
    }

    try {
      const { newMaterialUrl, ...rest } = formData;
      const trainingToSave = {
        ...rest,
        numParticipantes: formData.cooksParticipantesIds.length || formData.numParticipantes,
        data: new Date(formData.data).getTime()
      };

      await onSave(trainingToSave, activeProfile?.id || '');

      // ARQUIVAMENTO OFICIAL: Ata de Treinamento
      if (activeProfile) {
        const content = documentGenerator.generateManagementReport(
          `TREINAMENTO: ${formData.tema} `,
          {
            data: formData.data,
            cargaHoraria: `${formData.cargaHoraria} h`,
            participantes: trainingToSave.numParticipantes,
            conteudo: formData.conteudoProgramatico
          },
          new Date(formData.data).getFullYear()
        );

        await documentService.saveDocument(
          OfficialDocType.RELATORIO_MENSAL,
          `ATA DE TREINAMENTO - ${formData.tema} `,
          activeProfile.id,
          content
        );
      }

      setFormData({
        tema: '', data: new Date().toISOString().split('T')[0],
        escolasParticipantesIds: [], cooksParticipantesIds: [],
        conteudoProgramatico: '', numParticipantes: 0, cargaHoraria: 1,
        metodologia: 'Presencial / Teórico-Prática', observacoes: '',
        materialUrls: [], newMaterialUrl: ''
      });
      setActiveTab('history');
      alert("Capacitação registrada e Ata Arquivada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar capacitação.");
    }
  };

  const handleIssueCertificate = async (cook: Cook, session: TrainingSession) => {
    if (!activeProfile) return;

    try {
      const certContent = documentGenerator.generateTrainingCertificate(cook.nome, session);
      const docId = await documentService.saveDocument(
        OfficialDocType.PARECER_TECNICO, // Using technical doc base for certificates if generic cert type not in enum
        `CERTIFICADO: ${cook.nome} - ${session.tema} `,
        activeProfile.id,
        certContent,
        session.id
      );

      setPreviewDoc({ id: docId, data: certContent });
    } catch (err) {
      console.error(err);
      alert("Erro ao emitir certificado.");
    }
  };

  const stats = useMemo(() => {
    const totalTrainings = trainings.length;
    const totalHours = trainings.reduce((acc, curr) => acc + curr.cargaHoraria, 0);
    const trainedSchoolsCount = new Set(trainings.flatMap(t => t.escolasParticipantesIds)).size;

    return { totalTrainings, totalHours, trainedSchoolsCount };
  }, [trainings]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg border border-indigo-500 font-black">👩‍🍳</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Capacitação Técnica PNAE</h2>
            <p className="text-slate-500 text-sm">Educação Permanente para Manipuladores • Brotas de Macaúbas/BA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['register', 'history', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px - 4 py - 1.5 text - [10px] font - black uppercase tracking - widest rounded - lg transition - all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  } `}
              >
                {tab === 'register' ? 'Novo Registro' : tab === 'history' ? 'Arquivo' : 'Indicadores'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* TAB: REGISTER */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span>📝</span> Dados da Sessão Formativa
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Tema</label>
                  <select
                    value={formData.tema}
                    onChange={e => setFormData({ ...formData, tema: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold"
                  >
                    <option value="">Selecione o tema...</option>
                    {TEMAS_PADRAO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Data</label>
                  <input type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Carga Horária (h)</label>
                  <input type="number" value={formData.cargaHoraria} onChange={e => setFormData({ ...formData, cargaHoraria: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Conteúdo Programático</label>
                <textarea
                  value={formData.conteudoProgramatico}
                  onChange={e => setFormData({ ...formData, conteudoProgramatico: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Mateiais de Apoio (Links)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newMaterialUrl}
                    onChange={e => setFormData({ ...formData, newMaterialUrl: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs"
                    placeholder="Cole o link do PDF ou Vídeo..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.newMaterialUrl) {
                        setFormData(prev => ({
                          ...prev,
                          materialUrls: [...prev.materialUrls, prev.newMaterialUrl],
                          newMaterialUrl: ''
                        }));
                      }
                    }}
                    className="bg-slate-100 px-4 py-2 rounded-lg text-[10px] font-black uppercase"
                  >
                    Adicionar
                  </button>
                </div>
                {formData.materialUrls.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.materialUrls.map((url, i) => (
                      <div key={i} className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded flex justify-between">
                        <span className="truncate">{url}</span>
                        <button type="button" onClick={() => setFormData(v => ({ ...v, materialUrls: v.materialUrls.filter((_, idx) => idx !== i) }))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={!canEdit}
                  className="w-full md:w-auto bg-slate-900 hover:bg-black text-white font-black px-12 py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
                >
                  Confirmar e Arquivar Ata
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span>🛡️</span> Lista de Presença Técnica
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {schools.map(school => {
                  const schoolCooks = cooks.filter(c => c.escolaId === school.id && c.ativo);
                  if (schoolCooks.length === 0) return null;

                  return (
                    <div key={school.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSchool(school.id)}
                        className={`w - full text - left p - 2 rounded - lg text - [9px] font - black uppercase transition - all ${formData.escolasParticipantesIds.includes(school.id) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} `}
                      >
                        {school.nome}
                      </button>

                      {formData.escolasParticipantesIds.includes(school.id) && (
                        <div className="grid grid-cols-1 gap-1 ml-4 border-l-2 border-indigo-100 pl-3">
                          {schoolCooks.map(cook => (
                            <button
                              key={cook.id}
                              type="button"
                              onClick={() => handleToggleCook(cook.id)}
                              className={`flex items - center justify - between p - 2 rounded - lg text - [10px] font - bold border transition - all ${formData.cooksParticipantesIds.includes(cook.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'} `}
                            >
                              <span>{cook.nome}</span>
                              {formData.cooksParticipantesIds.includes(cook.id) ? '✅' : '⚪'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                <span className="text-[10px] font-black text-indigo-700 uppercase">{formData.cooksParticipantesIds.length} Profissionais Presentes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tema</th>
                  <th className="px-6 py-4 text-center">Presenças</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainings.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic font-bold uppercase tracking-widest opacity-30">Sem registros.</td></tr>
                ) : (
                  [...trainings].reverse().map(t => (
                    <tr key={t.id} className={`hover: bg - slate - 50 transition - colors cursor - pointer ${selectedSession?.id === t.id ? 'bg-indigo-50/50' : ''} `} onClick={() => setSelectedSession(t)}>
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-500">{new Date(t.data).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-black text-slate-800 uppercase text-xs">{t.tema}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{t.numParticipantes} Profissionais</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 font-black text-[10px] uppercase underline">Detalhes</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedSession && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase">{selectedSession.tema}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase">Sessão em {new Date(selectedSession.data).toLocaleDateString()} • {selectedSession.cargaHoraria} Horas</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="text-slate-400 uppercase text-[10px] font-black">Fechar Detalhes</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lista de Presença & Certificação</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedSession.cooksParticipantesIds.length > 0 ? (
                      selectedSession.cooksParticipantesIds.map(cid => {
                        const cook = cooks.find(c => c.id === cid);
                        if (!cook) return null;
                        return (
                          <div key={cid} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-xs font-bold text-slate-700">{cook.nome}</p>
                              <p className="text-[9px] text-slate-400 uppercase">{schools.find(s => s.id === cook.escolaId)?.nome}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleIssueCertificate(cook, selectedSession); }}
                              className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              Emitir Certificado
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhuma merendeira vinculada individualmente nesta ata.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Materiais de Apoio</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.materialUrls?.length ? selectedSession.materialUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100">
                          <span>📄</span> Material {i + 1}
                        </a>
                      )) : <p className="text-[10px] text-slate-400 italic font-bold">Nenhum material anexado.</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Histórico de Atas Oficiais</h4>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Ata Homologada e Arquivada</span>
                      <button className="text-[9px] font-black text-emerald-700 underline uppercase">Ver Protocolo</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacitações Realizadas</span>
            <p className="text-4xl font-black text-slate-800 mt-2">{stats.totalTrainings}</p>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Horária Acumulada</span>
            <p className="text-4xl font-black text-indigo-600 mt-2">{stats.totalHours}h</p>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escolas Atendidas</span>
            <p className="text-4xl font-black text-emerald-600 mt-2">{stats.trainedSchoolsCount} / {schools.length}</p>
          </div>

          <div className="md:col-span-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Top Temas por Frequência</h3>
            <div className="space-y-4">
              {TEMAS_PADRAO.map(tema => {
                const count = trainings.filter(t => t.tema === tema).length;
                const percentage = trainings.length ? (count / trainings.length) * 100 : 0;
                if (count === 0) return null;
                return (
                  <div key={tema} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-600">
                      <span>{tema}</span>
                      <span>{count} Sessões</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all" style={{ width: `${percentage}% ` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-5xl h-[90vh] overflow-y-auto p-4 shadow-2xl relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-8 right-8 z-[110] bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all"
            >
              ✕
            </button>
            <ResultDisplay
              documentId={previewDoc.id}
              data={previewDoc.data}
              status={DocStatus.ARQUIVADO}
              aiDrafts={[]}
              workflowHistory={[]}
              onClose={() => setPreviewDoc(null)}
              letterhead={letterhead}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManager;

