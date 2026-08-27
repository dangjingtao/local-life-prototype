import { ArrowLeft, CheckCircle2, CircleAlert, CircleHelp, Home, LayoutGrid, Menu, Plus, Search, Settings, UserRound, X, type LucideProps } from "lucide-react";

const registry = {
  add: Plus,
  back: ArrowLeft,
  close: X,
  home: Home,
  info: CircleHelp,
  menu: Menu,
  modules: LayoutGrid,
  profile: UserRound,
  search: Search,
  settings: Settings,
  success: CheckCircle2,
  warning: CircleAlert
} as const;

export type PrototypeIconName = keyof typeof registry;

export function PrototypeIcon({ name, ...props }: LucideProps & { name: PrototypeIconName }) {
  const Icon = registry[name];
  return <Icon aria-hidden="true" strokeWidth={2} {...props} />;
}

export { registry as prototypeIconRegistry };
