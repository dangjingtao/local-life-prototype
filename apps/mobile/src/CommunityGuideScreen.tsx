import { useMemo } from "react";
import { Card, Section } from "@prototype/design-system";
import { PrototypeIcon } from "@prototype/icons";
import { CORE_DEMO_IDS, coreDemoUser, getCommunityForStore } from "@prototype/shared";

type CommunityGuideScreenProps = {
  onBack: () => void;
};

const QR_SIZE = 21;

function buildQrCells(seed: string) {
  const cells = Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const x = index % QR_SIZE;
    const y = Math.floor(index / QR_SIZE);
    const code = seed.charCodeAt(index % seed.length) || 0;
    return ((x * 7 + y * 11 + code + index) % 5) < 2;
  });

  const finder = (originX: number, originY: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[(originY + y) * QR_SIZE + originX + x] = edge || core;
      }
    }
  };

  finder(0, 0);
  finder(QR_SIZE - 7, 0);
  finder(0, QR_SIZE - 7);
  return cells;
}

function qrSvg(cells: boolean[]) {
  const modules = cells
    .map((filled, index) => {
      if (!filled) return "";
      const x = index % QR_SIZE;
      const y = Math.floor(index / QR_SIZE);
      return `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${QR_SIZE + 4} ${QR_SIZE + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${QR_SIZE + 4}" height="${QR_SIZE + 4}" fill="white"/><g fill="#111">${modules}</g></svg>`;
}

export function CommunityGuideScreen({ onBack }: CommunityGuideScreenProps) {
  const community = getCommunityForStore(coreDemoUser.usualStoreId ?? CORE_DEMO_IDS.store);
  const cells = useMemo(() => buildQrCells(community?.qrAssetKey ?? CORE_DEMO_IDS.community), [community?.qrAssetKey]);

  const saveQrImage = () => {
    const svg = qrSvg(cells);
    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const link = document.createElement("a");
    link.href = href;
    link.download = "加入社群二维码.svg";
    link.click();
  };

  if (!community) {
    return (
      <div className="-mx-4 min-h-[100dvh] bg-[var(--color-background)]">
        <header className="flex h-[56px] items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2">
          <button type="button" onClick={onBack} className="flex min-h-11 min-w-11 items-center justify-center" aria-label="返回我的">
            <PrototypeIcon name="back" size={21} />
          </button>
          <h1 className="ml-2 text-[17px] font-semibold">加入社群</h1>
        </header>
        <div className="p-4">
          <Card>
            <p className="font-semibold">暂未开放社群入口</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">当前没有可用的社群信息，请稍后再试。</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="community-guide" className="-mx-4 min-h-[100dvh] bg-[var(--color-background)] pb-[calc(88px+env(safe-area-inset-bottom))]">
      <header
        data-testid="community-guide-topbar"
        className="sticky top-0 z-20 flex h-[calc(56px+env(safe-area-inset-top))] items-end border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-1 pt-[env(safe-area-inset-top)] backdrop-blur"
      >
        <button type="button" onClick={onBack} className="flex min-h-11 min-w-11 items-center justify-center rounded-full active:bg-[var(--color-surface-subtle)]" aria-label="返回我的">
          <PrototypeIcon name="back" size={21} />
        </button>
        <h1 className="pointer-events-none absolute bottom-[15px] left-1/2 -translate-x-1/2 text-[17px] font-semibold">加入社群</h1>
      </header>

      <div className="space-y-5 px-4 pt-5">
        <section className="text-center">
          <p className="text-xs font-medium text-[var(--color-primary)]">社区生活福利</p>
          <h2 className="mt-2 text-2xl font-semibold">{community.title}</h2>
          <p className="mx-auto mt-2 max-w-[310px] text-sm leading-6 text-[var(--color-text-secondary)]">
            扫码加入社群，及时看看门店福利与生活动态。
          </p>
        </section>

        <Card className="p-5 text-center">
          <div
            data-testid="community-qr"
            data-qr-asset-key={community.qrAssetKey}
            role="img"
            aria-label="加入社群二维码示意"
            className="mx-auto grid h-[220px] w-[220px] grid-cols-[repeat(21,minmax(0,1fr))] overflow-hidden border-[10px] border-white bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
          >
            {cells.map((filled, index) => (
              <span key={index} className={filled ? "bg-[#111]" : "bg-white"} />
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold">长按识别二维码</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
            也可以先保存图片，再打开微信扫码识别。
          </p>
          <button
            type="button"
            onClick={saveQrImage}
            className="mt-4 min-h-11 rounded-[var(--radius-control)] border border-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary)] active:bg-[var(--color-brand-subtle)]"
          >
            保存二维码图片
          </button>
          <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-tertiary)]">
            当前二维码仅用于界面演示，暂不能实际入群；正式使用时以门店提供的有效二维码为准。
          </p>
        </Card>

        <Section title="加入后可以获得">
          <div data-testid="community-benefits" className="grid grid-cols-3 gap-2">
            {community.benefits.map((benefit, index) => (
              <Card key={benefit} className="min-w-0 p-3 text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-primary)]">
                  <PrototypeIcon name={index === 0 ? "success" : index === 1 ? "info" : "modules"} size={17} />
                </span>
                <p className="mt-2 text-xs font-semibold leading-5">{benefit}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Card className="bg-[var(--color-surface-subtle)]">
          <p className="text-sm font-semibold">加入小提示</p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
            社群开放范围仍会随运营安排调整。常驻入口会一直保留，你可以随时从“我的”再次进入这里。
          </p>
        </Card>
      </div>
    </div>
  );
}
