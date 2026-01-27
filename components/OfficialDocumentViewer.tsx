
import React from 'react';
import ReactDOM from 'react-dom';
import { GeneratedContent, LetterheadConfig } from '../types';
import { OfficialLetterhead } from './OfficialLetterhead';
import { useToast } from '../contexts/ToastContext';

interface OfficialDocumentViewerProps {
    content: GeneratedContent;
    config?: LetterheadConfig;
    onClose: () => void;
}

export const OfficialDocumentViewer: React.FC<OfficialDocumentViewerProps> = ({ content, config, onClose }) => {
    const { addToast } = useToast();
    // Default config if none provided
    const defaultConfig: LetterheadConfig = {
        municipio: "MUNICÍPIO DE EXEMPLO",
        uf: "UF",
        orgao: "PREFEITURA MUNICIPAL",
        secretaria: "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
        setor: "DEPARTAMENTO DE ALIMENTAÇÃO ESCOLAR",
        showMunicipio: true,
        showOrgao: true,
        showSecretaria: true,
        showSetor: true,
        logoEmoji: "🏛️",
        primaryColor: "#000000",
        sidebarColor: "#FFFFFF",
        accentColor: "#000000",
        sistemaVersao: "NutriAssist SME v2.0",
        dataCriacao: "",
        ultimaAtualizacao: "",
        responsavelSME: "Nutricionista Chefe",
        onboardingComplete: true,
        showTextoPersonalizado: false,
        textoPersonalizado: "",
        showRodapeTexto: true,
        rodapeTexto: "Sistema de Gestão - NutriAssist SME"
    };

    const activeConfig = config || defaultConfig;

    const handlePrint = () => {
        window.print();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden">
                {/* Visual Header (Not Printed) */}
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center print-hidden">
                    <h3 className="font-bold text-slate-700">Visualização de Documento Oficial</h3>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-xs uppercase hover:bg-slate-200 rounded-lg">
                            Fechar
                        </button>
                        <button
                            onClick={() => {
                                const textToCopy = `${content.titulo}\n\n${content.assunto ? `Assunto: ${content.assunto}\n\n` : ''}${content.corpo}\n\nConclusão: ${content.conclusao}\n\n${content.observacoes}`;
                                navigator.clipboard.writeText(textToCopy);
                                addToast("Texto copiado para a área de transferência!", "success");
                            }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs uppercase hover:bg-slate-300 rounded-lg flex items-center gap-2"
                        >
                            📋 Copiar
                        </button>
                        <button onClick={handlePrint} className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 rounded-lg shadow-lg flex items-center gap-2">
                            🖨️ Imprimir / Salvar PDF
                        </button>
                    </div>
                </div>

                {/* SCROLLABLE DOCUMENT PREVIEW */}
                <div className="flex-1 overflow-auto bg-slate-500/10 p-8">

                    {/* A4 PAPER SIMULATION */}
                    <div id="printable-document-root" className="bg-white mx-auto shadow-xl p-[2cm] max-w-[21cm] min-h-[29.7cm] text-black print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:flex print:flex-col print:min-h-[29.7cm]" style={{ fontFamily: 'Times New Roman, serif' }}>

                        <div className="print:flex-1">
                            {/* OFFICIAL HEADER (LETTERHEAD) */}
                            <OfficialLetterhead
                                config={activeConfig}
                                className="mb-12"
                                showDate={false}
                            />

                            {/* DOCUMENT TITLE */}
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-bold uppercase underline decoration-2 underline-offset-4">{content.titulo}</h2>
                                {content.assunto && <p className="text-sm italic mt-2">Assunto: {content.assunto}</p>}
                            </div>

                            {/* BODY */}
                            <div className="text-justify leading-relaxed whitespace-pre-wrap text-[12pt]">
                                {content.corpo}
                            </div>

                            {/* CONCLUSIONS */}
                            <div className="mt-8 p-4 border border-black/20 bg-slate-50 text-[11pt] italic print:bg-white print:border-black">
                                <strong>Conclusão:</strong> {content.conclusao}
                            </div>

                            {/* FOOTER / SIGNATURES */}
                            <div className="mt-20 break-inside-avoid">
                                <div className="text-center whitespace-pre-wrap font-bold text-[11pt] leading-loose">
                                    {content.observacoes}
                                </div>
                            </div>
                        </div>

                        {/* SYSTEM FOOTER */}
                        <OfficialLetterhead
                            config={activeConfig}
                            type="footer"
                            className="mt-12 opacity-80"
                            forceShow={true}
                        />

                    </div>
                </div>
            </div>

            {/* PRINT STYLES */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-document-root, #printable-document-root * {
                        visibility: visible;
                    }
                    #printable-document-root {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white !important;
                        color: black !important;
                        z-index: 99999;
                    }
                    
                    /* Hide everything else */
                    .print-hidden, nav, header, aside, footer, .checklist-item { display: none !important; }
                    
                    @page {
                        margin: 2cm;
                        size: auto;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
};
