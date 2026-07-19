"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class MissionControlErrorBoundary extends Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Mission Control Error:", error);
    console.error(errorInfo);
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-300 bg-red-50 p-10 text-center">
          <AlertTriangle className="mx-auto mb-5 h-14 w-14 text-red-600" />

          <h2 className="text-2xl font-bold">
            Mission Control Failed
          </h2>

          <p className="mt-3 text-gray-600">
            {this.state.error?.message ??
              "Unknown error occurred."}
          </p>

          <button
            onClick={this.retry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
          >
            <RefreshCw size={18} />

            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
