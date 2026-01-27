import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
                    <AlertTriangle className="w-12 h-12" />
                </div>

                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    Página Não <span className="text-rose-500">Encontrada</span>
                </h1>

                <p className="text-slate-500 font-medium leading-relaxed">
                    Ops! A página que você está procurando não existe ou você não tem permissão para acessá-la.
                </p>

                <div className="pt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-900 text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
