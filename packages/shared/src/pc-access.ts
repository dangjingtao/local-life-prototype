export type PcRole = "merchant" | "operator" | "management";

export const pcRoleLabels: Record<PcRole, string> = {
  merchant: "店主 / 合作商",
  operator: "平台运营",
  management: "平台管理层",
};

export type PcDataScope = "assigned_store" | "authorized_platform" | "platform_summary";

export const pcDataScopeLabels: Record<PcDataScope, string> = {
  assigned_store: "所属合作商 / 门店",
  authorized_platform: "平台授权范围",
  platform_summary: "平台汇总数据",
};
