import React, { useState, useMemo, useRef } from 'react';
import { Cook, School, UserRole, UserProfile } from '../types';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';

interface CookManagerProps {
  onClose: () => void;
}

type TabType = 'IDENTIFICACAO' | 'VINCULO' | 'OPERACAO' | 'OBSERVACOES';

const CookManager: React.FC<CookManagerProps> = ({
  onClose
}) => {
  const { cooks, schools, addCook: onAdd, updateCook: onUpdate, toggleCook: onToggle } = useSchools();
  const { activeProfile } = useUsers();
  const { letterhead } = usePNAE();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('IDENTIFICACAO');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Cook, 'id' | 'created_at' | 'ativo'>>({
    nome: '',
    cpf: '',
    foto: '',
    dataNascimento: '',
    email: '',
    matricula: '',
    escolaId: '',
    funcao: 'MERENDEIRA',
    turno: 'MANHA',
    vinculo: 'CONTRATADA',
    situacao: 'ATIVA',
    telefone: '',
    permissaoConsumo: true,
    permissaoEstoque: true,
    permissaoCardapio: true,
    observacoes: ''
  });

  const isAllowedToEdit = activeProfile?.role === UserRole.ADMIN ||
    activeProfile?.role === UserRole.NUTRICIONISTA ||
    activeProfile?.role === UserRole.TECNICO ||
    activeProfile?.role === UserRole.SECRETARIO;

  const filteredCooks = useMemo(() => {
    return cooks.filter(c =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm)
    );
  }, [cooks, searchTerm]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf || !formData.escolaId) {
      alert("Nome, CPF e Unidade Escolar são obrigatórios para a vinculação técnica.");
      return;
    }

    try {
      if (editingId) {
        await onUpdate(editingId, formData);
        setEditingId(null);
      } else {
        await onAdd({ ...formData, ativo: true });
      }

      setIsAdding(false);
      resetForm();
      alert("Registro de manipulador processado com rastro de auditoria.");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar manipulador.");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '', cpf: '', foto: '', dataNascimento: '', email: '', matricula: '',
      escolaId: '', funcao: 'MERENDEIRA', turno: 'MANHA', vinculo: 'CONTRATADA',
      situacao: 'ATIVA', telefone: '', permissaoConsumo: true,
      permissaoEstoque: true, permissaoCardapio: true, observacoes: ''
    });
    setActiveTab('IDENTIFICACAO');
  };

  const handleEdit = (cook: Cook) => {
    setFormData({ ...cook });
    setEditingId(cook.id);
    setIsAdding(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">

      {/* SCREEN 1: LIST / DASHBOARD */}
      {!isAdding && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm gap-4 transition-all">
          <div className="flex items-center gap-4 w-full">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-indigo-500 font-black">👩‍🍳</div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight">Cadastro de Merendeiras</h2>
              <p className="text-slate-500 text-sm font-medium italic">Gestão de Manipuladores e Responsabilidade Técnica PNAE</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {isAllowedToEdit && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
              >
                <span>➕</span> Novo Cadastro
              </button>
            )}
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {isAdding ? (
        /* SCREEN 2: FORMULÁRIO (Full Page) */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          {/* FORM HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-emerald-400 font-black">📝</div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight">{editingId ? 'Atualizar Profissional' : 'Novo Credenciamento'}</h2>
                <p className="text-slate-500 text-sm font-medium italic">Preencha os dados do manipulador de alimentos</p>
              </div>
            </div>
            <button onClick={() => { setIsAdding(false); resetForm(); }} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            {/* Note: I removed the inner header that was here previously as we promoted it above */}

            <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10 overflow-x-auto custom-scrollbar">
              {(['IDENTIFICACAO', 'VINCULO', 'OPERACAO', 'OBSERVACOES'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-indigo-500 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  {tab === 'IDENTIFICACAO' ? '1. Identificação' : tab === 'VINCULO' ? '2. Escola e Turno' : tab === 'OPERACAO' ? '3. Permissões de Sistema' : '4. Notas Técnicas'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {activeTab === 'IDENTIFICACAO' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    {/* ÁREA DA FOTO 3x4 */}
                    <div className="space-y-3 flex flex-col items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Foto 3x4 Oficial</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-44 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-all overflow-hidden relative group"
                      >
                        {formData.foto ? (
                          <>
                            <img src={formData.foto} className="w-full h-full object-cover" alt="Avatar" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[9px] font-black text-white uppercase">Trocar Foto</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl grayscale mb-2">📸</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase text-center px-4">Clique para anexar foto</span>
                          </>
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Formatos: JPG, PNG</p>
                    </div>

                    {/* DADOS BÁSICOS */}
                    <div className="flex-1 w-full space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Nome Completo</label>
                          <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">CPF (Obrigatório)</label>
                          <input type="text" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-mono font-bold" placeholder="000.000.000-00" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Telefone / WhatsApp</label>
                          <input type="text" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm" placeholder="(77) 90000-0000" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Matrícula Municipal</label>
                          <input type="text" value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'VINCULO' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Unidade Escolar Vinculada</label>
                      <select
                        value={formData.escolaId}
                        onChange={e => setFormData({ ...formData, escolaId: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-indigo-600 outline-none"
                        required
                      >
                        <option value="">Selecione a Unidade de Lotação...</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Turno de Atuação</label>
                      <select value={formData.turno} onChange={e => setFormData({ ...formData, turno: e.target.value as any })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase">
                        <option value="MANHA">MATUTINO</option>
                        <option value="TARDE">VESPERTINO</option>
                        <option value="INTEGRAL">INTEGRAL (DOIS TURNOS)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Situação Funcional</label>
                      <select value={formData.situacao} onChange={e => setFormData({ ...formData, situacao: e.target.value as any })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase">
                        <option value="ATIVA">ATIVA (EM EXERCÍCIO)</option>
                        <option value="AFASTADA">AFASTADA (LICENÇA/MÉDICO)</option>
                        <option value="INATIVA">INATIVA (DESLIGADA/RESERVISTA)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Tipo de Vínculo</label>
                      <select value={formData.vinculo} onChange={e => setFormData({ ...formData, vinculo: e.target.value as any })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase">
                        <option value="EFETIVA">EFETIVA (CONCURSADA)</option>
                        <option value="CONTRATADA">CONTRATADA (TEMPORÁRIA)</option>
                        <option value="ESTAGIARIA">ESTAGIÁRIA</option>
                        <option value="OUTROS">OUTROS VÍNCULOS</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'OPERACAO' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4 mb-8">
                    <span className="text-3xl">🛡️</span>
                    <div>
                      <p className="text-sm font-black text-indigo-900 uppercase">Habilitação de Terminal Escolar</p>
                      <p className="text-[10px] text-indigo-700 font-medium">Defina as ações que o profissional poderá realizar no sistema da própria escola.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button type="button" onClick={() => setFormData({ ...formData, permissaoConsumo: !formData.permissaoConsumo })} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 text-center ${formData.permissaoConsumo ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-300'}`}>
                      <span className="text-3xl">🍽️</span>
                      <div>
                        <p className="text-xs font-black uppercase">Registrar Consumo</p>
                        <p className="text-[9px] mt-1 opacity-70">Lançamento de pratos servidos</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-all ${formData.permissaoConsumo ? 'bg-emerald-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.permissaoConsumo ? 'left-4.5' : 'left-0.5'}`} /></div>
                    </button>

                    <button type="button" onClick={() => setFormData({ ...formData, permissaoCardapio: !formData.permissaoCardapio })} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 text-center ${formData.permissaoCardapio ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-100 text-slate-300'}`}>
                      <span className="text-3xl">📋</span>
                      <div>
                        <p className="text-xs font-black uppercase">Consultar Cardápio</p>
                        <p className="text-[9px] mt-1 opacity-70">Visualizar orientações da RT</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-all ${formData.permissaoCardapio ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.permissaoCardapio ? 'left-4.5' : 'left-0.5'}`} /></div>
                    </button>

                    <button type="button" onClick={() => setFormData({ ...formData, permissaoEstoque: !formData.permissaoEstoque })} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 text-center ${formData.permissaoEstoque ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-300'}`}>
                      <span className="text-3xl">📦</span>
                      <div>
                        <p className="text-xs font-black uppercase">Ver Estoque Local</p>
                        <p className="text-[9px] mt-1 opacity-70">Monitorar saldos da unidade</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-all ${formData.permissaoEstoque ? 'bg-amber-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.permissaoEstoque ? 'left-4.5' : 'left-0.5'}`} /></div>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'OBSERVACOES' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Informações Adicionais e Prontuário</label>
                    <textarea
                      value={formData.observacoes}
                      onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none"
                      rows={8}
                      placeholder="Ex: Treinamento de Boas Práticas realizado em Ago/2024. Alérgica a determinados produtos de limpeza..."
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-10 border-t border-slate-100">
                <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Descartar Alterações</button>
                <div className="flex gap-4">
                  {activeTab !== 'IDENTIFICACAO' && (
                    <button type="button" onClick={() => {
                      const tabs: TabType[] = ['IDENTIFICACAO', 'VINCULO', 'OPERACAO', 'OBSERVACOES'];
                      setActiveTab(tabs[tabs.indexOf(activeTab) - 1]);
                    }} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Voltar</button>
                  )}
                  {activeTab !== 'OBSERVACOES' ? (
                    <button type="button" onClick={() => {
                      const tabs: TabType[] = ['IDENTIFICACAO', 'VINCULO', 'OPERACAO', 'OBSERVACOES'];
                      setActiveTab(tabs[tabs.indexOf(activeTab) + 1]);
                    }} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">Próximo Passo</button>
                  ) : (
                    <button type="submit" className="px-12 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl">
                      {editingId ? 'Salvar Modificações' : 'Efetivar Cadastro'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* LISTAGEM DE MERENDEIRAS */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 px-6 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-300 transition-all">
              <span className="text-xl opacity-30">🔍</span>
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar por nome ou CPF..." className="w-full bg-transparent border-none py-4 text-sm font-bold text-slate-700 outline-none" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-indigo-900 text-white font-black text-[9px] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Profissional / CPF</th>
                    <th className="px-6 py-6">Escola Vinculada</th>
                    <th className="px-6 py-6 text-center">Turno</th>
                    <th className="px-6 py-6 text-center">Situação Funcional</th>
                    <th className="px-8 py-6 text-right">Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCooks.map(cook => (
                    <tr key={cook.id} className={`hover:bg-slate-50 transition-colors group ${cook.situacao !== 'ATIVA' ? 'opacity-50 grayscale' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                            {cook.foto ? (
                              <img src={cook.foto} className="w-full h-full object-cover" alt={cook.nome} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400 uppercase">
                                {cook.nome.substring(0, 1)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{cook.nome}</span>
                            <span className="text-[10px] font-mono text-slate-400">CPF: {cook.cpf}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {schools.find(s => s.id === cook.escolaId)?.nome || 'Sem Vínculo'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[9px] font-black uppercase text-slate-400">{cook.turno}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase border ${cook.situacao === 'ATIVA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          cook.situacao === 'AFASTADA' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          {cook.situacao}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(cook)} className="p-2.5 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all" title="Editar Registro">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          {isAllowedToEdit && (
                            <button
                              onClick={async () => {
                                if (confirm(`Ao inativar ${cook.nome}, o acesso ao terminal será bloqueado, mas o histórico de consumo será preservado. Confirmar?`)) {
                                  await onToggle(cook.id);
                                }
                              }}
                              className={`p-2.5 rounded-xl transition-all ${cook.ativo ? 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                              title={cook.ativo ? "Inativar" : "Reativar"}
                            >
                              {cook.ativo ? '🚫' : '✅'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCooks.length === 0 && (
                    <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-medium uppercase tracking-widest opacity-30">Nenhum profissional cadastrado na base.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER - RESUMO DE EQUIPE */}
      {!isAdding && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl space-y-2">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total de Manipuladores</p>
            <p className="text-4xl font-black">{cooks.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-2">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Equipe Ativa</p>
            <p className="text-4xl font-black text-slate-900">{cooks.filter(c => c.situacao === 'ATIVA').length}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Afastamentos / Vacância</p>
            <p className="text-4xl font-black text-red-400">{cooks.filter(c => c.situacao !== 'ATIVA').length}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 border border-dashed border-slate-300 p-10 rounded-[40px] text-center space-y-4">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocolo de Rastreabilidade Humana</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed italic max-w-4xl mx-auto">
          "O registro de manipuladores é parte integrante do sistema de Boas Práticas do PNAE. A inativação de cadastros em vez da exclusão garante que o rastro do alimento servido em {letterhead.municipio || 'Brotas de Macaúbas'} possa ser auditado retroativamente por até 5 anos, conforme exigência do FNDE."
        </p>
      </div>

    </div>
  );
};

export default CookManager;
