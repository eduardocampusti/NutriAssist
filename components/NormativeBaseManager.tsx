import React, { useState } from 'react';
import { useUsers } from '../contexts/UserContext';
import { generateId } from '../utils/id';
import {
    NormativeFood,
    NovaClassification,
    NormativeStatus,
    UserRole
} from '../types';
import {
    BookOpen,
    Search,
    Plus,
    Save,
    X,
    ShieldCheck,
    AlertTriangle,
    Ban,
    FileText,
    History
} from 'lucide-react';

interface NormativeBaseManagerProps {
    onClose: () => void;
    initialData?: NormativeFood[];
}

const NormativeBaseManager: React.FC<NormativeBaseManagerProps> = ({ onClose, initialData = [] }) => {
    const { activeProfile } = useUsers();
    const canEdit = activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.NUTRICIONISTA;

    // START: MOCK DATA
    const [foods, setFoods] = useState<NormativeFood[]>(initialData.length > 0 ? initialData : [
        {
            id: '1',
            nome: 'ARROZ BENEFICIADO (POLIDO/PARBOILIZADO/INTEGRAL)',
            grupo_alimentar: 'CEREAIS E DERIVADOS',
            classificacao_nova: NovaClassification.MINIMAMENTE_PROCESSADO,
            idade_minima: 0,
            idade_maxima: 999,
            status_normativo: NormativeStatus.PERMITIDO,
            fundamentacao_legal: 'Lei 11.947/2009, Art. 12',
            observacoes_tecnicas: 'Base da alimentação escolar.',
            versao: 1,
            ativo: true
        },
        {
            id: '2',
            nome: 'SALSICHA / EMBUTIDOS',
            grupo_alimentar: 'CARNES E OVOS',
            classificacao_nova: NovaClassification.ULTRAPROCESSADO,
            idade_minima: 60,
            idade_maxima: 999,
            status_normativo: NormativeStatus.RESTRITO,
            fundamentacao_legal: 'Resolução FNDE 06/2020, Art 22',
            observacoes_tecnicas: 'Máximo 1 vez por mês para escolares. Proibido em creches.',
            versao: 1,
            ativo: true
        },
        {
            id: '3',
            nome: 'AÇÚCAR BRANCO / CRISTAL',
            grupo_alimentar: 'AÇÚCARES E DOCES',
            classificacao_nova: NovaClassification.INGREDIENTE_CULINARIO,
            idade_minima: 36,
            idade_maxima: 999,
            status_normativo: NormativeStatus.RESTRITO,
            fundamentacao_legal: 'Resolução FNDE 06/2020, Art 18',
            observacoes_tecnicas: 'Proibido adição para menores de 3 anos. Moderado para demais.',
            versao: 1,
            ativo: true
        },
        {
            id: '4',
            nome: 'BISCOITO RECHEADO / WAFERS',
            grupo_alimentar: 'AÇÚCARES E DOCES',
            classificacao_nova: NovaClassification.ULTRAPROCESSADO,
            idade_minima: 60,
            idade_maxima: 999,
            status_normativo: NormativeStatus.RESTRITO,
            fundamentacao_legal: 'Guia Alimentar para a População Brasileira',
            observacoes_tecnicas: 'Uso limitado a ocorrências eventuais. Rica em gordura saturada e açúcar.',
            versao: 1,
            ativo: true
        },
        {
            id: '5',
            nome: 'FRUTAS FRESCAS (DIVERSAS)',
            grupo_alimentar: 'FRUTAS',
            classificacao_nova: NovaClassification.IN_NATURA,
            idade_minima: 0,
            idade_maxima: 999,
            status_normativo: NormativeStatus.PERMITIDO,
            fundamentacao_legal: 'Guia Alimentar para Crianças Brasileiras < 2 anos',
            observacoes_tecnicas: 'Ofertar in natura, amassada ou em pedaços. Evitar sucos antes de 1 ano.',
            versao: 1,
            ativo: true
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentFood, setCurrentFood] = useState<Partial<NormativeFood>>({});

    const filteredFoods = foods.filter(f =>
        f.nome.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const handleSave = () => {
        if (!currentFood.nome) return;

        if (currentFood.id) {
            setFoods(prev => prev.map(f => f.id === currentFood.id ? { ...f, ...currentFood } as NormativeFood : f));
        } else {
            setFoods(prev => [...prev, { ...currentFood, id: generateId(), versao: 1, ativo: true } as NormativeFood]);
        }
        setIsEditing(false);
        setCurrentFood({});
    };

    const startEdit = (food?: NormativeFood) => {
        if (!canEdit && food) {
            // If not editor, we only allow viewing in a read-only way if we implement that, 
            // but per request we block edit click.
            return;
        }
        if (!canEdit && !food) return; // Cannot create new

        if (food) {
            setCurrentFood({ ...food });
        } else {
            setCurrentFood({
                nome: '',
                grupo_alimentar: 'CEREAIS',
                classificacao_nova: NovaClassification.IN_NATURA,
                idade_minima: 0,
                idade_maxima: 999,
                status_normativo: NormativeStatus.PERMITIDO,
                fundamentacao_legal: 'Resolução FNDE 06/2020',
                observacoes_tecnicas: '',
                versao: 1,
                ativo: true
            });
        }
        setIsEditing(true);
    };

    return (
        <div className="flex h-full flex-col bg-[#F8FAFC]">
            {/* HEADER */}
            <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                        <BookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            Base Normativa PNAE
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compêndio Legal de Alimentos</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar norma..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-emerald-500/20 w-64 outline-none transition-all"
                        />
                    </div>
                    {canEdit && (
                        <button
                            onClick={() => startEdit()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Novo Item
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4">
                    {filteredFoods.map(food => (
                        <div
                            key={food.id}
                            onClick={() => canEdit && startEdit(food)}
                            className={`bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm transition-all group relative overflow-hidden ${canEdit ? 'hover:shadow-xl cursor-pointer' : 'opacity-90'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner
                                         ${food.status_normativo === NormativeStatus.PROIBIDO ? 'bg-red-50 text-red-500' :
                                            food.status_normativo === NormativeStatus.RESTRITO ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}
                                     `}>
                                        {food.status_normativo === NormativeStatus.PROIBIDO ? <Ban className="w-6 h-6" /> :
                                            food.status_normativo === NormativeStatus.RESTRITO ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{food.classificacao_nova.replace('_', ' ')}</span>
                                        <h3 className="text-lg font-black text-slate-800 uppercase mt-1">{food.nome}</h3>
                                        <div className="flex gap-4 mt-2 text-xs font-medium text-slate-500">
                                            <span className="flex items-center gap-1"><History className="w-3 h-3" /> Idade {'>'} {food.idade_minima} meses</span>
                                            {food.fundamentacao_legal && <span className="flex items-center gap-1 text-slate-400"><FileText className="w-3 h-3" /> {food.fundamentacao_legal}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border
                                     ${food.status_normativo === NormativeStatus.PROIBIDO ? 'bg-red-100 text-red-700 border-red-200' :
                                        food.status_normativo === NormativeStatus.RESTRITO ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}
                                 `}>
                                    {food.status_normativo}
                                </div>
                            </div>
                            {food.observacoes_tecnicas && (
                                <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500 italic">
                                    "{food.observacoes_tecnicas}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* EDIT MODAL */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-emerald-600" /> Editor Normativo
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome Técnico do Alimento</label>
                                <input
                                    value={currentFood.nome}
                                    onChange={e => setCurrentFood({ ...currentFood, nome: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    placeholder="EX: FEIJÃO PRETO TIPO 1"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Grupo Alimentar</label>
                                <select
                                    value={currentFood.grupo_alimentar}
                                    onChange={e => setCurrentFood({ ...currentFood, grupo_alimentar: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                                >
                                    <option value="CEREAIS E DERIVADOS">CEREAIS E DERIVADOS</option>
                                    <option value="LEGUMINOSAS">LEGUMINOSAS</option>
                                    <option value="CARNES E OVOS">CARNES E OVOS</option>
                                    <option value="HORTALIÇAS">HORTALIÇAS</option>
                                    <option value="FRUTAS">FRUTAS</option>
                                    <option value="LATICÍNIOS">LATICÍNIOS</option>
                                    <option value="AÇÚCARES E DOCES">AÇÚCARES E DOCES</option>
                                    <option value="ÓLEOS E GORDURAS">ÓLEOS E GORDURAS</option>
                                    <option value="OUTROS">OUTROS</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Classificação NOVA</label>
                                    <select
                                        value={currentFood.classificacao_nova}
                                        onChange={e => setCurrentFood({ ...currentFood, classificacao_nova: e.target.value as NovaClassification })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                                    >
                                        {Object.values(NovaClassification).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status Normativo</label>
                                    <select
                                        value={currentFood.status_normativo}
                                        onChange={e => setCurrentFood({ ...currentFood, status_normativo: e.target.value as NormativeStatus })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                                    >
                                        {Object.values(NormativeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Restrições de Idade (Meses)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-slate-500 mb-1 block">Mínima</span>
                                        <input
                                            type="number"
                                            value={currentFood.idade_minima}
                                            onChange={e => setCurrentFood({ ...currentFood, idade_minima: Number(e.target.value) })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-slate-500 mb-1 block">Máxima</span>
                                        <input
                                            type="number"
                                            value={currentFood.idade_maxima}
                                            onChange={e => setCurrentFood({ ...currentFood, idade_maxima: Number(e.target.value) })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">
                                    * 0 a 999 indica sem restrição específica. Ex: 36 meses = Proibido {"<"} 3 anos.
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fundamentação Legal & Técnica</label>
                                <textarea
                                    value={currentFood.fundamentacao_legal || ''}
                                    onChange={e => setCurrentFood({ ...currentFood, fundamentacao_legal: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs text-slate-700 outline-none resize-none mb-2"
                                    rows={2}
                                    placeholder="Ex: Resolução FNDE 06/2020, Art. 22"
                                />
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['Lei nº 11.947/2009', 'Resolução FNDE nº 06/2020', 'Guia Alimentar Brasileiro', 'Guia Alimentar < 2 Anos'].map(law => (
                                        <button
                                            key={law}
                                            onClick={() => setCurrentFood({ ...currentFood, fundamentacao_legal: law })}
                                            className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                        >
                                            {law}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={currentFood.observacoes_tecnicas || ''}
                                    onChange={e => setCurrentFood({ ...currentFood, observacoes_tecnicas: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs text-slate-700 outline-none resize-none"
                                    rows={2}
                                    placeholder="Observações técnicas gerais..."
                                />
                            </div>

                            <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 text-sm font-black uppercase tracking-widest shadow-xl transition-all">
                                Salvar & Publicar Versão
                            </button>

                            {/* HISTORY MOCK */}
                            {currentFood.id && (
                                <div className="border-t border-slate-100 pt-6 mt-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                                        <History className="w-4 h-4" /> Histórico de Versões
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                                            <span>v1.2 - Atualização de Faixa Etária</span>
                                            <span className="text-slate-300">Há 2 dias por Nutri. Ana</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                                            <span>v1.1 - Revisão Classificação NOVA</span>
                                            <span className="text-slate-300">Há 1 mês por Admin</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                                            <span>v1.0 - Criação do Item</span>
                                            <span className="text-slate-300">Há 6 meses por Sistema</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NormativeBaseManager;
