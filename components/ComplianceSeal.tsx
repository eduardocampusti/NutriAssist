
import React from 'react';

export type ComplianceLevel = 'PLENA' | 'ATENCAO' | 'ADEQUACAO';

interface ComplianceSealProps {
    level: ComplianceLevel;
    year?: string;
    size?: number;
    className?: string;
}

const ComplianceSeal: React.FC<ComplianceSealProps> = ({
    level = 'PLENA',
    year = new Date().getFullYear().toString(),
    size = 200,
    className = ''
}) => {
    // Configuration Map
    const config = {
        PLENA: {
            color: '#10B981', // Emerald 500
            label: 'CONFORMIDADE PLENA',
            ringColor: 'stroke-emerald-500',
            textColor: 'fill-emerald-600',
            bg: 'fill-emerald-50'
        },
        ATENCAO: {
            color: '#F59E0B', // Amber 500
            label: 'CONFORMIDADE C/ ATENÇÃO',
            ringColor: 'stroke-amber-500',
            textColor: 'fill-amber-600',
            bg: 'fill-amber-50'
        },
        ADEQUACAO: {
            color: '#EF4444', // Rose 500
            label: 'EM PROCESSO DE ADEQUAÇÃO',
            ringColor: 'stroke-rose-500',
            textColor: 'fill-rose-600',
            bg: 'fill-rose-50'
        }
    };

    const current = config[level];

    // SVG Geometry
    const radius = 90;
    const center = 100;

    // Circular Text Path Generation
    // We'll use two paths: top half for "ESCOLA...", bottom half for "NUTRIASSIST SME"

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={`select-none ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <path id="curveTop" d="M 30,100 A 70,70 0 1,1 170,100" />
                <path id="curveBottom" d="M 40,100 A 60,60 0 0,0 160,100" />
            </defs>

            {/* Background Circle - White */}
            <circle cx={center} cy={center} r="98" fill="white" stroke={current.color} strokeWidth="2" />

            {/* Outer Thick Ring */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke={current.color} strokeWidth="12" />

            {/* Inner Thin Ring */}
            <circle cx={center} cy={center} r="65" fill={current.color} fillOpacity="0.05" stroke={current.color} strokeWidth="1.5" />

            {/* Text Paths */}
            <text width="200" className="text-[11px] font-black uppercase tracking-widest dominant-baseline-central text-center" style={{ fill: 'white' }}>
                <textPath xlinkHref="#curveTop" startOffset="50%" textAnchor="middle" fill="white" className="font-bold tracking-widest text-[12px]">
                    ESCOLA EM CONFORMIDADE NUTRICIONAL
                </textPath>
            </text>

            {/* Fix for text outside the ring - using simple transforms for better control manually or secondary ring */}
            {/* Let's try simpler circular text approach closer to the generated images */}

            {/* Re-doing text manually for precision without complex path reversal issues in simple SVG */}
            <g transform="translate(100, 100)">
                {/* Top Label */}
                <path
                    id="topTextPath"
                    d="M -78,0 A 78,78 0 0,1 78,0"
                    fill="none"
                    stroke="none"
                />
                <text fill="white" fontSize="10" fontWeight="bold" letterSpacing="1px">
                    <textPath xlinkHref="#topTextPath" startOffset="50%" textAnchor="middle" fill="#fff" className="drop-shadow-sm">
                        ESCOLA EM CONFORMIDADE NUTRICIONAL
                    </textPath>
                </text>

                {/* Bottom Label */}
                <path
                    id="bottomTextPath"
                    d="M -78,5 A 78,78 0 0,0 78,5"
                    transform="scale(1, -1)"
                    fill="none"
                    stroke="none"
                />
                <text fill="white" fontSize="11" fontWeight="900" letterSpacing="1px" dominantBaseline="middle">
                    <textPath xlinkHref="#bottomTextPath" startOffset="50%" textAnchor="middle" fill="#fff" className="drop-shadow-sm">
                        NUTRIASSIST SME
                    </textPath>
                </text>
            </g>

            {/* Central Icon Area */}
            <g transform="translate(100, 95)" fill={current.color}>
                {/* Book */}
                <path d="M-25,-15 C-25,-25 -5,-25 0,-15 C5,-25 25,-25 25,-15 V15 C25,25 5,25 0,15 C-5,25 -25,25 -25,15 Z" fillOpacity="0.2" />
                <path d="M0,-15 V15 M-25,-15 V15 M25,-15 V15" stroke={current.color} strokeWidth="1.5" fill="none" />

                {/* Plate */}
                <circle cx="0" cy="5" r="16" fill="white" stroke={current.color} strokeWidth="2.5" />
                <circle cx="0" cy="5" r="10" fill={current.color} fillOpacity="0.1" />

                {/* Cutlery */}
                {/* Fork */}
                <path d="M-28,-5 V20 M-28,-5 L-31,5 M-28,-5 L-25,5" stroke={current.color} strokeWidth="2" strokeLinecap="round" />
                {/* Knife */}
                <path d="M28,-5 V20 C28,25 32,25 32,20 V-5 Z" fill={current.color} />
            </g>

            {/* Year */}
            <text x="100" y="155" textAnchor="middle" className="text-xl font-black fill-slate-700 font-sans" style={{ fill: '#334155' }}>
                {year}
            </text>

            {/* Sub-label for status */}
            <text x="100" y="172" textAnchor="middle" className="text-[8px] font-bold uppercase tracking-widest" fill={current.color}>
                {current.label}
            </text>
        </svg>
    );
};

export default ComplianceSeal;
