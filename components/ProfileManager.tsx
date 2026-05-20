
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
      alert(error instanceof Error ? error.message : "Erro ao processar perfil.");
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
      <div style={{background:'#fff',borderRadius:20,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',overflow:'hidden',marginBottom:0}}><div style={{background:'linear-gradient(135deg,#d1fae5,#6ee7b7)',padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
        
        <div style={{display:'flex',alignItems:'center',gap:14}}><div style={{width:42,height:42,background:'linear-gradient(135deg,#059669,#15803d)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(5,150,105,0.35)',flexShrink:0}}><Shield style={{width:20,height:20,color:'#fff'}} /></div><div><h2 style={{fontSize:17,fontWeight:900,color:'#064e3b',margin:0,letterSpacing:'-0.02em',textTransform:'uppercase'}}>Gestão de Usuários</h2><p style={{fontSize:12,color:'#059669',margin:0}}>Controle de credenciais e permissões da rede</p></div></div>

        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{paddingLeft:36,paddingRight:16,paddingTop:9,paddingBottom:9,background:'rgba(255,255,255,0.8)',border:'1px solid rgba(5,150,105,0.2)',borderRadius:10,fontSize:13,fontFamily:'inherit',fontWeight:500,width:220,outline:'none'}}
            />
          </div>

          {isAdmin && !isFormOpen && (
            <button
              onClick={handleCreateNew}
              style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',color:'#fff',padding:'9px 18px',borderRadius:10,fontWeight:700,fontSize:12,letterSpacing:'0.04em',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:7,boxShadow:'0 4px 14px rgba(0,0,0,0.25)',textTransform:'uppercase'}}
            >
              <UserPlus style={{width:14,height:14}} />
              NOVO USUÁRIO
            </button>
          )}

          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.65)',border:'1px solid rgba(5,150,105,0.2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#065f46'}}><X style={{width:15,height:15}} /></button></div></div></div>

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
                            <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,overflow:'hidden',border:'1px solid',flexShrink:0,background:profile.bloqueado?'#fff1f2':'#f0fdf4',borderColor:profile.bloqueado?'#fecdd3':'#bbf7d0',color:profile.bloqueado?'#be123c':'#15803d'}}>
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
            <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',overflow:'hidden'}}><div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',padding:'14px 18px',borderBottom:'1px solid #bbf7d0',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{fontSize:13,fontWeight:800,color:'#064e3b',margin:0}}>{editingId ? 'Editar Perfil' : 'Novo Acesso'}</p><p style={{fontSize:11,color:'#059669',margin:0}}>Preencha os dados cadastrais</p></div><button onClick={handleCloseForm} style={{width:28,height:28,borderRadius:7,background:'rgba(255,255,255,0.7)',border:'1px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#059669'}}><X style={{width:13,height:13}} /></button></div><div style={{padding:'16px 18px'}}>

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
                    style={{flex:1,background:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontWeight:700,padding:'10px',borderRadius:10,fontSize:11,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit'}}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{flex:2,background:'linear-gradient(135deg,#059669,#15803d)',color:'#fff',fontWeight:800,padding:'10px',borderRadius:10,fontSize:11,textTransform:'uppercase',cursor:'pointer',border:'none',boxShadow:'0 4px 12px rgba(5,150,105,0.3)',fontFamily:'inherit'}}
                  >
                    {editingId ? 'Salvar Edição' : 'Criar Acesso'}
                  </button>
                </div>
              </form></div>
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
