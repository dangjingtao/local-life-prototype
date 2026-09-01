import { useRef, useState } from "react";
import { PrototypeIcon } from "@prototype/icons";
import { coreDemoStore, type OfflineStore, type Product, type ProductAvailability } from "@prototype/shared";
import { ConvenienceProductArtwork } from "./ConvenienceProductArtwork";

type BrowseMode = "single" | "bundle";

interface ConvenienceBrowsePanelProps {
  store: OfflineStore;
  products: Product[];
  availabilityByProductId: Map<string, ProductAvailability>;
  currentCart: Record<string, number>;
  cartCount: number;
  cartTotal: number;
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  couponTitles: string[];
  onSwitchStore: () => void;
  onOpenActivity: () => void;
  onOpenProduct: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onOpenCart: () => void;
}

const bundleProductIds = new Set([
  "PRODUCT-LIGHT-LIFE",
  "PRODUCT-SCALP-SET",
  "PRODUCT-CLEAN-SET",
]);

const groupOrder = ["饮品系列", "鲜食系列", "日用系列", "洗护系列", "其他"];

function groupForProduct(product: Product) {
  if (product.category === "咖啡饮品" || product.category === "饮料") return "饮品系列";
  if (product.category === "鲜食") return "鲜食系列";
  if (product.category === "日用" || product.category === "生活方式") return "日用系列";
  if (product.category === "洗护") return "洗护系列";
  return "其他";
}

function isOrderable(availability?: ProductAvailability) {
  return availability?.status === "available" || availability?.status === "low_stock";
}

function priceFor(product: Product, availability?: ProductAvailability) {
  return availability?.memberPriceYuan ?? availability?.priceYuan ?? product.memberPriceYuan ?? product.priceYuan;
}

function originalPriceFor(product: Product, availability?: ProductAvailability) {
  return availability?.priceYuan ?? product.priceYuan;
}

function QuantityControl({
  product,
  quantity,
  orderable,
  onChange,
}: {
  product: Product;
  quantity: number;
  orderable: boolean;
  onChange: (delta: number) => void;
}) {
  if (quantity <= 0) {
    return (
      <button
        type="button"
        aria-label={`加入购物车：${product.name}`}
        disabled={!orderable}
        onClick={() => onChange(1)}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-transform active:scale-95 disabled:opacity-35"
      >
        <PrototypeIcon name="add" size={18} />
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-label={`${product.name} 数量`}>
      <button
        type="button"
        aria-label={`减少${product.name}`}
        onClick={() => onChange(-1)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg"
      >
        −
      </button>
      <span className="min-w-5 text-center text-sm font-semibold">{quantity}</span>
      <button
        type="button"
        aria-label={`增加${product.name}`}
        disabled={!orderable}
        onClick={() => onChange(1)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-transform active:scale-95 disabled:opacity-35"
      >
        <PrototypeIcon name="add" size={18} />
      </button>
    </div>
  );
}

export function ConvenienceBrowsePanel({
  store,
  products,
  availabilityByProductId,
  currentCart,
  cartCount,
  cartTotal,
  query,
  setQuery,
  category,
  setCategory,
  couponTitles,
  onSwitchStore,
  onOpenActivity,
  onOpenProduct,
  onUpdateQuantity,
  onOpenCart,
}: ConvenienceBrowsePanelProps) {
  const [mode, setMode] = useState<BrowseMode>("single");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [couponOpen, setCouponOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const normalizedQuery = query.trim().toLowerCase();
  const queryMatchedProducts = products.filter((product) => (
    !normalizedQuery || `${product.name} ${product.category} ${product.spec ?? ""}`.toLowerCase().includes(normalizedQuery)
  ));
  const groups = groupOrder.filter((group) => queryMatchedProducts.some((product) => groupForProduct(product) === group));
  const bundleProducts = queryMatchedProducts.filter((product) => bundleProductIds.has(product.id));

  const banners = [
    ...(store.id === coreDemoStore.id ? [{ eyebrow: "早餐推荐", title: "早八能量补给", copy: "咖啡 + 鲜食，快速选好一顿早餐", productId: "PRODUCT-OAT-LATTE", action: true }] : []),
    ...(couponTitles.length > 0 ? [{ eyebrow: "可用优惠", title: couponTitles[0], copy: "结算时匹配当前门店可用权益", productId: "PRODUCT-SPARKLING-WATER", action: false }] : []),
    { eyebrow: "灵活履约", title: "自提 / 约 3 km 短配", copy: "选好商品后再选择方便的取货方式", productId: "PRODUCT-CLEAN-SET", action: false },
  ];
  const currentBanner = banners[bannerIndex % banners.length];

  const jumpToGroup = (group: string) => {
    setCategory(group);
    const container = listRef.current;
    const target = sectionRefs.current[group];
    if (!container || !target) return;
    container.scrollTo({ top: Math.max(0, target.offsetTop - 4), behavior: "smooth" });
  };

  const syncCategoryFromScroll = () => {
    const container = listRef.current;
    if (!container || groups.length === 0) return;
    let active = groups[0];
    for (const group of groups) {
      const section = sectionRefs.current[group];
      if (section && section.offsetTop <= container.scrollTop + 36) active = group;
    }
    if (active !== category) setCategory(active);
  };

  const updateQuantityWithFeedback = (productId: string, delta: number) => {
    onUpdateQuantity(productId, delta);
    if (delta > 0) {
      setCartPulse(true);
      window.setTimeout(() => setCartPulse(false), 220);
    }
  };

  const renderSingleProduct = (product: Product) => {
    const availability = availabilityByProductId.get(product.id);
    const quantity = currentCart[product.id] ?? 0;
    const orderable = store.status === "open" && isOrderable(availability);
    const displayPrice = originalPriceFor(product, availability);
    const effectivePrice = priceFor(product, availability);
    const promotionLabel = availability?.promotionLabel;
    const lowStockLabel = availability?.status === "low_stock" ? availability.stockLabel : undefined;

    return (
      <article key={product.id} className={`min-h-[96px] px-2 py-2 ${orderable ? "" : "bg-[var(--color-surface-subtle)]"}`}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenProduct(product.id)}
            className="relative h-[72px] w-[72px] shrink-0 rounded-[var(--radius-container)] text-left"
            aria-label={`查看商品：${product.name}`}
          >
            <ConvenienceProductArtwork productId={product.id} name={product.name} className={`h-[72px] w-[72px] ${orderable ? "" : "opacity-50 grayscale"}`} />
            {!orderable && (
              <span className="absolute inset-x-1 bottom-1 rounded-full bg-[var(--color-text-primary)]/80 px-1.5 py-0.5 text-center text-[9px] font-medium text-[var(--color-surface)]">
                {availability?.stockLabel ?? "暂不可售"}
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => onOpenProduct(product.id)} className="block min-h-11 w-full text-left" aria-label={`查看商品信息：${product.name}`}>
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
              <div className="mt-1 flex min-h-4 items-center gap-1.5 overflow-hidden whitespace-nowrap">
                {promotionLabel && <span className="rounded-full bg-[var(--color-success-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-success)]">{promotionLabel}</span>}
                {lowStockLabel && <span className="text-[10px] font-medium text-[var(--color-warning)]">{lowStockLabel}</span>}
              </div>
            </button>

            <div className="mt-0.5 flex items-end justify-between gap-1">
              <div className="min-w-0">
                <p className="whitespace-nowrap text-base font-semibold text-[var(--color-primary-pressed)]">¥{effectivePrice.toFixed(2)}</p>
                {effectivePrice !== displayPrice && <p className="text-[9px] text-[var(--color-text-tertiary)] line-through">¥{displayPrice.toFixed(2)}</p>}
              </div>
              <QuantityControl product={product} quantity={quantity} orderable={orderable} onChange={(delta) => updateQuantityWithFeedback(product.id, delta)} />
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <>
      <div className="space-y-2 pb-16">
        <section className="flex items-center justify-between gap-3 rounded-[var(--radius-overlay)] bg-[var(--color-surface)] px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold">{store.name}</h2>
              <span className="shrink-0 text-[10px] font-medium text-[var(--color-success)]">营业中</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">距你 {store.distanceKm?.toFixed(1) ?? "--"} km · 自提{store.capabilities.includes("short_delivery") ? " / 约 3 km 短配" : ""}</p>
          </div>
          <button type="button" onClick={onSwitchStore} className="min-h-11 shrink-0 px-2 text-xs font-medium text-[var(--color-primary)]">切换门店</button>
        </section>

        <section className="relative overflow-hidden rounded-[var(--radius-overlay)] bg-[var(--color-brand-subtle)] px-3 py-2" aria-label="门店活动轮播">
          <div className="flex min-h-[64px] items-center gap-2.5">
            <ConvenienceProductArtwork productId={currentBanner.productId} name={currentBanner.title} className="h-14 w-14 shrink-0 bg-[var(--color-surface)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-[var(--color-primary-pressed)]">{currentBanner.eyebrow}</p>
              <p className="mt-0.5 truncate text-sm font-semibold">{currentBanner.title}</p>
              <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-secondary)]">{currentBanner.copy}</p>
            </div>
            {currentBanner.action && <button type="button" onClick={onOpenActivity} className="min-h-11 shrink-0 px-1 text-[11px] font-medium text-[var(--color-primary)]">查看</button>}
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-1.5 right-2 flex gap-1" aria-label="活动轮播切换">
              {banners.map((banner, index) => (
                <button
                  key={`${banner.title}-${index}`}
                  type="button"
                  aria-label={`切换到活动 ${index + 1}`}
                  aria-pressed={bannerIndex === index}
                  onClick={() => setBannerIndex(index)}
                  className={`h-2 min-h-2 w-2 min-w-2 rounded-full ${bannerIndex === index ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`}
                />
              ))}
            </div>
          )}
        </section>

        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 flex gap-2 bg-[var(--color-background)]/95 px-4 py-1.5 backdrop-blur">
          <label className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"><PrototypeIcon name="search" size={17} /></span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="搜索当前门店商品"
              placeholder="搜本店商品"
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-2 text-xs outline-none focus:border-[var(--color-primary)]"
            />
          </label>
          <div className="flex shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5" aria-label="商品展示模式">
            {(["single", "bundle"] as BrowseMode[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
                className={`min-h-10 rounded-[var(--radius-control)] px-2.5 text-[11px] font-medium ${mode === item ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--color-text-secondary)]"}`}
              >
                {item === "single" ? "单品" : "套餐"}
              </button>
            ))}
          </div>
        </div>

        {mode === "single" ? (
          <section className="grid h-[400px] grid-cols-[78px_minmax(0,1fr)] overflow-hidden rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-surface)]" aria-label="单品双栏浏览">
            <nav className="overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface-subtle)] py-1" aria-label="商品分类栏">
              {groups.map((group) => (
                <button
                  key={group}
                  type="button"
                  aria-pressed={category === group || (category === "全部" && group === groups[0])}
                  onClick={() => jumpToGroup(group)}
                  className={`relative flex min-h-12 w-full items-center px-2 text-left text-[11px] font-medium ${category === group || (category === "全部" && group === groups[0]) ? "bg-[var(--color-surface)] text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)]"}`}
                >
                  {(category === group || (category === "全部" && group === groups[0])) && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[var(--color-primary)]" />}
                  {group}
                </button>
              ))}
            </nav>

            <div ref={listRef} onScroll={syncCategoryFromScroll} className="overflow-y-auto scroll-smooth" aria-label="商品列表">
              {queryMatchedProducts.length === 0 && <p className="p-4 text-center text-xs text-[var(--color-text-secondary)]">没有匹配商品，换个关键词试试。</p>}
              {groups.map((group) => {
                const groupProducts = queryMatchedProducts.filter((product) => groupForProduct(product) === group);
                return (
                  <div key={group} ref={(node) => { sectionRefs.current[group] = node; }}>
                    <div className="sticky top-0 z-[1] flex h-6 items-center bg-[var(--color-surface)] px-2 text-[10px] font-semibold text-[var(--color-text-secondary)]">{group}</div>
                    <div className="divide-y divide-[var(--color-border)]">{groupProducts.map(renderSingleProduct)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="h-[400px] overflow-y-auto rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2" aria-label="套餐商品浏览">
            {bundleProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-xs text-[var(--color-text-secondary)]">当前门店暂无匹配套餐</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {bundleProducts.map((product) => {
                  const availability = availabilityByProductId.get(product.id);
                  const orderable = store.status === "open" && isOrderable(availability);
                  const quantity = currentCart[product.id] ?? 0;
                  const displayPrice = originalPriceFor(product, availability);
                  const effectivePrice = priceFor(product, availability);
                  return (
                    <article key={product.id} className={`overflow-hidden rounded-[var(--radius-container)] border border-[var(--color-border)] ${orderable ? "" : "bg-[var(--color-surface-subtle)]"}`}>
                      <button type="button" onClick={() => onOpenProduct(product.id)} className="block w-full text-left" aria-label={`查看套餐：${product.name}`}>
                        <ConvenienceProductArtwork productId={product.id} name={product.name} className={`aspect-square w-full ${orderable ? "" : "opacity-50 grayscale"}`} />
                        <div className="px-2 pt-2">
                          <p className="line-clamp-2 min-h-10 text-sm font-semibold">{product.name}</p>
                          <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                          {availability?.promotionLabel && <span className="mt-1 inline-flex rounded-full bg-[var(--color-success-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-success)]">{availability.promotionLabel}</span>}
                        </div>
                      </button>
                      <div className="flex items-end justify-between gap-1 px-2 pb-2 pt-1">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-primary-pressed)]">¥{effectivePrice.toFixed(2)}</p>
                          {effectivePrice !== displayPrice && <p className="text-[9px] text-[var(--color-text-tertiary)] line-through">¥{displayPrice.toFixed(2)}</p>}
                        </div>
                        <QuantityControl product={product} quantity={quantity} orderable={orderable} onChange={(delta) => updateQuantityWithFeedback(product.id, delta)} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <div className="pointer-events-none fixed bottom-[calc(8.25rem+env(safe-area-inset-bottom))] left-1/2 z-20 w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2">
        <div className="relative w-fit pointer-events-auto">
          {couponOpen && (
            <div className="absolute bottom-12 left-0 w-56 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg">
              <p className="text-xs font-semibold">当前门店可用券</p>
              {couponTitles.length > 0 ? couponTitles.map((title) => <p key={title} className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{title}</p>) : <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">暂无可用券</p>}
            </div>
          )}
          <button
            type="button"
            aria-label={`查看可用优惠券，${couponTitles.length} 张`}
            aria-expanded={couponOpen}
            onClick={() => setCouponOpen((value) => !value)}
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-md"
          >
            <PrototypeIcon name="coupon" size={19} />
            {couponTitles.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-semibold text-[var(--color-on-primary)]">{couponTitles.length}</span>}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCart}
        aria-label={`打开购物车，${cartCount} 件商品`}
        className={`fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex min-h-14 w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 items-center justify-between rounded-[var(--radius-container)] bg-[var(--color-primary)] px-3 text-[var(--color-on-primary)] shadow-lg transition-transform ${cartPulse ? "scale-[1.025]" : "scale-100"}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
            <PrototypeIcon name="cart" size={18} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-surface)] px-1 text-[9px] font-semibold text-[var(--color-primary-pressed)]">{cartCount}</span>}
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-[10px] opacity-80">合计</span>
            <span className="block truncate font-semibold">¥{cartTotal.toFixed(2)}</span>
          </span>
        </span>
        <span className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-pressed)]">去结算</span>
      </button>
    </>
  );
}
