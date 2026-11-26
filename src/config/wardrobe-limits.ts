export const EXTRA_ITEMS_ALLOWED = 5;

/** Account-specific baselines are supplied locally, never committed as personal data. */
function readBaselines(raw: string | undefined): Record<string, number> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    const result: Record<string, number> = Object.create(null);
    for (const [email, value] of Object.entries(parsed)) {
      if (
        !email.includes("@") ||
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0
      )
        return null;
      result[email.toLowerCase().trim()] = value;
    }
    return result;
  } catch {
    return null;
  }
}

export function getWardrobeCap(
  email: string | undefined,
  rawConfig = process.env.EXPO_PUBLIC_WARDROBE_LIMIT_BASELINES,
): number | null {
  if (!email) return null;
  const baselines = readBaselines(rawConfig);
  // Fail closed until the owner supplies the inherited account limits.
  if (!baselines) return 0;
  const baseline = baselines[email.toLowerCase().trim()];
  return baseline === undefined ? null : baseline + EXTRA_ITEMS_ALLOWED;
}
