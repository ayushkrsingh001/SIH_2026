import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 text-center font-body">
          <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-on-error-container text-4xl">error</span>
          </div>
          <h1 className="font-headline text-headline-md text-on-surface mb-2">Something went wrong</h1>
          <p className="font-body text-body-md text-on-surface-variant mb-6 max-w-md">
            Don't worry, it's not your fault. Try refreshing the page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            className="bg-primary-container text-on-primary-container font-headline text-title-lg px-8 py-4 rounded-full btn-tactile-primary"
          >
            Go Home
          </button>
          {this.state.error && (
            <div className="mt-8 p-4 bg-error-container text-on-error-container text-left rounded overflow-auto max-w-4xl text-xs font-mono">
              <strong>{this.state.error.toString()}</strong>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
