import {
  CORE_DEMO_IDS,
  coupons,
  orders,
  partners,
  pointLedger,
  products,
  redemptions,
  reports,
  services,
  stores,
  users,
} from "./fixtures";

export function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export const coreDemoUser = findById(users, CORE_DEMO_IDS.user)!;
export const coreDemoStore = findById(stores, CORE_DEMO_IDS.store)!;
export const corePickupOrder = findById(orders, CORE_DEMO_IDS.pickupOrder)!;
export const coreDemoReport = findById(reports, CORE_DEMO_IDS.report)!;

export const coreUserCoupons = coupons.filter((coupon) => coupon.userId === CORE_DEMO_IDS.user);
export const coreUserOrders = orders.filter((order) => order.userId === CORE_DEMO_IDS.user);

export function validateDemoFixtureRelations(): string[] {
  const issues: string[] = [];
  const userIds = new Set(users.map((item) => item.id));
  const partnerIds = new Set(partners.map((item) => item.id));
  const storeIds = new Set(stores.map((item) => item.id));
  const productIds = new Set(products.map((item) => item.id));
  const serviceIds = new Set(services.map((item) => item.id));
  const orderIds = new Set(orders.map((item) => item.id));
  const couponIds = new Set(coupons.map((item) => item.id));

  for (const store of stores) {
    if (!partnerIds.has(store.partnerId)) issues.push(`store:${store.id}:missing-partner:${store.partnerId}`);
  }

  for (const service of services) {
    for (const storeId of service.storeIds) {
      if (!storeIds.has(storeId)) issues.push(`service:${service.id}:missing-store:${storeId}`);
    }
  }

  for (const order of orders) {
    if (!userIds.has(order.userId)) issues.push(`order:${order.id}:missing-user:${order.userId}`);
    if (order.storeId && !storeIds.has(order.storeId)) issues.push(`order:${order.id}:missing-store:${order.storeId}`);
    for (const item of order.items) {
      if (item.kind === "product" && !productIds.has(item.id)) issues.push(`order:${order.id}:missing-product:${item.id}`);
      if (item.kind === "service" && !serviceIds.has(item.id)) issues.push(`order:${order.id}:missing-service:${item.id}`);
    }
  }

  for (const coupon of coupons) {
    if (!userIds.has(coupon.userId)) issues.push(`coupon:${coupon.id}:missing-user:${coupon.userId}`);
    for (const storeId of coupon.applicableStoreIds) {
      if (!storeIds.has(storeId)) issues.push(`coupon:${coupon.id}:missing-store:${storeId}`);
    }
  }

  for (const entry of pointLedger) {
    if (!userIds.has(entry.userId)) issues.push(`points:${entry.id}:missing-user:${entry.userId}`);
    if (entry.relatedOrderId && !orderIds.has(entry.relatedOrderId)) issues.push(`points:${entry.id}:missing-order:${entry.relatedOrderId}`);
  }

  for (const report of reports) {
    if (!userIds.has(report.userId)) issues.push(`report:${report.id}:missing-user:${report.userId}`);
    if (!storeIds.has(report.storeId)) issues.push(`report:${report.id}:missing-store:${report.storeId}`);
    if (!serviceIds.has(report.serviceId)) issues.push(`report:${report.id}:missing-service:${report.serviceId}`);
  }

  for (const redemption of redemptions) {
    if (!userIds.has(redemption.userId)) issues.push(`redemption:${redemption.id}:missing-user:${redemption.userId}`);
    if (!storeIds.has(redemption.storeId)) issues.push(`redemption:${redemption.id}:missing-store:${redemption.storeId}`);
    const targetExists =
      redemption.targetType === "order"
        ? orderIds.has(redemption.targetId)
        : redemption.targetType === "coupon"
          ? couponIds.has(redemption.targetId)
          : serviceIds.has(redemption.targetId);
    if (!targetExists) issues.push(`redemption:${redemption.id}:missing-${redemption.targetType}:${redemption.targetId}`);
  }

  return issues;
}
