import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  businessSceneLabels,
  couponStatusLabels,
  coreDemoReport,
  coreDemoUser,
  coreUserCoupons,
  coreUserOrders,
  membershipLevelLabels,
  pointLedger,
  prototypeRules,
  redemptionStatusLabels,
  redemptions,
  type CouponStatus,
  type PointSource,
} from "@prototype/shared";

type MemberView = "overview" | "points" | "coupons" | "records";
type ReplayState = "ready" | "processing" | "completed";

const pointSourceLabels: Record<PointSource, string> = {
  register: "注册",
  purchase: "消费",
  store_visit: "到店",
  pickup: "自提",
  detection: "检测",
  experience: "体验",
  task: "主动任务",
  exchange: "兑换",
};

const couponTabs: Array<{ id: CouponStatus; label: string }> = [
  { id: "available", label: "可用" },
  { id: "used", label: "已用" },
  { id: "expired", label: "已过期" },
];

const memberPointLedger = pointLedger.filter((entry) => entry.userId === coreDemoUser.id);
const latestEarnEntry = [...memberPointLedger].reverse().find((entry) => entry.direction === "earn");
const latestExchangeEntry = [...memberPointLedger].reverse().find((entry) => entry.direction === "spend" && entry.source === "exchange");
const memberRedemptions = redemptions.filter((item) => item.userId === coreDemoUser.id);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(new Date(value));
}

function StepState({ state }: { state: ReplayState }) {
  const label = state === "ready" ? "待演示" : state === "processing" ? "处理中" : "已完成";
  return <StatusTag tone={state === "completed" ? "success" : state === "processing" ? "warning" : "neutral"}>{label}</StatusTag>;
}

export function MembershipCenterScreen() {
  const [view, setView] = useState<MemberView>("overview");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("available");
  const [earnReplay, setEarnReplay] = useState<ReplayState>("ready");
  const [exchangeReplay, setExchangeReplay] = useState<ReplayState>("ready");

  const goView = (next: MemberView) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const advanceReplay = (kind: "earn" | "exchange") => {
    const state = kind === "earn" ? earnReplay : exchangeReplay;
    const setter = kind === "earn" ? setEarnReplay : setExchangeReplay;
    setter(state === "ready" ? "processing" : state === "processing" ? "completed" : "ready");
  };

  const filteredCoupons = coreUserCoupons.filter((coupon) => coupon.status === couponStatus);
  const availableCoupons = coreUserCoupons.filter((coupon) => coupon.status === "available");
  const levelLabel = membershipLevelLabels[coreDemoUser.member.level];

  if (view === "overview") {
    return (
      <>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-semibold">
              {coreDemoUser.displayName.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{coreDemoUser.displayName}</p>
              <p className="mt-1 text-xs text-white/75">统一用户 ID · {coreDemoUser.id}</p>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{levelLabel}</span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center">
            <div>
              <strong className="block text-xl">{coreDemoUser.pointsBalance.toLocaleString("zh-CN")}</strong>
              <span className="text-xs text-white/70">当前积分</span>
            </div>
            <div>
              <strong className="block text-xl">{availableCoupons.length}</strong>
              <span className="text-xs text-white/70">可用券</span>
            </div>
            <div>
              <strong className="block text-xl">{coreUserOrders.length + (coreDemoReport ? 1 : 0)}</strong>
              <span className="text-xs text-white/70">业务记录</span>
            </div>
          </div>
        </section>

        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">会员规则仍是候选方案</p>
                <StatusTag tone="warning">Candidate</StatusTag>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{coreDemoUser.member.note} {prototypeRules.membershipLevels.note}</p>
            </div>
          </div>
        </Card>

        <Section title="我的权益">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => goView("points")} className="min-h-[112px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition active:bg-[var(--color-surface-subtle)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="success" size={18} /></span>
              <strong className="mt-3 block">积分中心</strong>
              <span className="mt-1 block text-xs leading-5 text-[var(--color-text-tertiary)]">流水 · 获取 · 兑换状态</span>
            </button>
            <button type="button" onClick={() => goView("coupons")} className="min-h-[112px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition active:bg-[var(--color-surface-subtle)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="modules" size={18} /></span>
              <strong className="mt-3 block">我的券</strong>
              <span className="mt-1 block text-xs leading-5 text-[var(--color-text-tertiary)]">优惠券 · 体验券 · 状态</span>
            </button>
            <button type="button" onClick={() => goView("records")} className="min-h-[112px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition active:bg-[var(--color-surface-subtle)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="home" size={18} /></span>
              <strong className="mt-3 block">我的订单</strong>
              <span className="mt-1 block text-xs leading-5 text-[var(--color-text-tertiary)]">查看统一账号订单入口</span>
            </button>
            <button type="button" onClick={() => goView("records")} className="min-h-[112px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition active:bg-[var(--color-surface-subtle)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="info" size={18} /></span>
              <strong className="mt-3 block">检测报告</strong>
              <span className="mt-1 block text-xs leading-5 text-[var(--color-text-tertiary)]">查看基础报告入口</span>
            </button>
          </div>
        </Section>

        <Section title="等级候选结构">
          <Card>
            <div className="flex flex-wrap gap-2">
              {prototypeRules.membershipLevels.value.map((level) => (
                <StatusTag key={level} tone={level === coreDemoUser.member.level ? "success" : "neutral"}>{membershipLevelLabels[level]}</StatusTag>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">这里只确认候选名称，不展示升级门槛、保级条件、倍率或专属折扣，避免把未确认方案当正式会员规则。</p>
          </Card>
        </Section>

        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="font-medium">主动任务 · 能力占位</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">产品真相源确认“主动任务”可以成为积分来源，但任务内容、奖励额度、频率和触发规则尚未建模。本轮只保留入口概念，不伪造可领取任务。</p>
        </Card>
      </>
    );
  }

  if (view === "points") {
    return (
      <>
        <button type="button" onClick={() => goView("overview")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回会员中心
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">积分中心</p>
          <h2 className="mt-1 text-2xl font-semibold">{coreDemoUser.pointsBalance.toLocaleString("zh-CN")} 积分</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">以下获取 / 兑换交互只重放 Shared 已存在的历史流水，不产生新的积分规则，也不写回数据源。</p>
        </div>

        {latestEarnEntry && (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">积分获取状态演示</p>
                  <StepState state={earnReplay} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">重放 {pointSourceLabels[latestEarnEntry.source]} 历史流水 `{latestEarnEntry.id}`：+{latestEarnEntry.amount}，当时入账后余额 {latestEarnEntry.balanceAfter}。</p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => advanceReplay("earn")}>{earnReplay === "ready" ? "开始重放入账" : earnReplay === "processing" ? "完成入账演示" : "重置演示"}</Button>
          </Card>
        )}

        {latestExchangeEntry && (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">积分兑换状态演示</p>
                  <StepState state={exchangeReplay} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">重放历史兑换流水 `{latestExchangeEntry.id}`：-{latestExchangeEntry.amount}，兑换后余额 {latestExchangeEntry.balanceAfter}。具体兑换了什么权益，Shared 未建模，因此不补造商品或券。</p>
              </div>
            </div>
            <SecondaryButton className="mt-4 w-full" onClick={() => advanceReplay("exchange")}>{exchangeReplay === "ready" ? "开始重放兑换" : exchangeReplay === "processing" ? "完成兑换演示" : "重置演示"}</SecondaryButton>
          </Card>
        )}

        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">抵现 / 兑换规则待确认</p>
            <StatusTag tone="warning">Candidate</StatusTag>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{prototypeRules.pointsToCash.note}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">候选方向：积分抵现、兑换商品 / 券 / 权益、积分加现金、抽奖、权益包。V0.1 不提供真实库存、抽奖或第三方权益供应链。</p>
        </Card>

        <Section title="积分流水">
          <div className="space-y-3">
            {[...memberPointLedger].reverse().map((entry) => (
              <Card key={entry.id} className="bg-[var(--color-surface-subtle)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{pointSourceLabels[entry.source]}</p>
                      {entry.scene && <StatusTag>{businessSceneLabels[entry.scene]}</StatusTag>}
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{formatDate(entry.createdAt)} · 余额 {entry.balanceAfter}</p>
                  </div>
                  <strong className={entry.direction === "earn" ? "text-[var(--color-success)]" : "text-[var(--color-text-primary)]"}>{entry.direction === "earn" ? "+" : "-"}{entry.amount}</strong>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </>
    );
  }

  if (view === "coupons") {
    return (
      <>
        <button type="button" onClick={() => goView("overview")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回会员中心
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">我的券</p>
          <h2 className="mt-1 text-2xl font-semibold">优惠券与体验券</h2>
        </div>

        <div className="grid grid-cols-3 gap-2" role="group" aria-label="券状态筛选">
          {couponTabs.map((tab) => {
            const count = coreUserCoupons.filter((coupon) => coupon.status === tab.id).length;
            return (
              <button key={tab.id} type="button" aria-pressed={couponStatus === tab.id} onClick={() => setCouponStatus(tab.id)} className={`min-h-[44px] rounded-[var(--radius-control)] border px-2 text-sm ${couponStatus === tab.id ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)] font-medium text-[var(--color-primary-pressed)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
                {tab.label} · {count}
              </button>
            );
          })}
        </div>

        {filteredCoupons.length ? (
          <div className="space-y-3">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusTag tone={coupon.kind === "experience" ? "success" : "neutral"}>{coupon.kind === "experience" ? "体验券" : "优惠券"}</StatusTag>
                      <StatusTag>{couponStatusLabels[coupon.status]}</StatusTag>
                    </div>
                    <p className="mt-3 font-semibold">{coupon.title}</p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{businessSceneLabels[coupon.scene]} · {coupon.id}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">领取 {formatDate(coupon.claimedAt)}{coupon.expiresAt ? ` · 有效至 ${formatDate(coupon.expiresAt)}` : " · 有效期未提供"}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[var(--color-surface-subtle)]">
            <p className="font-medium">当前没有“{couponStatusLabels[couponStatus]}”样例</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Shared 当前没有为 {coreDemoUser.id} 提供这一状态的券，因此保留真实空态，不临时伪造一张券。</p>
          </Card>
        )}

        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="font-medium">券金额与门槛以 Shared 为准</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前 Coupon 领域模型没有减免金额、满减门槛或叠加规则字段，所以会员中心不补写“满多少减多少”等规则。</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => goView("overview")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
        <PrototypeIcon name="back" size={18} /> 返回会员中心
      </button>

      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">统一账号记录</p>
        <h2 className="mt-1 text-2xl font-semibold">订单、报告与核销</h2>
      </div>

      <Section title={`我的订单 · ${coreUserOrders.length}`}>
        {coreUserOrders.length ? (
          <div className="space-y-3">
            {coreUserOrders.map((order) => (
              <Card key={order.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{order.id}</p>
                      <StatusTag>{businessSceneLabels[order.scene]}</StatusTag>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{order.items.map((item) => `${item.name} × ${item.quantity}`).join("、")}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">¥{order.amountYuan} · {formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : <Card><p className="text-sm">当前账号暂无订单样例。</p></Card>}
      </Section>

      <Section title={coreDemoReport ? "检测报告 · 1" : "检测报告 · 0"}>
        {coreDemoReport ? (
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{coreDemoReport.id}</p>
              <StatusTag tone="success">基础中性结果</StatusTag>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{coreDemoReport.summary}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">{coreDemoReport.disclaimer}</p>
          </Card>
        ) : <Card><p className="text-sm">当前账号暂无检测报告样例。</p></Card>}
      </Section>

      <Section title={`核销记录 · ${memberRedemptions.length}`}>
        <div className="space-y-3">
          {memberRedemptions.map((record) => (
            <Card key={record.id} className="bg-[var(--color-surface-subtle)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{record.code}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{record.targetType} · {record.targetId}</p>
                </div>
                <StatusTag>{redemptionStatusLabels[record.status]}</StatusTag>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Card className="bg-[var(--color-surface-subtle)]">
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">这里是统一用户中心的记录入口，不重复实现 T004 门店核销、T005 商城履约或 T006 抗衰报告流程；对应业务状态仍由各自页面负责。</p>
      </Card>
    </>
  );
}
