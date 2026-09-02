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
  "PRODUCT-LIGHT-LIFE": "var(--color-primary-pressed)",
  "PRODUCT-SKIN-TRIAL": "var(--color-danger)",
};

export function MallProductArtwork({ productId, name, className = "", decorative = false }: MallProductArtworkProps) {
  const accent = productAccents[productId] ?? "var(--color-primary)";
  const style = {
    "--mall-art-accent": accent,
    background:
      "linear-gradient(145deg, color-mix(in srgb, var(--mall-art-accent) 16%, var(--color-surface)) 0%, color-mix(in srgb, var(--mall-art-accent) 7%, var(--color-surface)) 54%, var(--color-surface) 100%)",
  } as CSSProperties;

  return (
    <div
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${name} 商品图`}
      className={`relative isolate overflow-hidden ${className}`}
      style={style}
    >
      <div className="absolute -right-[12%] -top-[24%] h-[72%] w-[72%] rounded-full bg-[var(--mall-art-accent)]/8" />
      <div className="absolute -bottom-[28%] -left-[14%] h-[64%] w-[64%] rounded-full bg-[var(--mall-art-accent)]/6" />
      <div className="absolute left-[14%] top-[18%] h-px w-[54%] rotate-[-12deg] bg-[var(--mall-art-accent)]/16" />
      <div className="absolute right-[14%] top-[18%] h-7 w-7 rounded-full border border-[var(--mall-art-accent)]/14 bg-[var(--color-surface)]/45" />
      <div className="absolute bottom-[16%] left-[15%] h-2 w-2 rounded-full bg-[var(--mall-art-accent)]/18" />
    </div>
  );
}
