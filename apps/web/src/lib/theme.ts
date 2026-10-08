export type ThemePreference = "light" | "dark" | "system";
export function themePreference(value?: string): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}
