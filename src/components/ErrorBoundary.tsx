import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f7] px-6 text-center">
          <div className="max-w-md rounded-xl border border-[#e3e3e8] bg-white p-7 shadow-sm">
            <h1 className="font-display text-2xl text-[#111318] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#72757f] mb-5">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-[#14397a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d52b0] cursor-pointer"
            >
              Reload SwiftCV
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
