import { PrototypeIcon } from "@prototype/icons";
import type { OrderStatus } from "@prototype/shared";

export type MallOrderStatus = Extract<OrderStatus, "pending_fulfillment" | "shipping" | "completed">;

export type MallOrderSnapshot = {
  id: string;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  payable: number;
  address: string;
};

type MallOrderViewProps = {
  snapshot: MallOrderSnapshot;
  status: MallOrderStatus;
  onBack: () => void;
  onAdvance: () => void;
};

const statusCopy: Record<MallOrderStatus, { title: string; subtitle: string }> = {
  pending_fulfillment: {
    title: "待发货",
    subtitle: "商家正在准备商品，发货后会更新物流信息。",
  },
  shipping: {
    title: "运输中",
    subtitle: "包裹已发出，请留意最新物流进展。",
  },
  completed: {
    title: "已签收 / 已完成",
    subtitle: "订单已完成，感谢你的选购。",
  },
};

function money(value: number) {
  return value.toFixed(2);
}

export function MallOrderView({ snapshot, status, onBack, onAdvance }: MallOrderViewProps) {
  const stage = status === "pending_fulfillment" ? 0 : status === "shipping" ? 1 : 2;
  const trackingNo = `AN${snapshot.id.replace(/\D/g, "").slice(-12).padStart(12, "0")}`;
  const trackingLines = status === "pending_fulfillment"
    ? ["订单已确认", "等待商家发货", "发货后更新运输轨迹"]
    : status === "shipping"
      ? ["安心速运已揽收", "包裹已离开华南分拨中心", "正在送往收货城市"]
      : ["包裹已送达", "收货人已签收", "本次配送已完成"];

  return (
    <div
      data-testid="mall-order"
      className="-mx-4 min-h-[100dvh] bg-[var(--color-background)] pb-[calc(88px+env(safe-area-inset-bottom))]"
    >
      <header
        data-testid="mall-order-topbar"
        className="sticky top-0 z-30 flex h-[calc(52px+env(safe-area-inset-top))] items-end border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-1 pt-[env(safe-area-inset-top)] backdrop-blur"
      >
        <button
          type="button"
          aria-label="返回商城"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]"
        >
          <PrototypeIcon name="back" size={21} />
        </button>
        <h2 className="pointer-events-none absolute bottom-[15px] left-1/2 -translate-x-1/2 text-[16px] font-semibold tracking-[-0.01em]">订单详情</h2>
      </header>

      <section
        data-testid="mall-order-hero"
        className="flex h-[112px] items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-brand-subtle)] px-4"
      >
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${status === "completed" ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-surface)] text-[var(--color-primary)]"}`}>
          <PrototypeIcon name={status === "completed" ? "success" : "cart"} size={23} />
        </span>
        <div className="min-w-0">
          <p className="text-[22px] font-semibold tracking-[-0.02em]">{statusCopy[status].title}</p>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[var(--color-text-secondary)]">{statusCopy[status].subtitle}</p>
        </div>
      </section>

      <div
        data-testid="mall-order-number"
        className="flex h-11 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[12px]"
      >
        <span className="text-[var(--color-text-secondary)]">订单编号</span>
        <span className="truncate font-medium">{snapshot.id}</span>
      </div>

      <section
        data-testid="mall-order-progress"
        aria-label="物流状态进度"
        className="flex h-[72px] items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4"
      >
        {["待发货", "运输中", "已签收"].map((label, index) => {
          const reached = index <= stage;
          const current = index === stage;
          return (
            <div key={label} className="relative flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
              {index < 2 && (
                <span className={`absolute left-1/2 top-[11px] h-px w-full ${index < stage ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
              )}
              <span className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[10px] font-semibold ${reached ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-tertiary)]"}`}>
                {reached && !current ? "✓" : index + 1}
              </span>
              <span className={`text-[10px] ${current ? "font-semibold text-[var(--color-primary-pressed)]" : "text-[var(--color-text-tertiary)]"}`}>{label}</span>
            </div>
          );
        })}
      </section>

      <section
        data-testid="mall-order-logistics"
        className="h-[228px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-[11px]"
      >
        <div className="flex h-11 items-center justify-between gap-3 border-b border-[var(--color-border)]">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold">物流信息</p>
            <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">{status === "pending_fulfillment" ? "待商家发货" : `安心速运 · ${trackingNo}`}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-surface-subtle)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)]">全国快递</span>
        </div>
        <div className="pt-3">
          {trackingLines.map((line, index) => (
            <div key={line} className="relative flex min-h-[50px] gap-3 pl-1">
              {index < trackingLines.length - 1 && <span className="absolute left-[7px] top-[17px] h-[38px] w-px bg-[var(--color-border)]" />}
              <span className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${index === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium">{line}</p>
                <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">{index === 0 ? "最新进展" : index === 1 ? "上一节点" : "订单节点"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        data-testid="mall-order-info"
        className="h-[108px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1"
      >
        <div className="flex h-7 items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-secondary)]">商品数量</span>
          <span className="font-medium">{snapshot.itemCount} 件</span>
        </div>
        <div className="flex h-7 items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-secondary)]">实付金额</span>
          <span className="font-semibold text-[var(--color-primary-pressed)]">¥{money(snapshot.payable)}</span>
        </div>
        <div className="flex h-[44px] items-center justify-between gap-3 border-t border-[var(--color-border)] text-[11px]">
          <span className="shrink-0 text-[var(--color-text-secondary)]">收货信息</span>
          <span className="line-clamp-2 max-w-[250px] text-right font-medium leading-4">{snapshot.address}</span>
        </div>
      </section>

      <div
        data-testid="mall-order-actionbar"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[390px] items-start gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 pt-3 pb-[env(safe-area-inset-bottom)]"
      >
        {status !== "completed" && (
          <button
            type="button"
            onClick={onBack}
            className="h-12 min-w-[104px] rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-secondary)] active:bg-[var(--color-surface-subtle)]"
          >
            返回商城
          </button>
        )}
        <button
          type="button"
          onClick={status === "completed" ? onBack : onAdvance}
          className="h-12 min-w-0 flex-1 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] active:bg-[var(--color-primary-pressed)]"
        >
          {status === "pending_fulfillment" ? "刷新物流" : status === "shipping" ? "确认收货" : "返回商城继续购物"}
        </button>
      </div>
    </div>
  );
}
