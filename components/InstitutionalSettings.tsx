import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LetterheadConfig } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Loader2, Save } from 'lucide-react';

interface InstitutionalSettingsProps {
   config: LetterheadConfig;
   onUpdate: (config: LetterheadConfig) => Promise<void>;
   onClose: () => void;
}

const InstitutionalSettings: React.FC<InstitutionalSettingsProps> = ({ config, onUpdate, onClose }) => {
   const navigate = useNavigate();
   const [localConfig, setLocalConfig] = useState<LetterheadConfig>(config);
   const [activeTab, setActiveTab] = useState<'HEADER' | 'FOOTER' | 'LOGIN' | 'COLORS' | 'INSTITUTIONAL'>('HEADER');
   const [isSaving, setIsSaving] = useState(false);
   const { addToast } = useToast();

   useEffect(() => {
      setLocalConfig(config);
   }, [config]);

   const headerInputRef = useRef<HTMLInputElement>(null);
   const footerInputRef = useRef<HTMLInputElement>(null);

   const handleSave = async () => {
      setIsSaving(true);
      try {
         await onUpdate(localConfig);
         addToast("Configurações Institucionais salvas com sucesso!", 'success');
      } catch (err) {
         console.error(err);
         addToast("Erro ao sincronizar com o servidor, mas as alterações estão ativas localmente.", 'warning');
      } finally {
         setIsSaving(false);
      }
   };

   const loginInputRef = useRef<HTMLInputElement>(null);
   const loginBgInputRef = useRef<HTMLInputElement>(null);

   const [imageSizes, setImageSizes] = useState<Record<string, string>>({});

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'headerImage' | 'footerImage' | 'loginImage' | 'loginBackground') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const sizeKB = (file.size / 1024).toFixed(1);

      // VALIDAR TAMANHO (Limite de 800KB para evitar estourar o LocalStorage)
      if (file.size > 800 * 1024) {
         addToast(`⚠️ A imagem (${sizeKB}KB) é muito grande! Limite: 800KB.`, 'warning');
         return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
         setLocalConfig({ ...localConfig, [target]: reader.result as string });
         setImageSizes(prev => ({ ...prev, [target]: sizeKB }));
      };
      reader.readAsDataURL(file);
   };

   const Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
         <button
            onClick={() => onChange(!value)}
            className={`w-10 h-5 rounded-full relative transition-all duration-300 ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}
         >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
         </button>
      </div>
   );

   return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
         <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)',overflow:'hidden',marginBottom:0}}><div style={{background:'linear-gradient(135deg,#e2e8f0,#f1f5f9)',padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="flex items-center gap-4">
               <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#334155,#0f172a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 12px rgba(0,0,0,0.25)',flexShrink:0}}>🏛️</div>
               <div>
                  <h2 style={{fontSize:16,fontWeight:900,color:'#0f172a',letterSpacing:'-0.02em',margin:0,textTransform:'uppercase'}}>Governança e Identidade Visual</h2>
                  <p style={{fontSize:12,color:'#64748b',margin:0}}>Painel de Controle · SME Brotas de Macaúbas</p>
               </div>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.7)',border:'1px solid rgba(0,0,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#475569',flexShrink:0}}>
               <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button></div></div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7" style={{display:'flex',flexDirection:'column',gap:16}}>

               {/* ATALHOS COMPACTOS */}
               <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                 {[
                   {emoji:'🔐',label:'Gestão de Usuários',sub:'Acessar painel',bg:'#f0fdf4',color:'#15803d',border:'#bbf7d0',path:'/usuarios'},
                   {emoji:'📊',label:'Importar Base FNDE',sub:'Importar XLSX',bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe',path:'/importar-fnde'},
                   {emoji:'🧪',label:'Importar Base TACO',sub:'Importar XLSX',bg:'#faf5ff',color:'#7c3aed',border:'#ddd6fe',path:'/importar-taco'},
                 ].map(item => (
                   <div key={item.path} onClick={() => navigate(item.path)}
                     style={{background:'#fff',borderRadius:12,border:'1px solid rgba(0,0,0,0.07)',padding:'11px 13px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,0.05)',transition:'all 0.15s'}}
                     onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 14px rgba(0,0,0,0.10)';(e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)';}}
                     onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)';(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';}}>
                     <div style={{width:32,height:32,borderRadius:9,background:item.bg,border:`1px solid ${item.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{item.emoji}</div>
                     <div style={{flex:1,minWidth:0}}>
                       <p style={{fontSize:11,fontWeight:700,color:'#0f172a',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.label}</p>
                       <p style={{fontSize:10,color:'#94a3b8',margin:0}}>{item.sub}</p>
                     </div>
                     <svg style={{width:13,height:13,color:'#cbd5e1',flexShrink:0}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                   </div>
                 ))}
               </div>

               {/* TABS DE CONFIGURAÇÃO */}
               <div style={{display:'flex',gap:5,background:'#f1f5f9',padding:4,borderRadius:12,border:'1px solid #e2e8f0'}}>
                 {([['HEADER','Cabeçalho'],['FOOTER','Rodapé'],['LOGIN','Login'],['COLORS','Cores'],['INSTITUTIONAL','RT']] as const).map(([tab,label]) => (
                   <button key={tab} onClick={() => setActiveTab(tab)}
                     style={{flex:1,padding:'7px 0',borderRadius:8,border:activeTab===tab?'1px solid #e2e8f0':'none',background:activeTab===tab?'#fff':'transparent',fontSize:10,fontWeight:700,color:activeTab===tab?'#059669':'#94a3b8',cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.05em',transition:'all 0.15s',boxShadow:activeTab===tab?'0 1px 4px rgba(0,0,0,0.07)':'none',fontFamily:'inherit'}}>
                     {label}
                   </button>
                 ))}
               </div>

               {activeTab === 'INSTITUTIONAL' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)',overflow:'hidden'}}>
                        <div style={{background:'linear-gradient(135deg,#fef3c7,#fcd34d)',padding:'13px 18px',borderBottom:'1px solid #fde68a',display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:15}}>🏛️</span>
                          <p style={{fontSize:11,fontWeight:700,color:'#78350f',textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Gestores e Responsável Técnica</p>
                        </div>
                        <div style={{padding:'18px 20px'}}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Administração Municipal</h4>
                              <div>
                                 <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Prefeito Municipal</label>
                                 <input
                                    type="text"
                                    value={localConfig.prefeitoNome || ''}
                                    onChange={e => setLocalConfig({ ...localConfig, prefeitoNome: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Ex: Dr. Antônio Kleber Ribeiro"
                                 />
                              </div>
                              <div>
                                 <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Secretário(a) de Educação</label>
                                 <input
                                    type="text"
                                    value={localConfig.secretariaNome || ''}
                                    onChange={e => setLocalConfig({ ...localConfig, secretariaNome: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Ex: Gislene Leite Santos Araújo"
                                 />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-100 pb-2">Vigilância Nutricional (RT)</h4>
                              <div>
                                 <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Nutricionista Responsável</label>
                                 <input
                                    type="text"
                                    value={localConfig.nutricionistaNome || ''}
                                    onChange={e => setLocalConfig({ ...localConfig, nutricionistaNome: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Ex: Alexandra Fernandes"
                                 />
                              </div>
                              <div>
                                 <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Registro Profissional (CRN)</label>
                                 <input
                                    type="text"
                                    value={localConfig.nutricionistaCrn || ''}
                                    onChange={e => setLocalConfig({ ...localConfig, nutricionistaCrn: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Ex: CRN-5/16149"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-4">
                           <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                              💡 <strong>Dica White-Label:</strong> Estes nomes aparecerão automaticamente no painel "Sobre o Sistema" e em documentos oficiais gerados pela plataforma.
                           </p>
                        </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* PAPEL TIMBRADO */}
               <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)',overflow:'hidden'}}>
                  <div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',padding:'13px 18px',borderBottom:'1px solid #bbf7d0',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:15}}>📄</span>
                    <p style={{fontSize:11,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Configuração de Papel Timbrado</p>
                  </div>
                  <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:0}}>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                     {/* UPLOAD DO CABEÇALHO */}
                     <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="flex items-center gap-3">
                           <div className="w-16 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                              {localConfig.headerImage ? (
                                 <img src={localConfig.headerImage} className="w-full h-full object-cover" alt="Header" />
                              ) : (
                                 <span className="text-xs">🖼️</span>
                              )}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-700 uppercase">Imagem de Cabeçalho</p>
                              <p className="text-[9px] text-slate-400 font-medium">Logomarca ou Banner Superior</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <input type="file" ref={headerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'headerImage')} />
                           <div className="flex flex-col items-end gap-1">
                              <button onClick={() => headerInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm">ALTERAR</button>
                              {imageSizes.headerImage && <span className="text-[8px] font-bold text-emerald-500">{imageSizes.headerImage}KB</span>}
                           </div>
                           {localConfig.headerImage && (
                              <button onClick={() => {
                                 setLocalConfig(prev => ({ ...prev, headerImage: undefined }));
                                 setImageSizes(prev => { const n = { ...prev }; delete n.headerImage; return n; });
                              }} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-bold uppercase hover:bg-red-100 italic">Remover</button>
                           )}
                        </div>
                     </div>

                     <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div className="flex gap-4">
                           <div className="flex-1">
                              <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Título Personalizado (Topo)</label>
                              <input
                                 type="text"
                                 value={localConfig.textoPersonalizado}
                                 onChange={e => setLocalConfig({ ...localConfig, textoPersonalizado: e.target.value })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold"
                              />
                           </div>
                           <Toggle label="Exibir" value={localConfig.showTextoPersonalizado} onChange={v => setLocalConfig({ ...localConfig, showTextoPersonalizado: v })} />
                        </div>

                        <div className="flex gap-4">
                           <div className="flex-1">
                              <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Município / Estado</label>
                              <input
                                 type="text"
                                 value={localConfig.municipio}
                                 onChange={e => setLocalConfig({ ...localConfig, municipio: e.target.value })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold"
                              />
                           </div>
                           <Toggle label="Exibir" value={localConfig.showMunicipio} onChange={v => setLocalConfig({ ...localConfig, showMunicipio: v })} />
                        </div>

                        <div className="flex gap-4">
                           <div className="flex-1">
                              <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Órgão / Prefeitura</label>
                              <input
                                 type="text"
                                 value={localConfig.orgao}
                                 onChange={e => setLocalConfig({ ...localConfig, orgao: e.target.value })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold"
                              />
                           </div>
                           <Toggle label="Exibir Órgão" value={localConfig.showOrgao} onChange={v => setLocalConfig({ ...localConfig, showOrgao: v })} />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                           <div className="flex-1">
                              <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Secretaria Municipal</label>
                              <input
                                 type="text"
                                 value={localConfig.secretaria}
                                 onChange={e => setLocalConfig({ ...localConfig, secretaria: e.target.value })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold"
                              />
                           </div>
                           <Toggle label="Exibir Secretaria" value={localConfig.showSecretaria} onChange={v => setLocalConfig({ ...localConfig, showSecretaria: v })} />
                        </div>

                        <div className="flex gap-4">
                           <div className="flex-1">
                              <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Setor / Departamento</label>
                              <input
                                 type="text"
                                 value={localConfig.setor}
                                 onChange={e => setLocalConfig({ ...localConfig, setor: e.target.value })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold"
                              />
                           </div>
                           <Toggle label="Exibir Setor" value={localConfig.showSetor} onChange={v => setLocalConfig({ ...localConfig, showSetor: v })} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="block text-[9px] font-black text-slate-500 uppercase">Texto de Rodapé (Normativo/Endereço)</label>
                     <textarea
                        value={localConfig.rodapeTexto}
                        onChange={e => setLocalConfig({ ...localConfig, rodapeTexto: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs leading-relaxed"
                        rows={3}
                     />
                     <Toggle label="Habilitar Rodapé Oficial" value={localConfig.showRodapeTexto} onChange={v => setLocalConfig({ ...localConfig, showRodapeTexto: v })} />
                  </div>

                  {/* UPLOAD DO RODAPÉ */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-dashed border-slate-300 mt-4">
                     <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                           {localConfig.footerImage ? (
                              <img src={localConfig.footerImage} className="w-full h-full object-cover" alt="Footer" />
                           ) : (
                              <span className="text-xs">🦶</span>
                           )}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-700 uppercase">Imagem de Rodapé</p>
                           <p className="text-[9px] text-slate-400 font-medium">Selo ou Banner Inferior</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <input type="file" ref={footerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'footerImage')} />
                        <div className="flex flex-col items-end gap-1">
                           <button onClick={() => footerInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm">ALTERAR</button>
                           {imageSizes.footerImage && <span className="text-[8px] font-bold text-emerald-500">{imageSizes.footerImage}KB</span>}
                        </div>
                        {localConfig.footerImage && (
                           <button onClick={() => {
                              setLocalConfig(prev => ({ ...prev, footerImage: undefined }));
                              setImageSizes(prev => { const n = { ...prev }; delete n.footerImage; return n; });
                           }} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-bold uppercase hover:bg-red-100 italic">Remover</button>
                        )}
                     </div>
                  </div>

                  <button
                     onClick={handleSave}
                     disabled={isSaving}
                     style={{width:'100%',padding:'11px',background:'linear-gradient(135deg,#0f172a,#1e293b)',color:'#fff',fontWeight:800,borderRadius:11,border:'none',fontSize:11,textTransform:'uppercase',letterSpacing:'0.07em',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:16,boxShadow:'0 4px 14px rgba(0,0,0,0.2)',opacity:isSaving?0.6:1}}
                  >
                     {isSaving ? (
                        <>
                           <Loader2 size={18} className="animate-spin" />
                           Sincronizando...
                        </>
                     ) : (
                        <>
                           <Save size={18} />
                           Salvar Configurações do Sistema
                        </>
                     )}
                  </button>
                  </div>
               </div>

               {/* IMAGEM LOGIN */}
               <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)',overflow:'hidden'}}>
                  <div style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)',padding:'13px 18px',borderBottom:'1px solid #bfdbfe',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:15}}>👤</span>
                    <p style={{fontSize:11,fontWeight:700,color:'#1e3a5f',textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Personalização da Tela de Login</p>
                  </div>
                  <div style={{padding:'18px 20px'}}>

                  <div className="space-y-4">
                     {/* Imagem do Personagem */}
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dotted border-slate-300">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden text-2xl border border-slate-200">
                              {localConfig.loginImage ? (
                                 <img src={localConfig.loginImage} alt="Login Preview" className="w-full h-full object-cover" />
                              ) : (
                                 "👩‍🍳"
                              )}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-700 uppercase">Personagem Central</p>
                              <p className="text-[9px] text-slate-400 font-medium">Avatar ou Mascote 3D (PNG)</p>
                           </div>
                        </div>
                        <input
                           type="file"
                           ref={loginInputRef}
                           className="hidden"
                           accept="image/*"
                           onChange={(e) => handleImageUpload(e, 'loginImage')}
                        />
                        <div className="flex flex-col items-end gap-1">
                           <button
                              onClick={() => loginInputRef.current?.click()}
                              className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm"
                           >
                              ALTERAR
                           </button>
                           {imageSizes.loginImage && <span className="text-[8px] font-bold text-emerald-500">{imageSizes.loginImage}KB</span>}
                        </div>
                     </div>

                     {/* Imagem de Fundo */}
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dotted border-slate-300">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden text-2xl border border-slate-200">
                              {localConfig.loginBackground ? (
                                 <img src={localConfig.loginBackground} alt="Login BG Preview" className="w-full h-full object-cover" />
                              ) : (
                                 "🖼️"
                              )}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-700 uppercase">Wallpaper de Fundo</p>
                              <p className="text-[9px] text-slate-400 font-medium">Imagem em HD / Paisagem</p>
                           </div>
                        </div>
                        <input
                           type="file"
                           ref={loginBgInputRef}
                           className="hidden"
                           accept="image/*"
                           onChange={(e) => handleImageUpload(e, 'loginBackground')}
                        />
                        <div className="flex flex-col items-end gap-1">
                           <button
                              onClick={() => loginBgInputRef.current?.click()}
                              className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm"
                           >
                              ALTERAR
                           </button>
                           {imageSizes.loginBackground && <span className="text-[8px] font-bold text-emerald-500">{imageSizes.loginBackground}KB</span>}
                        </div>
                     </div>

                     {(localConfig.loginImage || localConfig.loginBackground) && (
                        <div className="flex gap-4">
                           {localConfig.loginImage && (
                              <button
                                 onClick={() => setLocalConfig({ ...localConfig, loginImage: undefined })}
                                 className="flex-1 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline text-center bg-red-50 py-2 rounded-lg"
                              >
                                 Remover Avatar
                              </button>
                           )}
                           {localConfig.loginBackground && (
                              <button
                                 onClick={() => setLocalConfig({ ...localConfig, loginBackground: undefined })}
                                 className="flex-1 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline text-center bg-red-50 py-2 rounded-lg"
                              >
                                 Remover Fundo
                              </button>
                           )}
                        </div>
                     )}
                  </div>
                  </div>
               </div>
            </div>

            {/* PREVIEW EM TEMPO REAL */}
            <div className="lg:col-span-5">
               <div style={{position:'sticky',top:24,display:'flex',flexDirection:'column',gap:12}}>
                  <h3 style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 4px'}}>Preview do Timbrado Oficial</h3>

                  <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'20px 16px',minHeight:380,display:'flex',flexDirection:'column',pointerEvents:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
                     <div className="flex flex-col items-center text-center space-y-1 mb-8 pb-6 border-b-2 border-slate-100">
                        {localConfig.headerImage ? (
                           <img src={localConfig.headerImage} className="w-full max-h-32 object-contain mb-4" alt="Header Preview" />
                        ) : (
                           <div className="text-4xl mb-3 opacity-40 grayscale">{localConfig.logoEmoji}</div>
                        )}
                        {localConfig.showTextoPersonalizado && <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{localConfig.textoPersonalizado}</h1>}
                        {localConfig.showMunicipio && <h2 className="text-[9px] font-bold uppercase text-slate-800">{localConfig.municipio}</h2>}
                        {localConfig.showOrgao && <h2 className="text-[8px] font-bold uppercase text-slate-700">{localConfig.orgao}</h2>}
                        {localConfig.showSecretaria && <h2 className="text-[8px] font-bold uppercase text-slate-600">{localConfig.secretaria}</h2>}
                        {localConfig.showSetor && <h2 className="text-[7px] font-medium uppercase text-slate-500 tracking-tighter">{localConfig.setor}</h2>}
                     </div>

                     <div className="flex-1 opacity-[0.05] space-y-4 pt-10">
                        <div className="w-full h-2 bg-slate-900 rounded"></div>
                        <div className="w-full h-2 bg-slate-900 rounded"></div>
                        <div className="w-3/4 h-2 bg-slate-900 rounded"></div>
                     </div>

                     <div className="mt-12 pt-4 border-t border-slate-100 text-center flex flex-col items-center gap-4">
                        {localConfig.footerImage && <img src={localConfig.footerImage} className="w-full max-h-20 object-contain opacity-80" alt="Footer Preview" />}
                        {localConfig.showRodapeTexto && (
                           <p className="text-[7px] text-slate-400 font-bold uppercase leading-tight">{localConfig.rodapeTexto}</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default InstitutionalSettings;
