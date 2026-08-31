import { Card, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  campaigns,
  careProjects,
  catalogProducts,
  coreDemoStore,
  coreDemoUser,
  coreUserV02Coupons,
  membershipLevelLabels,
  productAvailability,
} from "@prototype/shared";

type HomeDomain = "store" | "mall" | "care";

interface V02HomeScreenProps {
  onOpenSearch: (preset?: string) => void;
  onOpenDomain: (domain: HomeDomain) => void;
  onOpenCampaign: (campaignId: string) => void;
}

const memberLevel = membershipLevelLabels[coreDemoUser.member.level];
const availableCoupons = coreUserV02Coupons.filter((coupon) => coupon.status === "available");
const heroCampaign = campaigns.find((campaign) => campaign.placement === "home_hero") ?? campaigns[0];
const compactCampaigns = campaigns.filter((campaign) => campaign.id !== heroCampaign?.id).slice(0, 2);
const careCampaign = campaigns.find((campaign) => campaign.scene === "care");
const convenienceProduct = catalogProducts.find((product) => product.scenes.includes("store") && product.id === "PRODUCT-OAT-LATTE")
  ?? catalogProducts.find((product) => product.scenes.includes("store"));
const convenienceAvailability = convenienceProduct
  ? productAvailability.find((item) => item.productId === convenienceProduct.id && item.storeId === coreDemoStore.id)
  : undefined;
const mallProduct = catalogProducts.find((product) => product.id === "PRODUCT-COLLAGEN-DRINK")
  ?? catalogProducts.find((product) => product.scenes.includes("mall"));
const careProject = careProjects[0];

function MediaTile({ icon, eyebrow, title }: { icon: "home" | "modules" | "success"; eyebrow: string; title: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] p-4 text-[var(--color-primary-pressed)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface)]/80">
        <PrototypeIcon name={icon} size={21} />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">{eyebrow}</p>
        <p className="mt-1 text-sm font-semibold leading-5">{title}</p>
      </div>
    </div>
  );
}

export function V02HomeScreen({ onOpenSearch, onOpenDomain, onOpenCampaign }: V02HomeScreenProps) {
  return (
    <>
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">上午好，{coreDemoUser.displayName}</p>
            <h2 className="mt-1 text-2xl font-semibold">今天在附近发现点什么</h2>
          </div>
          <div className="text-right text-xs text-[var(--color-text-tertiary)]">
            <p>{memberLevel}</p>
            <p className="mt-1">{coreDemoUser.pointsBalance} 积分</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenSearch()}
          className="flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-left text-sm text-[var(--color-text-tertiary)] shadow-sm transition active:bg-[var(--color-surface-subtle)]"
          aria-label="打开全局搜索"
        >
          <PrototypeIcon name="search" size={19} />
          <span className="flex-1">搜索便利店、商城、智慧抗衰或活动</span>
          <span className="text-xs">全局</span>
        </button>
      </section>

      {heroCampaign && (
        <button type="button" className="w-full text-left" onClick={() => onOpenCampaign(heroCampaign.id)}>
          <section className="overflow-hidden rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white shadow-[var(--shadow-floating)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">本周主活动</span>
              <span className="text-xs text-white/70">运营 Hero</span>
            </div>
            <h3 className="mt-8 max-w-[270px] text-2xl font-semibold leading-tight">{heroCampaign.title}</h3>
            <p className="mt-2 max-w-[300px] text-sm leading-6 text-white/80">{heroCampaign.subtitle}</p>
            <div className="mt-6 flex min-h-11 items-center justify-between border-t border-white/20 pt-4 text-sm font-medium">
              <span>查看活动内容</span>
              <span aria-hidden="true">›</span>
            </div>
          </section>
        </button>
      )}

      <Section title="正在发生">
        <div className="grid grid-cols-2 gap-3">
          {compactCampaigns.map((campaign, index) => (
            <button key={campaign.id} type="button" className="min-w-0 text-left" onClick={() => onOpenCampaign(campaign.id)}>
              <Card className="h-full p-3 transition active:bg-[var(--color-surface-subtle)]">
                <div className={`rounded-[var(--radius-control)] p-3 ${index === 0 ? "bg-[var(--color-warning-bg)]" : "bg-[var(--color-success-bg)]"}`}>
                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">{campaign.scene === "store" ? "便利店限时" : campaign.scene === "mall" ? "商城精选" : "智慧抗衰"}</p>
                  <h3 className="mt-2 text-sm font-semibold leading-5">{campaign.title}</h3>
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-[var(--color-text-secondary)]">{campaign.subtitle}</p>
              </Card>
            </button>
          ))}
        </div>
      </Section>

      <Section title="附近便利店">
        <button type="button" className="w-full text-left" onClick={() => onOpenDomain("store")}>
          <Card className="p-4 transition active:bg-[var(--color-surface-subtle)]">
            <div className="flex gap-4">
              <div className="w-28 shrink-0"><MediaTile icon="home" eyebrow="Convenience" title="即时自提 · 约 3km 短配" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusTag tone="success">{coreDemoStore.name}</StatusTag>
                  <span className="text-xs text-[var(--color-text-tertiary)]">距你 {coreDemoStore.distanceKm?.toFixed(1)} km</span>
                </div>
                <p className="mt-3 font-semibold">{convenienceProduct?.name ?? "附近补给"}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{convenienceProduct?.promotionLabel ?? "门店价格与库存按当前门店确认"}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-semibold text-[var(--color-primary-pressed)]">{convenienceAvailability ? `¥${convenienceAvailability.memberPriceYuan ?? convenienceAvailability.priceYuan}` : "到店查看"}</span>
                  {convenienceAvailability?.memberPriceYuan && <span className="text-xs text-[var(--color-text-tertiary)]">会员价</span>}
                </div>
              </div>
            </div>
          </Card>
        </button>
      </Section>

      <Section title="商城精选">
        <button type="button" className="w-full text-left" onClick={() => onOpenDomain("mall")}>
          <Card className="p-4 transition active:bg-[var(--color-surface-subtle)]">
            <div className="grid grid-cols-[1fr_112px] gap-4">
              <div>
                <StatusTag>全国快递</StatusTag>
                <p className="mt-3 font-semibold">{mallProduct?.name ?? "本周商城精选"}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">计划性消费与便利店即时履约分开，商品由线上 Storefront 独立承接。</p>
                {mallProduct && <p className="mt-3 font-semibold text-[var(--color-primary-pressed)]">¥{mallProduct.priceYuan}</p>}
              </div>
              <MediaTile icon="modules" eyebrow="Mall" title="精选好物 · 全国送达" />
            </div>
          </Card>
        </button>
      </Section>

      <Section title="智慧抗衰">
        <button type="button" className="w-full text-left" onClick={() => onOpenDomain("care")}>
          <Card className="overflow-hidden p-0 transition active:bg-[var(--color-surface-subtle)]">
            <div className="grid grid-cols-[112px_1fr] gap-4 p-4">
              <MediaTile icon="success" eyebrow="Smart Care" title="预约 · 检测 · 报告" />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2"><StatusTag>非医疗演示</StatusTag><StatusTag tone="success">可预约</StatusTag></div>
                <p className="mt-3 font-semibold">{careProject?.name ?? "基础状态检测"}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{careProject?.summary ?? "查看项目与可约门店"}</p>
              </div>
            </div>
            {careCampaign && (
              <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                {careCampaign.title} · {careCampaign.subtitle}
              </div>
            )}
          </Card>
        </button>
      </Section>

      <Section title="会员与权益">
        <Card className="p-4">
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] text-center">
            <div><p className="text-lg font-semibold">{coreDemoUser.pointsBalance}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">积分</p></div>
            <div><p className="text-lg font-semibold">{availableCoupons.length}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">可用券</p></div>
            <div><p className="text-lg font-semibold">{memberLevel}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">会员身份</p></div>
          </div>
          <button type="button" onClick={() => onOpenSearch("初秋")} className="mt-4 flex min-h-11 w-full items-center justify-between rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] px-3 text-sm font-medium">
            <span>看看今天有哪些活动与精选</span><span aria-hidden="true">›</span>
          </button>
        </Card>
      </Section>
    </>
  );
}
