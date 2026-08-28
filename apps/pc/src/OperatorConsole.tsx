import { useMemo, useState } from "react";
import { Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon, type PrototypeIconName } from "@prototype/icons";
import { getPrototypeView, PrototypePanel, PrototypeState, setPrototypeView } from "@prototype/runtime";
import {
  CORE_DEMO_IDS,
  businessSceneLabels,
  couponStatusLabels,
  coupons,
  membershipLevelLabels,
  orders,
  orderStatusLabels,
  partners,
  pcDataScopeLabels,
  pointLedger,
  products,
  prototypeRules,
  redemptions,
  redemptionStatusLabels,
  reports,
  services,
  stores,
  users,
  type BusinessScene,
  type PcRole,
  type RedemptionRecord,
} from "@prototype/shared";

type OperatorModule = "users" | "partners" | "catalog" | "orders" | "membership" | "marketing";
type OperatorView = "overview" | OperatorModule;
type SceneFilter = "all" | BusinessScene;

const moduleMeta: Record<OperatorModule, { label: string; description: string; icon: PrototypeIconName; fr: string }> = {
  users: { label: "用户", description: "统一用户、来源与跨场景关系", icon: "profile", fr: "FR-601" },
  partners: { label: "合作商 / 门店", description: "合作载体、门店与能力范围", icon: "modules", fr: "FR-602" },
  catalog: { label: "商品 / 服务", description: "商品、服务与适用场景", icon: "modules", fr: "FR-603" },
  orders: { label: "订单 / 核销", description: "三场景订单与核销记录", icon: "modules", fr: "FR-604" },
  membership: { label: "会员", description: "等级、积分与候选规则", icon: "profile", fr: "FR-605" },
  marketing: { label: "营销", description: "优惠券与体验券资产", icon: "settings", fr: "FR-606" },
};

const moduleOrder = Object.keys(moduleMeta) as OperatorModule[];
const sceneOrder: BusinessScene[] = ["store", "mall", "care"];

const carrierLabels = {
  convenience_store: "便利店载体",
  health_center: "养生馆载体",
  wash_care: "洗护店载体",
  club: "生活会所载体",
} as const;

const fulfillmentLabels = {
  pickup: "门店自提",
  home_delivery: "配送到家",
  store_delivery: "配送到店",
} as const;

function switchRole(role: PcRole) {
  const url = new URL(window.location.href);
  url.searchParams.set("role", role);
  url.searchParams.delete("view");
  window.location.assign(url.toString());
}

function userName(userId: string) {
  return users.find((item) => item.id === userId)?.displayName ?? userId;
}

function redemptionScene(record: RedemptionRecord): BusinessScene {
  if (record.targetType === "order") return orders.find((item) => item.id === record.targetId)?.scene ?? "store";
  if (record.targetType === "coupon") return coupons.find((item) => item.id === record.targetId)?.scene ?? "store";
  return "care";
}

function SceneTabs({ value, onChange }: { value: SceneFilter; onChange: (scene: SceneFilter) => void }) {
  const items: Array<{ id: SceneFilter; label: string }> = [
    { id: "all", label: "全部场景" },
    ...sceneOrder.map((scene) => ({ id: scene, label: businessSceneLabels[scene] })),
  ];
  return <div className="flex gap-2 overflow-x-auto">{items.map((item) => <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`shrink-0 rounded-[var(--radius-control)] px-3 py-2 text-sm ${value === item.id ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}>{item.label}</button>)}</div>;
}

function BoundaryNote() {
  return <Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-center gap-2"><StatusTag tone="warning">V0.1 管理边界</StatusTag><span className="text-sm leading-6 text-[var(--color-text-secondary)]">当前仅验证列表、详情、筛选和信息关系；不实现真实增删改、批处理、审批、审计日志或外部接口。</span></div></Card>;
}

function PermissionState() {
  return <main className="mx-auto max-w-4xl p-5 md:p-8"><Card className="p-6 md:p-8"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]"><PrototypeIcon name="warning" size={22} /></div><div className="min-w-0 flex-1"><StatusTag tone="warning">permission</StatusTag><h2 className="mt-3 text-xl font-semibold">超出当前运营授权范围</h2><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">平台运营只查看 V0.1 授权业务范围。当前原型不建立真实组织、审批和 RBAC，所以越权请求不会展示目标数据。</p><div className="mt-5 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4"><p className="text-xs font-medium text-[var(--color-text-tertiary)]">当前数据范围</p><p className="mt-1 font-medium">{pcDataScopeLabels.authorized_platform} · 平台运营 V0.1</p><p className="mt-3 text-xs font-medium text-[var(--color-text-tertiary)]">下一步</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">返回运营中台；如需查看管理层汇总视角，可切换到“平台管理层”。</p></div><SecondaryButton className="mt-5" onClick={() => setPrototypeView("ready")}>返回运营中台</SecondaryButton></div></div></Card></main>;
}

function Overview({ onOpen }: { onOpen: (module: OperatorModule) => void }) {
  const totalAmount = orders.reduce((sum, order) => sum + order.amountYuan, 0);
  const pendingRedemptions = redemptions.filter((item) => item.status === "pending").length;
  return <><section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]"><div className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-6 text-white md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><StatusTag>平台运营</StatusTag><span className="text-xs text-white/65">FR-601 · FR-606</span></div><h2 className="mt-6 max-w-2xl text-2xl font-semibold md:text-3xl">从用户到订单，再回到权益与经营关系。</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">统一中台把用户、合作商与门店、商品服务、订单核销、会员和营销资产放进同一浏览结构。当前所有数据均为 V0.1 演示数据。</p></div><Card className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">当前授权</h3><StatusTag tone="success">平台授权范围</StatusTag></div><p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">可浏览当前演示数据关系；未确认业务规则不提供生产配置入口。</p><SecondaryButton className="mt-5 w-full" onClick={() => setPrototypeView("permission")}>演示越权状态</SecondaryButton></Card></section><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
    ["统一用户", String(users.length), "跨三场景身份"],
    ["合作商 / 门店", `${partners.length} / ${stores.length}`, "演示组织结构"],
    ["演示订单额", `¥${totalAmount}`, `${orders.length} 笔订单`],
    ["待核销", String(pendingRedemptions), "订单 / 体验凭证"],
  ].map(([label, value, note]) => <Card key={label}><p className="text-sm text-[var(--color-text-secondary)]">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{note}</p></Card>)}</div><Section title="六类核心模块"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{moduleOrder.map((module) => { const meta = moduleMeta[module]; return <button key={module} type="button" onClick={() => onOpen(module)} className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary)]"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name={meta.icon} size={19} /></div><StatusTag>{meta.fr}</StatusTag></div><h3 className="mt-4 font-semibold">{meta.label}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{meta.description}</p><p className="mt-4 text-sm font-medium text-[var(--color-primary-pressed)]">查看模块 →</p></button>; })}</div></Section><Section title="三大场景经营切片"><div className="grid gap-4 lg:grid-cols-3">{sceneOrder.map((scene) => { const sceneOrders = orders.filter((order) => order.scene === scene); const amount = sceneOrders.reduce((sum, order) => sum + order.amountYuan, 0); const sceneCoupons = coupons.filter((coupon) => coupon.scene === scene); return <Card key={scene}><div className="flex items-center justify-between"><h3 className="font-semibold">{businessSceneLabels[scene]}</h3><StatusTag>{sceneOrders.length} 单</StatusTag></div><p className="mt-5 text-2xl font-semibold">¥{amount}</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">券 / 体验权益 {sceneCoupons.length} 项</p></Card>; })}</div></Section><BoundaryNote /></>;
}

function UsersModule() {
  const [selectedId, setSelectedId] = useState(CORE_DEMO_IDS.user);
  const selected = users.find((item) => item.id === selectedId) ?? users[0];
  const selectedOrders = orders.filter((item) => item.userId === selected.id);
  const selectedPoints = pointLedger.filter((item) => item.userId === selected.id);
  const selectedCoupons = coupons.filter((item) => item.userId === selected.id);
  const selectedReports = reports.filter((item) => item.userId === selected.id);
  const usualStore = stores.find((item) => item.id === selected.usualStoreId);
  return <><Section title="用户列表"><div className="grid gap-4 xl:grid-cols-[0.85fr_1.45fr]"><Card className="p-0"><div className="border-b border-[var(--color-border)] px-4 py-3 text-xs font-medium text-[var(--color-text-tertiary)]">统一用户 ID</div>{users.map((user) => <button key={user.id} type="button" onClick={() => setSelectedId(user.id)} className={`flex w-full items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 text-left last:border-0 ${selected.id === user.id ? "bg-[var(--color-brand-subtle)]" : "hover:bg-[var(--color-surface-subtle)]"}`}><div><p className="font-medium">{user.displayName}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{user.id} · 来源 {businessSceneLabels[user.source]}</p></div><StatusTag>{membershipLevelLabels[user.member.level]}</StatusTag></button>)}</Card><Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-[var(--color-text-tertiary)]">代表性用户详情</p><h3 className="mt-1 text-xl font-semibold">{selected.displayName} · {selected.id}</h3></div>{selected.id === CORE_DEMO_IDS.user && <StatusTag tone="success">核心演示用户</StatusTag>}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
      ["来源", businessSceneLabels[selected.source]],
      ["会员", membershipLevelLabels[selected.member.level]],
      ["积分余额", String(selected.pointsBalance)],
      ["常用门店", usualStore?.name ?? "未设置"],
    ].map(([label, value]) => <div key={label} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3"><p className="text-xs text-[var(--color-text-tertiary)]">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>)}</div><div className="mt-5 grid gap-4 lg:grid-cols-2"><div><p className="text-sm font-medium">跨场景订单</p><div className="mt-2 space-y-2">{selectedOrders.length ? selectedOrders.map((order) => <div key={order.id} className="rounded-[var(--radius-container)] border border-[var(--color-border)] p-3 text-sm"><div className="flex items-center justify-between"><strong>{order.id}</strong><StatusTag>{businessSceneLabels[order.scene]}</StatusTag></div><p className="mt-2 text-[var(--color-text-secondary)]">{order.items.map((item) => item.name).join("、")} · ¥{order.amountYuan}</p></div>) : <p className="text-sm text-[var(--color-text-tertiary)]">暂无演示订单</p>}</div></div><div><p className="text-sm font-medium">权益与报告</p><div className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]"><p>积分流水：{selectedPoints.length} 条</p><p>优惠券 / 体验券：{selectedCoupons.length} 张</p><p>检测报告：{selectedReports.length} 份</p>{selectedReports.map((report) => <div key={report.id} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3"><p className="font-medium text-[var(--color-text-primary)]">{report.summary}</p><p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{report.disclaimer}</p></div>)}</div></div></div></Card></div></Section><BoundaryNote /></>;
}

function PartnersModule() {
  return <><div className="grid gap-4 lg:grid-cols-2">{partners.map((partner) => { const linkedStores = stores.filter((store) => store.partnerId === partner.id); return <Card key={partner.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--color-text-tertiary)]">{partner.id}</p><h3 className="mt-1 font-semibold">{partner.name}</h3></div><StatusTag>{carrierLabels[partner.carrierType]}</StatusTag></div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">区域：{partner.region} · 关联门店 {linkedStores.length} 家</p><div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">{linkedStores.map((store) => <div key={store.id} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3"><div className="flex items-center justify-between"><p className="font-medium">{store.name}</p><StatusTag tone={store.status === "open" ? "success" : "warning"}>{store.status === "open" ? "营业中" : "待配置"}</StatusTag></div><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{store.id} · {store.address}</p><p className="mt-2 text-xs text-[var(--color-text-secondary)]">能力：{store.capabilities.join(" / ")}</p></div>)}</div></Card>; })}</div><BoundaryNote /></>;
}

function CatalogModule({ scene, setScene }: { scene: SceneFilter; setScene: (scene: SceneFilter) => void }) {
  const visibleProducts = products.filter((product) => scene === "all" || product.scenes.includes(scene));
  const showServices = scene === "all" || scene === "care";
  return <><SceneTabs value={scene} onChange={setScene} /><Section title="商品"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => <Card key={product.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--color-text-tertiary)]">{product.category}</p><h3 className="mt-1 font-semibold">{product.name}</h3></div><strong>¥{product.priceYuan}</strong></div><div className="mt-4 flex flex-wrap gap-2">{product.scenes.map((item) => <StatusTag key={item}>{businessSceneLabels[item]}</StatusTag>)}</div><p className="mt-4 text-xs text-[var(--color-text-tertiary)]">履约：{product.fulfillment.map((item) => fulfillmentLabels[item]).join(" / ")}</p></Card>)}</div></Section><Section title="服务"><div className="grid gap-4 md:grid-cols-2">{showServices ? services.map((service) => <Card key={service.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--color-text-tertiary)]">{service.id}</p><h3 className="mt-1 font-semibold">{service.name}</h3></div><StatusTag tone="warning">{service.capabilityStatus}</StatusTag></div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">¥{service.priceYuan} · 适用门店 {service.storeIds.length} 家</p><p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">{service.note}</p></Card>) : <Card><p className="text-sm text-[var(--color-text-secondary)]">当前共享数据中的服务均属于智慧抗衰场景，所选场景暂无服务数据。</p></Card>}</div></Section><BoundaryNote /></>;
}

function OrdersModule({ scene, setScene }: { scene: SceneFilter; setScene: (scene: SceneFilter) => void }) {
  const visibleOrders = orders.filter((order) => scene === "all" || order.scene === scene);
  const visibleRedemptions = redemptions.filter((record) => scene === "all" || redemptionScene(record) === scene);
  return <><SceneTabs value={scene} onChange={setScene} /><div className="grid gap-3 sm:grid-cols-3">{sceneOrder.map((item) => { const sceneOrders = orders.filter((order) => order.scene === item); return <Card key={item}><p className="text-sm text-[var(--color-text-secondary)]">{businessSceneLabels[item]}</p><p className="mt-2 text-2xl font-semibold">{sceneOrders.length} 单</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">¥{sceneOrders.reduce((sum, order) => sum + order.amountYuan, 0)}</p></Card>; })}</div><Section title="订单"><Card className="overflow-hidden p-0">{visibleOrders.map((order) => <div key={order.id} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 md:grid-cols-[1fr_1fr_1.4fr_1fr]"><div><strong>{order.id}</strong><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{businessSceneLabels[order.scene]}</p></div><div>{userName(order.userId)}<p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{order.userId}</p></div><div className="text-[var(--color-text-secondary)]">{order.items.map((item) => item.name).join("、")}</div><div className="flex items-start justify-between gap-2"><strong>¥{order.amountYuan}</strong><StatusTag tone={order.status === "completed" ? "success" : "warning"}>{orderStatusLabels[order.status]}</StatusTag></div></div>)}</Card></Section><Section title="核销"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleRedemptions.map((record) => <Card key={record.id}><div className="flex items-center justify-between gap-2"><strong>{record.code}</strong><StatusTag tone={record.status === "completed" ? "success" : "warning"}>{redemptionStatusLabels[record.status]}</StatusTag></div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">{userName(record.userId)} · {record.userId}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{businessSceneLabels[redemptionScene(record)]} · {record.storeId}</p></Card>)}</div></Section><BoundaryNote /></>;
}

function MembershipModule() {
  return <><Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap gap-2"><StatusTag tone="warning">候选规则</StatusTag><p className="text-sm leading-6 text-[var(--color-text-secondary)]">{prototypeRules.membershipLevels.note} {prototypeRules.pointsToCash.note}</p></div></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{users.map((user) => <Card key={user.id}><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{user.displayName}</h3><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{user.id}</p></div><StatusTag>{membershipLevelLabels[user.member.level]}</StatusTag></div><p className="mt-5 text-2xl font-semibold">{user.pointsBalance}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">积分余额</p></Card>)}</div><Section title="积分流水"><div className="grid gap-3 md:grid-cols-2">{pointLedger.map((entry) => <Card key={entry.id}><div className="flex items-center justify-between"><p className="font-medium">{userName(entry.userId)}</p><strong className={entry.direction === "earn" ? "text-[var(--color-success)]" : "text-[var(--color-text-primary)]"}>{entry.direction === "earn" ? "+" : "-"}{entry.amount}</strong></div><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{entry.source}{entry.scene ? ` · ${businessSceneLabels[entry.scene]}` : ""} · 余额 {entry.balanceAfter}</p></Card>)}</div></Section><BoundaryNote /></>;
}

function MarketingModule({ scene, setScene }: { scene: SceneFilter; setScene: (scene: SceneFilter) => void }) {
  const visibleCoupons = coupons.filter((coupon) => scene === "all" || coupon.scene === scene);
  return <><SceneTabs value={scene} onChange={setScene} /><Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap gap-2"><StatusTag>当前数据能力</StatusTag><p className="text-sm leading-6 text-[var(--color-text-secondary)]">共享数据目前只建模优惠券和体验券。活动编排、自动化营销、人群包和发送渠道尚未建模，因此本页不虚构这些配置。</p></div></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleCoupons.map((coupon) => <Card key={coupon.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--color-text-tertiary)]">{coupon.kind === "experience" ? "体验券" : "优惠券"}</p><h3 className="mt-1 font-semibold">{coupon.title}</h3></div><StatusTag tone={coupon.status === "available" ? "success" : "neutral"}>{couponStatusLabels[coupon.status]}</StatusTag></div><p className="mt-4 text-sm text-[var(--color-text-secondary)]">{businessSceneLabels[coupon.scene]} · 用户 {coupon.userId}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">适用门店：{coupon.applicableStoreIds.length ? coupon.applicableStoreIds.join("、") : "场景通用 / 未限定门店"}</p></Card>)}</div><BoundaryNote /></>;
}

function ModuleContent({ module, scene, setScene }: { module: OperatorModule; scene: SceneFilter; setScene: (scene: SceneFilter) => void }) {
  if (module === "users") return <UsersModule />;
  if (module === "partners") return <PartnersModule />;
  if (module === "catalog") return <CatalogModule scene={scene} setScene={setScene} />;
  if (module === "orders") return <OrdersModule scene={scene} setScene={setScene} />;
  if (module === "membership") return <MembershipModule />;
  return <MarketingModule scene={scene} setScene={setScene} />;
}

export function OperatorConsole() {
  const view = getPrototypeView();
  const [active, setActive] = useState<OperatorView>("overview");
  const [scene, setScene] = useState<SceneFilter>("all");
  const activeMeta = active === "overview" ? null : moduleMeta[active];
  const pageTitle = activeMeta?.label ?? "运营总览";
  const currentDescription = activeMeta?.description ?? "统一浏览六类运营模块与三大业务场景。";
  const navItems = useMemo(() => [{ id: "overview" as const, label: "运营总览", icon: "home" as PrototypeIconName }, ...moduleOrder.map((module) => ({ id: module, label: moduleMeta[module].label, icon: moduleMeta[module].icon }))], []);

  return <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]"><aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex lg:flex-col"><div><p className="text-xs font-semibold tracking-wide text-[var(--color-primary)]">LOCAL LIFE · V0.1</p><h1 className="mt-1 text-xl font-semibold">本地生活</h1><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">平台运营中台 · 概念原型</p></div><div className="mt-7"><p className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">概念角色</p><div className="space-y-1">{(["merchant", "operator", "management"] as PcRole[]).map((role) => <button key={role} type="button" onClick={() => role === "operator" ? setActive("overview") : switchRole(role)} className={`min-h-10 w-full rounded-[var(--radius-control)] px-3 text-left text-sm ${role === "operator" ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}>{role === "merchant" ? "店主 / 合作商" : role === "operator" ? "平台运营" : "平台管理层"}</button>)}</div></div><nav className="mt-7 space-y-1">{navItems.map((item) => <button key={item.id} type="button" onClick={() => setActive(item.id)} className={`flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm ${active === item.id ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"}`}><PrototypeIcon name={item.icon} size={18} />{item.label}</button>)}</nav><div className="mt-auto border-t border-[var(--color-border)] pt-4"><StatusTag tone="success">平台授权范围</StatusTag><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">V0.1 仅浏览与筛选；真实写入、审批和外部接口均未接入。</p></div></aside><div className="min-w-0 flex-1"><header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 md:px-8"><div className="flex min-h-12 flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{pageTitle}</h2><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">平台运营 · {pcDataScopeLabels.authorized_platform} · {currentDescription}</p></div><div className="flex items-center gap-2"><StatusTag>平台运营</StatusTag><StatusTag tone="success">模拟数据</StatusTag></div></div><div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">{navItems.map((item) => <button key={item.id} type="button" onClick={() => setActive(item.id)} className={`shrink-0 rounded-[var(--radius-control)] px-3 py-2 text-sm ${active === item.id ? "bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "text-[var(--color-text-secondary)]"}`}>{item.label}</button>)}</div></header>{view === "permission" ? <PermissionState /> : <PrototypeState view={view}><main className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">{active === "overview" ? <Overview onOpen={setActive} /> : <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--color-text-secondary)]">{activeMeta?.fr} · 平台运营</p><h2 className="mt-1 text-2xl font-semibold">{activeMeta?.label}</h2></div><StatusTag tone="warning">概念管理 · 无真实写入</StatusTag></div><ModuleContent module={active} scene={scene} setScene={setScene} /></>}</main></PrototypeState>}</div><PrototypePanel /></div>;
}
