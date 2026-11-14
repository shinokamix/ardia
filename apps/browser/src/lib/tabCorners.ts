import type { ThemeLook } from "./themeLook";

export const TAB_CORNERS = { min: 0, max: 20 } as const;

export const validTabCorners = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isInteger(value) && value >= TAB_CORNERS.min && value <= TAB_CORNERS.max);

export function withTabCorners(look: ThemeLook, corners: number | null): ThemeLook {
  if (corners === null || corners === look.radii.chrome) return look;
  return { ...look, radii: { ...look.radii, chrome: corners } };
}
