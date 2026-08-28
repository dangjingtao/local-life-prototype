import { useState, type ReactNode } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon, type PrototypeIconName } from "@prototype/icons";
import {
  businessSceneLabels,
  couponStatusLabels,
  coreDemoReport,
  coreDemoUser,
  coreUserCoupons,
  coreUserOrders,
  membershipLevelLabels,
  orderStatusLabels,
  pointLedger,
  prototypeRules,
  redemptionStatusLabels,
  redemptions,
  type CouponStatus,
  type PointSource,
} from "@prototype/shared";

type MemberView = "overview" | "points" | "coupons" | "records";
type ReplayState = "ready" | "processing" | "completed";

const pointSourceLabels: Record<PointSource, string> = {
  register: "注册", purchase: "消费", store_visit: "到店", pickup: "自提",
  detection: "检测", experience: "体验", task: "主动任务", exchange: "兑换",
};
const couponTabs: Array<{ id: CouponStatus; label: string }> = [
  { id: "available", label: "可用" }, { id: "used", label: "已用" }, { id: "expired", label: "已过期" },
];
const memberPoints = pointLedger.filter((item) => item.userId === coreDemoUser.id);
const earnEntry = [...memberPoints].reverse().find((item) => item.direction === "earn");
const exchangeEntry = [...memberPoints].reverse().find((item) => item.direction === "spend" && item.source === "exchange");
const memberRedemptions = redemptions.filter((item) => item.userId === coreDemoUser.id);

function date(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(new Date(value));
}

function Back({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]"><PrototypeIcon name="back" size={18} />返回会员中心</button>;
}

function Entry({ icon, title, note, onClick }: { icon: PrototypeIconName; title: string; note: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-[112px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left active:bg-[var(--color-surface-subtle)]">
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name={icon} size={18} /></span>
      <strong className="mt-3 block">{title}</strong><span className="mt-1 block text-xs leading-5 text-[var(--color-text-tertiary)]">{note}</span>
    </button>
  );
}

function ReplayCard({ title, text, state, action, secondary = false }: { title: string; text: ReactNode; state: ReplayState; action: () => void; secondary?: boolean }) {
  const label = state === "ready" ? "待演示" : state === "processing" ? "处理中" : "已完成";
  const buttonLabel = state === "ready" ? "开始重放" : state === "processing" ? "完成演示" : "重置演示";
  const Action = secondary ? SecondaryButton : Button;
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{title}</p><StatusTag tone={state === "completed" ? "success" : state === "processing" ? "warning" : "neutral"}>{label}</StatusTag></div>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{text}</p>
      <Action className="mt-4 w-full" onClick={action}>{buttonLabel}</Action>
    </Card>
  );
}

export function MembershipCenterScreen() {
  const [view, setView] = useState<MemberView>("overview");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("available");
  const [earnReplay, setEarnReplay] = useState<ReplayState>("ready");
  const [exchangeReplay, setExchangeReplay] = useState<ReplayState>("ready");
  const availableCount = coreUserCoupons.filter((item) => item.status === "available").length;
  const go = (next: MemberView) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const nextReplay = (state: ReplayState): ReplayState => state === "ready" ? "processing" : state === "processing" ? "completed" : "ready";

  if (view === "overview") return (
    <>
      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-lg font-semibold">{coreDemoUser.displayName.slice(0, 1)}</span>
          <div className="min-w-0 flex-1"><p className="font-semibold">{coreDemoUser.displayName}</p><p className="mt-1 text-xs text-white/75">统一用户 ID · {coreDemoUser.id}</p></div>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{membershipLevelLabels[coreDemoUser.member.level]}</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center">
          <div><strong className="block text-xl">{coreDemoUser.pointsBalance}</strong><span className="text-xs text-white/70">当前积分</span></div>
          <div><strong className="block text-xl">{availableCount}</strong><span className="text-xs text-white/70">可用券</span></div>
          <div><strong className="block text-xl">{coreUserOrders.length + 1}</strong><span className="text-xs text-white/70">业务记录</span></div>
        </div>
      </section>
      <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
        <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">会员规则仍是候选方案</p><StatusTag tone="warning">Candidate</StatusTag></div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{coreDemoUser.member.note} {prototypeRules.membershipLevels.note}</p>
      </Card>
      <Section title="我的权益"><div className="grid grid-cols-2 gap-3">
        <Entry icon="success" title="积分中心" note="流水 · 获取 · 兑换状态" onClick={() => go("points")} />
        <Entry icon="modules" title="我的券" note="优惠券 · 体验券 · 状态" onClick={() => go("coupons")} />
        <Entry icon="home" title="我的订单" note="统一账号订单入口" onClick={() => go("records")} />
        <Entry icon="info" title="检测报告" note="基础报告与核销入口" onClick={() => go("records")} />
      </div></Section>
      <Card><div className="flex flex-wrap gap-2">{prototypeRules.membershipLevels.value.map((level) => <StatusTag key={level} tone={level === coreDemoUser.member.level ? "success" : "neutral"}>{membershipLevelLabels[level]}</StatusTag>)}</div><p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">等级名称为候选结构；升级门槛、倍率、保级与专属折扣均未确认。</p></Card>
      <Card className="bg-[var(--color-surface-subtle)]"><p className="font-medium">主动任务 · 能力占位</p><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">“任务”是已建模的积分来源，但任务内容、奖励额度、频率与触发规则没有 fixture，因此不伪造可领取任务。</p></Card>
    </>
  );

  if (view === "points") return (
    <>
      <Back onClick={() => go("overview")} />
      <div><p className="text-sm text-[var(--color-text-secondary)]">积分中心</p><h2 className="mt-1 text-2xl font-semibold">{coreDemoUser.pointsBalance} 积分</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">交互只重放 Shared 已有历史流水，不产生新积分，也不修改当前余额。</p></div>
      {earnEntry && <ReplayCard title="积分获取状态演示" state={earnReplay} action={() => setEarnReplay(nextReplay(earnReplay))} text={<>历史流水 <code>{earnEntry.id}</code> · {pointSourceLabels[earnEntry.source]} +{earnEntry.amount} · 当时余额 {earnEntry.balanceAfter}</>} />}
      {exchangeEntry && <ReplayCard secondary title="积分兑换状态演示" state={exchangeReplay} action={() => setExchangeReplay(nextReplay(exchangeReplay))} text={<>历史流水 <code>{exchangeEntry.id}</code> · -{exchangeEntry.amount} · 兑换后余额 {exchangeEntry.balanceAfter}。兑换目标未建模，不补造商品或券。</>} />}
      <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">抵现 / 兑换规则待确认</p><StatusTag tone="warning">Candidate</StatusTag></div><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{prototypeRules.pointsToCash.note}</p><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">抵现、商品 / 券 / 权益兑换、积分加现金、抽奖、权益包均只是候选方向。</p></Card>
      <Section title="积分流水"><div className="space-y-3">{[...memberPoints].reverse().map((entry) => <Card key={entry.id} className="bg-[var(--color-surface-subtle)]"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{pointSourceLabels[entry.source]}</p>{entry.scene && <StatusTag>{businessSceneLabels[entry.scene]}</StatusTag>}</div><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{date(entry.createdAt)} · 余额 {entry.balanceAfter}</p></div><strong>{entry.direction === "earn" ? "+" : "-"}{entry.amount}</strong></div></Card>)}</div></Section>
    </>
  );

  if (view === "coupons") {
    const items = coreUserCoupons.filter((coupon) => coupon.status === couponStatus);
    return (
      <>
        <Back onClick={() => go("overview")} />
        <div><p className="text-sm text-[var(--color-text-secondary)]">我的券</p><h2 className="mt-1 text-2xl font-semibold">优惠券与体验券</h2></div>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="券状态筛选">{couponTabs.map((tab) => <button key={tab.id} type="button" aria-pressed={couponStatus === tab.id} onClick={() => setCouponStatus(tab.id)} className={`min-h-[44px] rounded-[var(--radius-control)] border px-2 text-sm ${couponStatus === tab.id ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)] font-medium" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>{tab.label} · {coreUserCoupons.filter((item) => item.status === tab.id).length}</button>)}</div>
        {items.length ? <div className="space-y-3">{items.map((coupon) => <Card key={coupon.id}><div className="flex flex-wrap items-center gap-2"><StatusTag tone={coupon.kind === "experience" ? "success" : "neutral"}>{coupon.kind === "experience" ? "体验券" : "优惠券"}</StatusTag><StatusTag>{couponStatusLabels[coupon.status]}</StatusTag></div><p className="mt-3 font-semibold">{coupon.title}</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{businessSceneLabels[coupon.scene]} · {coupon.id}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">领取 {date(coupon.claimedAt)}{coupon.expiresAt ? ` · 有效至 ${date(coupon.expiresAt)}` : " · 有效期未提供"}</p></Card>)}</div> : <Card className="bg-[var(--color-surface-subtle)]"><p className="font-medium">当前没有“{couponStatusLabels[couponStatus]}”样例</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Shared 没有这一状态的 LL-8888 券，因此保留真实空态。</p></Card>}
        <Card className="bg-[var(--color-surface-subtle)]"><p className="text-sm leading-6 text-[var(--color-text-secondary)]">Coupon 模型没有减免金额、满减门槛或叠加规则字段，本页不补造券规则。</p></Card>
      </>
    );
  }

  return (
    <>
      <Back onClick={() => go("overview")} />
      <div><p className="text-sm text-[var(--color-text-secondary)]">统一账号记录</p><h2 className="mt-1 text-2xl font-semibold">订单、报告与核销</h2></div>
      <Section title={`我的订单 · ${coreUserOrders.length}`}><div className="space-y-3">{coreUserOrders.map((order) => <Card key={order.id}><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{order.id}</p><StatusTag>{businessSceneLabels[order.scene]}</StatusTag><StatusTag>{orderStatusLabels[order.status]}</StatusTag></div><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{order.items.map((item) => `${item.name} × ${item.quantity}`).join("、")} · ¥{order.amountYuan}</p></Card>)}</div></Section>
      <Section title="检测报告 · 1"><Card><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{coreDemoReport.id}</p><StatusTag tone="success">基础中性结果</StatusTag></div><p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{coreDemoReport.summary}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{coreDemoReport.disclaimer}</p></Card></Section>
      <Section title={`核销记录 · ${memberRedemptions.length}`}><div className="space-y-3">{memberRedemptions.map((record) => <Card key={record.id} className="bg-[var(--color-surface-subtle)]"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{record.code}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{record.targetType} · {record.targetId}</p></div><StatusTag>{redemptionStatusLabels[record.status]}</StatusTag></div></Card>)}</div></Section>
      <Card className="bg-[var(--color-surface-subtle)]"><p className="text-sm leading-6 text-[var(--color-text-secondary)]">这里只汇总 LL-8888 的 Shared 记录，不重复实现 T004-T006 的业务履约流程。</p></Card>
    </>
  );
}
