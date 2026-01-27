import React, { Component } from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-10">
                    <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-3xl border border-red-500/30 shadow-2xl">
                        <h1 className="text-3xl font-black text-red-500 mb-4 uppercase tracking-tighter">Erro de Renderização</h1>
                        <p className="text-slate-400 mb-6 font-medium">Ocorreu um erro inesperado ao carregar esta parte do sistema. Isso geralmente acontece por inconsistência de dados.</p>
                        <div className="bg-slate-950 p-4 rounded-xl mb-6 overflow-auto max-h-40">
                            <code className="text-xs text-red-400 font-mono">{this.state.error?.toString()}</code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                        >
                            Recarregar Sistema
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
