import { getTranslations, setRequestLocale } from "next-intl/server";
import { Prisma, UserRole } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/admin/UserForm";
import { Pagination } from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utilisateurs" };
export default async function UsersPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireAdmin();
  const sp = await searchParams;
  const t = await getTranslations("users");
  const tr = await getTranslations("roles");
  const role = Object.values(UserRole).find(value => value === sp.role);
  const q = (sp.q ?? "").trim().slice(0, 200);
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const total = await prisma.user.count({ where });
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(sp.page) || 1)));
  const users = await prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true, isActive: true }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 20, skip: (page - 1) * 20 });
  return <div className="mx-auto max-w-5xl space-y-6 px-5 py-10">
    <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
    <p className="text-muted">{t("subtitle")}</p>
    <details className="rounded-xl border border-sand bg-white p-4"><summary className="cursor-pointer font-semibold text-green">{t("create")}</summary><div className="mt-4"><UserForm /></div></details>
    <form method="get" className="flex flex-wrap gap-3">
      <input aria-label={t("search")} name="q" defaultValue={q} placeholder={t("search")} className="min-w-0 flex-1 rounded-lg border border-sand p-2" />
      <select aria-label={t("role")} name="role" defaultValue={role ?? ""} className="rounded-lg border border-sand p-2"><option value="">{t("allRoles")}</option>{Object.values(UserRole).map(value=><option key={value} value={value}>{tr(value)}</option>)}</select>
      <button className="rounded-full bg-green px-5 py-2 text-white">{t("filter")}</button>
    </form>
    <p className="text-sm text-muted">{t("count", { count: total })}</p>
    {users.map(user=><UserForm key={`${user.id}-${user.role}-${user.isActive}-${user.name}`} user={user} self={user.id === actor.id} />)}
    {!users.length && <p>{t("empty")}</p>}
    <Pagination page={page} pages={pages} params={sp} basePath="/admin/utilisateurs" />
  </div>;
}
