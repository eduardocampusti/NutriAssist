import React, { useState, useMemo } from 'react';
import { ProcurementPlan, MenuPlan, InventoryItem, DocStatus, ProcurementMapItem, UserProfile, UserRole } from '../types';
import { procurementEngine } from '../services/procurementEngine';
import { documentService, OfficialDocType } from '../services/documentService';
import { documentGenerator } from '../services/documentGeneratorService';
import { Scale, FileText, Download, BarChart3, X, CheckCircle2, AlertCircle, Clock, ChevronRight, Gavel, FileSpreadsheet } from 'lucide-react';

interface ProcurementManagerProps {
  plans: ProcurementPlan[];
  menuPlans: MenuPlan[];
  inventory: InventoryItem[];
  activeProfile?: UserProfile;
  onSave: (data: Omit<ProcurementPlan, 'id' | 'created_at' | 'authorId'>) => Promise<void>;
  onRequestDocument?: (type: string, category: any, context: any, details: string) => void;
  onClose: () => void;
}

const S = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';
const SH = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';

const ProcurementManager: React.FC<ProcurementManagerProps> = ({
  plans, menuPlans, inventory, activeProfile, onSave, onRequestDocument, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'archive'>('create');
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [generatedMap, setGeneratedMap] = useState<ProcurementMapItem[] | null>(null);
  const [blockingErrors, setBlockingErrors] = useState<string[]>([]);
  const [realBenchmark, setRealBenchmark] = useState<Record<string, { totalReal: number; totalLoss: number }>>({});

  const canManage = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const availableMenus = useMemo(() =>
    menuPlans.filter(p => !p.titulo?.includes('ARQUIVADO')), [menuPlans]);

  const togglePlanSelection = (id: string) => {
    setSelectedPlanIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setGeneratedMap(null); setBlockingErrors([]);
  };

  const generateAnnualConsumptionMapLocal = (selected: MenuPlan[], inv: InventoryItem[]) => {
    const map = new Map<string, any>();
    selected.forEach(p => {
      const multiplier = (p.diasLetivos || 200) / 5;
      p.preparacoes.forEach(dish => {
        dish.ingredientes.forEach(ing => {
          const item = inv.find(i => i.id === ing.itemId);
          if (!item) return;
          const key = item.alimento_normativo_id || item.id;
          const qty = (ing.perCapitaGrams / 1000) * (p.numAlunos || 0) * multiplier;
          if (map.has(key)) { map.get(key).totalQuantity += qty; }
          else { map.set(key, { inventoryItemName: item.nome, totalQuantity: qty, technicalSpec: item.technicalSpecifications || '-', averageCost: item.costPerUnit || 0, totalCost: qty * (item.costPerUnit || 0), isAF: !!item.allowed_af }); }
        });
      });
    });
    return Array.from(map.values());
  };

  const handleGenerateMap = async () => {
    const selected = menuPlans.filter(p => selectedPlanIds.includes(p.id));
    const map = generateAnnualConsumptionMapLocal(selected, inventory);
    try { const benchmark = await procurementEngine.getRealConsumptionBenchmark(selectedYear); setRealBenchmark(benchmark); } catch (e) {}
    setGeneratedMap(map); setBlockingErrors([]);
  };

  const handleExportTR = () => {
    if (!generatedMap || !onRequestDocument) return;
    const context = `Contexto: TR para Aquisição de Gêneros Alimentícios do PNAE. Exercício: ${selectedYear}. Base Legal: Lei 11.947/2009 e Lei 14.133/2021. Cardápios: ${menuPlans.filter(p => selectedPlanIds.includes(p.id)).map(p => p.titulo).join(', ')}. Itens: ${generatedMap.slice(0,50).map(i => `${i.inventoryItemName}: ${i.totalQuantity.toFixed(0)} KG`).join(', ')}`;
    if (activeProfile) { try { const c = documentGenerator.generateTRDraft(selectedYear, generatedMap, realBenchmark); documentService.saveDocument(OfficialDocType.TERMO_REFERENCIA, c.titulo, activeProfile.id, c); } catch (e) {} }
    onRequestDocument('Termo de Referência', 'TERMO_REFERENCIA', context, 'Geração automática de TR.');
  };

  const handleExportETP = () => {
    if (!generatedMap || !onRequestDocument || !activeProfile) return;
    try {
      const c = documentGenerator.generateETP(selectedYear, generatedMap, realBenchmark);
      documentService.saveDocument(OfficialDocType.ETP, c.titulo, activeProfile.id, c);
      onRequestDocument('Estudo Técnico Preliminar', 'PARECER_TECNICO', `Exercício: ${selectedYear}. Itens: ${generatedMap.length}.`, 'Geração automática de ETP.');
    } catch (e) {}
  };

  const handleExportCSV = () => {
    if (!generatedMap) return;
    const headers = ['ITEM', 'ESPECIFICACAO_TECNICA', 'MODALIDADE', 'UNIDADE', 'QUANTIDADE_TOTAL', 'CUSTO_MEDIO', 'VALOR_TOTAL_ESTIMADO'];
    const rows = generatedMap.map(i => [`"${i.inventoryItemName}"`, `"${i.technicalSpec.replace(/"/g,'""')}"`, i.isAF ? 'AGRICULTURA FAMILIAR' : 'GERAL', 'KG', i.totalQuantity.toFixed(3).replace('.',','), i.averageCost.toFixed(2).replace('.',','), i.totalCost.toFixed(2).replace('.',',')]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `MAPA_CONSUMO_PNAE_${selectedYear}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }} className="animate-in fade-in duration-300">

      {/* HEADER */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(79,70,229,0.2)', flexShrink: 0 }}>
              <Scale style={{ width: 22, height: 22, color: '#4f46e5' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1e1b4b', letterSpacing: '-0.02em', margin: 0 }}>Gestão de Licitações PNAE</h2>
              <p style={{ fontSize: 12, color: '#6d28d9', margin: 0, fontWeight: 500 }}>Vincular Cardápios · Gerar Mapa de Consumo · Termo de Referência</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {[
              { id: 'create', label: 'Novo Processo' },
              { id: 'archive', label: `Histórico (${plans.length})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); if (tab.id === 'create') { setSelectedPlanIds([]); setGeneratedMap(null); setBlockingErrors([]); } }}
                style={{ padding: '8px 18px', borderRadius: 10, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'all 0.15s',
                  background: activeTab === tab.id ? 'linear-gradient(135deg,#4f46e5,#6d28d9)' : 'rgba(255,255,255,0.6)',
                  color: activeTab === tab.id ? '#fff' : '#4f46e5',
                  boxShadow: activeTab === tab.id ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
                }}>
                {tab.label}
              </button>
            ))}
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>

          {/* PAINEL ESQUERDO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Seleção de cardápios */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding: '14px 18px', borderBottom: '1px solid #ddd6fe' }}>
                <p style={{ fontSize: 9.5, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Passo 1</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Selecionar Cardápios do Exercício</p>
              </div>
              <div style={{ padding: '12px', maxHeight: 380, overflowY: 'auto' }} className="custom-scrollbar">
                {availableMenus.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: 12, padding: '24px 0' }}>Nenhum cardápio disponível.</p>
                )}
                {availableMenus.map(plan => {
                  const isSelected = selectedPlanIds.includes(plan.id);
                  const isApproved = plan.status === DocStatus.APROVADO;
                  return (
                    <div key={plan.id} onClick={() => togglePlanSelection(plan.id)}
                      style={{ padding: '10px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 6, transition: 'all 0.15s',
                        background: isSelected ? '#ede9fe' : '#f8fafc',
                        border: `1px solid ${isSelected ? '#a78bfa' : '#f1f5f9'}`,
                        boxShadow: isSelected ? '0 2px 8px rgba(79,70,229,0.12)' : 'none',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#3730a3' : '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{plan.titulo}</p>
                        {isSelected && (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle2 style={{ width: 11, height: 11, color: '#fff' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
                          background: isApproved ? '#f0fdf4' : '#fffbeb', color: isApproved ? '#15803d' : '#92400e',
                          border: `1px solid ${isApproved ? '#bbf7d0' : '#fde68a'}` }}>
                          {isApproved ? 'Aprovado' : plan.status}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}>
                          {plan.etapa?.replace(/_/g,' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '12px 14px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={handleGenerateMap} disabled={selectedPlanIds.length === 0}
                  style={{ width: '100%', padding: '11px', background: selectedPlanIds.length === 0 ? '#f1f5f9' : 'linear-gradient(135deg,#4f46e5,#6d28d9)', color: selectedPlanIds.length === 0 ? '#94a3b8' : '#fff', borderRadius: 12, border: 'none', fontSize: 11, fontWeight: 800, cursor: selectedPlanIds.length === 0 ? 'not-allowed' : 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s', boxShadow: selectedPlanIds.length > 0 ? '0 4px 14px rgba(79,70,229,0.35)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <BarChart3 style={{ width: 15, height: 15 }} />
                  Gerar Mapa de Consumo
                  <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>

            {/* Erros */}
            {blockingErrors.length > 0 && (
              <div style={{ background: '#fff1f2', borderRadius: 14, border: '1px solid #fecdd3', borderLeft: '4px solid #dc2626', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '14px 16px' }} className="animate-in slide-in-from-top duration-300">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }} />
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Bloqueio de Conformidade</p>
                </div>
                {blockingErrors.map((err, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#7f1d1d', background: 'rgba(255,255,255,0.6)', padding: '7px 10px', borderRadius: 8, marginBottom: 5, border: '1px solid #fecdd3' }}>{err}</div>
                ))}
              </div>
            )}
          </div>

          {/* PAINEL DIREITO */}
          <div>
            {generatedMap ? (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="animate-in zoom-in duration-300">
                {/* Toolbar */}
                <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding: '14px 18px', borderBottom: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', margin: '0 0 2px' }}>Mapa de Consumo Consolidado</p>
                    <p style={{ fontSize: 11, color: '#6d28d9', margin: 0 }}>Base: {selectedPlanIds.length} cardápio(s) · {selectedYear}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { label: 'Gerar ETP', icon: FileText, onClick: handleExportETP, bg: '#ede9fe', color: '#4f46e5', border: '#ddd6fe' },
                      { label: 'Gerar TR', icon: Gavel, onClick: handleExportTR, bg: 'linear-gradient(135deg,#059669,#15803d)', color: '#fff', border: 'transparent', shadow: '0 4px 12px rgba(5,150,105,0.3)' },
                      { label: 'CSV', icon: FileSpreadsheet, onClick: handleExportCSV, bg: '#fff', color: '#475569', border: '#e2e8f0' },
                    ].map(btn => (
                      <button key={btn.label} onClick={btn.onClick}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, border: `1px solid ${btn.border}`, cursor: 'pointer', background: btn.bg, color: btn.color, textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: btn.shadow || 'none', transition: 'all 0.15s' }}>
                        <btn.icon style={{ width: 13, height: 13 }} />
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabela */}
                <div style={{ overflowX: 'auto', flex: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                        {['Item', 'Especificação Técnica', 'Mod.', 'Planejado (KG)', 'Real (Ano Ant.)', 'Eficiência'].map((h, i) => (
                          <th key={h} style={{ padding: '13px 16px', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: i >= 3 ? 'right' : i === 2 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedMap.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', background: idx % 2 === 0 ? '#fff' : '#fafaff', transition: 'background 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#f5f3ff'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafaff'; }}>
                          <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>{item.inventoryItemName}</td>
                          <td style={{ padding: '11px 16px', fontSize: 11, color: '#64748b', fontStyle: 'italic', maxWidth: 200 }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.technicalSpec}</div>
                          </td>
                          <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, textTransform: 'uppercase',
                              background: item.isAF ? '#f0fdf4' : '#f8fafc', color: item.isAF ? '#15803d' : '#64748b',
                              border: `1px solid ${item.isAF ? '#bbf7d0' : '#e2e8f0'}` }}>
                              {item.isAF ? 'AF' : 'Geral'}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{item.totalQuantity.toFixed(2)}</td>
                          <td style={{ padding: '11px 16px', textAlign: 'right', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                            {realBenchmark[item.inventoryItemName] ? realBenchmark[item.inventoryItemName].totalReal.toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                            {realBenchmark[item.inventoryItemName] ? (() => {
                              const rb = realBenchmark[item.inventoryItemName];
                              const eff = (rb.totalReal / (rb.totalReal + rb.totalLoss)) * 100;
                              const isGood = rb.totalLoss <= rb.totalReal * 0.1;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: isGood ? '#059669' : '#dc2626' }}>{eff.toFixed(0)}%</span>
                                  <div style={{ width: 48, height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${eff}%`, background: isGood ? '#22c55e' : '#ef4444', borderRadius: 99 }} />
                                  </div>
                                </div>
                              );
                            })() : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding: '12px 18px', borderTop: '1px solid #ddd6fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Total de Itens', value: generatedMap.length.toString() },
                      { label: 'Peso Total Estimado', value: `${generatedMap.reduce((a,i) => a + i.totalQuantity, 0).toFixed(0)} KG` },
                      { label: 'Valor Total', value: `R$ ${generatedMap.reduce((a,i) => a + i.totalCost, 0).toLocaleString('pt-BR',{minimumFractionDigits:2})}` },
                    ].map(stat => (
                      <div key={stat.label}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{stat.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 900, color: '#1e1b4b', margin: 0 }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#faf9ff', borderRadius: 18, border: '2px dashed #ddd6fe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, textAlign: 'center', minHeight: 400 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <BarChart3 style={{ width: 26, height: 26, color: '#4f46e5' }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#6d28d9', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Aguardando Seleção</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260, lineHeight: 1.6, margin: 0 }}>Selecione os cardápios na lateral esquerda e clique em "Gerar Mapa" para visualizar a consolidação.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ARQUIVO */}
      {activeTab === 'archive' && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding: '14px 20px', borderBottom: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: 17, height: 17, color: '#4f46e5' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Histórico de Processos de Licitação</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                  {['Data', 'Título', 'Itens', 'Status'].map((h, i) => (
                    <th key={h} style={{ padding: '13px 18px', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: i >= 2 ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', background: idx % 2 === 0 ? '#fff' : '#fafaff', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#f5f3ff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafaff'; }}>
                    <td style={{ padding: '13px 18px', fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>{p.titulo}</td>
                    <td style={{ padding: '13px 18px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#4f46e5' }}>{p.itens.length}</td>
                    <td style={{ padding: '13px 18px', textAlign: 'center' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: '#f5f3ff', color: '#4f46e5', border: '1px solid #ddd6fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Nenhum processo arquivado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementManager;
