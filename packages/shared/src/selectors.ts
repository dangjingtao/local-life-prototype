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
  communities,
  communityNudgeStates,
  convenienceBrowseCategories,
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
  prototypeRules,
  pickupCredentials,
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
import type { BusinessScene, OfflineStore, PickupCredential, PickupCredentialStatus, PurchasePointProjection, StoreDeliveryAddress } from "./domain";

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

const convenienceProductTypeRank = { single: 0, combo: 1 } as const;

export function getConvenienceBrowseSections(storeId: string) {
  const productsAtStore = getStoreProducts(storeId)
    .filter((product) => product.type && product.browseCategoryId)
    .slice();

  return convenienceBrowseCategories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const sectionProducts = productsAtStore
        .filter((product) => product.browseCategoryId === category.id)
        .sort((a, b) => {
          const typeDelta = convenienceProductTypeRank[a.type!] - convenienceProductTypeRank[b.type!];
          if (typeDelta !== 0) return typeDelta;
          const orderDelta = (a.browseOrder ?? Number.MAX_SAFE_INTEGER) - (b.browseOrder ?? Number.MAX_SAFE_INTEGER);
          return orderDelta || a.id.localeCompare(b.id);
        });
      return {
        category,
        anchorId: `convenience-category-${category.id.toLowerCase()}`,
        products: sectionProducts,
        single: sectionProducts.filter((product) => product.type === "single"),
        combo: sectionProducts.filter((product) => product.type === "combo"),
      };
    })
    .filter((section) => section.products.length > 0);
}

export function getPurchasePointProjection(scene: BusinessScene, eligibleYuan: number): PurchasePointProjection {
  const normalizedYuan = Math.max(0, eligibleYuan);
  const earnRate = prototypeRules.purchasePointsEarnRate.value[scene];
  return {
    scene,
    eligibleYuan: normalizedYuan,
    earnRate,
    exactPoints: normalizedYuan * earnRate,
    baseRuleStatus: prototypeRules.purchasePointsBase.status,
    roundingRuleStatus: prototypeRules.purchasePointsRounding.status,
  };
}

export function getPickupCredentialForOrder(orderId: string) {
  return pickupCredentials.find((credential) => credential.orderId === orderId);
}

export function getPickupCredentialStatus(
  credential: PickupCredential | undefined,
  atIso: string,
): PickupCredentialStatus {
  if (!credential) return "expired";
  const order = findById(v02Orders, credential.orderId);
  const redemption = findById(redemptions, credential.redemptionId);
  if (!order || order.fulfillmentDetail?.mode !== "pickup") return "expired";
  if (
    order.status === "cancelled" ||
    order.status === "completed" ||
    order.fulfillmentDetail.status === "cancelled" ||
    order.fulfillmentDetail.status === "completed" ||
    !redemption ||
    redemption.status !== "pending"
  ) {
    return "expired";
  }

  const at = Date.parse(atIso);
  const validFrom = Date.parse(credential.validFrom);
  const validUntil = Date.parse(credential.validUntil);
  if (!Number.isFinite(at) || !Number.isFinite(validFrom) || !Number.isFinite(validUntil)) return "expired";
  if (at > validUntil) return "expired";
  if (order.status !== "pending_pickup" || order.fulfillmentDetail.status !== "ready_for_pickup") return "inactive";
  if (at < validFrom) return "inactive";
  return "active";
}

export function getCommunityForStore(storeId: string) {
  return communities.find((community) => community.applicableStoreIds.includes(storeId));
}

export function shouldShowCommunityNudge(userId: string, _communityId: string, atIso: string) {
  const latestShownAt = communityNudgeStates
    .filter((item) => item.userId === userId && item.lastShownAt)
    .map((item) => item.lastShownAt!)
    .sort((a, b) => b.localeCompare(a))[0];

  if (!latestShownAt) return true;
  const at = Date.parse(atIso);
  const lastShown = Date.parse(latestShownAt);
  if (!Number.isFinite(at) || !Number.isFinite(lastShown)) return false;
  const cooldownMs = prototypeRules.communityNudgeCooldownDays.value * 24 * 60 * 60 * 1000;
  return at - lastShown >= cooldownMs;
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
  const redemptionIds = new Set(redemptions.map((item) => item.id));
  const communityIds = new Set(communities.map((item) => item.id));
  const browseCategoryIds = new Set(convenienceBrowseCategories.map((item) => item.id));

  if (offlineStores.length < 3) issues.push("fixture:requires-at-least-3-offline-stores");
  if (channels.length < 2 || storefronts.length < 2) {
    issues.push("fixture:requires-at-least-2-online-channel-storefront-samples");
  }
  if (detectionReports.filter((report) => report.userId === CORE_DEMO_IDS.user).length < 2) {
    issues.push(`fixture:user:${CORE_DEMO_IDS.user}:requires-at-least-2-care-reports`);
  }

  const browseCategoryOrder = convenienceBrowseCategories.map((item) => item.sortOrder);
  if (new Set(convenienceBrowseCategories.map((item) => item.id)).size !== convenienceBrowseCategories.length) {
    issues.push("browse:duplicate-category-id");
  }
  if (new Set(browseCategoryOrder).size !== browseCategoryOrder.length) {
    issues.push("browse:duplicate-category-sort-order");
  }
  for (const product of catalogProducts.filter((item) => item.scenes.includes("store"))) {
    if (!product.type) issues.push(`browse:product:${product.id}:missing-type`);
    if (!product.browseCategoryId) issues.push(`browse:product:${product.id}:missing-category-id`);
    else if (!browseCategoryIds.has(product.browseCategoryId)) issues.push(`browse:product:${product.id}:unknown-category:${product.browseCategoryId}`);
    if (typeof product.browseOrder !== "number") issues.push(`browse:product:${product.id}:missing-order`);
  }
  const coreBrowseSections = getConvenienceBrowseSections(CORE_DEMO_IDS.store);
  if (!coreBrowseSections.some((section) => section.single.length > 0 && section.combo.length > 0)) {
    issues.push(`browse:store:${CORE_DEMO_IDS.store}:requires-mixed-single-combo-section`);
  }
  for (const section of coreBrowseSections) {
    const seenCombo = section.products.some((product, index) =>
      product.type === "combo" && section.products.slice(index + 1).some((later) => later.type === "single"),
    );
    if (seenCombo) issues.push(`browse:section:${section.category.id}:single-after-combo`);
  }

  if (prototypeRules.purchasePointsEarnRate.status !== "confirmed") issues.push("points:purchase-earn-rate-must-be-confirmed");
  for (const scene of ["store", "mall", "care"] as const) {
    if (prototypeRules.purchasePointsEarnRate.value[scene] <= 0) issues.push(`points:invalid-purchase-rate:${scene}`);
  }
  if (prototypeRules.pointsToCash.status !== "candidate") issues.push("points:cash-rate-must-remain-candidate");
  if (prototypeRules.purchasePointsBase.status !== "unknown") issues.push("points:purchase-base-must-remain-unknown");
  if (prototypeRules.purchasePointsRounding.status !== "unknown") issues.push("points:rounding-must-remain-unknown");
  if (prototypeRules.pointsRedemptionLimit.status !== "unknown") issues.push("points:redemption-limit-must-remain-unknown");
  if (prototypeRules.communityNudgeCooldownDays.value !== 7 || prototypeRules.communityNudgeCooldownDays.status !== "confirmed") {
    issues.push("community:nudge-cooldown-must-be-7-days-confirmed");
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

  const coreStoreConvenienceModes = new Set(
    v02Orders
      .filter((order) => order.scene === "store" && order.storeId === CORE_DEMO_IDS.store)
      .map((order) => order.fulfillmentDetail?.mode)
      .filter(Boolean),
  );
  for (const requiredMode of ["pickup", "short_delivery"] as const) {
    if (!coreStoreConvenienceModes.has(requiredMode)) {
      issues.push(`fixture:store:${CORE_DEMO_IDS.store}:missing-convenience-mode:${requiredMode}`);
    }
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

  const credentialOrderIds = new Set<string>();
  for (const credential of pickupCredentials) {
    if (!orderIds.has(credential.orderId)) issues.push(`pickup-credential:${credential.id}:missing-order:${credential.orderId}`);
    if (!redemptionIds.has(credential.redemptionId)) issues.push(`pickup-credential:${credential.id}:missing-redemption:${credential.redemptionId}`);
    if (credentialOrderIds.has(credential.orderId)) issues.push(`pickup-credential:${credential.id}:duplicate-order:${credential.orderId}`);
    credentialOrderIds.add(credential.orderId);
    const order = findById(v02Orders, credential.orderId);
    const redemption = findById(redemptions, credential.redemptionId);
    if (order?.fulfillmentDetail?.mode !== "pickup") issues.push(`pickup-credential:${credential.id}:order-not-pickup`);
    if (redemption && (redemption.targetType !== "order" || redemption.targetId !== credential.orderId)) {
      issues.push(`pickup-credential:${credential.id}:redemption-order-mismatch`);
    }
    if (redemption && redemption.code !== credential.pickupCode) issues.push(`pickup-credential:${credential.id}:code-mismatch-redemption`);
    if (order?.fulfillmentDetail?.pickupCode && order.fulfillmentDetail.pickupCode !== credential.pickupCode) {
      issues.push(`pickup-credential:${credential.id}:code-mismatch-order`);
    }
    if (!Number.isFinite(Date.parse(credential.validFrom)) || !Number.isFinite(Date.parse(credential.validUntil))) {
      issues.push(`pickup-credential:${credential.id}:invalid-validity-window`);
    } else if (Date.parse(credential.validUntil) <= Date.parse(credential.validFrom)) {
      issues.push(`pickup-credential:${credential.id}:invalid-validity-order`);
    }
  }

  for (const community of communities) {
    for (const storeId of community.applicableStoreIds) if (!storeIds.has(storeId)) issues.push(`community:${community.id}:missing-store:${storeId}`);
    if (!community.qrAssetKey) issues.push(`community:${community.id}:missing-qr-asset-key`);
    if (community.benefits.length < 3) issues.push(`community:${community.id}:insufficient-benefits`);
  }
  const communityNudgeKeys = new Set<string>();
  for (const state of communityNudgeStates) {
    if (!userIds.has(state.userId)) issues.push(`community-nudge:${state.userId}:missing-user`);
    if (!communityIds.has(state.communityId)) issues.push(`community-nudge:${state.userId}:missing-community:${state.communityId}`);
    const key = `${state.userId}:${state.communityId}`;
    if (communityNudgeKeys.has(key)) issues.push(`community-nudge:${key}:duplicate`);
    communityNudgeKeys.add(key);
    if (state.lastShownAt && !Number.isFinite(Date.parse(state.lastShownAt))) issues.push(`community-nudge:${key}:invalid-last-shown-at`);
  }

  for (const campaign of campaigns) {
    for (const ref of campaign.refs) {
      const exists = ref.type === "product" ? productIds.has(ref.id) : ref.type === "care_project" ? careProjectIds.has(ref.id) : ref.type === "coupon" ? couponIds.has(ref.id) : storefrontIds.has(ref.id);
      if (!exists) issues.push(`campaign:${campaign.id}:missing-${ref.type}:${ref.id}`);
    }
  }

  return issues;
}
