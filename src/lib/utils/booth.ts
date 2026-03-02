import type { BoothSize } from "@/constants/boothItems";

/**
 * Parse a dimension string like "3x3 m", "4×6", "5*4" into { w, d }.
 * Falls back to 3×3 if the string cannot be parsed.
 */
export function parseDimension(dim?: string): BoothSize {
  if (!dim) return { w: 3, d: 3 };
  const m = /([\d.]+)\s*[x×*]\s*([\d.]+)/i.exec(dim);
  return m ? { w: parseFloat(m[1]!), d: parseFloat(m[2]!) } : { w: 3, d: 3 };
}
