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
  type PcRole,
  type RedemptionRecord,
} from "@prototype/shared";

type Page = "workspace" | "orders" | "members";
type RedemptionOverrides = Partial<Record<string, "completed">>;

const pageCatalog: Record<Page, { label: string; icon: "home" | "modules" | "profile" }> = {
  workspace: { label: "工作台", icon: "home" },
  orders: { label: "订单与核销", icon: "modules" },
  members: { label: "门店用户", icon: "profile" },
};

const merchantOrders = orders.filter((order) => order.storeId === CORE_DEMO_IDS.store);
const merchantRedemptions = redemptions.filter((redemption) => redemption.storeId === CORE_DEMO_IDS.store);
const merchantUserIds = new Set([
  ...merchantOrders.map((order) => order.userId),
  ...merchantRedemptions.map((redemption) => redemption.userId),
]);
const merchantUsers = users.filter((user) => merchantUserIds.has(user.id));
const merchantPartner = partners.find((partner) => partner.id === coreDemoStore.partnerId);

function switchPcRole(role: PcRole) {
  if (role === "merchant") return;
  const url = new URL(window.location.href);
  url.searchParams.set("role", role);
  url.searchParams.delete("view");
  window.location.assign(url.toString());
}

function RoleSwitcher() {
  const roles: PcRole[] = ["merchant", "operator", "management"];
  return <div className="space-y-1">{roles.map((role) => <button key={role} type="button" aria-pressed={role === "merchant"} onClick={() => switchPcRole(role)} className={`min-h-10 w-full rounded-[var(--radius-control)] px-3 text-left text-sm transition ${role === "merchant" ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}>{pcRoleLabels[role]}</button>)}</div>;
}

function CompactRoleSwitcher() {
  const roles: PcRole[] = ["merchant", "operator", "management"];
  return <div className="flex gap-1 overflow-x-auto">{roles.map((role) => <button key={role} type="button" aria-pressed={role === "merchant"} onClick={() => switchPcRole(role)} className={`min-h-10 shrink-0 rounded-[var(--radius-control)] px-3 text-sm transition ${role === "merchant" ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)]"}`}>{pcRoleLabels[role]}</button>)}</div>;
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

function PermissionState() {
  return <main className="mx-auto max-w-4xl p-5 md:p-8"><Card className="p-6 md:p-8"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]"><PrototypeIcon name="warning" size={22} /></div><div className="min-w-0 flex-1"><StatusTag tone="warning">permission</StatusTag><h2 className="mt-3 text-xl font-semibold">当前范围没有访问权限</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前店主角色仅授权 {coreDemoStore.name}，不能查看其他门店或平台级明细。</p><div className="mt-5 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs font-medium text-[var(--color-text-tertiary)]">当前数据范围</p><p className="mt-1 font-medium">{pcDataScopeLabels.assigned_store} · {coreDemoStore.name}</p><p className="mt-3 text-xs font-medium text-[var(--color-text-tertiary)]">下一步</p><p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">返回本店工作台；如需演示跨门店运营或平台汇总，请切换到对应角色。真实权限申请流程不在 V0.1 范围。</p></div><SecondaryButton className="mt-5" onClick={() => setPrototypeView("ready")}>返回本店工作台</SecondaryButton></div></div></Card></main>;
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

export function App() {
  const view = getPrototypeView();
  const [page, setPage] = useState<Page>("workspace");
  const [redemptionOverrides, setRedemptionOverrides] = useState<RedemptionOverrides>({});
  const current = pageCatalog[page];
  const completeRedemption = (id: string) => setRedemptionOverrides((currentOverrides) => ({ ...currentOverrides, [id]: "completed" }));
  const showPermission = () => setPrototypeView("permission");

  return <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]"><aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex lg:flex-col"><div><p className="text-xs font-semibold tracking-wide text-[var(--color-primary)]">LOCAL LIFE · V0.1</p><h1 className="mt-1 text-xl font-semibold">本地生活</h1><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">店主 / 合作商工作台 · 概念原型</p></div><div className="mt-7"><p className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">概念角色</p><RoleSwitcher /></div><nav className="mt-7 space-y-1">{(Object.keys(pageCatalog) as Page[]).map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={`flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm ${page === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}><PrototypeIcon name={pageCatalog[item].icon} size={18} />{pageCatalog[item].label}</button>)}</nav><div className="mt-auto border-t border-[var(--color-border)] pt-4"><StatusTag tone="success">仅本店范围</StatusTag><p className="mt-2 text-xs font-medium">{coreDemoStore.name} · {coreDemoStore.id}</p><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">真实 RBAC、登录、组织架构未接入；切换运营或管理层会进入各自独立控制台。</p></div></aside><div className="min-w-0 flex-1"><header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 md:px-8"><div className="flex min-h-12 flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{current.label}</h2><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">店主 / 合作商 · {pcDataScopeLabels.assigned_store} · {coreDemoStore.name}</p></div><div className="flex items-center gap-2"><StatusTag>店主 / 合作商</StatusTag><StatusTag tone="success">模拟权限</StatusTag></div></div><div className="mt-3 lg:hidden"><CompactRoleSwitcher /></div></header><div className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 lg:hidden">{(Object.keys(pageCatalog) as Page[]).map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={`shrink-0 rounded-[var(--radius-control)] px-3 py-2 text-sm ${page === item ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)]"}`}>{pageCatalog[item].label}</button>)}</div>{view === "permission" ? <PermissionState /> : <PrototypeState view={view}><main className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">{page === "workspace" && <MerchantOverview onNavigate={setPage} onPermission={showPermission} overrides={redemptionOverrides} />}{page === "orders" && <MerchantOrders overrides={redemptionOverrides} onComplete={completeRedemption} onReset={() => setRedemptionOverrides({})} />}{page === "members" && <MerchantMembers onPermission={showPermission} />}<Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-center gap-2"><StatusTag>V0.1 边界</StatusTag><span className="text-sm text-[var(--color-text-secondary)]">真实扫码、支付、库存、退款、财务结算与生产级权限均未接入；未确认能力继续保持待确认。</span></div></Card></main></PrototypeState>}</div><PrototypePanel /></div>;
}
