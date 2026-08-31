import { useState, type Dispatch, type SetStateAction } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  catalogProducts,
  channels,
  coreDemoUser,
  coreUserV02Coupons,
  findById,
  storefronts,
  type OrderStatus,
  type Product,
} from "@prototype/shared";
import type { SearchBusinessHandoff } from "./GlobalSearchScreen";

type MallStep = "home" | "detail" | "cart" | "checkout" | "order";
export type StorefrontCartState = Record<string, Record<string, number>>;

type MallOrderSnapshot = {
  id: string;
  storefrontName: string;
  channelName: string;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  payable: number;
  address: string;
};

interface MallFlowScreenProps {
  entryContext?: SearchBusinessHandoff;
  carts: StorefrontCartState;
  setCarts: Dispatch<SetStateAction<StorefrontCartState>>;
}

const mallProducts = catalogProducts.filter((product) => product.scenes.includes("mall"));
const activeStorefronts = storefronts.filter((storefront) => storefront.status === "active");
const defaultStorefront = activeStorefronts[0] ?? storefronts[0];
const defaultProduct = mallProducts[0];
const mallCoupon = coreUserV02Coupons.find((coupon) => coupon.scene === "mall" && coupon.status === "available");
const categories = ["全部", ...Array.from(new Set(mallProducts.map((product) => product.category)))];
const freeShippingThreshold = 99;
const standardShippingFee = 8;
const demoAddress = "林女士 · 138****8899 · 广东省华南某市演示路 88 号";
const mallStatusLabels: Record<Extract<OrderStatus, "pending_fulfillment" | "shipping" | "completed">, string> = {
  pending_fulfillment: "待发货",
  shipping: "运输中",
  completed: "已签收 / 已完成",
};

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function productPrice(product: Product) {
  return product.memberPriceYuan ?? product.priceYuan;
}

function ProductVisual({ product, compact = false }: { product: Product; compact?: boolean }) {
  return (
    <div
      role="img"
      aria-label={`${product.name} 商品图`}
      className={`flex shrink-0 items-end overflow-hidden rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-brand-subtle)] p-3 ${compact ? "h-20 w-20" : "h-44 w-full"}`}
    >
      <div>
        <span className="inline-flex rounded-full bg-[var(--color-surface)] px-2 py-1 text-[10px] font-semibold text-[var(--color-primary-pressed)]">精选好物</span>
        {!compact && <p className="mt-2 max-w-[240px] text-lg font-semibold leading-6 text-[var(--color-text-primary)]">{product.name}</p>}
      </div>
    </div>
  );
}

export function MallFlowScreen({ entryContext, carts, setCarts }: MallFlowScreenProps) {
  const entryProduct = entryContext?.entityType === "product"
    ? findById(catalogProducts, entryContext.entityId)
    : undefined;
  const [step, setStep] = useState<MallStep>(() => entryProduct ? "detail" : "home");
  const [selectedStorefrontId, setSelectedStorefrontId] = useState(defaultStorefront?.id ?? "");
  const [selectedProductId, setSelectedProductId] = useState(entryProduct?.id ?? defaultProduct?.id ?? "");
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState<Extract<OrderStatus, "pending_fulfillment" | "shipping" | "completed">>("pending_fulfillment");
  const [orderSnapshot, setOrderSnapshot] = useState<MallOrderSnapshot | null>(null);

  const selectedStorefront = findById(storefronts, selectedStorefrontId) ?? defaultStorefront;
  const selectedChannel = selectedStorefront ? findById(channels, selectedStorefront.channelId) : undefined;
  const selectedProduct = findById(catalogProducts, selectedProductId) ?? defaultProduct;
  const currentCart = selectedStorefront ? carts[selectedStorefront.id] ?? {} : {};
  const cartCount = Object.values(currentCart).reduce((sum, quantity) => sum + quantity, 0);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = mallProducts.filter((product) => {
    const matchesCategory = category === "全部" || product.category === category;
    const matchesQuery = !normalizedQuery || `${product.name} ${product.category} ${product.spec ?? ""}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const cartRows = Object.entries(currentCart).flatMap(([productId, quantity]) => {
    const product = findById(catalogProducts, productId);
    if (!product || quantity <= 0) return [];
    const unitPrice = productPrice(product);
    return [{ product, quantity, unitPrice, subtotal: unitPrice * quantity }];
  });
  const subtotal = cartRows.reduce((sum, row) => sum + row.subtotal, 0);
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const payable = subtotal + shippingFee;

  const goStep = (next: MallStep) => {
    setStep(next);
    scrollTop();
  };

  const switchStorefront = (storefrontId: string) => {
    setSelectedStorefrontId(storefrontId);
    setCategory("全部");
    setQuery("");
  };

  const openProduct = (productId: string) => {
    setSelectedProductId(productId);
    goStep("detail");
  };

  const updateQuantity = (productId: string, delta: number) => {
    if (!selectedStorefront) return;
    setCarts((current) => {
      const storefrontCart = { ...(current[selectedStorefront.id] ?? {}) };
      const nextQuantity = Math.max(0, (storefrontCart[productId] ?? 0) + delta);
      if (nextQuantity === 0) delete storefrontCart[productId];
      else storefrontCart[productId] = nextQuantity;
      return { ...current, [selectedStorefront.id]: storefrontCart };
    });
  };

  const addSelectedProduct = () => {
    if (!selectedProduct) return;
    updateQuantity(selectedProduct.id, 1);
  };

  const buyNow = () => {
    if (!selectedProduct) return;
    updateQuantity(selectedProduct.id, 1);
    goStep("cart");
  };

  const submitOrder = () => {
    if (!selectedStorefront || !selectedChannel || cartRows.length === 0) return;
    const orderId = `MALL-${selectedStorefront.id}-${coreDemoUser.id.replace("LL-", "")}`;
    setOrderSnapshot({
      id: orderId,
      storefrontName: selectedStorefront.name,
      channelName: selectedChannel.name,
      itemCount: cartCount,
      subtotal,
      shippingFee,
      payable,
      address: demoAddress,
    });
    setCarts((current) => ({ ...current, [selectedStorefront.id]: {} }));
    setOrderStatus("pending_fulfillment");
    goStep("order");
  };

  const advanceOrder = () => {
    setOrderStatus((current) => current === "pending_fulfillment" ? "shipping" : "completed");
  };

  if (!selectedStorefront || !selectedChannel) {
    return (
      <Card>
        <p className="font-semibold">商城渠道数据暂不可用</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">T019 需要至少一套有效的 Storefront / Channel 关系后才能演示购买闭环。</p>
      </Card>
    );
  }

  if (step === "home") {
    return (
      <>
        <section className="overflow-hidden rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-white/70">ONLINE MALL · NATIONWIDE DELIVERY</p>
              <h2 className="mt-3 text-2xl font-semibold">线上商城</h2>
              <p className="mt-2 text-sm leading-6 text-white/80">独立购物车、全国快递、完整订单与物流状态；不与便利店库存或履约混用。</p>
            </div>
            <button type="button" onClick={() => goStep("cart")} aria-label={`商城购物车，共 ${cartCount} 件`} className="relative flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
              <PrototypeIcon name="modules" size={19} />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-white px-1 text-center text-[10px] font-bold text-[var(--color-primary-pressed)]">{cartCount}</span>}
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-[var(--radius-container)] bg-white/10 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{selectedStorefront.name}</p>
              <p className="mt-1 truncate text-xs text-white/70">来源：{selectedChannel.name} · 全国快递</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold">当前 Storefront</span>
          </div>
        </section>

        <Section title="店铺 / 渠道来源">
          <div className="grid grid-cols-2 gap-3">
            {storefronts.map((storefront) => {
              const channel = findById(channels, storefront.channelId);
              const selected = storefront.id === selectedStorefront.id;
              return (
                <button
                  key={storefront.id}
                  type="button"
                  aria-label={`切换商城：${storefront.name}`}
                  aria-pressed={selected}
                  onClick={() => switchStorefront(storefront.id)}
                  className={`min-h-[104px] rounded-[var(--radius-container)] border p-3 text-left ${selected ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--color-primary-pressed)]">{channel?.name ?? "Channel"}</span>
                    <StatusTag tone={storefront.status === "active" ? "success" : "warning"}>{storefront.status === "active" ? "可演示" : "暂停"}</StatusTag>
                  </div>
                  <p className="mt-3 font-semibold leading-5">{storefront.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{channel?.integrationStatus === "planned" ? "规划语义样本 · 不跳转外部平台" : "Mock 渠道 · 当前原型内演示"}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">Storefront 与 Channel 是独立语义；切换来源不会调用真实外部商城 API。每个 Storefront 保留自己的商城购物车。</p>
        </Section>

        <div className="relative">
          <PrototypeIcon name="search" size={18} className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-text-tertiary)]" />
          <input
            aria-label="商城内搜索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索商城商品"
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="商城商品分类">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm ${category === item ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <Section title="推荐好物">
          <div className="grid grid-cols-2 gap-3">
            {visibleProducts.map((product) => {
              const price = productPrice(product);
              return (
                <button key={product.id} type="button" aria-label={`查看商品：${product.name}`} onClick={() => openProduct(product.id)} className="min-w-0 text-left">
                  <Card className="h-full p-3 transition active:bg-[var(--color-surface-subtle)]">
                    <ProductVisual product={product} />
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[var(--color-primary-pressed)]">¥{price.toFixed(2)}</p>
                        {product.originalPriceYuan && product.originalPriceYuan > price && <p className="text-[10px] text-[var(--color-text-tertiary)] line-through">¥{product.originalPriceYuan.toFixed(2)}</p>}
                      </div>
                      <StatusTag tone="success">全国包裹</StatusTag>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
          {visibleProducts.length === 0 && (
            <Card className="bg-[var(--color-surface-subtle)]">
              <p className="font-semibold">没有匹配商品</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">换个关键词或分类继续逛逛。</p>
            </Card>
          )}
        </Section>

        <Card className="bg-[var(--color-surface-subtle)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">满 ¥{freeShippingThreshold} 包邮</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">T019 可追踪 Mock 规则：未满 ¥{freeShippingThreshold} 收 ¥{standardShippingFee} 运费；不连接真实仓配计价。</p>
            </div>
            <StatusTag>全国快递</StatusTag>
          </div>
        </Card>
      </>
    );
  }

  if (!selectedProduct) {
    return (
      <Card>
        <p className="font-semibold">没有可演示的商城商品</p>
        <Button className="mt-4 w-full" onClick={() => goStep("home")}>返回商城首页</Button>
      </Card>
    );
  }

  if (step === "detail") {
    const price = productPrice(selectedProduct);
    const cartQuantity = currentCart[selectedProduct.id] ?? 0;
    return (
      <>
        <button type="button" onClick={() => goStep("home")} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回商城
        </button>

        <ProductVisual product={selectedProduct} />

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusTag>{selectedProduct.category}</StatusTag>
            <StatusTag tone="success">{selectedStorefront.name}</StatusTag>
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-8">{selectedProduct.name}</h2>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-2xl font-semibold text-[var(--color-primary-pressed)]">¥{price.toFixed(2)}</p>
            {selectedProduct.originalPriceYuan && selectedProduct.originalPriceYuan > price && <p className="pb-0.5 text-sm text-[var(--color-text-tertiary)] line-through">¥{selectedProduct.originalPriceYuan.toFixed(2)}</p>}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">规格：{selectedProduct.spec ?? "标准规格"}</p>
          {selectedProduct.promotionLabel && <p className="mt-2 text-sm font-medium text-[var(--color-primary-pressed)]">优惠：{selectedProduct.promotionLabel}</p>}
        </section>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">配送与包邮</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">全国快递 · 满 ¥{freeShippingThreshold} 包邮，未满运费 ¥{standardShippingFee}。商城不读取便利店库存、距离或履约能力。</p>
            </div>
            <StatusTag tone="success">可寄送</StatusTag>
          </div>
        </Card>

        {mallCoupon && (
          <Card className="bg-[var(--color-surface-subtle)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{mallCoupon.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">已关联统一账号；Shared 未定义具体减免金额，本页不擅自计算。</p>
              </div>
              <StatusTag tone="success">可用</StatusTag>
            </div>
          </Card>
        )}

        {cartQuantity > 0 && <p className="text-center text-xs text-[var(--color-text-tertiary)]">当前 Storefront 购物车已有 {cartQuantity} 件</p>}
        <Button className="w-full" onClick={addSelectedProduct}>加入购物车</Button>
        <SecondaryButton className="w-full" onClick={buyNow}>立即购买</SecondaryButton>
      </>
    );
  }

  if (step === "cart") {
    return (
      <>
        <button type="button" onClick={() => goStep("home")} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 继续购物
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">{selectedStorefront.name} · 独立购物车</p>
          <h2 className="mt-1 text-2xl font-semibold">购物车</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前购物车只属于线上 Storefront，不与任何便利店购物车混单。</p>
        </div>

        {cartRows.length === 0 ? (
          <Card className="bg-[var(--color-surface-subtle)]">
            <p className="font-semibold">购物车还是空的</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">先挑一件商品再来结算。</p>
            <Button className="mt-4 w-full" onClick={() => goStep("home")}>去逛商城</Button>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {cartRows.map(({ product, quantity, unitPrice, subtotal: rowSubtotal }) => (
                <Card key={product.id} className="p-4">
                  <div className="flex gap-3">
                    <ProductVisual product={product} compact />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-5">{product.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                      <p className="mt-2 font-semibold text-[var(--color-primary-pressed)]">¥{unitPrice.toFixed(2)}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-[var(--color-border)]">
                          <button type="button" aria-label={`减少${product.name}`} onClick={() => updateQuantity(product.id, -1)} className="flex min-h-11 min-w-11 items-center justify-center text-lg">−</button>
                          <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
                          <button type="button" aria-label={`增加${product.name}`} onClick={() => updateQuantity(product.id, 1)} className="flex min-h-11 min-w-11 items-center justify-center text-lg">+</button>
                        </div>
                        <span className="text-sm font-semibold">¥{rowSubtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card>
              <div className="flex items-center justify-between gap-3"><span className="text-sm text-[var(--color-text-secondary)]">商品小计</span><span className="font-semibold">¥{subtotal.toFixed(2)}</span></div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="text-sm text-[var(--color-text-secondary)]">预计运费</span><span className="font-semibold">{shippingFee === 0 ? "包邮" : `¥${shippingFee.toFixed(2)}`}</span></div>
              {subtotal < freeShippingThreshold && <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">再购 ¥{(freeShippingThreshold - subtotal).toFixed(2)} 可按当前 Mock 规则包邮。</p>}
            </Card>

            <Button className="w-full" onClick={() => goStep("checkout")}>去结算 · ¥{payable.toFixed(2)}</Button>
          </>
        )}
      </>
    );
  }

  if (step === "checkout") {
    return (
      <>
        <button type="button" onClick={() => goStep("cart")} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回购物车
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">结算确认</p>
          <h2 className="mt-1 text-2xl font-semibold">确认收货与订单</h2>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)]">收货地址 · 演示数据</p>
              <p className="mt-2 font-semibold">{demoAddress}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">仅用于 T019 购买闭环，不写入真实用户资料。</p>
            </div>
            <StatusTag tone="success">全国快递</StatusTag>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3"><span className="text-sm text-[var(--color-text-secondary)]">店铺 / 渠道</span><span className="max-w-[220px] text-right font-semibold">{selectedStorefront.name} · {selectedChannel.name}</span></div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="text-sm text-[var(--color-text-secondary)]">商品</span><span className="font-semibold">{cartCount} 件 · ¥{subtotal.toFixed(2)}</span></div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="text-sm text-[var(--color-text-secondary)]">运费</span><span className="font-semibold">{shippingFee === 0 ? `满 ¥${freeShippingThreshold} 包邮` : `¥${shippingFee.toFixed(2)}`}</span></div>
          <div className="mt-3 flex items-start justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="text-sm text-[var(--color-text-secondary)]">商城优惠</span><span className="max-w-[220px] text-right text-sm font-medium">{mallCoupon ? `${mallCoupon.title} · 金额规则未定义` : "暂无可用优惠"}</span></div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="font-semibold">应付</span><span className="text-lg font-semibold text-[var(--color-primary-pressed)]">¥{payable.toFixed(2)}</span></div>
        </Card>

        <Card className="bg-[var(--color-surface-subtle)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">提交只生成当前会话内的 Mock 商城订单，不发起真实支付、外部平台下单、库存锁定或物流创建。提交成功后会消费当前 Storefront 的购物车。</p>
          </div>
        </Card>

        <Button className="w-full" disabled={cartRows.length === 0} onClick={submitOrder}>提交演示订单</Button>
      </>
    );
  }

  if (!orderSnapshot) {
    return (
      <Card>
        <p className="font-semibold">订单快照不可用</p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">请返回商城重新从购物车提交演示订单。</p>
        <Button className="mt-4 w-full" onClick={() => goStep("home")}>返回商城</Button>
      </Card>
    );
  }

  const status = mallStatusLabels[orderStatus];
  const trackingVisible = orderStatus === "shipping" || orderStatus === "completed";
  return (
    <>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">商城订单详情</p>
        <h2 className="mt-1 break-all text-2xl font-semibold">{orderSnapshot.id}</h2>
      </div>

      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusTag tone={orderStatus === "completed" ? "success" : undefined}>{status}</StatusTag>
          <span className="text-xs text-[var(--color-text-tertiary)]">Mock order</span>
        </div>
        <p className="mt-5 font-semibold">{orderSnapshot.storefrontName}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{orderSnapshot.channelName} · 全国快递 · {orderSnapshot.itemCount} 件商品</p>
        <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">商品小计</span><span className="font-medium">¥{orderSnapshot.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">运费</span><span className="font-medium">{orderSnapshot.shippingFee === 0 ? "包邮" : `¥${orderSnapshot.shippingFee.toFixed(2)}`}</span></div>
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">应付</span><span className="font-semibold">¥{orderSnapshot.payable.toFixed(2)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">收货</span><span className="max-w-[230px] text-right font-medium">{orderSnapshot.address}</span></div>
        </div>
      </section>

      <Section title="物流进度">
        <div className="space-y-3">
          <Card className={orderStatus === "pending_fulfillment" ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "bg-[var(--color-surface-subtle)]"}>
            <div className="flex items-center justify-between gap-3"><p className="font-semibold">待发货</p><span className="text-xs text-[var(--color-text-tertiary)]">订单已提交</span></div>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">商城已收到订单，等待 Mock 仓配侧出库。</p>
          </Card>
          <Card className={orderStatus === "shipping" ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "bg-[var(--color-surface-subtle)]"}>
            <div className="flex items-center justify-between gap-3"><p className="font-semibold">运输中</p><span className="text-xs text-[var(--color-text-tertiary)]">全国快递</span></div>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{trackingVisible ? "演示物流 · MOCK-SF-20260831 · 已离开华南分拨中心" : "发货后显示承运与轨迹信息。"}</p>
          </Card>
          <Card className={orderStatus === "completed" ? "border-[var(--color-success)] bg-[var(--color-success-bg)]" : "bg-[var(--color-surface-subtle)]"}>
            <div className="flex items-center justify-between gap-3"><p className="font-semibold">已签收</p>{orderStatus === "completed" && <PrototypeIcon name="success" size={20} className="text-[var(--color-success)]" />}</div>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">签收后订单进入已完成状态；售后能力不在 T019 范围。</p>
          </Card>
        </div>
      </Section>

      {orderStatus !== "completed" && <Button className="w-full" onClick={advanceOrder}>{orderStatus === "pending_fulfillment" ? "模拟发货" : "模拟签收"}</Button>}
      {orderStatus === "completed" && (
        <Card className="bg-[var(--color-success-bg)]">
          <p className="font-semibold">订单已签收</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">T019 的商城首页 → 商品详情 → 独立购物车 → 结算 → 待发货 → 运输中 → 签收闭环已走通；已提交购物车不会再次出现在商城中。</p>
        </Card>
      )}
      <SecondaryButton className="w-full" onClick={() => goStep("home")}>返回商城继续购物</SecondaryButton>
    </>
  );
}
