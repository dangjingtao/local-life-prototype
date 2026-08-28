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

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2";

export function PrototypePanel() {
  const current = getPrototypeView();
  return <details className="fixed bottom-4 right-4 z-50 w-48 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-xs shadow-[var(--shadow-floating)]"><summary className={`flex min-h-11 cursor-pointer select-none items-center rounded-[var(--radius-control)] px-2 font-medium text-[var(--color-text-secondary)] ${focusClass}`}>Prototype · {current}</summary><div className="mt-2 grid grid-cols-2 gap-1">{views.map((view) => <button key={view} type="button" aria-pressed={view === current} className={`min-h-11 rounded-[var(--radius-control)] px-2 ${focusClass} ${view === current ? "bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`} onClick={() => setPrototypeView(view)}>{view}</button>)}</div></details>;
}

export function PrototypeState({ view, children }: { view: PrototypeView; children: ReactNode }) {
  if (view === "ready") return <>{children}</>;

  const labels: Record<Exclude<PrototypeView, "ready">, { title: string; description: string; action?: string }> = {
    loading: {
      title: "正在加载",
      description: "正在模拟业务数据读取，用于检查等待状态、页面节奏和 aria-busy 表达。",
    },
    empty: {
      title: "暂时没有内容",
      description: "当前筛选或演示数据没有可展示记录。返回可用数据后可以继续当前原型流程。",
      action: "返回可用数据",
    },
    error: {
      title: "加载失败",
      description: "本次原型数据加载模拟失败，没有写入真实数据。重新加载会回到可用演示状态。",
      action: "重新加载演示",
    },
    permission: {
      title: "暂无权限",
      description: "当前角色或身份不在此视图的演示授权范围内。返回允许范围后可以继续验证已授权内容。",
      action: "返回允许范围",
    },
  };

  const state = labels[view];
  const isLoading = view === "loading";
  const role = view === "error" ? "alert" : "status";

  return <section role={role} aria-live={view === "error" ? "assertive" : "polite"} aria-busy={isLoading || undefined} className="flex min-h-[320px] items-center justify-center px-6 py-12"><div className="w-full max-w-sm text-center">{isLoading && <div aria-hidden="true" className="mx-auto mb-6 max-w-xs space-y-3"><div className="h-3 w-2/3 animate-pulse rounded-full bg-[var(--color-brand-subtle)]" /><div className="h-3 w-full animate-pulse rounded-full bg-[var(--color-surface-subtle)]" /><div className="h-3 w-4/5 animate-pulse rounded-full bg-[var(--color-surface-subtle)]" /></div>}<p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">prototype · {view}</p><h2 className="mt-2 text-lg font-semibold">{state.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{state.description}</p>{state.action && <button type="button" className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] px-4 text-sm font-medium text-[var(--color-primary-pressed)] ${focusClass}`} onClick={() => setPrototypeView("ready")}>{state.action}</button>}</div></section>;
}
