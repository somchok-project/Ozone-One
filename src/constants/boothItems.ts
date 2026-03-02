// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemType =
  | "table" | "chair" | "rack" | "shelf" | "counter"
  | "sofa" | "display" | "fridge" | "lamp" | "plant" | "banner";

export interface BoothItem {
  id: string;
  type: ItemType;
  position: [number, number, number];
  rotation: [number, number, number];
  color?: string;
}

export interface BoothSize {
  w: number;
  d: number;
}

// ─── Floor Constants ─────────────────────────────────────────────────────────

/** ความสูงของพื้นบูธ */
export const BOOTH_FLOOR_Y = 0.04;

/** ระยะแนวตั้งของแต่ละไอเทม (คิดจาก origin ของ group) */
export const ITEM_FLOOR_OFFSET: Record<ItemType, number> = {
  table:   BOOTH_FLOOR_Y + 0.35,
  chair:   BOOTH_FLOOR_Y + 0.25,
  rack:    BOOTH_FLOOR_Y + 0.80,
  shelf:   BOOTH_FLOOR_Y + 0.50,
  counter: BOOTH_FLOOR_Y + 0.45,
  sofa:    BOOTH_FLOOR_Y + 0.25,
  display: BOOTH_FLOOR_Y + 0.60,
  fridge:  BOOTH_FLOOR_Y + 0.60,
  lamp:    BOOTH_FLOOR_Y + 0.90,
  plant:   BOOTH_FLOOR_Y + 0.30,
  banner:  BOOTH_FLOOR_Y + 0.90,
};

// ─── Display Metadata ────────────────────────────────────────────────────────

export const ITEM_COLORS: Record<ItemType, string> = {
  table:   "#d97706",
  chair:   "#2563eb",
  rack:    "#7c3aed",
  shelf:   "#059669",
  counter: "#db2777",
  sofa:    "#0891b2",
  display: "#6366f1",
  fridge:  "#64748b",
  lamp:    "#eab308",
  plant:   "#16a34a",
  banner:  "#dc2626",
};

export const ITEM_LABELS: Record<ItemType, string> = {
  table:   "โต๊ะ",
  chair:   "เก้าอี้",
  rack:    "ราวแขวน",
  shelf:   "ชั้นวาง",
  counter: "เคาน์เตอร์",
  sofa:    "โซฟา",
  display: "ตู้โชว์",
  fridge:  "ตู้แช่",
  lamp:    "โคมไฟ",
  plant:   "ต้นไม้",
  banner:  "แบนเนอร์",
};

export const ITEM_ICONS: Record<ItemType, string> = {
  table:   "🪵",
  chair:   "🪑",
  rack:    "👔",
  shelf:   "📚",
  counter: "🏪",
  sofa:    "🛋️",
  display: "🪟",
  fridge:  "🧊",
  lamp:    "💡",
  plant:   "🪴",
  banner:  "🚩",
};

/** Ordered list used by the bottom dock */
export const ALL_ITEM_TYPES: ItemType[] = [
  "table", "chair", "counter", "sofa",
  "rack", "shelf", "display", "fridge",
  "lamp", "plant", "banner",
];
