"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  IconGrid,
  IconDocument,
  IconMarket,
  IconClock,
  IconTrophy,
  IconScale,
  IconTarget,
  IconGears,
  IconLogout,
  IconMenu,
  IconClose,
  IconArrowRight,
} from "@/components/icons";

type NavItem = {
  href: string;
  labelKey: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", labelKey: "navDashboard", Icon: IconGrid },
  { href: "/admin/statistiques", labelKey: "navStats", Icon: IconMarket },
  { href: "/admin/candidatures", labelKey: "navApplications", Icon: IconDocument },
  { href: "/admin/jury", labelKey: "navJury", Icon: IconScale },
  { href: "/admin/classement", labelKey: "navRanking", Icon: IconTrophy },
  { href: "/admin/deliberation", labelKey: "navDeliberation", Icon: IconTarget },
  { href: "/admin/logs", labelKey: "navLogs", Icon: IconClock },
  { href: "/admin/parametres", labelKey: "navSettings", Icon: IconGears },
];

export function AdminChrome({
  user,
  children,
}: {
  user: { name: string | null; email: string | null };
  children: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const initial = (user.name ?? user.email ?? "A").charAt(0).toUpperCase();

  const navList = (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => {
        const active = isActive(item.href);
        const content = (
          <>
            <item.Icon className="h-5 w-5 flex-none" />
            <span className="flex-1 truncate">{t(item.labelKey)}</span>
            {item.soon && (
              <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                {t("soon")}
              </span>
            )}
          </>
        );
        const base =
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition";
        if (item.soon) {
          return (
            <span key={item.href} className={`${base} cursor-not-allowed text-cream-100/40`}>
              {content}
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`${base} ${
              active
                ? "bg-green text-cream-50 shadow-sm"
                : "text-cream-100/80 hover:bg-forest-700 hover:text-cream-50"
            }`}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col bg-forest py-5 text-cream-100">
      <div className="mb-6 px-5">
        <Logo variant="white" className="h-9 w-auto" />
        <p className="mt-2 text-xs uppercase tracking-widest text-sage">{t("eyebrow")}</p>
      </div>

      {navList}

      <div className="mt-auto space-y-1 px-3 pt-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream-100/70 transition hover:bg-forest-700 hover:text-cream-50"
        >
          <IconArrowRight className="h-5 w-5 rotate-180" />
          {t("backToSite")}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ redirectTo: `/${locale}` })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream-100/70 transition hover:bg-forest-700 hover:text-cream-50"
        >
          <IconLogout className="h-5 w-5" />
          {t("logout")}
        </button>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-forest-700/60 px-3 py-2.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-green text-sm font-bold text-cream-50">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream-50">{user.name}</p>
            <p className="truncate text-xs text-cream-100/60">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[264px_1fr]">
      {/* Barre latérale — desktop */}
      <aside className="sticky top-0 hidden h-dvh lg:block">{sidebarInner}</aside>

      {/* Colonne contenu */}
      <div className="flex min-h-dvh flex-col">
        {/* Topbar mobile */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-sand bg-cream-50/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sand text-forest-700"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <Logo className="h-8 w-auto" />
          <LanguageSwitcher />
        </div>

        {/* Topbar desktop */}
        <div className="hidden items-center justify-end gap-3 border-b border-sand bg-cream-50/60 px-6 py-3 lg:flex">
          <LanguageSwitcher />
        </div>

        <main className="flex-1">{children}</main>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-3 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg text-cream-100/80"
            >
              <IconClose className="h-5 w-5" />
            </button>
            {sidebarInner}
          </div>
        </div>
      )}
    </div>
  );
}
