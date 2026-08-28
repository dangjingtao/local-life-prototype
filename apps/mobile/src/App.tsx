import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon, type PrototypeIconName } from "@prototype/icons";
import { getPrototypeView, PrototypePanel, PrototypeState } from "@prototype/runtime";
import { coreDemoUser, coreUserCoupons, membershipLevelLabels } from "@prototype/shared";

type Tab = "home" | "store" | "mall" | "care" | "me";
type Screen = Tab | "activity";

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
    description: "选择附近合作门店，后续可进入商品、自提与到店核销流程。",
    handoff: "T004 将继续完成门店选择、自提凭证与核销闭环。",
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

const memberLevel = membershipLevelLabels[coreDemoUser.member.level];
const availableCoupons = coreUserCoupons.filter((coupon) => coupon.status === "available");
const availableExperienceCoupons = availableCoupons.filter((coupon) => coupon.kind === "experience");
const availableDiscountCoupons = availableCoupons.filter((coupon) => coupon.kind === "discount");

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
        <main className="mx-auto max-w-[390px] space-y-6 px-4 py-5 pb-24">
          {screen === "home" && <HomeScreen go={go} openActivity={() => go("activity")} />}
          {activeScene && <SceneScreen scene={activeScene} goHome={() => go("home")} />}
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
            aria-current={screen === item.id ? "page" : undefined}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-xs ${screen === item.id ? "font-medium text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"}`}
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
