import { PrototypeIcon } from "@prototype/icons";
import type { Product } from "@prototype/shared";
import { MallProductArtwork } from "./MallProductArtwork";

type MallCartRow = {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type MallCartViewProps = {
  sourceLabel: string;
  sourceName: string;
  cartCount: number;
  rows: MallCartRow[];
  subtotal: number;
  shippingFee: number;
  payable: number;
  freeShippingThreshold: number;
  onContinueShopping: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onCheckout: () => void;
};

function money(value: number) {
  return value.toFixed(value % 1 === 0 ? 0 : 2);
}

export function MallCartView({
  sourceLabel,
  sourceName,
  cartCount,
  rows,
  subtotal,
  shippingFee,
  payable,
  freeShippingThreshold,
  onContinueShopping,
  onUpdateQuantity,
  onCheckout,
}: MallCartViewProps) {
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      data-testid="mall-cart"
      className="-mx-4 min-h-[calc(100dvh-64px)] bg-[var(--color-background)] pb-[calc(152px+env(safe-area-inset-bottom))]"
    >
      <header
        data-testid="mall-cart-title"
        className="sticky top-0 z-20 flex h-[calc(56px+env(safe-area-inset-top))] items-end border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-1 pt-[env(safe-area-inset-top)] backdrop-blur"
      >
        <button
          type="button"
          aria-label="返回商城"
          onClick={onContinueShopping}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]"
        >
          <PrototypeIcon name="back" size={21} />
        </button>
        <h2 className="pointer-events-none absolute bottom-[14px] left-1/2 -translate-x-1/2 text-[17px] font-semibold tracking-[-0.01em]">购物车</h2>
        <span className="ml-auto flex h-11 items-center px-3 text-xs text-[var(--color-text-tertiary)]">共 {cartCount} 件</span>
      </header>

      <div
        data-testid="mall-cart-source"
        className="flex h-11 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xs"
      >
        <span className="shrink-0 font-semibold text-[var(--color-text-primary)]">{sourceLabel}</span>
        <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]">{sourceName}</span>
        <span className="shrink-0 rounded-full bg-[var(--color-success-bg)] px-2 py-1 text-[10px] font-medium text-[var(--color-success)]">全国快递</span>
      </div>

      {rows.length === 0 ? (
        <div className="mx-4 mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-[var(--radius-overlay)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-primary)]">
            <PrototypeIcon name="cart" size={22} />
          </span>
          <p className="mt-4 font-semibold">购物车还是空的</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">挑一件喜欢的商品，再回来结算。</p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="mt-4 h-11 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] active:bg-[var(--color-primary-pressed)]"
          >
            去逛商城
          </button>
        </div>
      ) : (
        <>
          <div data-testid="mall-cart-list" className="border-b border-[var(--color-border)]">
            {rows.map(({ product, quantity, unitPrice, subtotal: rowSubtotal }) => (
              <section
                key={product.id}
                data-testid="mall-cart-row"
                className="flex h-32 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 last:border-b-0"
              >
                <MallProductArtwork
                  productId={product.id}
                  name={product.name}
                  className="h-[82px] w-[82px] shrink-0 rounded-[var(--radius-container)]"
                />
                <div className="flex h-[104px] min-w-0 flex-1 flex-col">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold leading-5">{product.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[11px] font-semibold text-[var(--color-primary-pressed)]">¥</span>
                    <span className="text-[16px] font-bold text-[var(--color-primary-pressed)]">{money(unitPrice)}</span>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <button
                        type="button"
                        aria-label={`减少${product.name}`}
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="flex h-11 w-11 items-center justify-center text-lg active:bg-[var(--color-surface-subtle)]"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-xs font-semibold">{quantity}</span>
                      <button
                        type="button"
                        aria-label={`增加${product.name}`}
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="flex h-11 w-11 items-center justify-center text-lg active:bg-[var(--color-surface-subtle)]"
                      >
                        +
                      </button>
                    </div>
                    <span className="pb-2 text-right text-[12px] font-semibold text-[var(--color-text-primary)]">¥{money(rowSubtotal)}</span>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section
            data-testid="mall-cart-summary"
            className="h-[116px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">商品小计</span>
              <span className="font-semibold">¥{money(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">预计运费</span>
              <span className="font-semibold">{shippingFee === 0 ? "包邮" : `¥${money(shippingFee)}`}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-[var(--color-text-tertiary)]">
                  {remainingForFreeShipping === 0 ? `已满足满 ¥${freeShippingThreshold} 包邮` : `再购 ¥${money(remainingForFreeShipping)} 包邮`}
                </span>
                <span className="shrink-0 text-[var(--color-text-tertiary)]">满 ¥{freeShippingThreshold}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </section>

          <div
            data-testid="mall-cart-checkoutbar"
            className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 mx-auto flex h-[68px] max-w-[390px] items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--color-text-tertiary)]">合计</p>
              <p className="mt-0.5 truncate text-[18px] font-bold leading-5 text-[var(--color-primary-pressed)]">¥{money(payable)}</p>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="h-12 min-w-[132px] rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] active:bg-[var(--color-primary-pressed)]"
            >
              去结算
            </button>
          </div>
        </>
      )}
    </div>
  );
}
