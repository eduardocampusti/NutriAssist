
import sys
import os

filepath = r'c:\Users\Eduardo_sec\OneDrive\SISTEMA BROTAR\assistente-técnico-de-nutrição-escolar\components\PreparacaoEditor.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_ui_block = [
    '                                         <div className="space-y-2">\n',
    '                                            <input\n',
    '                                                ref={fileInputRef}\n',
    '                                                type="file"\n',
    '                                                accept="image/*"\n',
    '                                                className="hidden"\n',
    '                                                onChange={handleManualUpload}\n',
    '                                            />\n',
    '                                            <button\n',
    '                                                onClick={handleGenerateImage}\n',
    '                                                disabled={isGeneratingImage || !nome || (aiCooldown > 0 && !isGeneratingImage)}\n',
    '                                                className={`flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50 ${aiCooldown > 0 ? \'bg-slate-100 text-slate-400 border-slate-200\' : \'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100\'}`}\n',
    '                                            >\n',
    '                                                <ImageIcon className="w-4 h-4" />\n',
    '                                                {isGeneratingImage ? "Gerando..." : aiCooldown > 0 ? `Aguarde ${aiCooldown}s` : "Gerar Foto com IA"}\n',
    '                                            </button>\n',
    '                                            \n',
    '                                            <button\n',
    '                                                type="button"\n',
    '                                                onClick={() => fileInputRef.current?.click()}\n',
    '                                                className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"\n',
    '                                            >\n',
    '                                                <Upload className="w-4 h-4 ml-1" />\n',
    '                                                Fazer Upload Manual\n',
    '                                            </button>\n',
    '\n',
    '                                            {aiCooldown > 0 && !isGeneratingImage && (\n',
    '                                                <button\n',
    '                                                    onClick={() => setAiCooldown(0)}\n',
    '                                                    className="w-full text-center text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"\n',
    '                                                >\n',
    '                                                    Tentar IA Agora Mesmo\n',
    '                                                </button>\n',
    '                                            )}\n',
    '                                        </div>\n'
]

# Range 677 to 694 (1-based, inclusive) -> 676 to 694 (0-based)
start_idx = 676
end_idx = 694

# Safety check: does it look like the right block?
content_to_check = "".join(lines[start_idx:end_idx])
if "handleGenerateImage" in content_to_check and "space-y-2" in content_to_check:
    print(f"Found target block at {start_idx+1}-{end_idx}. Replacing...")
    lines[start_idx:end_idx] = new_ui_block
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully updated PreparacaoEditor.tsx")
else:
    print("ERROR: Target block NOT found at expected lines. Content was:")
    print(content_to_check)
    sys.exit(1)
