import { ArrowLeft, Building2, Calendar, Check, CheckCircle2, ChevronRight, CircleAlert, CircleHelp, Clock, Edit3, FileText, Gift, Home, LayoutGrid, Menu, Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Ticket, TrendingUp, UserRound, X, type LucideProps } from "lucide-react";

const registry = {
  add: Plus,
  back: ArrowLeft,
  bag: ShoppingBag,
  calendar: Calendar,
  cart: ShoppingCart,
  check: Check,
  chevron: ChevronRight,
  clock: Clock,
  close: X,
  coupon: Ticket,
  edit: Edit3,
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
  store: Building2,
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
