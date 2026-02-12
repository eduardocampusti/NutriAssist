
import fs from 'fs';
import path from 'path';

const filepath = path.resolve('components', 'PreparacaoEditor.tsx');

const lines = fs.readFileSync(filepath, 'utf-8').split('\n');

const newUiBlock = [
    '                                         <div className="space-y-2">',
    '                                            <input',
    '                                                ref={fileInputRef}',
    '                                                type="file"',
    '                                                accept="image/*"',
    '                                                className="hidden"',
    '                                                onChange={handleManualUpload}',
    '                                            />',
    '                                            <button',
    '                                                onClick={handleGenerateImage}',
    '                                                disabled={isGeneratingImage || !nome || (aiCooldown > 0 && !isGeneratingImage)}',
    '                                                className={`flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50 ${aiCooldown > 0 ? \'bg-slate-100 text-slate-400 border-slate-200\' : \'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100\'}`}',
    '                                            >',
    '                                                <ImageIcon className="w-4 h-4" />',
    '                                                {isGeneratingImage ? "Gerando..." : aiCooldown > 0 ? `Aguarde ${aiCooldown}s` : "Gerar Foto com IA"}',
    '                                            </button>',
    '                                            ',
    '                                            <button',
    '                                                type="button"',
    '                                                onClick={() => fileInputRef.current?.click()}',
    '                                                className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"',
    '                                            >',
    '                                                <Upload className="w-4 h-4 ml-1" />',
    '                                                Fazer Upload Manual',
    '                                            </button>',
    '',
    '                                            {aiCooldown > 0 && !isGeneratingImage && (',
    '                                                <button',
    '                                                    onClick={() => setAiCooldown(0)}',
    '                                                    className="w-full text-center text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"',
    '                                                >',
    '                                                    Tentar IA Agora Mesmo',
    '                                                </button>',
    '                                            )}',
    '                                        </div>'
];

// Range 677 to 694 (1-based, inclusive) -> 676 to 694 (0-based)
const startIdx = 676;
const endIdx = 694;

const contentToCheck = lines.slice(startIdx, endIdx).join('\n');
if (contentToCheck.includes('handleGenerateImage') && contentToCheck.includes('space-y-2')) {
    console.log(`Found target block at ${startIdx + 1}-${endIdx}. Replacing...`);
    lines.splice(startIdx, endIdx - startIdx, ...newUiBlock);

    fs.writeFileSync(filepath, lines.join('\n'));
    console.log("Successfully updated PreparacaoEditor.tsx");
} else {
    console.log("ERROR: Target block NOT found at expected lines. Content was indices " + startIdx + " to " + endIdx);
    process.exit(1);
}
