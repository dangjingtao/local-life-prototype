import { Button, Card, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  campaigns,
  careProjects,
  catalogProducts,
  coreDemoUser,
  coreUserV02Coupons,
  findById,
  storefronts,
} from "@prototype/shared";

interface CampaignActivityScreenProps {
  campaignId?: string | null;
  onBack: () => void;
  onOpenCampaign: (campaignId: string) => void;
}

function campaignRefLabel(type: "product" | "care_project" | "coupon" | "storefront", id: string) {
  if (type === "product") return findById(catalogProducts, id)?.name ?? id;
  if (type === "care_project") return findById(careProjects, id)?.name ?? id;
  if (type === "coupon") return findById(coreUserV02Coupons, id)?.title ?? id;
  return findById(storefronts, id)?.name ?? id;
}

export function CampaignActivityScreen({ campaignId, onBack, onOpenCampaign }: CampaignActivityScreenProps) {
  const selected = campaignId ? findById(campaigns, campaignId) : undefined;

  if (selected) {
    return (
      <>
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回首页
        </button>

        <section className="overflow-hidden rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">运营活动</span>
            <span className="text-xs text-white/70">{selected.status === "active" ? "进行中" : selected.status === "scheduled" ? "即将开始" : "已结束"}</span>
          </div>
          <h2 className="mt-7 text-2xl font-semibold leading-tight">{selected.title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">{selected.subtitle}</p>
          <p className="mt-6 border-t border-white/20 pt-4 text-xs text-white/70">{selected.startsAt.slice(0, 10)} → {selected.endsAt.slice(0, 10)}</p>
        </section>

        <Card className="p-4">
          <p className="text-sm font-semibold">活动关联内容</p>
          <div className="mt-3 space-y-2">
            {selected.refs.map((ref) => (
              <div key={`${ref.type}:${ref.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{campaignRefLabel(ref.type, ref.id)}</span>
                <StatusTag>{ref.type === "product" ? "商品" : ref.type === "care_project" ? "项目" : ref.type === "coupon" ? "权益" : "商城"}</StatusTag>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-semibold">统一账号承接</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前活动与用户 {coreDemoUser.id} 的商品、项目或权益语义关联；不接真实 CMS、消息推送或自动推荐。</p>
        </Card>

        <Button className="w-full" onClick={onBack}>返回运营首页</Button>
      </>
    );
  }

  return (
    <>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">运营内容</p>
        <h2 className="mt-1 text-2xl font-semibold">活动中心</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">首页同时承载多个活动主题；这里统一查看，不把活动误做成第四个交易业务域。</p>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <button key={campaign.id} type="button" className="w-full text-left" onClick={() => onOpenCampaign(campaign.id)}>
            <Card className="p-4 transition active:bg-[var(--color-surface-subtle)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2"><StatusTag>{campaign.scene === "cross_scene" ? "跨业务" : campaign.scene === "store" ? "便利店" : campaign.scene === "mall" ? "商城" : "智慧抗衰"}</StatusTag></div>
                  <p className="mt-3 font-semibold">{campaign.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{campaign.subtitle}</p>
                </div>
                <span className="text-[var(--color-text-tertiary)]" aria-hidden="true">›</span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Button className="w-full" onClick={onBack}>返回首页</Button>
    </>
  );
}
