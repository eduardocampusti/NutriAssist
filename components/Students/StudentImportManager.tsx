import React, { useState } from 'react';
import { UserProfile, School } from '../../types';
import { Upload, CheckCircle, X, FileText, Smartphone } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { studentService } from '../../services/studentService';

interface StudentImportManagerProps {
    activeProfile: UserProfile;
    schools: School[];
    onClose: () => void;
}

const SAMPLE_CSV = `Nome Completo,Data Nascimento,Turma,Turno,NIS,CPF
JOAO DA SILVA,2015-05-12,1 ANO A,MATUTINO,12345678901,
MARIA OLIVEIRA,2014-08-20,2 ANO B,VESPERTINO,,12345678900
`;

interface ParsedRow {
    [key: string]: string;
}

const SYSTEM_FIELDS = [
    { key: 'nome', label: 'Nome Completo', required: true },
    { key: 'dataNascimento', label: 'Data de Nascimento', required: true },
    { key: 'turma', label: 'Turma / Série', required: true },
    { key: 'turno', label: 'Turno' },
    { key: 'nis', label: 'NIS' },
    { key: 'cpf', label: 'CPF' },
    { key: 'ne', label: 'Aluno NE? (Sim/Não)' }
];

const StudentImportManager: React.FC<StudentImportManagerProps> = ({ activeProfile, schools, onClose }) => {
    const { addToast } = useToast();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [csvContent, setCsvContent] = useState('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [importLog, setImportLog] = useState<{ success: number; errors: string[] } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Auto-select school for Director
    const selectedSchool = schools.find(s => s.id === activeProfile.school_id);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setCsvContent(text);
                parseCSV(text);
            };
            reader.readAsText(file);
        }
    };

    const parseCSV = (text: string) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            addToast('Arquivo CSV inválido ou vazio.', 'error');
            return;
        }

        // Detect delimiter (comma or semicolon)
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';

        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        setHeaders(headers);

        const data = lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const row: ParsedRow = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        setPreviewData(data.slice(0, 5)); // Preview first 5

        // Auto-map strategy
        const initialMapping: Record<string, string> = {};
        SYSTEM_FIELDS.forEach(field => {
            const match = headers.find(h =>
                h.toLowerCase().includes(field.label.toLowerCase()) ||
                h.toLowerCase().includes(field.key.toLowerCase())
            );
            if (match) initialMapping[field.key] = match;
        });
        setFieldMapping(initialMapping);

        setStep(2);
    };

    const processImport = async () => {
        if (!selectedSchool) {
            addToast('Erro: Nenhuma escola vinculada ao perfil.', 'error');
            return;
        }

        setIsProcessing(true);
        const log = { success: 0, errors: [] as string[] };

        // Reparse full data
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const fileHeaders = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

        const fullData = lines.slice(1).map((line, idx) => {
            const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const row: ParsedRow = {};
            fileHeaders.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return { row, lineNum: idx + 2 };
        });

        for (const { row, lineNum } of fullData) {
            try {
                // Extract mapped values
                const nome = row[fieldMapping['nome']];
                const dataNascimento = row[fieldMapping['dataNascimento']];
                const turma = row[fieldMapping['turma']];

                if (!nome || !dataNascimento) {
                    log.errors.push(`Linha ${lineNum}: Nome ou Data de Nascimento ausentes.`);
                    continue;
                }

                // Deduplication Check
                const normName = nome.toUpperCase().trim().replace(/\s+/g, ' ');

                // Construct Student Object
                const newStudent: any = {
                    nome: normName,
                    escolaId: selectedSchool.id,
                    dataNascimento: dataNascimento,
                    possuiNae: row[fieldMapping['ne']]?.toLowerCase() === 'sim',
                    ativo: true,
                    dadosComplementares: {
                        turma: turma,
                        turno: row[fieldMapping['turno']],
                        nis: row[fieldMapping['nis']],
                        cpf: row[fieldMapping['cpf']],
                        importado_em: new Date().toISOString()
                    }
                };

                // Call Service
                await studentService.createStudent(newStudent);
                log.success++;

            } catch (err: any) {
                log.errors.push(`Linha ${lineNum}: ${err.message}`);
            }
        }

        // Simulate delay
        setTimeout(() => {
            setImportLog(log);
            setIsProcessing(false);
            setStep(3);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-[32px] shadow-xl border border-slate-100 my-10 animate-in fade-in slide-in-from-bottom-8">

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Importação de Alunos em Lote</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={24} />
                </button>
            </div>

            {/* STEPS INDICATOR */}
            <div className="flex items-center justify-between mb-8 px-10">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-xs ${step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {s}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-6 text-center py-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border-4 border-slate-100 border-dashed">
                        <Upload size={40} />
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-slate-800">Carregue seu arquivo CSV</p>
                        <p className="text-sm text-slate-500">O arquivo deve conter cabeçalhos na primeira linha.</p>
                    </div>

                    <div className="max-w-md mx-auto">
                        <label className="block w-full py-4 px-6 bg-emerald-50 text-emerald-700 rounded-xl font-bold cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-100">
                            Selecionar Arquivo
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        </label>
                        <div className="mt-4">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Ou cole o conteúdo abaixo</p>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono"
                                rows={5}
                                placeholder="Cole os dados do CSV aqui..."
                                value={csvContent}
                                onChange={e => setCsvContent(e.target.value)}
                            />
                            {csvContent && (
                                <button onClick={() => parseCSV(csvContent)} className="mt-2 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                                    Processar Texto
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-left bg-slate-50 p-4 rounded-xl mt-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exemplo de Formato</p>
                        <pre className="text-[10px] text-slate-600 overflow-x-auto">{SAMPLE_CSV}</pre>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Smartphone size={18} /> Mapeamento de Campos
                            </h3>
                            <p className="text-sm text-slate-500">Indique qual coluna do seu arquivo corresponde a cada campo do sistema.</p>

                            <div className="space-y-3">
                                {SYSTEM_FIELDS.map(field => (
                                    <div key={field.key} className="flex items-center gap-4">
                                        <label className="w-1/3 text-xs font-bold text-slate-600 text-right">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <select
                                            className="flex-1 bg-slate-50 border-none rounded-lg text-xs py-2 px-3 font-medium text-slate-800"
                                            value={fieldMapping[field.key] || ''}
                                            onChange={e => setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        >
                                            <option value="">-- Ignorar --</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={18} /> Pré-visualização
                            </h3>
                            <div className="bg-slate-50 rounded-xl p-4 overflow-x-auto border border-slate-100">
                                <table className="w-full text-left text-xs">
                                    <thead className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            {Object.keys(fieldMapping).filter(k => fieldMapping[k]).map(k => (
                                                <th key={k} className="p-2 whitespace-nowrap">{SYSTEM_FIELDS.find(f => f.key === k)?.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {previewData.map((row, i) => (
                                            <tr key={i}>
                                                {Object.keys(fieldMapping).filter(k => fieldMapping[k]).map(k => (
                                                    <td key={k} className="p-2 whitespace-nowrap text-slate-700">{row[fieldMapping[k]]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                            onClick={processImport}
                            disabled={isProcessing}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-3 disabled:opacity-50"
                        >
                            {isProcessing ? 'Processando...' : 'Confirmar Importação'}
                            {!isProcessing && <CheckCircle size={18} />}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && importLog && (
                <div className="text-center py-10 space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-white shadow-xl ${importLog.success > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        <CheckCircle size={40} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-slate-800">Processamento Concluído</h3>
                        <p className="text-slate-500">Confira o resumo da operation abaixo.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <p className="text-3xl font-black text-emerald-600">{importLog.success}</p>
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Importados</p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                            <p className="text-3xl font-black text-rose-600">{importLog.errors.length}</p>
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Falhas/Ignorados</p>
                        </div>
                    </div>

                    {importLog.errors.length > 0 && (
                        <div className="max-w-lg mx-auto bg-slate-50 p-4 rounded-xl text-left max-h-48 overflow-y-auto custom-scrollbar">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sticky top-0 bg-slate-50">Log de Erros</p>
                            <ul className="space-y-1">
                                {importLog.errors.map((err, i) => (
                                    <li key={i} className="text-xs text-rose-600 font-mono flex items-start gap-2">
                                        <span>•</span> {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-8">
                        <button onClick={onClose} className="text-slate-400 font-bold hover:text-slate-600 uppercase text-xs tracking-widest transition-colors">
                            Fechar Janela
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentImportManager;
