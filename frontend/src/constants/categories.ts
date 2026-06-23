import { CustomCategory } from "@/src/types";

export type IconFamily = "feather" | "ionicons";

export interface CatMeta {
  id: string;
  icon: { family: IconFamily; name: string };
  accent: string;
  tint: { light: string; dark: string };
  fg: { light: string; dark: string };
}

export const CATEGORY_ORDER = [
  "gorevler",
  "fikirler",
  "kisisel",
  "alisveris",
  "saglik",
  "para_is",
  "notlar",
];

export const CATEGORIES: Record<string, CatMeta> = {
  gorevler: {
    id: "gorevler",
    icon: { family: "feather", name: "check-square" },
    accent: "#3B82F6",
    tint: { light: "#DBEAFE", dark: "#1E3A8A" },
    fg: { light: "#1D4ED8", dark: "#BFDBFE" },
  },
  fikirler: {
    id: "fikirler",
    icon: { family: "ionicons", name: "bulb-outline" },
    accent: "#6366F1",
    tint: { light: "#E0E7FF", dark: "#312E81" },
    fg: { light: "#4338CA", dark: "#C7D2FE" },
  },
  kisisel: {
    id: "kisisel",
    icon: { family: "feather", name: "user" },
    accent: "#F43F5E",
    tint: { light: "#FFE4E6", dark: "#881337" },
    fg: { light: "#BE123C", dark: "#FECDD3" },
  },
  alisveris: {
    id: "alisveris",
    icon: { family: "feather", name: "shopping-bag" },
    accent: "#F97316",
    tint: { light: "#FFEDD5", dark: "#7C2D12" },
    fg: { light: "#C2410C", dark: "#FED7AA" },
  },
  saglik: {
    id: "saglik",
    icon: { family: "feather", name: "plus-square" },
    accent: "#22C55E",
    tint: { light: "#DCFCE7", dark: "#064E3B" },
    fg: { light: "#15803D", dark: "#BBF7D0" },
  },
  para_is: {
    id: "para_is",
    icon: { family: "ionicons", name: "wallet-outline" },
    accent: "#14B8A6",
    tint: { light: "#CCFBF1", dark: "#134E4A" },
    fg: { light: "#0F766E", dark: "#99F6E4" },
  },
  notlar: {
    id: "notlar",
    icon: { family: "feather", name: "file-text" },
    accent: "#64748B",
    tint: { light: "#F1F5F9", dark: "#334155" },
    fg: { light: "#475569", dark: "#CBD5E1" },
  },
};

/** Add alpha to a 6-digit hex for soft custom-category tints. */
function hexAlpha(hex: string, alpha: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return `${hex}${alpha}`;
  return hex;
}

export function resolveCategory(
  id: string,
  custom: CustomCategory[] = [],
): CatMeta {
  if (CATEGORIES[id]) return CATEGORIES[id];
  const c = custom.find((x) => x.id === id);
  if (c) {
    return {
      id: c.id,
      icon: { family: "feather", name: "tag" },
      accent: c.color,
      tint: { light: hexAlpha(c.color, "22"), dark: hexAlpha(c.color, "33") },
      fg: { light: c.color, dark: c.color },
    };
  }
  return CATEGORIES.notlar;
}

export const CUSTOM_COLOR_CHOICES = [
  "#3B82F6",
  "#6366F1",
  "#F43F5E",
  "#F97316",
  "#22C55E",
  "#14B8A6",
  "#EAB308",
  "#8B5CF6",
];
