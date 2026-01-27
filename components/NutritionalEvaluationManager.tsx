
import React, { useState, useMemo } from 'react';
import { NutritionalEvaluation, EducationalStage, School, UserProfile, UserRole, GeneratedContent, DocStatus, Student } from '../types';
import { generateNutritionalDiagnosis } from '../services/geminiService';
import { documentService, OfficialDocType } from '../services/documentService';
import { documentGenerator } from '../services/documentGeneratorService';
import { studentService } from '../services/studentService';
import { NutritionalDiagnosisForm } from './NutritionalDiagnosis/NutritionalDiagnosisForm';
import { usePNAE } from '../contexts/PNAEContext';
import ResultDisplay from './ResultDisplay';

import { useNutrition } from '../contexts/NutritionContext';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface NutritionalEvaluationManagerProps {
  onClose: () => void;
}

const NutritionalEvaluationManager: React.FC<NutritionalEvaluationManagerProps> = ({ onClose }) => {
  const { evaluations, addEvaluation: onSave } = useNutrition();
  const { schools } = useSchools();
  const { activeProfile } = useUsers();
  const navigate = useNavigate();

  const { letterhead } = usePNAE();
  const [activeTab, setActiveTab] = useState<'diagnose' | 'records' | 'reports'>('reports');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<NutritionalEvaluation | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ id: string, data: GeneratedContent } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null); // For history view

  // Student Search/Evaluation State
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [evaluationStudent, setEvaluationStudent] = useState<Student | null>(null);

  // Load students when diagnose tab is active
  useMemo(() => {
    if (activeTab === 'diagnose' && students.length === 0) {
      studentService.getAllStudents().then(setStudents).catch(console.error);
    }
  }, [activeTab]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchName = s.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSchool = filterSchool ? s.escolaId === filterSchool : true;
      // Filter by user's school if not admin/nutritionist
      const userSchool = (activeProfile?.role !== UserRole.ADMIN && activeProfile?.role !== UserRole.NUTRICIONISTA && activeProfile?.role !== UserRole.SECRETARIO)
        ? s.escolaId === activeProfile?.school_id
        : true;

      return matchName && matchSchool && userSchool;
    });
  }, [students, searchTerm, filterSchool, activeProfile]);

  // Form State
  const [formData, setFormData] = useState({
    iniciaisAluno: '',
    sexo: 'F' as 'M' | 'F',
    dataNascimento: '', // NEW
    turno: 'MATUTINO' as 'MATUTINO' | 'VESPERTINO' | 'INTEGRAL', // NEW
    idadeAnos: 0,
    escolaId: '',
    etapa: EducationalStage.FUNDAMENTAL_I,
    serie: '',
    professor: '',
    contatoResponsaveis: '',
    peso: 0,
    estatura: 0,
    condicoesClinicas: '',
    necessidadesEspeciais: ''
  });

  const [currentDiagnosis, setCurrentDiagnosis] = useState('');

  // Auto-calculate age from birth date
  useMemo(() => {
    if (formData.dataNascimento) {
      const birth = new Date(formData.dataNascimento);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age >= 0 && age !== formData.idadeAnos) {
        setFormData(prev => ({ ...prev, idadeAnos: age }));
      }
    }
  }, [formData.dataNascimento]);

  const imc = useMemo(() => {
    if (formData.peso > 0 && formData.estatura > 0) {
      const heightInMeters = formData.estatura / 100;
      return Number((formData.peso / (heightInMeters * heightInMeters)).toFixed(2));
    }
    return 0;
  }, [formData.peso, formData.estatura]);

  const handleGenerateDiagnosis = async () => {
    if (!formData.iniciaisAluno || formData.peso <= 0 || formData.estatura <= 0) {
      alert("Por favor, preencha as iniciais, peso e estatura corretamente.");
      return;
    }
    setIsGenerating(true);
    setCurrentDiagnosis('');
    try {
      const diagnosis = await generateNutritionalDiagnosis({
        ...formData,
        imc,
        sexoLabel: formData.sexo === 'M' ? 'Masculino' : 'Feminino'
      });
      setCurrentDiagnosis(diagnosis);
    } catch (error) {
      alert("Erro ao processar diagnóstico nutricional. Verifique sua conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!currentDiagnosis) {
      alert("Gere o diagnóstico antes de salvar.");
      return;
    }

    // Lógica simples de risco (Ex: IMC > 25 ou < 18.5)
    const isRisk = imc > 25 || imc < 18.5 || !!formData.condicoesClinicas;

    try {
      await onSave({
        ...formData,
        imc,
        diagnosticoDescritivo: currentDiagnosis,
        riscoIdentificado: isRisk
      }, activeProfile?.id || '');

      // ARQUIVAMENTO OFICIAL: Laudo Nutricional
      if (activeProfile) {
        const schoolName = schools.find(s => s.id === formData.escolaId)?.nome || 'Não informada';
        const laudoContent = documentGenerator.generateNutritionalAppraisal({
          aluno: formData.iniciaisAluno,
          idade: `${formData.idadeAnos} anos`,
          sexo: formData.sexo === 'M' ? 'Masculino' : 'Feminino',
          escola: schoolName,
          status: isRisk ? 'ALERTA / MONITORAMENTO' : 'NORMAL / EUTROFIA',
          diagnostico: currentDiagnosis
        });

        await documentService.saveDocument(
          OfficialDocType.PARECER_TECNICO,
          `LAUDO NUTRICIONAL - ${formData.iniciaisAluno}`,
          activeProfile.id,
          laudoContent
        );
      }

      // Reset
      setFormData({
        iniciaisAluno: '',
        sexo: 'F',
        dataNascimento: '',
        turno: 'MATUTINO',
        idadeAnos: 0,
        escolaId: '',
        etapa: EducationalStage.FUNDAMENTAL_I,
        serie: '',
        professor: '',
        contatoResponsaveis: '',
        peso: 0,
        estatura: 0,
        condicoesClinicas: '',
        necessidadesEspeciais: ''
      });
      setCurrentDiagnosis('');
      setActiveTab('reports'); // Redireciona para ver o impacto no dashboard
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar avaliação.");
    }
  };

  const stats = useMemo(() => {
    const total = evaluations.length;
    const risks = evaluations.filter(e => e.riscoIdentificado).length;

    // 1. Classification Breakdown
    const byClassification = evaluations.reduce((acc, curr) => {
      // Use the actual classification from the evaluation, or fallback
      const cat = curr.classificacaoImc || 'NAO_CLASSIFICADO';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 2. Etapa Breakdown
    const byEtapa = evaluations.reduce((acc, curr) => {
      acc[curr.etapa] = (acc[curr.etapa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Special Needs / Allergies
    const specialNeedsCount = evaluations.filter(e =>
      (e.condicoesClinicas && e.condicoesClinicas.length > 0) ||
      (e.necessidadesEspeciais && e.necessidadesEspeciais.length > 0)
    ).length;

    // 4. Avg BMI by Age Group & Sex
    const avgBmiByGroup = evaluations.reduce((acc, curr) => {
      let group = '16+';
      if (curr.idadeAnos <= 5) group = '0-5';
      else if (curr.idadeAnos <= 10) group = '6-10';
      else if (curr.idadeAnos <= 15) group = '11-15';

      const key = `${group}-${curr.sexo}`;
      if (!acc[key]) acc[key] = { sum: 0, count: 0 };

      acc[key].sum += curr.imc;
      acc[key].count += 1;

      return acc;
    }, {} as Record<string, { sum: number, count: number }>);

    return { total, risks, byEtapa, byClassification, specialNeedsCount, avgBmiByGroup };
  }, [evaluations]);

  const handleGenerateOfficialReport = () => {
    const reportData = {
      totalAvaliacoes: stats.total,
      alunosEmRisco: stats.risks,
      distribuicaoPorClassificacao: stats.byClassification,
      mediaImcPorGrupo: Object.entries(stats.avgBmiByGroup).reduce((acc, [key, val]) => {
        // Explicit cast to fix TS error, though inferred type matches the shape
        const groupStats = val as { sum: number, count: number };
        if (groupStats.count === 0) {
          acc[key] = '-';
        } else {
          acc[key] = (groupStats.sum / groupStats.count).toFixed(2);
        }
        return acc;
      }, {} as Record<string, string>)
    };

    const docContent = documentGenerator.generateManagementReport(
      "RELATÓRIO DE VIGILÂNCIA NUTRICIONAL",
      reportData,
      new Date().getFullYear()
    );
    setPreviewDoc({
      id: `report-${Date.now()}`,
      data: docContent
    });
  };

  const handleGenerateAnnualReport = () => {
    // Passar o objeto stats completo conforme esperado pelo gerador
    const docContent = documentGenerator.generateAnnualNutritionalSurveillanceReport(
      { stats },
      new Date().getFullYear()
    );

    setPreviewDoc({
      id: `annual-report-${Date.now()}`,
      data: docContent
    });
  };


  const handleExportCSV = () => {
    if (evaluations.length === 0) return;

    const headers = ['Data', 'Iniciais', 'Sexo', 'Nascimento', 'Turno', 'Idade', 'Escola', 'Etapa', 'Série', 'Peso', 'Estatura', 'IMC', 'Risco', 'Diagnostico'];
    const rows = evaluations.map(ev => {
      const school = schools.find(s => s.id === ev.escolaId)?.nome || 'N/A';
      return [
        new Date(ev.created_at).toLocaleDateString(),
        ev.iniciaisAluno,
        ev.sexo,
        ev.dataNascimento || 'N/A',
        ev.turno || 'N/A',
        ev.idadeAnos,
        school,
        ev.etapa,
        ev.serie || 'N/A',
        ev.peso,
        ev.estatura,
        ev.imc.toFixed(2),
        ev.riscoIdentificado ? 'Sim' : 'Não',
        `"${ev.diagnosticoDescritivo.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_nutricional_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg font-black border border-amber-500">⚖️</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Diagnóstico Nutricional Escolar</h2>
            <p className="text-slate-500 text-sm">Vigilância Alimentar e Nutricional - Brotas de Macaúbas/BA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['diagnose', 'records', 'reports'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab === 'diagnose' ? 'Nova Avaliação' : tab === 'records' ? 'Histórico' : 'Relatórios'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>


      {/* TAB: DIAGNOSE (SEARCH & EVALUATE) */}
      {activeTab === 'diagnose' && !evaluationStudent && (
        <div className="space-y-6 animate-in hover:fade-in duration-300">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white p-2 rounded-2xl border border-slate-200 flex items-center px-4 shadow-sm">
              <span className="text-slate-400 mr-2">🔍</span>
              <input
                placeholder="Buscar aluno por nome..."
                className="flex-1 border-none focus:ring-0 text-sm font-medium outline-none bg-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {(activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.SECRETARIO) && (
              <select
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase text-slate-600 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
                value={filterSchool}
                onChange={e => setFilterSchool(e.target.value)}
              >
                <option value="">Todas as Escolas</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            )}
          </div>

          {/* Results List */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-2xl mb-4">🚫</div>
                <p className="text-slate-500 font-medium">Nenhum aluno encontrado.</p>
                <p className="text-xs text-slate-400 mt-1">Tente buscar por outro nome ou escola.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Idade</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Escola</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => {
                      const ageMonths = studentService.calculateAgeInMonths(student.dataNascimento);
                      const years = Math.floor(ageMonths / 12);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-800 uppercase">{student.nome}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-500">{years} anos</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase text-slate-400">{schools.find(s => s.id === student.escolaId)?.nome || '---'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setEvaluationStudent(student)}
                              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all"
                            >
                              Avaliar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVALUATION FORM (Inline Page View) */}
      {evaluationStudent && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <NutritionalDiagnosisForm
            student={evaluationStudent}
            activeProfile={activeProfile}
            onClose={() => setEvaluationStudent(null)}
            onSaveSuccess={async () => {
              setEvaluationStudent(null);
            }}
          />
        </div>
      )}

      {/* TAB: RECORDS */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Aluno (Iniciais)</th>
                  <th className="px-6 py-4">Etapa</th>
                  <th className="px-6 py-4">Escola</th>
                  <th className="px-6 py-4 text-center">IMC</th>
                  <th className="px-6 py-4">Status Risco</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluations.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">Nenhuma avaliação registrada no banco de dados.</td></tr>
                ) : (
                  [...evaluations].reverse().map(ev => {
                    const school = schools.find(s => s.id === ev.escolaId);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-mono text-slate-500">{new Date(ev.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-black text-slate-800 tracking-widest">{ev.iniciaisAluno}</td>
                        <td className="px-6 py-4"><span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{ev.etapa}</span></td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{school?.nome || 'Não informada'}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">{ev.imc.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${ev.riscoIdentificado ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                            {ev.riscoIdentificado ? 'Em Monitoramento' : 'Eutrofia / Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedEvaluation(ev)}
                            className="text-amber-600 hover:text-amber-700 text-[10px] font-black uppercase underline"
                          >
                            Ver Diagnóstico
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: REPORTS (INDICADORES OFICIAIS) */}
      {activeTab === 'reports' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-12 -translate-y-12 opacity-50"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Amostra Global</p>
              <h3 className="text-4xl font-black text-slate-900">{stats.total}</h3>
              <p className="text-[9px] font-bold text-amber-600 uppercase mt-2">Alunos Avaliados</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden border-l-4 border-l-red-500">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risco Nutricional</p>
              <h3 className="text-4xl font-black text-red-600">{stats.risks}</h3>
              <p className="text-[9px] font-bold text-red-400 uppercase mt-2 underline decoration-red-200">Em Monitoramento Ativo</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Necessidades Especiais</p>
              <h3 className="text-4xl font-black text-indigo-600">{stats.specialNeedsCount}</h3>
              <p className="text-[9px] font-bold text-indigo-400 uppercase mt-2">Condições/Alergias</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cobertura de Ensino</p>
              <h3 className="text-4xl font-black text-emerald-600">{Object.keys(stats.byEtapa).length}</h3>
              <p className="text-[9px] font-bold text-emerald-500 uppercase mt-2">Etapas Monitoradas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 2. OFFICIAL CLASSIFICATION CHART */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <span className="w-5 h-5 bg-amber-600 rounded-lg flex items-center justify-center text-[10px] text-white">📊</span>
                Estado Nutricional (SISVAN)
              </h4>

              <div className="space-y-6">
                {Object.entries(stats.byClassification).map(([cls, count]) => {
                  const pct = stats.total > 0 ? (Number(count) / stats.total) * 100 : 0;
                  let color = 'bg-slate-400';
                  if (cls.includes('EUTROFIA')) color = 'bg-emerald-500';
                  if (cls.includes('SOBREPESO')) color = 'bg-amber-500';
                  if (cls.includes('OBESIDADE')) color = 'bg-red-500';
                  if (cls.includes('GRAVE')) color = 'bg-red-800';
                  if (cls.includes('MAGREZA')) color = 'bg-indigo-500';

                  return (
                    <div key={cls} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{cls.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] font-black text-slate-800">{count} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(stats.byClassification).length === 0 && <p className="text-center text-xs text-slate-400 italic">Sem dados suficientes para gráfico.</p>}
              </div>
            </div>

            {/* 3. AVG BMI TABLE (AGE/SEX) */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <span className="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] text-white">📈</span>
                Média de IMC por Faixa Etária
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="border-b border-slate-100 text-slate-400 uppercase font-black tracking-widest text-left">
                    <tr>
                      <th className="pb-4 pl-4">Faixa Etária</th>
                      <th className="pb-4 text-center">Masculino (Média)</th>
                      <th className="pb-4 text-center">Feminino (Média)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-bold">
                    {['0-5', '6-10', '11-15', '16+'].map(group => {
                      const maleStats = stats.avgBmiByGroup[`${group}-M`];
                      const femaleStats = stats.avgBmiByGroup[`${group}-F`];
                      const maleAvg = maleStats ? (maleStats.sum / maleStats.count).toFixed(2) : '-';
                      const femaleAvg = femaleStats ? (femaleStats.sum / femaleStats.count).toFixed(2) : '-';

                      return (
                        <tr key={group} className="hover:bg-slate-50">
                          <td className="py-4 pl-4">{group} Anos</td>
                          <td className="py-4 text-center text-indigo-600">{maleAvg}</td>
                          <td className="py-4 text-center text-rose-500">{femaleAvg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mt-8 text-[9px] text-slate-400 leading-relaxed text-center">
                  * Dados calculados com base na média aritmética simples das avaliações do período vigente.
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <button
                  onClick={handleGenerateOfficialReport}
                  className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>🖨️</span> Relatório Gerencial (Resumo)
                </button>

                <button
                  onClick={handleGenerateAnnualReport}
                  className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>📑</span> Relatório Anual Oficial (PNAE)
                </button>
              </div>
            </div>
          </div>

          {/* Action Banner Removed/Replaced */}
        </div>
      )}

      {/* RISK MAP MODAL */}
      {
        showRiskModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Mapa Completo de Vulnerabilidade</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Classificação por Coeficiente de Risco Institucional</p>
                </div>
                <button onClick={() => setShowRiskModal(false)} className="p-4 hover:bg-white rounded-[24px] text-slate-400 transition-all border border-transparent hover:border-slate-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-6">
                {(() => {
                  const schoolRisks = schools.map(s => {
                    const schoolEvals = evaluations.filter(e => e.escolaId === s.id);
                    const risks = schoolEvals.filter(e => e.riscoIdentificado).length;
                    return {
                      name: s.nome,
                      total: schoolEvals.length,
                      riskCount: risks,
                      riskPct: schoolEvals.length > 0 ? (risks / schoolEvals.length) * 100 : 0
                    };
                  }).sort((a, b) => b.riskPct - a.riskPct);

                  return schoolRisks.map(risk => (
                    <div key={risk.name} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xs ${risk.total === 0 ? 'bg-slate-200' :
                          risk.riskPct > 50 ? 'bg-red-500 shadow-lg shadow-red-100' :
                            risk.riskPct > 20 ? 'bg-amber-500 shadow-lg shadow-amber-100' :
                              'bg-emerald-500 shadow-lg shadow-emerald-100'
                          }`}>
                          {risk.riskPct.toFixed(0)}%
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase tracking-tight">{risk.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                            {risk.total} Alunos • {risk.riskCount} em Risco
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden mx-8">
                        <div
                          className={`h-full transition-all duration-1000 ${risk.riskPct > 50 ? 'bg-red-500' :
                            risk.riskPct > 20 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                          style={{ width: `${risk.riskPct}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${risk.total === 0 ? 'text-slate-300' :
                          risk.riskPct > 50 ? 'text-red-600' :
                            risk.riskPct > 20 ? 'text-amber-600' :
                              'text-emerald-600'
                          }`}>
                          {risk.total === 0 ? 'Sem Dados' : risk.riskPct > 50 ? 'Crítico' : risk.riskPct > 20 ? 'Alerta' : 'Estável'}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center max-w-lg">
                  Este mapa reflete dados consolidados de vigilância ativa. Escolas em estado crítico devem receber prioridade em intervenções de educação alimentar.
                </p>
              </div>
            </div>
          </div>
        )
      }

      {/* DIAGNOSIS DETAIL MODAL */}
      {
        selectedEvaluation && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300 print:relative print:bg-white print:p-0 print:z-0">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 print:shadow-none print:rounded-none print:max-w-none">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl">📋</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Prontuário Individual</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registrado em {new Date(selectedEvaluation.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <span>🖨️</span> Imprimir PDF
                  </button>
                  <button onClick={() => setSelectedEvaluation(null)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* PRINT HEADER (HIDDEN ON SCREEN) */}
              <div className="hidden print:block p-12 text-center border-b-2 border-slate-900 mb-8">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Prefeitura Municipal de Brotas de Macaúbas</p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Laudo Técnico de Vigilância Nutricional</h2>
                <p className="text-xs font-bold text-slate-400 uppercase mt-4">Programa Nacional de Alimentação Escolar - PNAE</p>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] print:max-h-none print:overflow-visible">
                {/* STUDENT INFO GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Iniciais / Nome</p>
                    <p className="text-sm font-black text-slate-800">{selectedEvaluation.iniciaisAluno}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sexo / Idade</p>
                    <p className="text-sm font-black text-slate-800">{selectedEvaluation.sexo === 'M' ? 'Masculino' : 'Feminino'} • {selectedEvaluation.idadeAnos} Anos</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Série / Professor</p>
                    <p className="text-sm font-black text-slate-800">{selectedEvaluation.serie || 'N/A'} • {selectedEvaluation.professor || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unidade Escolar</p>
                    <p className="text-sm font-black text-slate-800 truncate">{schools.find(s => s.id === selectedEvaluation.escolaId)?.nome || 'Não informada'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Peso / Estatura</p>
                    <p className="text-sm font-black text-slate-800">{selectedEvaluation.peso}kg / {selectedEvaluation.estatura}m</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">IMC</p>
                    <p className="text-xl font-black text-slate-900">{selectedEvaluation.imc.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status Risco</p>
                    <span className={`text-[10px] font-black uppercase ${selectedEvaluation.riscoIdentificado ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selectedEvaluation.riscoIdentificado ? 'Monitoramento' : 'Eutrofia'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Contato Responsáveis</p>
                    <p className="text-xs font-bold text-slate-600">{selectedEvaluation.contatoResponsaveis || 'N/A'}</p>
                  </div>
                </div>

                {/* CLINICAL CONTEXT */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contexto Clínico e Especial</h4>
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 print:bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Condições/Alergias</p>
                        <p className="text-xs text-slate-700 font-medium">{selectedEvaluation.condicoesClinicas || 'Nenhuma informada'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Necessidades Especiais</p>
                        <p className="text-xs text-slate-700 font-medium">{selectedEvaluation.necessidadesEspeciais || 'Nenhuma informada'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TECHNICAL DIAGNOSIS */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Parecer Técnico-Nutricional Escolar</h4>
                  <div className="p-8 bg-slate-900 rounded-[32px] text-slate-100 relative overflow-hidden print:bg-white print:text-slate-900 print:border-2 print:border-slate-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full blur-3xl print:hidden"></div>
                    <p className="text-sm leading-relaxed italic font-medium relative z-10 whitespace-pre-wrap opacity-90 print:opacity-100">
                      {selectedEvaluation.diagnosticoDescritivo}
                    </p>
                  </div>
                </div>

                {/* PRINT SIGNATURE AREA (HIDDEN ON SCREEN) */}
                <div className="hidden print:flex justify-between items-end pt-20 mt-12 border-t-2 border-slate-100">
                  <div className="text-center w-64 border-t border-slate-300 pt-4">
                    <p className="text-[10px] font-black uppercase text-slate-900">Assinatura do Nutricionista</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Responsável Técnico / SISVAN</p>
                  </div>
                  <div className="text-center w-64 border-t border-slate-300 pt-4">
                    <p className="text-[10px] font-black uppercase text-slate-900">Assinatura da Coordenação</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">SME Brotas de Macaúbas</p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end print:hidden">
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Fechar Prontuário
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* RESULT PREVIEW MODAL */}
      {
        previewDoc && (
          <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-5xl h-[90vh] overflow-y-auto p-4 shadow-2xl relative">
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute top-8 right-8 z-[130] bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all"
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
                activeProfile={activeProfile}
              />
            </div>
          </div>
        )
      }
    </div >
  );
};

export default NutritionalEvaluationManager;

