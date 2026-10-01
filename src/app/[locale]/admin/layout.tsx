import { setRequestLocale } from "next-intl/server";
import { requireBackoffice } from "@/lib/admin";
import { AdminChrome } from "@/components/admin/AdminChrome";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireBackoffice();

  return (
    <AdminChrome user={{ name: user.name ?? null, email: user.email ?? null, role: user.role }}>
      {children}
    </AdminChrome>
  );
}
