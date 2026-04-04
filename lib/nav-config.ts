import {
  BadgeDollarSign,
  BookUser,
  BriefcaseBusiness,
  Building2,
  FileCode2,
  FileText,
  FolderKanban,
  Globe,
  Headset,
  Home,
  Images,
  LayoutDashboard,
  MapPin,
  MenuSquare,
  MessageSquare,
  Mic,
  PenSquare,
  Phone,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href?: string;
  icon: any;
  children?: NavItem[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Contact Query", href: "/contact-query", icon: MessageSquare },
      {
        label: "App Contact Query",
        href: "/app-contact-query",
        icon: MessageSquare,
      },
      { label: "App Call Request", href: "/app-call-request", icon: Phone },
      { label: "Review Request", href: "/review-request", icon: Star },
      {
        label: "Sales",
        href: "/sales",
        icon: BadgeDollarSign,
        children: [
          {
            label: "Manage Sales",
            href: "/sales/manage-sales",
            icon: BadgeDollarSign,
          },
          { label: "Clients", href: "/sales/clients", icon: Users },
        ],
      },
      {
        label: "Helpdesk",
        href: "/helpdesk",
        icon: Headset,
        children: [
          { label: "Tickets", href: "/helpdesk/tickets", icon: Headset },
          { label: "FAQs", href: "/helpdesk/faqs", icon: FileText },
        ],
      },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Properties", href: "/properties", icon: Home },
      { label: "Explore", href: "/explore", icon: Globe },
      { label: "Podcast", href: "/podcast", icon: Mic },
      { label: "Blogs", href: "/blogs", icon: PenSquare },
      { label: "Media", href: "/media", icon: Images },
      { label: "Pages", href: "/pages", icon: FileText },
      {
        label: "Relationship Manager",
        href: "/relationship-manager",
        icon: BookUser,
      },
      { label: "Careers", href: "/careers", icon: BriefcaseBusiness },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        label: "Customization",
        href: "/customization",
        icon: Wrench,
        children: [
          {
            label: "Footer Menu",
            href: "/customization/footer-menu",
            icon: MenuSquare,
          },
          {
            label: "Footer Menu 2",
            href: "/customization/footer-menu-2",
            icon: MenuSquare,
          },
          {
            label: "Categories",
            href: "/customization/categories",
            icon: FolderKanban,
          },
          {
            label: "Developer Community",
            href: "/customization/developer-community",
            icon: Building2,
          },
          {
            label: "Mega Category Ads",
            href: "/customization/mega-category-ads",
            icon: Images,
          },
        ],
      },
      {
        label: "App Customization",
        icon: Settings,
        children: [
          {
            label: "Contents",
            href: "/app-customization/contents",
            icon: FileText,
          },
          { label: "Banner", href: "/customization/banner", icon: Images },
          {
            label: "Property Banner",
            href: "/app-customization/property-banner",
            icon: Images,
          },
        ],
      },
      {
        label: "Master",
        href: "/master",
        icon: ShieldCheck,
        children: [
          {
            label: "Testimonials",
            href: "/customization/testimonials",
            icon: Star,
          },
          { label: "FAQ", href: "/customization/faq", icon: FileText },
          {
            label: "Property Types",
            href: "/customization/property-types",
            icon: Building2,
          },
          {
            label: "Property Sub-Types",
            href: "/customization/property-sub-types",
            icon: Building2,
          },
          {
            label: "Feature Icons",
            href: "/customization/feature-icons",
            icon: FileCode2,
          },
          {
            label: "Locations",
            href: "/customization/locations",
            icon: MapPin,
          },
          { label: "Awards", href: "/customization/awards", icon: Star },
          {
            label: "Advertisements",
            href: "/customization/advertisements",
            icon: Images,
          },
        ],
      },
      {
        label: "Others",
        icon: Globe,
        children: [
          { label: "About Us", href: "/about", icon: FileText },
          {
            label: "Meta Settings",
            href: "/master/meta-settings",
            icon: Globe,
          },
          { label: "User Access", href: "/master/user-access", icon: Users },
          { label: "Custom SEO", href: "/master/custom-seo", icon: Globe },
          { label: "Sitemap", href: "/master/sitemap", icon: Globe },
          { label: "Page Logs", href: "/master/page-logs", icon: FileText },
        ],
      },
    ],
  },
];

export function itemMatchesPath(item: NavItem, pathname: string): boolean {
  if (item.href && (pathname === item.href || pathname.startsWith(item.href + '/'))) return true;
  return item.children?.some((child) => itemMatchesPath(child, pathname)) ?? false;
}
