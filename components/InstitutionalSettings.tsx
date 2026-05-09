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
         <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-800">🏛️</div>
               <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Governança e Identidade Visual</h2>
                  <p className="text-slate-500 text-sm font-medium tracking-tight">Painel de Controle do Administrador • SME Brotas de Macaúbas</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">

               {/* GESTÃO DE USUÁRIOS (ATALHO) */}
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all" onClick={() => navigate('/usuarios')}>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">🔐</div>
                     <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">Gestão de Usuários e Acessos</h3>
                        <p className="text-xs text-slate-500 font-medium">Criar contas, alterar senhas e gerenciar permissões de acesso.</p>
                     </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                     Acessar Painel
                  </button>
               </div>

               {/* IMPORTAÇÃO BASE FNDE */}
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all" onClick={() => navigate('/importar-fnde')}>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">📊</div>
                     <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">Importação da Base FNDE</h3>
                        <p className="text-xs text-slate-500 font-medium">Atualizar a tabela oficial de composição nutricional (PNAE).</p>
                     </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     Importar XLSX
                  </button>
               </div>

               {/* IMPORTAÇÃO BASE TACO */}
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex items-center justify-between group cursor-pointer hover:border-violet-500/30 transition-all" onClick={() => navigate('/importar-taco')}>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-2xl border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors">🧪</div>
                     <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-violet-600 transition-colors">Importação Base TACO</h3>
                        <p className="text-xs text-slate-500 font-medium">Tabela Brasileira de Composição de Alimentos (UNICAMP) — dados complementares.</p>
                     </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-violet-600 group-hover:text-white transition-colors">
                     Importar XLSX
                  </button>
               </div>

               {/* TABS DE CONFIGURAÇÃO */}
               <div className="flex gap-2 overflow-x-auto pb-2">
                  <button onClick={() => setActiveTab('HEADER')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HEADER' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Cabeçalho</button>
                  <button onClick={() => setActiveTab('FOOTER')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FOOTER' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Rodapé</button>
                  <button onClick={() => setActiveTab('LOGIN')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LOGIN' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Login</button>
                  <button onClick={() => setActiveTab('COLORS')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'COLORS' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Cores & Estilo</button>
                  <button onClick={() => setActiveTab('INSTITUTIONAL')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'INSTITUTIONAL' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Gestão Regional & RT</button>
               </div>

               {activeTab === 'INSTITUTIONAL' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <span>🏛️</span> Gestores e Responsável Técnica
                        </h3>

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
               )}

               {/* PAPEL TIMBRADO */}
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <span>📄</span> Configuração de Papel Timbrado
                  </h3>

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
                     className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-slate-900/20 text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-emerald-500/20 hover:from-slate-950 hover:to-slate-900 active:scale-[0.98] mt-2 flex items-center justify-center gap-3 disabled:opacity-50"
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

               {/* IMAGEM LOGIN */}
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <span>👤</span> Personalização da Tela de Login
                  </h3>

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

            {/* PREVIEW EM TEMPO REAL */}
            <div className="lg:col-span-12 xl:col-span-5">
               <div className="sticky top-8 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Preview do Timbrado Oficial</h3>

                  <div className="bg-white border border-slate-300 shadow-2xl rounded-sm p-12 min-h-[500px] flex flex-col pointer-events-none origin-top transition-all">
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
