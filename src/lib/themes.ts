import type { CakeTheme } from '../types';

export interface ThemeOption {
  value: CakeTheme;
  label: string;
  blurb: string;
  swatch: { bg: string; accent: string };
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'plum', label: 'Plum', blurb: 'Rich and warm. The default.', swatch: { bg: '#4C2B4D', accent: '#C9A66B' } },
  { value: 'espresso', label: 'Espresso', blurb: 'Dark and moody.', swatch: { bg: '#1C1613', accent: '#C9A66B' } },
  { value: 'blush', label: 'Blush', blurb: 'Soft and light, great for a kid\u2019s birthday.', swatch: { bg: '#FAEEEB', accent: '#BE6C78' } },
  { value: 'midnight', label: 'Midnight', blurb: 'Deep and cool.', swatch: { bg: '#0C1019', accent: '#8CAAD6' } },
];

export const DEFAULT_THEME: CakeTheme = 'plum';
