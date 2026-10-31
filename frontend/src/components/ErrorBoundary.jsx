import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UNESCO Horizon Portal Caught UI Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-[#0A0F24]/80 border border-rose-500/30 backdrop-blur-xl shadow-glow-emergency text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-glow-emergency">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Horizon Telemetry Recovery Mode
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                Interface Anomaly Mitigated
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                The UNESCO Horizon Care System encountered an unexpected render state and safely captured it to prevent state corruption.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan hover:brightness-110 flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Gateway</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <Home className="h-4 w-4" />
                <span>Command Hub</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
