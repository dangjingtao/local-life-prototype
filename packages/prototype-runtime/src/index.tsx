import { useSyncExternalStore, type ReactNode } from "react";

export type PrototypeView = "ready" | "loading" | "empty" | "error" | "permission";

const views: PrototypeView[] = ["ready", "loading", "empty", "error", "permission"];
const viewChangeEvent = "prototype:viewchange";

export function getPrototypeView(): PrototypeView {
  if (typeof window === "undefined") return "ready";
  const value = new URLSearchParams(window.location.search).get("view") as PrototypeView | null;
  return value && views.includes(value) ? value : "ready";
}

function subscribePrototypeView(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(viewChangeEvent, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(viewChangeEvent, onStoreChange);
  };
}

export function usePrototypeView(): PrototypeView {
  return useSyncExternalStore(subscribePrototypeView, getPrototypeView, () => "ready");
}

export function setPrototypeView(view: PrototypeView) {
  const current = getPrototypeView();
  const url = new URL(window.location.href);
  view === "ready" ? url.searchParams.delete("view") : url.searchParams.set("view", view);

  // PC permission uses role-specific shells selected by the page root, so keep a document
  // navigation only when entering/leaving permission. Other quality states update in place
  // so nested Mobile steps and PC modules stay mounted and can recover where they were.
  if (view === "permission" || current === "permission") {
    window.location.assign(url.toString());
    return;
  }

  window.history.replaceState(null, "", url.toString());
  window.dispatchEvent(new Event(viewChangeEvent));
}

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2";

export function PrototypePanel() {
  const current = usePrototypeView();

  const chooseView = (view: PrototypeView, button: HTMLButtonElement) => {
    button.closest("details")?.removeAttribute("open");
    setPrototypeView(view);
  };

  return <details className="group fixed bottom-20 right-4 z-50 w-[46px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-xs shadow-[var(--shadow-floating)] open:w-48 open:p-2 md:bottom-4 md:w-48 md:p-2"><summary aria-label={`Prototype · ${current}`} className={`flex min-h-11 cursor-pointer select-none items-center justify-center rounded-[var(--radius-control)] font-medium text-[var(--color-text-secondary)] group-open:justify-start group-open:px-2 md:justify-start md:px-2 ${focusClass}`}><span aria-hidden="true" className="font-semibold group-open:hidden md:hidden">P</span><span className="hidden group-open:inline md:inline">Prototype · {current}</span></summary><div className="mt-2 hidden grid-cols-2 gap-1 group-open:grid md:group-open:grid">{views.map((view) => <button key={view} type="button" aria-pressed={view === current} className={`min-h-11 rounded-[var(--radius-control)] px-2 ${focusClass} ${view === current ? "bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`} onClick={(event) => chooseView(view, event.currentTarget)}>{view}</button>)}</div></details>;
}

export function PrototypeState({ children }: { view: PrototypeView; children: ReactNode }) {
  const view = usePrototypeView();
  const ready = view === "ready";

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

  const state = ready ? null : labels[view];
  const isLoading = view === "loading";
  const role = view === "error" ? "alert" : "status";

  // The first child is always the same wrapper at the same tree position. `contents`
  // avoids a ready-layout wrapper; `hidden` removes it from layout/focus/a11y while
  // preserving nested React state during loading / empty / error.
  return <><div className={ready ? "contents" : undefined} hidden={!ready} aria-hidden={!ready || undefined}>{children}</div>{state && <section role={role} aria-live={view === "error" ? "assertive" : "polite"} aria-busy={isLoading || undefined} className="flex min-h-[320px] items-center justify-center px-6 py-12"><div className="w-full max-w-sm text-center">{isLoading && <div aria-hidden="true" className="mx-auto mb-6 max-w-xs space-y-3"><div className="h-3 w-2/3 motion-safe:animate-pulse rounded-full bg-[var(--color-brand-subtle)]" /><div className="h-3 w-full motion-safe:animate-pulse rounded-full bg-[var(--color-surface-subtle)]" /><div className="h-3 w-4/5 motion-safe:animate-pulse rounded-full bg-[var(--color-surface-subtle)]" /></div>}<p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">prototype · {view}</p><h2 className="mt-2 text-lg font-semibold">{state.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{state.description}</p>{state.action && <button type="button" className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] px-4 text-sm font-medium text-[var(--color-primary-pressed)] ${focusClass}`} onClick={() => setPrototypeView("ready")}>{state.action}</button>}</div></section>}</>;
}
