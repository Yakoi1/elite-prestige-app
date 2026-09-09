export function hexToRgbTriplet(hex: string, fallback = "0 0 0"): string {
  const clean = (hex || "").trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}
