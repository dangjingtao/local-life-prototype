import { useState } from "react";
import { Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import { getPrototypeView, PrototypePanel, PrototypeState, setPrototypeView } from "@prototype/runtime";
import {
  CORE_DEMO_IDS,
  businessSceneLabels,
  coupons,
  coreDemoStore,
  membershipLevelLabels,
  orderStatusLabels,
  orders,
  partners,
  pcDataScopeLabels,
  pcRoleLabels,
  redemptions,
  redemptionStatusLabels,
  services,
  users,
  type PcDataScope,
  type PcRole,
  type RedemptionRecord,
} from "@prototype/shared";

type Page = "workspace" | "stores" | "orders" | "members" | "dashboard";
type IconName = "home" | "modules" | "profile" | "settings";
type RedemptionOverrides = Partial<Record<string, "completed">>;

interface RoleConfig {
  scope: PcDataScope;
  scopeDetail: string;
  description: string;
  defaultPage: Page;
  nav: Page[];
  capabilities: string[];
  restrictions: string[];
  task: "T009" | "T010" | "T011";
}

const pageCatalog: Record<Page, { label: string; description: string; icon: IconName }> = {
  workspace: { label: "工作台", description: "当前角色的能力边界与模块入口。", icon: "home" },
  stores: { label: "合作商与门店", description: "合作商、载体、门店与业务能力的管理入口。", icon: "modules" },
  orders: { label: "订单与核销", description: "订单、自提、配送和服务核销的概念入口。", icon: "modules" },
  members: { label: "门店用户", description: "仅查看当前门店业务关联用户与基础经营信息。", icon: "profile" },
  dashboard: { label: "数据驾驶舱", description: "平台经营汇总、覆盖范围与场景对比的只读入口。", icon: "settings" },
};

const roleOrder: PcRole[] = ["merchant", "operator", "management"];

const roleConfig: Record<PcRole, RoleConfig> = {
  merchant: {
    scope: "assigned_store",
    scopeDetail: `${coreDemoStore.name} · ${coreDemoStore.id}`,
    description: "处理所属门店业务，只查看本合作商或本门店授权数据。",
    defaultPage: "workspace",
    nav: ["workspace", "orders", "members"],
    capabilities: ["门店经营概览", "待自提与服务核销", "门店用户与经营信息"],
    restrictions: ["其他合作商 / 门店明细", "平台级用户与营销管理", "全局经营驾驶舱"],
    task: "T009",
  },
  operator: {
    scope: "authorized_platform",
    scopeDetail: "平台运营 · V0.1 授权业务范围",
    description: "管理授权范围内的用户、合作商、商品服务、订单与会员营销结构。",
    defaultPage: "workspace",
    nav: ["workspace", "stores", "orders", "members"],
    capabilities: ["合作商与门店管理", "订单与核销管理", "用户会员与营销管理"],
    restrictions: ["超出授权范围的数据", "未确认业务规则的生产配置", "管理层专属汇总视角"],
    task: "T010",
  },
  management: {
    scope: "platform_summary",
    scopeDetail: "平台汇总数据 · 只读",
    description: "查看平台经营汇总，不直接操作用户交易、核销或业务配置。",
    defaultPage: "dashboard",
    nav: ["dashboard"],
    capabilities: ["全局经营总览", "区域与合作规模", "三大业务场景对比"],
    restrictions: ["用户交易操作", "订单 / 服务核销", "会员与营销配置"],
    task: "T011",
  },
};

const merchantOrders = orders.filter((order) => order.storeId === CORE_DEMO_IDS.store);
const merchantRedemptions = redemptions.filter((redemption) => redemption.storeId === CORE_DEMO_IDS.store);
const merchantUserIds = new Set([
  ...merchantOrders.map((order) => order.userId),
  ...merchantRedemptions.map((redemption) => redemption.userId),
]);
const merchantUsers = users.filter((user) => merchantUserIds.has(user.id));
const merchantPartner = partners.find((partner) => partner.id === coreDemoStore.partnerId);

function readInitialRole(): PcRole {
  if (typeof window === "undefined") return "operator";
  const value = new URLSearchParams(window.location.search).get("role") as PcRole | null;
  return value && roleOrder.includes(value) ? value : "operator";
}

function getUserName(userId: string) {
  return users.find((user) => user.id === userId)?.displayName ?? userId;
}

function effectiveRedemptionStatus(record: RedemptionRecord, overrides: RedemptionOverrides) {
  return overrides[record.id] ?? record.status;
}

function redemptionTargetLabel(record: RedemptionRecord) {
  if (record.targetType === "order") {
    const order = orders.find((item) => item.id === record.targetId);
    return order ? `${order.id} · ${order.items.map((item) => item.name).join("、")}` : record.targetId;
  }
  if (record.targetType === "coupon") {
    return coupons.find((coupon) => coupon.id === record.targetId)?.title ?? record.targetId;
  }
  return services.find((service) => service.id === record.targetId)?.name ?? record.targetId;
}

function RoleSwitcher({ role, onChange, compact = false }: { role: PcRole; onChange: (role: PcRole) => void; compact?: boolean }) {
  return <div className={compact ? "flex gap-1 overflow-x-auto" : "space-y-1"}>{roleOrder.map((item) => <button key={item} type="button" aria-pressed={role === item} onClick={() => onChange(item)} className={`${compact ? "shrink-0 px-3" : "w-full px-3 text-left"} min-h-10 rounded-[var(--radius-control)] text-sm transition ${role === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}>{pcRoleLabels[item]}</button>)}</div>;
}

function PermissionState({ role }: { role: PcRole }) {
  const config = roleConfig[role];
  const reason = role === "merchant"
    ? `当前角色仅授权${coreDemoStore.name}，不能查看其他门店或平台级明细。`
    : role === "operator"
      ? "当前模拟请求超出平台运营的授权业务范围，因此不展示目标数据。"
      : "平台管理层仅查看汇总数据，不具备用户交易、核销或业务配置权限。";
  const next = role === "merchant"
    ? "返回本店工作台；如需演示跨门店运营，请切换到“平台运营”。真实权限申请流程不在 V0.1 范围。"
    : role === "operator"
      ? "返回当前运营工作台，或切换到“平台管理层”查看只读汇总；真实授权审批不在 V0.1 范围。"
      : "返回数据驾驶舱；如需演示业务处理，请切换到“平台运营”。";

  return <main className="mx-auto max-w-4xl p-5 md:p-8"><Card className="p-6 md:p-8"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]"><PrototypeIcon name="warning" size={22} /></div><div className="min-w-0 flex-1"><StatusTag tone="warning">permission</StatusTag><h2 className="mt-3 text-xl font-semibold">当前范围没有访问权限</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{reason}</p><div className="mt-5 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs font-medium text-[var(--color-text-tertiary)]">当前数据范围</p><p className="mt-1 font-medium">{pcDataScopeLabels[config.scope]} · {config.scopeDetail}</p><p className="mt-3 text-xs font-medium text-[var(--color-text-tertiary)]">下一步</p><p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{next}</p></div><SecondaryButton className="mt-5" onClick={() => setPrototypeView("ready")}>返回当前角色工作台</SecondaryButton></div></div></Card></main>;
}

function GenericRoleWorkspace({ role, onNavigate }: { role: PcRole; onNavigate: (page: Page) => void }) {
  const config = roleConfig[role];
  const modulePages = config.nav.filter((page) => page !== "workspace");
  return <><section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]"><div className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-6 text-white md:p-7"><StatusTag>{pcRoleLabels[role]}</StatusTag><h2 className="mt-6 text-2xl font-semibold md:text-3xl">统一运营，但只在授权范围内操作。</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{config.description}</p><div className="mt-6 border-t border-white/15 pt-4 text-sm"><span className="text-white/60">当前范围</span><strong className="ml-3 font-medium">{config.scopeDetail}</strong></div></div><Card className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">权限边界</h3><StatusTag tone="success">已建立</StatusTag></div><p className="mt-4 text-xs font-medium text-[var(--color-text-tertiary)]">可访问</p><ul className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]">{config.capabilities.map((item) => <li key={item} className="flex gap-2"><span className="text-[var(--color-success)]">✓</span>{item}</li>)}</ul><p className="mt-4 text-xs font-medium text-[var(--color-text-tertiary)]">不可访问</p><ul className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]">{config.restrictions.map((item) => <li key={item} className="flex gap-2"><span className="text-[var(--color-warning)]">—</span>{item}</li>)}</ul></Card></section><Section title="当前角色模块"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{modulePages.map((page) => { const item = pageCatalog[page]; return <button key={page} type="button" onClick={() => onNavigate(page)} className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary)]"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name={item.icon} size={19} /></div><span className="text-sm font-medium text-[var(--color-primary-pressed)]">进入 →</span></div><h3 className="mt-4 font-semibold">{item.label}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.description}</p></button>; })}</div></Section></>;
}

function MerchantOverview({ onNavigate, onPermission, overrides }: { onNavigate: (page: Page) => void; onPermission: () => void; overrides: RedemptionOverrides }) {
  const pendingPickup = merchantOrders.filter((order) => order.status === "pending_pickup").length;
  const pendingRedemptions = merchantRedemptions.filter((record) => effectiveRedemptionStatus(record, overrides) === "pending").length;
  const orderAmount = merchantOrders.reduce((sum, order) => sum + order.amountYuan, 0);
  const metrics = [
    { label: "本店演示订单", value: String(merchantOrders.length), note: "仅当前授权门店" },
    { label: "待自提", value: String(pendingPickup), note: `含 ${CORE_DEMO_IDS.pickupOrder}` },
    { label: "待核销", value: String(pendingRedemptions), note: "自提 / 体验凭证" },
    { label: "演示交易额", value: `¥${orderAmount}`, note: "非真实经营数据" },
  ];

  return <><section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]"><div className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-6 text-white md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><StatusTag>店主 / 合作商</StatusTag><span className="text-xs text-white/65">FR-501 · FR-504</span></div><h2 className="mt-6 text-2xl font-semibold md:text-3xl">{coreDemoStore.name}经营工作台</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">处理本店订单、自提与服务核销，并查看与本店业务直接关联的用户。其他门店明细不会进入当前视图。</p><div className="mt-6 grid gap-3 border-t border-white/15 pt-4 text-sm sm:grid-cols-2"><div><span className="text-white/55">合作商</span><strong className="mt-1 block font-medium">{merchantPartner?.name ?? coreDemoStore.partnerId}</strong></div><div><span className="text-white/55">门店范围</span><strong className="mt-1 block font-medium">{coreDemoStore.id} · {coreDemoStore.address}</strong></div></div></div><Card className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">当前授权</h3><StatusTag tone="success">仅本店</StatusTag></div><p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{pcDataScopeLabels.assigned_store}：{coreDemoStore.name}</p><div className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)]"><p>✓ 可查看本店订单、核销和关联用户</p><p>— 不展示南岸生活馆等其他门店明细</p></div><SecondaryButton className="mt-5 w-full" onClick={onPermission}>演示越权状态</SecondaryButton></Card></section><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Card key={metric.label}><p className="text-sm text-[var(--color-text-secondary)]">{metric.label}</p><p className="mt-3 text-2xl font-semibold">{metric.value}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{metric.note}</p></Card>)}</div><Section title="快捷处理"><div className="grid gap-4 lg:grid-cols-2"><button type="button" onClick={() => onNavigate("orders")} className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary)]"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="modules" size={19} /></div><StatusTag tone="warning">{pendingPickup + pendingRedemptions} 待处理</StatusTag></div><h3 className="mt-4 font-semibold">自提与服务核销</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">核对提货码 / 体验凭证，在原型内完成核销状态演示。</p><p className="mt-4 text-sm font-medium text-[var(--color-primary-pressed)]">进入处理 →</p></button><button type="button" onClick={() => onNavigate("members")} className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary)]"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="profile" size={19} /></div><StatusTag>{merchantUsers.length} 位关联用户</StatusTag></div><h3 className="mt-4 font-semibold">门店用户概览</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">仅查看与本店订单、体验或核销发生关联的演示用户。</p><p className="mt-4 text-sm font-medium text-[var(--color-primary-pressed)]">查看本店用户 →</p></button></div></Section></>;
}

function RedemptionActionCard({ title, record, overrides, onComplete }: { title: string; record: RedemptionRecord; overrides: RedemptionOverrides; onComplete: (id: string) => void }) {
  const status = effectiveRedemptionStatus(record, overrides);
  const completed = status === "completed";
  return <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium text-[var(--color-text-tertiary)]">{title}</p><h3 className="mt-1 text-lg font-semibold">{redemptionTargetLabel(record)}</h3></div><StatusTag tone={completed ? "success" : "warning"}>{redemptionStatusLabels[status]}</StatusTag></div><div className="mt-5 grid gap-3 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-[var(--color-text-tertiary)]">用户</p><p className="mt-1 font-medium">{getUserName(record.userId)} · {record.userId}</p></div><div><p className="text-xs text-[var(--color-text-tertiary)]">凭证码</p><p className="mt-1 font-medium">{record.code}</p></div><div><p className="text-xs text-[var(--color-text-tertiary)]">门店</p><p className="mt-1 font-medium">{coreDemoStore.name}</p></div><div><p className="text-xs text-[var(--color-text-tertiary)]">目标类型</p><p className="mt-1 font-medium">{record.targetType === "order" ? "自提订单" : record.targetType === "coupon" ? "体验券" : "服务"}</p></div></div><p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">当前按钮只修改本次原型演示状态，不代表真实扫码、库存、财务或后端核销已经接入。</p><SecondaryButton className="mt-4 w-full" disabled={completed} onClick={() => onComplete(record.id)}>{completed ? "本次演示已核销" : `确认${title}`}</SecondaryButton></Card>;
}

function MerchantOrders({ overrides, onComplete, onReset }: { overrides: RedemptionOverrides; onComplete: (id: string) => void; onReset: () => void }) {
  const pickupRecord = merchantRedemptions.find((record) => record.targetType === "order" && record.targetId === CORE_DEMO_IDS.pickupOrder);
  const careRecord = merchantRedemptions.find((record) => record.id === CORE_DEMO_IDS.careRedemption);
  const hasOverrides = Object.keys(overrides).length > 0;

  return <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--color-text-secondary)]">{coreDemoStore.name} · FR-502 / FR-503</p><h2 className="mt-1 text-2xl font-semibold">自提与服务核销</h2></div>{hasOverrides && <SecondaryButton onClick={onReset}>重置核销演示</SecondaryButton>}</div><div className="grid gap-4 xl:grid-cols-2">{pickupRecord && <RedemptionActionCard title="自提核销" record={pickupRecord} overrides={overrides} onComplete={onComplete} />}{careRecord && <RedemptionActionCard title="服务核销" record={careRecord} overrides={overrides} onComplete={onComplete} />}</div><Section title="本店订单"><Card className="overflow-hidden p-0"><div className="hidden grid-cols-[1fr_1fr_1fr_1fr] gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] md:grid"><span>订单 / 场景</span><span>用户</span><span>商品 / 服务</span><span>金额 / 状态</span></div>{merchantOrders.map((order) => <div key={order.id} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 md:grid-cols-[1fr_1fr_1fr_1fr] md:gap-4"><div><strong className="block">{order.id}</strong><span className="mt-1 block text-xs text-[var(--color-text-tertiary)]">{businessSceneLabels[order.scene]}</span></div><div><span className="md:hidden text-xs text-[var(--color-text-tertiary)]">用户 · </span>{getUserName(order.userId)} · {order.userId}</div><div className="text-[var(--color-text-secondary)]">{order.items.map((item) => item.name).join("、")}</div><div><strong>¥{order.amountYuan}</strong><StatusTag tone={order.status === "completed" ? "success" : "warning"}>{orderStatusLabels[order.status]}</StatusTag></div></div>)}</Card></Section><Section title="核销记录"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{merchantRedemptions.map((record) => { const status = effectiveRedemptionStatus(record, overrides); return <Card key={record.id}><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{record.code}</p><StatusTag tone={status === "completed" ? "success" : "warning"}>{redemptionStatusLabels[status]}</StatusTag></div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">{redemptionTargetLabel(record)}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{getUserName(record.userId)} · {record.userId}</p></Card>; })}</div></Section></>;
}

function MerchantMembers({ onPermission }: { onPermission: () => void }) {
  return <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--color-text-secondary)]">{coreDemoStore.name} · FR-501 / FR-504</p><h2 className="mt-1 text-2xl font-semibold">门店用户概览</h2></div><SecondaryButton onClick={onPermission}>尝试查看其他门店</SecondaryButton></div><Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-center gap-2"><StatusTag tone="success">范围过滤已生效</StatusTag><p className="text-sm text-[var(--color-text-secondary)]">这里仅展示与 {coreDemoStore.name} 的订单、体验或核销发生关联的用户，不是平台用户总表。</p></div></Card><div className="grid gap-4 lg:grid-cols-2">{merchantUsers.map((user) => { const userOrders = merchantOrders.filter((order) => order.userId === user.id); const userRedemptions = merchantRedemptions.filter((record) => record.userId === user.id); return <Card key={user.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{user.displayName}</h3><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">统一用户 ID · {user.id}</p></div><StatusTag>{membershipLevelLabels[user.member.level]}</StatusTag></div><div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-4 text-center"><div><strong className="block">{userOrders.length}</strong><small className="text-xs text-[var(--color-text-tertiary)]">本店订单</small></div><div><strong className="block">{userRedemptions.length}</strong><small className="text-xs text-[var(--color-text-tertiary)]">本店核销</small></div><div><strong className="block">{user.pointsBalance}</strong><small className="text-xs text-[var(--color-text-tertiary)]">积分余额</small></div></div><p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">会员等级和积分来自统一账号演示数据；店主视图不提供平台级会员规则配置。</p></Card>; })}</div></>;
}

function ModuleShell({ role, page }: { role: PcRole; page: Exclude<Page, "workspace" | "dashboard"> }) {
  const config = roleConfig[role];
  const item = pageCatalog[page];
  return <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--color-text-secondary)]">{pcRoleLabels[role]} · {pcDataScopeLabels[config.scope]}</p><h2 className="mt-1 text-2xl font-semibold">{item.label}</h2></div><StatusTag>{config.task} 继续施工</StatusTag></div><Card className="p-6"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name={item.icon} size={20} /></div><div><h3 className="font-semibold">页面容器与权限范围已经建立</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">{item.description} 当前仅验证 PC 信息架构、角色入口和数据范围，不把后续业务详情包装成已经完成。</p><div className="mt-4 flex flex-wrap gap-2"><StatusTag tone="success">角色可见性已限制</StatusTag><StatusTag>范围：{config.scopeDetail}</StatusTag><StatusTag tone="warning">真实 RBAC 未接入</StatusTag></div></div></div></Card></>;
}

function DashboardShell() {
  return <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--color-text-secondary)]">平台管理层 · 汇总数据只读</p><h2 className="mt-1 text-2xl font-semibold">数据驾驶舱</h2></div><StatusTag tone="warning">指标口径待确认</StatusTag></div><div className="grid gap-4 lg:grid-cols-3">{["全局经营总览", "区域与合作规模", "三大场景经营对比"].map((title) => <Card key={title} className="min-h-40 p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">{title}</h3><StatusTag>T011</StatusTag></div><p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">本卡只建立管理层入口与只读边界；模拟指标、趋势和场景对比由 T011 完成。</p></Card>)}</div><Card><p className="text-sm font-medium">管理层操作边界</p><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">不提供用户交易、核销、会员营销配置等业务操作入口，避免把驾驶舱误解为运营工作台。</p></Card></>;
}

export function App() {
  const view = getPrototypeView();
  const initialRole = readInitialRole();
  const [role, setRole] = useState<PcRole>(initialRole);
  const [page, setPage] = useState<Page>(roleConfig[initialRole].defaultPage);
  const [redemptionOverrides, setRedemptionOverrides] = useState<RedemptionOverrides>({});
  const config = roleConfig[role];
  const current = pageCatalog[page];

  const changeRole = (nextRole: PcRole) => {
    setRole(nextRole);
    setPage(roleConfig[nextRole].defaultPage);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("role", nextRole);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const completeRedemption = (id: string) => {
    setRedemptionOverrides((currentOverrides) => ({ ...currentOverrides, [id]: "completed" }));
  };

  const showPermission = () => setPrototypeView("permission");

  return <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]"><aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex lg:flex-col"><div><p className="text-xs font-semibold tracking-wide text-[var(--color-primary)]">LOCAL LIFE · V0.1</p><h1 className="mt-1 text-xl font-semibold">本地生活</h1><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">PC 私域经营中台概念原型</p></div><div className="mt-7"><p className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">概念角色</p><RoleSwitcher role={role} onChange={changeRole} /></div><nav className="mt-7 space-y-1">{config.nav.map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={`flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm ${page === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}><PrototypeIcon name={pageCatalog[item].icon} size={18} />{pageCatalog[item].label}</button>)}</nav><div className="mt-auto border-t border-[var(--color-border)] pt-4"><StatusTag tone="success">范围已标识</StatusTag><p className="mt-2 text-xs font-medium">{config.scopeDetail}</p><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">真实 RBAC、登录、组织架构未接入；店主端最终形态仍待确认。</p></div></aside><div className="min-w-0 flex-1"><header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 md:px-8"><div className="flex min-h-12 flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{current.label}</h2><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{pcRoleLabels[role]} · {pcDataScopeLabels[config.scope]} · {config.scopeDetail}</p></div><div className="flex items-center gap-2"><StatusTag>{pcRoleLabels[role]}</StatusTag><StatusTag tone="success">模拟权限</StatusTag></div></div><div className="mt-3 lg:hidden"><RoleSwitcher role={role} onChange={changeRole} compact /></div></header><div className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 lg:hidden">{config.nav.map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={`shrink-0 rounded-[var(--radius-control)] px-3 py-2 text-sm ${page === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)]"}`}>{pageCatalog[item].label}</button>)}</div>{view === "permission" ? <PermissionState role={role} /> : <PrototypeState view={view}><main className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">{page === "workspace" && role === "merchant" && <MerchantOverview onNavigate={setPage} onPermission={showPermission} overrides={redemptionOverrides} />}{page === "workspace" && role !== "merchant" && <GenericRoleWorkspace role={role} onNavigate={setPage} />}{page === "orders" && role === "merchant" && <MerchantOrders overrides={redemptionOverrides} onComplete={completeRedemption} onReset={() => setRedemptionOverrides({})} />}{page === "members" && role === "merchant" && <MerchantMembers onPermission={showPermission} />}{page === "dashboard" && <DashboardShell />}{page !== "workspace" && page !== "dashboard" && role !== "merchant" && <ModuleShell role={role} page={page} />}<Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-center gap-2"><StatusTag>V0.1 边界</StatusTag><span className="text-sm text-[var(--color-text-secondary)]">真实扫码、支付、库存、退款、财务结算与生产级权限均未接入；未确认能力继续保持待确认。</span></div></Card></main></PrototypeState>}</div><PrototypePanel /></div>;
}
