import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  CORE_DEMO_IDS,
  coreDemoStore,
  coreDemoUser,
  corePickupOrder,
  findById,
  partners,
  products,
  redemptions,
  stores,
} from "@prototype/shared";
import type { SearchBusinessHandoff } from "./GlobalSearchScreen";

type StoreStep = "list" | "detail" | "confirm" | "voucher" | "success";

const carrierLabels = {
  convenience_store: "便利店",
  health_center: "养生馆",
  wash_care: "洗护店",
  club: "会所",
} as const;

const storeProducts = products.filter((product) => product.scenes.includes("store"));
const corePickupProduct = findById(products, corePickupOrder.items[0].id) ?? storeProducts[0];
const pickupRedemption = findById(redemptions, CORE_DEMO_IDS.pickupRedemption)!;

interface StoreFlowScreenProps {
  openActivity: () => void;
  entryContext?: SearchBusinessHandoff;
}

export function StoreFlowScreen({ openActivity, entryContext }: StoreFlowScreenProps) {
  const entryStoreId = entryContext?.storeId && stores.some((store) => store.id === entryContext.storeId)
    ? entryContext.storeId
    : undefined;
  const entryProduct = entryContext?.entityId ? findById(products, entryContext.entityId) : undefined;
  const [step, setStep] = useState<StoreStep>(entryStoreId ? "detail" : "list");
  const [selectedStoreId, setSelectedStoreId] = useState(entryStoreId ?? coreDemoStore.id);
  const [selectedProductId, setSelectedProductId] = useState(entryProduct?.id ?? corePickupProduct?.id ?? "");

  const selectedStore = findById(stores, selectedStoreId) ?? coreDemoStore;
  const selectedPartner = partners.find((partner) => partner.id === selectedStore.partnerId);
  const selectedProduct = findById(products, selectedProductId) ?? corePickupProduct;
  const selectedCarrier = selectedPartner ? carrierLabels[selectedPartner.carrierType] : "合作载体";
  const isCoreDemoStore = selectedStore.id === coreDemoStore.id;
  const showingSearchContext = Boolean(entryContext?.storeId === selectedStore.id);

  const openStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setStep("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goStep = (next: StoreStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === "list") {
    return (
      <>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">便利店 · V0.1 流程保留</p>
            <h2 className="mt-1 text-2xl font-semibold">选择附近合作门店</h2>
          </div>
          <StatusTag tone="success">演示定位</StatusTag>
        </div>

        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">T016 只升级一级 IA、首页和发现入口；门店浏览与独立购物车将在 T017 接管。当前保留已验收自提流程作为渐进迁移基线。</p>

        <div className="space-y-3">
          {stores.map((store) => {
            const partner = partners.find((item) => item.id === store.partnerId);
            const carrier = partner ? carrierLabels[partner.carrierType] : "合作载体";
            const isCore = store.id === coreDemoStore.id;
            return (
              <button key={store.id} type="button" className="w-full text-left" onClick={() => openStore(store.id)}>
                <Card className="transition active:bg-[var(--color-surface-subtle)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{store.name}</h3>
                        <StatusTag>{carrier}</StatusTag>
                        {isCore && <StatusTag tone="success">核心演示门店</StatusTag>}
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{store.address}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">距你 {store.distanceKm?.toFixed(1) ?? "--"} km · 可自提{store.capabilities.includes("care_detection") ? " · 可检测" : ""}</p>
                    </div>
                    <span className="pt-1 text-[var(--color-text-tertiary)]">›</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="text-sm font-medium">渐进迁移说明</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">V0.2 已把一级业务语义收敛为“便利店”；这里暂不提前建设 T017 的商品分类、独立购物车和即时零售浏览。</p>
        </Card>
      </>
    );
  }

  if (step === "detail") {
    return (
      <>
        <button type="button" onClick={() => goStep("list")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回门店列表
        </button>

        {showingSearchContext && entryContext && (
          <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">来自全局搜索 · 门店上下文已保留</p>
                <p className="mt-2 font-semibold">{entryContext.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">已锁定 {selectedStore.name}；商品实体 {entryContext.entityId} 将由 T017 的门店商品浏览 / 独立购物车继续承接。</p>
              </div>
              <StatusTag tone="success">已定位</StatusTag>
            </div>
          </Card>
        )}

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusTag>{selectedCarrier}</StatusTag>
                <StatusTag tone="success">营业中</StatusTag>
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{selectedStore.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedStore.address} · 距你 {selectedStore.distanceKm?.toFixed(1) ?? "--"} km</p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
              <PrototypeIcon name="home" size={22} />
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
            {selectedStore.capabilities.includes("pickup") && <StatusTag>门店自提</StatusTag>}
            {selectedStore.capabilities.includes("care_detection") && <StatusTag>基础检测</StatusTag>}
            {selectedStore.capabilities.includes("care_service") && <StatusTag>护理服务</StatusTag>}
          </div>
        </section>

        <Section title="可自提商品">
          <div className="space-y-3">
            {storeProducts.map((product) => {
              const selected = selectedProduct?.id === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className={`w-full rounded-[var(--radius-container)] border p-4 text-left transition ${selected ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)] active:bg-[var(--color-surface-subtle)]"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{product.category} · 支持门店自提</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--color-primary-pressed)]">¥{product.priceYuan}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{selected ? "已选择" : "选择"}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {isCoreDemoStore ? (
          <>
            <Card className="bg-[var(--color-surface-subtle)]">
              <p className="text-sm font-medium">到店激励 · 演示概念</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">完成自提后可发放积分、赠品或优惠券，并承接私域入口；具体奖励值和成本承担规则尚未确认。</p>
            </Card>
            <Button className="w-full" disabled={!selectedProduct} onClick={() => goStep("confirm")}>选择此门店自提</Button>
          </>
        ) : (
          <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
            <StatusTag tone="warning">载体适配演示</StatusTag>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">当前稳定订单 / 核销数据链绑定“{coreDemoStore.name}”。本店用于验证不同载体的页面适配，不另造冲突订单。</p>
            <SecondaryButton className="mt-4 w-full" onClick={() => openStore(coreDemoStore.id)}>切换到核心演示门店</SecondaryButton>
          </Card>
        )}
      </>
    );
  }

  if (step === "confirm") {
    return (
      <>
        <button type="button" onClick={() => goStep("detail")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回门店详情
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">自提确认</p>
          <h2 className="mt-1 text-2xl font-semibold">确认商品与自提门店</h2>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{selectedProduct?.name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">数量 1 · 门店自提</p>
            </div>
            <p className="font-semibold text-[var(--color-primary-pressed)]">¥{selectedProduct?.priceYuan}</p>
          </div>
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">自提门店</span><span className="text-right font-medium">{coreDemoStore.name}</span></div>
            <div className="mt-3 flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">用户</span><span className="text-right font-medium">{coreDemoUser.displayName} · {coreDemoUser.id}</span></div>
            <div className="mt-3 flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">演示订单</span><span className="text-right font-medium">{corePickupOrder.id}</span></div>
          </div>
        </Card>

        <Card className="bg-[var(--color-surface-subtle)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">当前保留 V0.1 演示订单合同，不接真实支付、库存锁定或门店系统。</p>
          </div>
        </Card>

        <Button className="w-full" onClick={() => goStep("voucher")}>提交演示订单</Button>
      </>
    );
  }

  if (step === "voucher") {
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">自提凭证</p>
          <h2 className="mt-1 text-2xl font-semibold">到店出示提货码</h2>
        </div>

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">待到店核销</span>
            <span className="text-xs text-white/75">订单 {corePickupOrder.id}</span>
          </div>
          <p className="mt-8 text-sm text-white/75">提货码</p>
          <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.16em]">{pickupRedemption.code}</p>
          <div className="mt-8 border-t border-white/20 pt-4 text-sm leading-6 text-white/80">
            <p>{coreDemoStore.name}</p>
            <p>{coreDemoStore.address}</p>
          </div>
        </section>

        <Card>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">统一用户 ID · {coreDemoUser.id}</span>
            <StatusTag tone="success">已关联</StatusTag>
          </div>
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-medium">{corePickupOrder.items[0].name} × {corePickupOrder.items[0].quantity}</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">订单、提货码、用户与门店仍来自同一条已验收演示数据链。</p>
          </div>
        </Card>

        <Button className="w-full" onClick={() => goStep("success")}>模拟店员核销</Button>
        <SecondaryButton className="w-full" onClick={() => goStep("confirm")}>返回订单确认</SecondaryButton>
      </>
    );
  }

  return (
    <>
      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-success-bg)] p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-success)]">
          <PrototypeIcon name="success" size={30} />
        </span>
        <StatusTag tone="success">核销完成</StatusTag>
        <h2 className="mt-4 text-2xl font-semibold">商品已完成自提</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">订单 {corePickupOrder.id} · {coreDemoStore.name}</p>
      </section>

      <Card>
        <p className="font-semibold">到店奖励已进入演示反馈</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">可表现积分、赠品或优惠券奖励，但当前不固定奖励数值，也不连接真实积分发放系统。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusTag tone="success">积分奖励 · 待规则确认</StatusTag>
          <StatusTag>到店礼 · 概念</StatusTag>
        </div>
      </Card>

      <button type="button" onClick={openActivity} className="w-full text-left">
        <Card className="border-[var(--color-primary)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">继续进入私域承接</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">查看活动触达与权益承接入口。</p>
            </div>
            <span className="text-[var(--color-text-tertiary)]">›</span>
          </div>
        </Card>
      </button>

      <SecondaryButton className="w-full" onClick={() => goStep("list")}>再次查看门店</SecondaryButton>
    </>
  );
}
