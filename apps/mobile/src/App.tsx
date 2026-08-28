import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon, type PrototypeIconName } from "@prototype/icons";
import { getPrototypeView, PrototypePanel, PrototypeState } from "@prototype/runtime";
import {
  CORE_DEMO_IDS,
  coreDemoStore,
  coreDemoUser,
  corePickupOrder,
  coreUserCoupons,
  findById,
  membershipLevelLabels,
  partners,
  products,
  redemptions,
  stores,
} from "@prototype/shared";

type Tab = "home" | "store" | "mall" | "care" | "me";
type Screen = Tab | "activity";
type StoreStep = "list" | "detail" | "confirm" | "voucher" | "success";

type SceneEntry = {
  id: Exclude<Tab, "home" | "me">;
  label: string;
  eyebrow: string;
  description: string;
  handoff: string;
  icon: PrototypeIconName;
};

const tabs: Array<{ id: Tab; label: string; icon: PrototypeIconName }> = [
  { id: "home", label: "首页", icon: "home" },
  { id: "store", label: "门店", icon: "home" },
  { id: "mall", label: "商城", icon: "modules" },
  { id: "care", label: "抗衰", icon: "success" },
  { id: "me", label: "我的", icon: "profile" },
];

const sceneEntries: SceneEntry[] = [
  {
    id: "store",
    label: "门店自提",
    eyebrow: "线下门店",
    description: "选择附近合作门店，进入商品、自提凭证与到店核销流程。",
    handoff: "T004 已完成门店选择、自提凭证与核销闭环。",
    icon: "home",
  },
  {
    id: "mall",
    label: "线上商城",
    eyebrow: "全国配送",
    description: "进入自有私域商城概念入口，后续支持到家或到店履约演示。",
    handoff: "T005 将继续完成商品、结算与一件代发闭环。",
    icon: "modules",
  },
  {
    id: "care",
    label: "智慧抗衰",
    eyebrow: "检测体验",
    description: "进入检测、体验券与基础报告场景；当前不代表真实设备接入。",
    handoff: "T006 将继续完成领券、到店体验与基础报告闭环。",
    icon: "success",
  },
];

const carrierLabels = {
  convenience_store: "便利店",
  health_center: "养生馆",
  wash_care: "洗护店",
  club: "会所",
} as const;

const memberLevel = membershipLevelLabels[coreDemoUser.member.level];
const availableCoupons = coreUserCoupons.filter((coupon) => coupon.status === "available");
const availableExperienceCoupons = availableCoupons.filter((coupon) => coupon.kind === "experience");
const availableDiscountCoupons = availableCoupons.filter((coupon) => coupon.kind === "discount");
const storeProducts = products.filter((product) => product.scenes.includes("store"));
const corePickupProduct = findById(products, corePickupOrder.items[0].id) ?? storeProducts[0];
const pickupRedemption = findById(redemptions, CORE_DEMO_IDS.pickupRedemption)!;

function IdentityStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? "text-xs" : "text-sm"}`}>
      <span className="font-medium">统一用户 ID · {coreDemoUser.id}</span>
      <StatusTag tone="success">{memberLevel}</StatusTag>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[390px] flex-col justify-between px-4 pb-8 pt-[max(32px,env(safe-area-inset-top))]">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)]">LOCAL LIFE · V0.1</p>
        <h1 className="mt-4 max-w-xs text-3xl font-semibold leading-tight">一个账号，连接三种本地生活场景。</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
          当前为概念原型。登录仅演示微信授权 / 手机号入口，不发起真实认证、验证码或数据持久化。
        </p>
      </div>

      <Card className="mb-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
            <PrototypeIcon name="profile" size={22} />
          </div>
          <div>
            <p className="font-semibold">登录本地生活</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">登录后使用同一会员身份访问门店、商城和智慧抗衰</p>
          </div>
        </div>
        <Button className="mt-5 w-full" onClick={onLogin}>微信授权进入</Button>
        <SecondaryButton className="mt-3 w-full" onClick={onLogin}>手机号快捷登录</SecondaryButton>
        <p className="mt-4 text-center text-xs leading-5 text-[var(--color-text-tertiary)]">演示账号：{coreDemoUser.id} · {memberLevel}</p>
      </Card>
    </main>
  );
}

function HomeScreen({ go, openActivity }: { go: (screen: Screen) => void; openActivity: () => void }) {
  return (
    <>
      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="rounded-full bg-white/15 px-2.5 py-1 font-medium">统一用户 ID · {coreDemoUser.id}</span>
          <span className="text-white/80">{memberLevel}</span>
        </div>
        <p className="mt-6 text-sm text-white/75">欢迎回来，{coreDemoUser.displayName}</p>
        <h2 className="mt-1 text-2xl font-semibold leading-tight">今天想从哪个生活场景开始？</h2>
        <p className="mt-3 text-sm leading-6 text-white/80">门店自提、线上商城、智慧抗衰，共用同一账号与会员身份。</p>
      </section>

      <Section title="三个生活入口">
        <div className="grid grid-cols-3 gap-3">
          {sceneEntries.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className="flex min-h-32 flex-col items-start justify-between rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition active:bg-[var(--color-surface-subtle)]"
              aria-label={`进入${item.label}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
                <PrototypeIcon name={item.icon} size={19} />
              </span>
              <span>
                <strong className="block text-sm">{item.label}</strong>
                <small className="mt-1 block text-xs leading-5 text-[var(--color-text-tertiary)]">{item.eyebrow}</small>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <button type="button" onClick={openActivity} className="w-full text-left">
        <Card className="transition active:bg-[var(--color-surface-subtle)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <StatusTag>消息 / 活动</StatusTag>
                <span className="text-xs text-[var(--color-text-tertiary)]">私域承接概念</span>
              </div>
              <p className="mt-3 font-semibold">新会员礼遇已放入统一账号</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">查看活动、领取提示和“附近生活群”概念入口。</p>
            </div>
            <span className="pt-1 text-[var(--color-text-tertiary)]">›</span>
          </div>
        </Card>
      </button>
    </>
  );
}

function StoreFlowScreen({ openActivity }: { openActivity: () => void }) {
  const [step, setStep] = useState<StoreStep>("list");
  const [selectedStoreId, setSelectedStoreId] = useState(coreDemoStore.id);
  const [selectedProductId, setSelectedProductId] = useState(corePickupProduct?.id ?? "");

  const selectedStore = findById(stores, selectedStoreId) ?? coreDemoStore;
  const selectedPartner = partners.find((partner) => partner.id === selectedStore.partnerId);
  const selectedProduct = findById(products, selectedProductId) ?? corePickupProduct;
  const selectedCarrier = selectedPartner ? carrierLabels[selectedPartner.carrierType] : "合作载体";
  const isCoreDemoStore = selectedStore.id === coreDemoStore.id;

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
            <p className="text-sm text-[var(--color-text-secondary)]">门店自提</p>
            <h2 className="mt-1 text-2xl font-semibold">选择附近合作门店</h2>
          </div>
          <StatusTag tone="success">演示定位</StatusTag>
        </div>

        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">门店可以是便利店、养生馆、洗护店或会所等合作载体；V0.1 不接真实定位 SDK。</p>

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
          <p className="text-sm font-medium">为什么有多种门店载体？</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">同一套页面结构需要适配不同合作商形态，不把“线下门店”错误等同于便利店。</p>
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
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">V0.1 不接真实支付、库存锁定或门店系统。点击提交只进入稳定演示订单与提货凭证。</p>
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
          <IdentityStrip />
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-medium">{corePickupOrder.items[0].name} × {corePickupOrder.items[0].quantity}</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">订单、提货码、用户与门店均来自同一 T002 演示数据链。</p>
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
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">可表现积分、赠品或优惠券奖励，但 V0.1 不固定奖励数值，也不连接真实积分发放系统。</p>
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
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">查看“附近生活群”、活动触达与权益承接的概念入口。</p>
            </div>
            <span className="text-[var(--color-text-tertiary)]">›</span>
          </div>
        </Card>
      </button>

      <SecondaryButton className="w-full" onClick={() => goStep("list")}>再次查看门店</SecondaryButton>
    </>
  );
}

function SceneScreen({ scene, goHome }: { scene: SceneEntry; goHome: () => void }) {
  return (
    <>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{scene.eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold">{scene.label}</h2>
      </div>

      <Card className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
          <PrototypeIcon name={scene.icon} size={22} />
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{scene.description}</p>
        <div className="mt-5 border-t border-[var(--color-border)] pt-4">
          <IdentityStrip compact />
        </div>
      </Card>

      <Card className="bg-[var(--color-surface-subtle)]">
        <StatusTag>后续任务边界</StatusTag>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{scene.handoff}</p>
      </Card>

      <Button className="w-full" onClick={goHome}>返回首页继续选择</Button>
    </>
  );
}

function ActivityScreen({ goHome }: { goHome: () => void }) {
  return (
    <>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">消息与活动</p>
        <h2 className="mt-1 text-2xl font-semibold">把三种场景接回同一个账号</h2>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">新会员礼遇</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">当前账号有 {availableDiscountCoupons.length} 张可用优惠券、{availableExperienceCoupons.length} 张可用体验券。</p>
          </div>
          <StatusTag tone="success">已关联</StatusTag>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
            <PrototypeIcon name="info" size={20} />
          </span>
          <div>
            <p className="font-semibold">附近生活群 · 概念入口</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">V0.1 只表达扫码进群、活动触达或领取权益后的私域承接关系；真实进群方式、消息推送和二次触达尚未接入。</p>
          </div>
        </div>
      </Card>

      <Button className="w-full" onClick={goHome}>查看三大场景</Button>
    </>
  );
}

function ProfileScreen() {
  return (
    <>
      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-lg font-semibold text-[var(--color-primary-pressed)]">
            {coreDemoUser.displayName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">{coreDemoUser.displayName}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">统一用户 ID · {coreDemoUser.id}</p>
          </div>
          <StatusTag tone="success">{memberLevel}</StatusTag>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-4 text-center">
          <div><strong className="block text-lg">{coreDemoUser.pointsBalance.toLocaleString("zh-CN")}</strong><span className="text-xs text-[var(--color-text-tertiary)]">积分</span></div>
          <div><strong className="block text-lg">{availableDiscountCoupons.length}</strong><span className="text-xs text-[var(--color-text-tertiary)]">可用优惠券</span></div>
          <div><strong className="block text-lg">{availableExperienceCoupons.length}</strong><span className="text-xs text-[var(--color-text-tertiary)]">可用体验券</span></div>
        </div>
      </section>

      <Card className="bg-[var(--color-surface-subtle)]">
        <p className="font-medium">统一会员身份已接入 T002 演示数据</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">订单、积分明细、券和检测报告的完整用户中心将在 T007 中继续施工；本卡不提前固化未确认的会员规则。</p>
      </Card>
    </>
  );
}

export function App() {
  const view = getPrototypeView();
  const [authenticated, setAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");

  const activeTab: Tab = screen === "activity" ? "home" : screen;
  const title = screen === "activity" ? "消息与活动" : tabs.find((item) => item.id === activeTab)?.label ?? "首页";
  const activeScene = sceneEntries.find((item) => item.id === screen);

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!authenticated) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-background)] text-[var(--color-text-primary)]">
        <LoginScreen onLogin={() => setAuthenticated(true)} />
        <PrototypePanel />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-[390px] items-center justify-between px-4">
          <div>
            <p className="text-xs font-medium text-[var(--color-primary)]">LOCAL LIFE · V0.1</p>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <button type="button" aria-label="消息与活动" onClick={() => go("activity")} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]">
            <PrototypeIcon name="info" size={19} />
          </button>
        </div>
      </header>

      <PrototypeState view={view}>
        <main className="mx-auto max-w-[390px] space-y-6 px-4 py-5 pb-28">
          {screen === "home" && <HomeScreen go={go} openActivity={() => go("activity")} />}
          {screen === "store" && <StoreFlowScreen openActivity={() => go("activity")} />}
          {(screen === "mall" || screen === "care") && activeScene && <SceneScreen scene={activeScene} goHome={() => go("home")} />}
          {screen === "activity" && <ActivityScreen goHome={() => go("home")} />}
          {screen === "me" && <ProfileScreen />}
        </main>
      </PrototypeState>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex min-h-16 max-w-[390px] border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            aria-current={activeTab === item.id ? "page" : undefined}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-xs ${activeTab === item.id ? "font-medium text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"}`}
          >
            <PrototypeIcon name={item.icon} size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <PrototypePanel />
    </div>
  );
}
