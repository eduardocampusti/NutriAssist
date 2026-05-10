import React, { useState, useMemo } from 'react';
import { exportToCSV } from '../utils/export';
import { School, EducationalStage, UserRole } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { Building2, Download, Plus, Search, Edit, X, Users, AlertCircle, School as SchoolIcon } from 'lucide-react';

interface SchoolManagerProps { onClose: () => void; }
type TabType = 'IDENTIFICACAO' | 'EDUCACIONAL' | 'GESTAO';

const S = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';
const SH = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13), 0 40px 72px rgba(0,0,0,0.09)';

const SchoolManager: React.FC<SchoolManagerProps> = ({ onClose }) => {
  const { schools, addSchool: onAdd, updateSchool: onUpdate, toggleSchool: onToggle } = useSchools();
  const { activeProfile } = useUsers();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('IDENTIFICACAO');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<School, 'id' | 'created_at' | 'ativo'>>({
    nome: '', codigo_inep: '', tipo_unidade: 'ESCOLA', localidade: '', zona: 'SEDE', zona_id: 'SEDE',
    endereco: '', municipio: 'BROTAS DE MACAÚBAS - BA', numAlunos: 0, numAlunosNE: 0,
    etapas: [], turnos: ['MATUTINO', 'VESPERTINO'], diretor: '', telefone: '', email: '', observacoes: ''
  });

  const isAllowedToEdit = [UserRole.ADMIN, UserRole.NUTRICIONISTA, UserRole.TECNICO, UserRole.SECRETARIO]
    .includes(activeProfile?.role as UserRole);

  const filteredSchools = useMemo(() =>
    schools.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || s.codigo_inep.includes(searchTerm))
  , [schools, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) { addToast("Nome da unidade é obrigatório.", 'warning'); return; }
    try {
      if (editingId) { await onUpdate(editingId, formData); setEditingId(null); }
      else { await onAdd(formData); }
      setIsAdding(false); resetForm();
      addToast("Operação realizada com sucesso.", 'success');
    } catch { addToast("Erro ao salvar dados.", 'error'); }
  };

  const resetForm = () => {
    setFormData({ nome: '', codigo_inep: '', tipo_unidade: 'ESCOLA', localidade: '', zona: 'SEDE', zona_id: 'SEDE',
      endereco: '', municipio: 'BROTAS DE MACAÚBAS - BA', numAlunos: 0, numAlunosNE: 0,
      etapas: [], turnos: ['MATUTINO', 'VESPERTINO'], diretor: '', telefone: '', email: '', observacoes: '' });
    setActiveTab('IDENTIFICACAO');
  };

  const handleEdit = (school: School) => { setFormData({ ...school }); setEditingId(school.id); setIsAdding(true); };
  const toggleEtapa = (etapa: EducationalStage) => setFormData(prev => ({
    ...prev, etapas: prev.etapas.includes(etapa) ? prev.etapas.filter(e => e !== etapa) : [...prev.etapas, etapa]
  }));

  const handleExport = () => {
    exportToCSV(schools.map(s => ({
      Nome: s.nome, INEP: s.codigo_inep, Zona: s.zona, Localidade: s.localidade,
      Alunos: s.numAlunos, 'Alunos NE': s.numAlunosNE, Etapas: s.etapas.join(', '),
      Diretor: s.diretor, Situacao: s.ativo ? 'ATIVA' : 'INATIVA'
    })), `escolas_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const activeSchools = schools.filter(s => s.ativo);
  const totalAlunos = activeSchools.reduce((a, s) => a + s.numAlunos, 0);
  const totalNE = activeSchools.reduce((a, s) => a + s.numAlunosNE, 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }} className="animate-in fade-in duration-500">

      {/* HEADER */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.25)' }}>
            <Building2 style={{ width: 22, height: 22, color: '#065f46' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Unidades Escolares</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Base de Lotação e Censo PNAE · Brotas de Macaúbas</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAllowedToEdit && !isAdding && (<>
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              <Download style={{ width: 14, height: 14 }} /> Exportar
            </button>
            <button onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#059669,#15803d)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
              <Plus style={{ width: 14, height: 14 }} /> Cadastrar Unidade
            </button>
          </>)}
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      {!isAdding && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Escolas Ativas', value: activeSchools.length, icon: SchoolIcon, bg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', iconColor: '#065f46', valColor: '#0f172a' },
            { label: 'Matrículas Atendidas', value: totalAlunos.toLocaleString(), icon: Users, bg: 'linear-gradient(135deg,#dbeafe,#93c5fd)', iconColor: '#1e3a5f', valColor: '#0f172a' },
            { label: 'Alunos c/ Necessidades Especiais', value: totalNE, icon: AlertCircle, bg: 'linear-gradient(135deg,#fff1f2,#fecdd3)', iconColor: '#9f1239', valColor: '#be123c' },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: S, transition: 'all 0.2s ease' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH; el.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = S; el.style.transform = 'translateY(0)'; }}>
              <div style={{ background: k.bg, padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                  <k.icon style={{ width: 18, height: 18, color: k.iconColor }} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: k.iconColor, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{k.label}</span>
              </div>
              <div style={{ padding: '14px 20px 18px' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: k.valColor, letterSpacing: '-0.04em', lineHeight: 1 }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        /* FORMULÁRIO */
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }} className="animate-in slide-in-from-bottom-4 duration-500">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>{editingId ? 'Atualizar Unidade Escolar' : 'Credenciamento de Unidade Escolar'}</h3>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Conformidade com o Censo Escolar Vigente</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
            {(['IDENTIFICACAO', 'EDUCACIONAL', 'GESTAO'] as TabType[]).map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '14px 24px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: 'transparent', color: activeTab === tab ? '#059669' : '#94a3b8',
                borderBottom: activeTab === tab ? '2px solid #059669' : '2px solid transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {i + 1}. {tab === 'IDENTIFICACAO' ? 'Identificação' : tab === 'EDUCACIONAL' ? 'Dados do Censo' : 'Gestão e Contato'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '28px 28px 24px' }}>
            {activeTab === 'IDENTIFICACAO' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="animate-in fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Nome Oficial da Unidade', value: formData.nome, onChange: (v: string) => setFormData({ ...formData, nome: v.toUpperCase() }), placeholder: 'ESCOLA MUNICIPAL CASTELO BRANCO', required: true },
                    { label: 'Código INEP (MEC)', value: formData.codigo_inep, onChange: (v: string) => setFormData({ ...formData, codigo_inep: v }), placeholder: '00000000' },
                    { label: 'Localidade (Pov./Distrito/Bairro)', value: formData.localidade, onChange: (v: string) => setFormData({ ...formData, localidade: v.toUpperCase() }), placeholder: 'CENTRO, LAGOA NOVA...' },
                    { label: 'Endereço Completo', value: formData.endereco, onChange: (v: string) => setFormData({ ...formData, endereco: v }), placeholder: 'Rua, Número, Bairro...' },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} required={f.required}
                        style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Zona Escolar</label>
                    <select value={formData.zona} onChange={e => setFormData({ ...formData, zona: e.target.value as any, zona_id: e.target.value })}
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                      <option value="SEDE">SEDE (Urbana)</option><option value="RURAL">Zona Rural</option><option value="COCAL">Cocal</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Tipo de Unidade</label>
                    <select value={formData.tipo_unidade} onChange={e => setFormData({ ...formData, tipo_unidade: e.target.value as any })}
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                      <option value="ESCOLA">Escola Regular</option><option value="CRECHE">Creche / C.M.E.I</option><option value="ANEXO">Anexo Escolar</option><option value="OUTROS">Outros</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'EDUCACIONAL' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-in fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px 20px' }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Total de Matrículas Ativas</label>
                    <input type="number" value={formData.numAlunos} onChange={e => setFormData({ ...formData, numAlunos: Number(e.target.value) })}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 32, fontWeight: 900, color: '#15803d', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 14, padding: '16px 20px' }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Alunos c/ Necessidades Especiais</label>
                    <input type="number" value={formData.numAlunosNE} onChange={e => setFormData({ ...formData, numAlunosNE: Number(e.target.value) })}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 32, fontWeight: 900, color: '#be123c', fontFamily: 'inherit' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Modalidades de Ensino Ofertadas</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.values(EducationalStage).map(etapa => (
                      <button key={etapa} type="button" onClick={() => toggleEtapa(etapa)} style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s',
                        background: formData.etapas.includes(etapa) ? '#0f172a' : '#f8fafc',
                        color: formData.etapas.includes(etapa) ? '#fff' : '#64748b',
                        border: formData.etapas.includes(etapa) ? '1px solid #0f172a' : '1px solid #e2e8f0',
                        boxShadow: formData.etapas.includes(etapa) ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                      }}>{etapa.replace(/_/g, ' ')}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'GESTAO' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Diretor(a) Responsável', value: formData.diretor, onChange: (v: string) => setFormData({ ...formData, diretor: v.toUpperCase() }), placeholder: 'NOME COMPLETO' },
                    { label: 'Telefone / WhatsApp', value: formData.telefone, onChange: (v: string) => setFormData({ ...formData, telefone: v }), placeholder: '(77) 90000-0000' },
                    { label: 'E-mail Institucional', value: formData.email, onChange: (v: string) => setFormData({ ...formData, email: v }), placeholder: 'escola@edu.ba.gov.br' },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                        style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Observações Técnicas</label>
                  <textarea value={formData.observacoes} onChange={e => setFormData({ ...formData, observacoes: e.target.value })} rows={3}
                    placeholder="Infraestrutura da cozinha, equipamentos, observações..." style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Descartar
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                {activeTab !== 'IDENTIFICACAO' && (
                  <button type="button" onClick={() => { const t: TabType[] = ['IDENTIFICACAO', 'EDUCACIONAL', 'GESTAO']; setActiveTab(t[t.indexOf(activeTab) - 1]); }}
                    style={{ padding: '9px 20px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>
                    Voltar
                  </button>
                )}
                {activeTab !== 'GESTAO' ? (
                  <button type="button" onClick={() => { const t: TabType[] = ['IDENTIFICACAO', 'EDUCACIONAL', 'GESTAO']; setActiveTab(t[t.indexOf(activeTab) + 1]); }}
                    style={{ padding: '9px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#059669,#15803d)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
                    Próxima Etapa →
                  </button>
                ) : (
                  <button type="submit" style={{ padding: '9px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#059669,#15803d)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
                    {editingId ? 'Salvar Alterações' : 'Efetivar Unidade'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Busca */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar por nome ou INEP..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#0f172a', background: 'transparent', fontFamily: 'inherit' }} />
          </div>

          {/* Tabela */}
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)' }}>
                    {['Unidade Escolar / INEP', 'Localidade', 'Matrículas', 'Alunos NE', 'Prioridade', 'Situação', 'Ações'].map((h, i) => (
                      <th key={h} style={{ padding: '14px 18px', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: i >= 2 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school, idx) => (
                    <tr key={school.id} style={{ borderBottom: '1px solid #f8fafc', background: !school.ativo ? '#fafafa' : idx % 2 === 0 ? '#fff' : '#fafeff', opacity: school.ativo ? 1 : 0.5, transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#f0fdf4'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = !school.ativo ? '#fafafa' : idx % 2 === 0 ? '#fff' : '#fafeff'; }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{school.nome}</div>
                        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>INEP: {school.codigo_inep || '—'}</div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          background: school.zona === 'RURAL' ? '#fef3c7' : school.zona === 'COCAL' ? '#faf5ff' : '#eff6ff',
                          color: school.zona === 'RURAL' ? '#92400e' : school.zona === 'COCAL' ? '#6d28d9' : '#1d4ed8',
                          border: `1px solid ${school.zona === 'RURAL' ? '#fde68a' : school.zona === 'COCAL' ? '#ddd6fe' : '#bfdbfe'}` }}>
                          {school.zona}
                        </span>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{school.localidade}</div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{school.numAlunos}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: 15, fontWeight: 800, color: school.numAlunosNE > 0 ? '#be123c' : '#cbd5e1' }}>{school.numAlunosNE}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase',
                          background: school.prioridade_nivel === 'ALTA' ? '#ef4444' : school.prioridade_nivel === 'MÉDIA' ? '#f59e0b' : '#f1f5f9',
                          color: school.prioridade_nivel === 'ALTA' || school.prioridade_nivel === 'MÉDIA' ? '#fff' : '#64748b' }}>
                          {school.prioridade_nivel || 'BAIXA'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button onClick={() => onToggle(school.id)} style={{ padding: '4px 12px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                          background: school.ativo ? '#f0fdf4' : '#f8fafc', color: school.ativo ? '#15803d' : '#94a3b8',
                          border: `1px solid ${school.ativo ? '#bbf7d0' : '#e2e8f0'}` }}>
                          {school.ativo ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(school)} style={{ width: 30, height: 30, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#eff6ff'; el.style.color = '#1d4ed8'; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#f8fafc'; el.style.color = '#64748b'; }}>
                          <Edit style={{ width: 13, height: 13 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSchools.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhuma unidade encontrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManager;
