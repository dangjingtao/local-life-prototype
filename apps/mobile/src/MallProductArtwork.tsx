import type { CSSProperties } from "react";

type MallProductArtworkProps = {
  productId: string;
  name: string;
  className?: string;
  decorative?: boolean;
};

const productAccents: Record<string, string> = {
  "PRODUCT-COLLAGEN-DRINK": "var(--color-primary)",
  "PRODUCT-SCALP-SET": "var(--color-accent)",
  "PRODUCT-CLEAN-SET": "var(--color-success)",
  "PRODUCT-LIGHT-LIFE": "var(--color-warning)",
  "PRODUCT-SKIN-TRIAL": "var(--color-danger)",
};

function Bottle({ slim = false }: { slim?: boolean }) {
  return (
    <div className={`relative shrink-0 ${slim ? "h-[70%] w-[24%]" : "h-[76%] w-[31%]"}`}>
      <div className="absolute left-1/2 top-0 h-[10%] w-[42%] -translate-x-1/2 rounded-t bg-[var(--color-text-primary)]/70" />
      <div
        className="absolute inset-x-0 bottom-0 h-[92%] rounded-[28%_28%_18%_18%] border border-white/70 shadow-sm"
        style={{ background: "linear-gradient(180deg, var(--mall-art-accent), color-mix(in srgb, var(--mall-art-accent) 62%, var(--color-text-primary)))" }}
      >
        <div className="absolute inset-x-[14%] top-[35%] rounded-sm bg-white/88 px-1 py-1 text-center">
          <div className="mx-auto h-1 w-2/3 rounded-full bg-[var(--mall-art-accent)]/40" />
          <div className="mx-auto mt-1 h-1 w-1/2 rounded-full bg-[var(--color-text-primary)]/15" />
        </div>
      </div>
    </div>
  );
}

function Box({ tall = false, label = "SELECT" }: { tall?: boolean; label?: string }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[10%] border border-white/70 bg-white/92 shadow-sm ${tall ? "h-[82%] w-[42%]" : "h-[66%] w-[48%]"}`}
    >
      <div className="absolute inset-x-0 top-0 h-[22%] bg-[var(--mall-art-accent)]" />
      <div className="absolute left-[12%] right-[12%] top-[34%]">
        <p className="truncate text-[7px] font-bold tracking-[0.14em] text-[var(--color-text-primary)]/75">{label}</p>
        <div className="mt-1 h-1 w-4/5 rounded-full bg-[var(--mall-art-accent)]/30" />
        <div className="mt-1 h-1 w-3/5 rounded-full bg-[var(--color-text-primary)]/12" />
      </div>
      <div className="absolute -bottom-[20%] -right-[12%] h-[54%] w-[54%] rounded-full bg-[var(--mall-art-accent)]/16" />
    </div>
  );
}

function Cup() {
  return (
    <div className="relative h-[66%] w-[34%] shrink-0">
      <div className="absolute left-1/2 top-0 h-[8%] w-[72%] -translate-x-1/2 rounded-full bg-[var(--color-text-primary)]/45" />
      <div className="absolute inset-x-[8%] bottom-0 h-[92%] [clip-path:polygon(8%_0,92%_0,78%_100%,22%_100%)] bg-[var(--mall-art-accent)]/80 shadow-sm">
        <div className="absolute left-[26%] top-[36%] h-[22%] w-[48%] rounded bg-white/80" />
      </div>
    </div>
  );
}

function Sachets() {
  return (
    <div className="relative h-[66%] w-[52%] shrink-0">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute bottom-0 h-[88%] w-[40%] rounded-[10%] border border-white/80 bg-white/90 shadow-sm"
          style={{ left: `${index * 28}%`, transform: `rotate(${(index - 1) * 8}deg)` }}
        >
          <div className="h-[20%] rounded-t-[10%] bg-[var(--mall-art-accent)]" />
          <div className="mx-auto mt-[42%] h-1 w-1/2 rounded-full bg-[var(--mall-art-accent)]/30" />
        </div>
      ))}
    </div>
  );
}

export function MallProductArtwork({ productId, name, className = "", decorative = false }: MallProductArtworkProps) {
  const accent = productAccents[productId] ?? "var(--color-primary)";
  const style = {
    "--mall-art-accent": accent,
    background:
      "radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--mall-art-accent) 20%, transparent), transparent 32%), linear-gradient(145deg, color-mix(in srgb, var(--mall-art-accent) 10%, var(--color-surface)), var(--color-surface))",
  } as CSSProperties;

  return (
    <div
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${name} 商品图`}
      className={`relative isolate flex items-end justify-center overflow-hidden ${className}`}
      style={style}
    >
      <div className="absolute -right-[12%] -top-[18%] h-[58%] w-[58%] rounded-full bg-[var(--mall-art-accent)]/10" />
      <div className="absolute -bottom-[24%] -left-[10%] h-[54%] w-[54%] rounded-full bg-[var(--mall-art-accent)]/8" />
      <div className="relative z-10 flex h-[88%] w-[86%] items-end justify-center gap-[6%] pb-[5%]">
        {productId === "PRODUCT-COLLAGEN-DRINK" && (
          <>
            <Box tall label="COLLAGEN" />
            <Bottle slim />
          </>
        )}
        {productId === "PRODUCT-SCALP-SET" && (
          <>
            <Bottle />
            <Box label="SCALP CARE" />
          </>
        )}
        {productId === "PRODUCT-CLEAN-SET" && (
          <>
            <Box tall label="DAILY CLEAN" />
            <Bottle slim />
          </>
        )}
        {productId === "PRODUCT-LIGHT-LIFE" && (
          <>
            <Cup />
            <Box label="LIGHT LIFE" />
          </>
        )}
        {productId === "PRODUCT-SKIN-TRIAL" && <Sachets />}
        {!productAccents[productId] && (
          <>
            <Box label="SELECT" />
            <Bottle slim />
          </>
        )}
      </div>
      <div className="absolute inset-x-[12%] bottom-[4%] h-[5%] rounded-full bg-[var(--color-text-primary)]/8 blur-[4px]" />
    </div>
  );
}
