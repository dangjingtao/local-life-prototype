import type {
  Coupon,
  DetectionReport,
  Order,
  Partner,
  PointLedgerEntry,
  Product,
  PrototypeRule,
  RedemptionRecord,
  Service,
  Store,
  User,
} from "./domain";

export const CORE_DEMO_IDS = {
  user: "LL-8888",
  partner: "PARTNER-YUNLING",
  store: "STORE-YUNLING",
  pickupOrder: "LL-1024",
  report: "REPORT-CARE-0001",
  pickupRedemption: "REDEEM-LL-1024",
} as const;

export const prototypeRules = {
  membershipLevels: {
    value: ["standard", "silver", "gold", "black", "black_gold"] as const,
    status: "candidate",
    note: "会员等级名称来自 V0.1 候选方案，等级门槛与权益规则尚未确认。",
  },
  pointsToCash: {
    value: { points: 100, yuan: 1 },
    status: "candidate",
    note: "100 积分抵 1 元仅为候选示例，不作为 V0.1 固定业务规则。",
  },
  settlement: {
    value: null,
    status: "unknown",
    note: "支付通道、收款主体、退款、分账比例和结算周期尚未确定。",
  },
  careDeviceIntegration: {
    value: null,
    status: "unknown",
    note: "检测设备、接入方式和正式报告字段尚未确定；V0.1 仅表达基础中性结果。",
  },
} satisfies Record<string, PrototypeRule<unknown>>;

export const users: User[] = [
  {
    id: CORE_DEMO_IDS.user,
    displayName: "林女士",
    member: {
      level: "silver",
      ruleStatus: "candidate",
      note: "银卡为演示身份；会员等级规则尚未确认。",
    },
    pointsBalance: 1280,
    source: "store",
    usualStoreId: CORE_DEMO_IDS.store,
  },
  {
    id: "LL-8891",
    displayName: "周先生",
    member: { level: "standard", ruleStatus: "candidate", note: "会员等级规则尚未确认。" },
    pointsBalance: 420,
    source: "mall",
  },
  {
    id: "LL-8892",
    displayName: "陈女士",
    member: { level: "gold", ruleStatus: "candidate", note: "会员等级规则尚未确认。" },
    pointsBalance: 2160,
    source: "care",
  },
  {
    id: "LL-8893",
    displayName: "赵先生",
    member: { level: "standard", ruleStatus: "candidate", note: "会员等级规则尚未确认。" },
    pointsBalance: 760,
    source: "store",
  },
];

export const partners: Partner[] = [
  {
    id: CORE_DEMO_IDS.partner,
    name: "云岭生活合作商",
    carrierType: "convenience_store",
    region: "华南",
  },
  {
    id: "PARTNER-NANAN",
    name: "南岸生活服务合作商",
    carrierType: "club",
    region: "华南",
  },
];

export const stores: Store[] = [
  {
    id: CORE_DEMO_IDS.store,
    partnerId: CORE_DEMO_IDS.partner,
    name: "云岭社区店",
    address: "演示地址 · 云岭社区",
    distanceKm: 0.8,
    status: "open",
    capabilities: ["pickup", "care_detection"],
  },
  {
    id: "STORE-NANAN",
    partnerId: "PARTNER-NANAN",
    name: "南岸生活馆",
    address: "演示地址 · 南岸片区",
    distanceKm: 2.4,
    status: "open",
    capabilities: ["pickup", "care_detection", "care_service"],
  },
];

export const products: Product[] = [
  { id: "PRODUCT-SCALP-SET", name: "头皮养护套装", priceYuan: 129, category: "洗护", scenes: ["store", "mall"], fulfillment: ["pickup", "home_delivery", "store_delivery"] },
  { id: "PRODUCT-CLEAN-SET", name: "日常清洁组合", priceYuan: 69, category: "日用", scenes: ["store", "mall"], fulfillment: ["pickup", "home_delivery", "store_delivery"] },
  { id: "PRODUCT-LIGHT-LIFE", name: "轻盈生活组合", priceYuan: 99, category: "生活方式", scenes: ["store", "mall"], fulfillment: ["pickup", "home_delivery", "store_delivery"] },
  { id: "PRODUCT-SKIN-TRIAL", name: "肌肤护理体验", priceYuan: 39, category: "护理", scenes: ["mall", "care"], fulfillment: ["home_delivery", "store_delivery"] },
];

export const services: Service[] = [
  {
    id: "SERVICE-CARE-BASIC",
    name: "基础状态检测体验",
    category: "detection",
    priceYuan: 39,
    storeIds: [CORE_DEMO_IDS.store, "STORE-NANAN"],
    capabilityStatus: "candidate",
    note: "仅用于基础、中性结果演示，不代表实时、高精度或医疗诊断。",
  },
  {
    id: "SERVICE-CARE-PACKAGE",
    name: "基础护理套餐",
    category: "care_package",
    priceYuan: 199,
    storeIds: ["STORE-NANAN"],
    capabilityStatus: "candidate",
    note: "套餐价格与权益为概念原型数据，正式规则待确认。",
  },
];

export const orders: Order[] = [
  {
    id: CORE_DEMO_IDS.pickupOrder,
    userId: CORE_DEMO_IDS.user,
    scene: "store",
    status: "pending_pickup",
    fulfillment: "pickup",
    storeId: CORE_DEMO_IDS.store,
    items: [{ kind: "product", id: "PRODUCT-LIGHT-LIFE", name: "轻盈生活组合", quantity: 1, unitPriceYuan: 99 }],
    amountYuan: 99,
    createdAt: "2026-08-27T10:20:00+08:00",
  },
  {
    id: "LL-1023",
    userId: "LL-8891",
    scene: "mall",
    status: "shipping",
    fulfillment: "home_delivery",
    items: [{ kind: "product", id: "PRODUCT-SCALP-SET", name: "头皮养护套装", quantity: 1, unitPriceYuan: 129 }],
    amountYuan: 129,
    createdAt: "2026-08-27T09:10:00+08:00",
  },
  {
    id: "LL-1022",
    userId: "LL-8892",
    scene: "care",
    status: "completed",
    fulfillment: "service_at_store",
    storeId: CORE_DEMO_IDS.store,
    items: [{ kind: "service", id: "SERVICE-CARE-BASIC", name: "基础状态检测体验", quantity: 1, unitPriceYuan: 39 }],
    amountYuan: 39,
    createdAt: "2026-08-26T16:30:00+08:00",
  },
  {
    id: "LL-1021",
    userId: "LL-8893",
    scene: "store",
    status: "pending_pickup",
    fulfillment: "pickup",
    storeId: "STORE-NANAN",
    items: [{ kind: "product", id: "PRODUCT-CLEAN-SET", name: "日常清洁组合", quantity: 1, unitPriceYuan: 69 }],
    amountYuan: 69,
    createdAt: "2026-08-26T14:40:00+08:00",
  },
];

export const coupons: Coupon[] = [
  { id: "COUPON-8888-01", userId: CORE_DEMO_IDS.user, kind: "discount", title: "门店 10 元优惠券", scene: "store", status: "available", applicableStoreIds: [CORE_DEMO_IDS.store], claimedAt: "2026-08-20T12:00:00+08:00", expiresAt: "2026-09-30T23:59:59+08:00" },
  { id: "COUPON-8888-02", userId: CORE_DEMO_IDS.user, kind: "discount", title: "商城满减券", scene: "mall", status: "available", applicableStoreIds: [], claimedAt: "2026-08-21T12:00:00+08:00", expiresAt: "2026-09-15T23:59:59+08:00" },
  { id: "COUPON-8888-03", userId: CORE_DEMO_IDS.user, kind: "discount", title: "生活服务代金券", scene: "store", status: "used", applicableStoreIds: ["STORE-NANAN"], claimedAt: "2026-08-01T12:00:00+08:00" },
  { id: "EXPERIENCE-8888-01", userId: CORE_DEMO_IDS.user, kind: "experience", title: "基础检测体验券", scene: "care", status: "available", applicableStoreIds: [CORE_DEMO_IDS.store, "STORE-NANAN"], claimedAt: "2026-08-27T08:30:00+08:00", expiresAt: "2026-09-30T23:59:59+08:00" },
  { id: "EXPERIENCE-8888-02", userId: CORE_DEMO_IDS.user, kind: "experience", title: "护理体验券", scene: "care", status: "available", applicableStoreIds: ["STORE-NANAN"], claimedAt: "2026-08-22T10:00:00+08:00", expiresAt: "2026-09-22T23:59:59+08:00" },
];

export const pointLedger: PointLedgerEntry[] = [
  { id: "POINT-8888-001", userId: CORE_DEMO_IDS.user, direction: "earn", amount: 200, source: "register", balanceAfter: 200, createdAt: "2026-07-12T09:00:00+08:00" },
  { id: "POINT-8888-002", userId: CORE_DEMO_IDS.user, direction: "earn", amount: 800, source: "purchase", scene: "mall", balanceAfter: 1000, createdAt: "2026-08-01T18:20:00+08:00" },
  { id: "POINT-8888-003", userId: CORE_DEMO_IDS.user, direction: "earn", amount: 300, source: "experience", scene: "care", balanceAfter: 1300, createdAt: "2026-08-18T15:40:00+08:00" },
  { id: "POINT-8888-004", userId: CORE_DEMO_IDS.user, direction: "spend", amount: 20, source: "exchange", balanceAfter: 1280, createdAt: "2026-08-20T11:30:00+08:00" },
];

export const reports: DetectionReport[] = [
  {
    id: CORE_DEMO_IDS.report,
    userId: CORE_DEMO_IDS.user,
    storeId: CORE_DEMO_IDS.store,
    serviceId: "SERVICE-CARE-BASIC",
    createdAt: "2026-08-27T15:10:00+08:00",
    summary: "头皮状态：基础护理建议。",
    resultLevel: "basic_neutral",
    disclaimer: "仅用于概念演示，不代表实时、高精度或医疗诊断。",
    capabilityStatus: "prototype",
  },
];

export const redemptions: RedemptionRecord[] = [
  {
    id: CORE_DEMO_IDS.pickupRedemption,
    userId: CORE_DEMO_IDS.user,
    storeId: CORE_DEMO_IDS.store,
    targetType: "order",
    targetId: CORE_DEMO_IDS.pickupOrder,
    code: "LL-1024",
    status: "pending",
    createdAt: "2026-08-27T10:20:00+08:00",
  },
  {
    id: "REDEEM-EXPERIENCE-8892-01",
    userId: "LL-8892",
    storeId: CORE_DEMO_IDS.store,
    targetType: "service",
    targetId: "SERVICE-CARE-BASIC",
    code: "CARE-8892",
    status: "completed",
    createdAt: "2026-08-26T16:20:00+08:00",
    redeemedAt: "2026-08-26T16:31:00+08:00",
  },
];

export const demoFixtures = {
  users,
  partners,
  stores,
  products,
  services,
  orders,
  coupons,
  pointLedger,
  reports,
  redemptions,
  rules: prototypeRules,
} as const;
