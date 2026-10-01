import { BENEFICIARY_KEYS, HEARD_ABOUT_KEYS } from "./candidature-options";

export function participationIndicators(teams: { beneficiaries: string | null; heardAbout: string | null }[]) {
  const byBeneficiary: Record<string, number> = {};
  const byHeardAbout: Record<string, number> = {};
  let missingBeneficiaries = 0;
  let missingHeardAbout = 0;
  for (const team of teams) {
    const keys = [...new Set((team.beneficiaries ?? "").split(",").map((s) => s.trim()))]
      .filter((key) => (BENEFICIARY_KEYS as readonly string[]).includes(key));
    if (!keys.length) missingBeneficiaries++;
    for (const key of keys) byBeneficiary[key] = (byBeneficiary[key] ?? 0) + 1;
    if (team.heardAbout && (HEARD_ABOUT_KEYS as readonly string[]).includes(team.heardAbout)) {
      byHeardAbout[team.heardAbout] = (byHeardAbout[team.heardAbout] ?? 0) + 1;
    } else missingHeardAbout++;
  }
  return { byBeneficiary, byHeardAbout, missingBeneficiaries, missingHeardAbout };
}
