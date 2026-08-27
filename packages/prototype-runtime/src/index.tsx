import type { ReactNode } from "react";

export type PrototypeView = "ready" | "loading" | "empty" | "error" | "permission";

const views: PrototypeView[] = ["ready", "loading", "empty", "error", "permission"];

export function getPrototypeView(): PrototypeView {
  if (typeof window === "undefined") return "ready";
  const value = new URLSearchParams(window.location.search).get("view") as PrototypeView | null;
  return value && views.includes(value) ? value : "ready";
}

export function setPrototypeView(view: PrototypeView) {
  const url = new URL(window.location.href);
  view === "ready" ? url.searchParams.delete("view") : url.searchParams.set("view", view);
  window.location.assign(url.toString());
}

export function PrototypePanel() {
  const current = getPrototypeView();
  return <details className="fixed bottom-4 right-4 z-50 w-44 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-xs shadow-[var(--shadow-floating)]"><summary className="cursor-pointer select-none font-medium text-[var(--color-text-secondary)]">Prototype · {current}</summary><div className="mt-2 grid grid-cols-2 gap-1">{views.map(view => <button key={view} type="button" className={`min-h-8 rounded-[var(--radius-control)] px-2 ${view === current ? "bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`} onClick={() => setPrototypeView(view)}>{view}</button>)}</div></details>;
}

export function PrototypeState({ view, children }: { view: PrototypeView; children: ReactNode }) {
  if (view === "ready") return <>{children}</>;
  const labels: Record<Exclude<PrototypeView, "ready">, [string, string]> = {
    loading: ["正在加载", "用于检查骨架屏与等待状态。"],
    empty: ["暂时没有内容", "用于检查空状态、下一步动作与页面平衡。"],
    error: ["加载失败", "用于检查错误提示和恢复路径。"],
    permission: ["暂无权限", "用于检查角色边界和申请入口。"]
  };
  const [title, description] = labels[view];
  return <div className="flex min-h-[320px] items-center justify-center px-6"><div className="max-w-sm text-center"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p></div></div>;
}
