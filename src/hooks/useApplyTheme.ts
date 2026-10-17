import { useEffect } from 'react';
import type { CakeTheme } from '../types';
import { DEFAULT_THEME } from '../lib/themes';

// Sets data-theme on <html> so the whole page (background, overscroll,
// modals) follows the cake's theme, and restores the default on leave.
export function useApplyTheme(theme: CakeTheme | undefined) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme ?? DEFAULT_THEME;
    return () => {
      root.dataset.theme = DEFAULT_THEME;
    };
  }, [theme]);
}
