import type { Appointment, Campaign, CareAppointmentSlot, CareProject, Channel, ConvenienceCart, Coupon, DetectionRecord, DetectionReport, OfflineStore, OnlineStorefront, Order, Partner, PointLedgerEntry, Product, ProductAvailability, PrototypeRule, RedemptionRecord, Service, StoreDeliveryAddress, User } from "./domain";

export const CORE_DEMO_IDS = {
  user: "LL-8888", partner: "PARTNER-YUNLING", store: "STORE-YUNLING", pickupOrder: "LL-1024",
  shortDeliveryOrder: "LL-1030", mallOrder: "LL-1031", experienceCoupon: "EXPERIENCE-8888-01",
  report: "REPORT-CARE-0001", previousReport: "REPORT-CARE-0000", appointment: "APPOINTMENT-8888-01",
  detectionRecord: "DETECTION-8888-01", pickupRedemption: "REDEEM-LL-1024", careRedemption: "REDEEM-EXPERIENCE-8888-01",
} as const;

const legacyPartnerIds = new Set([CORE_DEMO_IDS.partner, "PARTNER-NANAN"]);
const legacyStoreIds = new Set([CORE_DEMO_IDS.store, "STORE-NANAN"]);
const legacyProductIds = new Set(["PRODUCT-SCALP-SET", "PRODUCT-CLEAN-SET", "PRODUCT-LIGHT-LIFE", "PRODUCT-SKIN-TRIAL"]);
const legacyServiceIds = new Set(["SERVICE-CARE-BASIC", "SERVICE-CARE-PACKAGE"]);
const legacyOrderIds = new Set([CORE_DEMO_IDS.pickupOrder, "LL-1023", "LL-1022", "LL-1021"]);
const legacyCouponIds = new Set(["COUPON-8888-01", "COUPON-8888-02", "COUPON-8888-03", CORE_DEMO_IDS.experienceCoupon, "EXPERIENCE-8888-02"]);

export const prototypeRules = {
  membershipLevels: { value: ["standard", "silver", "gold", "black", "black_gold"] as const, status: "candidate", note: "会员等级名称来自 V0.1 候选方案，等级门槛与权益规则尚未确认。" },
  pointsToCash: { value: { points: 100, yuan: 1 }, status: "candidate", note: "100 积分抵 1 元仅为候选示例，不作为固定业务规则。" },
  settlement: { value: null, status: "unknown", note: "支付通道、收款主体、退款、分账比例和结算周期尚未确定。" },
  shortDeliveryRadiusKm: { value: 3, status: "confirmed", note: "V0.2 已确认便利店支持约 3 公里短距配送；fixtures 不模拟真实地图或调度。" },
  careDeviceIntegration: { value: null, status: "unknown", note: "检测设备与正式报告字段尚未确定；V0.2 只模拟非医疗性质的检测记录与报告结构。" },
  externalMallIntegration: { value: null, status: "unknown", note: "Storefront / Channel 仅验证多渠道商城语义，不代表已确认外部平台 API 接入方案。" },
} satisfies Record<string, PrototypeRule<unknown>>;

export const users: User[] = [
  { id: CORE_DEMO_IDS.user, displayName: "林女士", member: { level: "silver", ruleStatus: "candidate", note: "银卡为演示身份；会员等级规则尚未确认。" }, pointsBalance: 1280, source: "store", usualStoreId: CORE_DEMO_IDS.store },
  { id: "LL-8891", displayName: "周先生", member: { level: "standard", ruleStatus: "candidate", note: "会员等级规则尚未确认。" }, pointsBalance: 420, source: "mall" },
  { id: "LL-8892", displayName: "陈女士", member: { level: "gold", ruleStatus: "candidate", note: "会员等级规则尚未确认。" }, pointsBalance: 2160, source: "care" },
  { id: "LL-8893", displayName: "赵先生", member: { level: "standard", ruleStatus: "candidate", note: "会员等级规则尚未确认。" }, pointsBalance: 760, source: "store" },
];

export const businessPartners: Partner[] = [
  { id: CORE_DEMO_IDS.partner, name: "云岭生活合作商", carrierType: "convenience_store", region: "华南" },
  { id: "PARTNER-NANAN", name: "南岸生活服务合作商", carrierType: "club", region: "华南" },
  { id: "PARTNER-XINGHE", name: "星河社区合作商", carrierType: "convenience_store", region: "华南" },
];
export const partners = businessPartners.filter((item) => legacyPartnerIds.has(item.id));

export const offlineStores: OfflineStore[] = [
  { id: CORE_DEMO_IDS.store, partnerId: CORE_DEMO_IDS.partner, name: "云岭社区店", address: "广州市天河区云岭路 18 号首层", distanceKm: 0.8, status: "open", businessHours: "07:30-22:30", deliveryRadiusKm: 3, capabilities: ["pickup", "short_delivery", "care_detection"] },
  { id: "STORE-NANAN", partnerId: "PARTNER-NANAN", name: "南岸生活馆", address: "广州市海珠区南岸里 26 号", distanceKm: 2.4, status: "open", businessHours: "09:00-21:30", deliveryRadiusKm: 3, capabilities: ["pickup", "short_delivery", "care_detection", "care_service"] },
  { id: "STORE-XINGHE", partnerId: "PARTNER-XINGHE", name: "星河社区店", address: "广州市越秀区星河街 9 号", distanceKm: 3.6, status: "closed", businessHours: "08:00-22:00", capabilities: ["pickup"] },
];
export const stores = offlineStores.filter((item) => legacyStoreIds.has(item.id));

export const catalogProducts: Product[] = [
  { id: "PRODUCT-SCALP-SET", name: "头皮养护套装", priceYuan: 129, originalPriceYuan: 159, memberPriceYuan: 119, category: "洗护", spec: "洗发露 300ml + 头皮精华 30ml", promotionLabel: "会员专享", type: "combo", scenes: ["store", "mall"], fulfillment: ["pickup", "home_delivery", "store_delivery"] },
  { id: "PRODUCT-CLEAN-SET", name: "日常清洁组合", priceYuan: 69, category: "日用", spec: "洗手液 300ml + 湿巾 80 抽", type: "combo", scenes: ["store", "mall"], fulfillment: ["pickup", "home_delivery", "store_delivery"] },
  { id: "PRODUCT-LIGHT-LIFE", name: "轻盈生活组合", priceYuan: 99, memberPriceYuan: 89, category: "生活方式", spec: "轻食杯 + 随行杯", promotionLabel: "本周推荐", type: "combo", scenes: ["store", "mall"], fulfillment: ["pickup", "home_delivery", "store_delivery"] },
  { id: "PRODUCT-SKIN-TRIAL", name: "肌肤护理体验", priceYuan: 39, category: "护理", spec: "7 日体验装", type: "single", scenes: ["mall", "care"], fulfillment: ["home_delivery", "store_delivery"] },
  { id: "PRODUCT-OAT-LATTE", name: "燕麦拿铁", priceYuan: 13.9, memberPriceYuan: 11.9, category: "咖啡饮品", spec: "280ml", promotionLabel: "第二件 8 折", type: "single", scenes: ["store"], fulfillment: ["pickup", "store_delivery"] },
  { id: "PRODUCT-SPARKLING-WATER", name: "青柠气泡水", priceYuan: 6.5, category: "饮料", spec: "480ml", type: "single", scenes: ["store"], fulfillment: ["pickup", "store_delivery"] },
  { id: "PRODUCT-EGG-SANDWICH", name: "溏心蛋火腿三明治", priceYuan: 12.8, category: "鲜食", spec: "1 份", promotionLabel: "早餐热卖", type: "single", scenes: ["store"], fulfillment: ["pickup", "store_delivery"] },
  { id: "PRODUCT-COLLAGEN-DRINK", name: "胶原蛋白肽饮", priceYuan: 168, originalPriceYuan: 198, category: "营养健康", spec: "30ml × 10 瓶", promotionLabel: "商城包邮", type: "single", scenes: ["mall"], fulfillment: ["home_delivery"] },
];
export const products = catalogProducts.filter((item) => legacyProductIds.has(item.id));

export const productAvailability: ProductAvailability[] = [
  { id: "AVAIL-YUNLING-OAT", storeId: CORE_DEMO_IDS.store, productId: "PRODUCT-OAT-LATTE", status: "available", priceYuan: 13.9, memberPriceYuan: 11.9, stockLabel: "现货", promotionLabel: "第二件 8 折" },
  { id: "AVAIL-YUNLING-WATER", storeId: CORE_DEMO_IDS.store, productId: "PRODUCT-SPARKLING-WATER", status: "available", priceYuan: 6.5, stockLabel: "现货" },
  { id: "AVAIL-YUNLING-SANDWICH", storeId: CORE_DEMO_IDS.store, productId: "PRODUCT-EGG-SANDWICH", status: "low_stock", priceYuan: 12.8, stockLabel: "仅余 3 件" },
  { id: "AVAIL-YUNLING-LIGHT", storeId: CORE_DEMO_IDS.store, productId: "PRODUCT-LIGHT-LIFE", status: "available", priceYuan: 99, memberPriceYuan: 89, stockLabel: "现货" },
  { id: "AVAIL-YUNLING-SCALP", storeId: CORE_DEMO_IDS.store, productId: "PRODUCT-SCALP-SET", status: "available", priceYuan: 129, memberPriceYuan: 119, stockLabel: "现货" },
  { id: "AVAIL-NANAN-OAT", storeId: "STORE-NANAN", productId: "PRODUCT-OAT-LATTE", status: "sold_out", priceYuan: 13.9, stockLabel: "今日售罄" },
  { id: "AVAIL-NANAN-WATER", storeId: "STORE-NANAN", productId: "PRODUCT-SPARKLING-WATER", status: "available", priceYuan: 6.5, stockLabel: "现货" },
  { id: "AVAIL-NANAN-CLEAN", storeId: "STORE-NANAN", productId: "PRODUCT-CLEAN-SET", status: "available", priceYuan: 69, stockLabel: "现货" },
  { id: "AVAIL-XINGHE-WATER", storeId: "STORE-XINGHE", productId: "PRODUCT-SPARKLING-WATER", status: "unavailable", priceYuan: 6.5, stockLabel: "门店休息中" },
];

export const convenienceCarts: ConvenienceCart[] = [
  { id: "CART-8888-YUNLING", userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, items: [{ productId: "PRODUCT-OAT-LATTE", quantity: 2 }, { productId: "PRODUCT-EGG-SANDWICH", quantity: 1 }], updatedAt: "2026-08-31T11:20:00+08:00" },
  { id: "CART-8888-NANAN", userId: CORE_DEMO_IDS.user, storeId: "STORE-NANAN", items: [{ productId: "PRODUCT-CLEAN-SET", quantity: 1 }], updatedAt: "2026-08-31T09:05:00+08:00" },
];

// T018 delivery addresses: each entry is relative to one store and carries an estimated
// straight-line distance so the settlement page can express an in-range / out-of-range
// demo state without a real map or routing service.
export const storeDeliveryAddresses: StoreDeliveryAddress[] = [
  { id: "ADDR-YUNLING-HOME", userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, label: "家", recipient: "林女士", phone: "138****8899", address: "广州市天河区云岭路 12 号 802 房", distanceKm: 1.2 },
  { id: "ADDR-YUNLING-OFFICE", userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, label: "公司", recipient: "林女士", phone: "138****8899", address: "广州市天河区珠江新城华夏路 30 号", distanceKm: 2.9 },
  { id: "ADDR-YUNLING-FAR", userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, label: "郊外地址", recipient: "林女士", phone: "138****8899", address: "广州市白云区太和镇远郊路 1 号", distanceKm: 4.5 },
  { id: "ADDR-NANAN-HOME", userId: CORE_DEMO_IDS.user, storeId: "STORE-NANAN", label: "家", recipient: "林女士", phone: "138****8899", address: "广州市海珠区滨江东路 188 号", distanceKm: 1.7 },
  { id: "ADDR-NANAN-FAR", userId: CORE_DEMO_IDS.user, storeId: "STORE-NANAN", label: "超范围示例", recipient: "林女士", phone: "138****8899", address: "广州市番禺区市桥街示例路 66 号", distanceKm: 5.2 },
];

export const careServices: Service[] = [
  { id: "SERVICE-CARE-BASIC", name: "基础状态检测体验", category: "detection", priceYuan: 39, storeIds: [CORE_DEMO_IDS.store, "STORE-NANAN"], capabilityStatus: "candidate", note: "仅用于基础、中性结果演示，不代表实时、高精度或医疗诊断。" },
  { id: "SERVICE-CARE-PACKAGE", name: "基础护理套餐", category: "care_package", priceYuan: 199, storeIds: ["STORE-NANAN"], capabilityStatus: "candidate", note: "套餐价格与权益为原型数据，正式规则待确认。" },
  { id: "SERVICE-CARE-EXPERIENCE", name: "屏障舒缓护理体验", category: "experience", priceYuan: 89, storeIds: ["STORE-NANAN"], capabilityStatus: "candidate", note: "体验内容和价格仅用于 V0.2 转化链路演示。" },
];
export const services = careServices.filter((item) => legacyServiceIds.has(item.id));

export const channels: Channel[] = [
  { id: "CHANNEL-OWNED", name: "本地生活私域商城", kind: "owned", integrationStatus: "mock", note: "自有商城语义样本。" },
  { id: "CHANNEL-DOUYIN", name: "抖音店渠道", kind: "douyin", integrationStatus: "planned", note: "仅为渠道语义样本，不调用真实抖音 API。" },
];
export const storefronts: OnlineStorefront[] = [
  { id: "STOREFRONT-PRIVATE", channelId: "CHANNEL-OWNED", name: "本地生活精选商城", status: "active", fulfillment: "parcel_delivery", serviceArea: "nationwide" },
  { id: "STOREFRONT-DOUYIN", channelId: "CHANNEL-DOUYIN", name: "抖音店商品橱窗", status: "active", fulfillment: "parcel_delivery", serviceArea: "nationwide", note: "展示来源语义，不代表真实接入。" },
];

export const careProjects: CareProject[] = [
  { id: "CARE-PROJECT-BASIC", serviceId: "SERVICE-CARE-BASIC", name: "基础状态检测", summary: "约 30 分钟完成基础状态记录，并生成非医疗性质的趋势报告。", priceYuan: 39, durationMinutes: 30, storeIds: [CORE_DEMO_IDS.store, "STORE-NANAN"], capabilityStatus: "candidate", note: "检测能力为原型语义。" },
  { id: "CARE-PROJECT-SOOTHING", serviceId: "SERVICE-CARE-EXPERIENCE", name: "屏障舒缓护理", summary: "结合基础状态记录安排一次舒缓护理体验。", priceYuan: 89, durationMinutes: 50, storeIds: ["STORE-NANAN"], capabilityStatus: "candidate", note: "护理方案为转化演示数据。" },
];
export const appointmentSlots: CareAppointmentSlot[] = [
  { id: "SLOT-YUNLING-0901-1030", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, startsAt: "2026-09-01T10:30:00+08:00", durationMinutes: 30, capacity: 2, bookedCount: 1, status: "booked" },
  { id: "SLOT-YUNLING-0901-1500", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, startsAt: "2026-09-01T15:00:00+08:00", durationMinutes: 30, capacity: 2, bookedCount: 0, status: "available" },
  { id: "SLOT-NANAN-0901-1400", careProjectId: "CARE-PROJECT-SOOTHING", storeId: "STORE-NANAN", startsAt: "2026-09-01T14:00:00+08:00", durationMinutes: 50, capacity: 1, bookedCount: 1, status: "full" },
];
export const appointments: Appointment[] = [
  { id: CORE_DEMO_IDS.appointment, userId: CORE_DEMO_IDS.user, careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, slotId: "SLOT-YUNLING-0901-1030", status: "scheduled", scheduledAt: "2026-09-01T10:30:00+08:00", durationMinutes: 30, qrCode: "CARE-APPT-8888", createdAt: "2026-08-31T08:10:00+08:00" },
  { id: "APPOINTMENT-8888-RECENT", userId: CORE_DEMO_IDS.user, careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "completed", scheduledAt: "2026-08-27T14:30:00+08:00", durationMinutes: 30, checkedInAt: "2026-08-27T14:27:00+08:00", completedAt: "2026-08-27T15:02:00+08:00", createdAt: "2026-08-25T09:12:00+08:00" },
  { id: "APPOINTMENT-8888-PREVIOUS", userId: CORE_DEMO_IDS.user, careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "completed", scheduledAt: "2026-07-20T10:00:00+08:00", durationMinutes: 30, checkedInAt: "2026-07-20T09:57:00+08:00", completedAt: "2026-07-20T10:31:00+08:00", createdAt: "2026-07-18T18:00:00+08:00" },
  { id: "APPOINTMENT-8892-COMPLETED", userId: "LL-8892", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "completed", scheduledAt: "2026-08-26T16:00:00+08:00", durationMinutes: 30, checkedInAt: "2026-08-26T15:57:00+08:00", completedAt: "2026-08-26T16:34:00+08:00", createdAt: "2026-08-24T10:15:00+08:00" },
  { id: "APPOINTMENT-8892-CHECKIN", userId: "LL-8892", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "checked_in", scheduledAt: "2026-08-31T12:30:00+08:00", durationMinutes: 30, qrCode: "CARE-APPT-8892", checkedInAt: "2026-08-31T12:24:00+08:00", createdAt: "2026-08-29T16:20:00+08:00" },
  { id: "APPOINTMENT-8893-CANCELLED", userId: "LL-8893", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "cancelled", scheduledAt: "2026-08-30T11:30:00+08:00", durationMinutes: 30, createdAt: "2026-08-28T19:40:00+08:00" },
  { id: "APPOINTMENT-8893-RESCHEDULED", userId: "LL-8893", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "rescheduled", scheduledAt: "2026-09-01T11:00:00+08:00", durationMinutes: 30, createdAt: "2026-08-30T09:20:00+08:00" },
];

export const v02Orders: Order[] = [
  { id: CORE_DEMO_IDS.pickupOrder, userId: CORE_DEMO_IDS.user, scene: "store", status: "pending_pickup", fulfillment: "pickup", fulfillmentDetail: { mode: "pickup", status: "ready_for_pickup", storeId: CORE_DEMO_IDS.store, pickupWindow: "今天 12:30-13:00", pickupCode: "LL-1024" }, storeId: CORE_DEMO_IDS.store, items: [{ kind: "product", id: "PRODUCT-LIGHT-LIFE", name: "轻盈生活组合", quantity: 1, unitPriceYuan: 99 }], amountYuan: 99, createdAt: "2026-08-27T10:20:00+08:00" },
  { id: "LL-1023", userId: "LL-8891", scene: "mall", status: "shipping", fulfillment: "home_delivery", fulfillmentDetail: { mode: "parcel_delivery", status: "shipping", carrier: "中通快递", trackingNo: "ZT202608270023", deliveryAddress: "深圳市南山区科技南十二路 8 号" }, channelId: "CHANNEL-DOUYIN", storefrontId: "STOREFRONT-DOUYIN", items: [{ kind: "product", id: "PRODUCT-SCALP-SET", name: "头皮养护套装", quantity: 1, unitPriceYuan: 129 }], amountYuan: 129, createdAt: "2026-08-27T09:10:00+08:00" },
  { id: "LL-1022", userId: "LL-8892", scene: "care", status: "completed", fulfillment: "service_at_store", fulfillmentDetail: { mode: "service_at_store", status: "completed", storeId: CORE_DEMO_IDS.store, appointmentId: "APPOINTMENT-8892-COMPLETED" }, storeId: CORE_DEMO_IDS.store, items: [{ kind: "service", id: "SERVICE-CARE-BASIC", name: "基础状态检测体验", quantity: 1, unitPriceYuan: 39 }], amountYuan: 39, createdAt: "2026-08-26T16:30:00+08:00" },
  { id: "LL-1021", userId: "LL-8893", scene: "store", status: "pending_pickup", fulfillment: "pickup", fulfillmentDetail: { mode: "pickup", status: "ready_for_pickup", storeId: "STORE-NANAN", pickupWindow: "今天 18:00-19:00", pickupCode: "LL-1021" }, storeId: "STORE-NANAN", items: [{ kind: "product", id: "PRODUCT-CLEAN-SET", name: "日常清洁组合", quantity: 1, unitPriceYuan: 69 }], amountYuan: 69, createdAt: "2026-08-26T14:40:00+08:00" },
  { id: CORE_DEMO_IDS.shortDeliveryOrder, userId: CORE_DEMO_IDS.user, scene: "store", status: "shipping", fulfillment: "store_delivery", fulfillmentDetail: { mode: "short_delivery", status: "delivering", storeId: "STORE-NANAN", deliveryAddress: "广州市海珠区滨江东路 188 号", distanceKm: 1.7, estimatedMinutes: 24 }, storeId: "STORE-NANAN", items: [{ kind: "product", id: "PRODUCT-CLEAN-SET", name: "日常清洁组合", quantity: 1, unitPriceYuan: 69 }, { kind: "product", id: "PRODUCT-SPARKLING-WATER", name: "青柠气泡水", quantity: 2, unitPriceYuan: 6.5 }], amountYuan: 82, createdAt: "2026-08-31T11:02:00+08:00" },
  { id: CORE_DEMO_IDS.mallOrder, userId: CORE_DEMO_IDS.user, scene: "mall", status: "pending_fulfillment", fulfillment: "home_delivery", fulfillmentDetail: { mode: "parcel_delivery", status: "preparing", carrier: "待仓库出库", deliveryAddress: "广州市天河区体育西路 120 号" }, channelId: "CHANNEL-OWNED", storefrontId: "STOREFRONT-PRIVATE", items: [{ kind: "product", id: "PRODUCT-COLLAGEN-DRINK", name: "胶原蛋白肽饮", quantity: 1, unitPriceYuan: 168 }, { kind: "product", id: "PRODUCT-SKIN-TRIAL", name: "肌肤护理体验", quantity: 1, unitPriceYuan: 39 }], amountYuan: 207, createdAt: "2026-08-31T08:45:00+08:00" },
];
export const orders = v02Orders.filter((item) => legacyOrderIds.has(item.id));

export const v02Coupons: Coupon[] = [
  { id: "COUPON-8888-01", userId: CORE_DEMO_IDS.user, kind: "discount", title: "门店 10 元优惠券", scene: "store", status: "available", applicableStoreIds: [CORE_DEMO_IDS.store], claimedAt: "2026-08-20T12:00:00+08:00", expiresAt: "2026-09-30T23:59:59+08:00" },
  { id: "COUPON-8888-02", userId: CORE_DEMO_IDS.user, kind: "discount", title: "商城满减券", scene: "mall", status: "available", applicableStoreIds: [], claimedAt: "2026-08-21T12:00:00+08:00", expiresAt: "2026-09-15T23:59:59+08:00" },
  { id: "COUPON-8888-03", userId: CORE_DEMO_IDS.user, kind: "discount", title: "生活服务代金券", scene: "store", status: "used", applicableStoreIds: ["STORE-NANAN"], claimedAt: "2026-08-01T12:00:00+08:00" },
  { id: CORE_DEMO_IDS.experienceCoupon, userId: CORE_DEMO_IDS.user, kind: "experience", title: "基础检测体验券", scene: "care", status: "available", applicableStoreIds: [CORE_DEMO_IDS.store, "STORE-NANAN"], claimedAt: "2026-08-27T08:30:00+08:00", expiresAt: "2026-09-30T23:59:59+08:00" },
  { id: "EXPERIENCE-8888-02", userId: CORE_DEMO_IDS.user, kind: "experience", title: "护理体验券", scene: "care", status: "available", applicableStoreIds: ["STORE-NANAN"], claimedAt: "2026-08-22T10:00:00+08:00", expiresAt: "2026-09-22T23:59:59+08:00" },
  { id: "COUPON-CARE-8888-REPORT", userId: CORE_DEMO_IDS.user, kind: "discount", title: "检测后专属护理 30 元券", scene: "care", status: "available", applicableStoreIds: ["STORE-NANAN"], claimedAt: "2026-08-27T15:12:00+08:00", expiresAt: "2026-09-27T23:59:59+08:00" },
];
export const coupons = v02Coupons.filter((item) => legacyCouponIds.has(item.id));

export const pointLedger: PointLedgerEntry[] = [
  { id: "POINT-8888-001", userId: CORE_DEMO_IDS.user, direction: "earn", amount: 200, source: "register", balanceAfter: 200, createdAt: "2026-07-12T09:00:00+08:00" },
  { id: "POINT-8888-002", userId: CORE_DEMO_IDS.user, direction: "earn", amount: 800, source: "purchase", scene: "mall", balanceAfter: 1000, createdAt: "2026-08-01T18:20:00+08:00" },
  { id: "POINT-8888-003", userId: CORE_DEMO_IDS.user, direction: "earn", amount: 300, source: "experience", scene: "care", balanceAfter: 1300, createdAt: "2026-08-18T15:40:00+08:00" },
  { id: "POINT-8888-004", userId: CORE_DEMO_IDS.user, direction: "spend", amount: 20, source: "exchange", balanceAfter: 1280, createdAt: "2026-08-20T11:30:00+08:00" },
];

export const detectionRecords: DetectionRecord[] = [
  { id: CORE_DEMO_IDS.detectionRecord, userId: CORE_DEMO_IDS.user, appointmentId: "APPOINTMENT-8888-RECENT", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "completed", recordedAt: "2026-08-27T14:58:00+08:00", reportId: CORE_DEMO_IDS.report },
  { id: "DETECTION-8888-00", userId: CORE_DEMO_IDS.user, appointmentId: "APPOINTMENT-8888-PREVIOUS", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "completed", recordedAt: "2026-07-20T10:25:00+08:00", reportId: CORE_DEMO_IDS.previousReport },
  { id: "DETECTION-8893-CANCELLED", userId: "LL-8893", appointmentId: "APPOINTMENT-8893-CANCELLED", careProjectId: "CARE-PROJECT-BASIC", storeId: CORE_DEMO_IDS.store, status: "cancelled", recordedAt: "2026-08-30T11:30:00+08:00" },
];
export const detectionReports: DetectionReport[] = [
  { id: CORE_DEMO_IDS.report, userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, serviceId: "SERVICE-CARE-BASIC", createdAt: "2026-08-27T15:10:00+08:00", summary: "头皮状态：基础护理建议。", resultLevel: "basic_neutral", disclaimer: "仅用于概念演示，不代表实时、高精度或医疗诊断。", capabilityStatus: "prototype", detectionRecordId: CORE_DEMO_IDS.detectionRecord, appointmentId: "APPOINTMENT-8888-RECENT", careProjectId: "CARE-PROJECT-BASIC", metrics: [{ key: "scalp_oil", label: "头皮油脂表现", value: 63, score: 63, trend: "down", note: "较上次更稳定" }, { key: "skin_hydration", label: "肌肤含水表现", value: 71, score: 71, trend: "up", note: "较上次提升" }], careAdvice: ["洗护以温和清洁为主，避免连续高频去角质。", "晚间护理后观察 7 天状态变化。"], exclusiveCouponId: "COUPON-CARE-8888-REPORT", recommendedServiceId: "SERVICE-CARE-PACKAGE", retestRecommendedAt: "2026-09-27T10:00:00+08:00", comparisonReportId: CORE_DEMO_IDS.previousReport },
  { id: CORE_DEMO_IDS.previousReport, userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, serviceId: "SERVICE-CARE-BASIC", createdAt: "2026-07-20T10:35:00+08:00", summary: "头皮出油偏快、肌肤含水表现一般，建议先从温和清洁与基础补水开始观察。", resultLevel: "basic_neutral", disclaimer: "仅用于产品原型演示，不构成医疗诊断、治疗建议或检测准确度承诺。", capabilityStatus: "prototype", detectionRecordId: "DETECTION-8888-00", appointmentId: "APPOINTMENT-8888-PREVIOUS", careProjectId: "CARE-PROJECT-BASIC", metrics: [{ key: "scalp_oil", label: "头皮油脂表现", value: 72, score: 54, note: "首次演示基线" }, { key: "skin_hydration", label: "肌肤含水表现", value: 62, score: 62, note: "首次演示基线" }], careAdvice: ["先维持基础补水，连续观察一周。"], retestRecommendedAt: "2026-08-20T10:00:00+08:00" },
];
export const reports = detectionReports.filter((item) => item.id === CORE_DEMO_IDS.report);

export const redemptions: RedemptionRecord[] = [
  { id: CORE_DEMO_IDS.pickupRedemption, userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, targetType: "order", targetId: CORE_DEMO_IDS.pickupOrder, code: "LL-1024", status: "pending", createdAt: "2026-08-27T10:20:00+08:00" },
  { id: CORE_DEMO_IDS.careRedemption, userId: CORE_DEMO_IDS.user, storeId: CORE_DEMO_IDS.store, targetType: "coupon", targetId: CORE_DEMO_IDS.experienceCoupon, code: "CARE-8888", status: "pending", createdAt: "2026-08-27T08:35:00+08:00" },
  { id: "REDEEM-EXPERIENCE-8892-01", userId: "LL-8892", storeId: CORE_DEMO_IDS.store, targetType: "service", targetId: "SERVICE-CARE-BASIC", code: "CARE-8892", status: "completed", createdAt: "2026-08-26T16:20:00+08:00", redeemedAt: "2026-08-26T16:31:00+08:00" },
];

export const campaigns: Campaign[] = [
  { id: "CAMPAIGN-AUTUMN-HERO", title: "初秋轻生活计划", subtitle: "早餐补给、精选好物与状态复测，一次逛完。", scene: "cross_scene", placement: "home_hero", status: "active", startsAt: "2026-08-28T00:00:00+08:00", endsAt: "2026-09-08T23:59:59+08:00", refs: [{ type: "product", id: "PRODUCT-EGG-SANDWICH" }, { type: "product", id: "PRODUCT-COLLAGEN-DRINK" }, { type: "care_project", id: "CARE-PROJECT-BASIC" }] },
  { id: "CAMPAIGN-STORE-BREAKFAST", title: "早八能量补给", subtitle: "云岭店早餐组合，会员价更轻松。", scene: "store", placement: "store_featured", status: "active", startsAt: "2026-08-31T07:00:00+08:00", endsAt: "2026-09-06T11:00:00+08:00", refs: [{ type: "product", id: "PRODUCT-OAT-LATTE" }, { type: "product", id: "PRODUCT-EGG-SANDWICH" }] },
  { id: "CAMPAIGN-MALL-CARE", title: "秋日护理精选", subtitle: "私域商城精选护理好物，全国快递到家。", scene: "mall", placement: "mall_featured", status: "active", startsAt: "2026-08-25T00:00:00+08:00", endsAt: "2026-09-15T23:59:59+08:00", refs: [{ type: "storefront", id: "STOREFRONT-PRIVATE" }, { type: "product", id: "PRODUCT-SCALP-SET" }, { type: "product", id: "PRODUCT-COLLAGEN-DRINK" }] },
  { id: "CAMPAIGN-CARE-RETEST", title: "状态复测周", subtitle: "带上上次报告回来看看变化，完成复测可领取护理专属券。", scene: "care", placement: "care_featured", status: "scheduled", startsAt: "2026-09-02T00:00:00+08:00", endsAt: "2026-09-09T23:59:59+08:00", refs: [{ type: "care_project", id: "CARE-PROJECT-BASIC" }, { type: "coupon", id: "COUPON-CARE-8888-REPORT" }] },
];

export const demoFixtures = { users, partners, stores, products, services, orders, coupons, pointLedger, reports, redemptions, rules: prototypeRules } as const;
export const v02Fixtures = { users, partners: businessPartners, stores: offlineStores, products: catalogProducts, productAvailability, convenienceCarts, deliveryAddresses: storeDeliveryAddresses, services: careServices, channels, storefronts, campaigns, careProjects, appointmentSlots, appointments, orders: v02Orders, coupons: v02Coupons, pointLedger, detectionRecords, reports: detectionReports, redemptions, rules: prototypeRules } as const;
