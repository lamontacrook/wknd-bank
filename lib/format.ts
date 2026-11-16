export function formatRate(rate?: number | null, rateType?: string) {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return "—";
  return `${rate.toFixed(2)}%${rateType ? ` ${rateType}` : ""}`;
}

export function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
