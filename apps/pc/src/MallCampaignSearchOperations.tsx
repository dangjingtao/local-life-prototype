import { useMemo, useState } from "react";
import { Card, Section, StatusTag } from "@prototype/design-system";
import {
  businessSceneLabels,
  campaigns,
  careProjects,
  careServices,
  catalogProducts,
  channels,
  globalSearchDomainLabels,
  mallProductListings,
  orderStatusLabels,
  productAvailability,
  searchGlobalCatalog,
  storefronts,
  v02Coupons,
  v02Orders,
  type Campaign,
  type CampaignRef,
} from "@prototype/shared";

type CommerceTab = "channels" | "campaigns" | "search";

const channelKindLabels = {
  owned: "自有渠道",
  wechat: "微信渠道",
  douyin: "抖音渠道",
  other: "其他渠道",
} as const;

const placementLabels = {
  home_hero: "首页 Hero",
  home_featured: "首页推荐位",
  store_featured: "便利店推荐位",
  mall_featured: "商城推荐位",
  care_featured: "智慧抗衰推荐位",
} as const;

const campaignStatusLabels = {
  scheduled: "待开始",
  active: "进行中",
  ended: "已结束",
} as const;

function productName(id: string) {
  return catalogProducts.find((item) => item.id === id)?.name ?? id;
}

function channelName(id: string) {
  return channels.find((item) => item.id === id)?.name ?? id;
}

function storefrontName(id: string) {
  return storefronts.find((item) => item.id === id)?.name ?? id;
}

function campaignRefLabel(ref: CampaignRef) {
  if (ref.type === "product") return productName(ref.id);
  if (ref.type === "care_project") return careProjects.find((item) => item.id === ref.id)?.name ?? ref.id;
  if (ref.type === "coupon") return v02Coupons.find((item) => item.id === ref.id)?.title ?? ref.id;
  return storefrontName(ref.id);
}

function campaignSceneLabel(scene: Campaign["scene"]) {
  return scene === "cross_scene" ? "跨业务" : businessSceneLabels[scene];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function ChannelBoundary() {
  return <Card className="bg-[var(--color-surface-subtle)]">
    <div className="flex flex-wrap items-start gap-3">
      <StatusTag tone="warning">内部运营语义</StatusTag>
      <p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
        Storefront / Channel 只用于 Shared 与 PC 运营侧解释商城商品和订单来源。Mobile 消费侧不展示店铺、来源或渠道选择；Planned 只代表预留语义，不代表已接通抖音或其他外部平台 API。
      </p>
    </div>
  </Card>;
}

function ChannelsSection() {
  const mallOrders = v02Orders.filter((order) => order.scene === "mall");
  return <>
    <ChannelBoundary />
    <Section title="Channel / Storefront">
      <div className="grid gap-4 xl:grid-cols-2">
        {channels.map((channel) => {
          const channelStorefronts = storefronts.filter((item) => item.channelId === channel.id);
          const listings = mallProductListings.filter((item) => item.channelId === channel.id);
          const orders = mallOrders.filter((item) => item.channelId === channel.id);
          return <Card key={channel.id} data-testid={`t024-channel-${channel.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="break-all text-xs text-[var(--color-text-tertiary)]">{channel.id}</p>
                <h3 className="mt-1 text-lg font-semibold">{channel.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{channelKindLabels[channel.kind]}</p>
              </div>
              <StatusTag tone={channel.integrationStatus === "mock" ? "success" : "warning"}>
                {channel.integrationStatus === "mock" ? "Mock 可用" : "Planned · 未接入"}
              </StatusTag>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{channel.note ?? "暂无补充说明"}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-4 text-sm">
              <div><span className="text-xs text-[var(--color-text-tertiary)]">Storefront</span><strong className="mt-1 block">{channelStorefronts.length}</strong></div>
              <div><span className="text-xs text-[var(--color-text-tertiary)]">商品关系</span><strong className="mt-1 block">{listings.length}</strong></div>
              <div><span className="text-xs text-[var(--color-text-tertiary)]">订单样本</span><strong className="mt-1 block">{orders.length}</strong></div>
            </div>
            <div className="mt-4 space-y-2">
              {channelStorefronts.map((storefront) => <div key={storefront.id} data-testid={`t024-storefront-${storefront.id}`} className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{storefront.name}</p>
                    <p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{storefront.id}</p>
                  </div>
                  <StatusTag tone={storefront.status === "active" ? "success" : "neutral"}>{storefront.status === "active" ? "启用" : "暂停"}</StatusTag>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">全国范围 · 快递履约{storefront.note ? ` · ${storefront.note}` : ""}</p>
              </div>)}
            </div>
          </Card>;
        })}
      </div>
    </Section>

    <Section title="商城商品 × Storefront × Channel">
      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1.3fr_0.8fr_1fr_1fr_0.7fr] gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] lg:grid">
          <span>商品 / 分类</span><span>关系状态</span><span>Storefront</span><span>Channel</span><span>履约</span>
        </div>
        {mallProductListings.map((listing) => {
          const product = catalogProducts.find((item) => item.id === listing.productId);
          return <div key={listing.id} data-testid={`t024-listing-${listing.id}`} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_0.7fr] lg:items-center">
            <div>
              <p className="font-semibold">{product?.name ?? listing.productId}</p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{product?.category ?? "未知分类"} · {listing.productId}</p>
            </div>
            <div><StatusTag tone={listing.status === "active" ? "success" : "warning"}>{listing.status === "active" ? "已上架关系" : "计划关系"}</StatusTag></div>
            <div><p className="font-medium">{storefrontName(listing.storefrontId)}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{listing.storefrontId}</p></div>
            <div><p className="font-medium">{channelName(listing.channelId)}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{listing.channelId}</p></div>
            <div>全国快递</div>
          </div>;
        })}
      </Card>
    </Section>

    <Section title="商城订单与来源渠道">
      <div className="space-y-3">
        {mallOrders.map((order) => <Card key={order.id} data-testid={`t024-mall-order-${order.id}`}>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr_0.8fr_1fr_1fr] lg:items-center">
            <div><p className="break-all font-semibold">{order.id}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{formatDate(order.createdAt)} · ¥{order.amountYuan.toFixed(2)}</p></div>
            <div><p className="font-medium">{order.items.map((item) => item.name).join("、")}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">全国快递订单</p></div>
            <div><StatusTag tone={order.status === "completed" ? "success" : "warning"}>{orderStatusLabels[order.status]}</StatusTag></div>
            <div><p className="font-medium">{storefrontName(order.storefrontId ?? "")}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{order.storefrontId ?? "未关联"}</p></div>
            <div><p className="font-medium">{channelName(order.channelId ?? "")}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{order.channelId ?? "未关联"}</p></div>
          </div>
          {order.fulfillmentDetail?.mode === "parcel_delivery" && <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">
            <span>物流：{order.fulfillmentDetail.carrier ?? "待配置"}</span>
            <span>单号：{order.fulfillmentDetail.trackingNo ?? "待出库"}</span>
            <span>状态：{order.fulfillmentDetail.status}</span>
          </div>}
        </Card>)}
      </div>
    </Section>
  </>;
}

function CampaignsSection() {
  return <>
    <Card className="bg-[var(--color-surface-subtle)]">
      <div className="flex flex-wrap items-start gap-3">
        <StatusTag tone="success">{campaigns.length} 个活动配置</StatusTag>
        <p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Mobile 首页与活动中心直接读取同一套 Shared Campaign。活动卡当前统一承接到活动详情页，不虚构商品直达或真实 CMS 路由。
        </p>
      </div>
    </Card>
    <Section title="Banner / 虚拟活动 / 推荐位">
      <div className="grid gap-4 xl:grid-cols-2">
        {campaigns.map((campaign) => {
          const derivedServices = campaign.refs
            .filter((ref) => ref.type === "care_project")
            .map((ref) => careProjects.find((item) => item.id === ref.id)?.serviceId)
            .filter((serviceId): serviceId is string => Boolean(serviceId))
            .map((serviceId) => careServices.find((item) => item.id === serviceId)?.name ?? serviceId);
          return <Card key={campaign.id} data-testid={`t024-campaign-${campaign.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusTag>{campaignSceneLabel(campaign.scene)}</StatusTag>
                  <StatusTag tone={campaign.status === "active" ? "success" : campaign.status === "scheduled" ? "warning" : "neutral"}>{campaignStatusLabels[campaign.status]}</StatusTag>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{campaign.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{campaign.subtitle}</p>
              </div>
              <div className="text-right text-xs text-[var(--color-text-tertiary)]">
                <p>{placementLabels[campaign.placement]}</p>
                <p className="mt-1 break-all">{campaign.id}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4 text-sm sm:grid-cols-2">
              <div><span className="text-xs text-[var(--color-text-tertiary)]">活动周期</span><p className="mt-1 font-medium">{formatDate(campaign.startsAt)} → {formatDate(campaign.endsAt)}</p></div>
              <div><span className="text-xs text-[var(--color-text-tertiary)]">跳转目标</span><p className="mt-1 font-medium">活动详情 · {campaign.target.campaignId}</p></div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">关联内容</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {campaign.refs.map((ref) => <span key={`${ref.type}:${ref.id}`} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs">
                  {ref.type === "product" ? "商品" : ref.type === "care_project" ? "项目" : ref.type === "coupon" ? "权益" : "商城"} · {campaignRefLabel(ref)}
                </span>)}
              </div>
              {derivedServices.length > 0 && <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">项目承接服务：{derivedServices.join("、")}（由 Care Project → Service 关系追溯）</p>}
            </div>
          </Card>;
        })}
      </div>
    </Section>
  </>;
}

interface SearchAssociationRow {
  key: string;
  domain: "store" | "mall" | "care" | "campaign";
  entityType: "product" | "care_project" | "service" | "campaign";
  entityId: string;
  title: string;
  state: string;
  source: string;
}

function buildSearchAssociations(): SearchAssociationRow[] {
  const storeRows = catalogProducts.filter((item) => item.scenes.includes("store")).map<SearchAssociationRow>((product) => {
    const availability = productAvailability.filter((item) => item.productId === product.id);
    const orderable = availability.some((item) => item.status === "available" || item.status === "low_stock");
    return {
      key: `store:${product.id}`,
      domain: "store",
      entityType: "product",
      entityId: product.id,
      title: product.name,
      state: orderable ? "可检索 · 有可售门店" : "可检索 · 暂不可售",
      source: "Catalog Product + Store Availability",
    };
  });

  const mallRows = catalogProducts.filter((item) => item.scenes.includes("mall")).map<SearchAssociationRow>((product) => {
    const listings = mallProductListings.filter((item) => item.productId === product.id);
    return {
      key: `mall:${product.id}`,
      domain: "mall",
      entityType: "product",
      entityId: product.id,
      title: product.name,
      state: listings.some((item) => item.status === "active") ? "可检索 · 有有效商城来源" : "可检索 · 仅计划来源",
      source: listings.map((item) => channelName(item.channelId)).join("、") || "未关联 Channel",
    };
  });

  const projectRows = careProjects.map<SearchAssociationRow>((item) => ({
    key: `care-project:${item.id}`, domain: "care", entityType: "care_project", entityId: item.id,
    title: item.name, state: "可检索 · 项目", source: "Care Project",
  }));
  const serviceRows = careServices.map<SearchAssociationRow>((item) => ({
    key: `care-service:${item.id}`, domain: "care", entityType: "service", entityId: item.id,
    title: item.name, state: item.category === "care_package" ? "可检索 · 护理套餐" : "可检索 · 到店服务", source: "Care Service",
  }));
  const campaignRows = campaigns.map<SearchAssociationRow>((item) => ({
    key: `campaign:${item.id}`, domain: "campaign", entityType: "campaign", entityId: item.id,
    title: item.title, state: item.status === "active" ? "可检索 · 进行中" : item.status === "scheduled" ? "可检索 · 待开始" : "可检索 · 已结束",
    source: placementLabels[item.placement],
  }));
  return [...storeRows, ...mallRows, ...projectRows, ...serviceRows, ...campaignRows];
}

function SearchSection() {
  const [filter, setFilter] = useState("");
  const [probe, setProbe] = useState("");
  const rows = useMemo(() => buildSearchAssociations(), []);
  const normalized = filter.trim().toLocaleLowerCase();
  const visible = rows.filter((row) =>
    !normalized || [row.title, row.entityId, row.domain, row.entityType, row.state, row.source].some((value) => value.toLocaleLowerCase().includes(normalized)),
  );
  const probeResults = searchGlobalCatalog(probe);

  return <>
    <Card className="bg-[var(--color-surface-subtle)]">
      <div className="flex flex-wrap items-start gap-3">
        <StatusTag tone="warning">非真实搜索后台</StatusTag>
        <p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          本页表达哪些业务实体参与全局搜索以及展示 / 可用状态。没有真实索引、权重、召回、推荐算法或内容审核系统；搜索词验证直接调用与 Mobile 相同的 Shared searchGlobalCatalog。
        </p>
      </div>
    </Card>
    <Section title="全局搜索关联管理概念">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <label className="grid gap-2 text-sm font-medium">关联表筛选
            <input aria-label="搜索关联筛选" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="按实体、ID、业务域或状态筛选" className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 font-normal outline-none" />
          </label>
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">当前显示 {visible.length} / {rows.length} 条关联。</p>
        </Card>
        <Card>
          <label className="grid gap-2 text-sm font-medium">与 Mobile 同源搜索验证
            <input aria-label="全局搜索词验证" value={probe} onChange={(event) => setProbe(event.target.value)} placeholder="燕麦 / 胶原 / 基础状态检测 / 初秋" className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 font-normal outline-none" />
          </label>
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">{probe.trim() ? `Shared 返回 ${probeResults.length} 条结果` : "输入搜索词后验证 Shared 实际召回。"}</p>
          {probe.trim() && <div className="mt-3 flex flex-wrap gap-2">{probeResults.map((result) =>
            <span key={result.key} data-testid={`t024-search-probe-${result.key.replaceAll(":", "-")}`} className="rounded-full bg-[var(--color-brand-subtle)] px-3 py-1.5 text-xs text-[var(--color-primary-pressed)]">{globalSearchDomainLabels[result.domain]} · {result.title}</span>
          )}</div>}
        </Card>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[0.8fr_0.9fr_1.3fr_1fr_1.2fr] gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] lg:grid">
          <span>业务域</span><span>实体类型</span><span>实体</span><span>展示 / 可用状态</span><span>来源关系</span>
        </div>
        {visible.map((row) => <div key={row.key} data-testid={`t024-search-row-${row.key.replaceAll(":", "-")}`} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 lg:grid-cols-[0.8fr_0.9fr_1.3fr_1fr_1.2fr] lg:items-center">
          <div><StatusTag>{globalSearchDomainLabels[row.domain]}</StatusTag></div>
          <div>{row.entityType === "product" ? "商品" : row.entityType === "care_project" ? "智慧抗衰项目" : row.entityType === "service" ? "服务 / 套餐" : "活动"}</div>
          <div><p className="font-semibold">{row.title}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{row.entityId}</p></div>
          <div>{row.state}</div>
          <div className="text-[var(--color-text-secondary)]">{row.source}</div>
        </div>)}
      </Card>
    </Section>
  </>;
}

export function MallCampaignSearchOperations() {
  const [tab, setTab] = useState<CommerceTab>("channels");
  const tabs: Array<{ id: CommerceTab; label: string; note: string }> = [
    { id: "channels", label: "商城渠道", note: "Storefront / Channel / 商品 / 订单" },
    { id: "campaigns", label: "活动与推荐位", note: "Banner / 虚拟活动 / 承接目标" },
    { id: "search", label: "搜索关联", note: "跨业务实体与同源召回" },
  ];
  return <>
    <div>
      <p className="text-sm text-[var(--color-text-secondary)]">T024 · 平台运营授权范围</p>
      <h2 className="mt-1 text-2xl font-semibold">商城渠道、活动与搜索运营</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">把 Mobile 的商城商品、首页活动和全局搜索背后的 Shared 关系放进同一个可解释的运营后台；只做中高保真结构与关系验证，不冒充真实平台集成。</p>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      {tabs.map((item) => <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={`rounded-[var(--radius-container)] border p-4 text-left transition ${tab === item.id ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
        <p className="font-semibold">{item.label}</p><p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{item.note}</p>
      </button>)}
    </div>
    {tab === "channels" && <ChannelsSection />}
    {tab === "campaigns" && <CampaignsSection />}
    {tab === "search" && <SearchSection />}
    <Card className="bg-[var(--color-surface-subtle)]"><div className="flex flex-wrap items-center gap-2"><StatusTag>V0.2 原型边界</StatusTag><span className="text-sm leading-6 text-[var(--color-text-secondary)]">不接真实抖音 / 外部平台 API，不建设生产级 CMS、搜索索引、推荐算法、内容审核、复杂商家经营或真实数据写入。</span></div></Card>
  </>;
}
