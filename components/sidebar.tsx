"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { itemMatchesPath, NavItem, navSections } from "@/lib/nav-config";

const STORAGE_KEY = "luxury-admin-nav-state";

/* =========================
   ✅ ROLE ACCESS CONFIG
========================= */
const roleAccessMap: Record<string, string[]> = {
  admin: ["*"],
  editor: [
    "/blogs",
    "/properties",
    "/customization/categories",
    "/customization/property-types",
    "/customization/property-sub-types",
    "/amenities",
    "/floor-plans",
    "/customization/developer-community",
    "/customization/communities",
  ],
};

/* =========================
   ✅ FILTER FUNCTION
========================= */
function filterNavSections(sections: typeof navSections, role: string) {
  const allowedRoutes = roleAccessMap[role] || [];

  return sections
    .map((section) => {
      const filteredItems = section.items
        .map((item) => {
          // Full access
          if (allowedRoutes.includes("*")) return item;

          // Filter children
          let filteredChildren = item.children?.filter((child) =>
            allowedRoutes.includes(child.href || ""),
          );

          if (filteredChildren && filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }

          // Check main item
          if (item.href && allowedRoutes.includes(item.href)) {
            return item;
          }

          return null;
        })
        .filter(Boolean) as NavItem[];

      if (!filteredItems.length) return null;

      return { ...section, items: filteredItems };
    })
    .filter(Boolean) as typeof navSections;
}

/* =========================
   NAV ENTRY COMPONENT
========================= */
function NavEntry({
  item,
  pathname,
  depth = 0,
}: {
  item: NavItem;
  pathname: string;
  depth?: number;
}) {
  const active = itemMatchesPath(item, pathname);
  const Icon = item.icon;
  const initial = active || depth === 0;
  const [open, setOpen] = useState(initial);

  useEffect(() => {
    if (!item.children?.length) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const state = raw ? JSON.parse(raw) : {};
      if (typeof state[item.label] === "boolean") setOpen(state[item.label]);
      else if (active) setOpen(true);
    } catch {}
  }, [item.children?.length, item.label, active]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const state = raw ? JSON.parse(raw) : {};
      state[item.label] = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  };

  if (item.children?.length) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={toggle}
          className={clsx(
            "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
            active
              ? "border-gold/50 bg-white/[0.04] text-white"
              : "border-transparent text-muted hover:border-line hover:bg-panel/70 hover:text-text",
            depth > 0 && "ml-3 rounded-xl py-2.5",
          )}
        >
          <span className="flex items-center gap-3">
            <Icon
              className={clsx("h-4 w-4", active ? "text-gold" : "text-muted")}
            />
            <span className="text-sm font-medium">{item.label}</span>
          </span>
          <ChevronDown
            className={clsx(
              "h-4 w-4 transition",
              open && "rotate-180",
              active ? "text-gold" : "text-muted",
            )}
          />
        </button>

        {open && (
          <div className="ml-3 space-y-1 border-l border-line/70 pl-3">
            {item.children.map((child) => (
              <NavEntry
                key={child.href || child.label}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={clsx(
        "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
        pathname === item.href || pathname.startsWith((item.href || "") + "/")
          ? "border-gold/60 bg-gradient-to-r from-gold/10 via-violet-500/10 to-transparent text-white"
          : "border-transparent text-muted hover:border-line hover:bg-panel/70 hover:text-text",
        depth > 0 && "ml-3 rounded-xl py-2.5",
      )}
    >
      <Icon
        className={clsx(
          "h-4 w-4",
          pathname === item.href || pathname.startsWith((item.href || "") + "/")
            ? "text-gold"
            : "text-muted group-hover:text-gold",
        )}
      />
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );
}

/* =========================
   SIDEBAR COMPONENT
========================= */
export function Sidebar() {
  const pathname = usePathname();

  // 🔥 Replace with real user role later

  const role =
    typeof window !== "undefined" &&
    typeof window.localStorage.getItem("role") === "string"
      ? window.localStorage.getItem("role")
      : "super_admin";

  const allSections = useMemo(() => {
    return filterNavSections(navSections, role);
  }, [role]);

  return (
    <aside className="card sticky top-6 hidden h-[calc(100vh-3rem)] w-80 flex-col overflow-hidden lg:flex">
      <div className="border-b border-line px-5 py-5">
        <div className="rounded-3xl border border-line bg-panel p-4">
          <p className="text-xs uppercase tracking-[0.34em] flex justify-center text-gold">
            <img
              src="https://storage.googleapis.com/winstead-global-assets/projects/gallery/1776246712700-winlogo.png"
              alt="Winstead Logo"
              width={200}
              height={200}
            />
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {allSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 text-xs uppercase tracking-[0.24em] text-gold/90">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavEntry
                  key={item.href || item.label}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
