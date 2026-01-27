import React, { useState, useMemo } from 'react';
import { exportToCSV } from '../utils/export';
import { School, EducationalStage, UserRole, UserProfile } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';

interface SchoolManagerProps {
  onClose: () => void;
}

type TabType = 'IDENTIFICACAO' | 'EDUCACIONAL' | 'GESTAO';

const SchoolManager: React.FC<SchoolManagerProps> = ({
  onClose
}) => {
  const { schools, addSchool: onAdd, updateSchool: onUpdate, toggleSchool: onToggle } = useSchools();
  const { activeProfile } = useUsers();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('IDENTIFICACAO');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<School, 'id' | 'created_at' | 'ativo'>>({
    nome: '',
    codigo_inep: '',
    tipo_unidade: 'ESCOLA',
    localidade: '',
    zona: 'SEDE',
    zona_id: 'SEDE',
    endereco: '',
    municipio: 'BROTAS DE MACAÚBAS - BA',
    numAlunos: 0,
    numAlunosNE: 0,
    etapas: [],
    turnos: ['MATUTINO', 'VESPERTINO'],
    diretor: '',
    telefone: '',
    email: '',
    observacoes: ''
  });

  const isAllowedToEdit = activeProfile?.role === UserRole.ADMIN ||
    activeProfile?.role === UserRole.NUTRICIONISTA ||
    activeProfile?.role === UserRole.TECNICO ||
    activeProfile?.role === UserRole.SECRETARIO;

  const filteredSchools = useMemo(() => {
    return schools.filter(s =>
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo_inep.includes(searchTerm)
    );
  }, [schools, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) {
      addToast("O Nome da Unidade Escolar é obrigatório.", 'warning');
      return;
    }

    try {
      if (editingId) {
        await onUpdate(editingId, formData);
        setEditingId(null);
      } else {
        await onAdd(formData);
      }

      setIsAdding(false);
      resetForm();
      addToast("Operação realizada com sucesso. Dados integrados ao PNAE.", 'success');
    } catch (error) {
      console.error(error);
      addToast("Erro ao realizar operação técnica.", 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '', codigo_inep: '', tipo_unidade: 'ESCOLA', localidade: '', zona: 'SEDE', zona_id: 'SEDE',
      endereco: '', municipio: 'BROTAS DE MACAÚBAS - BA', numAlunos: 0,
      numAlunosNE: 0, etapas: [], turnos: ['MATUTINO', 'VESPERTINO'],
      diretor: '', telefone: '', email: '', observacoes: ''
    });
    setActiveTab('IDENTIFICACAO');
  };

  const handleEdit = (school: School) => {
    setFormData({ ...school });
    setEditingId(school.id);
    setIsAdding(true);
  };

  const toggleEtapa = (etapa: EducationalStage) => {
    setFormData(prev => ({
      ...prev,
      etapas: prev.etapas.includes(etapa) ? prev.etapas.filter(e => e !== etapa) : [...prev.etapas, etapa]
    }));
  };

  const handleExport = () => {
    const dataToExport = schools.map(s => ({
      Nome: s.nome,
      INEP: s.codigo_inep,
      Zona: s.zona,
      Localidade: s.localidade,
      Alunos: s.numAlunos,
      'Alunos NE': s.numAlunosNE,
      Etapas: s.etapas.join(', '),
      Diretor: s.diretor,
      Telefone: s.telefone,
      Situacao: s.ativo ? 'ATIVA' : 'INATIVA'
    }));

    exportToCSV(dataToExport, `escolas_brotar_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">

      {/* HEADER INSTITUCIONAL */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-emerald-500 font-black">🏫</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight">Unidades Escolares</h2>
            <p className="text-slate-500 text-sm font-medium italic">Base de Lotação e Censo PNAE • Brotas de Macaúbas</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">


          // ... inside render ...
          {isAllowedToEdit && !isAdding && (
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                title="Baixar Planilha"
              >
                <span>📊</span> Exportar
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
              >
                <span>➕</span> Cadastrar Unidade
              </button>
            </div>
          )}
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {isAdding ? (
        /* FORMULÁRIO TÉCNICO */
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <header className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editingId ? 'Atualizar Dados da Unidade' : 'Credenciamento de Unidade Escolar'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Conformidade com o Censo Escolar Vigente</p>
            </div>
          </header>

          <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10 overflow-x-auto custom-scrollbar">
            {(['IDENTIFICACAO', 'EDUCACIONAL', 'GESTAO'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {tab === 'IDENTIFICACAO' ? '1. Identificação' : tab === 'EDUCACIONAL' ? '2. Dados do Censo' : '3. Gestão e Contato'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {activeTab === 'IDENTIFICACAO' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Nome Oficial da Unidade</label>
                    <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800" placeholder="EX: ESCOLA MUNICIPAL CASTELO BRANCO" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Código INEP (MEC)</label>
                    <input type="text" value={formData.codigo_inep} onChange={e => setFormData({ ...formData, codigo_inep: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-mono font-bold" placeholder="00000000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Localidade (Pov./Distrito/Bairro)</label>
                    <input type="text" value={formData.localidade} onChange={e => setFormData({ ...formData, localidade: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800" placeholder="EX: CENTRO, LAGOA NOVA, ETC" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Zona Escolar</label>
                    <select
                      value={formData.zona}
                      onChange={e => setFormData({ ...formData, zona: e.target.value as any, zona_id: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase"
                    >
                      <option value="SEDE">SEDE (URBANA)</option>
                      <option value="RURAL">ZONA RURAL (CAMPO)</option>
                      <option value="COCAL">COCAL</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Tipo de Unidade</label>
                    <select value={formData.tipo_unidade} onChange={e => setFormData({ ...formData, tipo_unidade: e.target.value as any })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase">
                      <option value="ESCOLA">ESCOLA REGULAR</option>
                      <option value="CRECHE">CRECHE / C.M.E.I</option>
                      <option value="ANEXO">ANEXO ESCOLAR</option>
                      <option value="OUTROS">OUTROS</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Endereço Completo</label>
                  <input type="text" value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm" placeholder="Rua, Número, Bairro ou Localidade Rural" />
                </div>
              </div>
            )}

            {activeTab === 'EDUCACIONAL' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-600 uppercase block ml-1">Total de Matrículas Ativas</label>
                    <input type="number" value={formData.numAlunos} onChange={e => setFormData({ ...formData, numAlunos: Number(e.target.value) })} className="w-full bg-emerald-50 border-none rounded-2xl px-5 py-4 text-xl font-black text-emerald-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-rose-600 uppercase block ml-1">Alunos com Necessidades Especiais (NE)</label>
                    <input type="number" value={formData.numAlunosNE} onChange={e => setFormData({ ...formData, numAlunosNE: Number(e.target.value) })} className="w-full bg-rose-50 border-none rounded-2xl px-5 py-4 text-xl font-black text-rose-700" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Modalidades de Ensino Ofertadas</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.values(EducationalStage).map(etapa => (
                      <button
                        key={etapa} type="button"
                        onClick={() => toggleEtapa(etapa)}
                        className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase border transition-all ${formData.etapas.includes(etapa) ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                      >
                        {etapa.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'GESTAO' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Diretor(a) Responsável</label>
                    <input type="text" value={formData.diretor} onChange={e => setFormData({ ...formData, diretor: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Telefone / WhatsApp</label>
                    <input type="text" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" placeholder="(77) 90000-0000" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">E-mail Institucional</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Observações Técnicas / Cozinha / Infraestrutura</label>
                  <textarea value={formData.observacoes} onChange={e => setFormData({ ...formData, observacoes: e.target.value })} className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-5 text-sm" rows={4} placeholder="Ex: Possui fogão industrial, freezers operacionais. Cozinha com boa ventilação..." />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-10 border-t border-slate-100">
              <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Descartar Cadastro</button>
              <div className="flex gap-4">
                {activeTab !== 'IDENTIFICACAO' && (
                  <button type="button" onClick={() => {
                    const tabs: TabType[] = ['IDENTIFICACAO', 'EDUCACIONAL', 'GESTAO'];
                    setActiveTab(tabs[tabs.indexOf(activeTab) - 1]);
                  }} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Voltar</button>
                )}
                {activeTab !== 'GESTAO' ? (
                  <button type="button" onClick={() => {
                    const tabs: TabType[] = ['IDENTIFICACAO', 'EDUCACIONAL', 'GESTAO'];
                    setActiveTab(tabs[tabs.indexOf(activeTab) + 1]);
                  }} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl">Próxima Etapa</button>
                ) : (
                  <button type="submit" className="px-12 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl">
                    {editingId ? 'Salvar Alterações' : 'Efetivar Unidade'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div >
      ) : (
        /* LISTAGEM INSTITUCIONAL */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 px-6 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-emerald-300 transition-all">
              <span className="text-xl opacity-30">🔍</span>
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar por nome ou INEP..." className="w-full bg-transparent border-none py-4 text-sm font-bold text-slate-700 outline-none" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-emerald-900 text-white font-black text-[9px] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Unidade Escolar / INEP</th>
                    <th className="px-6 py-6 text-center">Localidade</th>
                    <th className="px-6 py-6 text-center">Matrículas</th>
                    <th className="px-6 py-6 text-center text-rose-300">Alunos NE</th>
                    <th className="px-6 py-6 text-center">Prioridade Técnica</th>
                    <th className="px-6 py-6 text-center">Situação</th>
                    <th className="px-8 py-6 text-right">Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchools.map(school => (
                    <tr key={school.id} className={`hover:bg-slate-50 transition-colors group ${!school.ativo ? 'opacity-40 grayscale' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{school.nome}</span>
                          <span className="text-[10px] font-mono text-slate-400">INEP: {school.codigo_inep || '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${school.zona === 'RURAL' ? 'bg-amber-50 text-amber-600 border-amber-100' : school.zona === 'COCAL' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {school.zona}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{school.localidade}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-xs font-black text-slate-900">{school.numAlunos}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-xs font-black ${school.numAlunosNE > 0 ? 'text-rose-600' : 'text-slate-300'}`}>{school.numAlunosNE}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${school.prioridade_nivel === 'ALTA' ? 'bg-red-500 text-white' :
                            school.prioridade_nivel === 'MÉDIA' ? 'bg-amber-500 text-white' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                            {school.prioridade_nivel || 'BAIXA'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 mt-1">{school.prioridade_score?.toFixed(0) || 0} pts</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => onToggle(school.id)}
                          className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase border transition-all ${school.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                        >
                          {school.ativo ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(school)} className="p-2.5 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all" title="Editar Unidade">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER - RESUMO DE REDE */}
      {
        !isAdding && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Capacidade Instalada</p>
              <p className="text-4xl font-black">{schools.filter(s => s.ativo).length} Escolas Ativas</p>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrículas Atendidas</p>
              <p className="text-4xl font-black text-slate-900">{schools.filter(s => s.ativo).reduce((acc, s) => acc + s.numAlunos, 0)}</p>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-2">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Demanda NE Mapeada</p>
              <p className="text-4xl font-black text-rose-700">{schools.filter(s => s.ativo).reduce((acc, s) => acc + s.numAlunosNE, 0)}</p>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default SchoolManager;
