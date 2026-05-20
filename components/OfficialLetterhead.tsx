
import React from 'react';
import { LetterheadConfig } from '../types';

interface OfficialLetterheadProps {
    config: LetterheadConfig;
    title?: string;
    showDate?: boolean;
    type?: 'header' | 'footer';
    className?: string;
    forceShow?: boolean;
}

export const OfficialLetterhead: React.FC<OfficialLetterheadProps> = ({
    config,
    title,
    showDate = true,
    type = 'header',
    className = "",
    forceShow
}) => {
    if (type === 'footer') {
        return (
            <div className={`text-center flex flex-col items-center gap-3 w-full ${className}`}>
                {config.footerImage && (
                    <img src={config.footerImage} className="w-full max-h-16 object-contain mb-2 opacity-80 mx-auto" alt="Rodapé Institucional" />
                )}
                {config.showRodapeTexto && (
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {config.rodapeTexto || "NutriAssist SME — Gestão Técnica PNAE"}
                    </p>
                )}
                <p className="text-[8px] text-slate-300 mt-1">
                    NutriAssist SME • Gerenciamento Estratégico da Alimentação Escolar
                </p>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center gap-8 text-left pb-8 border-b-2 border-slate-900 print:border-b-0 print:pb-0 w-full mb-10">
                {config.headerImage ? (
                    <img src={config.headerImage} className="max-h-24 object-contain shadow-sm" alt="Logo" />
                ) : (
                    <div className="w-20 h-20 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-4xl shadow-xl shrink-0">
                        {config.logoEmoji}
                    </div>
                )}

                <div className="flex-1 space-y-1">
                    {config.showTextoPersonalizado && config.textoPersonalizado && (
                        <h1 className="text-sm font-black uppercase tracking-[0.25em] text-slate-800 mb-2">
                            {config.textoPersonalizado}
                        </h1>
                    )}
                    {config.showOrgao && (
                        <h1 className="text-xl font-black uppercase tracking-widest leading-none text-slate-900">
                            {config.orgao}
                        </h1>
                    )}
                    {config.showMunicipio && (
                        <h2 className="text-lg font-bold uppercase leading-tight text-slate-800">
                            {config.municipio} - {config.uf}
                        </h2>
                    )}
                    {config.showSecretaria && (
                        <h3 className="text-sm font-bold uppercase leading-tight text-slate-600">
                            {config.secretaria}
                        </h3>
                    )}
                    {config.showSetor && (
                        <div className="text-xs uppercase tracking-wider leading-relaxed text-slate-500 font-bold">
                            {config.setor}
                        </div>
                    )}
                </div>
            </div>

            {title && (
                <div className="mt-10 mb-6">
                    <h2 className="text-xl print:text-xs print:whitespace-nowrap font-black uppercase text-center underline decoration-2 underline-offset-8 leading-tight">
                        {title}
                    </h2>
                </div>
            )}

            {showDate && (
                <p className="text-right text-[9px] mt-4 font-bold text-slate-400 uppercase italic">
                    Documento emitido em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}
                </p>
            )}

            <div className="mt-6 border-b-2 border-slate-900 print:hidden w-full"></div>
        </div>
    );
};
