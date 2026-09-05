import { useMemo, useState } from "react";
import { Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import {
  CORE_DEMO_IDS,
  catalogProducts,
  coreDemoStore,
  offlineStores,
  productAvailability,
  redemptions,
  users,
  v02Orders,
  type Order,
  type OrderFulfillmentMode,
  type OrderFulfillmentStatus,
} from "@prototype/shared";

const fulfillmentModeLabels: Record<Extract<OrderFulfillmentMode, "pickup" | "short_delivery">, string> = {
  pickup: "到店自提",
  short_delivery: "约 3 km 短配",
};

const fulfillmentStatusLabels: Record<OrderFulfillmentStatus, string> = {
  preparing: "备货中",
  ready_for_pickup: "待取货",
  delivering: "配送中",
  shipping: "物流中",
  completed: "已完成",
  cancelled: "已取消",
};

const availabilityStatusLabels = {
  available: "可售",
  low_stock: "低库存",
  sold_out: "售罄",
  unavailable: "不可售",
} as const;

type ConvenienceMode = "pickup" | "short_delivery";
type FulfillmentOverrides = Partial<Record<string, OrderFulfillmentStatus>>;
type RedemptionOverrides = Partial<Record<string, "completed">>;

function isConvenienceOrder(order: Order): order is Order & { fulfillmentDetail: NonNullable<Order["fulfillmentDetail"]> & { mode: ConvenienceMode } } {
  return order.scene === "store" && (order.fulfillmentDetail?.mode === "pickup" || order.fulfillmentDetail?.mode === "short_delivery");
}

function getUserName(userId: string) {
  return users.find((user) => user.id === userId)?.displayName ?? userId;
}

function getStoreName(storeId: string | undefined) {
  return offlineStores.find((store) => store.id === storeId)?.name ?? storeId ?? "未绑定门店";
}

function toneForStatus(status: OrderFulfillmentStatus): "success" | "warning" | "neutral" {
  if (status === "completed") return "success";
  if (status === "cancelled") return "neutral";
  return "warning";
}

function effectiveFulfillmentStatus(order: Order, overrides: FulfillmentOverrides) {
  return overrides[order.id] ?? order.fulfillmentDetail?.status ?? "preparing";
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-[var(--color-text-tertiary)]">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>;
}

function ConvenienceOrderCard({
  order,
  status,
  redemptionCompleted,
  onPickupRedeem,
  onAdvanceDelivery,
}: {
  order: Order;
  status: OrderFulfillmentStatus;
  redemptionCompleted: boolean;
  onPickupRedeem: () => void;
  onAdvanceDelivery: () => void;
}) {
  const detail = order.fulfillmentDetail;
  if (!detail || (detail.mode !== "pickup" && detail.mode !== "short_delivery")) return null;
  const mode = detail.mode;

  return <Card className="p-0" data-testid={`t022-order-${order.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusTag>{fulfillmentModeLabels[mode]}</StatusTag>
          <StatusTag tone={toneForStatus(status)}>{fulfillmentStatusLabels[status]}</StatusTag>
        </div>
        <h3 className="mt-3 break-all text-lg font-semibold">{order.id}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{getStoreName(order.storeId)} · {getUserName(order.userId)}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-[var(--color-text-tertiary)]">订单金额</p>
        <p className="mt-1 text-xl font-semibold">¥{order.amountYuan.toFixed(2)}</p>
      </div>
    </div>

    <div className="grid gap-4 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
      <DetailItem label="商品" value={order.items.map((item) => `${item.name} ×${item.quantity}`).join("、")} />
      <DetailItem label="门店" value={`${getStoreName(order.storeId)} · ${order.storeId ?? "-"}`} />
      {mode === "pickup" ? (
        <>
          <DetailItem label="取货时段" value={detail.pickupWindow ?? "待确认"} />
          <DetailItem label="取货码" value={detail.pickupCode ?? "待生成"} />
        </>
      ) : (
        <>
          <DetailItem label="配送地址" value={detail.deliveryAddress ?? "待确认"} />
          <DetailItem label="短配范围" value={`${detail.distanceKm ?? "-"} km · 预计 ${detail.estimatedMinutes ?? "-"} 分钟`} />
        </>
      )}
    </div>

    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-4">
      {mode === "pickup" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {redemptionCompleted || status === "completed"
              ? "取货凭证已核销，订单完成。"
              : status === "ready_for_pickup"
                ? "商品已备妥，可扫码核销用户取货码。"
                : "当前订单尚未进入可核销状态。"}
          </p>
          <SecondaryButton
            disabled={redemptionCompleted || status !== "ready_for_pickup"}
            onClick={onPickupRedeem}
          >
            {redemptionCompleted || status === "completed" ? "已完成核销" : `扫码核销 ${order.id}`}
          </SecondaryButton>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {status === "preparing"
              ? "门店已接单，完成备货后进入短距配送。"
              : status === "delivering"
                ? "商品配送中，送达后完成本单。"
                : status === "completed"
                  ? "商品已送达，本次短距配送完成。"
                  : "当前状态不可继续推进。"}
          </p>
          <SecondaryButton disabled={status === "completed" || status === "cancelled"} onClick={onAdvanceDelivery}>
            {status === "preparing" ? `开始配送 ${order.id}` : status === "delivering" ? `确认送达 ${order.id}` : "配送已完成"}
          </SecondaryButton>
        </div>
      )}
    </div>
  </Card>;
}

export function MerchantConvenienceOperations() {
  const convenienceOrders = useMemo(
    () => v02Orders.filter((order) => isConvenienceOrder(order) && order.storeId === CORE_DEMO_IDS.store),
    [],
  );
  const [fulfillmentOverrides, setFulfillmentOverrides] = useState<FulfillmentOverrides>({});
  const [redemptionOverrides, setRedemptionOverrides] = useState<RedemptionOverrides>({});

  const statuses = convenienceOrders.map((order) => effectiveFulfillmentStatus(order, fulfillmentOverrides));
  const metrics = [
    { label: "今日便利店订单", value: String(convenienceOrders.length), note: "仅当前授权门店" },
    { label: "待备货", value: String(statuses.filter((status) => status === "preparing").length), note: "自提 / 短配统一看板" },
    { label: "待取货", value: String(statuses.filter((status) => status === "ready_for_pickup").length), note: "扫码核销后完成" },
    { label: "配送中", value: String(statuses.filter((status) => status === "delivering").length), note: "短距配送 mock" },
  ];

  const completePickup = (order: Order) => {
    setFulfillmentOverrides((current) => ({ ...current, [order.id]: "completed" }));
    const redemption = redemptions.find((record) => record.targetType === "order" && record.targetId === order.id);
    if (redemption) setRedemptionOverrides((current) => ({ ...current, [redemption.id]: "completed" }));
  };

  const advanceDelivery = (order: Order) => {
    const currentStatus = effectiveFulfillmentStatus(order, fulfillmentOverrides);
    const nextStatus = currentStatus === "preparing" ? "delivering" : currentStatus === "delivering" ? "completed" : currentStatus;
    setFulfillmentOverrides((current) => ({ ...current, [order.id]: nextStatus }));
  };

  const reset = () => {
    setFulfillmentOverrides({});
    setRedemptionOverrides({});
  };

  const hasOverrides = Object.keys(fulfillmentOverrides).length > 0 || Object.keys(redemptionOverrides).length > 0;

  return <>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{coreDemoStore.name} · T022 / V0.2</p>
        <h2 className="mt-1 text-2xl font-semibold">便利店订单与履约</h2>
      </div>
      {hasOverrides && <SecondaryButton onClick={reset}>重置履约演示</SecondaryButton>}
    </div>

    <Card className="bg-[var(--color-surface-subtle)]">
      <div className="flex flex-wrap items-center gap-2">
        <StatusTag tone="success">仅本店授权</StatusTag>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          当前账号只处理 {coreDemoStore.name} 的便利店订单；不展示其他门店、商城或智慧抗衰订单。
        </p>
      </div>
    </Card>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => <Card key={metric.label}>
        <p className="text-sm text-[var(--color-text-secondary)]">{metric.label}</p>
        <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{metric.note}</p>
      </Card>)}
    </div>

    <Section title="本店便利店订单">
      <div className="grid gap-4">
        {convenienceOrders.map((order) => {
          const redemption = order.fulfillmentDetail?.mode === "pickup"
            ? redemptions.find((record) => record.targetType === "order" && record.targetId === order.id)
            : undefined;
          return <ConvenienceOrderCard
            key={order.id}
            order={order}
            status={effectiveFulfillmentStatus(order, fulfillmentOverrides)}
            redemptionCompleted={Boolean(redemption && redemptionOverrides[redemption.id] === "completed")}
            onPickupRedeem={() => completePickup(order)}
            onAdvanceDelivery={() => advanceDelivery(order)}
          />;
        })}
      </div>
    </Section>

    <Card>
      <div className="flex flex-wrap items-start gap-3">
        <StatusTag tone="warning">Mock 边界</StatusTag>
        <p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          扫码核销、备货、配送中与送达只改变当前原型会话状态；未接真实库存、骑手调度、地图、支付或配送 API。
        </p>
      </div>
    </Card>
  </>;
}

export function OperatorConvenienceOperations() {
  const convenienceOrders = v02Orders.filter(isConvenienceOrder);
  const convenienceStores = offlineStores.filter((store) =>
    store.capabilities.includes("pickup") || store.capabilities.includes("short_delivery"),
  );

  return <>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><p className="text-sm text-[var(--color-text-secondary)]">便利店订单</p><p className="mt-3 text-2xl font-semibold">{convenienceOrders.length}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">自提 + 短配共享订单事实</p></Card>
      <Card><p className="text-sm text-[var(--color-text-secondary)]">支持自提门店</p><p className="mt-3 text-2xl font-semibold">{convenienceStores.filter((store) => store.capabilities.includes("pickup")).length}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Offline Store capability</p></Card>
      <Card><p className="text-sm text-[var(--color-text-secondary)]">支持短配门店</p><p className="mt-3 text-2xl font-semibold">{convenienceStores.filter((store) => store.capabilities.includes("short_delivery")).length}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">配送半径为 mock</p></Card>
      <Card><p className="text-sm text-[var(--color-text-secondary)]">门店可售关系</p><p className="mt-3 text-2xl font-semibold">{productAvailability.length}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">不是实时库存</p></Card>
    </div>

    <Section title="便利店订单与履约">
      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[0.85fr_1fr_1fr_1.2fr_0.8fr] gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] lg:grid">
          <span>订单</span><span>门店</span><span>履约方式</span><span>履约信息</span><span>状态</span>
        </div>
        {convenienceOrders.map((order) => {
          const detail = order.fulfillmentDetail!;
          const mode = detail.mode as ConvenienceMode;
          return <div key={order.id} data-testid={`t022-operator-order-${order.id}`} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 lg:grid-cols-[0.85fr_1fr_1fr_1.2fr_0.8fr] lg:gap-4">
            <div><p className="font-semibold break-all">{order.id}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{getUserName(order.userId)}</p></div>
            <div><p className="font-medium">{getStoreName(order.storeId)}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{order.storeId}</p></div>
            <div><StatusTag>{fulfillmentModeLabels[mode]}</StatusTag></div>
            <div className="text-[var(--color-text-secondary)]">
              {mode === "pickup"
                ? `${detail.pickupWindow ?? "待确认"} · ${detail.pickupCode ?? "待生成"}`
                : `${detail.distanceKm ?? "-"} km · 约 ${detail.estimatedMinutes ?? "-"} 分钟`}
            </div>
            <div><StatusTag tone={toneForStatus(detail.status)}>{fulfillmentStatusLabels[detail.status]}</StatusTag></div>
          </div>;
        })}
      </Card>
    </Section>

    <Section title="门店履约能力配置（Mock）">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {convenienceStores.map((store) => <Card key={store.id}>
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs text-[var(--color-text-tertiary)]">{store.id}</p><h3 className="mt-1 font-semibold">{store.name}</h3></div>
            <StatusTag tone={store.status === "open" ? "success" : "neutral"}>{store.status === "open" ? "营业中" : store.status === "closed" ? "已关闭" : "待配置"}</StatusTag>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3"><span className="text-[var(--color-text-secondary)]">到店自提</span><strong>{store.capabilities.includes("pickup") ? "已启用" : "未启用"}</strong></div>
            <div className="flex items-center justify-between gap-3"><span className="text-[var(--color-text-secondary)]">约 3 km 短配</span><strong>{store.capabilities.includes("short_delivery") ? "已启用" : "未启用"}</strong></div>
            <div className="flex items-center justify-between gap-3"><span className="text-[var(--color-text-secondary)]">配送范围</span><strong>{store.deliveryRadiusKm ? `${store.deliveryRadiusKm} km` : "未配置"}</strong></div>
            <div className="flex items-center justify-between gap-3"><span className="text-[var(--color-text-secondary)]">营业时间</span><strong>{store.businessHours ?? "未配置"}</strong></div>
          </div>
          <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">仅表达履约能力和范围，不接地图、骑手调度或真实配送配置。</p>
        </Card>)}
      </div>
    </Section>

    <Section title="门店商品可售关系">
      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1fr_1.1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] lg:grid">
          <span>门店</span><span>商品</span><span>状态</span><span>门店价</span><span>库存文案</span>
        </div>
        {productAvailability.map((item) => {
          const product = catalogProducts.find((candidate) => candidate.id === item.productId);
          return <div key={item.id} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 lg:grid-cols-[1fr_1.1fr_0.8fr_0.8fr_0.8fr] lg:gap-4">
            <div><p className="font-medium">{getStoreName(item.storeId)}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{item.storeId}</p></div>
            <div><p className="font-medium">{product?.name ?? item.productId}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{item.productId}</p></div>
            <div><StatusTag tone={item.status === "available" ? "success" : item.status === "low_stock" ? "warning" : "neutral"}>{availabilityStatusLabels[item.status]}</StatusTag></div>
            <div><p className="font-medium">¥{item.priceYuan.toFixed(2)}</p>{item.memberPriceYuan !== undefined && <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">会员 ¥{item.memberPriceYuan.toFixed(2)}</p>}</div>
            <div className="text-[var(--color-text-secondary)]">{item.stockLabel ?? "未提供"}</div>
          </div>;
        })}
      </Card>
    </Section>

    <Card className="bg-[var(--color-surface-subtle)]">
      <div className="flex flex-wrap items-start gap-3">
        <StatusTag tone="warning">运营边界</StatusTag>
        <p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          可售关系与履约能力来自共享 Mock Fixtures；“低库存 / 现货 / 配送半径”等均为演示事实，不是生产库存或实时配送数据。
        </p>
      </div>
    </Card>
  </>;
}
