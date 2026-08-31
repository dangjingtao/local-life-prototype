import type { ProductAvailabilityStatus } from "./domain";
import {
  campaigns,
  careProjects,
  careServices,
  catalogProducts,
  offlineStores,
  productAvailability,
} from "./fixtures";

export type GlobalSearchDomain = "store" | "mall" | "care" | "campaign";
export type GlobalSearchEntityType = "product" | "care_project" | "service" | "campaign";

export interface GlobalSearchResult {
  key: string;
  domain: GlobalSearchDomain;
  entityType: GlobalSearchEntityType;
  entityId: string;
  title: string;
  subtitle: string;
  priceYuan?: number;
  storeIds?: string[];
}

export interface ConvenienceProductStoreOption {
  storeId: string;
  storeName: string;
  address: string;
  distanceKm?: number;
  storeStatus: "open" | "closed" | "configuration_pending";
  availabilityStatus: ProductAvailabilityStatus;
  priceYuan: number;
  memberPriceYuan?: number;
  stockLabel?: string;
  orderable: boolean;
}

export const globalSearchDomainLabels: Record<GlobalSearchDomain, string> = {
  store: "便利店",
  mall: "线上商城",
  care: "智慧抗衰",
  campaign: "活动",
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function matches(query: string, values: Array<string | undefined>) {
  return values.some((value) => value && normalize(value).includes(query));
}

export function searchGlobalCatalog(input: string): GlobalSearchResult[] {
  const query = normalize(input);
  if (!query) return [];

  const storeResults = catalogProducts
    .filter((product) => product.scenes.includes("store"))
    .filter((product) => matches(query, [product.name, product.category, product.spec, product.promotionLabel]))
    .map<GlobalSearchResult>((product) => ({
      key: `store:${product.id}`,
      domain: "store",
      entityType: "product",
      entityId: product.id,
      title: product.name,
      subtitle: `${product.category}${product.spec ? ` · ${product.spec}` : ""} · 需按门店确认可售与价格`,
      storeIds: productAvailability.filter((item) => item.productId === product.id).map((item) => item.storeId),
    }));

  const mallResults = catalogProducts
    .filter((product) => product.scenes.includes("mall"))
    .filter((product) => matches(query, [product.name, product.category, product.spec, product.promotionLabel]))
    .map<GlobalSearchResult>((product) => ({
      key: `mall:${product.id}`,
      domain: "mall",
      entityType: "product",
      entityId: product.id,
      title: product.name,
      subtitle: `${product.category}${product.spec ? ` · ${product.spec}` : ""} · 全国快递履约`,
      priceYuan: product.priceYuan,
    }));

  const careProjectResults = careProjects
    .filter((project) => matches(query, [project.name, project.summary, project.note]))
    .map<GlobalSearchResult>((project) => ({
      key: `care-project:${project.id}`,
      domain: "care",
      entityType: "care_project",
      entityId: project.id,
      title: project.name,
      subtitle: `${project.durationMinutes} 分钟 · ${project.summary}`,
      priceYuan: project.priceYuan,
      storeIds: project.storeIds,
    }));

  const careServiceResults = careServices
    .filter((service) => matches(query, [service.name, service.category, service.note]))
    .map<GlobalSearchResult>((service) => ({
      key: `care-service:${service.id}`,
      domain: "care",
      entityType: "service",
      entityId: service.id,
      title: service.name,
      subtitle: service.category === "care_package" ? "护理套餐 · 到店服务" : service.category === "detection" ? "检测服务 · 到店体验" : "护理体验 · 到店服务",
      priceYuan: service.priceYuan,
      storeIds: service.storeIds,
    }));

  const campaignResults = campaigns
    .filter((campaign) => matches(query, [campaign.title, campaign.subtitle, campaign.scene, campaign.placement]))
    .map<GlobalSearchResult>((campaign) => ({
      key: `campaign:${campaign.id}`,
      domain: "campaign",
      entityType: "campaign",
      entityId: campaign.id,
      title: campaign.title,
      subtitle: campaign.subtitle,
    }));

  return [...storeResults, ...mallResults, ...careProjectResults, ...careServiceResults, ...campaignResults];
}

export function getConvenienceProductStoreOptions(productId: string): ConvenienceProductStoreOption[] {
  const options: ConvenienceProductStoreOption[] = [];

  for (const availability of productAvailability) {
    if (availability.productId !== productId) continue;
    const store = offlineStores.find((item) => item.id === availability.storeId);
    if (!store) continue;

    options.push({
      storeId: store.id,
      storeName: store.name,
      address: store.address,
      ...(store.distanceKm !== undefined ? { distanceKm: store.distanceKm } : {}),
      storeStatus: store.status,
      availabilityStatus: availability.status,
      priceYuan: availability.priceYuan,
      ...(availability.memberPriceYuan !== undefined ? { memberPriceYuan: availability.memberPriceYuan } : {}),
      ...(availability.stockLabel !== undefined ? { stockLabel: availability.stockLabel } : {}),
      orderable: store.status === "open" && (availability.status === "available" || availability.status === "low_stock"),
    });
  }

  return options.sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
}
