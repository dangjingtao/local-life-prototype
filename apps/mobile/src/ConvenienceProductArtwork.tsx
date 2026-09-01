interface ConvenienceProductArtworkProps {
  productId: string;
  name: string;
  className?: string;
}

function PackageBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="h-full w-full">
      <rect width="120" height="120" rx="22" fill="var(--color-surface-subtle)" />
      <circle cx="94" cy="24" r="18" fill="var(--color-brand-subtle)" />
      <circle cx="22" cy="96" r="22" fill="var(--color-brand-subtle)" opacity="0.7" />
      {children}
    </svg>
  );
}

export function ConvenienceProductArtwork({ productId, name, className = "" }: ConvenienceProductArtworkProps) {
  let artwork: React.ReactNode;

  switch (productId) {
    case "PRODUCT-OAT-LATTE":
      artwork = (
        <PackageBase>
          <path d="M41 31h38l-4 60a8 8 0 0 1-8 7H53a8 8 0 0 1-8-7l-4-60Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M38 31h44" stroke="var(--color-text-secondary)" strokeWidth="5" strokeLinecap="round" />
          <rect x="48" y="51" width="24" height="29" rx="8" fill="var(--color-primary)" opacity="0.9" />
          <path d="M55 62c4-5 8-5 12 0-4 7-8 7-12 0Z" fill="var(--color-on-primary)" opacity="0.85" />
          <path d="M69 20l-7 14" stroke="var(--color-text-primary)" strokeWidth="3" strokeLinecap="round" />
        </PackageBase>
      );
      break;
    case "PRODUCT-SPARKLING-WATER":
      artwork = (
        <PackageBase>
          <path d="M51 20h18v12l6 8v49a10 10 0 0 1-10 10H55a10 10 0 0 1-10-10V40l6-8V20Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <rect x="48" y="49" width="24" height="30" rx="6" fill="var(--color-success-bg)" />
          <circle cx="60" cy="64" r="8" fill="none" stroke="var(--color-success)" strokeWidth="3" />
          <path d="M60 56v16M52 64h16" stroke="var(--color-success)" strokeWidth="1.5" opacity="0.75" />
          <rect x="52" y="16" width="16" height="8" rx="3" fill="var(--color-primary)" />
        </PackageBase>
      );
      break;
    case "PRODUCT-EGG-SANDWICH":
      artwork = (
        <PackageBase>
          <path d="M31 85 58 31a4 4 0 0 1 7 0l25 54a6 6 0 0 1-5 8H37a6 6 0 0 1-6-8Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M42 79 60 43l18 36H42Z" fill="var(--color-warning-bg)" />
          <circle cx="60" cy="62" r="9" fill="var(--color-surface)" stroke="var(--color-warning)" strokeWidth="5" />
          <path d="M44 80h33" stroke="var(--color-success)" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </PackageBase>
      );
      break;
    case "PRODUCT-LIGHT-LIFE":
      artwork = (
        <PackageBase>
          <path d="M31 43h31l-3 45a7 7 0 0 1-7 7H41a7 7 0 0 1-7-7l-3-45Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M29 43h35" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
          <path d="M72 29h16l-2 60a7 7 0 0 1-7 6h-1a7 7 0 0 1-7-6l1-60Z" fill="var(--color-brand-subtle)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M77 23h7" stroke="var(--color-text-primary)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="46" cy="67" r="10" fill="var(--color-success-bg)" />
          <path d="M41 67h10" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" />
        </PackageBase>
      );
      break;
    case "PRODUCT-SCALP-SET":
      artwork = (
        <PackageBase>
          <path d="M31 39h27v50a8 8 0 0 1-8 8H39a8 8 0 0 1-8-8V39Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <rect x="35" y="27" width="19" height="14" rx="4" fill="var(--color-primary)" />
          <path d="M42 60c8-10 15-3 8 7-6 9-14 3-8-7Z" fill="var(--color-brand-subtle)" stroke="var(--color-primary)" strokeWidth="2" />
          <path d="M70 42h18v49a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6V42Z" fill="var(--color-brand-subtle)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M75 26h8v18h-8z" fill="var(--color-text-secondary)" />
          <path d="m79 20 5 7H74l5-7Z" fill="var(--color-primary)" />
        </PackageBase>
      );
      break;
    case "PRODUCT-CLEAN-SET":
      artwork = (
        <PackageBase>
          <path d="M29 47h29v42a8 8 0 0 1-8 8H37a8 8 0 0 1-8-8V47Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M39 34h9v13h-9zM44 31h18" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="44" cy="69" r="9" fill="var(--color-brand-subtle)" />
          <path d="M68 55h27v35a7 7 0 0 1-7 7H75a7 7 0 0 1-7-7V55Z" fill="var(--color-brand-subtle)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M72 63h19M72 70h14" stroke="var(--color-text-secondary)" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        </PackageBase>
      );
      break;
    default:
      artwork = (
        <PackageBase>
          <rect x="36" y="29" width="48" height="65" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <circle cx="60" cy="59" r="13" fill="var(--color-brand-subtle)" />
          <path d="M51 78h18" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
        </PackageBase>
      );
  }

  return (
    <div role="img" aria-label={`${name} 商品主图`} className={`overflow-hidden rounded-[var(--radius-container)] ${className}`}>
      {artwork}
    </div>
  );
}
