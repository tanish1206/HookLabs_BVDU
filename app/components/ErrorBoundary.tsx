// app/components/ErrorBoundary.tsx
"use client";

import React from "react";

interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 24, margin: "16px 0" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "#FCA5A5", marginBottom: 8 }}>
          Something went wrong
        </div>
        <div style={{ fontSize: 12, color: "rgba(252,165,165,0.7)", fontFamily: "var(--font-mono)", marginBottom: 16 }}>
          {this.state.error?.message ?? "An unexpected error occurred."}
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          Try again
        </button>
      </div>
    );
  }
}
