import { useState } from "react";
import { Button, Card, SecondaryButton, StatusTag } from "@prototype/design-system";
import { PrototypeIcon, type PrototypeIconName } from "@prototype/icons";
import { getPrototypeView, PrototypePanel, PrototypeState } from "@prototype/runtime";
import { careProjects, coreDemoUser, membershipLevelLabels } from "@prototype/shared";
import { CampaignActivityScreen } from "./CampaignActivityScreen";
import { CareFlowScreen } from "./CareFlowScreen";
import { CareReportScreen } from "./CareReportScreen";
import { GlobalSearchScreen, type SearchBusinessHandoff } from "./GlobalSearchScreen";
import { MallFlowScreen, type MallStep, type StorefrontCartState } from "./MallFlowScreen";
import { MembershipCenterScreen } from "./MembershipCenterScreen";
import { StoreFlowScreen } from "./StoreFlowScreen";
import { V02HomeScreen } from "./V02HomeScreen";

type Tab = "home" | "store" | "mall" | "care" | "me";
type Screen = Tab | "search" | "activity" | "reports";

type ReportEntry = {
  reportId?: string;
  back: "care" | "me";
};

type TabItem = {
  id: Tab;
  label: string;
  icon: PrototypeIconName;
};

const tabs: TabItem[] = [
  { id: "home", label: "首页", icon: "home" },
  { id: "store", label: "便利店", icon: "home" },
  { id: "mall", label: "商城", icon: "modules" },
  { id: "care", label: "智慧抗衰", icon: "success" },
  { id: "me", label: "我的", icon: "profile" },
];

const memberLevel = membershipLevelLabels[coreDemoUser.member.level];

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[390px] flex-col justify-between px-4 pb-8 pt-[max(32px,env(safe-area-inset-top))]">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)]">LOCAL LIFE · V0.2 PREVIEW</p>
        <h1 className="mt-4 max-w-xs text-3xl font-semibold leading-tight">一个账号，连接附近便利、全国好物与智慧抗衰。</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">当前仍是产品原型。登录只演示统一账号入口，不发起真实认证、验证码或数据持久化。</p>
      </div>

      <Card className="mb-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-container)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]">
            <PrototypeIcon name="profile" size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold">登录本地生活</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">统一会员身份贯穿便利店、商城、智慧抗衰和权益资产</p>
          </div>
        </div>
        <Button className="mt-5 w-full" onClick={onLogin}>微信授权进入</Button>
        <SecondaryButton className="mt-3 w-full" onClick={onLogin}>手机号快捷登录</SecondaryButton>
        <p className="mt-4 text-center text-xs leading-5 text-[var(--color-text-tertiary)]">演示账号：{coreDemoUser.id} · {memberLevel}</p>
      </Card>
    </main>
  );
}

function SearchHandoffBanner({ handoff }: { handoff: SearchBusinessHandoff }) {
  return (
    <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">来自全局搜索</p>
          <p className="mt-2 font-semibold">{handoff.title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{handoff.subtitle}</p>
        </div>
        <StatusTag tone="success">已定位</StatusTag>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--color-text-tertiary)]">已保留实体 {handoff.entityId}；对应业务流程会继续消费该上下文，而不只展示定位提示。</p>
    </Card>
  );
}

function isResolvedCareHandoff(handoff: SearchBusinessHandoff | null) {
  if (!handoff || handoff.domain !== "care") return false;
  if (handoff.entityType === "care_project") {
    return careProjects.some((item) => item.id === handoff.entityId);
  }
  if (handoff.entityType === "service") {
    return careProjects.some((item) => item.serviceId === handoff.entityId);
  }
  return false;
}

export function App() {
  const view = getPrototypeView();
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("demoAuth") === "1";
  });
  const [screen, setScreen] = useState<Screen>("home");
  const [searchPreset, setSearchPreset] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [searchHandoff, setSearchHandoff] = useState<SearchBusinessHandoff | null>(null);
  const [mallCarts, setMallCarts] = useState<StorefrontCartState>({});
  const [mallStep, setMallStep] = useState<MallStep>("home");
  const [reportEntry, setReportEntry] = useState<ReportEntry | null>(null);

  const activeTab: Tab = screen === "search" || screen === "activity"
    ? "home"
    : screen === "reports"
      ? (reportEntry?.back === "me" ? "me" : "care")
      : screen;
  const title = screen === "search"
    ? "全局搜索"
    : screen === "activity"
      ? "活动中心"
      : screen === "reports"
        ? "我的检测"
        : tabs.find((item) => item.id === activeTab)?.label ?? "首页";
  const showGlobalHeader = screen !== "mall" || mallStep !== "home";

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const go = (next: Screen) => {
    setSearchHandoff(null);
    if (next === "mall") setMallStep("home");
    setScreen(next);
    scrollTop();
  };

  const openBusinessFromSearch = (handoff: SearchBusinessHandoff) => {
    setSearchHandoff(handoff);
    if (handoff.domain === "mall") setMallStep(handoff.entityType === "product" ? "detail" : "home");
    setScreen(handoff.domain);
    scrollTop();
  };

  const openSearch = (preset = "") => {
    setSearchHandoff(null);
    setSearchPreset(preset);
    setScreen("search");
    scrollTop();
  };

  const openCampaign = (campaignId: string) => {
    setSearchHandoff(null);
    setSelectedCampaignId(campaignId);
    setScreen("activity");
    scrollTop();
  };

  const openActivityCenter = () => {
    setSearchHandoff(null);
    setSelectedCampaignId(null);
    setScreen("activity");
    scrollTop();
  };

  const openReportsFromMe = () => {
    setReportEntry({ back: "me" });
    go("reports");
  };

  const openReportFromCare = (reportId: string) => {
    setReportEntry({ reportId, back: "care" });
    setScreen("reports");
    scrollTop();
  };

  const authenticateDemo = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("demoAuth", "1");
    window.history.replaceState(null, "", url.toString());
    setAuthenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-background)] text-[var(--color-text-primary)]">
        <LoginScreen onLogin={authenticateDemo} />
        <PrototypePanel />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] text-[var(--color-text-primary)]">
      {showGlobalHeader && (
        <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="mx-auto flex min-h-14 max-w-[390px] items-center justify-between px-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--color-primary)]">LOCAL LIFE · V0.2 PREVIEW</p>
              <h1 className="truncate text-base font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-1">
              {screen !== "search" && (
                <button type="button" aria-label="打开全局搜索" onClick={() => openSearch()} className="flex min-h-11 min-w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]">
                  <PrototypeIcon name="search" size={19} />
                </button>
              )}
              <button type="button" aria-label="活动中心" onClick={openActivityCenter} className="flex min-h-11 min-w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]">
                <PrototypeIcon name="info" size={19} />
              </button>
            </div>
          </div>
        </header>
      )}

      <PrototypeState view={view}>
        <main className="mx-auto max-w-[390px] space-y-6 px-4 py-5 pb-28">
          {screen === "home" && (
            <V02HomeScreen
              onOpenSearch={openSearch}
              onOpenDomain={(domain) => go(domain)}
              onOpenCampaign={openCampaign}
            />
          )}
          {screen === "search" && (
            <GlobalSearchScreen
              key={searchPreset}
              initialQuery={searchPreset}
              onBack={() => go("home")}
              onOpenBusiness={openBusinessFromSearch}
              onOpenCampaign={openCampaign}
            />
          )}
          {screen === "store" && <StoreFlowScreen openActivity={openActivityCenter} entryContext={searchHandoff?.domain === "store" ? searchHandoff : undefined} />}
          {screen === "mall" && (
            <>
              {searchHandoff?.domain === "mall" && <SearchHandoffBanner handoff={searchHandoff} />}
              <MallFlowScreen
                entryContext={searchHandoff?.domain === "mall" ? searchHandoff : undefined}
                carts={mallCarts}
                setCarts={setMallCarts}
                onStepChange={setMallStep}
              />
            </>
          )}
          {screen === "care" && (
            <>
              {searchHandoff?.domain === "care" && isResolvedCareHandoff(searchHandoff) && <SearchHandoffBanner handoff={searchHandoff} />}
              <CareFlowScreen
                key={searchHandoff?.domain === "care" ? `${searchHandoff.entityType}:${searchHandoff.entityId}` : "care-default"}
                entryContext={searchHandoff?.domain === "care" ? searchHandoff : undefined}
                onOpenReport={openReportFromCare}
              />
            </>
          )}
          {screen === "me" && <MembershipCenterScreen onOpenReports={openReportsFromMe} />}
          {screen === "reports" && (
            <CareReportScreen
              key={`${reportEntry?.back ?? "me"}:${reportEntry?.reportId ?? "list"}`}
              entryReportId={reportEntry?.reportId}
              backLabel={reportEntry?.back === "care" ? "返回智慧抗衰" : "返回我的"}
              onBack={() => go(reportEntry?.back === "care" ? "care" : "me")}
            />
          )}
          {screen === "activity" && (
            <CampaignActivityScreen
              campaignId={selectedCampaignId}
              onBack={() => go("home")}
              onOpenCampaign={openCampaign}
            />
          )}
        </main>
      </PrototypeState>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex min-h-16 max-w-[390px] border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]" aria-label="一级导航">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            aria-current={activeTab === item.id ? "page" : undefined}
            className={`flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[11px] ${activeTab === item.id ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"}`}
          >
            <PrototypeIcon name={item.icon} size={19} />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <PrototypePanel />
    </div>
  );
}
