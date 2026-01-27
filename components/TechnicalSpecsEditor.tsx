
import React, { useState } from 'react';
import { NormativeFood } from '../types';

interface TechnicalSpecsEditorProps {
    item: { id: string; nome: string; specs?: string };
    onSave: (id: string, newSpecs: string) => Promise<void>;
    onClose: () => void;
}

export const TechnicalSpecsEditor: React.FC<TechnicalSpecsEditorProps> = ({ item, onSave, onClose }) => {
    const [specs, setSpecs] = useState(item.specs || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(item.id, specs);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                <h3 className="text-lg font-black text-slate-800 uppercase mb-1">Especificação Técnica</h3>
                <p className="text-xs font-bold text-slate-400 uppercase mb-4">{item.nome}</p>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                    <p className="text-[10px] text-amber-800 font-bold">
                        ⚠️ Dica PNAE: A especificação deve ser detalhada, isenta de marcas e focar na qualidade nutricional e sanitária (Resolução 06/2020).
                    </p>
                </div>

                <textarea
                    value={specs}
                    onChange={e => setSpecs(e.target.value)}
                    className="w-full h-64 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:border-indigo-500 outline-none resize-none"
                    placeholder="Ex: Arroz beneficiado polido, tipo 1, classe longo fino, isento de sementes tóxicas, mofos e bolores..."
                />

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="text-slate-500 font-bold text-xs uppercase hover:text-slate-800">Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Especificação'}
                    </button>
                </div>
            </div>
        </div>
    );
};
