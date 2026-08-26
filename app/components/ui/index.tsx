// app/components/ui/index.tsx
// Shared UI primitives — Button, Card, MetaPill, MonoLabel,
// LoadingDots, ErrorMessage, Badge, LoadingSkeleton, Toast

"use client";

import React from "react";

// ── Button ─────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            6,
    fontFamily:     "var(--font-body)",
    fontWeight:     500,
    borderRadius:   "var(--radius-md)",
    cursor:         disabled || loading ? "not-allowed" : "pointer",
    opacity:        disabled || loading ? 0.55 : 1,
    transition:     "all 0.15s",
    border:         "none",
    outline:        "none",
    whiteSpace:     "nowrap",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { fontSize: 12, padding: "6px 14px" },
    md: { fontSize: 13, padding: "9px 18px" },
    lg: { fontSize: 14, padding: "12px 24px" },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background:  "var(--accent)",
      color:       "#000",
      boxShadow:   "0 2px 12px rgba(255,255,255,0.25)",
    },
    secondary: {
      background:  "var(--surface2)",
      color:       "var(--text)",
      border:      "1px solid var(--border2)",
    },
    ghost: {
      background:  "transparent",
      color:       "var(--muted)",
      border:      "1px solid var(--border)",
    },
    danger: {
      background:  "rgba(239,68,68,0.15)",
      color:       "#FCA5A5",
      border:      "1px solid rgba(239,68,68,0.3)",
    },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {loading && <span className="animate-spin" style={{ display: "inline-block", width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />}
      {children}
    </button>
  );
}

// ── Card ───────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  glow?: boolean;
}

export function Card({ children, style, className, glow }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background:   "var(--surface)",
        border:       `1px solid ${ glow ? "rgba(255,255,255,0.2)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding:      20,
        boxShadow:    glow ? "0 0 20px rgba(255,255,255,0.05)" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── SectionHeader ──────────────────────────────────────────────

interface SectionHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ icon, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── MonoLabel ──────────────────────────────────────────────────

interface MonoLabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function MonoLabel({ children, style }: MonoLabelProps) {
  return (
    <div style={{
      fontFamily:     "var(--font-mono)",
      fontSize:       10,
      letterSpacing:  "0.08em",
      color:          "var(--muted2)",
      textTransform:  "uppercase",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── MetaPill ───────────────────────────────────────────────────

interface MetaPillProps {
  label: string;
  value: string;
  color?: string;
}

export function MetaPill({ label, value, color }: MetaPillProps) {
  return (
    <div style={{
      display:      "flex",
      flexDirection:"column",
      gap:          3,
      padding:      "10px 14px",
      background:   "var(--surface2)",
      borderRadius: "var(--radius-md)",
      border:       "1px solid var(--border)",
    }}>
      <MonoLabel>{label}</MonoLabel>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: color ?? "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}

// ── LoadingDots ─────────────────────────────────────────────────

export function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width:             5,
            height:            5,
            borderRadius:      "50%",
            background:        "currentColor",
            animation:         `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            display:           "inline-block",
          }}
        />
      ))}
    </span>
  );
}

// ── ErrorMessage ───────────────────────────────────────────────

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div style={{
      background:   "rgba(239,68,68,0.08)",
      border:       "1px solid rgba(239,68,68,0.2)",
      borderRadius: "var(--radius-md)",
      padding:      "12px 16px",
      fontSize:     13,
      color:        "#FCA5A5",
      fontFamily:   "var(--font-mono)",
    }}>
      ⚠ {message}
    </div>
  );
}

// ── Badge ───────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export function Badge({ children, color = "var(--accent)" }: BadgeProps) {
  return (
    <span style={{
      fontSize:     10,
      padding:      "3px 8px",
      borderRadius: "var(--radius-full)",
      background:   `${color}22`,
      color,
      border:       `1px solid ${color}44`,
      fontFamily:   "var(--font-mono)",
      letterSpacing:"0.05em",
    }}>
      {children}
    </span>
  );
}

// ── LoadingSkeleton ────────────────────────────────────────────

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  lines?: number;
}

export function Skeleton({ width, height = 16, style, lines = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width:        width ?? (i === lines - 1 && lines > 1 ? "65%" : "100%"),
            height:       typeof height === "number" ? height : height,
            borderRadius: "var(--radius-md)",
            marginBottom: lines > 1 ? 8 : 0,
            ...style,
          }}
        />
      ))}
    </>
  );
}

// ── Toast ──────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  icon: "✓" },
    error:   { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  icon: "✕" },
    info:    { bg: "rgba(91,142,255,0.1)", border: "rgba(91,142,255,0.3)", icon: "ℹ" },
  };
  const c = colors[type];

  return (
    <div
      className="animate-fade-in-up"
      style={{
        position:     "fixed",
        bottom:       24,
        right:        24,
        zIndex:       1000,
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        padding:      "12px 16px",
        background:   c.bg,
        border:       `1px solid ${c.border}`,
        borderRadius: "var(--radius-md)",
        fontSize:     13,
        color:        "var(--text)",
        fontFamily:   "var(--font-body)",
        maxWidth:     340,
        boxShadow:    "var(--shadow-lg)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span style={{ fontWeight: 700 }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border:     "none",
            color:      "var(--muted)",
            cursor:     "pointer",
            fontSize:   16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── useToast hook ──────────────────────────────────────────────

import { useState, useCallback } from "react";

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}
