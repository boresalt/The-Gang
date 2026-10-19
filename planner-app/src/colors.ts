// Category colours. `hex` is used for dots and borders; chips use it at low opacity
// so the label text stays readable in both themes.
export const COLORS = {
  red: { name: 'Red', hex: '#ef4444' },
  orange: { name: 'Orange', hex: '#f97316' },
  amber: { name: 'Amber', hex: '#f59e0b' },
  lime: { name: 'Lime', hex: '#84cc16' },
  green: { name: 'Green', hex: '#22c55e' },
  teal: { name: 'Teal', hex: '#14b8a6' },
  cyan: { name: 'Cyan', hex: '#06b6d4' },
  blue: { name: 'Blue', hex: '#3b82f6' },
  indigo: { name: 'Indigo', hex: '#6366f1' },
  violet: { name: 'Violet', hex: '#8b5cf6' },
  pink: { name: 'Pink', hex: '#ec4899' },
  slate: { name: 'Grey', hex: '#64748b' },
} as const

export type ColorKey = keyof typeof COLORS

export const COLOR_KEYS = Object.keys(COLORS) as ColorKey[]

export const colorHex = (key: ColorKey | undefined) => COLORS[key ?? 'slate']?.hex ?? COLORS.slate.hex
