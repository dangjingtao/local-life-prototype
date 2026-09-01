export type BusinessScene = "store" | "mall" | "care";

export const businessSceneLabels: Record<BusinessScene, string> = {
  store: "线下门店",
  mall: "线上商城",
  care: "智慧抗衰",
};

export const v02BusinessSceneLabels: Record<BusinessScene, string> = {
  store: "便利店",
  mall: "线上商城",
  care: "智慧抗衰",
};

export type OrderStatus =
  | "pending_payment"
  | "pending_fulfillment"
  | "shipping"
  | "pending_pickup"
  | "completed"
  | "cancelled";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "待付款",
  pending_fulfillment: "待发货",
  shipping: "配送中",
  pending_pickup: "待自提",
  completed: "已完成",
  cancelled: "已取消",
};

export type CouponStatus = "available" | "used" | "expired";

export const couponStatusLabels: Record<CouponStatus, string> = {
  available: "可用",
  used: "已用",
  expired: "已过期",
};

export type RedemptionStatus = "pending" | "completed" | "cancelled";

export const redemptionStatusLabels: Record<RedemptionStatus, string> = {
  pending: "待核销",
  completed: "已核销",
  cancelled: "已取消",
};

export type MembershipLevel = "standard" | "silver" | "gold" | "black" | "black_gold";

export const membershipLevelLabels: Record<MembershipLevel, string> = {
  standard: "普通会员",
  silver: "银卡",
  gold: "金卡",
  black: "黑卡",
  black_gold: "黑金卡",
};

export type PrototypeRuleStatus = "confirmed" | "candidate" | "unknown";

export interface PrototypeRule<T> {
  value: T;
  status: PrototypeRuleStatus;
  note: string;
}

export interface MemberProfile {
  level: MembershipLevel;
  ruleStatus: PrototypeRuleStatus;
  note: string;
}

export interface User {
  id: string;
  displayName: string;
  member: MemberProfile;
  pointsBalance: number;
  source: BusinessScene;
  usualStoreId?: string;
}

export type PartnerCarrierType = "convenience_store" | "health_center" | "wash_care" | "club";

export interface Partner {
  id: string;
  name: string;
  carrierType: PartnerCarrierType;
  region: string;
}

export type OfflineStoreStatus = "open" | "closed" | "configuration_pending";
export type OfflineStoreCapability = "pickup" | "short_delivery" | "care_detection" | "care_service";

export interface OfflineStore {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  distanceKm?: number;
  status: OfflineStoreStatus;
  businessHours?: string;
  deliveryRadiusKm?: number;
  capabilities: OfflineStoreCapability[];
}

/** @deprecated Prefer OfflineStore for V0.2 domain code. */
export type Store = OfflineStore;

export interface Product {
  id: string;
  name: string;
  priceYuan: number;
  category: string;
  scenes: BusinessScene[];
  fulfillment: Array<"pickup" | "home_delivery" | "store_delivery">;
  spec?: string;
  originalPriceYuan?: number;
  memberPriceYuan?: number;
  promotionLabel?: string;
}

export type ProductAvailabilityStatus = "available" | "low_stock" | "sold_out" | "unavailable";

export interface ProductAvailability {
  id: string;
  storeId: string;
  productId: string;
  status: ProductAvailabilityStatus;
  priceYuan: number;
  memberPriceYuan?: number;
  stockLabel?: string;
  promotionLabel?: string;
}

export interface ConvenienceCartItem {
  productId: string;
  quantity: number;
}

export interface ConvenienceCart {
  id: string;
  userId: string;
  storeId: string;
  items: ConvenienceCartItem[];
  updatedAt: string;
}

export interface StoreDeliveryAddress {
  id: string;
  userId: string;
  storeId: string;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  /** Estimated straight-line distance from the store; drives the in/out-of-range demo state. */
  distanceKm: number;
}

export interface Service {
  id: string;
  name: string;
  category: "detection" | "experience" | "care_package";
  priceYuan: number;
  storeIds: string[];
  capabilityStatus: PrototypeRuleStatus;
  note: string;
}

export type OrderItemRef =
  | { kind: "product"; id: string; name: string; quantity: number; unitPriceYuan: number }
  | { kind: "service"; id: string; name: string; quantity: number; unitPriceYuan: number };

export type OrderFulfillmentMode = "pickup" | "short_delivery" | "parcel_delivery" | "service_at_store";
export type OrderFulfillmentStatus =
  | "preparing"
  | "ready_for_pickup"
  | "delivering"
  | "shipping"
  | "completed"
  | "cancelled";

export interface OrderFulfillment {
  mode: OrderFulfillmentMode;
  status: OrderFulfillmentStatus;
  storeId?: string;
  pickupWindow?: string;
  pickupCode?: string;
  deliveryAddress?: string;
  distanceKm?: number;
  estimatedMinutes?: number;
  carrier?: string;
  trackingNo?: string;
  appointmentId?: string;
}

export interface Order {
  id: string;
  userId: string;
  scene: BusinessScene;
  status: OrderStatus;
  /** Legacy V0.1 field kept for gradual migration. */
  fulfillment: "pickup" | "home_delivery" | "store_delivery" | "service_at_store";
  fulfillmentDetail?: OrderFulfillment;
  storeId?: string;
  channelId?: string;
  storefrontId?: string;
  items: OrderItemRef[];
  amountYuan: number;
  createdAt: string;
}

export type ChannelKind = "owned" | "wechat" | "douyin" | "other";

export interface Channel {
  id: string;
  name: string;
  kind: ChannelKind;
  integrationStatus: "mock" | "planned";
  note?: string;
}

export interface OnlineStorefront {
  id: string;
  channelId: string;
  name: string;
  status: "active" | "paused";
  fulfillment: "parcel_delivery";
  serviceArea: "nationwide";
  note?: string;
}

export type CampaignPlacement = "home_hero" | "home_featured" | "store_featured" | "mall_featured" | "care_featured";

export interface CampaignRef {
  type: "product" | "care_project" | "coupon" | "storefront";
  id: string;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  scene: BusinessScene | "cross_scene";
  placement: CampaignPlacement;
  status: "scheduled" | "active" | "ended";
  startsAt: string;
  endsAt: string;
  refs: CampaignRef[];
}

export interface CareProject {
  id: string;
  serviceId?: string;
  name: string;
  summary: string;
  priceYuan: number;
  durationMinutes: number;
  storeIds: string[];
  capabilityStatus: PrototypeRuleStatus;
  note: string;
}

export type AppointmentSlotStatus = "available" | "full" | "booked";

export interface CareAppointmentSlot {
  id: string;
  careProjectId: string;
  storeId: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  status: AppointmentSlotStatus;
}

export type AppointmentStatus = "scheduled" | "checked_in" | "completed" | "cancelled" | "rescheduled";

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: "已预约",
  checked_in: "已到店",
  completed: "已完成",
  cancelled: "已取消",
  rescheduled: "已改期",
};

export interface Appointment {
  id: string;
  userId: string;
  careProjectId: string;
  storeId: string;
  slotId?: string;
  status: AppointmentStatus;
  scheduledAt: string;
  durationMinutes: number;
  qrCode?: string;
  checkedInAt?: string;
  completedAt?: string;
  createdAt: string;
}

export type DetectionRecordStatus = "pending" | "completed" | "cancelled";

export interface DetectionRecord {
  id: string;
  userId: string;
  appointmentId: string;
  careProjectId: string;
  storeId: string;
  status: DetectionRecordStatus;
  recordedAt: string;
  reportId?: string;
}

export interface DetectionMetric {
  key: string;
  label: string;
  value: number;
  unit?: string;
  score?: number;
  trend?: "up" | "down" | "stable";
  note?: string;
}

export type CouponKind = "discount" | "experience";

export interface Coupon {
  id: string;
  userId: string;
  kind: CouponKind;
  title: string;
  scene: BusinessScene;
  status: CouponStatus;
  applicableStoreIds: string[];
  claimedAt: string;
  expiresAt?: string;
}

export type PointSource = "register" | "purchase" | "store_visit" | "pickup" | "detection" | "experience" | "task" | "exchange";

export interface PointLedgerEntry {
  id: string;
  userId: string;
  direction: "earn" | "spend";
  amount: number;
  source: PointSource;
  scene?: BusinessScene;
  relatedOrderId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface DetectionReport {
  id: string;
  userId: string;
  storeId: string;
  serviceId: string;
  createdAt: string;
  summary: string;
  resultLevel: "basic_neutral";
  disclaimer: string;
  capabilityStatus: "prototype";
  detectionRecordId?: string;
  appointmentId?: string;
  careProjectId?: string;
  metrics?: DetectionMetric[];
  careAdvice?: string[];
  exclusiveCouponId?: string;
  recommendedServiceId?: string;
  retestRecommendedAt?: string;
  comparisonReportId?: string;
}

export interface RedemptionRecord {
  id: string;
  userId: string;
  storeId: string;
  targetType: "order" | "coupon" | "service";
  targetId: string;
  code: string;
  status: RedemptionStatus;
  createdAt: string;
  redeemedAt?: string;
}
