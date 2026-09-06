import { useMemo, useState } from "react";
import { Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import {
  CORE_DEMO_IDS,
  catalogProducts,
  coreDemoStore,
  getPickupCredentialForOrder,
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
export type FulfillmentOverrides = Partial<Record<string, OrderFulfillmentStatus>>;
export type RedemptionOverrides = Partial<Record<string, "completed">>;

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

export function effectiveFulfillmentStatus(order: Order, overrides: FulfillmentOverrides) {
  return overrides[order.id] ?? order.fulfillmentDetail?.status ?? "preparing";
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-[var(--color-text-tertiary)]">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>;
}

function ConvenienceOrderCard({
  order,
  status,
  redemptionCompleted,
  onPickupPrepared,
  onPickupRedeem,
  onAdvanceDelivery,
}: {
  order: Order;
  status: OrderFulfillmentStatus;
  redemptionCompleted: boolean;
  onPickupPrepared: () => void;
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
        <p className="text-xs text-[var(--color-text-tertiary)]">订单实付</p>
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
          {status === "preparing" ? (
            <SecondaryButton onClick={onPickupPrepared}>{`备货完成 ${order.id}`}</SecondaryButton>
          ) : (
            <SecondaryButton
              disabled={redemptionCompleted || status !== "ready_for_pickup"}
              onClick={onPickupRedeem}
            >
              {redemptionCompleted || status === "completed" ? "已完成核销" : `扫码核销 ${detail.pickupCode ?? order.id}`}
            </SecondaryButton>
          )}
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

export function MerchantConvenienceOperations({
  fulfillmentOverrides,
  redemptionOverrides,
  onFulfillmentChange,
  onRedemptionComplete,
  onReset,
}: {
  fulfillmentOverrides: FulfillmentOverrides;
  redemptionOverrides: RedemptionOverrides;
  onFulfillmentChange: (orderId: string, status: OrderFulfillmentStatus) => void;
  onRedemptionComplete: (redemptionId: string) => void;
  onReset: () => void;
}) {
  const convenienceOrders = useMemo(
    () => v02Orders.filter((order) => isConvenienceOrder(order) && order.storeId === CORE_DEMO_IDS.store),
    [],
  );
  const demoBusinessDate = convenienceOrders.reduce(
    (latest, order) => order.createdAt.slice(0, 10) > latest ? order.createdAt.slice(0, 10) : latest,
    "",
  );
  const todayOrders = convenienceOrders.filter((order) => order.createdAt.slice(0, 10) === demoBusinessDate);
  const statuses = convenienceOrders.map((order) => effectiveFulfillmentStatus(order, fulfillmentOverrides));
  const metrics = [
    { label: "今日便利店订单", value: String(todayOrders.length), note: `演示业务日 ${demoBusinessDate}` },
    { label: "待备货", value: String(statuses.filter((status) => status === "preparing").length), note: "自提 / 短配统一看板" },
    { label: "待取货", value: String(statuses.filter((status) => status === "ready_for_pickup").length), note: "扫码核销后完成" },
    { label: "配送中", value: String(statuses.filter((status) => status === "delivering").length), note: "短距配送 mock" },
  ];

  const [qrScanState, setQrScanState] = useState<"idle" | "matched" | "completed" | "already_used" | "invalid">("idle");
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [pickupCodeState, setPickupCodeState] = useState<"idle" | "matched" | "completed" | "already_used" | "invalid">("idle");
  const pickupCredential = getPickupCredentialForOrder(CORE_DEMO_IDS.pickupOrder);
  const qrOrder = pickupCredential ? convenienceOrders.find((order) => order.id === pickupCredential.orderId) : undefined;
  const qrRedemption = pickupCredential
    ? redemptions.find((record) => record.id === pickupCredential.redemptionId)
    : undefined;
  const qrRedemptionCompleted = Boolean(
    qrRedemption && (qrRedemption.status === "completed" || redemptionOverrides[qrRedemption.id] === "completed"),
  );

  const scanPickupQr = () => {
    if (!pickupCredential || !qrOrder || !qrRedemption) {
      setQrScanState("invalid");
      return;
    }
    if (qrRedemptionCompleted || effectiveFulfillmentStatus(qrOrder, fulfillmentOverrides) === "completed") {
      setQrScanState("already_used");
      return;
    }
    setQrScanState("matched");
  };

  const confirmQrRedemption = () => {
    if (!qrOrder || !qrRedemption || qrRedemptionCompleted) {
      setQrScanState("already_used");
      return;
    }
    onFulfillmentChange(qrOrder.id, "completed");
    onRedemptionComplete(qrRedemption.id);
    setQrScanState("completed");
    if (pickupCodeState === "matched") setPickupCodeState("already_used");
  };

  const lookupPickupCode = () => {
    const normalized = pickupCodeInput.trim();
    if (!pickupCredential || !qrOrder || !qrRedemption || normalized !== pickupCredential.pickupCode) {
      setPickupCodeState("invalid");
      return;
    }
    if (qrRedemptionCompleted || effectiveFulfillmentStatus(qrOrder, fulfillmentOverrides) === "completed") {
      setPickupCodeState("already_used");
      return;
    }
    setPickupCodeState("matched");
  };

  const confirmPickupCodeRedemption = () => {
    if (!qrOrder || !qrRedemption || qrRedemptionCompleted) {
      setPickupCodeState("already_used");
      return;
    }
    onFulfillmentChange(qrOrder.id, "completed");
    onRedemptionComplete(qrRedemption.id);
    setPickupCodeState("completed");
    if (qrScanState === "matched") setQrScanState("already_used");
  };

  const resetRedemptionDemo = () => {
    onReset();
    setQrScanState("idle");
    setPickupCodeState("idle");
    setPickupCodeInput("");
  };

  const completePickup = (order: Order) => {
    onFulfillmentChange(order.id, "completed");
    const redemption = redemptions.find((record) => record.targetType === "order" && record.targetId === order.id);
    if (redemption) onRedemptionComplete(redemption.id);
  };

  const advanceDelivery = (order: Order) => {
    const currentStatus = effectiveFulfillmentStatus(order, fulfillmentOverrides);
    const nextStatus = currentStatus === "preparing" ? "delivering" : currentStatus === "delivering" ? "completed" : currentStatus;
    onFulfillmentChange(order.id, nextStatus);
  };

  const convenienceOrderIds = new Set(convenienceOrders.map((order) => order.id));
  const hasFulfillmentOverrides = convenienceOrders.some((order) => fulfillmentOverrides[order.id] !== undefined);
  const hasRedemptionOverrides = redemptions.some(
    (record) => record.targetType === "order" && convenienceOrderIds.has(record.targetId) && redemptionOverrides[record.id] !== undefined,
  );
  const hasOverrides = hasFulfillmentOverrides || hasRedemptionOverrides;

  return <>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{coreDemoStore.name} · T022 / V0.2</p>
        <h2 className="mt-1 text-2xl font-semibold">便利店订单与履约</h2>
      </div>
      {hasOverrides && <SecondaryButton onClick={resetRedemptionDemo}>重置履约演示</SecondaryButton>}
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

    <Section title="扫码核销">
      <Card className="p-5" data-testid="t038-qr-redemption">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone="warning">二维码 Mock</StatusTag>
              <span className="text-xs text-[var(--color-text-tertiary)]">T038 · 不接摄像头 / 扫码 SDK</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">自提二维码扫码核销</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              使用 T037 同一 Shared 二维码凭证做解析演示；扫码只读取 Mock payload，不代表真实硬件能力已经接入。
            </p>
          </div>
          <SecondaryButton onClick={scanPickupQr}>
            {qrScanState === "idle" ? "模拟扫码" : "再次模拟扫码"}
          </SecondaryButton>
        </div>

        {qrScanState !== "idle" && (
          <div className="mt-5 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4">
            {qrScanState === "invalid" ? (
              <div>
                <StatusTag tone="warning">未匹配</StatusTag>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">未找到可识别的自提二维码凭证。</p>
              </div>
            ) : qrScanState === "already_used" ? (
              <div>
                <StatusTag tone="warning">不可重复核销</StatusTag>
                <p className="mt-3 text-sm font-medium">二维码已核销 / 凭证已失效</p>
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">同一 redemption 只能成功一次，不创建第二条核销记录。</p>
              </div>
            ) : (
              <div data-testid="t038-qr-match">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)]">扫码命中订单</p>
                    <p className="mt-1 font-semibold">{qrOrder?.id ?? "-"}</p>
                  </div>
                  <StatusTag tone={qrScanState === "completed" ? "success" : "warning"}>
                    {qrScanState === "completed" ? "核销完成" : "待确认核销"}
                  </StatusTag>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <DetailItem label="订单" value={qrOrder?.id ?? "-"} />
                  <DetailItem label="Redemption" value={qrRedemption?.id ?? "-"} />
                  <DetailItem label="数字取货码" value={pickupCredential?.pickupCode ?? "-"} />
                  <DetailItem label="门店" value={getStoreName(qrOrder?.storeId)} />
                </div>
                <p className="mt-3 break-all text-xs text-[var(--color-text-tertiary)]">
                  QR payload · {pickupCredential?.qrPayload ?? "-"}
                </p>
                {qrScanState === "matched" && (
                  <SecondaryButton className="mt-4 w-full" onClick={confirmQrRedemption}>
                    确认核销 {qrOrder?.id}
                  </SecondaryButton>
                )}
                {qrScanState === "completed" && (
                  <p className="mt-4 text-sm font-medium text-[var(--color-success)]">同一 redemption 已完成；订单履约同步结束。</p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </Section>

    <Section title="数字码核销">
      <Card className="p-5" data-testid="t039-code-redemption">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone="warning">取货码 Mock</StatusTag>
              <span className="text-xs text-[var(--color-text-tertiary)]">T039 · 与二维码共用同一 redemption</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">输入取货码核销</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              输入用户订单页显示的取货码进行匹配；这里只验证原型交互与单次核销，不接真实门店硬件或生产审计。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="min-w-0">
            <span className="text-xs font-medium text-[var(--color-text-tertiary)]">数字取货码</span>
            <input
              aria-label="数字取货码"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pickupCodeInput}
              onChange={(event) => {
                setPickupCodeInput(event.target.value);
                if (pickupCodeState !== "idle") setPickupCodeState("idle");
              }}
              placeholder="请输入取货码"
              className="mt-1 min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </label>
          <SecondaryButton className="self-end" onClick={lookupPickupCode}>匹配订单</SecondaryButton>
        </div>

        {pickupCodeState !== "idle" && (
          <div className="mt-4 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4">
            {pickupCodeState === "invalid" ? (
              <div>
                <StatusTag tone="warning">未匹配</StatusTag>
                <p className="mt-3 text-sm font-medium">取货码错误或不存在</p>
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">订单与核销状态未发生变化。</p>
              </div>
            ) : pickupCodeState === "already_used" ? (
              <div>
                <StatusTag tone="warning">不可重复核销</StatusTag>
                <p className="mt-3 text-sm font-medium">该订单已通过另一通道完成核销</p>
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">二维码与数字码共用同一 redemption，只允许成功一次。</p>
              </div>
            ) : (
              <div data-testid="t039-code-match">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)]">取货码命中订单</p>
                    <p className="mt-1 font-semibold">{qrOrder?.id ?? "-"}</p>
                  </div>
                  <StatusTag tone={pickupCodeState === "completed" ? "success" : "warning"}>
                    {pickupCodeState === "completed" ? "核销完成" : "待确认核销"}
                  </StatusTag>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <DetailItem label="订单" value={qrOrder?.id ?? "-"} />
                  <DetailItem label="Redemption" value={qrRedemption?.id ?? "-"} />
                  <DetailItem label="取货码" value={pickupCredential?.pickupCode ?? "-"} />
                  <DetailItem label="门店" value={getStoreName(qrOrder?.storeId)} />
                </div>
                {pickupCodeState === "matched" && (
                  <SecondaryButton className="mt-4 w-full" onClick={confirmPickupCodeRedemption}>
                    确认数字码核销 {qrOrder?.id}
                  </SecondaryButton>
                )}
                {pickupCodeState === "completed" && (
                  <p className="mt-4 text-sm font-medium text-[var(--color-success)]">同一 redemption 已完成；二维码通道也立即失效。</p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </Section>

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
            onPickupPrepared={() => onFulfillmentChange(order.id, "ready_for_pickup")}
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
