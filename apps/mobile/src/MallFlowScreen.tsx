import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  coreDemoStore,
  coreDemoUser,
  coreUserCoupons,
  findById,
  orderStatusLabels,
  products,
  type OrderStatus,
  type Product,
} from "@prototype/shared";

type MallStep = "home" | "detail" | "cart" | "checkout" | "order";
type MallFulfillment = "home_delivery" | "store_delivery";

const mallProducts = products.filter((product) => product.scenes.includes("mall"));
const defaultProduct = mallProducts[0];
const mallCoupon = coreUserCoupons.find((coupon) => coupon.scene === "mall" && coupon.status === "available");
const categories = ["全部", ...Array.from(new Set(mallProducts.map((product) => product.category)))];
const demoAddress = "演示地址 · 华南某市林女士收";
const demoOrderId = `MALL-${coreDemoUser.id.replace("LL-", "")}-DEMO`;

const fulfillmentLabels: Record<MallFulfillment, { title: string; description: string }> = {
  home_delivery: {
    title: "全国配送到家",
    description: "一件代发概念：供应方直接履约到收货地址，不展示真实仓库、物流商或责任主体。",
  },
  store_delivery: {
    title: "送至合作门店",
    description: `商品先送至${coreDemoStore.name}，到店后再自提；V0.1 不接真实门店库存与到货通知。`,
  },
};

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function supportedFulfillments(product: Product): MallFulfillment[] {
  return product.fulfillment.filter(
    (item): item is MallFulfillment => item === "home_delivery" || item === "store_delivery",
  );
}

export function MallFlowScreen() {
  const [step, setStep] = useState<MallStep>("home");
  const [category, setCategory] = useState("全部");
  const [selectedProductId, setSelectedProductId] = useState(defaultProduct?.id ?? "");
  const [fulfillment, setFulfillment] = useState<MallFulfillment>("home_delivery");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending_fulfillment");

  const selectedProduct = findById(products, selectedProductId) ?? defaultProduct;
  const visibleProducts = category === "全部"
    ? mallProducts
    : mallProducts.filter((product) => product.category === category);
  const fulfillmentOptions = selectedProduct ? supportedFulfillments(selectedProduct) : [];

  const goStep = (next: MallStep) => {
    setStep(next);
    scrollTop();
  };

  const openProduct = (productId: string) => {
    const product = findById(products, productId);
    setSelectedProductId(productId);
    const options = product ? supportedFulfillments(product) : [];
    if (!options.includes(fulfillment)) {
      setFulfillment(options[0] ?? "home_delivery");
    }
    goStep("detail");
  };

  const submitDemoOrder = () => {
    setOrderStatus("pending_fulfillment");
    goStep("order");
  };

  const advanceOrder = () => {
    if (orderStatus === "pending_fulfillment") {
      setOrderStatus("shipping");
      return;
    }
    if (orderStatus === "shipping") {
      setOrderStatus(fulfillment === "store_delivery" ? "pending_pickup" : "completed");
      return;
    }
    if (orderStatus === "pending_pickup") {
      setOrderStatus("completed");
    }
  };

  if (step === "home") {
    return (
      <>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">自建私域商城 · 当前演示</span>
            <span className="text-xs text-white/75">{coreDemoUser.id}</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold">线上商城</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">浏览共享商品，选择全国配送到家或送至合作门店，连续演示一件代发订单。</p>
        </section>

        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">渠道方案仍待确认</p>
                <StatusTag tone="warning">D002 Open</StatusTag>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前流程演示自建商城；外部电商导流仍是候选方案，不提供真实跳转，也不暗示已完成平台数据打通。</p>
            </div>
          </div>
        </Card>

        <Section title="商品分类 / 推荐">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="商城商品分类">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm ${category === item ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleProducts.map((product) => (
              <button key={product.id} type="button" onClick={() => openProduct(product.id)} className="w-full text-left">
                <Card className="transition active:bg-[var(--color-surface-subtle)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusTag>{product.category}</StatusTag>
                        {product.fulfillment.includes("home_delivery") && <StatusTag tone="success">可到家</StatusTag>}
                        {product.fulfillment.includes("store_delivery") && <StatusTag>可送店</StatusTag>}
                      </div>
                      <h3 className="mt-3 font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">共享商品 · 商城场景 · 点击查看规格与履约方式</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-[var(--color-primary-pressed)]">¥{product.priceYuan}</p>
                      <span className="mt-2 block text-[var(--color-text-tertiary)]">›</span>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </Section>

        {mallCoupon && (
          <Card className="bg-[var(--color-surface-subtle)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{mallCoupon.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">已关联当前用户；优惠门槛和减免金额未在 Shared 中定义，因此结算页不擅自计算优惠。</p>
              </div>
              <StatusTag tone="success">可用</StatusTag>
            </div>
          </Card>
        )}
      </>
    );
  }

  if (!selectedProduct) {
    return (
      <Card>
        <p className="font-semibold">没有可演示的商城商品</p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">当前 Shared fixtures 未提供 mall 商品。</p>
        <Button className="mt-4 w-full" onClick={() => goStep("home")}>返回商城首页</Button>
      </Card>
    );
  }

  if (step === "detail") {
    return (
      <>
        <button type="button" onClick={() => goStep("home")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回商城
        </button>

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusTag>{selectedProduct.category}</StatusTag>
            <StatusTag tone="success">商城商品</StatusTag>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{selectedProduct.name}</h2>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-primary-pressed)]">¥{selectedProduct.priceYuan}</p>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">规格：单件演示规格。真实 SKU、库存、图文详情与供应商信息尚未建模，本页只验证商品决策和履约动线。</p>
        </section>

        <Section title="支持的履约方式">
          <div className="space-y-3">
            {fulfillmentOptions.map((item) => (
              <Card key={item} className="bg-[var(--color-surface-subtle)]">
                <p className="font-semibold">{fulfillmentLabels[item].title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{fulfillmentLabels[item].description}</p>
              </Card>
            ))}
          </div>
        </Section>

        {mallCoupon && (
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">优惠权益</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{mallCoupon.title} · 金额规则待确认</p>
              </div>
              <StatusTag tone="success">已关联</StatusTag>
            </div>
          </Card>
        )}

        <Button className="w-full" onClick={() => goStep("cart")}>加入购物车</Button>
        <SecondaryButton className="w-full" onClick={() => goStep("home")}>继续浏览商品</SecondaryButton>
      </>
    );
  }

  if (step === "cart") {
    return (
      <>
        <button type="button" onClick={() => goStep("detail")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回商品详情
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">演示购物车</p>
          <h2 className="mt-1 text-2xl font-semibold">确认本次购买商品</h2>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{selectedProduct.name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">数量 1 · {selectedProduct.category}</p>
            </div>
            <p className="font-semibold text-[var(--color-primary-pressed)]">¥{selectedProduct.priceYuan}</p>
          </div>
        </Card>

        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">购物车只保存在当前页面状态中；刷新、退出或切换产品后不承诺持久化，符合 V0.1 范围。</p>
        </Card>

        <Button className="w-full" onClick={() => goStep("checkout")}>去结算</Button>
      </>
    );
  }

  if (step === "checkout") {
    const destination = fulfillment === "home_delivery"
      ? demoAddress
      : `${coreDemoStore.name} · ${coreDemoStore.address}`;

    return (
      <>
        <button type="button" onClick={() => goStep("cart")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回购物车
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">结算确认</p>
          <h2 className="mt-1 text-2xl font-semibold">选择配送方式</h2>
        </div>

        <Card>
          <p className="text-xs text-[var(--color-text-tertiary)]">{fulfillment === "home_delivery" ? "收货人 / 统一账号" : "提货人 / 统一账号"}</p>
          <p className="mt-2 font-semibold">{coreDemoUser.displayName} · {coreDemoUser.id}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{destination}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
            {fulfillment === "home_delivery"
              ? "演示地址不写入 Shared，也不代表真实用户地址。"
              : "送店目的地来自 Shared 核心合作门店；真实到货通知与门店库存未接入。"}
          </p>
        </Card>

        <Section title="履约方式">
          <div className="space-y-3">
            {fulfillmentOptions.map((item) => {
              const selected = fulfillment === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFulfillment(item)}
                  className={`min-h-[72px] w-full rounded-[var(--radius-container)] border p-4 text-left ${selected ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{fulfillmentLabels[item].title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{fulfillmentLabels[item].description}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[var(--color-primary)]">{selected ? "已选择" : "选择"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--color-text-secondary)]">商品金额</span>
            <span className="font-semibold">¥{selectedProduct.priceYuan}</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <span className="text-sm text-[var(--color-text-secondary)]">商城券</span>
            <span className="max-w-[210px] text-right text-sm font-medium">{mallCoupon ? `${mallCoupon.title} · 优惠金额待规则确认` : "当前无可用商城券"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <span className="text-sm text-[var(--color-text-secondary)]">演示应付</span>
            <span className="font-semibold text-[var(--color-primary-pressed)]">¥{selectedProduct.priceYuan}</span>
          </div>
        </Card>

        <Card className="bg-[var(--color-surface-subtle)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">不发起真实支付、库存锁定、供应商下单或物流创建。提交后只生成当前会话内的概念订单详情。</p>
          </div>
        </Card>

        <Button className="w-full" disabled={fulfillmentOptions.length === 0} onClick={submitDemoOrder}>提交演示订单</Button>
      </>
    );
  }

  const currentFulfillment = fulfillmentLabels[fulfillment];
  const canAdvance = orderStatus === "pending_fulfillment" || orderStatus === "shipping" || orderStatus === "pending_pickup";
  const nextStatusLabel = orderStatus === "pending_fulfillment"
    ? "模拟进入配送中"
    : orderStatus === "shipping"
      ? fulfillment === "store_delivery" ? "模拟到店待自提" : "模拟完成订单"
      : orderStatus === "pending_pickup"
        ? "模拟完成自提"
        : "订单已完成";

  return (
    <>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">订单详情</p>
        <h2 className="mt-1 text-2xl font-semibold">{demoOrderId}</h2>
      </div>

      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusTag tone={orderStatus === "completed" ? "success" : undefined}>{orderStatusLabels[orderStatus]}</StatusTag>
          <span className="text-xs text-[var(--color-text-tertiary)]">概念订单 · 不持久化</span>
        </div>
        <p className="mt-5 font-semibold">{selectedProduct.name} × 1</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">¥{selectedProduct.priceYuan} · {currentFulfillment.title}</p>
        <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">用户</span><span className="text-right font-medium">{coreDemoUser.displayName} · {coreDemoUser.id}</span></div>
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">履约</span><span className="text-right font-medium">{currentFulfillment.title}</span></div>
          <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">目的地</span><span className="max-w-[220px] text-right font-medium">{fulfillment === "home_delivery" ? demoAddress : `${coreDemoStore.name} · ${coreDemoStore.address}`}</span></div>
        </div>
      </section>

      <Section title="订单状态概念">
        <div className="grid grid-cols-2 gap-3">
          {(["pending_payment", "pending_fulfillment", "shipping", "pending_pickup", "completed"] as OrderStatus[]).map((status) => (
            <Card key={status} className={status === orderStatus ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "bg-[var(--color-surface-subtle)]"}>
              <p className="font-medium">{orderStatusLabels[status]}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{status === orderStatus ? "当前演示状态" : "流程可出现状态"}</p>
            </Card>
          ))}
        </div>
        <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">待付款只作为概念状态展示；本原型不接支付，因此提交演示订单后直接进入对应履约状态。</p>
      </Section>

      {fulfillment === "home_delivery" && (
        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="font-semibold">一件代发边界</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">本页只表达“订单提交后由供应侧直接履约”的业务方向。供应商、仓配、售后、运费和责任主体尚未决策，不生成虚假物流单号。</p>
        </Card>
      )}

      {canAdvance && <Button className="w-full" onClick={advanceOrder}>{nextStatusLabel}</Button>}
      {orderStatus === "completed" && (
        <Card className="bg-[var(--color-success-bg)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="success" size={22} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
            <div>
              <p className="font-semibold">演示订单已完成</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">订单仍关联统一用户 {coreDemoUser.id}；真实积分、售后与私域触达规则继续保持未接入。</p>
            </div>
          </div>
        </Card>
      )}
      <SecondaryButton className="w-full" onClick={() => goStep("home")}>返回商城继续浏览</SecondaryButton>
    </>
  );
}
