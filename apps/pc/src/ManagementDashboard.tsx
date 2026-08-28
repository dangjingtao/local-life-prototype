import { useMemo, useState } from "react";
import { Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon, type PrototypeIconName } from "@prototype/icons";
import { getPrototypeView, PrototypePanel, PrototypeState, setPrototypeView } from "@prototype/runtime";
import {
  businessSceneLabels,
  couponStatusLabels,
  coupons,
  membershipLevelLabels,
  orders,
  partners,
  pcDataScopeLabels,
  pointLedger,
  redemptions,
  redemptionStatusLabels,
  stores,
  users,
  type BusinessScene,
  type PcRole,
} from "@prototype/shared";

type DashboardSection = "overview" | "scenes" | "members";

const sceneOrder: BusinessScene[] = ["store", "mall", "care"];
const sectionMeta: Record<DashboardSection, { label: string; description: string; icon: PrototypeIconName }> = {
  overview: { label: "经营总览", description: "用户、合作规模、区域和交易经营。", icon: "home" },
  scenes: { label: "场景分析", description: "线下门店、线上商城、智慧抗衰经营对比。", icon: "modules" },
  members: { label: "会员运营", description: "会员、积分、券与核销汇总。", icon: "profile" },
};

const sectionOrder: DashboardSection[] = ["overview", "scenes", "members"];

function switchRole(role: PcRole) {
  const url = new URL(window.location.href);
  url.searchParams.set("role", role);
  url.searchParams.delete("view");
  window.location.assign(url.toString());
}

function metricCard(label: string, value: string, note: string, pending = false) {
  return <Card key={label} className="min-h-32"><div className="flex items-start justify-between gap-2"><p className="text-sm text-[var(--color-text-secondary)]">{label}</p>{pending && <StatusTag tone="warning">待确认</StatusTag>}</div><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">{note}</p></Card>;
}

function ReadOnlyBoundary() {
  return <Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-start gap-3"><StatusTag tone="warning">管理层只读</StatusTag><p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">驾驶舱仅表达汇总数据价值，不提供用户交易、核销、会员营销配置、导出或钻取操作。当前全部数值来自 V0.1 fixtures，不代表真实实时经营数据。</p></div></Card>;
}

function PermissionState() {
  return <main className="mx-auto max-w-4xl p-5 md:p-8"><Card className="p-6 md:p-8"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]"><PrototypeIcon name="warning" size={22} /></div><div className="min-w-0 flex-1"><StatusTag tone="warning">permission</StatusTag><h2 className="mt-3 text-xl font-semibold">管理层视角不执行经营操作</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前角色只查看平台汇总数据，因此不会提供订单核销、用户交易、会员或营销配置入口。</p><div className="mt-5 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs font-medium text-[var(--color-text-tertiary)]">当前数据范围</p><p className="mt-1 font-medium">{pcDataScopeLabels.platform_summary} · 只读</p><p className="mt-3 text-xs font-medium text-[var(--color-text-tertiary)]">下一步</p><p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">返回驾驶舱继续查看汇总；如需演示业务管理，请切换到“平台运营”。</p></div><SecondaryButton className="mt-5" onClick={() => setPrototypeView("ready")}>返回数据驾驶舱</SecondaryButton></div></div></Card></main>;
}

function OverviewSection() {
  const transactionUserCount = new Set(orders.map((order) => order.userId)).size;
  const totalAmount = orders.reduce((sum, order) => sum + order.amountYuan, 0);
  const regions = useMemo(() => Array.from(new Set(partners.map((partner) => partner.region))), []);
  const orderDates = useMemo(() => Array.from(new Set(orders.map((order) => order.createdAt.slice(0, 10)))).sort(), []);
  const dailyTrend = orderDates.map((date) => {
    const dateOrders = orders.filter((order) => order.createdAt.startsWith(date));
    return {
      date,
      count: dateOrders.length,
      amount: dateOrders.reduce((sum, order) => sum + order.amountYuan, 0),
    };
  });
  const maxDailyAmount = Math.max(...dailyTrend.map((item) => item.amount), 1);

  return <><section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]"><div className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-6 text-white md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><StatusTag>FR-701 · FR-704</StatusTag><span className="text-xs text-white/65">平台汇总数据 · 只读</span></div><h2 className="mt-6 max-w-2xl text-2xl font-semibold md:text-3xl">看规模、覆盖和交易，不把样本包装成实时经营。</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">累计用户、合作商、门店、区域、订单和交易额均直接由当前共享 fixtures 汇总。新增用户缺少用户创建时间，因此明确保留为待确认口径。</p></div><Card className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">统计说明</h3><StatusTag tone="warning">口径待确认</StatusTag></div><div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]"><p><strong className="text-[var(--color-text-primary)]">样本区间：</strong>{orderDates[0] ?? "无订单日期"} 至 {orderDates.at(-1) ?? "无订单日期"}</p><p><strong className="text-[var(--color-text-primary)]">正式周期：</strong>日 / 周 / 月及同比环比规则尚未确认。</p><p><strong className="text-[var(--color-text-primary)]">数据性质：</strong>仅用于 V0.1 信息结构演示，不代表生产数据。</p></div></Card></section><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricCard("累计用户", String(users.length), "共享用户 fixtures 总量")}{metricCard("新增用户", "—", "缺少用户创建时间，不能可靠计算", true)}{metricCard("交易用户", String(transactionUserCount), "存在演示订单的去重用户")}{metricCard("合作商 / 门店", `${partners.length} / ${stores.length}`, "合作主体与覆盖门店")}{metricCard("覆盖区域", String(regions.length), regions.join("、") || "暂无区域")}{metricCard("订单数", String(orders.length), "三大场景演示订单合计")}{metricCard("演示交易额", `¥${totalAmount}`, "按当前订单 amountYuan 求和")}{metricCard("核销记录", String(redemptions.length), `${redemptions.filter((item) => item.status === "pending").length} 待核销 · ${redemptions.filter((item) => item.status === "completed").length} 已核销`)}</div><div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]"><Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-[var(--color-text-tertiary)]">FR-704 · 演示趋势</p><h3 className="mt-1 font-semibold">样本交易趋势</h3></div><StatusTag>仅 {dailyTrend.length} 个订单日期</StatusTag></div><div className="mt-6 space-y-5">{dailyTrend.map((item) => <div key={item.date}><div className="flex items-center justify-between gap-4 text-sm"><span>{item.date}</span><strong>¥{item.amount} · {item.count} 单</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.max((item.amount / maxDailyAmount) * 100, 8)}%` }} /></div></div>)}</div><p className="mt-5 text-xs leading-5 text-[var(--color-text-tertiary)]">趋势只按当前订单 createdAt 聚合，不外推历史增长，也不计算同比 / 环比。</p></Card><Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-[var(--color-text-tertiary)]">FR-703</p><h3 className="mt-1 font-semibold">区域覆盖</h3></div><StatusTag>{regions.length} 个区域</StatusTag></div><div className="mt-5 space-y-3">{regions.map((region) => { const regionPartners = partners.filter((partner) => partner.region === region); const partnerIds = new Set(regionPartners.map((partner) => partner.id)); const regionStores = stores.filter((store) => partnerIds.has(store.partnerId)); return <div key={region} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><div className="flex items-center justify-between gap-3"><strong>{region}</strong><span className="text-sm text-[var(--color-text-secondary)]">{regionStores.length} 店</span></div><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{regionPartners.length} 个合作商 / 载体</p></div>; })}</div><p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">当前数据只有区域字段，没有经纬度或行政区层级，因此不伪造地图分布。</p></Card></div><Section title="交易行为样本"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricCard("订单记录", String(orders.length), "购买 / 服务交易")}{metricCard("核销记录", String(redemptions.length), "自提与体验 / 服务凭证")}{metricCard("券资产", String(coupons.length), "优惠券与体验券")}{metricCard("积分流水", String(pointLedger.length), "当前共享数据已建模流水")}</div></Section><ReadOnlyBoundary /></>;
}

function ScenesSection() {
  const totalAmount = orders.reduce((sum, order) => sum + order.amountYuan, 0) || 1;
  const summaries = sceneOrder.map((scene) => {
    const sceneOrders = orders.filter((order) => order.scene === scene);
    const sceneAmount = sceneOrders.reduce((sum, order) => sum + order.amountYuan, 0);
    const sceneRedemptions = redemptions.filter((record) => {
      if (record.targetType === "order") return sceneOrders.some((order) => order.id === record.targetId);
      if (record.targetType === "coupon") return coupons.some((coupon) => coupon.id === record.targetId && coupon.scene === scene);
      return scene === "care";
    });
    return {
      scene,
      sourceUsers: users.filter((user) => user.source === scene).length,
      orders: sceneOrders.length,
      amount: sceneAmount,
      redemptions: sceneRedemptions.length,
      coupons: coupons.filter((coupon) => coupon.scene === scene).length,
      share: Math.round((sceneAmount / totalAmount) * 100),
    };
  });

  return <><Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-start gap-3"><StatusTag>FR-705</StatusTag><p className="text-sm leading-6 text-[var(--color-text-secondary)]">三个场景使用同一批共享 fixtures 汇总；“来源用户”只表示用户 source 字段，不等同于该场景全部活跃用户。</p></div></Card><div className="grid gap-4 xl:grid-cols-3">{summaries.map((item) => <Card key={item.scene} className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{businessSceneLabels[item.scene]}</h3><StatusTag>{item.share}% 交易额占比</StatusTag></div><p className="mt-5 text-3xl font-semibold">¥{item.amount}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">演示交易额</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 text-sm"><div><strong className="block text-lg">{item.orders}</strong><span className="text-xs text-[var(--color-text-tertiary)]">订单</span></div><div><strong className="block text-lg">{item.sourceUsers}</strong><span className="text-xs text-[var(--color-text-tertiary)]">来源用户</span></div><div><strong className="block text-lg">{item.redemptions}</strong><span className="text-xs text-[var(--color-text-tertiary)]">核销</span></div><div><strong className="block text-lg">{item.coupons}</strong><span className="text-xs text-[var(--color-text-tertiary)]">券 / 体验券</span></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.max(item.share, 6)}%` }} /></div></Card>)}</div><Section title="三场景横向比较"><Card className="overflow-x-auto p-0"><div className="min-w-[760px]"><div className="grid grid-cols-[1.3fr_repeat(3,1fr)] border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)]"><span>指标</span>{summaries.map((item) => <span key={item.scene}>{businessSceneLabels[item.scene]}</span>)}</div>{[
      ["来源用户", ...summaries.map((item) => String(item.sourceUsers))],
      ["订单数", ...summaries.map((item) => String(item.orders))],
      ["演示交易额", ...summaries.map((item) => `¥${item.amount}`)],
      ["核销记录", ...summaries.map((item) => String(item.redemptions))],
      ["券 / 体验券", ...summaries.map((item) => String(item.coupons))],
    ].map((row) => <div key={row[0]} className="grid grid-cols-[1.3fr_repeat(3,1fr)] border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0"><strong>{row[0]}</strong>{row.slice(1).map((value, index) => <span key={`${row[0]}-${sceneOrder[index]}`} className="text-[var(--color-text-secondary)]">{value}</span>)}</div>)}</div></Card></Section><ReadOnlyBoundary /></>;
}

function MembersSection() {
  const levels = ["standard", "silver", "gold", "black", "black_gold"] as const;
  const earnedPoints = pointLedger.filter((entry) => entry.direction === "earn").reduce((sum, entry) => sum + entry.amount, 0);
  const spentPoints = pointLedger.filter((entry) => entry.direction === "spend").reduce((sum, entry) => sum + entry.amount, 0);
  const totalBalance = users.reduce((sum, user) => sum + user.pointsBalance, 0);
  const couponStatuses = ["available", "used", "expired"] as const;
  const redemptionStatuses = ["pending", "completed", "cancelled"] as const;

  return <><Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-start gap-3"><StatusTag tone="warning">FR-706 · 候选规则</StatusTag><p className="text-sm leading-6 text-[var(--color-text-secondary)]">会员等级名称来自候选方案；等级门槛、积分比例、有效期和权益成本承担机制仍待确认。这里只汇总当前 fixtures，不据此定义运营规则。</p></div></Card><div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]"><Card className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">会员结构</h3><StatusTag>{users.length} 位演示用户</StatusTag></div><div className="mt-5 space-y-3">{levels.map((level) => { const count = users.filter((user) => user.member.level === level).length; const percentage = users.length ? Math.round((count / users.length) * 100) : 0; return <div key={level}><div className="flex items-center justify-between gap-3 text-sm"><span>{membershipLevelLabels[level]}</span><strong>{count} · {percentage}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: count ? `${Math.max(percentage, 6)}%` : "0%" }} /></div></div>; })}</div></Card><Card className="p-5"><h3 className="font-semibold">积分汇总</h3><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs text-[var(--color-text-tertiary)]">当前余额合计</p><p className="mt-2 text-2xl font-semibold">{totalBalance}</p></div><div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs text-[var(--color-text-tertiary)]">已建模流水</p><p className="mt-2 text-2xl font-semibold">{pointLedger.length}</p></div><div className="rounded-[var(--radius-container)] bg-[var(--color-success-bg)] p-4"><p className="text-xs text-[var(--color-success)]">流水发放</p><p className="mt-2 text-2xl font-semibold">+{earnedPoints}</p></div><div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs text-[var(--color-text-tertiary)]">流水消耗</p><p className="mt-2 text-2xl font-semibold">-{spentPoints}</p></div></div><p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">积分余额覆盖全部演示用户；当前 pointLedger 只建模部分用户流水，因此两者不做余额勾稽结论。</p></Card></div><div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">券状态</h3><StatusTag>{coupons.length} 张</StatusTag></div><div className="mt-5 grid grid-cols-3 gap-3">{couponStatuses.map((status) => <div key={status} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3 text-center"><strong className="block text-xl">{coupons.filter((coupon) => coupon.status === status).length}</strong><span className="mt-1 block text-xs text-[var(--color-text-tertiary)]">{couponStatusLabels[status]}</span></div>)}</div></Card><Card className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">核销状态</h3><StatusTag>{redemptions.length} 条</StatusTag></div><div className="mt-5 grid grid-cols-3 gap-3">{redemptionStatuses.map((status) => <div key={status} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3 text-center"><strong className="block text-xl">{redemptions.filter((item) => item.status === status).length}</strong><span className="mt-1 block text-xs text-[var(--color-text-tertiary)]">{redemptionStatusLabels[status]}</span></div>)}</div></Card></div><ReadOnlyBoundary /></>;
}

function DashboardContent({ section }: { section: DashboardSection }) {
  if (section === "overview") return <OverviewSection />;
  if (section === "scenes") return <ScenesSection />;
  return <MembersSection />;
}

export function ManagementDashboard() {
  const view = getPrototypeView();
  const [section, setSection] = useState<DashboardSection>("overview");
  const current = sectionMeta[section];

  return <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]"><aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex lg:flex-col"><div><p className="text-xs font-semibold tracking-wide text-[var(--color-primary)]">LOCAL LIFE · V0.1</p><h1 className="mt-1 text-xl font-semibold">本地生活</h1><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">数据驾驶舱 · 概念原型</p></div><div className="mt-7"><p className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">概念角色</p><div className="space-y-1">{(["merchant", "operator", "management"] as PcRole[]).map((role) => <button key={role} type="button" onClick={() => role === "management" ? setSection("overview") : switchRole(role)} className={`min-h-10 w-full rounded-[var(--radius-control)] px-3 text-left text-sm ${role === "management" ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}>{role === "merchant" ? "店主 / 合作商" : role === "operator" ? "平台运营" : "平台管理层"}</button>)}</div></div><nav className="mt-7 space-y-1">{sectionOrder.map((item) => <button key={item} type="button" onClick={() => setSection(item)} className={`flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm ${section === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}><PrototypeIcon name={sectionMeta[item].icon} size={18} />{sectionMeta[item].label}</button>)}</nav><div className="mt-auto border-t border-[var(--color-border)] pt-4"><StatusTag tone="success">平台汇总数据 · 只读</StatusTag><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">指标定义、统计周期和正式数据权限仍待确认；不提供经营写入入口。</p></div></aside><div className="min-w-0 flex-1"><header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 md:px-8"><div className="flex min-h-12 flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{current.label}</h2><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">平台管理层 · {pcDataScopeLabels.platform_summary} · {current.description}</p></div><div className="flex flex-wrap items-center gap-2"><StatusTag tone="warning">模拟数据</StatusTag><StatusTag tone="warning">周期待确认</StatusTag><StatusTag tone="success">只读</StatusTag></div></div><div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">{sectionOrder.map((item) => <button key={item} type="button" onClick={() => setSection(item)} className={`shrink-0 rounded-[var(--radius-control)] px-3 py-2 text-sm ${section === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)]"}`}>{sectionMeta[item].label}</button>)}</div></header>{view === "permission" ? <PermissionState /> : <PrototypeState view={view}><main className="mx-auto max-w-7xl space-y-7 p-5 md:p-8"><DashboardContent section={section} /></main></PrototypeState>}</div><PrototypePanel /></div>;
}
