import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n from '@/lib/i18n';
import type { Locale } from '@/types';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  locale: Locale;
  mode: ThemeMode;
  animationSpeed: number;
  animationPaused: boolean;
  setLocale: (locale: Locale) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAnimationSpeed: (speed: number) => void;
  toggleAnimationPaused: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'fr',
      mode: 'light',
      animationSpeed: 0.6,
      animationPaused: false,
      setLocale: (locale) => {
        void i18n.changeLanguage(locale);
        set({ locale });
      },
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      toggleAnimationPaused: () =>
        set((state) => ({ animationPaused: !state.animationPaused })),
    }),
    {
      name: 'periodik-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locale: state.locale,
        mode: state.mode,
        animationSpeed: state.animationSpeed,
        animationPaused: state.animationPaused,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) void i18n.changeLanguage(state.locale);
      },
    },
  ),
);
