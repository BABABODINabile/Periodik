import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import { useSettings } from '@/store/settings';
import { colors as lightColors } from './tokens';

export const darkColors = {
  paper: '#15140F',
  paperLight: '#1D1B16',
  ink: '#F1EFE8',
  inkSoft: '#BDB7A8',
  inkFaint: '#9E9889',
  line: '#37342C',
  lineStrong: '#575247',
  accent: '#F0653C',
  salmon: '#F2A58C',
  card: '#0A0908',
  onCard: '#F1EFE8',
  onCategory: '#15140F',
} as const;

export interface ThemePalette {
  paper: string;
  paperLight: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;
  lineStrong: string;
  accent: string;
  salmon: string;
  card: string;
  onCard: string;
  onCategory: string;
}

export const palettes: Record<'light' | 'dark', ThemePalette> = {
  light: { ...lightColors, card: '#15140F', onCard: '#F1EFE8', onCategory: '#15140F' },
  dark: darkColors,
};

export function useTheme() {
  const mode = useSettings((state) => state.mode);
  const setMode = useSettings((state) => state.setMode);
  const toggleMode = useSettings((state) => state.toggleMode);
  const [system, setSystem] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystem(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const resolved: 'light' | 'dark' = mode === 'system' ? system : mode;
  return { mode, resolvedMode: resolved, colors: palettes[resolved], setMode, toggleMode };
}
