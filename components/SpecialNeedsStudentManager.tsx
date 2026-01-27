import React, { useState, useMemo } from 'react';
import { StudentNE, School, UserRole, EducationalStage, FoodNeedType, LetterheadConfig } from '../types';
import { generateStudentNEReport } from '../services/geminiService';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';
import { useDocuments } from '../contexts/DocumentContext';
import { useNavigate } from 'react-router-dom';

interface SpecialNeedsStudentManagerProps {
  onClose: () => void;
}

const SpecialNeedsStudentManager: React.FC<SpecialNeedsStudentManagerProps> = ({ onClose }) => {
  const { studentsNE: students, schools, addStudentNE: onAdd, toggleStudentNE: onToggle } = useSchools();
  const { activeProfile } = useUsers();
  const { letterhead } = usePNAE();
  const { setGeneratedContent: onResult } = useDocuments();
  const navigate = useNavigate();
  // The original onClose prop is used to close the component.
  // The line below was redefining onClose, which is likely a bug.
  // If the intention was to navigate to '/' when the component closes,
  // this logic should be placed where the onClose prop is actually called.
  // For now, removing the redefinition to avoid shadowing the prop.
  // const onClose = () => navigate('/');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    escolaId: '',
    etapa: EducationalStage.FUNDAMENTAL_I,
    turno: 'MATUTINO',
    tipoNecessidade: FoodNeedType.ALERGIA,
    alimentosRestritos: '',
    necessitaAdaptacao: true,
    possuiLaudo: false,
    observacoes: '',
    alimentosAceitos: '',
    nomePai: '',
    nomeMae: '',
    endereco: '',
    foto: '' as string | undefined
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.escolaId) return;
    try {
      await onAdd({ ...formData, ativo: true });
      setFormData({
        nome: '', escolaId: '', etapa: EducationalStage.FUNDAMENTAL_I,
        turno: 'MATUTINO', tipoNecessidade: FoodNeedType.ALERGIA,
        alimentosRestritos: '', necessitaAdaptacao: true, possuiLaudo: false,
        observacoes: '', alimentosAceitos: '',
        nomePai: '', nomeMae: '', endereco: '', foto: ''
      });
    } catch (err) {
      alert("Erro ao cadastrar aluno NE.");
    }
  };

  const handleGenerateReport = async (student: StudentNE) => {
    const school = schools.find(s => s.id === student.escolaId);
    if (!school) return;
    setIsLoading(true);
    try {
      const result = await generateStudentNEReport(student, school.nome, letterhead);
      onResult(result);
    } catch (e) {
      alert("Falha na geração da ficha técnica.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg font-black border border-rose-500">❤️</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Necessidades Alimentares Especiais</h2>
            <p className="text-slate-500 text-sm font-medium italic">Gestão de Inclusão e Dietas • SME Brotas de Macaúbas</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULÁRIO DE CADASTRO */}
        {canEdit && (
          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-6 h-fit sticky top-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>➕</span> Novo Aluno NE
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Iniciais / Nome Completo (LGPD)</label>
                <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Escola</label>
                <select value={formData.escolaId} onChange={e => setFormData({ ...formData, escolaId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold" required>
                  <option value="">Selecione...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Etapa</label>
                  <select value={formData.etapa} onChange={e => setFormData({ ...formData, etapa: e.target.value as any })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black">
                    {Object.values(EducationalStage).map(et => <option key={et} value={et}>{et.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Tipo de NE</label>
                  <select value={formData.tipoNecessidade} onChange={e => setFormData({ ...formData, tipoNecessidade: e.target.value as any })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black">
                    {Object.values(FoodNeedType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Alimentos Restritos (Ex: Leite, Glúten)</label>
                <input type="text" value={formData.alimentosRestritos} onChange={e => setFormData({ ...formData, alimentosRestritos: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Nome do Pai</label>
                  <input type="text" value={formData.nomePai} onChange={e => setFormData({ ...formData, nomePai: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Nome da Mãe</label>
                  <input type="text" value={formData.nomeMae} onChange={e => setFormData({ ...formData, nomeMae: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Endereço Residencial</label>
                <input type="text" value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Foto do Aluno (3x4)</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] text-slate-400 font-bold">3x4</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-[10px] text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white hover:file:bg-black cursor-pointer" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Possui Laudo?</span>
                  <input type="checkbox" checked={formData.possuiLaudo} onChange={e => setFormData({ ...formData, possuiLaudo: e.target.checked })} className="rounded text-rose-600 focus:ring-rose-500" />
                </label>
                <label className="flex-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Adaptação?</span>
                  <input type="checkbox" checked={formData.necessitaAdaptacao} onChange={e => setFormData({ ...formData, necessitaAdaptacao: e.target.checked })} className="rounded text-rose-600 focus:ring-rose-500" />
                </label>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">Cadastrar Registro</button>
            </form>
          </div>
        )}

        {/* LISTAGEM POR ESCOLA */}
        <div className={`${canEdit ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
          {schools.map(school => {
            const schoolStudents = students.filter(s => s.escolaId === school.id);
            if (schoolStudents.length === 0) return null;
            return (
              <div key={school.id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl shadow-sm">🏫</div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{school.nome}</h4>
                  </div>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{schoolStudents.length} Alunos NE</span>
                </div>

                <div className="divide-y divide-slate-50">
                  {schoolStudents.map(student => (
                    <div key={student.id} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center group">
                      <div className="flex gap-4">
                        <div className="w-12 h-16 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 shadow-inner">
                          {student.foto ? (
                            <img src={student.foto} alt={student.nome} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">Sem Foto</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-800 uppercase">{student.nome}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${student.possuiLaudo ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {student.possuiLaudo ? 'Laudo OK' : 'Sem Laudo'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-none">{student.tipoNecessidade.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-slate-400 font-medium italic">Restrição: {student.alimentosRestritos}</p>
                            {(student.nomeMae || student.nomePai) && (
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                                Pais: {student.nomeMae || 'N/C'} • {student.nomePai || 'N/C'}
                              </p>
                            )}
                            {student.endereco && (
                              <p className="text-[8px] text-slate-400 font-medium uppercase tracking-tight truncate max-w-xs">{student.endereco}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleGenerateReport(student)}
                          disabled={isLoading}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
                        >
                          Ficha IA
                        </button>
                        {canEdit && (
                          <button onClick={async () => await onToggle(student.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {students.length === 0 && (
            <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center text-slate-400 italic">
              Nenhum aluno com necessidade alimentar especial cadastrado no censo.
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-800 text-center space-y-4">
        <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em]">Compliance LGPD e PNAE</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed italic max-w-3xl mx-auto">
          "O registro de saúde escolar deve ser tratado com rastro de acesso rigoroso. Este módulo não armazena diagnósticos médicos completos, apenas as diretrizes alimentares necessárias para a produção segura da merenda. A guarda dos laudos físicos permanece na unidade escolar sob responsabilidade da direção."
        </p>
      </div>
    </div>
  );
};

export default SpecialNeedsStudentManager;
