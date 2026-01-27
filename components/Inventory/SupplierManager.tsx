import React, { useState } from 'react';
import { Supplier, SupplierType } from '../../types';
import { Users, Sprout, Building2, Search, Plus, Save, X, Trash2, Mail, Phone, Hash, Fingerprint } from 'lucide-react';

interface SupplierManagerProps {
    suppliers: Supplier[];
    onAddSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'ativo'>) => Promise<void>;
    onUpdateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, onAddSupplier, onUpdateSupplier }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newSupplier, setNewSupplier] = useState({
        nome: '',
        tipo: SupplierType.JURIDICA,
        documento: '',
        email: '',
        telefone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupplier.nome || !newSupplier.documento) return;

        try {
            await onAddSupplier(newSupplier);
            setNewSupplier({ nome: '', tipo: SupplierType.JURIDICA, documento: '', email: '', telefone: '' });
            setIsAdding(false);
        } catch (error) {
            alert("Erro ao salvar fornecedor.");
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.documento.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        Gestão de Fornecedores
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Credenciamento de Empresas e Produtores Rurais
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-64 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cadastro
                    </button>
                </div>
            </div>

            {/* FORM MODAL BRIDGE */}
            {isAdding && (
                <div className="bg-white p-8 rounded-[40px] border border-indigo-100 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Building2 className="w-32 h-32 text-indigo-900" />
                    </div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            {newSupplier.tipo === SupplierType.AGRICULTOR ? <Sprout className="w-4 h-4 text-emerald-500" /> : <Building2 className="w-4 h-4 text-indigo-500" />}
                            Dados cadastrais do fornecedor
                        </h3>
                        <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                        <div className="md:col-span-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Modalidade</label>
                            <select
                                value={newSupplier.tipo}
                                onChange={e => setNewSupplier({ ...newSupplier, tipo: e.target.value as any })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value={SupplierType.JURIDICA}>🏢 Empresa (CNPJ)</option>
                                <option value={SupplierType.FISICA}>👤 Autônomo (CPF)</option>
                                <option value={SupplierType.AGRICULTOR}>🌿 Agricultura Familiar</option>
                            </select>
                        </div>

                        <div className="md:col-span-8">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nome / Razão Social</label>
                            <input
                                type="text"
                                autoFocus
                                value={newSupplier.nome}
                                onChange={e => setNewSupplier({ ...newSupplier, nome: e.target.value.toUpperCase() })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300"
                                placeholder="DIGITE O NOME COMPLETO"
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">CNPJ / CPF / DAP</label>
                            <div className="relative">
                                <Fingerprint className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    value={newSupplier.documento}
                                    onChange={e => setNewSupplier({ ...newSupplier, documento: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">E-mail de Contato</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="email"
                                    value={newSupplier.email}
                                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="fornecedor@email.com"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    value={newSupplier.telefone}
                                    onChange={e => setNewSupplier({ ...newSupplier, telefone: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-12 flex justify-end gap-3 mt-4 pt-6 border-t border-slate-50">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all transform active:scale-95"
                            >
                                Finalizar Cadastro
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LISTA DE FORNECEDORES - GRID STYLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.length === 0 ? (
                    <div className="col-span-full bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Nenhum fornecedor catalogado no sistema.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Cadastrar Agora</button>
                    </div>
                ) : (
                    filteredSuppliers.map(supplier => (
                        <div key={supplier.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                {supplier.tipo === SupplierType.AGRICULTOR ? <Sprout className="w-24 h-24" /> : <Building2 className="w-24 h-24" />}
                            </div>

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${supplier.tipo === SupplierType.AGRICULTOR ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {supplier.tipo === SupplierType.AGRICULTOR ? '🥬' : '🏢'}
                                    </div>
                                    <button
                                        onClick={async () => await onUpdateSupplier(supplier.id, { ativo: !supplier.ativo })}
                                        className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${supplier.ativo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {supplier.ativo ? 'Ativo' : 'Inativo'}
                                    </button>
                                </div>

                                <h3 className="text-sm font-black text-slate-800 uppercase leading-snug mb-2 line-clamp-2 pr-4">{supplier.nome}</h3>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mb-4">
                                    <Hash className="w-3 h-3" /> {supplier.documento}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {supplier.email && <div className="p-2 bg-slate-50 rounded-lg text-slate-400" title={supplier.email}><Mail className="w-3.5 h-3.5" /></div>}
                                    {supplier.telefone && <div className="p-2 bg-slate-50 rounded-lg text-slate-400" title={supplier.telefone}><Phone className="w-3.5 h-3.5" /></div>}
                                </div>
                                {supplier.tipo === SupplierType.AGRICULTOR && (
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">PNAE</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SupplierManager;
