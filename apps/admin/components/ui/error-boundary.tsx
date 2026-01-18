"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
};

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="mb-2 text-center font-semibold text-gray-900 text-xl">
            Something went wrong
          </h2>
          <p className="mb-4 text-center text-gray-600 text-sm">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 rounded-lg bg-gray-100 p-3">
              <p className="mb-1 font-medium text-gray-900 text-xs">
                Error Details (Development Only):
              </p>
              <p className="font-mono text-gray-700 text-xs">{error.message}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={resetError}
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
}
