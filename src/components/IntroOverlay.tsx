import { useEffect } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from 'react-i18next';

import { colors, font } from '@/theme/tokens';

export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const progress = useSharedValue(0);
  const orbit = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      progress.value = withSequence(
        withTiming(1, { duration: 500 }),
        withDelay(450, withTiming(0, { duration: 350 }, (finished) => {
          if (finished) runOnJS(onDone)();
        })),
      );
      orbit.value = withTiming(1, { duration: 1200 });
    };
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) runOnJS(onDone)();
      else start();
    });
    return () => {
      cancelled = true;
    };
  }, [onDone, orbit, progress]);

  const root = useAnimatedStyle(() => ({ opacity: progress.value }));
  const mark = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + progress.value * 0.15 }],
  }));
  const ring = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbit.value * 180}deg` }],
  }));

  return (
    <Modal transparent statusBarTranslucent animationType="fade">
      <Animated.View style={[styles.root, root]}>
        <View style={styles.center}>
          <Animated.View style={[styles.ring, ring]} />
          <Animated.View style={mark}>
            <Text style={styles.markText}>PÉRIODIK</Text>
            <Text style={styles.tagline}>Chimie, visuellement.</Text>
          </Animated.View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('app.common.introSkip')} onPress={onDone} style={styles.skip}>
          <Text style={styles.skipText}>{t('app.common.introSkip')}</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 210,
    height: 84,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  mark: { alignItems: 'center' },
  markText: {
    fontFamily: font.displayBold,
    fontSize: 40,
    letterSpacing: 3,
    color: colors.ink,
  },
  tagline: { fontFamily: font.display, color: colors.inkSoft, fontSize: 15, marginTop: 10 },
  skip: { position: 'absolute', bottom: 60, padding: 12 },
  skipText: { fontFamily: font.mono, color: colors.inkSoft, fontSize: 12 },
});
