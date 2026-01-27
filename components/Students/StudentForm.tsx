import React, { useState, useRef, useEffect } from 'react';
import { Student, School, StudentNutritionalNeeds, FoodNeedType } from '../../types'; // Adapted types
import { Save, X, Activity, User, BookOpen, Users as UsersIcon, Upload, Trash2, FileText, Check, Paperclip, AlertCircle, Download } from 'lucide-react';
import { studentService } from '../../services/studentService'; // Use existing service
import { useToast } from '../../contexts/ToastContext';

// Extended Internal Types for Form State (mapping JSONB)
interface StudentFormState extends Partial<Student> {
    documents?: any[];
    address?: any;
    guardians?: any[];
    clinical?: any;
    socialInfo?: any;
    school?: any; // Extra school details not in base Student type
    fullName?: string; // Mapped to 'nome'
    birthDate?: string; // Mapped to 'dataNascimento'
}

interface RegistrationFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Student | null;
    schools: School[]; // Added prop
}

export const StudentForm: React.FC<RegistrationFormProps> = ({ onSuccess, onCancel, initialData, schools }) => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'personal' | 'clinical' | 'social' | 'school' | 'documents'>('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [selectedDocType, setSelectedDocType] = useState<string>('Outros');

    // Initial State
    // We map flat Student Reference to nested Form Data
    const [formData, setFormData] = useState<StudentFormState>({
        // Base
        nome: '',
        dataNascimento: '',
        escolaId: '',
        ativo: true,
        // Extended (JSONB)
        address: { street: '', number: '', district: '', city: 'Brotas de Macaúbas', state: 'BA', zipCode: '' },
        guardians: [{ name: '', relationship: '', phone: '', email: '', occupation: '', ethnicity: '', cpf: '', rg: '' }],
        clinical: { diagnosis: '', cid: '', medications: '', allergies: '', therapiesHistory: '', weight: '', height: '', specialNeeds: [] },
        school: { grade: '', hasSpecialAide: false, difficulties: '', shift: 'Manhã', teachingType: 'Regular', schedule: '' },
        socialInfo: { nis: '', bolsaFamilia: false, bpc: false },
        documents: []
    });

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            // Parse JSONB fields if they exist (assuming service returns them spread or we access raw)
            // For now, assuming studentService will return 'dados_complementares' merged or accessible.
            // If strictly typed, we might need to cast.

            const complements = (initialData as any).dados_complementares || {};

            setFormData({
                ...initialData,
                fullName: initialData.nome,
                birthDate: initialData.dataNascimento,
                // Merging complements
                address: complements.address || { street: '', number: '', district: '', city: 'Brotas de Macaúbas', state: 'BA', zipCode: '' },
                guardians: complements.guardians || [{ name: '', relationship: '', phone: '', email: '', occupation: '', ethnicity: '', cpf: '', rg: '' }],
                clinical: complements.clinical || { diagnosis: '', cid: '', medications: '', allergies: '', therapiesHistory: '', weight: '', height: '', specialNeeds: [] },
                school: { ...complements.school, schoolName: schools.find(s => s.id === initialData.escolaId)?.nome },
                socialInfo: complements.socialInfo || { nis: '', bolsaFamilia: false, bpc: false },
                documents: complements.documents || []
            });
        }
    }, [initialData, schools]);

    // Função auxiliar para formatar CPF
    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleInputChange = (section: keyof StudentFormState | null, field: string, value: any) => {
        if (section && typeof formData[section] === 'object' && section !== 'documents') {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...(prev[section] as any),
                    [field]: value
                }
            }));
        } else if (section === 'guardians') {
            const newGuardians = [...(formData.guardians || [])];
            if (newGuardians.length > 0) {
                newGuardians[0] = { ...newGuardians[0], [field]: value };
            }
            setFormData(prev => ({ ...prev, guardians: newGuardians }));
        } else {
            // Top level mapping
            if (field === 'fullName') {
                setFormData(prev => ({ ...prev, fullName: value.toUpperCase(), nome: value.toUpperCase() }));
            } else if (field === 'birthDate') {
                setFormData(prev => ({ ...prev, birthDate: value, dataNascimento: value }));
            } else {
                setFormData(prev => ({ ...prev, [field]: value }));
            }
        }
    };

    const handleCheckboxChange = (section: 'clinical', field: 'specialNeeds', value: string) => {
        setFormData(prev => {
            const currentList = prev.clinical?.specialNeeds || [];
            const newList = currentList.includes(value)
                ? currentList.filter((item: string) => item !== value)
                : [...currentList, value];
            return {
                ...prev,
                clinical: { ...prev.clinical!, specialNeeds: newList }
            };
        });
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // In real app, upload to Supabase Storage here and get URL
                // For demo/prototype, using base64 (caution with size)
                // Or set up logic to upload later.
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setFormData(prev => ({ ...prev, photoUrl: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>, type?: string) => {
        const file = event.target.files?.[0];
        const docType = type || selectedDocType;

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newDoc = {
                    id: crypto.randomUUID(),
                    type: docType,
                    fileName: file.name,
                    url: reader.result as string, // Ideally URL from storage
                    uploadedAt: new Date().toISOString()
                };

                setFormData(prev => ({
                    ...prev,
                    documents: [...(prev.documents || []), newDoc]
                }));
            };
            reader.readAsDataURL(file);
        }
        if (event.target) event.target.value = '';
    };

    const removeDocument = (docId: string) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents?.filter(d => d.id !== docId) || []
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.dataNascimento || !formData.escolaId) {
            addToast("Preencha os campos obrigatórios (Nome, Nascimento, Escola).", 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare Payload
            const payload = {
                nome: formData.nome,
                dataNascimento: formData.dataNascimento,
                escolaId: formData.escolaId,
                possuiNae: (formData.clinical?.specialNeeds?.length > 0) || (formData.clinical?.diagnosis?.length > 0),
                // Pack extras into JSONB
                dadosComplementares: {
                    address: formData.address,
                    guardians: formData.guardians,
                    clinical: formData.clinical,
                    school: formData.school,
                    socialInfo: formData.socialInfo,
                    documents: formData.documents,
                    photoUrl: (formData as any).photoUrl // Store in JSONB or column if migrated
                },
                // If column exists
                fotoUrl: (formData as any).photoUrl
            };

            if (initialData?.id) {
                await studentService.updateStudent(initialData.id, payload);
                addToast("Aluno atualizado com sucesso!", 'success');
            } else {
                await studentService.createStudent(payload as any);
                addToast("Aluno cadastrado com sucesso!", 'success');
            }

            setIsSubmitting(false);
            onSuccess();
        } catch (err: any) {
            console.error('Erro detalhado ao salvar aluno:', JSON.stringify(err, null, 2));
            addToast(`Erro ao salvar: ${err.message || 'Falha na comunicação com o banco.'}`, 'error');
        }
    };

    const handleExportJSON = () => {
        if (!formData.nome) return;

        const exportData = {
            ...formData,
            exportedAt: new Date().toISOString(),
            systemVersion: "2.0"
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(exportData, null, 2)
        )}`;

        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `ficha_aluno_${formData.nome.replace(/\s+/g, "_").toLowerCase()}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
        >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-indigo-500 font-black">🎓</div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight">
                            {initialData ? 'Editar Prontuário' : 'Novo Prontuário Digital'}
                        </h2>
                        <p className="description text-slate-500 text-sm font-medium italic">
                            {initialData ? 'Atualização Cadastral do Aluno' : 'Admissão e Matrícula de Estudante'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleExportJSON}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors"
                            title="Exportar dados para JSON"
                        >
                            <Download size={14} /> Exportar
                        </button>
                    )}
                    <button onClick={onCancel} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* FORM CONTAINER */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">

                {/* TABS */}
                <div className="flex border-b border-slate-100 overflow-x-auto bg-white sticky top-0 z-10 px-6 pt-2">
                    <TabButton id="personal" label="Dados Pessoais" icon={User} />
                    <TabButton id="clinical" label="Saúde & Clínica" icon={Activity} />
                    <TabButton id="social" label="Familiar & Social" icon={UsersIcon} />
                    <TabButton id="school" label="Escolar" icon={BookOpen} />
                    <TabButton id="documents" label="Documentos" icon={Paperclip} />
                </div>

                {/* CONTENT */}
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 bg-slate-50/30 min-h-[500px]">
                    {activeTab === 'personal' && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">

                            {/* FOTO E IDENTIFICACAO */}
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Photo Upload */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full bg-white border-4 border-slate-100 shadow-lg flex items-center justify-center overflow-hidden">
                                            {(formData as any).photoUrl ? (
                                                <img src={(formData as any).photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-slate-300" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                                            title="Carregar Foto"
                                        >
                                            <Upload size={14} />
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                    {(formData as any).photoUrl && (
                                        <button type="button" onClick={handleRemovePhoto} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider">
                                            Remover foto
                                        </button>
                                    )}
                                </div>

                                {/* Main Inputs */}
                                <div className="flex-1 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                                            <input required type="text" className="w-full rounded-2xl border-none bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 p-4 text-sm font-bold text-slate-700 uppercase transition-all"
                                                value={formData.fullName || ''} onChange={e => handleInputChange(null, 'fullName', e.target.value)} placeholder="NOME DO ALUNO" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento *</label>
                                            <input required type="date" className="w-full rounded-2xl border-none bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 p-4 text-sm font-bold text-slate-700"
                                                value={formData.birthDate || ''} onChange={e => handleInputChange(null, 'birthDate', e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade Escolar *</label>
                                            <select required className="w-full rounded-2xl border-none bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 p-4 text-sm font-bold text-slate-700 uppercase"
                                                value={formData.escolaId || ''} onChange={e => handleInputChange(null, 'escolaId', e.target.value)}>
                                                <option value="">Selecione a Escola...</option>
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Naturalidade / UF</label>
                                            <input type="text" className="w-full rounded-2xl border-none bg-slate-50 focus:bg-white border border-slate-200 p-3 text-xs font-bold uppercase"
                                                value={(formData as any).birthPlace || ''} onChange={e => handleInputChange(null, 'birthPlace', e.target.value)} placeholder="Ex: Brotas de Macaúbas / BA" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF do Aluno</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-2xl border-none bg-slate-50 focus:bg-white border border-slate-200 p-3 text-xs font-bold"
                                                value={(formData as any).cpf || ''}
                                                onChange={e => handleInputChange(null, 'cpf', formatCPF(e.target.value))}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ENDEREÇO */}
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">📍</span>
                                    Endereço Residencial
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Logradouro</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase"
                                            value={formData.address?.street} onChange={e => handleInputChange('address', 'street', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Número</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase"
                                            value={formData.address?.number} onChange={e => handleInputChange('address', 'number', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Bairro / Comunidade</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase"
                                            value={formData.address?.district} onChange={e => handleInputChange('address', 'district', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Cidade</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase"
                                            value={formData.address?.city} onChange={e => handleInputChange('address', 'city', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'clinical' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 flex gap-4 items-center">
                                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 shrink-0">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-rose-700 uppercase">Atenção Médica</h4>
                                    <p className="text-xs text-rose-600/80">O preenchimento correto destes dados impacta diretamente na adaptação do cardápio escolar.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Diagnóstico Principal</label>
                                    <input type="text" className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-200 p-4 text-sm font-bold text-slate-700 uppercase"
                                        value={formData.clinical?.diagnosis} onChange={e => handleInputChange('clinical', 'diagnosis', e.target.value)} placeholder="Ex: APLV, DM1, TEA..." />

                                    <div className="mt-6">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">CID (Opcional)</label>
                                        <input type="text" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-xs font-bold"
                                            value={formData.clinical?.cid} onChange={e => handleInputChange('clinical', 'cid', e.target.value)} placeholder="Ex: F84.0" />
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Peso (kg)</label>
                                            <input type="text" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm font-bold text-center"
                                                value={formData.clinical?.weight || ''} onChange={e => handleInputChange('clinical', 'weight', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Altura (cm)</label>
                                            <input type="text" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm font-bold text-center"
                                                value={formData.clinical?.height || ''} onChange={e => handleInputChange('clinical', 'height', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Necessidades Especiais (Marque as opções)</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Altas Habilidades', 'Auditiva', 'Física', 'Mental', 'Multi-deficiência', 'Visual', 'Condutas Típicas', 'Alergia Alimentar', 'Intolerância'].map(need => (
                                        <label key={need} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.clinical?.specialNeeds?.includes(need)
                                            ? 'bg-rose-50 border-rose-200 shadow-sm'
                                            : 'bg-slate-50 border-transparent hover:bg-slate-100'
                                            }`}>
                                            <input type="checkbox"
                                                checked={formData.clinical?.specialNeeds?.includes(need)}
                                                onChange={() => handleCheckboxChange('clinical', 'specialNeeds', need)}
                                                className="rounded text-rose-500 w-5 h-5 focus:ring-0"
                                            />
                                            <span className={`text-[10px] font-black uppercase ${formData.clinical?.specialNeeds?.includes(need) ? 'text-rose-700' : 'text-slate-500'
                                                }`}>{need}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Restrições / Alergias Alimentares (Detalhar)</label>
                                    <textarea className="w-full rounded-[24px] border-slate-200 p-6 text-sm font-medium text-slate-700 bg-white shadow-sm" rows={4}
                                        value={formData.clinical?.allergies} onChange={e => handleInputChange('clinical', 'allergies', e.target.value)} placeholder="Detalhe aqui os alimentos proibidos..."></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Responsável Legal</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Nome Completo</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold uppercase"
                                            value={formData.guardians?.[0]?.name} onChange={e => handleInputChange('guardians', 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Vínculo (Mãe/Pai/Avó)</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase"
                                            value={formData.guardians?.[0]?.relationship} onChange={e => handleInputChange('guardians', 'relationship', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Telefone / WhatsApp</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold"
                                            value={formData.guardians?.[0]?.phone} onChange={e => handleInputChange('guardians', 'phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">CPF</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-xs font-bold"
                                            value={formData.guardians?.[0]?.cpf} onChange={e => handleInputChange('guardians', 'cpf', formatCPF(e.target.value))} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-8 rounded-[32px] border border-indigo-100">
                                <h3 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-6">Vulnerabilidade Social</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[9px] font-bold text-indigo-400 uppercase mb-1 ml-1">NIS (Número de Identificação Social)</label>
                                        <input type="text" className="w-full rounded-xl border-indigo-200 focus:ring-indigo-500 p-3 text-sm font-bold text-indigo-900 bg-white"
                                            value={formData.socialInfo?.nis || ''} onChange={e => setFormData(prev => ({ ...prev, socialInfo: { ...prev.socialInfo!, nis: e.target.value } }))} />
                                    </div>
                                    <div className="flex flex-col justify-center gap-3">
                                        <label className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-indigo-100 shadow-sm cursor-pointer hover:bg-white/80 transition-all">
                                            <input type="checkbox" className="rounded text-indigo-600 w-6 h-6"
                                                checked={formData.socialInfo?.bolsaFamilia}
                                                onChange={e => setFormData(prev => ({ ...prev, socialInfo: { ...prev.socialInfo!, bolsaFamilia: e.target.checked } }))} />
                                            <span className="text-xs font-black uppercase text-indigo-900">Beneficiário Bolsa Família</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'school' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Série / Ano</label>
                                        <input type="text" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold uppercase"
                                            value={formData.school?.grade} onChange={e => handleInputChange('school', 'grade', e.target.value)} placeholder="Ex: 5º ANO A" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Turno</label>
                                        <select className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold uppercase"
                                            value={formData.school?.shift} onChange={e => handleInputChange('school', 'shift', e.target.value)}>
                                            <option value="Manhã">Manhã</option>
                                            <option value="Tarde">Tarde</option>
                                            <option value="Integral">Integral</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Principais Dificuldades de Aprendizado</label>
                                        <textarea className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-sm" rows={4}
                                            value={formData.school?.difficulties} onChange={e => handleInputChange('school', 'difficulties', e.target.value)}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DOCUMENTS TAB REMAINING SAME LOGIC BUT STYLED */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 text-center">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                                    <Paperclip size={32} />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Acervo Digital</h3>
                                <p className="text-xs text-slate-500 mb-10 max-w-md mx-auto">Digitalize e armazene cópias seguras de documentos vitais para o prontuário do aluno.</p>

                                <div className="flex flex-wrap justify-center gap-6 mb-10">
                                    {[
                                        { type: 'Laudo Médico', icon: Activity },
                                        { type: 'Receita', icon: FileText },
                                        { type: 'Cartão Vacina', icon: Check },
                                        { type: 'RG/CPF', icon: User }
                                    ].map((docItem) => (
                                        <label key={docItem.type} className="flex flex-col items-center justify-center w-32 h-32 bg-white border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                                            <docItem.icon className="text-slate-400 mb-3 group-hover:text-indigo-600 transition-colors" size={24} />
                                            <span className="text-[10px] font-black text-center text-slate-500 group-hover:text-indigo-700 uppercase leading-tight px-2">{docItem.type}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => handleDocumentUpload(e, docItem.type)}
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="text-left bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-6">Arquivos Anexados ({formData.documents?.length || 0})</h4>

                                    {(!formData.documents || formData.documents.length === 0) ? (
                                        <p className="text-xs text-slate-400 italic text-center py-6">Nenhum documento anexado.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.documents.map((doc: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white rounded-xl text-indigo-500 border border-indigo-100 shadow-sm">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 uppercase">{doc.type}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{doc.fileName}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDocument(doc.id)}
                                                        className="text-slate-400 hover:text-rose-500 p-3 hover:bg-white rounded-xl transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* FOOTER ACTIONS */}
                <div className="p-8 border-t border-slate-100 flex justify-between md:justify-end gap-4 bg-white sticky bottom-0 z-20">
                    <button type="button" onClick={onCancel} className="px-8 py-4 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 uppercase transition-all">
                        Descartar
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-3 px-10 py-4 text-xs font-black text-white bg-slate-900 rounded-2xl hover:bg-black disabled:opacity-50 shadow-xl hover:scale-105 transition-all uppercase tracking-widest">
                        <Save size={18} />
                        {isSubmitting ? 'Salvando...' : (initialData ? 'Atualizar Prontuário' : 'Finalizar Cadastro')}
                    </button>
                </div>
            </div>
        </div>
    );
};
