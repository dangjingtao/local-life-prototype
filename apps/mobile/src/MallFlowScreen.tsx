import { useState, type Dispatch, type SetStateAction } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  campaigns,
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
import { MallProductArtwork } from "./MallProductArtwork";

export type MallStep = "home" | "detail" | "cart" | "checkout" | "order";
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
  onStepChange?: (step: MallStep) => void;
  onOpenGlobalSearch?: () => void;
}

const mallProducts = catalogProducts.filter((product) => product.scenes.includes("mall"));
const activeStorefronts = storefronts.filter((storefront) => storefront.status === "active");
const defaultStorefront = activeStorefronts[0] ?? storefronts[0];
const defaultProduct = mallProducts[0];
const mallCoupon = coreUserV02Coupons.find((coupon) => coupon.scene === "mall" && coupon.status === "available");
const categories = ["全部", ...Array.from(new Set(mallProducts.map((product) => product.category)))];
const mallCampaign = campaigns.find((campaign) => campaign.scene === "mall" && campaign.status === "active");
const mallCampaignProductId = mallCampaign?.refs.find((ref) => ref.type === "product")?.id;
const mallCampaignProduct = mallCampaignProductId ? findById(catalogProducts, mallCampaignProductId) : undefined;
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

function storefrontConsumerName(channelKind?: string) {
  if (channelKind === "owned") return "官方商城";
  if (channelKind === "douyin") return "合作渠道专场";
  return "精选商城";
}

function storefrontConsumerMeta(channelKind?: string) {
  if (channelKind === "owned") return "正品保障";
  if (channelKind === "douyin") return "渠道精选";
  return "优选好物";
}

function ProductVisual({ product, compact = false, home = false }: { product: Product; compact?: boolean; home?: boolean }) {
  const sizeClass = compact
    ? "h-20 w-20 rounded-[var(--radius-container)]"
    : home
      ? "h-[110px] w-full rounded-t-[var(--radius-container)]"
      : "h-44 w-full rounded-[var(--radius-container)]";

  return <MallProductArtwork productId={product.id} name={product.name} className={sizeClass} />;
}

export function MallFlowScreen({ entryContext, carts, setCarts, onStepChange, onOpenGlobalSearch }: MallFlowScreenProps) {
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
    onStepChange?.(next);
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
        <p className="font-semibold">商城暂不可用</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前没有可用的线上商城来源，请稍后再试。</p>
      </Card>
    );
  }

  if (step === "home") {
    return (
      <div data-testid="mall-home" className="-mx-4 pb-2">
        <header
          data-testid="mall-home-header"
          className="flex h-[92px] items-center justify-between bg-[var(--color-background)] px-4 text-[var(--color-text-primary)]"
        >
          <div className="min-w-0">
            <h2 className="text-[25px] font-semibold leading-8 tracking-[-0.02em]">线上商城</h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">全国快递配送 · 送货上门</p>
          </div>
          <button
            type="button"
            onClick={() => goStep("cart")}
            aria-label={`商城购物车，共 ${cartCount} 件`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-text-primary)] active:bg-[var(--color-surface-subtle)]"
          >
            <PrototypeIcon name="cart" size={24} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)]">
                {cartCount}
              </span>
            )}
          </button>
        </header>

        <div className="px-4">
          <form
            data-testid="mall-search"
            className="flex h-12 overflow-hidden rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus-within:border-[var(--color-primary)]"
            onSubmit={(event) => {
              event.preventDefault();
              setQuery((current) => current.trim());
            }}
          >
            <div className="relative min-w-0 flex-1">
              <PrototypeIcon name="search" size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                aria-label="商城内搜索"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索商品名称"
                className="h-full w-full bg-transparent pl-11 pr-2 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              aria-label="执行商城搜索"
              className="min-w-[64px] bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-on-primary)] active:bg-[var(--color-primary-pressed)]"
            >
              搜索
            </button>
          </form>

          <section
            data-testid="mall-campaign-banner"
            aria-label={`商城活动：${mallCampaign?.title ?? "精选活动"}`}
            className="relative mt-4 h-[148px] overflow-hidden rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-brand-subtle)]"
          >
            <div className="absolute inset-y-0 right-0 w-[46%] opacity-90">
              <MallProductArtwork
                productId={mallCampaignProduct?.id ?? "PRODUCT-COLLAGEN-DRINK"}
                name={mallCampaignProduct?.name ?? "商城精选"}
                decorative
                className="h-full w-full"
              />
            </div>
            <div className="relative z-10 flex h-full w-[68%] flex-col justify-center px-4">
              <span className="w-fit rounded-full bg-[var(--color-surface)]/90 px-2 py-1 text-[10px] font-semibold text-[var(--color-primary-pressed)]">全国快递</span>
              <h3 className="mt-2 text-[22px] font-semibold leading-7 tracking-[-0.02em]">{mallCampaign?.title ?? "商城精选"}</h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">{mallCampaign?.subtitle ?? "精选好物，全国快递到家。"}</p>
            </div>
          </section>

          <div data-testid="mall-category-track" className="mt-3 flex h-11 items-center gap-2 overflow-x-auto" aria-label="商城商品分类">
            {categories.map((item) => {
              const selected = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(item)}
                  className="flex h-11 shrink-0 items-center"
                >
                  <span className={`flex h-9 items-center rounded-full border px-3.5 text-xs ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary)] font-semibold text-[var(--color-on-primary)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}>
                    {item === "全部" ? "推荐" : item}
                  </span>
                </button>
              );
            })}
          </div>

          <section data-testid="mall-source-section" className="mt-4 rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3" aria-labelledby="mall-source-title">
            <div className="flex items-center justify-between gap-3">
              <h3 id="mall-source-title" className="text-[16px] font-semibold">精选店铺</h3>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">{storefronts.length} 家可选</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
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
                    className={`flex h-[64px] min-w-0 items-center gap-2.5 rounded-[var(--radius-container)] border px-2.5 text-left transition ${selected ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-background)] active:bg-[var(--color-surface-subtle)]"}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selected ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "bg-[var(--color-surface-subtle)] text-[var(--color-primary)]"}`}>
                      <PrototypeIcon name={channel?.kind === "douyin" ? "store" : "success"} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold">{storefrontConsumerName(channel?.kind)}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-tertiary)]">{storefrontConsumerMeta(channel?.kind)}</span>
                    </span>
                    {selected && <PrototypeIcon name="success" size={14} className="shrink-0 text-[var(--color-primary)]" />}
                  </button>
                );
              })}
            </div>
          </section>

          <div data-testid="mall-recommend-title" className="mt-4 flex h-8 items-center justify-between">
            <h3 className="text-[18px] font-semibold tracking-[-0.01em]">为你推荐</h3>
            <span className="max-w-[150px] truncate text-[11px] text-[var(--color-text-tertiary)]">{selectedStorefront.name}</span>
          </div>

          {visibleProducts.length > 0 ? (
            <div data-testid="mall-product-grid" className="grid grid-cols-2 gap-[10px]">
              {visibleProducts.map((product) => {
                const price = productPrice(product);
                const freeShipping = price >= freeShippingThreshold;
                return (
                  <button
                    key={product.id}
                    type="button"
                    aria-label={`查看商品：${product.name}`}
                    onClick={() => openProduct(product.id)}
                    className="h-[208px] min-w-0 overflow-hidden rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] text-left shadow-[0_1px_2px_rgba(15,23,42,0.025)] active:bg-[var(--color-surface-subtle)]"
                  >
                    <ProductVisual product={product} home />
                    <div className="flex h-[98px] flex-col px-2.5 pb-2 pt-2">
                      <p className="line-clamp-1 text-[13px] font-semibold leading-[18px]">{product.name}</p>
                      <p className="mt-1 truncate text-[10px] text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                      <div className="mt-auto flex items-end justify-between gap-1">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[11px] font-semibold text-[var(--color-primary-pressed)]">¥</span>
                            <span className="text-[18px] font-bold leading-5 text-[var(--color-primary-pressed)]">{price.toFixed(0)}</span>
                            {product.originalPriceYuan && product.originalPriceYuan > price && (
                              <span className="truncate text-[9px] text-[var(--color-text-tertiary)] line-through">¥{product.originalPriceYuan.toFixed(0)}</span>
                            )}
                          </div>
                          {product.promotionLabel && <p className="mt-1 truncate text-[9px] font-medium text-[var(--color-primary-pressed)]">{product.promotionLabel}</p>}
                        </div>
                        <span className={`shrink-0 rounded-full px-1.5 py-1 text-[9px] font-medium ${freeShipping ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"}`}>
                          {freeShipping ? "包邮" : "全国快递"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[120px] items-center justify-center rounded-[var(--radius-container)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
              <div>
                <p className="font-semibold">没有匹配商品</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">换个关键词或分类继续逛逛。</p>
              </div>
            </div>
          )}

          <div data-testid="mall-shipping-strip" className="mt-4 grid h-[56px] grid-cols-3 items-center rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              <PrototypeIcon name="info" size={14} className="text-[var(--color-primary)]" /> 满 ¥{freeShippingThreshold} 包邮
            </div>
            <div className="flex items-center justify-center gap-1.5 border-x border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-secondary)]">
              <PrototypeIcon name="cart" size={14} className="text-[var(--color-primary)]" /> 全国快递配送
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              <PrototypeIcon name="success" size={14} className="text-[var(--color-primary)]" /> 安心选购
            </div>
          </div>
        </div>
      </div>
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
    const hasOriginalPrice = selectedProduct.originalPriceYuan !== undefined && selectedProduct.originalPriceYuan > price;
    const saving = hasOriginalPrice ? selectedProduct.originalPriceYuan! - price : 0;
    const freeShipping = price >= freeShippingThreshold;
    const isSearchHandoff = entryContext?.domain === "mall" && entryContext.entityType === "product";

    return (
      <div data-testid="mall-detail" className="relative -mx-4 bg-[var(--color-background)] pb-[88px]">
        <header data-testid="mall-detail-topbar" className="sticky top-0 z-20 flex h-12 items-center border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 backdrop-blur">
          <button type="button" aria-label="返回商城" onClick={() => goStep("home")} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]">
            <PrototypeIcon name="back" size={21} />
          </button>
          <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold">商品详情</p>
          <div className="ml-auto flex items-center">
            {onOpenGlobalSearch && (
              <button type="button" aria-label="打开全局搜索" onClick={onOpenGlobalSearch} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]">
                <PrototypeIcon name="search" size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={() => goStep("cart")}
              aria-label={`商城购物车，共 ${cartCount} 件`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]"
            >
              <PrototypeIcon name="cart" size={21} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)]">{cartCount}</span>
              )}
            </button>
          </div>
        </header>

        <MallProductArtwork
          productId={selectedProduct.id}
          name={selectedProduct.name}
          className="h-[286px] w-full"
        />

        <section data-testid="mall-detail-main-info" className="h-[132px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-full bg-[var(--color-brand-subtle)] px-2 py-1 text-[10px] font-semibold text-[var(--color-primary-pressed)]">{selectedProduct.category}</span>
            <span className="truncate rounded-full bg-[var(--color-surface-subtle)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)]">{storefrontConsumerName(selectedChannel.kind)}</span>
            {isSearchHandoff && <span className="ml-auto shrink-0 text-[10px] text-[var(--color-text-tertiary)]">来自全局搜索</span>}
          </div>
          <h2 className="mt-2 line-clamp-1 text-[21px] font-semibold leading-7 tracking-[-0.02em]">{selectedProduct.name}</h2>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-xs font-semibold text-[var(--color-primary-pressed)]">¥</span>
            <span className="text-[26px] font-bold leading-7 text-[var(--color-primary-pressed)]">{price.toFixed(price % 1 === 0 ? 0 : 2)}</span>
            {hasOriginalPrice && <span className="pb-0.5 text-xs text-[var(--color-text-tertiary)] line-through">¥{selectedProduct.originalPriceYuan!.toFixed(0)}</span>}
            {hasOriginalPrice && <span className="mb-0.5 rounded-full bg-[var(--color-danger-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-danger)]">已省 ¥{saving.toFixed(0)}</span>}
          </div>
        </section>

        <div data-testid="mall-detail-spec" className="flex h-11 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm">
          <span className="shrink-0 font-medium">规格</span>
          <span className="truncate text-[var(--color-text-secondary)]">{selectedProduct.spec ?? "标准规格"}</span>
        </div>

        <div data-testid="mall-detail-promotion" className="flex h-[52px] items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm">
          <span className="shrink-0 font-medium">促销</span>
          {selectedProduct.promotionLabel ? (
            <span className="rounded-full bg-[var(--color-brand-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-pressed)]">{selectedProduct.promotionLabel}</span>
          ) : (
            <span className="text-xs text-[var(--color-text-tertiary)]">当前无额外促销</span>
          )}
        </div>

        <section data-testid="mall-detail-shipping" className="flex h-[72px] items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">配送与包邮</p>
            <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">全国快递 · 满 ¥{freeShippingThreshold} 包邮{freeShipping ? " · 当前商品已包邮" : `，未满运费 ¥${standardShippingFee}`}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-success-bg)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-success)]">送货上门</span>
        </section>

        <section data-testid="mall-detail-coupon" className="flex h-[76px] items-center justify-between gap-4 bg-[var(--color-surface)] px-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">商城优惠</p>
            <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">{mallCoupon?.title ?? "暂无可用优惠"}</p>
          </div>
          {mallCoupon && <span className="shrink-0 rounded-full border border-[var(--color-primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-primary-pressed)]">可用</span>}
        </section>

        <div data-testid="mall-detail-buybar" className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[390px] items-start gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 pt-3 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={() => goStep("cart")}
            aria-label={`查看商城购物车，共 ${cartCount} 件`}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] active:bg-[var(--color-surface-subtle)]"
          >
            <PrototypeIcon name="cart" size={19} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)]">{cartCount}</span>}
          </button>
          <button type="button" onClick={addSelectedProduct} className="h-12 min-w-0 flex-1 rounded-[var(--radius-control)] border border-[var(--color-primary)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-primary-pressed)] active:bg-[var(--color-brand-subtle)]">加入购物车</button>
          <button type="button" onClick={buyNow} className="h-12 min-w-0 flex-1 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-on-primary)] active:bg-[var(--color-primary-pressed)]">立即购买</button>
        </div>
      </div>
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
