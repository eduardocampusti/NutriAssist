
import React, { useState } from 'react';
import { School, UserProfile, SpecialNeedsRegistryResult, UserRole } from '../types';
import { generateSpecialNeedsRegistry } from '../services/geminiService';

interface SpecialNeedsRegistryProps {
  schools: School[];
  activeProfile?: UserProfile;
  onResult: (result: SpecialNeedsRegistryResult) => void;
  onClose: () => void;
}

const SpecialNeedsRegistry: React.FC<SpecialNeedsRegistryProps> = ({ schools, activeProfile, onResult, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schoolData, setSchoolData] = useState({
    nome: '',
    modalidade: 'Ensino Fundamental'
  });

  const [counts, setCounts] = useState({
    faixas: {
      '0_a_3': 0,
      '4_a_5': 0,
      '6_a_10': 0,
      '11_a_14': 0
    },
    condicoes: {
      'TEA': 0,
      'Seletividade': 0,
      'Intolerancia_Lactose': 0,
      'Alergias': 0,
      'Diabetes': 0,
      'Hipertensao': 0,
      'Outras': 0
    }
  });

  const [techNotes, setTechNotes] = useState('');

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolData.nome) return;
    setIsLoading(true);
    try {
      const result = await generateSpecialNeedsRegistry(schoolData, counts, techNotes);
      onResult(result);
    } catch (error) {
      alert("Falha no processamento do censo.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCount = (category: 'faixas' | 'condicoes', key: string, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setCounts(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: num }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg border border-indigo-500 font-black">👥</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Censo Nutricional Especial</h2>
            <p className="text-slate-500 text-sm italic">Mapeamento de Necessidades Alimentares (Compliance LGPD)</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUNA ESQUERDA: DADOS E QUANTITATIVOS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Unidade Escolar</label>
                <select
                  value={schoolData.nome}
                  onChange={e => setSchoolData({ ...schoolData, nome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold"
                  required
                >
                  <option value="">Selecione a escola...</option>
                  {schools.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Modalidade</label>
                <select
                  value={schoolData.modalidade}
                  onChange={e => setSchoolData({ ...schoolData, modalidade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs"
                >
                  <option value="Creche">Creche</option>
                  <option value="Pré-Escola">Pré-Escola</option>
                  <option value="Fundamental">Fundamental</option>
                  <option value="EJA">EJA</option>
                  <option value="Educação Integral">Educação Integral</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">1. Distribuição por Faixa Etária</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { k: '0_a_3', l: '0 a 3 anos' },
                  { k: '4_a_5', l: '4 a 5 anos' },
                  { k: '6_a_10', l: '6 a 10 anos' },
                  { k: '11_a_14', l: '11 a 14 anos' }
                ].map(f => (
                  <div key={f.k}>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1 truncate">{f.l}</label>
                    <input
                      type="number"
                      value={counts.faixas[f.k as keyof typeof counts.faixas]}
                      onChange={e => updateCount('faixas', f.k, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">2. Necessidades Identificadas (Qtd Alunos)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                {[
                  { k: 'TEA', l: 'Espectro Autista (TEA)' },
                  { k: 'Seletividade', l: 'Seletividade Alimentar' },
                  { k: 'Intolerancia_Lactose', l: 'Intol. Lactose' },
                  { k: 'Alergias', l: 'Alergias (Diversas)' },
                  { k: 'Diabetes', l: 'Diabetes' },
                  { k: 'Hipertensao', l: 'Hipertensão' },
                  { k: 'Outras', l: 'Outras Condições' }
                ].map(c => (
                  <div key={c.k} className="flex flex-col">
                    <label className="text-[9px] font-bold text-slate-600 uppercase mb-1">{c.l}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={counts.condicoes[c.k as keyof typeof counts.condicoes]}
                        onChange={e => updateCount('condicoes', c.k, e.target.value)}
                        className="w-16 bg-white border border-indigo-100 rounded px-2 py-1.5 text-xs font-black text-indigo-600"
                      />
                      <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (counts.condicoes[c.k as keyof typeof counts.condicoes] * 5))}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: NOTAS E AÇÕES */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Observações Técnicas</h3>
            <textarea
              value={techNotes}
              onChange={e => setTechNotes(e.target.value)}
              placeholder="Indique aqui restrições específicas por grupo, substituições padrão e orientações para a cozinha (ex: evitar contaminação cruzada para celíacos)."
              rows={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs leading-relaxed focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
            />
          </div>

          <div className="bg-indigo-900 p-8 rounded-2xl shadow-xl text-white">
            <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>🛡️</span> Garantia LGPD
            </h4>
            <p className="text-[10px] leading-relaxed opacity-80 mb-6">
              Este registro consolida perfis de saúde coletiva. Nomes de alunos, laudos individuais ou qualquer dado que possa re-identificar a criança não deve ser inserido neste campo. O objetivo é subsídio técnico para logística e planejamento nutricional.
            </p>

            <button
              type="submit"
              disabled={isLoading || !canEdit}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processando Censo via IA...
                </>
              ) : 'Gerar Registro Técnico Oficial'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SpecialNeedsRegistry;
