import {
  BarChart3,
  Compass,
  LayoutDashboard,
  Megaphone,
  Radar,
  Settings,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Command center for every store you run",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Discover",
        href: "/discover",
        icon: Radar,
        description: "Scan and rank new product opportunities",
      },
      {
        label: "Opportunities",
        href: "/opportunities",
        icon: Compass,
        description: "Your saved shortlist and ranking board",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "My Stores",
        href: "/stores",
        icon: ShoppingBag,
        description: "Launch and manage storefronts",
      },
      {
        label: "Ad Studio",
        href: "/creative",
        icon: Megaphone,
        description: "Generate campaigns from product intelligence",
      },
    ],
  },
  {
    label: "Performance",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        description: "Visitors, orders and conversion",
      },
      {
        label: "Wallet",
        href: "/wallet",
        icon: Wallet,
        description: "Simulated cash flow and reinvestment",
      },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
  description: "Workspace preferences and demo data",
};

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_GROUPS.flatMap((group) => group.items),
  SETTINGS_ITEM,
];

export function navItemFor(pathname: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
