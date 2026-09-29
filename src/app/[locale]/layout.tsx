import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { Inter, Poppins } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Analytics } from "@/components/Analytics";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CINOVA — Challenge national de l'innovation agropastorale et numérique",
    template: "%s · CINOVA",
  },
  description:
    "CINOVA mobilise l'écosystème numérique nigérien pour porter l'information agricole jusqu'au producteur. Porté par le RECA.",
};

// Pré-génère les routes pour chaque locale.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${poppins.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        <NextIntlClientProvider>
          <SessionProvider>{children}</SessionProvider>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
