import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Upload, CheckCircle, X, FileSpreadsheet, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { tacoService, type TACOComposicao } from '../services/tacoService';
import * as XLSX from 'xlsx';

interface TACOImportManagerProps {
    activeProfile: UserProfile;
    onClose: () => void;
}

// TACO 4ª Edição — standard column indices (0-based, header row already skipped)
// See: https://www.unicamp.br/nepa/taco/tabela/
const TACO_COLUMN_MAP: Record<number, string> = {
    0:  'codigo_taco',
    1:  'descricao',
    4:  'energia_kcal',
    6:  'proteinas_g',
    7:  'lipidios_g',
    9:  'carboidratos_g',
    10: 'fibras_g',
    12: 'calcio_mg',
    13: 'magnesio_mg',
    16: 'ferro_mg',
    17: 'sodio_mg',
    20: 'zinco_mg',
    21: 'vitamina_a_mcg',
    28: 'vitamina_c_mg',
};

// Fields shown in the preview table
const PREVIEW_COLUMNS = [
    'descricao', 'energia_kcal', 'proteinas_g', 'lipidios_g',
    'carboidratos_g', 'calcio_mg', 'ferro_mg', 'magnesio_mg',
    'zinco_mg', 'vitamina_a_mcg', 'fator_coccao',
];

// Parses a TACO cell value: handles "Tr" (trace), "NA", "-", commas as decimal
const parseNutrient = (val: any): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const s = String(val).trim().toLowerCase();
    if (s === 'tr' || s === 'na' || s === '-' || s === '') return 0;
    const n = parseFloat(s.replace(',', '.'));
    return isNaN(n) ? 0 : n;
};

const TACOImportManager: React.FC<TACOImportManagerProps> = ({ activeProfile, onClose }) => {
    const { addToast } = useToast();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [fileData, setFileData] = useState<TACOComposicao[]>([]);
    const [metadata, setMetadata] = useState({
        versao: 'TACO 4ª Edição',
        dataPublicacao: '2011-01-01',
        urlFonte: 'https://www.unicamp.br/nepa/taco/tabela/',
        observacoes: 'Tabela Brasileira de Composição de Alimentos - UNICAMP'
    });
    const [isVerifying, setIsVerifying] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importLog, setImportLog] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

    if (activeProfile.role !== UserRole.ADMIN) {
        return (
            <div className="p-8 text-center space-y-4">
                <AlertTriangle className="mx-auto text-amber-500" size={48} />
                <h2 className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
                <p className="text-slate-500">Apenas administradores podem importar a tabela TACO.</p>
                <button onClick={onClose} className="bg-slate-800 text-white px-6 py-2 rounded-lg">Voltar</button>
            </div>
        );
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                if (raw.length < 4) {
                    addToast('Arquivo vazio ou com estrutura inválida.', 'error', 5000);
                    return;
                }

                // Detect where food data starts: first row where col[0] is a number
                let dataStart = 0;
                for (let i = 0; i < Math.min(raw.length, 10); i++) {
                    if (raw[i][0] !== undefined && raw[i][0] !== null && raw[i][0] !== '' && !isNaN(Number(raw[i][0]))) {
                        dataStart = i;
                        break;
                    }
                }

                const items: TACOComposicao[] = [];
                let currentGroup = 'Não classificado';

                for (let i = dataStart; i < raw.length; i++) {
                    const row = raw[i];
                    if (!row || row.length === 0) continue;

                    const col0 = row[0];
                    const col1 = String(row[1] || '').trim();

                    // Category row: empty code, description looks like "1. Cereais e derivados"
                    if ((!col0 || String(col0).trim() === '') && /^\d+\./.test(col1)) {
                        currentGroup = col1.replace(/^\d+\.\s*/, '').trim();
                        continue;
                    }

                    // Food row: numeric code
                    if (!col0 || isNaN(Number(col0)) || !col1) continue;

                    const obj: any = {
                        grupo_alimentar: currentGroup,
                        gordura_saturada_g: 0,
                        gordura_trans_g: 0,
                        fator_coccao: 1.0,
                    };

                    Object.entries(TACO_COLUMN_MAP).forEach(([idxStr, field]) => {
                        const val = row[Number(idxStr)];
                        if (field === 'codigo_taco') {
                            obj[field] = String(val).trim().padStart(3, '0');
                        } else if (field === 'descricao') {
                            obj[field] = col1;
                        } else {
                            obj[field] = parseNutrient(val);
                        }
                    });

                    if (obj.descricao && obj.codigo_taco) {
                        items.push(obj as TACOComposicao);
                    }
                }

                if (items.length === 0) {
                    addToast('Nenhum alimento encontrado. Verifique o formato do arquivo TACO.', 'error', 6000);
                    return;
                }

                setFileData(items);
                setStep(2);
                addToast(`${items.length} alimentos TACO carregados.`, 'success');
            } catch (err: any) {
                addToast(`Erro ao processar arquivo: ${err.message}`, 'error', 6000);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleStartImport = async () => {
        if (!metadata.versao || !metadata.dataPublicacao) {
            addToast('Preencha a versão e a data de publicação.', 'warning');
            return;
        }

        setIsVerifying(true);
        try {
            const exists = await tacoService.checkVersionExists(metadata.versao);
            if (exists) {
                addToast(`A versão "${metadata.versao}" já foi importada. Registros existentes serão atualizados.`, 'info', 5000);
            }

            setIsImporting(true);
            const result = await tacoService.importTACOData(fileData, {
                versao: metadata.versao,
                data_publicacao: metadata.dataPublicacao,
                url_fonte: metadata.urlFonte,
                observacoes: metadata.observacoes
            });

            setImportLog(result);
            setStep(3);
        } catch (err: any) {
            addToast(`Erro na importação: ${err.message}`, 'error', 6000);
        } finally {
            setIsVerifying(false);
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white rounded-[32px] shadow-2xl border border-slate-100 my-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Importação Base TACO</h2>
                    <p className="text-sm text-slate-400 font-medium">Tabela Brasileira de Composição de Alimentos — UNICAMP</p>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={28} />
                </button>
            </div>

            {/* PROGRESS STEPS */}
            <div className="flex items-center gap-4 mb-12 px-4">
                {[1, 2, 3].map(s => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black transition-all ${step >= s ? 'bg-violet-600 text-white shadow-lg ring-4 ring-violet-50' : 'bg-slate-100 text-slate-400'}`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-violet-600' : 'bg-slate-100'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <div className="py-12 border-4 border-dashed border-slate-100 rounded-[40px] text-center space-y-8 bg-slate-50/50">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-violet-500 border border-slate-100">
                        <FileSpreadsheet size={48} />
                    </div>
                    <div className="space-y-3">
                        <p className="text-xl font-bold text-slate-800">Selecione a Planilha TACO (.xlsx)</p>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">
                            Use o arquivo Excel oficial da TACO 4ª Edição (UNICAMP/NEPA).
                            Categorias de grupos alimentares são detectadas automaticamente.
                        </p>
                    </div>

                    <label className="inline-flex items-center gap-3 bg-violet-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer hover:bg-violet-700 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                        <Upload size={20} />
                        Escolher Arquivo TACO
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <div className="pt-6 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Colunas mapeadas automaticamente (TACO 4ª Ed.):<br />
                            Número • Descrição • Energia (kcal) • Proteína • Lipídios • Carboidrato
                            • Fibra Alimentar • Cálcio • Magnésio • Ferro • Sódio • Zinco • Retinol • Vitamina C
                        </p>
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                            ⚠ Gordura saturada e trans: preencha manualmente após importação (tabela suplementar TACO)
                        </p>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl space-y-6">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <FileSpreadsheet className="text-violet-400" size={24} /> Metadados da Fonte
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Versão</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all"
                                        value={metadata.versao}
                                        onChange={e => setMetadata({ ...metadata, versao: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Data de Publicação</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all"
                                        value={metadata.dataPublicacao}
                                        onChange={e => setMetadata({ ...metadata, dataPublicacao: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">URL da Fonte</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border-none rounded-xl p-4 text-xs font-mono transition-all"
                                        value={metadata.urlFonte}
                                        onChange={e => setMetadata({ ...metadata, urlFonte: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartImport}
                            disabled={isImporting || isVerifying}
                            className="w-full bg-violet-600 text-white p-6 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-violet-700 disabled:opacity-50 transition-all"
                        >
                            {(isImporting || isVerifying) ? (
                                <><Loader2 className="animate-spin" size={20} /> Processando...</>
                            ) : (
                                <><CheckCircle size={20} /> Iniciar Importação TACO</>
                            )}
                        </button>
                    </div>

                    <div className="lg:col-span-8 space-y-4">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">
                            Pré-visualização ({fileData.length} alimentos)
                        </h3>
                        <div className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden">
                            <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-100/50 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            {PREVIEW_COLUMNS.map(col => (
                                                <th key={col} className="p-4 font-black text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-200">
                                                    {col.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {fileData.slice(0, 50).map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                {PREVIEW_COLUMNS.map(col => (
                                                    <td key={col} className="p-4 text-slate-700 font-medium whitespace-nowrap">
                                                        {typeof (row as any)[col] === 'number'
                                                            ? (row as any)[col].toLocaleString('pt-BR')
                                                            : ((row as any)[col] || '-')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {fileData.length > 50 && (
                                <div className="p-4 bg-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Exibindo os primeiros 50 de {fileData.length} itens
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && importLog && (
                <div className="py-16 text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-violet-500 rounded-[40px] flex items-center justify-center text-white shadow-2xl relative z-10">
                            <CheckCircle size={64} />
                        </div>
                        <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Base TACO Importada!</h3>
                        <p className="text-slate-500 font-medium">A tabela UNICAMP foi integrada como fonte complementar.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto px-4">
                        <div className="bg-violet-50 p-8 rounded-[32px] border border-violet-100 shadow-sm hover:scale-105 transition-transform">
                            <p className="text-4xl font-black text-violet-600 mb-1">{importLog.imported}</p>
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Alimentos Novos</p>
                        </div>
                        <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100 shadow-sm hover:scale-105 transition-transform">
                            <p className="text-4xl font-black text-blue-600 mb-1">{importLog.skipped}</p>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Atualizados</p>
                        </div>
                        <div className="bg-rose-50 p-8 rounded-[32px] border border-rose-100 shadow-sm hover:scale-105 transition-transform">
                            <p className="text-4xl font-black text-rose-600 mb-1">{importLog.errors.length}</p>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Falhas</p>
                        </div>
                    </div>
                    {importLog.errors.length > 0 && (
                        <div className="max-w-2xl mx-auto bg-slate-50 rounded-[24px] p-6 text-left border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Relatório de Erros</p>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                                {importLog.errors.map((err, i) => (
                                    <div key={i} className="text-xs text-rose-600 font-mono flex items-start gap-3 bg-white p-3 rounded-xl border border-rose-50">
                                        <X size={14} className="mt-0.5 shrink-0" /> {err}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="pt-8">
                        <button onClick={onClose} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                            Concluir e Voltar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TACOImportManager;
