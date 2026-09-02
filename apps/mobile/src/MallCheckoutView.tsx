import { PrototypeIcon } from "@prototype/icons";
import type { Product } from "@prototype/shared";
import { MallProductArtwork } from "./MallProductArtwork";

type MallCheckoutRow = {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type MallCheckoutViewProps = {
  address: string;
  sourceLabel: string;
  sourceName: string;
  rows: MallCheckoutRow[];
  subtotal: number;
  shippingFee: number;
  payable: number;
  freeShippingThreshold: number;
  couponTitle?: string;
  onBack: () => void;
  onSubmit: () => void;
};

function money(value: number) {
  return value.toFixed(2);
}

export function MallCheckoutView({
  address,
  sourceLabel,
  sourceName,
  rows,
  subtotal,
  shippingFee,
  payable,
  freeShippingThreshold,
  couponTitle,
  onBack,
  onSubmit,
}: MallCheckoutViewProps) {
  const [receiver = "收货人", phone = "", ...addressParts] = address.split(" · ");
  const addressLine = addressParts.join(" · ") || address;

  return (
    <div
      data-testid="mall-checkout"
      className="-mx-4 min-h-[100dvh] bg-[var(--color-background)] pb-[calc(88px+env(safe-area-inset-bottom))]"
    >
      <header
        data-testid="mall-checkout-topbar"
        className="sticky top-0 z-30 flex h-[calc(52px+env(safe-area-inset-top))] items-end border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-1 pt-[env(safe-area-inset-top)] backdrop-blur"
      >
        <button
          type="button"
          aria-label="返回购物车"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]"
        >
          <PrototypeIcon name="back" size={21} />
        </button>
        <h2 className="pointer-events-none absolute bottom-[15px] left-1/2 -translate-x-1/2 text-[16px] font-semibold tracking-[-0.01em]">
          确认收货与订单
        </h2>
      </header>

      <section
        data-testid="mall-checkout-address"
        className="flex h-[104px] items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary)]">
          <PrototypeIcon name="home" size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">收货地址</p>
          <div className="mt-1 flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 text-[14px] font-semibold">{receiver}</span>
            {phone && <span className="truncate text-[12px] text-[var(--color-text-secondary)]">{phone}</span>}
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">{addressLine}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-success-bg)] px-2 py-1 text-[10px] font-medium text-[var(--color-success)]">送货上门</span>
      </section>

      <section
        data-testid="mall-checkout-fulfillment"
        className="h-[116px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4"
      >
        <div className="flex h-[38px] items-center justify-between gap-4 border-b border-[var(--color-border)] text-[12px]">
          <span className="shrink-0 text-[var(--color-text-secondary)]">店铺来源</span>
          <span className="min-w-0 truncate font-medium">{sourceLabel} · {sourceName}</span>
        </div>
        <div className="flex h-[39px] items-center justify-between gap-4 border-b border-[var(--color-border)] text-[12px]">
          <span className="shrink-0 text-[var(--color-text-secondary)]">配送方式</span>
          <span className="font-medium">全国快递 · 送货上门</span>
        </div>
        <div className="flex h-[39px] items-center justify-between gap-4 text-[12px]">
          <span className="shrink-0 text-[var(--color-text-secondary)]">订单备注</span>
          <span className="text-[var(--color-text-tertiary)]">暂无备注</span>
        </div>
      </section>

      <section data-testid="mall-checkout-items" className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        {rows.map(({ product, quantity, unitPrice }) => (
          <div
            key={product.id}
            data-testid="mall-checkout-item"
            className="flex h-[72px] items-center gap-3 border-b border-[var(--color-border)] px-4 last:border-b-0"
          >
            <MallProductArtwork
              productId={product.id}
              name={product.name}
              className="h-14 w-14 shrink-0 rounded-[var(--radius-container)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{product.name}</p>
              <p className="mt-1 truncate text-[10px] text-[var(--color-text-tertiary)]">{product.spec ?? product.category} · ×{quantity}</p>
            </div>
            <span className="shrink-0 text-[13px] font-semibold">¥{money(unitPrice * quantity)}</span>
          </div>
        ))}
      </section>

      <section
        data-testid="mall-checkout-amounts"
        className="h-[132px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5"
      >
        <div className="flex h-7 items-center justify-between text-[12px]">
          <span className="text-[var(--color-text-secondary)]">商品金额</span>
          <span className="font-medium">¥{money(subtotal)}</span>
        </div>
        <div className="flex h-7 items-center justify-between text-[12px]">
          <span className="text-[var(--color-text-secondary)]">运费</span>
          <span className="font-medium">{shippingFee === 0 ? `满 ¥${freeShippingThreshold} 包邮` : `¥${money(shippingFee)}`}</span>
        </div>
        <div className="flex h-7 items-center justify-between gap-3 text-[12px]">
          <span className="min-w-0 truncate text-[var(--color-text-secondary)]">商城优惠{couponTitle ? ` · ${couponTitle}` : ""}</span>
          <span className="shrink-0 font-medium text-[var(--color-primary-pressed)]">{couponTitle ? "已关联" : "—"}</span>
        </div>
        <div className="flex h-9 items-center justify-between border-t border-[var(--color-border)] text-[13px]">
          <span className="font-semibold">应付金额</span>
          <span className="text-[20px] font-bold text-[var(--color-primary-pressed)]">¥{money(payable)}</span>
        </div>
      </section>

      <div
        data-testid="mall-checkout-submitbar"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[390px] items-start gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 pt-3 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[10px] text-[var(--color-text-tertiary)]">合计</p>
          <p className="mt-0.5 text-[18px] font-bold leading-5 text-[var(--color-primary-pressed)]">¥{money(payable)}</p>
        </div>
        <button
          type="button"
          disabled={rows.length === 0}
          onClick={onSubmit}
          className="h-12 min-w-[148px] rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40 active:bg-[var(--color-primary-pressed)]"
        >
          提交订单
        </button>
      </div>
    </div>
  );
}
