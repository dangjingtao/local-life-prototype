import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] transition active:bg-[var(--color-primary-pressed)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] px-4 text-sm font-medium text-[var(--color-primary-pressed)] transition active:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`} {...props} />;
}

export function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="space-y-3">{(title || action) && <div className="flex items-center justify-between gap-3">{title && <h2 className="text-base font-semibold">{title}</h2>}{action}</div>}{children}</section>;
}

export function StatusTag({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger"; children: ReactNode }) {
  const toneClass = tone === "success" ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : tone === "warning" ? "bg-[var(--color-warning-bg)] text-[var(--color-warning)]" : tone === "danger" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-xs font-medium ${toneClass}`}>{children}</span>;
}
