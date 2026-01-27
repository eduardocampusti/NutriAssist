import React from 'react';
import { MenuPlan, School, EducationalStage, MealType } from '../../types';

interface Step1Props {
    plan: Partial<MenuPlan>;
    schools: School[];
    onChange: (updates: Partial<MenuPlan>) => void;
}

export const Step1_Identification: React.FC<Step1Props> = ({ plan, schools, onChange }) => {

    // Helper to auto-fill details based on school selection
    const handleSchoolChange = (schoolId: string) => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
            onChange({
                escolaId: schoolId,
                numAlunos: school.numAlunos || 0,
                // Default logic: Pre-fill some data if available
            });
        } else {
            onChange({ escolaId: 'REDE_GERAL', numAlunos: 0 });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">1</span>
                    Dados Básicos do Cardápio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* TITULO */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Título do Cardápio *</label>
                        <input
                            type="text"
                            value={plan.titulo || ''}
                            onChange={e => onChange({ titulo: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                            placeholder="Ex: MAIO/2026 - INTEGRAL"
                        />
                    </div>

                    {/* ESCOLA / REDE */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Unidade Escolar / Rede *</label>
                        <select
                            value={plan.escolaId || ''}
                            onChange={e => handleSchoolChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        >
                            <option value="">Selecione...</option>
                            <option value="REDE_GERAL">REDE GERAL (TODAS)</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>

                    {/* ETAPA DE ENSINO */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Modalidade de Ensino *</label>
                        <select
                            value={plan.etapa || ''}
                            onChange={e => onChange({ etapa: e.target.value as EducationalStage })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        >
                            <option value="">Selecione...</option>
                            {Object.values(EducationalStage).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>

                    {/* REFEIÇÃO PRINCIPAL (Defines the default context) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Refeição (Principal) *</label>
                        <select
                            value={plan.tipoRefeicaoPrincipal || MealType.ALMOCO}
                            onChange={e => onChange({ tipoRefeicaoPrincipal: e.target.value as MealType })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        >
                            {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <p className="text-[9px] text-slate-400">Define o tipo padrão para as preparações.</p>
                    </div>

                    {/* PERIODO */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Período *</label>
                        <select
                            value={plan.periodo || 'SEMANAL'}
                            onChange={e => onChange({ periodo: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        >
                            <option value="SEMANAL">SEMANAL</option>
                            <option value="MENSAL">MENSAL</option>
                            <option value="TRIMESTRAL">TRIMESTRAL</option>
                            <option value="SEMESTRAL">SEMESTRAL</option>
                        </select>
                    </div>

                    {/* NUM ALUNOS */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Número de Alunos *</label>
                        <input
                            type="number"
                            value={plan.numAlunos || 0}
                            onChange={e => onChange({ numAlunos: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        />
                    </div>

                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Parâmetros Etários (Crítico para Validação)</h4>
                    <div className="grid grid-cols-2 gap-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-800 uppercase">Idade Mínima (Meses) *</label>
                            <input
                                type="number"
                                value={plan.faixaEtariaMinMeses || ''}
                                onChange={e => onChange({ faixaEtariaMinMeses: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="Ex: 48"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-800 uppercase">Idade Máxima (Meses) *</label>
                            <input
                                type="number"
                                value={plan.faixaEtariaMaxMeses || ''}
                                onChange={e => onChange({ faixaEtariaMaxMeses: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="Ex: 120"
                            />
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] text-amber-700 italic flex items-center gap-2">
                                ⚠️ <strong>Atenção:</strong> Se a idade mínima for <strong>menor que 36 meses</strong>, o sistema bloqueará automaticamente alimentos proibidos pela Resolução FNDE 06/2020 (Açúcar, Mel, Ultraprocessados, etc).
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
