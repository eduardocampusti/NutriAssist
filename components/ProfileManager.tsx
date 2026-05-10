
import React, { useState } from 'react';
import { UserProfile, UserRole, School } from '../types';
import { Camera, Upload, Trash2, Key, UserPlus, X, Search, Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ProfileManagerProps {
  profiles: UserProfile[];
  schools: School[];
  onAdd?: (profile: Omit<UserProfile, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
  activeUser?: UserProfile;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, schools, onAdd, onUpdate, onDelete, onClose, activeUser }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.NUTRICIONISTA);
  const [schoolId, setSchoolId] = useState('');
  const [cpf, setCpf] = useState('');
  const [crn, setCrn] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [foto, setFoto] = useState('');
  const [zonaId, setZonaId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isAdmin = activeUser?.role === UserRole.ADMIN;

  const handleEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setNome(profile.nome);
    setEmail(profile.email || '');
    setRole(profile.role);
    setSchoolId(profile.school_id || '');
    setCpf(profile.cpf || '');
    setCrn(profile.crn || '');
    setTelefone(profile.telefone || '');
    setEndereco(profile.endereco || '');
    setLogin(profile.login || '');
    setSenha(profile.senha || '');
    setFoto(profile.foto || '');
    setZonaId(profile.zona_id || '');
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setNome('');
    setEmail('');
    setRole(UserRole.NUTRICIONISTA);
    setSchoolId('');
    setCpf('');
    setCrn('');
    setTelefone('');
    setEndereco('');
    setLogin('');
    setSenha('');
    setFoto('');
    setZonaId('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    try {
      if (editingId) {
        await onUpdate(editingId, {
          nome, email, role, school_id: schoolId || undefined,
          cpf, crn, telefone, endereco, login, senha, foto,
          zona_id: zonaId || undefined
        });
      } else {
        if (!onAdd) return;
        await onAdd({
          nome, email, role, school_id: schoolId || undefined,
          cpf, crn, telefone, endereco, login, senha, foto,
          zona_id: zonaId || undefined,
          ativo: true, bloqueado: false
        });
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      handleCloseForm();
    } catch (error) {
      console.error(error);
      alert("Erro ao processar perfil.");
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Usuários</h2>
            <p className="text-slate-500 font-medium">Controle de credenciais e permissões da rede</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium w-64 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
            />
          </div>

          {isAdmin && !isFormOpen && (
            <button
              onClick={handleCreateNew}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              NOVO USUÁRIO
            </button>
          )}

          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

        {/* LISTA DE USUÁRIOS */}
        <div className={`${isFormOpen ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 ease-spring`}>
          <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)',overflow:'hidden'}}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{background:'linear-gradient(135deg,#1e293b,#0f172a)'}}>
                  <tr>
                    <th style={{padding:'13px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Profissional</th>
                    <th style={{padding:'13px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Acesso</th>
                    <th style={{padding:'13px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Status</th>
                    {isAdmin && <th style={{padding:'13px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase',textAlign:'right'}}>Controles</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProfiles.map((profile) => {
                    const school = schools.find(s => s.id === profile.school_id);
                    const isSelf = profile.id === activeUser?.id;
                    const isActive = profile.ativo && !profile.bloqueado;

                    return (
                      <tr key={profile.id} style={{borderBottom:'1px solid #f8fafc',transition:'background 0.15s'}} onMouseEnter={e=>{(e.currentTarget as HTMLTableRowElement).style.background='#f0fdf4';}} onMouseLeave={e=>{(e.currentTarget as HTMLTableRowElement).style.background='transparent';}}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm overflow-hidden border-2 shadow-sm transition-transform group-hover:scale-105 ${profile.bloqueado ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-600'
                              }`}>
                              {profile.foto ? (
                                <img src={profile.foto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                profile.nome.substring(0, 1)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                                {profile.nome}
                                {isSelf && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-black">VOCÊ</span>}
                              </div>
                              <div className="text-xs text-slate-400 font-medium">{school?.nome || 'Administração Central'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase border ${profile.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {profile.role}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-1">
                              <Key className="w-3 h-3 text-slate-300" />
                              {profile.login}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${profile.bloqueado
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : profile.ativo
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${profile.bloqueado ? 'bg-red-500 animate-pulse' : profile.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                            {profile.bloqueado ? 'BLOQUEADO' : profile.ativo ? 'ATIVO' : 'INATIVO'}
                          </div>
                        </td>

                        {isAdmin && (
                          <td className="px-8 py-5 text-right">
                            {!isSelf && (
                              <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(profile)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <span className="text-lg">✏️</span>
                                </button>

                                <div className="w-px h-4 bg-slate-200 mx-1"></div>

                                <button
                                  onClick={async () => await onUpdate(profile.id, { bloqueado: !profile.bloqueado })}
                                  className={`p-2 rounded-lg transition-colors ${profile.bloqueado ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-amber-500 hover:bg-amber-50'}`}
                                  title={profile.bloqueado ? "Desbloquear" : "Bloquear"}
                                >
                                  {profile.bloqueado ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => onDelete?.(profile.id)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProfiles.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">👻</div>
                  <h3 className="text-slate-900 font-bold mb-1">Nenhum usuário encontrado</h3>
                  <p className="text-slate-500 text-sm">Tente buscar por outro termo ou adicione um novo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAINEL LATERAL (Formulário) */}
        {isFormOpen && (
          <div className="lg:col-span-4 sticky top-6 animate-in slide-in-from-right-8 duration-500">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                    {editingId ? 'Editar Perfil' : 'Novo Acesso'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Preencha os dados cadastrais</p>
                </div>
                <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-center mb-2">
                  <div className="relative group cursor-pointer">
                    <label className="block w-28 h-28 rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 transition-colors relative">
                      {foto ? (
                        <img src={foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <Camera className="w-8 h-8 mb-1" />
                          <span className="text-[9px] font-bold uppercase">Foto</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase">Alterar</div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block pl-1">Identificação</label>
                    <input
                      type="text"
                      value={nome} onChange={e => setNome(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                      placeholder="Nome Completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block pl-1">E-mail Institucional</label>
                    <input
                      type="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cpf}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length > 11) v = v.substring(0, 11);
                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        setCpf(v);
                      }}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="CPF (000.000...)"
                      maxLength={14}
                    />
                    <input
                      type="text"
                      value={crn} onChange={e => setCrn(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="CRN/Matrícula"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block pl-1">Credenciais</label>
                    <div className="bg-slate-50 rounded-xl p-3 space-y-3 border border-slate-100">
                      <input
                        type="text"
                        value={login} onChange={e => setLogin(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-emerald-500"
                        placeholder="Email / Login"
                      />
                      <input
                        type="text"
                        value={senha} onChange={e => setSenha(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-emerald-500"
                        placeholder="Senha (Inicial)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block pl-1">Permissões</label>
                    <select
                      value={role} onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold uppercase text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <select
                      value={schoolId} onChange={e => setSchoolId(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer truncate"
                    >
                      <option value="">Lotação: Administração Central</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block pl-1">Vínculo Regional (Zona)</label>
                    <select
                      value={zonaId} onChange={e => setZonaId(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">ADMINISTRAÇÃO GERAL (TODAS AS ZONAS)</option>
                      <option value="SEDE">ZONA SEDE</option>
                      <option value="RURAL">ZONA RURAL</option>
                      <option value="COCAL">ZONA COCAL</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 active:scale-95"
                  >
                    {editingId ? 'Salvar Edição' : 'Criar Acesso'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Success Toast Overlay */}
      {showSuccess && (
        <div className="fixed bottom-8 right-8 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 z-50">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm">Operação Concluída</p>
            <p className="text-xs text-emerald-300">Os dados foram atualizados com segurança.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
