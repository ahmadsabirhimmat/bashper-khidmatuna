export type ThemeMode = "light" | "dark";

export type AppColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  border: string;
  danger: string;
  dangerSoft: string;
  success: string;
  hero: string;
  heroText: string;
  heroMuted: string;
  inputBg: string;
  tabBar: string;
  tabInactive: string;
  overlay: string;
  chipBg: string;
};

export const lightColors: AppColors = {
  background: "#EEF2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9FC",
  text: "#0B254A",
  textSecondary: "#5C6C8C",
  textMuted: "#8EA4BE",
  primary: "#0A5CF5",
  primarySoft: "#F3F7FF",
  border: "#D7E0F5",
  danger: "#C62828",
  dangerSoft: "#FFF7F8",
  success: "#2E7D32",
  hero: "#0B254A",
  heroText: "#FFFFFF",
  heroMuted: "rgba(255,255,255,0.78)",
  inputBg: "#FFFFFF",
  tabBar: "#FFFFFF",
  tabInactive: "#9DA9C6",
  overlay: "rgba(11,37,74,0.08)",
  chipBg: "#F7F9FC",
};

export const darkColors: AppColors = {
  background: "#0B1220",
  surface: "#151E2E",
  surfaceAlt: "#1B2638",
  text: "#E8EEF8",
  textSecondary: "#A7B4CC",
  textMuted: "#7E8BA3",
  primary: "#4C8DFF",
  primarySoft: "#1A2740",
  border: "#2A374F",
  danger: "#FF6B6B",
  dangerSoft: "#2A181B",
  success: "#4CAF50",
  hero: "#101A2B",
  heroText: "#FFFFFF",
  heroMuted: "rgba(255,255,255,0.72)",
  inputBg: "#1B2638",
  tabBar: "#121A28",
  tabInactive: "#7E8BA3",
  overlay: "rgba(255,255,255,0.06)",
  chipBg: "#1B2638",
};

export const getColors = (mode: ThemeMode): AppColors =>
  mode === "dark" ? darkColors : lightColors;
