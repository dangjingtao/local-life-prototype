import {
  CORE_DEMO_IDS,
  appointmentSlots,
  appointments,
  businessPartners,
  campaigns,
  careProjects,
  careServices,
  catalogProducts,
  channels,
  convenienceCarts,
  coupons,
  detectionRecords,
  detectionReports,
  offlineStores,
  orders,
  partners,
  pointLedger,
  productAvailability,
  products,
  redemptions,
  reports,
  services,
  storeDeliveryAddresses,
  storefronts,
  stores,
  users,
  v02Coupons,
  v02Orders,
} from "./fixtures";
import type { OfflineStore, StoreDeliveryAddress } from "./domain";

export function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// V0.1 compatibility selectors. Existing pages can keep consuming these while
// V0.2 pages migrate to the richer selectors below.
export const coreDemoUser = findById(users, CORE_DEMO_IDS.user)!;
export const coreDemoStore = findById(stores, CORE_DEMO_IDS.store)!;
export const corePickupOrder = findById(orders, CORE_DEMO_IDS.pickupOrder)!;
export const coreDemoReport = findById(reports, CORE_DEMO_IDS.report)!;

export const coreUserCoupons = coupons.filter((coupon) => coupon.userId === CORE_DEMO_IDS.user);
export const coreUserOrders = orders.filter((order) => order.userId === CORE_DEMO_IDS.user);

// V0.2 selectors use the complete cross-end fact set.
export const coreDemoAppointment = findById(appointments, CORE_DEMO_IDS.appointment)!;
export const coreUserAppointments = appointments.filter((appointment) => appointment.userId === CORE_DEMO_IDS.user);
export const coreUserV02Orders = v02Orders.filter((order) => order.userId === CORE_DEMO_IDS.user);
export const coreUserV02Coupons = v02Coupons.filter((coupon) => coupon.userId === CORE_DEMO_IDS.user);
export const coreUserReports = detectionReports.filter((report) => report.userId === CORE_DEMO_IDS.user);

export function getStoreAvailability(storeId: string) {
  return productAvailability.filter((item) => item.storeId === storeId);
}

export function getStoreProducts(storeId: string) {
  const productIds = new Set(
    productAvailability
      .filter((item) => item.storeId === storeId && item.status !== "unavailable")
      .map((item) => item.productId),
  );
  return catalogProducts.filter((product) => productIds.has(product.id));
}

export function getUserConvenienceCarts(userId: string) {
  return convenienceCarts.filter((cart) => cart.userId === userId);
}

export function getStoreDeliveryAddresses(storeId: string): StoreDeliveryAddress[] {
  return storeDeliveryAddresses.filter((address) => address.storeId === storeId);
}

export function isStoreDeliveryAddressInRange(store: OfflineStore | undefined, address: StoreDeliveryAddress | undefined) {
  if (!store || !address || !store.deliveryRadiusKm) return false;
  return address.distanceKm <= store.deliveryRadiusKm;
}

export function getUserDetectionHistory(userId: string) {
  return detectionReports
    .filter((report) => report.userId === userId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function validateDemoFixtureRelations(): string[] {
  const issues: string[] = [];
  const userIds = new Set(users.map((item) => item.id));
  const partnerIds = new Set(businessPartners.map((item) => item.id));
  const storeIds = new Set(offlineStores.map((item) => item.id));
  const productIds = new Set(catalogProducts.map((item) => item.id));
  const serviceIds = new Set(careServices.map((item) => item.id));
  const orderIds = new Set(v02Orders.map((item) => item.id));
  const couponIds = new Set(v02Coupons.map((item) => item.id));
  const channelIds = new Set(channels.map((item) => item.id));
  const storefrontIds = new Set(storefronts.map((item) => item.id));
  const careProjectIds = new Set(careProjects.map((item) => item.id));
  const appointmentSlotIds = new Set(appointmentSlots.map((item) => item.id));
  const appointmentIds = new Set(appointments.map((item) => item.id));
  const detectionRecordIds = new Set(detectionRecords.map((item) => item.id));
  const reportIds = new Set(detectionReports.map((item) => item.id));

  if (offlineStores.length < 3) issues.push("fixture:requires-at-least-3-offline-stores");
  if (channels.length < 2 || storefronts.length < 2) {
    issues.push("fixture:requires-at-least-2-online-channel-storefront-samples");
  }
  if (detectionReports.filter((report) => report.userId === CORE_DEMO_IDS.user).length < 2) {
    issues.push(`fixture:user:${CORE_DEMO_IDS.user}:requires-at-least-2-care-reports`);
  }
  for (const requiredStatus of ["scheduled", "checked_in", "completed", "cancelled", "rescheduled"] as const) {
    if (!appointments.some((appointment) => appointment.status === requiredStatus)) {
      issues.push(`fixture:missing-appointment-sample:${requiredStatus}`);
    }
  }

  // The old collections stay valid subsets of the richer V0.2 fact set.
  for (const partner of partners) if (!partnerIds.has(partner.id)) issues.push(`compat:partner:${partner.id}:missing-from-v02`);
  for (const store of stores) if (!storeIds.has(store.id)) issues.push(`compat:store:${store.id}:missing-from-v02`);
  for (const product of products) if (!productIds.has(product.id)) issues.push(`compat:product:${product.id}:missing-from-v02`);
  for (const service of services) if (!serviceIds.has(service.id)) issues.push(`compat:service:${service.id}:missing-from-v02`);
  for (const order of orders) if (!orderIds.has(order.id)) issues.push(`compat:order:${order.id}:missing-from-v02`);
  for (const coupon of coupons) if (!couponIds.has(coupon.id)) issues.push(`compat:coupon:${coupon.id}:missing-from-v02`);
  for (const report of reports) if (!reportIds.has(report.id)) issues.push(`compat:report:${report.id}:missing-from-v02`);

  for (const user of users) {
    if (user.usualStoreId && !storeIds.has(user.usualStoreId)) issues.push(`user:${user.id}:missing-usual-store:${user.usualStoreId}`);
  }

  for (const store of offlineStores) {
    if (!partnerIds.has(store.partnerId)) issues.push(`store:${store.id}:missing-partner:${store.partnerId}`);
    if (store.capabilities.includes("short_delivery") && !store.deliveryRadiusKm) issues.push(`store:${store.id}:short-delivery-missing-radius`);
  }

  const addressKeys = new Set<string>();
  for (const address of storeDeliveryAddresses) {
    if (!userIds.has(address.userId)) issues.push(`address:${address.id}:missing-user:${address.userId}`);
    if (!storeIds.has(address.storeId)) issues.push(`address:${address.id}:missing-store:${address.storeId}`);
    const key = `${address.userId}:${address.storeId}:${address.id}`;
    if (addressKeys.has(key)) issues.push(`address:${address.id}:duplicate-key:${key}`);
    addressKeys.add(key);
    if (address.distanceKm < 0) issues.push(`address:${address.id}:negative-distance`);
  }
  for (const store of offlineStores) {
    if (!store.capabilities.includes("short_delivery")) continue;
    const addresses = storeDeliveryAddresses.filter((address) => address.storeId === store.id);
    if (!addresses.some((address) => isStoreDeliveryAddressInRange(store, address))) {
      issues.push(`address:${store.id}:missing-in-range-sample`);
    }
    if (!addresses.some((address) => address.distanceKm > (store.deliveryRadiusKm ?? 0))) {
      issues.push(`address:${store.id}:missing-out-of-range-sample`);
    }
  }

  const availabilityKeys = new Set<string>();
  for (const availability of productAvailability) {
    if (!storeIds.has(availability.storeId)) issues.push(`availability:${availability.id}:missing-store:${availability.storeId}`);
    if (!productIds.has(availability.productId)) issues.push(`availability:${availability.id}:missing-product:${availability.productId}`);
    const key = `${availability.storeId}:${availability.productId}`;
    if (availabilityKeys.has(key)) issues.push(`availability:${availability.id}:duplicate-store-product:${key}`);
    availabilityKeys.add(key);
  }

  const cartKeys = new Set<string>();
  for (const cart of convenienceCarts) {
    if (!userIds.has(cart.userId)) issues.push(`cart:${cart.id}:missing-user:${cart.userId}`);
    if (!storeIds.has(cart.storeId)) issues.push(`cart:${cart.id}:missing-store:${cart.storeId}`);
    const cartKey = `${cart.userId}:${cart.storeId}`;
    if (cartKeys.has(cartKey)) issues.push(`cart:${cart.id}:duplicate-user-store:${cartKey}`);
    cartKeys.add(cartKey);
    for (const item of cart.items) {
      if (!productIds.has(item.productId)) issues.push(`cart:${cart.id}:missing-product:${item.productId}`);
      const availability = productAvailability.find((entry) => entry.storeId === cart.storeId && entry.productId === item.productId);
      if (!availability) issues.push(`cart:${cart.id}:product-not-sold-by-store:${item.productId}`);
      if (availability && (availability.status === "sold_out" || availability.status === "unavailable")) {
        issues.push(`cart:${cart.id}:product-not-orderable:${item.productId}:${availability.status}`);
      }
      if (item.quantity <= 0) issues.push(`cart:${cart.id}:invalid-quantity:${item.productId}`);
    }
  }

  for (const service of careServices) {
    for (const storeId of service.storeIds) if (!storeIds.has(storeId)) issues.push(`service:${service.id}:missing-store:${storeId}`);
  }
  for (const storefront of storefronts) {
    if (!channelIds.has(storefront.channelId)) issues.push(`storefront:${storefront.id}:missing-channel:${storefront.channelId}`);
  }
  for (const project of careProjects) {
    if (project.serviceId && !serviceIds.has(project.serviceId)) issues.push(`care-project:${project.id}:missing-service:${project.serviceId}`);
    for (const storeId of project.storeIds) if (!storeIds.has(storeId)) issues.push(`care-project:${project.id}:missing-store:${storeId}`);
  }

  for (const slot of appointmentSlots) {
    if (!careProjectIds.has(slot.careProjectId)) issues.push(`slot:${slot.id}:missing-care-project:${slot.careProjectId}`);
    if (!storeIds.has(slot.storeId)) issues.push(`slot:${slot.id}:missing-store:${slot.storeId}`);
    if (slot.bookedCount > slot.capacity) issues.push(`slot:${slot.id}:overbooked`);
    if (slot.status === "full" && slot.bookedCount < slot.capacity) issues.push(`slot:${slot.id}:full-status-with-capacity`);
  }

  for (const appointment of appointments) {
    if (!userIds.has(appointment.userId)) issues.push(`appointment:${appointment.id}:missing-user:${appointment.userId}`);
    if (!careProjectIds.has(appointment.careProjectId)) issues.push(`appointment:${appointment.id}:missing-care-project:${appointment.careProjectId}`);
    if (!storeIds.has(appointment.storeId)) issues.push(`appointment:${appointment.id}:missing-store:${appointment.storeId}`);
    const project = findById(careProjects, appointment.careProjectId);
    if (project && !project.storeIds.includes(appointment.storeId)) issues.push(`appointment:${appointment.id}:project-not-available-at-store:${appointment.storeId}`);
    if (appointment.status === "completed" && !appointment.completedAt) issues.push(`appointment:${appointment.id}:completed-status-missing-completed-at`);
    if (appointment.slotId) {
      if (!appointmentSlotIds.has(appointment.slotId)) issues.push(`appointment:${appointment.id}:missing-slot:${appointment.slotId}`);
      const slot = findById(appointmentSlots, appointment.slotId);
      if (slot && (slot.careProjectId !== appointment.careProjectId || slot.storeId !== appointment.storeId)) {
        issues.push(`appointment:${appointment.id}:slot-domain-mismatch:${appointment.slotId}`);
      }
    }
  }

  const fulfillmentModes = new Set(v02Orders.map((order) => order.fulfillmentDetail?.mode).filter(Boolean));
  for (const requiredMode of ["pickup", "short_delivery", "parcel_delivery"] as const) {
    if (!fulfillmentModes.has(requiredMode)) issues.push(`fixture:missing-fulfillment-sample:${requiredMode}`);
  }

  for (const order of v02Orders) {
    if (!userIds.has(order.userId)) issues.push(`order:${order.id}:missing-user:${order.userId}`);
    if (order.storeId && !storeIds.has(order.storeId)) issues.push(`order:${order.id}:missing-store:${order.storeId}`);
    for (const item of order.items) {
      if (item.kind === "product" && !productIds.has(item.id)) issues.push(`order:${order.id}:missing-product:${item.id}`);
      if (item.kind === "service" && !serviceIds.has(item.id)) issues.push(`order:${order.id}:missing-service:${item.id}`);
    }

    if (order.scene === "store") {
      if (!order.storeId) issues.push(`order:${order.id}:store-order-missing-store`);
      else {
        for (const item of order.items.filter((entry) => entry.kind === "product")) {
          const availability = productAvailability.find((entry) => entry.storeId === order.storeId && entry.productId === item.id);
          if (!availability) issues.push(`order:${order.id}:cross-store-or-missing-availability:${item.id}`);
        }
      }
      if (order.channelId || order.storefrontId) issues.push(`order:${order.id}:store-order-must-not-use-online-storefront`);
    }

    if (order.scene === "mall") {
      if (!order.channelId || !channelIds.has(order.channelId)) issues.push(`order:${order.id}:missing-channel:${order.channelId ?? "none"}`);
      if (!order.storefrontId || !storefrontIds.has(order.storefrontId)) issues.push(`order:${order.id}:missing-storefront:${order.storefrontId ?? "none"}`);
      const storefront = order.storefrontId ? findById(storefronts, order.storefrontId) : undefined;
      if (storefront && storefront.channelId !== order.channelId) issues.push(`order:${order.id}:storefront-channel-mismatch`);
    }

    const detail = order.fulfillmentDetail;
    if (detail?.mode === "short_delivery") {
      const store = order.storeId ? findById(offlineStores, order.storeId) : undefined;
      if (!store?.capabilities.includes("short_delivery")) issues.push(`order:${order.id}:store-has-no-short-delivery-capability`);
      if (store?.deliveryRadiusKm && detail.distanceKm && detail.distanceKm > store.deliveryRadiusKm) issues.push(`order:${order.id}:short-delivery-outside-radius`);
    }
    if (detail?.appointmentId) {
      const appointment = findById(appointments, detail.appointmentId);
      if (!appointment) {
        issues.push(`order:${order.id}:missing-appointment:${detail.appointmentId}`);
      } else if (order.scene === "care") {
        if (appointment.userId !== order.userId) issues.push(`order:${order.id}:appointment-user-mismatch:${appointment.id}`);
        const fulfillmentStoreId = detail.storeId ?? order.storeId;
        if (fulfillmentStoreId && appointment.storeId !== fulfillmentStoreId) issues.push(`order:${order.id}:appointment-store-mismatch:${appointment.id}`);
        if ((order.status === "completed" || detail.status === "completed") && appointment.status !== "completed") {
          issues.push(`order:${order.id}:completed-care-order-requires-completed-appointment:${appointment.id}`);
        }
      }
    }
  }

  for (const coupon of v02Coupons) {
    if (!userIds.has(coupon.userId)) issues.push(`coupon:${coupon.id}:missing-user:${coupon.userId}`);
    for (const storeId of coupon.applicableStoreIds) if (!storeIds.has(storeId)) issues.push(`coupon:${coupon.id}:missing-store:${storeId}`);
  }
  for (const entry of pointLedger) {
    if (!userIds.has(entry.userId)) issues.push(`points:${entry.id}:missing-user:${entry.userId}`);
    if (entry.relatedOrderId && !orderIds.has(entry.relatedOrderId)) issues.push(`points:${entry.id}:missing-order:${entry.relatedOrderId}`);
  }

  for (const record of detectionRecords) {
    if (!userIds.has(record.userId)) issues.push(`detection:${record.id}:missing-user:${record.userId}`);
    if (!appointmentIds.has(record.appointmentId)) issues.push(`detection:${record.id}:missing-appointment:${record.appointmentId}`);
    if (!careProjectIds.has(record.careProjectId)) issues.push(`detection:${record.id}:missing-care-project:${record.careProjectId}`);
    if (!storeIds.has(record.storeId)) issues.push(`detection:${record.id}:missing-store:${record.storeId}`);
    if (record.reportId && !reportIds.has(record.reportId)) issues.push(`detection:${record.id}:missing-report:${record.reportId}`);
  }

  for (const report of detectionReports) {
    if (!userIds.has(report.userId)) issues.push(`report:${report.id}:missing-user:${report.userId}`);
    if (!storeIds.has(report.storeId)) issues.push(`report:${report.id}:missing-store:${report.storeId}`);
    if (!serviceIds.has(report.serviceId)) issues.push(`report:${report.id}:missing-service:${report.serviceId}`);
    if (report.detectionRecordId && !detectionRecordIds.has(report.detectionRecordId)) issues.push(`report:${report.id}:missing-detection-record:${report.detectionRecordId}`);
    if (report.appointmentId && !appointmentIds.has(report.appointmentId)) issues.push(`report:${report.id}:missing-appointment:${report.appointmentId}`);
    if (report.careProjectId && !careProjectIds.has(report.careProjectId)) issues.push(`report:${report.id}:missing-care-project:${report.careProjectId}`);
    if (report.exclusiveCouponId && !couponIds.has(report.exclusiveCouponId)) issues.push(`report:${report.id}:missing-exclusive-coupon:${report.exclusiveCouponId}`);
    if (report.recommendedServiceId && !serviceIds.has(report.recommendedServiceId)) issues.push(`report:${report.id}:missing-recommended-service:${report.recommendedServiceId}`);
    if (report.comparisonReportId && !reportIds.has(report.comparisonReportId)) issues.push(`report:${report.id}:missing-comparison-report:${report.comparisonReportId}`);
    if (report.comparisonReportId === report.id) issues.push(`report:${report.id}:self-comparison`);
  }

  for (const redemption of redemptions) {
    if (!userIds.has(redemption.userId)) issues.push(`redemption:${redemption.id}:missing-user:${redemption.userId}`);
    if (!storeIds.has(redemption.storeId)) issues.push(`redemption:${redemption.id}:missing-store:${redemption.storeId}`);
    const targetExists = redemption.targetType === "order" ? orderIds.has(redemption.targetId) : redemption.targetType === "coupon" ? couponIds.has(redemption.targetId) : serviceIds.has(redemption.targetId);
    if (!targetExists) issues.push(`redemption:${redemption.id}:missing-${redemption.targetType}:${redemption.targetId}`);
  }

  for (const campaign of campaigns) {
    for (const ref of campaign.refs) {
      const exists = ref.type === "product" ? productIds.has(ref.id) : ref.type === "care_project" ? careProjectIds.has(ref.id) : ref.type === "coupon" ? couponIds.has(ref.id) : storefrontIds.has(ref.id);
      if (!exists) issues.push(`campaign:${campaign.id}:missing-${ref.type}:${ref.id}`);
    }
  }

  return issues;
}
