export type BusinessScene = "store" | "mall" | "care";

export const businessSceneLabels: Record<BusinessScene, string> = {
  store: "线下门店",
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

export interface Store {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  distanceKm?: number;
  status: "open" | "configuration_pending";
  capabilities: Array<"pickup" | "care_detection" | "care_service">;
}

export interface Product {
  id: string;
  name: string;
  priceYuan: number;
  category: string;
  scenes: BusinessScene[];
  fulfillment: Array<"pickup" | "home_delivery" | "store_delivery">;
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

export interface Order {
  id: string;
  userId: string;
  scene: BusinessScene;
  status: OrderStatus;
  fulfillment: "pickup" | "home_delivery" | "store_delivery" | "service_at_store";
  storeId?: string;
  items: OrderItemRef[];
  amountYuan: number;
  createdAt: string;
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
