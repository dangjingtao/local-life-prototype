import { useMemo, useState } from "react";
import { Card, StatusTag } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import {
  getConvenienceProductStoreOptions,
  globalSearchDomainLabels,
  searchGlobalCatalog,
  type GlobalSearchDomain,
  type GlobalSearchResult,
} from "@prototype/shared";

type SearchFilter = "all" | GlobalSearchDomain;
type BusinessDomain = "store" | "mall" | "care";

export interface SearchBusinessHandoff {
  domain: BusinessDomain;
  entityId: string;
  entityType: GlobalSearchResult["entityType"];
  title: string;
  subtitle: string;
  storeId?: string;
}

interface GlobalSearchScreenProps {
  initialQuery?: string;
  onBack: () => void;
  onOpenBusiness: (handoff: SearchBusinessHandoff) => void;
  onOpenCampaign: (campaignId: string) => void;
}

const filters: Array<{ id: SearchFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "store", label: "便利店" },
  { id: "mall", label: "商城" },
  { id: "care", label: "智慧抗衰" },
  { id: "campaign", label: "活动" },
];

const suggestions = ["燕麦", "胶原", "基础状态检测", "初秋"];
const domainOrder: GlobalSearchDomain[] = ["store", "mall", "care", "campaign"];

function ResultCard({ result, onOpen }: { result: GlobalSearchResult; onOpen: () => void }) {
  return (
    <button type="button" className="w-full text-left" onClick={onOpen} aria-label={`查看${globalSearchDomainLabels[result.domain]}结果：${result.title}`}>
      <Card className="p-4 transition active:bg-[var(--color-surface-subtle)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={result.domain === "care" ? "success" : undefined}>{globalSearchDomainLabels[result.domain]}</StatusTag>
              {result.entityType === "campaign" && <span className="text-xs text-[var(--color-text-tertiary)]">运营活动</span>}
            </div>
            <p className="mt-3 font-semibold">{result.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{result.subtitle}</p>
            {result.domain === "store" && <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">先选门店，再确认价格 / 库存 / 履约</p>}
          </div>
          <div className="shrink-0 text-right">
            {result.priceYuan !== undefined && <p className="font-semibold text-[var(--color-primary-pressed)]">¥{result.priceYuan}</p>}
            <span className="mt-2 inline-block text-[var(--color-text-tertiary)]" aria-hidden="true">›</span>
          </div>
        </div>
      </Card>
    </button>
  );
}

function toHandoff(result: GlobalSearchResult, storeId?: string): SearchBusinessHandoff {
  return {
    domain: result.domain === "campaign" ? "mall" : result.domain,
    entityId: result.entityId,
    entityType: result.entityType,
    title: result.title,
    subtitle: result.subtitle,
    storeId,
  };
}

export function GlobalSearchScreen({ initialQuery = "", onBack, onOpenBusiness, onOpenCampaign }: GlobalSearchScreenProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [pendingStoreProduct, setPendingStoreProduct] = useState<GlobalSearchResult | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const results = useMemo(() => searchGlobalCatalog(query), [query]);
  const visibleResults = filter === "all" ? results : results.filter((result) => result.domain === filter);
  const groupedResults = domainOrder
    .map((domain) => ({ domain, items: visibleResults.filter((result) => result.domain === domain) }))
    .filter((group) => group.items.length > 0);
  const storeOptions = pendingStoreProduct ? getConvenienceProductStoreOptions(pendingStoreProduct.entityId) : [];
  const selectedStore = storeOptions.find((item) => item.storeId === selectedStoreId);

  const openResult = (result: GlobalSearchResult) => {
    if (result.domain === "store") {
      setPendingStoreProduct(result);
      setSelectedStoreId(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (result.domain === "campaign") {
      onOpenCampaign(result.entityId);
      return;
    }
    onOpenBusiness(toHandoff(result));
  };

  if (pendingStoreProduct) {
    return (
      <>
        <button type="button" onClick={() => setPendingStoreProduct(null)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <PrototypeIcon name="back" size={18} /> 返回搜索结果
        </button>

        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">便利店商品 · 门店上下文</p>
          <h2 className="mt-1 text-2xl font-semibold">先选择可履约门店</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">“{pendingStoreProduct.title}”的价格、库存与短配能力按门店存在差异；全局搜索不把它伪装成统一库存。</p>
        </div>

        <div className="space-y-3">
          {storeOptions.map((option) => {
            const selected = option.storeId === selectedStoreId;
            return (
              <button
                key={option.storeId}
                type="button"
                disabled={!option.orderable}
                aria-pressed={selected}
                onClick={() => setSelectedStoreId(option.storeId)}
                className={`min-h-11 w-full rounded-[var(--radius-container)] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${selected ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)] active:bg-[var(--color-surface-subtle)]"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{option.storeName}</p>
                      <StatusTag tone={option.orderable ? "success" : "warning"}>{option.orderable ? "可下单" : option.stockLabel ?? "暂不可售"}</StatusTag>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{option.address}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">距你 {option.distanceKm?.toFixed(1) ?? "--"} km · {option.stockLabel ?? option.availabilityStatus}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[var(--color-primary-pressed)]">¥{option.memberPriceYuan ?? option.priceYuan}</p>
                    {option.memberPriceYuan && <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">会员价</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedStore ? (
          <Card className="border-[var(--color-primary)] bg-[var(--color-brand-subtle)] p-4">
            <p className="text-xs font-semibold text-[var(--color-primary-pressed)]">已确认门店上下文</p>
            <p className="mt-2 font-semibold">{selectedStore.storeName} · {pendingStoreProduct.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">后续浏览与交易必须继续使用这家门店的可售、价格和履约语义；T017 将承接独立购物车。</p>
            <button type="button" onClick={() => onOpenBusiness(toHandoff(pendingStoreProduct, selectedStore.storeId))} className="mt-4 flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)]">
              进入便利店
            </button>
          </Card>
        ) : (
          <Card className="bg-[var(--color-surface-subtle)] p-4">
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">请选择一个当前可下单门店。售罄、休息中或不可售门店仅展示真实 mock 状态，不允许继续交易。</p>
          </Card>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="返回首页" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]">
          <PrototypeIcon name="back" size={19} />
        </button>
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 focus-within:border-[var(--color-primary)]">
          <PrototypeIcon name="search" size={18} className="shrink-0 text-[var(--color-text-tertiary)]" />
          <span className="sr-only">全局搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="全局搜索"
            placeholder="搜索商品、项目、套餐或活动"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          {query && (
            <button type="button" aria-label="清空搜索" onClick={() => setQuery("")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-text-tertiary)] active:bg-[var(--color-surface-subtle)]">
              <PrototypeIcon name="close" size={17} />
            </button>
          )}
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="搜索结果分类">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium ${filter === item.id ? "border-[var(--color-primary)] bg-[var(--color-brand-subtle)] text-[var(--color-primary-pressed)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!query.trim() ? (
        <section>
          <p className="text-sm font-semibold">试试这些搜索</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)} className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] px-3 text-left text-sm text-[var(--color-text-secondary)]">
                {suggestion}
              </button>
            ))}
          </div>
          <Card className="mt-4 p-4">
            <p className="font-semibold">搜索是产品级能力</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">结果可以跨便利店、线上商城、智慧抗衰和活动，但交易、购物车与预约仍按各业务域独立处理。</p>
          </Card>
        </section>
      ) : groupedResults.length > 0 ? (
        <div className="space-y-6" aria-live="polite">
          <p className="text-xs text-[var(--color-text-tertiary)]">找到 {visibleResults.length} 条结果 · “{query.trim()}”</p>
          {groupedResults.map((group) => (
            <section key={group.domain}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{globalSearchDomainLabels[group.domain]}</h2>
                <span className="text-xs text-[var(--color-text-tertiary)]">{group.items.length} 条</span>
              </div>
              <div className="space-y-3">
                {group.items.map((result) => <ResultCard key={result.key} result={result} onOpen={() => openResult(result)} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
            <PrototypeIcon name="search" size={22} />
          </span>
          <p className="mt-4 font-semibold">没有找到相关内容</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">换个关键词，或切回“全部”继续搜索四个业务域。</p>
        </Card>
      )}
    </>
  );
}
