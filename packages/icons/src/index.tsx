import { ArrowLeft, Calendar, CheckCircle2, ChevronRight, CircleAlert, CircleHelp, Clock, FileText, Gift, Home, LayoutGrid, Menu, Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingCart, Sparkles, Ticket, TrendingUp, UserRound, X, type LucideProps } from "lucide-react";

const registry = {
  add: Plus,
  back: ArrowLeft,
  calendar: Calendar,
  cart: ShoppingCart,
  chevron: ChevronRight,
  clock: Clock,
  close: X,
  coupon: Ticket,
  gift: Gift,
  home: Home,
  info: CircleHelp,
  menu: Menu,
  modules: LayoutGrid,
  profile: UserRound,
  repeat: RefreshCw,
  report: FileText,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  sparkles: Sparkles,
  success: CheckCircle2,
  trend: TrendingUp,
  warning: CircleAlert
} as const;

export type PrototypeIconName = keyof typeof registry;

export function PrototypeIcon({ name, ...props }: LucideProps & { name: PrototypeIconName }) {
  const Icon = registry[name];
  return <Icon aria-hidden="true" strokeWidth={2} {...props} />;
}

export { registry as prototypeIconRegistry };
