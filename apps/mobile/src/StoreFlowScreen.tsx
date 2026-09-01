import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  CORE_DEMO_IDS,
  catalogProducts,
  coreDemoStore,
  coreDemoUser,
  corePickupOrder,
  coreUserV02Coupons,
  findById,
  getStoreAvailability,
  getStoreDeliveryAddresses,
  getStoreProducts,
  getUserConvenienceCarts,
  isStoreDeliveryAddressInRange,
  offlineStores,
  redemptions,
  type Product,
  type ProductAvailability,
} from "@prototype/shared";
import type { SearchBusinessHandoff } from "./GlobalSearchScreen";

type StoreStep = "stores" | "browse" | "product" | "cart" | "checkout" | "pickupOrder" | "deliveryOrder" | "legacyConfirm" | "legacyVoucher" | "legacySuccess";
type FulfillmentMode = "pickup" | "short_delivery";
type PickupStatus = "preparing" | "ready_for_pickup" | "completed";
type DeliveryStatus = "preparing" | "delivering" | "completed";
type CartState = Record<string, Record<string, number>>;

type StoreOrderSnapshot = {
  id: string;
  storeId: string;
  storeName: string;
  mode: FulfillmentMode;
  itemCount: number;
  subtotalOriginal: number;
  memberSavings: number;
  subtotalMember: number;
  couponTitle?: string;
  couponDiscount: number;
  pointsUsed: number;
  pointsDiscount: number;
  fulfillmentFee: number;
  payable: number;
  pickupWindow?: string;
  pickupCode?: string;
  address?: string;
  distanceKm?: number;
  inRange: boolean;
};

const pickupRedemption = findById(redemptions, CORE_DEMO_IDS.pickupRedemption)!;
const cartStorageKey = `local-life:${coreDemoUser.id}:convenience-carts`;
const availabilityStatusLabels: Record<ProductAvailability["status"], string> = {
  available: "现货",
  low_stock: "库存紧张",
  sold_out: "今日售罄",
  unavailable: "暂不可售",
};

// T018 traceable mock rules. Amounts stay marked as prototype samples: the coupon
// mirrors the "门店 10 元优惠券" fixture title, points reuse the candidate
// prototypeRules.pointsToCash (100 积分 = 1 元), and the delivery fee has no
// confirmed algorithm yet.
const shortDeliveryFeeYuan = 5;
const storeCouponDiscountYuan = 10;
const pointsUseAmount = 200;
const pointsPerYuan = 100;
const pickupCodePrefix = "PK";

function formatSlotClock(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function buildPickupSlots(): string[] {
  const now = new Date();
  const start = new Date(now.getTime() + 15 * 60 * 1000);
  const remainder = start.getMinutes() % 15;
  if (remainder !== 0) start.setMinutes(start.getMinutes() + (15 - remainder), 0, 0);
  else start.setMinutes(start.getMinutes(), 0, 0);
  const slots: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const from = new Date(start.getTime() + i * 15 * 60 * 1000);
    const to = new Date(from.getTime() + 15 * 60 * 1000);
    const day = from.getDate() === now.getDate() ? "今天" : "明天";
    slots.push(`${day} ${formatSlotClock(from)}-${formatSlotClock(to)}`);
  }
  return slots;
}

function buildPickupCode() {
  return `${pickupCodePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function buildInitialCarts(): CartState {
  return Object.fromEntries(
    getUserConvenienceCarts(coreDemoUser.id).map((cart) => [
      cart.storeId,
      Object.fromEntries(cart.items.map((item) => [item.productId, item.quantity])),
    ]),
  );
}

function loadPersistedCarts(): CartState {
  const fallback = buildInitialCarts();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(cartStorageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallback;
    return parsed as CartState;
  } catch {
    return fallback;
  }
}

function persistCarts(carts: CartState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(cartStorageKey, JSON.stringify(carts));
  } catch {
    // Prototype storage is best-effort; the in-memory cart still works when storage is unavailable.
  }
}

function getEffectivePrice(product: Product, availability?: ProductAvailability) {
  return availability?.memberPriceYuan ?? availability?.priceYuan ?? product.memberPriceYuan ?? product.priceYuan;
}

function isOrderable(availability?: ProductAvailability) {
  return availability?.status === "available" || availability?.status === "low_stock";
}

function StoreCapabilityTags({ storeId }: { storeId: string }) {
  const store = findById(offlineStores, storeId);
  if (!store) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {store.capabilities.includes("pickup") && <StatusTag>门店自提</StatusTag>}
      {store.capabilities.includes("short_delivery") && <StatusTag tone="success">约 {store.deliveryRadiusKm ?? 3} km 短配</StatusTag>}
      {store.status === "open" ? <StatusTag tone="success">营业中</StatusTag> : <StatusTag tone="warning">当前休息</StatusTag>}
    </div>
  );
}

interface StoreFlowScreenProps {
  openActivity: () => void;
  entryContext?: SearchBusinessHandoff;
}

export function StoreFlowScreen({ openActivity, entryContext }: StoreFlowScreenProps) {
  const initialStoreId = entryContext?.storeId ?? "";
  const initialProductId = entryContext?.entityType === "product" ? entryContext.entityId : "";
  const [step, setStep] = useState<StoreStep>(() => initialStoreId && initialProductId ? "product" : initialStoreId ? "browse" : "stores");
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [carts, setCarts] = useState<CartState>(loadPersistedCarts);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>("pickup");
  const [pickupSlots] = useState<string[]>(buildPickupSlots);
  const [selectedPickupWindow, setSelectedPickupWindow] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState<StoreOrderSnapshot | null>(null);
  const [pickupStatus, setPickupStatus] = useState<PickupStatus>("preparing");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("preparing");

  const selectedStore = selectedStoreId ? findById(offlineStores, selectedStoreId) : undefined;
  const storeAvailability = selectedStore ? getStoreAvailability(selectedStore.id) : [];
  const availabilityByProductId = new Map(storeAvailability.map((item) => [item.productId, item]));
  const selectedProduct = selectedProductId ? findById(catalogProducts, selectedProductId) : undefined;
  const selectedAvailability = selectedProduct ? availabilityByProductId.get(selectedProduct.id) : undefined;
  const storeProducts = selectedStore ? getStoreProducts(selectedStore.id) : [];
  const categories = ["全部", ...Array.from(new Set(storeProducts.map((product) => product.category)))];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = storeProducts.filter((product) => {
    const matchesCategory = category === "全部" || product.category === category;
    const matchesQuery = !normalizedQuery || `${product.name} ${product.category} ${product.spec ?? ""}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const currentCart = selectedStore ? carts[selectedStore.id] ?? {} : {};
  const cartCount = Object.values(currentCart).reduce((sum, quantity) => sum + quantity, 0);
  const cartRows = selectedStore
    ? Object.entries(currentCart)
      .map(([productId, quantity]) => {
        const product = findById(catalogProducts, productId);
        const availability = availabilityByProductId.get(productId);
        if (!product || quantity <= 0) return null;
        const unitPrice = getEffectivePrice(product, availability);
        return { product, availability, quantity, unitPrice, subtotal: unitPrice * quantity };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
    : [];
  const cartTotal = cartRows.reduce((sum, row) => sum + row.subtotal, 0);

  const deliveryAddresses = selectedStore ? getStoreDeliveryAddresses(selectedStore.id) : [];
  const defaultInRangeAddress = deliveryAddresses.find((address) => isStoreDeliveryAddressInRange(selectedStore, address));
  const effectiveAddress = deliveryAddresses.find((address) => address.id === selectedAddressId) ?? defaultInRangeAddress;
  const addressInRange = isStoreDeliveryAddressInRange(selectedStore, effectiveAddress);
  const effectivePickupWindow = selectedPickupWindow || pickupSlots[0] || "";
  const applicableCoupon = selectedStore
    ? coreUserV02Coupons.find((coupon) => coupon.scene === "store" && coupon.status === "available" && coupon.applicableStoreIds.includes(selectedStore.id))
    : undefined;
  const couponDiscount = applicableCoupon ? storeCouponDiscountYuan : 0;
  const pointsUsed = usePoints ? Math.min(pointsUseAmount, coreDemoUser.pointsBalance) : 0;
  const pointsDiscount = pointsUsed / pointsPerYuan;
  const subtotalOriginal = cartRows.reduce((sum, row) => sum + (row.availability?.priceYuan ?? row.product.priceYuan) * row.quantity, 0);
  const subtotalMember = cartRows.reduce((sum, row) => sum + row.unitPrice * row.quantity, 0);
  const memberSavings = Math.max(0, subtotalOriginal - subtotalMember);
  const fulfillmentFee = fulfillmentMode === "short_delivery" ? (addressInRange ? shortDeliveryFeeYuan : 0) : 0;
  const payable = Math.max(0, subtotalMember - couponDiscount - pointsDiscount + fulfillmentFee);
  const canSubmitCheckout = cartRows.length > 0
    && selectedStore?.status === "open"
    && (fulfillmentMode === "pickup" ? Boolean(effectivePickupWindow) : Boolean(effectiveAddress) && addressInRange);

  const goStep = (next: StoreStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setSelectedProductId("");
    setQuery("");
    setCategory("全部");
    goStep("browse");
  };

  const openProduct = (productId: string) => {
    setSelectedProductId(productId);
    goStep("product");
  };

  const commitCarts = (updater: (current: CartState) => CartState) => {
    setCarts((current) => {
      const next = updater(current);
      persistCarts(next);
      return next;
    });
  };

  const submitCheckout = () => {
    if (!canSubmitCheckout || !selectedStore) return;
    const orderId = `CONV-${selectedStore.id.replace("STORE-", "")}-${coreDemoUser.id.replace("LL-", "")}`;
    const snapshot: StoreOrderSnapshot = {
      id: orderId,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      mode: fulfillmentMode,
      itemCount: cartCount,
      subtotalOriginal,
      memberSavings,
      subtotalMember,
      ...(applicableCoupon ? { couponTitle: applicableCoupon.title } : {}),
      couponDiscount,
      pointsUsed,
      pointsDiscount,
      fulfillmentFee,
      payable,
      ...(fulfillmentMode === "pickup" ? { pickupWindow: effectivePickupWindow, pickupCode: buildPickupCode() } : {}),
      ...(fulfillmentMode === "short_delivery" && effectiveAddress ? { address: `${effectiveAddress.label} · ${effectiveAddress.address}`, distanceKm: effectiveAddress.distanceKm } : {}),
      inRange: fulfillmentMode === "short_delivery" ? addressInRange : true,
    };
    setOrderSnapshot(snapshot);
    commitCarts((current) => {
      const next = { ...current };
      delete next[selectedStore.id];
      return next;
    });
    if (fulfillmentMode === "pickup") {
      setPickupStatus("preparing");
      goStep("pickupOrder");
    } else {
      setDeliveryStatus("preparing");
      goStep("deliveryOrder");
    }
  };

  const advancePickupStatus = () => {
    setPickupStatus((current) => current === "preparing" ? "ready_for_pickup" : "completed");
  };

  const advanceDeliveryStatus = () => {
    setDeliveryStatus((current) => current === "preparing" ? "delivering" : "completed");
  };

  const updateQuantity = (productId: string, delta: number) => {
    if (!selectedStore) return;
    const availability = availabilityByProductId.get(productId);
    if (delta > 0 && (!isOrderable(availability) || selectedStore.status !== "open")) return;
    commitCarts((current) => {
      const storeCart = { ...(current[selectedStore.id] ?? {}) };
      const nextQuantity = Math.max(0, (storeCart[productId] ?? 0) + delta);
      if (nextQuantity === 0) delete storeCart[productId];
      else storeCart[productId] = nextQuantity;
      return { ...current, [selectedStore.id]: storeCart };
    });
  };

  const removeFromCart = (productId: string) => {
    if (!selectedStore) return;
    commitCarts((current) => {
      const storeCart = { ...(current[selectedStore.id] ?? {}) };
      delete storeCart[productId];
      return { ...current, [selectedStore.id]: storeCart };
    });
  };

  if (step === "stores") {
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">便利店 · 即时零售</p>
          <h2 className="mt-1 text-2xl font-semibold">先选门店，再开始选购</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">价格、可售状态与履约能力都以具体门店为准。不同门店各自保留购物车，不会跨店混单。</p>
        </div>

        <div className="space-y-3">
          {offlineStores.map((store) => {
            const availability = getStoreAvailability(store.id);
            const orderableCount = availability.filter((item) => isOrderable(item)).length;
            const seededCart = carts[store.id] ?? {};
            const seededCount = Object.values(seededCart).reduce((sum, quantity) => sum + quantity, 0);
            const isCore = store.id === coreDemoStore.id;
            return (
              <button key={store.id} type="button" onClick={() => openStore(store.id)} aria-label={`选择门店：${store.name}`} className="w-full text-left">
                <Card className="p-4 transition active:bg-[var(--color-surface-subtle)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{store.name}</h3>
                        {isCore && <StatusTag tone="success">核心演示门店</StatusTag>}
                        {seededCount > 0 && <StatusTag>{seededCount} 件已在购物车</StatusTag>}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{store.address}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">距你 {store.distanceKm?.toFixed(1) ?? "--"} km · {store.businessHours ?? "营业时间待配置"} · 当前 {orderableCount} 款可购</p>
                      <div className="mt-3"><StoreCapabilityTags storeId={store.id} /></div>
                    </div>
                    <span className="pt-1 text-[var(--color-text-tertiary)]" aria-hidden="true">›</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        <Card className="bg-[var(--color-surface-subtle)] p-4">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">距离与库存是可追踪 mock，用来验证门店上下文，不调用真实定位、地图或库存系统。</p>
          </div>
        </Card>
      </>
    );
  }

  if (!selectedStore) {
    return (
      <Card>
        <p className="font-semibold">门店上下文已失效</p>
        <SecondaryButton className="mt-4 w-full" onClick={() => goStep("stores")}>重新选择门店</SecondaryButton>
      </Card>
    );
  }

  if (step === "browse") {
    return (
      <>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-primary)]">当前门店</p>
              <h2 className="mt-1 text-xl font-semibold">{selectedStore.name}</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">距你 {selectedStore.distanceKm?.toFixed(1) ?? "--"} km · {selectedStore.businessHours}</p>
            </div>
            <button type="button" onClick={() => goStep("stores")} className="min-h-11 rounded-[var(--radius-control)] px-3 text-sm font-medium text-[var(--color-primary)]">切换门店</button>
          </div>
          <div className="mt-3"><StoreCapabilityTags storeId={selectedStore.id} /></div>
        </section>

        {entryContext?.storeId === selectedStore.id && entryContext.entityId && (
          <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
            <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">来自全局搜索</p>
            <p className="mt-2 font-semibold">{entryContext.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">已沿用 {selectedStore.name} 的门店上下文，不再回退到全局库存假设。</p>
          </Card>
        )}

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"><PrototypeIcon name="search" size={18} /></span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="搜索当前门店商品"
            placeholder="搜本店商品、分类或规格"
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="商品分类">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium ${category === item ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {selectedStore.id === coreDemoStore.id && (
          <button type="button" onClick={openActivity} className="w-full text-left" aria-label="查看便利店活动">
            <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">本店推荐 · mock 活动位</p>
                  <p className="mt-2 font-semibold">早八能量补给</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">咖啡、鲜食与气泡水放在同一条高频浏览动线上，具体优惠仍以 fixture 标签为准。</p>
                </div>
                <span className="text-[var(--color-primary)]" aria-hidden="true">›</span>
              </div>
            </Card>
          </button>
        )}

        <Section title="本店商品">
          <div className="space-y-3">
            {visibleProducts.length === 0 && (
              <Card className="p-5 text-center">
                <p className="font-semibold">本店没有匹配商品</p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">换个关键词或分类看看。</p>
              </Card>
            )}
            {visibleProducts.map((product) => {
              const availability = availabilityByProductId.get(product.id);
              const quantity = currentCart[product.id] ?? 0;
              const orderable = selectedStore.status === "open" && isOrderable(availability);
              const displayPrice = availability?.priceYuan ?? product.priceYuan;
              const memberPrice = availability?.memberPriceYuan ?? product.memberPriceYuan;
              return (
                <Card key={product.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] text-center text-xs font-medium text-[var(--color-text-secondary)]">{product.category}</div>
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => openProduct(product.id)} className="min-h-11 w-full text-left" aria-label={`查看商品：${product.name}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold">{product.name}</p>
                            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                          </div>
                          <span className="text-[var(--color-text-tertiary)]" aria-hidden="true">›</span>
                        </div>
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {availability?.promotionLabel && <StatusTag tone="success">{availability.promotionLabel}</StatusTag>}
                        <StatusTag tone={orderable ? undefined : "warning"}>{availability?.stockLabel ?? availabilityStatusLabels[availability?.status ?? "unavailable"]}</StatusTag>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          {memberPrice !== undefined && memberPrice !== displayPrice && <p className="text-xs text-[var(--color-text-tertiary)] line-through">¥{displayPrice.toFixed(2)}</p>}
                          <p className="font-semibold text-[var(--color-primary-pressed)]">¥{(memberPrice ?? displayPrice).toFixed(2)} <span className="text-xs font-normal text-[var(--color-text-tertiary)]">{memberPrice !== undefined ? "会员价" : ""}</span></p>
                        </div>
                        {quantity > 0 ? (
                          <div className="flex items-center gap-1" aria-label={`${product.name} 数量`}>
                            <button type="button" aria-label={`减少${product.name}`} onClick={() => updateQuantity(product.id, -1)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)]">−</button>
                            <span className="min-w-7 text-center text-sm font-semibold">{quantity}</span>
                            <button type="button" aria-label={`增加${product.name}`} onClick={() => updateQuantity(product.id, 1)} disabled={!orderable} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] disabled:opacity-40">+</button>
                          </div>
                        ) : (
                          <button type="button" aria-label={`加入购物车：${product.name}`} onClick={() => updateQuantity(product.id, 1)} disabled={!orderable} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] disabled:opacity-40">+</button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>

        {selectedStore.id === coreDemoStore.id && (
          <SecondaryButton className="w-full" onClick={() => goStep("legacyConfirm")}>选择此门店自提</SecondaryButton>
        )}

        <button type="button" onClick={() => goStep("cart")} aria-label={`打开购物车，${cartCount} 件商品`} className="sticky bottom-20 z-10 flex min-h-14 w-full items-center justify-between rounded-[var(--radius-container)] bg-[var(--color-primary)] px-4 text-[var(--color-on-primary)] shadow-lg">
          <span className="font-semibold">购物车 {cartCount} 件</span>
          <span className="text-sm">¥{cartTotal.toFixed(2)} · 查看 ›</span>
        </button>
      </>
    );
  }

  if (step === "product") {
    if (!selectedProduct) {
      return (
        <Card>
          <p className="font-semibold">没有找到这个商品</p>
          <SecondaryButton className="mt-4 w-full" onClick={() => goStep("browse")}>返回本店商品</SecondaryButton>
        </Card>
      );
    }
    const orderable = selectedStore.status === "open" && isOrderable(selectedAvailability);
    const displayPrice = selectedAvailability?.priceYuan ?? selectedProduct.priceYuan;
    const memberPrice = selectedAvailability?.memberPriceYuan ?? selectedProduct.memberPriceYuan;
    const quantity = currentCart[selectedProduct.id] ?? 0;
    return (
      <>
        <button type="button" onClick={() => goStep("browse")} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回 {selectedStore.name}
        </button>

        <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-overlay)] bg-[var(--color-surface-subtle)] text-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-primary)]">CONVENIENCE</p>
            <p className="mt-2 text-lg font-semibold">{selectedProduct.category}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedAvailability?.promotionLabel && <StatusTag tone="success">{selectedAvailability.promotionLabel}</StatusTag>}
            <StatusTag tone={orderable ? undefined : "warning"}>{selectedAvailability?.stockLabel ?? availabilityStatusLabels[selectedAvailability?.status ?? "unavailable"]}</StatusTag>
          </div>
          <h2 className="mt-3 text-2xl font-semibold">{selectedProduct.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedProduct.spec ?? selectedProduct.category}</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-2xl font-semibold text-[var(--color-primary-pressed)]">¥{(memberPrice ?? displayPrice).toFixed(2)}</p>
            {memberPrice !== undefined && memberPrice !== displayPrice && <p className="pb-1 text-sm text-[var(--color-text-tertiary)] line-through">¥{displayPrice.toFixed(2)}</p>}
            {memberPrice !== undefined && <StatusTag>会员价</StatusTag>}
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">门店可售上下文</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedStore.name} · {selectedStore.address}</p>
            </div>
            <button type="button" onClick={() => goStep("stores")} className="min-h-11 shrink-0 px-2 text-sm font-medium text-[var(--color-primary)]">换店</button>
          </div>
          <div className="mt-3"><StoreCapabilityTags storeId={selectedStore.id} /></div>
        </Card>

        <div className="flex items-center gap-3">
          {quantity > 0 ? (
            <div className="flex flex-1 items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] px-2">
              <button type="button" aria-label={`减少${selectedProduct.name}`} onClick={() => updateQuantity(selectedProduct.id, -1)} className="flex min-h-12 min-w-12 items-center justify-center">−</button>
              <span className="font-semibold">已选 {quantity} 件</span>
              <button type="button" aria-label={`增加${selectedProduct.name}`} onClick={() => updateQuantity(selectedProduct.id, 1)} disabled={!orderable} className="flex min-h-12 min-w-12 items-center justify-center disabled:opacity-40">+</button>
            </div>
          ) : (
            <Button className="flex-1" disabled={!orderable} onClick={() => updateQuantity(selectedProduct.id, 1)}>加入购物车</Button>
          )}
          <button type="button" onClick={() => goStep("cart")} aria-label={`打开购物车，${cartCount} 件商品`} className="flex min-h-12 min-w-20 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 text-sm font-medium">购物车 {cartCount}</button>
        </div>
      </>
    );
  }

  if (step === "cart") {
    return (
      <>
        <button type="button" onClick={() => goStep("browse")} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回本店继续选购
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">{selectedStore.name}</p>
          <h2 className="mt-1 text-2xl font-semibold">门店独立购物车</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">切换门店不会清空这里，但不同门店的商品不会合并结算。</p>
        </div>

        {cartRows.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="font-semibold">购物车还是空的</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">先从 {selectedStore.name} 选几件商品。</p>
            <SecondaryButton className="mt-4 w-full" onClick={() => goStep("browse")}>去选商品</SecondaryButton>
          </Card>
        ) : (
          <div className="space-y-3">
            {cartRows.map(({ product, quantity, unitPrice, subtotal }) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => openProduct(product.id)} className="min-h-11 min-w-0 flex-1 text-left" aria-label={`查看商品：${product.name}`}>
                    <p className="font-semibold">{product.name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{product.spec ?? product.category}</p>
                    <p className="mt-2 text-sm font-medium text-[var(--color-primary-pressed)]">¥{unitPrice.toFixed(2)} / 件</p>
                  </button>
                  <button type="button" onClick={() => removeFromCart(product.id)} aria-label={`删除${product.name}`} className="min-h-11 shrink-0 px-2 text-sm text-[var(--color-text-secondary)]">删除</button>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <p className="font-semibold">小计 ¥{subtotal.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`减少${product.name}`} onClick={() => updateQuantity(product.id, -1)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)]">−</button>
                    <span className="min-w-7 text-center text-sm font-semibold">{quantity}</span>
                    <button type="button" aria-label={`增加${product.name}`} onClick={() => updateQuantity(product.id, 1)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">+</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--color-text-secondary)]">商品件数</span>
            <span className="font-medium">{cartCount} 件</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <span className="font-semibold">商品合计</span>
            <span className="text-2xl font-semibold text-[var(--color-primary-pressed)]">¥{cartTotal.toFixed(2)}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">当前仅汇总商品金额；优惠券、配送费、自提时段、地址与最终结算规则由 T018 承接。</p>
        </Card>

        <Button className="w-full" disabled={cartRows.length === 0 || selectedStore.status !== "open"} onClick={() => goStep("checkout")}>去结算</Button>
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
          <p className="text-sm text-[var(--color-text-secondary)]">{selectedStore.name} · 结算</p>
          <h2 className="mt-1 text-2xl font-semibold">选择履约方式并确认订单</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">自提与约 3 km 短配共用当前门店购物车，仅在结算阶段切换；不跨店、不与商城混单。</p>
        </div>

        <Section title="履约方式">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={fulfillmentMode === "pickup"}
              onClick={() => setFulfillmentMode("pickup")}
              className={`min-h-[104px] rounded-[var(--radius-container)] border p-3 text-left ${fulfillmentMode === "pickup" ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}
            >
              <p className="font-semibold">到店自提</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">最早约 15 分钟后 · 15 分钟间隔时段</p>
              <p className="mt-2 text-sm font-medium text-[var(--color-primary-pressed)]">自提费 ¥0</p>
            </button>
            <button
              type="button"
              aria-pressed={fulfillmentMode === "short_delivery"}
              onClick={() => setFulfillmentMode("short_delivery")}
              className={`min-h-[104px] rounded-[var(--radius-container)] border p-3 text-left ${fulfillmentMode === "short_delivery" ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}
            >
              <p className="font-semibold">约 3 km 短配</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">需确认地址在配送范围内</p>
              <p className="mt-2 text-sm font-medium text-[var(--color-primary-pressed)]">配送费示例 ¥{shortDeliveryFeeYuan}</p>
            </button>
          </div>
        </Section>

        {fulfillmentMode === "pickup" ? (
          <Section title="取货时段">
            <div className="flex flex-wrap gap-2">
              {pickupSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={effectivePickupWindow === slot}
                  onClick={() => setSelectedPickupWindow(slot)}
                  className={`min-h-11 rounded-full px-4 text-sm font-medium ${effectivePickupWindow === slot ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">取货时段按 15 分钟间隔表达，最早约 15 分钟后；不调用真实排队或门店接单系统。</p>
          </Section>
        ) : (
          <Section title="配送地址与范围">
            {deliveryAddresses.length === 0 ? (
              <Card className="bg-[var(--color-surface-subtle)]">
                <p className="font-semibold">当前门店暂未配置配送地址</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedStore.name} 暂无短距配送示例地址，请改选到店自提。</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {deliveryAddresses.map((address) => {
                  const inRange = isStoreDeliveryAddressInRange(selectedStore, address);
                  const selected = effectiveAddress?.id === address.id;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={!inRange}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`w-full min-h-[88px] rounded-[var(--radius-container)] border p-4 text-left disabled:cursor-not-allowed disabled:opacity-60 ${selected ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{address.label}</p>
                            {inRange ? <StatusTag tone="success">可配送 · {address.distanceKm.toFixed(1)} km</StatusTag> : <StatusTag tone="warning">超出配送范围 · {address.distanceKm.toFixed(1)} km</StatusTag>}
                          </div>
                          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{address.recipient} · {address.phone}</p>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{address.address}</p>
                        </div>
                        {!inRange && <span className="pt-1 text-xs font-medium text-[var(--color-warning)]">不可选</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">约 {selectedStore.deliveryRadiusKm ?? "--"} km 范围是 T018 可追踪 mock，不调用真实地图或定位。</p>
          </Section>
        )}

        <Section title="结算明细">
          <Card>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="text-[var(--color-text-secondary)]">商品金额</span><span className="font-medium">¥{subtotalOriginal.toFixed(2)}</span></div>
              {memberSavings > 0 && <div className="flex items-center justify-between gap-3"><span className="text-[var(--color-text-secondary)]">会员优惠（{cartCount} 件）</span><span className="font-medium text-[var(--color-success)]">-¥{memberSavings.toFixed(2)}</span></div>}
              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="text-[var(--color-text-secondary)]">商品实付小计</span><span className="font-semibold">¥{subtotalMember.toFixed(2)}</span></div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <span className="text-[var(--color-text-secondary)]">优惠券</span>
                {applicableCoupon ? <span className="max-w-[220px] text-right font-medium">{applicableCoupon.title} · 已使用 -¥{couponDiscount.toFixed(2)}</span> : <span className="text-[var(--color-text-tertiary)]">暂无可用优惠券</span>}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">积分抵扣<StatusTag>候选示例</StatusTag></span>
                <button type="button" aria-pressed={usePoints} onClick={() => setUsePoints((current) => !current)} className={`min-h-11 rounded-full px-3 text-sm font-medium ${usePoints ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}>
                  {usePoints ? `-¥${pointsDiscount.toFixed(2)}` : "使用积分"}
                </button>
              </div>
              {usePoints && <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">使用 {pointsUsed} 积分抵 ¥{pointsDiscount.toFixed(2)}（100 积分 = 1 元候选示例）；当前余额 {coreDemoUser.pointsBalance} 分。</p>}
              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <span className="text-[var(--color-text-secondary)]">履约费用</span>
                <span className="font-medium">{fulfillmentMode === "pickup" ? "自提 ¥0" : fulfillmentFee > 0 ? `短配示例 ¥${fulfillmentFee.toFixed(2)}` : "需选择可配送地址"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <span className="font-semibold">应付金额</span>
                <span className="text-lg font-semibold text-[var(--color-primary-pressed)]">¥{payable.toFixed(2)}</span>
              </div>
            </div>
          </Card>
          <Card className="bg-[var(--color-surface-subtle)]">
            <div className="flex items-start gap-3">
              <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">提交只生成当前会话内的 Mock 订单，不发起真实支付、库存锁定或骑手调度。券金额与配送费标注为示例规则，正式规则待确认。</p>
            </div>
          </Card>
        </Section>

        <Button className="w-full" disabled={!canSubmitCheckout} onClick={submitCheckout}>提交演示订单</Button>
      </>
    );
  }

  if (step === "pickupOrder") {
    const snapshot = orderSnapshot;
    if (!snapshot || snapshot.mode !== "pickup") {
      return (
        <Card>
          <p className="font-semibold">自提订单上下文已失效</p>
          <SecondaryButton className="mt-4 w-full" onClick={() => goStep("browse")}>返回便利店重新选购</SecondaryButton>
        </Card>
      );
    }
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">自提订单详情</p>
          <h2 className="mt-1 break-all text-2xl font-semibold">{snapshot.id}</h2>
        </div>

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <StatusTag tone={pickupStatus === "completed" ? "success" : undefined}>
              {pickupStatus === "preparing" ? "备货中" : pickupStatus === "ready_for_pickup" ? "待取货" : "核销完成"}
            </StatusTag>
            <span className="text-xs text-[var(--color-text-tertiary)]">Mock order · 支付成功</span>
          </div>
          <p className="mt-4 font-semibold">{snapshot.storeName}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">自提 · {snapshot.itemCount} 件商品 · 应付 ¥{snapshot.payable.toFixed(2)}</p>
          {snapshot.pickupWindow && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">取货时段：{snapshot.pickupWindow}</p>}

          {pickupStatus === "preparing" && (
            <div className="mt-5 rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] p-4">
              <p className="text-sm font-medium">门店正在备货</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">商品打包完成后会进入待取货状态并生成取货码。</p>
              <Button className="mt-4 w-full" onClick={advancePickupStatus}>模拟备货完成</Button>
            </div>
          )}

          {pickupStatus === "ready_for_pickup" && (
            <div className="mt-5 rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-[var(--color-on-primary)]">
              <div className="flex items-center justify-between gap-3">
                <StatusTag tone="success">待到店取货</StatusTag>
                <span className="text-xs opacity-80">{snapshot.pickupWindow}</span>
              </div>
              <p className="mt-7 text-sm opacity-80">取货码</p>
              <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.16em]">{snapshot.pickupCode}</p>
              <div className="mt-7 border-t border-white/20 pt-4 text-sm leading-6 opacity-80">
                <p>{snapshot.storeName}</p>
                <p className="mt-1">{selectedStore?.address}</p>
              </div>
            </div>
          )}
        </section>

        {pickupStatus === "ready_for_pickup" && <Button className="w-full" onClick={advancePickupStatus}>模拟店员核销</Button>}
        {pickupStatus === "preparing" && <SecondaryButton className="w-full" onClick={() => goStep("browse")}>返回便利店</SecondaryButton>}

        {pickupStatus === "completed" && (
          <>
            <section className="rounded-[var(--radius-overlay)] bg-[var(--color-success-bg)] p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-success)]"><PrototypeIcon name="success" size={30} /></span>
              <StatusTag tone="success">核销完成</StatusTag>
              <h2 className="mt-4 text-2xl font-semibold">商品已完成自提</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">订单 {snapshot.id} · {snapshot.storeName}</p>
            </section>
            <Card>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">商品实付小计</span><span className="font-medium">¥{snapshot.subtotalMember.toFixed(2)}</span></div>
                {snapshot.couponDiscount > 0 && <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">优惠券</span><span className="font-medium text-[var(--color-success)]">-¥{snapshot.couponDiscount.toFixed(2)}</span></div>}
                {snapshot.pointsDiscount > 0 && <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">积分抵扣</span><span className="font-medium text-[var(--color-success)]">-¥{snapshot.pointsDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="font-semibold">应付</span><span className="font-semibold">¥{snapshot.payable.toFixed(2)}</span></div>
              </div>
            </Card>
            <Button className="w-full" onClick={() => goStep("browse")}>返回便利店继续选购</Button>
          </>
        )}
      </>
    );
  }

  if (step === "deliveryOrder") {
    const snapshot = orderSnapshot;
    if (!snapshot || snapshot.mode !== "short_delivery") {
      return (
        <Card>
          <p className="font-semibold">配送订单上下文已失效</p>
          <SecondaryButton className="mt-4 w-full" onClick={() => goStep("browse")}>返回便利店重新选购</SecondaryButton>
        </Card>
      );
    }
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">配送订单详情</p>
          <h2 className="mt-1 break-all text-2xl font-semibold">{snapshot.id}</h2>
        </div>

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <StatusTag tone={deliveryStatus === "completed" ? "success" : undefined}>
              {deliveryStatus === "preparing" ? "门店接单 / 备货中" : deliveryStatus === "delivering" ? "配送中" : "已送达"}
            </StatusTag>
            <span className="text-xs text-[var(--color-text-tertiary)]">Mock order · 支付成功</span>
          </div>
          <p className="mt-4 font-semibold">{snapshot.storeName}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">约 3 km 短配 · {snapshot.itemCount} 件商品 · 应付 ¥{snapshot.payable.toFixed(2)}</p>
          {snapshot.address && <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{snapshot.address}</p>}

          {deliveryStatus === "preparing" && (
            <div className="mt-5 rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] p-4">
              <p className="text-sm font-medium">门店已接单，正在备货</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">备货完成后骑手会取货并进入配送中。</p>
              <Button className="mt-4 w-full" onClick={advanceDeliveryStatus}>模拟开始配送</Button>
            </div>
          )}

          {deliveryStatus === "delivering" && (
            <div className="mt-5 space-y-3">
              <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)]">
                <div className="flex items-center justify-between gap-3"><p className="font-semibold">配送中</p><StatusTag tone="success">约 {snapshot.distanceKm?.toFixed(1) ?? "--"} km</StatusTag></div>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">配送范围示例：约 {selectedStore?.deliveryRadiusKm ?? 3} km 内可送达；本订单正在配送。</p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">不连接真实地图或骑手调度，仅表达配送状态与进度反馈。</p>
              </Card>
            </div>
          )}
        </section>

        {deliveryStatus === "preparing" && <SecondaryButton className="w-full" onClick={() => goStep("browse")}>返回便利店</SecondaryButton>}
        {deliveryStatus === "delivering" && <Button className="w-full" onClick={advanceDeliveryStatus}>模拟送达</Button>}

        {deliveryStatus === "completed" && (
          <>
            <section className="rounded-[var(--radius-overlay)] bg-[var(--color-success-bg)] p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-success)]"><PrototypeIcon name="success" size={30} /></span>
              <StatusTag tone="success">已送达</StatusTag>
              <h2 className="mt-4 text-2xl font-semibold">短距配送已完成</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">订单 {snapshot.id} · {snapshot.address}</p>
            </section>
            <Card>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">商品实付小计</span><span className="font-medium">¥{snapshot.subtotalMember.toFixed(2)}</span></div>
                {snapshot.couponDiscount > 0 && <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">优惠券</span><span className="font-medium text-[var(--color-success)]">-¥{snapshot.couponDiscount.toFixed(2)}</span></div>}
                {snapshot.pointsDiscount > 0 && <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">积分抵扣</span><span className="font-medium text-[var(--color-success)]">-¥{snapshot.pointsDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">配送费</span><span className="font-medium">¥{snapshot.fulfillmentFee.toFixed(2)}</span></div>
                <div className="flex justify-between gap-3 border-t border-[var(--color-border)] pt-3"><span className="font-semibold">应付</span><span className="font-semibold">¥{snapshot.payable.toFixed(2)}</span></div>
              </div>
            </Card>
            <Button className="w-full" onClick={() => goStep("browse")}>返回便利店继续选购</Button>
          </>
        )}
      </>
    );
  }

  if (step === "legacyConfirm") {
    const legacyProduct = findById(catalogProducts, corePickupOrder.items[0].id);
    return (
      <>
        <button type="button" onClick={() => goStep("browse")} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回便利店
        </button>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">V0.1 自提回归入口</p>
          <h2 className="mt-1 text-2xl font-semibold">确认商品与自提门店</h2>
        </div>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{legacyProduct?.name ?? corePickupOrder.items[0].name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">数量 1 · 门店自提</p>
            </div>
            <p className="font-semibold text-[var(--color-primary-pressed)]">¥{legacyProduct?.priceYuan ?? corePickupOrder.items[0].unitPriceYuan}</p>
          </div>
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">自提门店</span><span className="text-right font-medium">{coreDemoStore.name}</span></div>
            <div className="mt-3 flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">用户</span><span className="text-right font-medium">{coreDemoUser.displayName} · {coreDemoUser.id}</span></div>
            <div className="mt-3 flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">演示订单</span><span className="text-right font-medium">{corePickupOrder.id}</span></div>
          </div>
        </Card>
        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">此入口只保留 V0.1 已验收深流程作为回归证据；V0.2 正式结算将由 T018 接管。</p>
        </Card>
        <Button className="w-full" onClick={() => goStep("legacyVoucher")}>提交演示订单</Button>
      </>
    );
  }

  if (step === "legacyVoucher") {
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">自提凭证 · V0.1 回归</p>
          <h2 className="mt-1 text-2xl font-semibold">到店出示提货码</h2>
        </div>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-[var(--color-on-primary)]">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">待到店核销</span>
            <span className="text-xs opacity-80">订单 {corePickupOrder.id}</span>
          </div>
          <p className="mt-8 text-sm opacity-80">提货码</p>
          <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.16em]">{pickupRedemption.code}</p>
          <div className="mt-8 border-t border-white/20 pt-4 text-sm leading-6 opacity-80">
            <p>{coreDemoStore.name}</p>
            <p>{coreDemoStore.address}</p>
          </div>
        </section>
        <Button className="w-full" onClick={() => goStep("legacySuccess")}>模拟店员核销</Button>
        <SecondaryButton className="w-full" onClick={() => goStep("legacyConfirm")}>返回订单确认</SecondaryButton>
      </>
    );
  }

  return (
    <>
      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-success-bg)] p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-success)]"><PrototypeIcon name="success" size={30} /></span>
        <StatusTag tone="success">核销完成</StatusTag>
        <h2 className="mt-4 text-2xl font-semibold">商品已完成自提</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">订单 {corePickupOrder.id} · {coreDemoStore.name}</p>
      </section>
      <Card>
        <p className="font-semibold">V0.1 回归链仍然可用</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">T017 新增的门店购物车没有覆盖这条已验收核销证据；下一版结算能力将在 T018 中正式迁移。</p>
      </Card>
      <Button className="w-full" onClick={() => goStep("browse")}>返回便利店继续选购</Button>
    </>
  );
}
