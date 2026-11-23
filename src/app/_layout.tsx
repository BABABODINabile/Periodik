import '@/lib/polyfills';
import '@/lib/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationBar, setStyle as setNavigationBarStyle } from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import { IntroOverlay } from '@/components/IntroOverlay';
import { useTheme } from '@/theme';

const INTRO_KEY = 'periodik_intro_seen';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk: SpaceGrotesk_400Regular,
    SpaceGroteskMedium: SpaceGrotesk_500Medium,
    SpaceGroteskBold: SpaceGrotesk_700Bold,
    JetBrainsMono: JetBrainsMono_400Regular,
    JetBrainsMonoMedium: JetBrainsMono_500Medium,
  });
  const { colors, resolvedMode } = useTheme();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setNavigationBarStyle(resolvedMode === 'dark' ? 'light' : 'dark');
    }
  }, [colors.paper, resolvedMode]);

  useEffect(() => {
    if (!fontsLoaded) return;
    void AsyncStorage.getItem(INTRO_KEY).then((seen) => setShowIntro(seen !== '1'));
  }, [fontsLoaded]);

  const finishIntro = () => {
    setShowIntro(false);
    void AsyncStorage.setItem(INTRO_KEY, '1');
  };

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.paper }]}>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      {Platform.OS === 'android' && <NavigationBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="element/[number]" />
        <Stack.Screen name="comparer" />
        <Stack.Screen name="outils/equilibreur" />
        <Stack.Screen name="outils/masse" />
        <Stack.Screen name="outils/empirique" />
        <Stack.Screen name="outils/solubilite" />
      </Stack>
      {showIntro && <IntroOverlay onDone={finishIntro} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
