import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from './focusIcons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FOCUS LEARN UI Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center p-6 font-sans">
          <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-lg w-full shadow-[8px_8px_0px_#000] text-center">
            <div className="w-16 h-16 bg-[#FFE600] border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-[3px_3px_0px_#000]">
              ⚠️
            </div>
            <h1 className="text-2xl font-black uppercase text-black mb-2">
              Something Went Wrong
            </h1>
            <p className="text-xs font-bold text-gray-600 mb-4">
              FOCUS LEARN encountered an unexpected error while rendering.
            </p>
            {this.state.error && (
              <div className="bg-[#121214] text-white p-3 rounded-lg border-2 border-black font-mono text-xs text-left mb-6 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-white border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-100 cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Local Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
