import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  // A caught error is cleared when this value changes, e.g. when the user navigates to another path
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Error boundaries must be class components: React has no hook for catching render errors
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return this.props.fallback ? (
        this.props.fallback(error, this.reset)
      ) : (
        <ErrorFallback error={error} onReset={this.reset} />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
