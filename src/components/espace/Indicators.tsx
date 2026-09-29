import { useTranslations } from "next-intl";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import {
  IconShield,
  IconUsers,
  IconTarget,
  IconMap,
  IconClock,
  IconCheck,
} from "@/components/icons";

type Props = {
  profileComplete: boolean;
  memberCount: number;
  status: string | null;
  challengeCode: string | null;
  region: string | null;
  daysLeft: number | null;
};

// Rangée d'indicateurs de la candidature.
export function Indicators({
  profileComplete,
  memberCount,
  status,
  challengeCode,
  region,
  daysLeft,
}: Props) {
  const t = useTranslations("espace.indicators");
  const tStatus = useTranslations("status");
  const tRegions = useTranslations("regions");
  const tCh = useTranslations("challenges");

  const challengeLabel = challengeCode
    ? tCh(`items.${CHALLENGE_CODE_TO_KEY[challengeCode] ?? "alert"}.title`)
    : t("notSet");

  const tiles = [
    {
      icon: IconCheck,
      label: t("profile"),
      value: profileComplete ? t("complete") : t("incomplete"),
      accent: profileComplete,
    },
    { icon: IconShield, label: t("status"), value: status ? tStatus(status) : t("notSet") },
    { icon: IconUsers, label: t("members"), value: String(memberCount) },
    { icon: IconTarget, label: t("challenge"), value: challengeLabel },
    { icon: IconMap, label: t("region"), value: region ? tRegions(region) : t("notSet") },
    {
      icon: IconClock,
      label: t("daysLeft"),
      value: daysLeft != null ? `${daysLeft} ${t("daysUnit")}` : t("notSet"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <div key={i} className="rounded-2xl border border-sand bg-cream-50 p-4">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                tile.accent ? "bg-green/15 text-green" : "bg-forest/5 text-forest-700"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted">{tile.label}</p>
            <p className="font-display mt-0.5 truncate text-sm font-semibold text-forest" title={tile.value}>
              {tile.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
