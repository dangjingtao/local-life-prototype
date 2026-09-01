import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  CORE_DEMO_IDS,
  appointments,
  careProjects,
  careServices,
  coreDemoUser,
  getUserDetectionHistory,
  offlineStores,
  v02Coupons,
  type Appointment,
  type DetectionMetric,
  type DetectionReport,
} from "@prototype/shared";

type ReportView = "list" | "detail" | "compare";

interface CareReportScreenProps {
  onBack: () => void;
  entryReportId?: string;
  backLabel?: string;
}

const trendMeta: Record<NonNullable<DetectionMetric["trend"]>, { label: string; tone: "success" | "warning" | "neutral"; up: boolean }> = {
  up: { label: "提升", tone: "success", up: true },
  down: { label: "下降", tone: "warning", up: false },
  stable: { label: "平稳", tone: "neutral", up: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Shanghai" }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Shanghai" }).format(new Date(value));
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function BackButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-1 text-sm font-medium text-[var(--color-text-secondary)]">
      <PrototypeIcon name="back" size={18} /> {children}
    </button>
  );
}

function RelationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-[var(--color-text-tertiary)]">{label}</span>
      <span className="max-w-[62%] break-all text-right font-mono text-[var(--color-text-secondary)]">{value}</span>
    </div>
  );
}

function MetricBar({ metric, highlight = false }: { metric: DetectionMetric; highlight?: boolean }) {
  const score = typeof metric.score === "number" ? Math.max(0, Math.min(100, metric.score)) : 0;
  const trend = metric.trend ? trendMeta[metric.trend] : undefined;
  return (
    <Card className={highlight ? "border-[var(--color-primary)]" : "p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{metric.label}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{metric.note ?? "原型指标，非医疗诊断"}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold">{metric.value}{metric.unit ? <span className="ml-0.5 text-xs font-medium text-[var(--color-text-tertiary)]">{metric.unit}</span> : null}</p>
          {trend && (
            <p className={`mt-1 flex items-center justify-end gap-1 text-xs font-medium ${trend.tone === "success" ? "text-[var(--color-success)]" : trend.tone === "warning" ? "text-[var(--color-warning)]" : "text-[var(--color-text-tertiary)]"}`}>
              <PrototypeIcon name="trend" size={13} className={trend.up ? "" : "rotate-180"} />
              {trend.label}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
          <span>状态分</span>
          <span>{metric.score ?? "--"} / 100</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-accent))]"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function ReportHero({ report, projectName, storeName }: { report: DetectionReport; projectName: string; storeName: string }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[#171b2a] text-white">
      <div className="bg-[linear-gradient(135deg,#252b3d_0%,#171b2a_58%,#2a2b52_100%)] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em]">DETECTION REPORT · V0.2</span>
          <span className="text-[11px] opacity-60">{report.id}</span>
        </div>
        <p className="mt-6 text-xs font-medium text-[#aeb4cf]">智慧抗衰 · 检测报告</p>
        <h2 className="mt-1 text-2xl font-semibold leading-tight">{projectName}</h2>
        <p className="mt-3 text-sm leading-6 text-[#c6cbe0]">{report.summary}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
          <div><p className="text-[11px] text-[#8b91ad]">检测日期</p><p className="mt-1 font-medium">{formatDate(report.createdAt)}</p></div>
          <div><p className="text-[11px] text-[#8b91ad]">体验门店</p><p className="mt-1 font-medium">{storeName}</p></div>
        </div>
      </div>
    </section>
  );
}

function DetailView({ report, goCompare, goBack, backLabel }: { report: DetectionReport; goCompare: () => void; goBack: () => void; backLabel: string }) {
  const [couponClaimed, setCouponClaimed] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);
  const store = offlineStores.find((item) => item.id === report.storeId);
  const project = careProjects.find((item) => item.id === report.careProjectId);
  const appointment: Appointment | undefined = report.appointmentId ? appointments.find((item) => item.id === report.appointmentId) : undefined;
  const detectionRecordId = report.detectionRecordId;
  const exclusiveCoupon = report.exclusiveCouponId ? v02Coupons.find((item) => item.id === report.exclusiveCouponId) : undefined;
  const recommendedService = report.recommendedServiceId ? careServices.find((item) => item.id === report.recommendedServiceId) : undefined;
  const comparisonReport = report.comparisonReportId ? getUserDetectionHistory(CORE_DEMO_IDS.user).find((item) => item.id === report.comparisonReportId) : undefined;
  const metrics = report.metrics ?? [];

  return (
    <>
      <BackButton onClick={goBack}>{backLabel}</BackButton>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">检测报告</p>
        <h2 className="mt-1 text-2xl font-semibold">{project?.name ?? "检测报告"}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">结果数据、护理建议、专属权益与复测提醒都来自同一份 T015 报告关系，与预约和检测记录保持一致。</p>
      </div>

      <ReportHero report={report} projectName={project?.name ?? "检测项目"} storeName={store?.name ?? "体验门店"} />

      {metrics.length > 0 && (
        <Section title="检测结果指标">
          <div className="space-y-3">
            {metrics.map((metric) => <MetricBar key={metric.key} metric={metric} />)}
          </div>
        </Section>
      )}

      <Section title="检测上下文">
        <Card className="bg-[var(--color-surface-subtle)]">
          <div className="grid gap-2 text-xs">
            <RelationRow label="User" value={report.userId} />
            <RelationRow label="Care Project" value={report.careProjectId ?? "--"} />
            <RelationRow label="Offline Store" value={report.storeId} />
            <RelationRow label="Appointment" value={report.appointmentId ?? "--"} />
            <RelationRow label="Detection Record" value={detectionRecordId ?? "--"} />
            <RelationRow label="Report" value={report.id} />
            {appointment && <RelationRow label="预约时间" value={`${formatDate(appointment.scheduledAt)} ${formatTime(appointment.scheduledAt)}`} />}
          </div>
        </Card>
      </Section>

      {(report.careAdvice?.length ?? 0) > 0 && (
        <Section title="个性化护理建议">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="sparkles" size={20} /></span>
              <div className="space-y-2">
                {report.careAdvice?.map((advice) => <p key={advice} className="text-sm leading-6 text-[var(--color-text-secondary)]">{advice}</p>)}
              </div>
            </div>
          </Card>
        </Section>
      )}

      {exclusiveCoupon && (
        <Section title="检测后专属权益">
          <Card className="border-[var(--color-primary)] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="coupon" size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{exclusiveCoupon.title}</p>
                  <StatusTag tone="success">限时专属</StatusTag>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">检测完成后为 {coreDemoUser.displayName} 发放，适用于指定护理门店。</p>
                <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{exclusiveCoupon.id} · 领取 {formatDate(exclusiveCoupon.claimedAt)}{exclusiveCoupon.expiresAt ? ` · 有效至 ${formatDate(exclusiveCoupon.expiresAt)}` : ""}</p>
                <SecondaryButton className="mt-4 w-full" onClick={() => setCouponClaimed((value) => !value)}>
                  {couponClaimed ? "已领取 · 在我的券包中" : "领取到我的券包"}
                </SecondaryButton>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {recommendedService && (
        <Section title="护理套餐">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="gift" size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{recommendedService.name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">结合本次结果的结构化建议</p>
                  </div>
                  <p className="text-lg font-semibold text-[var(--color-primary-pressed)]">¥{recommendedService.priceYuan}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{recommendedService.note}</p>
                <Button className="mt-4 w-full" onClick={() => setPackageOpen((value) => !value)}>{packageOpen ? "收起套餐详情" : "查看套餐详情"}</Button>
                {packageOpen && (
                  <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="clock" size={16} /></span>
                      <div>
                        <p className="text-sm font-medium">套餐详情 · 原型承接</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">适用于 {recommendedService.storeIds.map((storeId) => offlineStores.find((item) => item.id === storeId)?.name ?? storeId).join("、")}，价格 ¥{recommendedService.priceYuan}。真实套餐购买、权益核销与转化配置由 T023 之后的流程承接，本页不伪装成已可下单。</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Section>
      )}

      {report.retestRecommendedAt && (
        <Section title="复测提醒">
          <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-warning)]"><PrototypeIcon name="calendar" size={20} /></span>
              <div>
                <p className="font-semibold">建议在 {formatDate(report.retestRecommendedAt)} 前后复测</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">带着本次报告回来，店员可按同一项目进行对照；真实复测提醒推送与营销规则未接入。</p>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {comparisonReport && (
        <Section title="历史对比">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="trend" size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">对比 {formatDate(comparisonReport.createdAt)} 的历次报告</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">对照同一项目的指标与状态表达，直观辨认两次检测差异。</p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={goCompare}>查看历史对比</Button>
          </Card>
        </Section>
      )}

      <Card className="bg-[var(--color-surface-subtle)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="shield" size={16} /></span>
          <div>
            <p className="text-sm font-medium">非医疗诊断边界</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{report.disclaimer} 护理建议与专属券为原型中的消费服务 / 权益表达，不代表医疗判断或检测准确度承诺。</p>
          </div>
        </div>
      </Card>
    </>
  );
}

function CompareView({ report, goBack }: { report: DetectionReport; goBack: () => void }) {
  const history = getUserDetectionHistory(CORE_DEMO_IDS.user);
  const comparison = history.find((item) => item.id === report.comparisonReportId);
  if (!comparison) {
    return <Card><p className="font-semibold">暂无可对比的历史报告</p><Button className="mt-4 w-full" onClick={goBack}>返回报告详情</Button></Card>;
  }
  const current = report;
  const project = careProjects.find((item) => item.id === current.careProjectId);
  const currentStore = offlineStores.find((item) => item.id === current.storeId);
  const previousStore = offlineStores.find((item) => item.id === comparison.storeId);
  const currentMetrics = current.metrics ?? [];
  const previousMetrics = comparison.metrics ?? [];
  const rows = currentMetrics.map((metric) => {
    const previous = previousMetrics.find((item) => item.key === metric.key);
    return { metric, previous };
  });

  return (
    <>
      <BackButton onClick={goBack}>返回报告详情</BackButton>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">历史报告对比</p>
        <h2 className="mt-1 text-2xl font-semibold">{project?.name ?? "检测项目"} · 两次对照</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">按同一项目把两次检测的指标与状态并排表达；这里只呈现结构差异，不包含 AI 趋势分析或医疗判断。</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
          <div className="p-4">
            <p className="text-xs font-medium text-[var(--color-text-tertiary)]">历次 · {formatDate(comparison.createdAt)}</p>
            <p className="mt-2 text-sm font-medium">{previousStore?.name ?? "体验门店"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{comparison.id}</p>
          </div>
          <div className="bg-[var(--color-brand-subtle)] p-4">
            <p className="text-xs font-medium text-[var(--color-primary-pressed)]">最近 · {formatDate(current.createdAt)}</p>
            <p className="mt-2 text-sm font-medium">{currentStore?.name ?? "体验门店"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{current.id}</p>
          </div>
        </div>
      </Card>

      <Section title="指标对照">
        <div className="space-y-3">
          {rows.map(({ metric, previous }) => {
            if (!previous) {
              return <Card key={metric.key} className="bg-[var(--color-surface-subtle)]"><p className="text-sm font-medium">{metric.label}</p><p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">历次报告未记录该指标。</p></Card>;
            }
            const delta = metric.value - previous.value;
            const deltaLabel = delta === 0 ? "持平" : delta > 0 ? `+${delta}` : `${delta}`;
            const tone = delta === 0 ? "neutral" : "warning";
            return (
              <Card key={metric.key}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{metric.label}</p>
                  <StatusTag tone={tone}>{delta === 0 ? "持平" : `${deltaLabel} 变化`}</StatusTag>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] p-3">
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">历次 · {formatDate(comparison.createdAt)}</p>
                    <p className="mt-2 text-lg font-semibold">{previous.value}{previous.unit ? <span className="ml-0.5 text-xs font-medium text-[var(--color-text-tertiary)]">{previous.unit}</span> : null}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">状态分 {previous.score ?? "--"}</p>
                  </div>
                  <div className="rounded-[var(--radius-control)] bg-[var(--color-brand-subtle)] p-3">
                    <p className="text-[11px] text-[var(--color-primary-pressed)]">最近 · {formatDate(current.createdAt)}</p>
                    <p className="mt-2 text-lg font-semibold">{metric.value}{metric.unit ? <span className="ml-0.5 text-xs font-medium text-[var(--color-text-tertiary)]">{metric.unit}</span> : null}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">状态分 {metric.score ?? "--"}</p>
                  </div>
                </div>
                {metric.trend && <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">{metric.note ?? "原型指标，非医疗诊断"}</p>}
              </Card>
            );
          })}
        </div>
      </Section>

      <Card className="bg-[var(--color-surface-subtle)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="shield" size={16} /></span>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">对比仅用于产品结构演示：指标方向变化不代表医学结论，也不承诺复测准确率。真实 AI 趋势分析不在 V0.2 范围。</p>
        </div>
      </Card>
    </>
  );
}

function ListView({ goDetail, goBack, backLabel }: { goDetail: (reportId: string) => void; goBack: () => void; backLabel: string }) {
  const history = getUserDetectionHistory(CORE_DEMO_IDS.user);
  return (
    <>
      <BackButton onClick={goBack}>{backLabel}</BackButton>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">我的检测</p>
        <h2 className="mt-1 text-2xl font-semibold">历次检测报告</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">统一账号下 {coreDemoUser.id} 的检测记录与报告入口，与 T015 检测记录、T020 预约关系一致。</p>
      </div>

      {history.length > 0 ? (
        <Section title={`${history.length} 次检测`}>
          <div className="space-y-3">
            {history.map((report) => {
              const store = offlineStores.find((item) => item.id === report.storeId);
              const project = careProjects.find((item) => item.id === report.careProjectId);
              return (
                <button key={report.id} type="button" onClick={() => goDetail(report.id)} className="w-full rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition active:bg-[var(--color-surface-subtle)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{project?.name ?? "检测项目"}</p>
                        <StatusTag tone="success">报告已生成</StatusTag>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{formatDate(report.createdAt)} · {store?.name ?? "体验门店"}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{report.id}</p>
                    </div>
                    <span className="mt-1 shrink-0 text-[var(--color-text-tertiary)]"><PrototypeIcon name="chevron" size={18} /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      ) : (
        <Card className="bg-[var(--color-surface-subtle)] p-5 text-center">
          <p className="font-semibold">还没有检测报告</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">完成智慧抗衰检测后，报告会沉淀在这里，并支持历次报告对比。</p>
        </Card>
      )}

      <Card className="bg-[var(--color-surface-subtle)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]"><PrototypeIcon name="shield" size={16} /></span>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">报告为消费服务 / 护理建议表达，不包含医疗诊断、治疗建议或未经确认的准确率。</p>
        </div>
      </Card>
    </>
  );
}

export function CareReportScreen({ onBack, entryReportId, backLabel = "返回" }: CareReportScreenProps) {
  const history = getUserDetectionHistory(CORE_DEMO_IDS.user);
  const [view, setView] = useState<ReportView>(() => (entryReportId ? "detail" : "list"));
  const [activeReportId, setActiveReportId] = useState(() => entryReportId ?? history[0]?.id ?? "");
  const activeReport = history.find((item) => item.id === activeReportId) ?? history[0];

  const goDetail = (reportId: string) => {
    setActiveReportId(reportId);
    setView("detail");
    scrollTop();
  };
  const goCompare = () => {
    setView("compare");
    scrollTop();
  };
  const goList = () => {
    setView("list");
    scrollTop();
  };
  const backFromDetail = () => {
    if (view === "detail") goList();
    else if (view === "compare") {
      setView("detail");
      scrollTop();
    } else onBack();
  };

  if (!activeReport) {
    return (
      <>
        <BackButton onClick={onBack}>{backLabel}</BackButton>
        <Card className="bg-[var(--color-surface-subtle)] p-5 text-center">
          <p className="font-semibold">还没有检测报告</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">完成智慧抗衰检测后，报告会沉淀在这里。</p>
        </Card>
      </>
    );
  }

  if (view === "compare") {
    return <CompareView report={activeReport} goBack={backFromDetail} />;
  }
  if (view === "detail") {
    return <DetailView report={activeReport} goCompare={goCompare} goBack={backFromDetail} backLabel="返回" />;
  }
  return <ListView goDetail={goDetail} goBack={onBack} backLabel={backLabel} />;
}
