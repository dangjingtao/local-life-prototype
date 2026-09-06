import { useMemo, useState } from "react";
import { Card, SecondaryButton, Section, StatusTag } from "@prototype/design-system";
import {
  CORE_DEMO_IDS,
  appointmentSlots,
  appointments,
  appointmentStatusLabels,
  careProjects,
  careServices,
  detectionRecords,
  detectionReports,
  offlineStores,
  users,
  v02Coupons,
  type Appointment,
  type AppointmentStatus,
  type CareAppointmentSlot,
} from "@prototype/shared";

export type CareAppointmentOverrides = Partial<Record<string, AppointmentStatus>>;
export type CareSlotAvailabilityOverrides = Partial<Record<string, boolean>>;
export type CareScanOverrides = Partial<Record<string, boolean>>;

type CareOperationsProps = {
  scopeStoreId?: string;
  appointmentOverrides: CareAppointmentOverrides;
  slotAvailabilityOverrides: CareSlotAvailabilityOverrides;
  scanOverrides: CareScanOverrides;
  onSlotAvailabilityChange: (slotId: string, available: boolean) => void;
  onScanStart: (appointmentId: string) => void;
  onScanComplete: (appointmentId: string) => void;
  onReset: () => void;
};

function userName(userId: string) {
  return users.find((user) => user.id === userId)?.displayName ?? userId;
}

function storeName(storeId: string) {
  return offlineStores.find((store) => store.id === storeId)?.name ?? storeId;
}

function projectName(projectId: string) {
  return careProjects.find((project) => project.id === projectId)?.name ?? projectId;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function effectiveCareAppointmentStatus(appointment: Appointment, overrides: CareAppointmentOverrides) {
  return overrides[appointment.id] ?? appointment.status;
}

function appointmentTone(status: AppointmentStatus): "success" | "warning" | "neutral" {
  if (status === "completed" || status === "checked_in") return "success";
  if (status === "cancelled" || status === "rescheduled") return "neutral";
  return "warning";
}

function slotMeta(slot: CareAppointmentSlot, overrides: CareSlotAvailabilityOverrides) {
  if (slot.status === "full") return { label: "已满", tone: "warning" as const, available: false, operational: false };
  if (slot.status === "booked") return { label: "不可约 · 已预约", tone: "warning" as const, available: false, operational: false };
  if (overrides[slot.id] === false) return { label: "不可约 · 已暂停", tone: "neutral" as const, available: false, operational: true };
  return { label: "可约", tone: "success" as const, available: true, operational: true };
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return <label className="grid gap-1 text-xs text-[var(--color-text-tertiary)]">
    <span>{label}</span>
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)]"
    >
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}

function CareProjectsSection({ scopeStoreId }: { scopeStoreId?: string }) {
  const projects = careProjects.filter((project) => !scopeStoreId || project.storeIds.includes(scopeStoreId));
  return <Section title="项目与适用门店">
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => <Card key={project.id} data-testid={`t023-project-${project.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)]">{project.id}</p>
            <h3 className="mt-1 font-semibold">{project.name}</h3>
          </div>
          <StatusTag tone="warning">{project.capabilityStatus === "candidate" ? "候选能力" : project.capabilityStatus}</StatusTag>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{project.summary}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 text-sm">
          <div><span className="text-[var(--color-text-tertiary)]">时长</span><strong className="mt-1 block">{project.durationMinutes} 分钟</strong></div>
          <div><span className="text-[var(--color-text-tertiary)]">原型价</span><strong className="mt-1 block">¥{project.priceYuan}</strong></div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--color-text-tertiary)]">适用门店：{(scopeStoreId ? project.storeIds.filter((storeId) => storeId === scopeStoreId) : project.storeIds).map(storeName).join("、")}</p>
      </Card>)}
    </div>
  </Section>;
}

function SlotsSection({
  scopeStoreId,
  slotAvailabilityOverrides,
  onSlotAvailabilityChange,
}: Pick<CareOperationsProps, "scopeStoreId" | "slotAvailabilityOverrides" | "onSlotAvailabilityChange">) {
  const scopedSlots = appointmentSlots.filter((slot) => !scopeStoreId || slot.storeId === scopeStoreId);
  const storeOptions = useMemo(
    () => Array.from(new Set(scopedSlots.map((slot) => slot.storeId))).map((id) => ({ value: id, label: storeName(id) })),
    [scopedSlots],
  );
  const projectOptions = useMemo(
    () => Array.from(new Set(scopedSlots.map((slot) => slot.careProjectId))).map((id) => ({ value: id, label: projectName(id) })),
    [scopedSlots],
  );
  const dateOptions = useMemo(
    () => Array.from(new Set(scopedSlots.map((slot) => slot.startsAt.slice(0, 10)))).sort().map((date) => ({ value: date, label: date })),
    [scopedSlots],
  );
  const [storeFilter, setStoreFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const visible = scopedSlots.filter((slot) =>
    (storeFilter === "all" || slot.storeId === storeFilter)
    && (projectFilter === "all" || slot.careProjectId === projectFilter)
    && (dateFilter === "all" || slot.startsAt.slice(0, 10) === dateFilter),
  );

  return <Section title="门店 × 项目 × 日期可约时段">
    <Card className="bg-[var(--color-surface-subtle)]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {!scopeStoreId && <FilterSelect label="门店" value={storeFilter} onChange={setStoreFilter} options={[{ value: "all", label: "全部门店" }, ...storeOptions]} />}
        <FilterSelect label="项目" value={projectFilter} onChange={setProjectFilter} options={[{ value: "all", label: "全部项目" }, ...projectOptions]} />
        <FilterSelect label="日期" value={dateFilter} onChange={setDateFilter} options={[{ value: "all", label: "全部日期" }, ...dateOptions]} />
      </div>
    </Card>
    <Card className="overflow-hidden p-0">
      <div className="hidden grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_1fr] gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] lg:grid">
        <span>门店</span><span>项目</span><span>时间</span><span>容量</span><span>状态</span><span>维护</span>
      </div>
      {visible.map((slot) => {
        const meta = slotMeta(slot, slotAvailabilityOverrides);
        return <div key={slot.id} data-testid={`t023-slot-${slot.id}`} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 lg:grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_1fr] lg:items-center">
          <div><p className="font-medium">{storeName(slot.storeId)}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{slot.storeId}</p></div>
          <div><p className="font-medium">{projectName(slot.careProjectId)}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{slot.careProjectId}</p></div>
          <div><p className="font-medium">{formatDateTime(slot.startsAt)}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{slot.durationMinutes} 分钟</p></div>
          <div><p className="font-medium">{slot.bookedCount} / {slot.capacity}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{slot.id}</p></div>
          <div><StatusTag tone={meta.tone}>{meta.label}</StatusTag></div>
          <div>
            {meta.operational
              ? <SecondaryButton onClick={() => onSlotAvailabilityChange(slot.id, !meta.available)}>{meta.available ? "暂停开放" : "恢复开放"}</SecondaryButton>
              : <span className="text-xs text-[var(--color-text-tertiary)]">由预约占用状态决定</span>}
          </div>
        </div>;
      })}
    </Card>
    <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">“暂停 / 恢复”仅改变当前原型会话中的可约展示；不接生产级排班、容量锁定或预约引擎。</p>
  </Section>;
}

function AppointmentDetail({
  appointment,
  status,
  scanInProgress,
  onScanStart,
  onScanComplete,
}: {
  appointment: Appointment;
  status: AppointmentStatus;
  scanInProgress: boolean;
  onScanStart: () => void;
  onScanComplete: () => void;
}) {
  const record = detectionRecords.find((item) => item.appointmentId === appointment.id);
  const report = record?.reportId ? detectionReports.find((item) => item.id === record.reportId) : undefined;
  return <Card data-testid="t023-appointment-detail">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs text-[var(--color-text-tertiary)]">预约详情 · {appointment.id}</p>
        <h3 className="mt-1 text-lg font-semibold">{projectName(appointment.careProjectId)}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{userName(appointment.userId)} · {storeName(appointment.storeId)}</p>
      </div>
      <StatusTag tone={appointmentTone(status)}>{appointmentStatusLabels[status]}</StatusTag>
    </div>
    <div className="mt-5 grid gap-4 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
      <div><p className="text-xs text-[var(--color-text-tertiary)]">预约时间</p><p className="mt-1 text-sm font-medium">{formatDateTime(appointment.scheduledAt)}</p></div>
      <div><p className="text-xs text-[var(--color-text-tertiary)]">预约二维码 / 码</p><p className="mt-1 break-all font-mono text-sm font-medium">{appointment.qrCode ?? "历史记录无预约码"}</p></div>
      <div><p className="text-xs text-[var(--color-text-tertiary)]">核销状态</p><p className="mt-1 text-sm font-medium">{status === "checked_in" || status === "completed" ? "核销成功" : scanInProgress ? "核销中" : status === "scheduled" ? "核销前 · 待扫码" : "不可核销"}</p></div>
      <div><p className="text-xs text-[var(--color-text-tertiary)]">时段 ID</p><p className="mt-1 break-all font-mono text-sm font-medium">{appointment.slotId ?? "历史记录未绑定时段"}</p></div>
    </div>
    {status === "scheduled" && appointment.qrCode && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] p-4">
      <div>
        <p className="font-medium">{scanInProgress ? "核销中" : "店员扫码核销 Mock"}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {scanInProgress
            ? `正在校验 ${appointment.qrCode} 与当前用户、门店、项目、预约关系；确认后写入本次原型会话状态。`
            : `扫描 ${appointment.qrCode} 后先进入“核销中”，确认成功后再推进为“已到店 / 核销成功”。`}
        </p>
      </div>
      <SecondaryButton onClick={scanInProgress ? onScanComplete : onScanStart}>
        {scanInProgress ? "完成模拟核销" : `扫码核销 ${appointment.qrCode}`}
      </SecondaryButton>
    </div>}
    <div className="mt-5 grid gap-3 border-t border-[var(--color-border)] pt-4 md:grid-cols-2">
      <div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4">
        <p className="text-xs font-medium text-[var(--color-text-tertiary)]">检测记录</p>
        {record ? <><p className="mt-2 break-all font-mono text-sm font-medium">{record.id}</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">状态：{record.status === "completed" ? "已完成" : record.status === "cancelled" ? "已取消" : "待检测"} · {formatDateTime(record.recordedAt)}</p></> : <p className="mt-2 text-sm text-[var(--color-text-secondary)]">当前预约尚无检测记录。</p>}
      </div>
      <div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-4">
        <p className="text-xs font-medium text-[var(--color-text-tertiary)]">检测报告</p>
        {report ? <><p className="mt-2 break-all font-mono text-sm font-medium">{report.id}</p><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{report.summary}</p></> : <p className="mt-2 text-sm text-[var(--color-text-secondary)]">当前预约尚无报告。</p>}
      </div>
    </div>
  </Card>;
}

function AppointmentsSection({
  scopeStoreId,
  appointmentOverrides,
  scanOverrides,
  onScanStart,
  onScanComplete,
}: Pick<CareOperationsProps, "scopeStoreId" | "appointmentOverrides" | "scanOverrides" | "onScanStart" | "onScanComplete">) {
  const scoped = appointments.filter((appointment) => !scopeStoreId || appointment.storeId === scopeStoreId);
  const [selectedId, setSelectedId] = useState(() => scoped.find((appointment) => appointment.id === CORE_DEMO_IDS.appointment)?.id ?? scoped[0]?.id ?? "");
  const selected = scoped.find((appointment) => appointment.id === selectedId) ?? scoped[0];

  return <Section title="预约列表 / 详情 / 核销">
    <Card className="overflow-hidden p-0">
      <div className="hidden grid-cols-[1.15fr_0.9fr_1fr_1fr_0.8fr_0.7fr] gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)] lg:grid">
        <span>预约</span><span>用户</span><span>门店</span><span>时间</span><span>状态</span><span>详情</span>
      </div>
      {scoped.map((appointment) => {
        const status = effectiveCareAppointmentStatus(appointment, appointmentOverrides);
        return <div key={appointment.id} data-testid={`t023-appointment-${appointment.id}`} className="grid gap-3 border-b border-[var(--color-border)] px-5 py-4 text-sm last:border-0 lg:grid-cols-[1.15fr_0.9fr_1fr_1fr_0.8fr_0.7fr] lg:items-center">
          <div><p className="break-all font-semibold">{appointment.id}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{projectName(appointment.careProjectId)}</p></div>
          <div><p className="font-medium">{userName(appointment.userId)}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{appointment.userId}</p></div>
          <div>{storeName(appointment.storeId)}</div>
          <div>{formatDateTime(appointment.scheduledAt)}</div>
          <div><StatusTag tone={appointmentTone(status)}>{appointmentStatusLabels[status]}</StatusTag></div>
          <div><SecondaryButton onClick={() => setSelectedId(appointment.id)}>查看详情</SecondaryButton></div>
        </div>;
      })}
    </Card>
    {selected && <AppointmentDetail
      appointment={selected}
      status={effectiveCareAppointmentStatus(selected, appointmentOverrides)}
      scanInProgress={Boolean(scanOverrides[selected.id])}
      onScanStart={() => onScanStart(selected.id)}
      onScanComplete={() => onScanComplete(selected.id)}
    />}
  </Section>;
}

function ReportsSection({ scopeStoreId }: { scopeStoreId?: string }) {
  const reports = detectionReports.filter((report) => !scopeStoreId || report.storeId === scopeStoreId);
  return <Section title="检测记录、报告与后续转化配置">
    <div className="grid gap-4 xl:grid-cols-2">
      {reports.map((report) => {
        const record = report.detectionRecordId ? detectionRecords.find((item) => item.id === report.detectionRecordId) : undefined;
        const appointment = report.appointmentId ? appointments.find((item) => item.id === report.appointmentId) : undefined;
        const coupon = report.exclusiveCouponId ? v02Coupons.find((item) => item.id === report.exclusiveCouponId) : undefined;
        const service = report.recommendedServiceId ? careServices.find((item) => item.id === report.recommendedServiceId) : undefined;
        return <Card key={report.id} data-testid={`t023-report-${report.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="break-all text-xs text-[var(--color-text-tertiary)]">{report.id}</p>
              <h3 className="mt-1 font-semibold">{projectName(report.careProjectId ?? "")}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{userName(report.userId)} · {storeName(report.storeId)} · {formatDate(report.createdAt)}</p>
            </div>
            <StatusTag tone="success">报告已生成</StatusTag>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{report.summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3"><p className="text-xs text-[var(--color-text-tertiary)]">Appointment</p><p className="mt-1 break-all font-mono text-sm">{appointment?.id ?? "未关联"}</p></div>
            <div className="rounded-[var(--radius-container)] bg-[var(--color-surface-subtle)] p-3"><p className="text-xs text-[var(--color-text-tertiary)]">Detection Record</p><p className="mt-1 break-all font-mono text-sm">{record?.id ?? "未关联"}</p></div>
          </div>
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-semibold">报告后转化配置</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] p-3"><p className="text-xs text-[var(--color-text-tertiary)]">专属券</p><p className="mt-2 text-sm font-medium">{coupon?.title ?? "未配置"}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{coupon?.id ?? "-"}</p></div>
              <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] p-3"><p className="text-xs text-[var(--color-text-tertiary)]">护理套餐</p><p className="mt-2 text-sm font-medium">{service?.name ?? "未配置"}</p><p className="mt-1 break-all text-xs text-[var(--color-text-tertiary)]">{service?.id ?? "-"}</p></div>
              <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] p-3"><p className="text-xs text-[var(--color-text-tertiary)]">复测提醒</p><p className="mt-2 text-sm font-medium">{report.retestRecommendedAt ? formatDate(report.retestRecommendedAt) : "未配置"}</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">提醒仅为原型配置，不自动发送</p></div>
            </div>
          </div>
          <div className="mt-4 rounded-[var(--radius-container)] bg-[var(--color-warning-bg)] p-3 text-xs leading-5 text-[var(--color-text-secondary)]">
            非医疗诊断边界：{report.disclaimer}
          </div>
        </Card>;
      })}
    </div>
  </Section>;
}

function CareOperations({
  scopeStoreId,
  appointmentOverrides,
  slotAvailabilityOverrides,
  scanOverrides,
  onSlotAvailabilityChange,
  onScanStart,
  onScanComplete,
  onReset,
}: CareOperationsProps) {
  const scopedAppointments = appointments.filter((appointment) => !scopeStoreId || appointment.storeId === scopeStoreId);
  const scopedReports = detectionReports.filter((report) => !scopeStoreId || report.storeId === scopeStoreId);
  const statuses = scopedAppointments.map((appointment) => effectiveCareAppointmentStatus(appointment, appointmentOverrides));
  const metrics = [
    { label: "已预约", value: String(statuses.filter((status) => status === "scheduled").length), note: "待到店 / 待扫码" },
    { label: "已核销到店", value: String(statuses.filter((status) => status === "checked_in").length), note: "扫码核销后的预约" },
    { label: "已完成", value: String(statuses.filter((status) => status === "completed").length), note: "历史检测 / 服务完成" },
    { label: "检测报告", value: String(scopedReports.length), note: "报告与转化配置" },
  ];
  const hasOverrides = Object.keys(appointmentOverrides).length > 0 || Object.keys(slotAvailabilityOverrides).length > 0 || Object.keys(scanOverrides).length > 0;

  return <>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{scopeStoreId ? `${storeName(scopeStoreId)} · 本店授权` : "平台授权范围 · 全局视图"}</p>
        <h2 className="mt-1 text-2xl font-semibold">智慧抗衰预约与报告运营</h2>
      </div>
      {hasOverrides && <SecondaryButton onClick={onReset}>重置智慧抗衰演示</SecondaryButton>}
    </div>

    <Card className="bg-[var(--color-surface-subtle)]">
      <div className="flex flex-wrap items-start gap-3">
        <StatusTag tone="success">{scopeStoreId ? "仅本店范围" : "平台授权范围"}</StatusTag>
        <p className="max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          复用 T020 / T021 的预约、检测与报告 Shared 事实。扫码核销和时段维护只改变当前原型会话，不接真实扫码设备、检测设备、AI 报告生成或生产级预约引擎。
        </p>
      </div>
    </Card>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => <Card key={metric.label}><p className="text-sm text-[var(--color-text-secondary)]">{metric.label}</p><p className="mt-3 text-2xl font-semibold">{metric.value}</p><p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{metric.note}</p></Card>)}
    </div>

    <CareProjectsSection scopeStoreId={scopeStoreId} />
    <SlotsSection scopeStoreId={scopeStoreId} slotAvailabilityOverrides={slotAvailabilityOverrides} onSlotAvailabilityChange={onSlotAvailabilityChange} />
    <AppointmentsSection scopeStoreId={scopeStoreId} appointmentOverrides={appointmentOverrides} scanOverrides={scanOverrides} onScanStart={onScanStart} onScanComplete={onScanComplete} />
    <ReportsSection scopeStoreId={scopeStoreId} />
  </>;
}

export function MerchantSmartCareOperations(props: Omit<CareOperationsProps, "scopeStoreId">) {
  return <CareOperations {...props} scopeStoreId={CORE_DEMO_IDS.store} />;
}

export function OperatorSmartCareOperations(props: Omit<CareOperationsProps, "scopeStoreId">) {
  return <CareOperations {...props} />;
}
