import { useState } from "react";
import { Button, Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  CORE_DEMO_IDS,
  appointmentSlots,
  appointments,
  careProjects,
  coreDemoUser,
  offlineStores,
  type AppointmentSlotStatus,
} from "@prototype/shared";

type CareStep =
  | "zone"
  | "project"
  | "store"
  | "slot"
  | "confirm"
  | "detail"
  | "voucher"
  | "checking"
  | "checked_in"
  | "detecting"
  | "complete";

type CareEntryContext = {
  entityId: string;
  entityType: string;
  title: string;
  subtitle: string;
};

interface CareFlowScreenProps {
  entryContext?: CareEntryContext;
}

const DEMO_NOW = "2026-09-01T08:45:00+08:00";
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const generatedAppointmentId = "APPOINTMENT-8888-T020";
const generatedAppointmentCode = "CARE-APPT-8888-T020";
const qrPattern = [
  "111111101",
  "100000101",
  "101110101",
  "101110101",
  "100000101",
  "111111101",
  "001010111",
  "111001001",
  "101111111",
];

const slotStatusMeta: Record<AppointmentSlotStatus, { label: string; tone: "success" | "warning" | undefined; disabled: boolean }> = {
  available: { label: "可约", tone: "success", disabled: false },
  full: { label: "已满", tone: "warning", disabled: true },
  booked: { label: "不可约 · 已预约", tone: "warning", disabled: true },
};

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function getModificationDeadline(scheduledAt: string) {
  return new Date(new Date(scheduledAt).getTime() - TWO_HOURS_MS).toISOString();
}

function canModifyAppointment(scheduledAt: string, now = DEMO_NOW) {
  return new Date(scheduledAt).getTime() - new Date(now).getTime() > TWO_HOURS_MS;
}

function resolveEntryProjectId(entryContext?: CareEntryContext) {
  if (!entryContext) return null;
  if (entryContext.entityType === "care_project" && careProjects.some((item) => item.id === entryContext.entityId)) {
    return entryContext.entityId;
  }
  if (entryContext.entityType === "service") {
    return careProjects.find((item) => item.serviceId === entryContext.entityId)?.id ?? null;
  }
  return null;
}

function BackButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-1 text-sm font-medium text-[var(--color-text-secondary)]">
      <PrototypeIcon name="back" size={18} /> {children}
    </button>
  );
}

function RelationGrid({ projectId, storeId, slotId, appointmentId = generatedAppointmentId }: { projectId: string; storeId: string; slotId: string; appointmentId?: string }) {
  const rows = [
    ["User", coreDemoUser.id],
    ["Care Project", projectId],
    ["Store", storeId],
    ["Time Slot", slotId],
    ["Appointment", appointmentId],
  ];
  return (
    <div className="grid grid-cols-1 gap-2 rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3 text-xs">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-3">
          <span className="text-[var(--color-text-tertiary)]">{label}</span>
          <span className="max-w-[62%] break-all text-right font-mono text-[var(--color-text-secondary)]">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function CareFlowScreen({ entryContext }: CareFlowScreenProps) {
  const entryProjectId = resolveEntryProjectId(entryContext);
  const [step, setStep] = useState<CareStep>(() => entryProjectId ? "project" : "zone");
  const [selectedProjectId, setSelectedProjectId] = useState(() => entryProjectId ?? careProjects[0]?.id ?? "");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState<"scheduled" | "cancelled">("scheduled");
  const [rescheduling, setRescheduling] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  const selectedProject = careProjects.find((item) => item.id === selectedProjectId) ?? careProjects[0];
  const selectedStore = offlineStores.find((item) => item.id === selectedStoreId);
  const selectedSlot = appointmentSlots.find((item) => item.id === selectedSlotId);
  const existingAppointment = appointments.find((item) => item.id === CORE_DEMO_IDS.appointment);
  const existingProject = existingAppointment ? careProjects.find((item) => item.id === existingAppointment.careProjectId) : undefined;
  const existingStore = existingAppointment ? offlineStores.find((item) => item.id === existingAppointment.storeId) : undefined;
  const existingLocked = existingAppointment ? !canModifyAppointment(existingAppointment.scheduledAt) : false;

  const goStep = (next: CareStep) => {
    setStep(next);
    scrollTop();
  };

  const chooseProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedStoreId("");
    setSelectedSlotId("");
    setActionNotice("");
    goStep("project");
  };

  const chooseStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setSelectedSlotId("");
    setActionNotice("");
    goStep("slot");
  };

  const chooseSlot = (slotId: string) => {
    setSelectedSlotId(slotId);
    goStep("confirm");
  };

  const resetToZone = () => {
    setSelectedStoreId("");
    setSelectedSlotId("");
    setAppointmentStatus("scheduled");
    setRescheduling(false);
    setActionNotice("");
    goStep("zone");
  };

  if (!selectedProject) {
    return (
      <Card>
        <p className="font-semibold">智慧抗衰预约数据不完整</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">T020 依赖 T015 的 Care Project / Store / Time Slot fixtures；当前没有可用项目，因此不伪造替代数据。</p>
      </Card>
    );
  }

  if (step === "zone") {
    return (
      <>
        {entryContext && (
          <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">来自全局搜索</p>
                <p className="mt-2 font-semibold">{entryContext.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{entryContext.subtitle}</p>
              </div>
              <StatusTag tone="success">已定位</StatusTag>
            </div>
          </Card>
        )}

        <section className="overflow-hidden rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="bg-[var(--color-primary)] p-5 text-[var(--color-on-primary)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">SMART CARE · V0.2</span>
              <span className="text-xs opacity-75">{coreDemoUser.displayName} · {coreDemoUser.id}</span>
            </div>
            <p className="mt-7 text-xs font-semibold tracking-[0.16em] opacity-70">智慧抗衰</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">先预约，再到店完成检测与服务。</h2>
            <p className="mt-3 text-sm leading-6 opacity-80">项目、门店、时段、预约码与核销状态都使用同一套 T015 fixtures。专业感来自清晰的数据与流程，不用“AI 蓝光”替代信息设计。</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] p-4 text-center">
            <div><p className="text-lg font-semibold">{careProjects.length}</p><p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">项目</p></div>
            <div><p className="text-lg font-semibold">{offlineStores.filter((item) => item.capabilities.includes("care_detection") || item.capabilities.includes("care_service")).length}</p><p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">服务门店</p></div>
            <div><p className="text-lg font-semibold">2h</p><p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">变更边界</p></div>
          </div>
        </section>

        {existingAppointment && existingProject && existingStore && (
          <Section title="我的预约">
            <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{existingProject.name}</p>
                    <StatusTag tone="warning">{existingLocked ? "2 小时内已锁定" : "可改期 / 取消"}</StatusTag>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{formatDate(existingAppointment.scheduledAt)} {formatTime(existingAppointment.scheduledAt)} · {existingStore.name}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">规则演示时间：2026-09-01 08:45。该预约 10:30 开始，08:30 起进入开始前 2 小时锁定期，所以取消 / 改期按钮不可用。</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <SecondaryButton disabled={existingLocked} className="w-full">改期</SecondaryButton>
                <SecondaryButton disabled={existingLocked} className="w-full">取消预约</SecondaryButton>
              </div>
            </Card>
          </Section>
        )}

        <Section title="检测 / 服务项目">
          <div className="space-y-3">
            {careProjects.map((project) => (
              <Card key={project.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusTag tone="success">{project.durationMinutes} 分钟</StatusTag>
                      <span className="text-xs text-[var(--color-text-tertiary)]">{project.storeIds.length} 家适用门店</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{project.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{project.summary}</p>
                    <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">{project.note}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-[var(--color-primary-pressed)]">¥{project.priceYuan}</p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">原型价</p>
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={() => chooseProject(project.id)}>查看项目并预约</Button>
              </Card>
            ))}
          </div>
        </Section>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <PrototypeIcon name="info" size={19} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" />
            <div>
              <p className="font-semibold">非医疗诊断边界</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">检测与护理均为生活护理原型语义，不输出疾病判断、治疗方案、药品建议或未经确认的准确率。</p>
            </div>
          </div>
        </Card>
      </>
    );
  }

  if (step === "project") {
    const projectStores = selectedProject.storeIds
      .map((storeId) => offlineStores.find((item) => item.id === storeId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return (
      <>
        <BackButton onClick={() => goStep("zone")}>返回智慧抗衰</BackButton>
        {entryContext && entryProjectId === selectedProject.id && (
          <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
            <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">搜索已直接定位到项目</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{entryContext.title} · {entryContext.entityId}</p>
          </Card>
        )}
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">预约项目</p>
          <h2 className="mt-1 text-2xl font-semibold">{selectedProject.name}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedProject.summary}</p>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
            <div className="p-4"><p className="text-xs text-[var(--color-text-tertiary)]">时长</p><p className="mt-2 font-semibold">{selectedProject.durationMinutes} 分钟</p></div>
            <div className="p-4"><p className="text-xs text-[var(--color-text-tertiary)]">价格</p><p className="mt-2 font-semibold">¥{selectedProject.priceYuan}</p></div>
            <div className="p-4"><p className="text-xs text-[var(--color-text-tertiary)]">门店</p><p className="mt-2 font-semibold">{projectStores.length} 家</p></div>
          </div>
        </Card>

        <Section title="适用门店">
          <div className="space-y-3">
            {projectStores.map((store) => {
              const hasSlots = appointmentSlots.some((slot) => slot.careProjectId === selectedProject.id && slot.storeId === store.id);
              return (
                <Card key={store.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{store.name}</p>
                        <StatusTag tone={store.status === "open" ? "success" : "warning"}>{store.status === "open" ? "营业中" : "暂不可约"}</StatusTag>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{store.address}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">距你 {store.distanceKm?.toFixed(1) ?? "--"} km · {store.businessHours ?? "营业时间待配置"}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--color-text-tertiary)]">{hasSlots ? "已有时段" : "暂无时段"}</span>
                  </div>
                  <Button className="mt-4 w-full" disabled={store.status !== "open"} onClick={() => chooseStore(store.id)}>选择此门店</Button>
                </Card>
              );
            })}
          </div>
        </Section>
      </>
    );
  }

  if (step === "slot") {
    if (!selectedStore) {
      return <Card><p className="font-semibold">请先选择门店</p><Button className="mt-4 w-full" onClick={() => goStep("project")}>返回门店选择</Button></Card>;
    }

    const storeSlots = appointmentSlots.filter((slot) => slot.careProjectId === selectedProject.id && slot.storeId === selectedStore.id);
    const fullSample = appointmentSlots.find((slot) => slot.status === "full");
    const bookedSample = appointmentSlots.find((slot) => slot.status === "booked");
    const dateKeys = Array.from(new Set(storeSlots.map((slot) => slot.startsAt.slice(0, 10))));

    return (
      <>
        <BackButton onClick={() => goStep("project")}>返回项目详情</BackButton>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">选择日期 / 时段</p>
          <h2 className="mt-1 text-2xl font-semibold">{selectedStore.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">时段按“门店 × 项目 × 日期”维护；不可约状态不会被隐藏或伪装成可点击。</p>
        </div>

        {actionNotice && <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4"><p className="text-sm font-medium text-[var(--color-primary-pressed)]">{actionNotice}</p></Card>}

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="预约日期">
          {(dateKeys.length ? dateKeys : ["2026-09-01"]).map((dateKey) => (
            <button key={dateKey} type="button" aria-pressed="true" className="min-h-11 shrink-0 rounded-full border border-[var(--color-primary)] bg-[var(--color-brand-subtle)] px-4 text-sm font-medium text-[var(--color-primary-pressed)]">
              {dateKey === "2026-09-01" ? "9月1日 周二" : dateKey}
            </button>
          ))}
        </div>

        <Section title="可选时段">
          {storeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {storeSlots.map((slot) => {
                const meta = slotStatusMeta[slot.status];
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={meta.disabled}
                    onClick={() => chooseSlot(slot.id)}
                    className="min-h-[88px] rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left disabled:cursor-not-allowed disabled:opacity-60 enabled:active:bg-[var(--color-surface-subtle)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-lg font-semibold">{formatTime(slot.startsAt)}</p>
                      <StatusTag tone={meta.tone}>{meta.label}</StatusTag>
                    </div>
                    <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{slot.durationMinutes} 分钟 · {slot.bookedCount}/{slot.capacity || "-"}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="p-5 text-center">
              <p className="font-semibold">当前门店暂无可配置时段</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">这是 T015 fixture 的真实空档，不自动编造可预约库存。可返回选择另一门店。</p>
            </Card>
          )}
        </Section>

        <Card className="bg-[var(--color-surface-subtle)] p-4">
          <p className="font-semibold">时段状态样例</p>
          <div className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
            {fullSample && <p>已满：{formatTime(fullSample.startsAt)} · {fullSample.id}</p>}
            {bookedSample && <p>不可约：{formatTime(bookedSample.startsAt)} · 已被当前预约占用</p>}
            <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">“不可约”可来自已预约、门店停用或规则锁定；本卡只使用现有 fixture 中可验证的 booked / full 样例。</p>
          </div>
        </Card>
      </>
    );
  }

  if (step === "confirm") {
    if (!selectedStore || !selectedSlot) {
      return <Card><p className="font-semibold">预约上下文不完整</p><Button className="mt-4 w-full" onClick={() => goStep("slot")}>返回选择时段</Button></Card>;
    }

    return (
      <>
        <BackButton onClick={() => goStep("slot")}>返回时段选择</BackButton>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">预约确认</p>
          <h2 className="mt-1 text-2xl font-semibold">确认本次到店安排</h2>
        </div>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{selectedProject.name}</p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{selectedStore.name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{formatDate(selectedSlot.startsAt)} {formatTime(selectedSlot.startsAt)} · {selectedProject.durationMinutes} 分钟</p>
            </div>
            <p className="text-lg font-semibold text-[var(--color-primary-pressed)]">¥{selectedProject.priceYuan}</p>
          </div>
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-text-tertiary)]">预约人</p>
            <p className="mt-1 text-sm font-medium">{coreDemoUser.displayName} · {coreDemoUser.id}</p>
          </div>
        </Card>

        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4">
          <p className="font-semibold">取消 / 改期规则</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">开始前 2 小时仍可取消或改期；进入 2 小时内后锁定。当前选择 {formatTime(selectedSlot.startsAt)}，演示时间 08:45，因此仍可修改。</p>
        </Card>

        <RelationGrid projectId={selectedProject.id} storeId={selectedStore.id} slotId={selectedSlot.id} />
        <Button className="w-full" onClick={() => {
          setAppointmentStatus("scheduled");
          setActionNotice(rescheduling ? "改期已应用到当前原型会话。" : "预约已生成到当前原型会话。真实后端未接入。" );
          setRescheduling(false);
          goStep("detail");
        }}>{rescheduling ? "确认改期" : "确认预约"}</Button>
      </>
    );
  }

  if (step === "detail") {
    if (!selectedStore || !selectedSlot) {
      return <Card><p className="font-semibold">预约详情缺少上下文</p><Button className="mt-4 w-full" onClick={() => goStep("slot")}>重新选择时段</Button></Card>;
    }
    const canModify = canModifyAppointment(selectedSlot.startsAt);
    const deadline = new Date(new Date(selectedSlot.startsAt).getTime() - TWO_HOURS_MS);

    return (
      <>
        <BackButton onClick={resetToZone}>返回智慧抗衰</BackButton>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">预约详情</p>
          <h2 className="mt-1 text-2xl font-semibold">{appointmentStatus === "cancelled" ? "预约已取消" : "预约已确认"}</h2>
        </div>

        {actionNotice && <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4"><p className="text-sm font-medium text-[var(--color-primary-pressed)]">{actionNotice}</p></Card>}

        <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-[var(--color-on-primary)]">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{appointmentStatus === "scheduled" ? "已预约" : "已取消"}</span>
            <span className="text-xs opacity-75">{generatedAppointmentId}</span>
          </div>
          <h3 className="mt-6 text-xl font-semibold">{selectedProject.name}</h3>
          <p className="mt-2 text-sm opacity-80">{formatDate(selectedSlot.startsAt)} {formatTime(selectedSlot.startsAt)} · {selectedStore.name}</p>
          <p className="mt-1 text-sm opacity-80">{selectedStore.address}</p>
        </section>

        <RelationGrid projectId={selectedProject.id} storeId={selectedStore.id} slotId={selectedSlot.id} />

        {appointmentStatus === "scheduled" ? (
          <>
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">开始前 2 小时可取消 / 改期</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">当前预约最晚可在 {formatTime(deadline.toISOString())} 前操作。演示时间为 08:45，当前仍处于可修改区间。</p>
                </div>
                <StatusTag tone={canModify ? "success" : "warning"}>{canModify ? "可修改" : "已锁定"}</StatusTag>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <SecondaryButton disabled={!canModify} className="w-full" onClick={() => {
                  setRescheduling(true);
                  setSelectedSlotId("");
                  setActionNotice("正在改期：请选择同项目、同门店下的新时段。开始前 2 小时规则继续生效。" );
                  goStep("slot");
                }}>改期</SecondaryButton>
                <SecondaryButton disabled={!canModify} className="w-full" onClick={() => {
                  setAppointmentStatus("cancelled");
                  setActionNotice("预约已在当前原型会话中取消；未写回共享 fixtures。" );
                }}>取消预约</SecondaryButton>
              </div>
            </Card>
            <Button className="w-full" onClick={() => goStep("voucher")}>查看预约二维码 / 预约码</Button>
          </>
        ) : (
          <Button className="w-full" onClick={() => {
            setAppointmentStatus("scheduled");
            setSelectedSlotId("");
            setActionNotice("重新预约：请选择新的可约时段。" );
            goStep("slot");
          }}>重新选择时段</Button>
        )}
      </>
    );
  }

  if (step === "voucher") {
    if (!selectedStore || !selectedSlot) return null;
    return (
      <>
        <BackButton onClick={() => goStep("detail")}>返回预约详情</BackButton>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">到店核销前</p>
          <h2 className="mt-1 text-2xl font-semibold">出示预约二维码</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">店员端扫码后核对预约、用户、门店、项目和时段关系。本原型只模拟核销状态，不调用摄像头或扫码硬件。</p>
        </div>

        <section className="rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-white p-5 text-slate-950">
          <div className="mx-auto grid w-[198px] grid-cols-9 gap-[2px] rounded-xl border border-slate-200 p-3" aria-label="预约二维码示意">
            {qrPattern.flatMap((row, rowIndex) => row.split("").map((cell, columnIndex) => (
              <span key={`${rowIndex}-${columnIndex}`} className={`aspect-square rounded-[1px] ${cell === "1" ? "bg-slate-950" : "bg-white"}`} />
            )))}
          </div>
          <p className="mt-5 text-center text-xs text-slate-500">预约码</p>
          <p className="mt-2 text-center font-mono text-xl font-semibold tracking-[0.08em]">{generatedAppointmentCode}</p>
        </section>

        <RelationGrid projectId={selectedProject.id} storeId={selectedStore.id} slotId={selectedSlot.id} />
        <Button className="w-full" onClick={() => goStep("checking")}>模拟店员扫码核销</Button>
      </>
    );
  }

  if (step === "checking") {
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">到店核销</p>
          <h2 className="mt-1 text-2xl font-semibold">核销中</h2>
        </div>
        <Card className="border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-5" role="status">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <PrototypeIcon name="info" size={20} />
            </span>
            <div>
              <p className="font-semibold">正在核对预约关系</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">检查预约码、User、Store、Care Project、Time Slot 是否一致。这里不伪装真实网络请求。</p>
            </div>
          </div>
        </Card>
        <Button className="w-full" onClick={() => goStep("checked_in")}>完成模拟核销</Button>
      </>
    );
  }

  if (step === "checked_in") {
    return (
      <>
        <section className="rounded-[var(--radius-overlay)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
            <PrototypeIcon name="success" size={24} />
          </span>
          <p className="mt-5 text-sm font-medium text-[var(--color-primary-pressed)]">核销成功</p>
          <h2 className="mt-1 text-2xl font-semibold">已到店，可以开始检测</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">当前状态从“已预约”推进到“已到店”。真实店员端与后端由 T023 之后承接，本卡只验证用户端状态设计。</p>
        </section>
        <Button className="w-full" onClick={() => goStep("detecting")}>开始检测</Button>
      </>
    );
  }

  if (step === "detecting") {
    return (
      <>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">检测状态</p>
          <h2 className="mt-1 text-2xl font-semibold">检测中</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">这里只表现服务状态与进度反馈，不模拟真实设备算法或实时数据。</p>
        </div>
        <div className="space-y-3">
          {["到店信息已确认", "基础状态采集中", "等待生成检测记录"].map((label, index) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-sm font-semibold text-[var(--color-primary-pressed)]">{index + 1}</span>
                  <p className="font-medium">{label}</p>
                </div>
                <StatusTag tone={index === 0 ? "success" : undefined}>{index === 0 ? "完成" : index === 1 ? "进行中" : "等待"}</StatusTag>
              </div>
            </Card>
          ))}
        </div>
        <Button className="w-full" onClick={() => goStep("complete")}>完成模拟检测</Button>
      </>
    );
  }

  return (
    <>
      <section className="rounded-[var(--radius-overlay)] bg-[var(--color-primary)] p-5 text-[var(--color-on-primary)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
          <PrototypeIcon name="success" size={25} />
        </span>
        <p className="mt-5 text-sm font-medium opacity-75">检测完成</p>
        <h2 className="mt-1 text-2xl font-semibold">本次到店流程已完成</h2>
        <p className="mt-3 text-sm leading-6 opacity-80">预约 → 二维码 → 核销 → 检测完成已经串联。检测报告、护理建议、专属券、套餐与历史对比明确交给 T021。</p>
      </section>
      <Card className="p-4">
        <p className="font-semibold">T021 handoff</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">下一张卡会使用同一 User / Appointment / Detection Record 关系生成报告与后续转化。本卡不提前展示报告结论。</p>
      </Card>
      {selectedStore && selectedSlot && <RelationGrid projectId={selectedProject.id} storeId={selectedStore.id} slotId={selectedSlot.id} />}
      <Button className="w-full" onClick={resetToZone}>返回智慧抗衰首页</Button>
    </>
  );
}
