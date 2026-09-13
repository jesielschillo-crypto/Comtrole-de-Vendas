import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.href = window.location.pathname;
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">refresh</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">VTECH</h2>
            <p className="text-xs text-slate-600">
              O sistema precisava atualizar a visualização. Clique no botão abaixo para restaurar:
            </p>
            {this.state.error && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-left text-rose-700 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-[#00344f] hover:bg-[#002538] text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                Recarregar Sistema
              </button>
              <button
                type="button"
                onClick={this.handleClearStorageAndReload}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Limpar Cache e Restaurar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
