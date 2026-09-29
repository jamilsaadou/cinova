"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: sessionData, status } = useSession();
  const authed = status === "authenticated";
  const role = sessionData?.user?.role;
  const primary =
    role === "ADMIN"
      ? { href: "/admin", label: t("admin.menu") }
      : role === "JURY"
        ? { href: "/jury", label: t("juryspace.title") }
        : { href: "/espace", label: t("auth.menu.space") };
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anchors = [
    { href: "#challenge", label: t("nav.challenge") },
    { href: "#challenges", label: t("nav.challenges") },
    { href: "#journey", label: t("nav.journey") },
  ];
  const pages = [
    { href: "/presentation", label: t("nav.presentation") },
    { href: "/reglement", label: t("nav.reglement") },
  ] as const;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-sand/70 bg-cream-50/90 shadow-sm backdrop-blur"
          : "border-transparent bg-cream-50/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Logo priority className="h-9 w-auto transition-transform hover:scale-[1.03] sm:h-10" />

        <nav className="hidden items-center gap-6 lg:flex">
          {anchors.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav-underline text-sm font-medium text-ink/80 transition hover:text-green"
            >
              {l.label}
            </a>
          ))}
          {pages.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-underline text-sm font-medium text-ink/80 transition hover:text-green"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          {authed ? (
            <>
              <Link
                href={primary.href}
                className="hidden rounded-full bg-green px-4 py-2 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 sm:inline-flex"
              >
                {primary.label}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ redirectTo: `/${locale}` })}
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-forest-700 transition hover:text-green sm:inline-flex"
              >
                {t("auth.space.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-forest-700 transition hover:text-green sm:inline-flex"
              >
                {t("actions.login")}
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full bg-green px-4 py-2 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 hover:shadow-md sm:inline-flex"
              >
                {t("actions.apply")}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sand text-forest-700 lg:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-sand/70 bg-cream-50 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {anchors.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-ink/80"
              >
                {l.label}
              </a>
            ))}
            {pages.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-ink/80"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {authed ? (
                <>
                  <Link
                    href={primary.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full bg-green px-4 py-2 text-center text-sm font-semibold text-cream-50"
                  >
                    {primary.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ redirectTo: `/${locale}` })}
                    className="flex-1 rounded-full border border-sand px-4 py-2 text-center text-sm font-semibold text-forest-700"
                  >
                    {t("auth.space.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full border border-sand px-4 py-2 text-center text-sm font-semibold text-forest-700"
                  >
                    {t("actions.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full bg-green px-4 py-2 text-center text-sm font-semibold text-cream-50"
                  >
                    {t("actions.apply")}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
