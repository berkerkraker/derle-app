import { Priority } from "@/src/types";

export interface Palette {
  scheme: "light" | "dark";
  bg: string;
  card: string;
  cardBorder: string;
  input: string;
  inputText: string;
  divider: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandText: string;
  brandSoft: string;
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  overlay: string;
  sheet: string;
  sheetHandle: string;
  urgent: string;
  important: string;
  danger: string;
  dangerSoft: string;
}

export const LIGHT: Palette = {
  scheme: "light",
  bg: "#F6F6F7",
  card: "#FFFFFF",
  cardBorder: "#E9E9EC",
  input: "#EFEFF1",
  inputText: "#0B0B0B",
  divider: "#ECECEF",
  text: "#0B0B0B",
  textSecondary: "#52525B",
  textMuted: "#9CA3AF",
  brand: "#0F766E",
  brandText: "#FFFFFF",
  brandSoft: "#CCFBF1",
  tabBar: "rgba(246,246,247,0.92)",
  tabBarBorder: "#E5E5EA",
  tabActive: "#0B0B0B",
  tabInactive: "#9CA3AF",
  overlay: "rgba(0,0,0,0.35)",
  sheet: "#FFFFFF",
  sheetHandle: "#D1D1D6",
  urgent: "#EF4444",
  important: "#CA8A04",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};

export const DARK: Palette = {
  scheme: "dark",
  bg: "#0B0B0B",
  card: "#1A1A1C",
  cardBorder: "#2C2C2E",
  input: "#2C2C2E",
  inputText: "#FFFFFF",
  divider: "#262628",
  text: "#FFFFFF",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  brand: "#2DD4BF",
  brandText: "#05322C",
  brandSoft: "#0F3D38",
  tabBar: "rgba(16,16,18,0.85)",
  tabBarBorder: "#2C2C2E",
  tabActive: "#FFFFFF",
  tabInactive: "#6B7280",
  overlay: "rgba(0,0,0,0.6)",
  sheet: "#1A1A1C",
  sheetHandle: "#3A3A3C",
  urgent: "#EF4444",
  important: "#B45309",
  danger: "#F87171",
  dangerSoft: "#3B1414",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "transparent",
};
