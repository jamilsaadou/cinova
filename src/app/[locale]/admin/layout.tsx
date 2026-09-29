import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin";
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
  const user = await requireAdmin();

  return (
    <AdminChrome user={{ name: user.name ?? null, email: user.email ?? null }}>
      {children}
    </AdminChrome>
  );
}
