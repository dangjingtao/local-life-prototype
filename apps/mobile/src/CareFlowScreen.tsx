import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  CORE_DEMO_IDS,
  coreDemoStore,
  coreDemoUser,
  coreUserCoupons,
  findById,
  prototypeRules,
  redemptions,
  reports,
  services,
  stores,
} from "@prototype/shared";

type CareStep = "zone" | "project" | "coupon" | "store" | "voucher" | "experience" | "report" | "followup";

const basicService = services.find((service) => service.id === "SERVICE-CARE-BASIC");
const carePackage = services.find((service) => service.id === "SERVICE-CARE-PACKAGE");
const experienceCoupon = findById(coreUserCoupons, CORE_DEMO_IDS.experienceCoupon);
const careRedemption = findById(redemptions, CORE_DEMO_IDS.careRedemption);
const coreReport = findById(reports, CORE_DEMO_IDS.report);
const careStores = stores.filter((store) => store.capabilities.includes("care_detection"));

const deviceConcepts = [
  { title: "魔镜 / 面部状态", text: "仅表达可能存在的采集设备形态；设备型号、算法、接入方式与报告字段均未确认。" },
  { title: "头皮状态检测", text: "只展示基础、中性状态结果，不承诺实时、高精度，也不提供疾病判断。" },
  { title: "皮肤状态检测", text: "只作为护理体验前的信息参考，不替代专业医疗检查、诊断或治疗建议。" },
];

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function CareFlowScreen() {
  const [step, setStep] = useState<CareStep>("zone");
  const [voucherRedeemed, setVoucherRedeemed] = useState(false);

  const goStep = (next: CareStep) => {
    setStep(next);
    scrollTop();
  };

  if (!basicService || !experienceCoupon || !careRedemption || !coreReport) {
    return (
      <Card>
        <p className="font-semibold">智慧抗衰演示数据不完整</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">T006 依赖 Shared 中的基础检测服务、体验券、核销记录与报告；当前缺少稳定数据链，因此不伪造替代数据。</p>
      </Card>
    );
  }

  if (step === "zone") {
    return (
      <>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">智慧抗衰 · 名称待确认</span>
            <span className="text-xs text-white/75">{coreDemoUser.id}</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold">从基础检测到护理建议</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">领取体验权益、选择门店、到店核销并查看基础报告。全流程只演示生活护理场景，不表达医疗能力。</p>
        </section>

        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">能力边界仍待确认</p>
                <StatusTag tone="warning">Candidate / Unknown</StatusTag>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{prototypeRules.careDeviceIntegration.note}</p>
            </div>
          </div>
        </Card>

        <Section title="检测设备场景概念">
          <div className="space-y-3">
            {deviceConcepts.map((item) => (
              <Card key={item.title} className="bg-[var(--color-surface-subtle)]">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.text}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Button className="w-full" onClick={() => goStep("project")}>开始体验流程</Button>
      </>
    );
  }

  if (step === "project") {
    return (
      <>
        <button type="button" onClick={() => goStep("zone")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回专区
        </button>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">体验项目</p>
          <h2 className="mt-1 text-2xl font-semibold">{basicService.name}</h2>
        </div>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusTag tone="success">基础体验</StatusTag>
              <p className="mt-3 font-semibold">{basicService.name}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{basicService.note}</p>
            </div>
            <p className="shrink-0 font-semibold text-[var(--color-primary-pressed)]">¥{basicService.priceYuan}</p>
          </div>
        </Card>
        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">该价格是 Shared 的概念服务数据；本原型不发起真实支付，也不代表设备或专业服务已经采购 / 接入。</p>
        </Card>
        <Button className="w-full" onClick={() => goStep("coupon")}>查看体验券</Button>
      </>
    );
  }

  if (step === "coupon") {
    return (
      <>
        <button type="button" onClick={() => goStep("project")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回体验项目
        </button>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">体验权益</p>
          <h2 className="mt-1 text-2xl font-semibold">使用统一账号中的体验券</h2>
        </div>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <StatusTag tone="success">{experienceCoupon.status === "available" ? "可用" : experienceCoupon.status}</StatusTag>
            <span className="text-xs text-[var(--color-text-tertiary)]">{experienceCoupon.id}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold">{experienceCoupon.title}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">归属 {coreDemoUser.displayName} · {coreDemoUser.id}</p>
          <p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">Shared fixture 已将该券发放到统一账号；T006 不擅自改写券状态，只演示选择该权益进入到店流程。</p>
        </section>
        <Button className="w-full" onClick={() => goStep("store")}>使用体验券并选择门店</Button>
      </>
    );
  }

  if (step === "store") {
    return (
      <>
        <button type="button" onClick={() => goStep("coupon")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回体验券
        </button>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">体验门店</p>
          <h2 className="mt-1 text-2xl font-semibold">选择可提供基础检测的门店</h2>
        </div>
        <div className="space-y-3">
          {careStores.map((store) => {
            const isCore = store.id === coreDemoStore.id;
            const couponApplies = experienceCoupon.applicableStoreIds.includes(store.id);
            return (
              <Card key={store.id} className={isCore ? "border-[var(--color-primary)]" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{store.name}</p>
                      {isCore && <StatusTag tone="success">核心闭环门店</StatusTag>}
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{store.address}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{couponApplies ? "体验券适用" : "当前体验券不适用"} · 基础检测能力</p>
                  </div>
                </div>
                {isCore ? (
                  <Button className="mt-4 w-full" onClick={() => goStep("voucher")}>选择此门店</Button>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">本店可作为检测载体，但现有 Shared 核销记录与基础报告绑定 {coreDemoStore.name}；为保持跨端真相一致，本轮不另造第二份报告。</p>
                )}
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  if (step === "voucher") {
    return (
      <>
        <button type="button" onClick={() => goStep("store")} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回门店选择
        </button>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">到店核销凭证</p>
          <h2 className="mt-1 text-2xl font-semibold">出示体验码</h2>
        </div>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{voucherRedeemed ? "本页已模拟核销" : "待到店核销"}</span>
            <span className="text-xs text-white/75">{experienceCoupon.id}</span>
          </div>
          <p className="mt-8 text-sm text-white/75">体验码</p>
          <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.12em]">{careRedemption.code}</p>
          <div className="mt-8 border-t border-white/20 pt-4 text-sm leading-6 text-white/80">
            <p>{coreDemoUser.displayName} · {coreDemoUser.id}</p>
            <p>{coreDemoStore.name} · {coreDemoStore.address}</p>
          </div>
        </section>
        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">模拟核销只改变当前组件状态，不写回 Shared，也不冒充扫码器、门店后台或真实服务已完成。</p>
        </Card>
        {!voucherRedeemed ? (
          <Button className="w-full" onClick={() => setVoucherRedeemed(true)}>模拟店员核销体验券</Button>
        ) : (
          <Button className="w-full" onClick={() => goStep("experience")}>进入基础检测 / 体验</Button>
        )}
      </>
    );
  }

  if (step === "experience") {
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">基础检测 / 体验</p>
          <h2 className="mt-1 text-2xl font-semibold">只采集基础、中性状态</h2>
        </div>
        <Card>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
              <PrototypeIcon name="success" size={22} />
            </span>
            <div>
              <p className="font-semibold">{basicService.name}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">体验地点：{coreDemoStore.name}。设备、实时上传、算法计算和报告生成接口均未接入，本步骤只连接既有演示数据。</p>
            </div>
          </div>
        </Card>
        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <p className="font-semibold">不是医疗诊断</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">不输出疾病名称、风险概率、治疗方案或药品建议；如需医学判断，应由专业医疗机构完成。</p>
        </Card>
        <Button className="w-full" onClick={() => goStep("report")}>查看基础报告</Button>
      </>
    );
  }

  if (step === "report") {
    const reportStore = findById(stores, coreReport.storeId);
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">基础报告</p>
          <h2 className="mt-1 text-2xl font-semibold">{coreReport.id}</h2>
        </div>
        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <StatusTag tone="success">基础中性结果</StatusTag>
            <span className="text-xs text-[var(--color-text-tertiary)]">{coreReport.createdAt.slice(0, 10)}</span>
          </div>
          <h3 className="mt-5 text-xl font-semibold">{coreReport.summary}</h3>
          <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">用户</span><span className="text-right font-medium">{coreDemoUser.displayName} · {coreReport.userId}</span></div>
            <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">体验门店</span><span className="text-right font-medium">{reportStore?.name ?? coreReport.storeId}</span></div>
            <div className="flex justify-between gap-3"><span className="text-[var(--color-text-secondary)]">体验项目</span><span className="text-right font-medium">{basicService.name}</span></div>
          </div>
        </section>
        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <p className="font-semibold">报告能力说明</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{coreReport.disclaimer}</p>
        </Card>
        <Button className="w-full" onClick={() => goStep("followup")}>查看后续护理权益</Button>
      </>
    );
  }

  return (
    <>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">报告后的生活护理承接</p>
        <h2 className="mt-1 text-2xl font-semibold">护理套餐与后续权益</h2>
      </div>
      {carePackage ? (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{carePackage.name}</p>
                <StatusTag tone="warning">候选方案</StatusTag>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{carePackage.note}</p>
              <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">当前 Shared 仅将该套餐配置到南岸生活馆；本轮只提供信息承接，不伪装云岭社区店已可购买 / 履约。</p>
            </div>
            <p className="shrink-0 font-semibold text-[var(--color-primary-pressed)]">¥{carePackage.priceYuan}</p>
          </div>
        </Card>
      ) : null}
      <Card className="bg-[var(--color-success-bg)]">
        <p className="font-semibold">T006 主链已回到统一用户</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">体验券 {experienceCoupon.id}、核销 {careRedemption.id}、报告 {coreReport.id} 均关联用户 {coreDemoUser.id}，核心报告与核销门店均为 {coreDemoStore.name}。</p>
      </Card>
      <SecondaryButton className="w-full" onClick={() => { setVoucherRedeemed(false); goStep("zone"); }}>返回专区重新演示</SecondaryButton>
    </>
  );
}
