/* eslint-disable react-hooks/immutability -- La shared value Reanimated est mutable par conception. */
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useEffect, useMemo } from 'react';

import { SectionLabel } from '@/components/ui';
import type { IonReference } from '@/data/ionsReference';
import {  font, radii } from '@/theme/tokens';

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

export interface IonDetails {
  symbol: string;
  charge: string;
  name: string;
  groupName: string;
  flame?: { fr: string; hex: string };
}

function chargeNumber(charge: string): number {
  const digits = charge.replace(/[^0-9]/g, '');
  const magnitude = digits ? parseInt(digits, 10) : 1;
  return charge.includes('-') ? -magnitude : magnitude;
}

function superscript(value: number): string {
  const sign = value > 0 ? '⁺' : '⁻';
  const magnitude = Math.abs(value);
  return magnitude === 1 ? sign : `${String(magnitude).split('').map((d) => SUP[d]).join('')}${sign}`;
}

function subscript(value: number): string {
  return String(value).split('').map((d) => SUB[d]).join('');
}

export function IonSheet({
  visible,
  ion,
  reference,
  onClose,
}: {
  visible: boolean;
  ion: IonDetails | null;
  reference?: IonReference;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const translateY = useSharedValue(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) translateY.value = 0;
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const dismiss = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 90 || event.velocityY > 800) {
        translateY.value = withTiming(700, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    })
    .runOnJS(false);

  if (!ion) return null;

  const charge = chargeNumber(ion.charge);
  const counter = charge > 0 ? 'Cl' : 'Na';
  const counterSymbol = charge > 0 ? 'Cl⁻' : 'Na⁺';
  const count = Math.abs(charge) || 1;
  const label = `${ion.symbol}${superscript(charge)}`;
  const compound = charge > 0
    ? `${ion.symbol}${counter}${count > 1 ? subscript(count) : ''}`
    : `${counter}${count > 1 ? subscript(count) : ''}${ion.symbol}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('app.ions.closeSheet')} onPress={onClose} style={styles.backdrop} />
        <GestureDetector gesture={dismiss}>
          <Animated.View
            style={[styles.sheet, animatedStyle]}
            accessible
            accessibilityViewIsModal
            accessibilityLabel={`${t('app.ions.title')} · ${ion.name}`}
          >
            <View style={styles.handleArea}>
              <View style={styles.handle} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('app.ions.closeSheet')}
                hitSlop={10}
                onPress={onClose}
                style={styles.close}
              >
                <Feather name="x" size={18} color={colors.inkSoft} />
              </Pressable>
            </View>

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.symbol}>{label}</Text>
                <Text style={styles.name}>{ion.name.toLowerCase()}</Text>
                <Text style={styles.meta}>{ion.groupName}</Text>
              </View>
              <View style={[styles.orb, { borderColor: ion.flame?.hex ?? colors.lineStrong }]}>
                <View style={[styles.orbCore, { backgroundColor: ion.flame?.hex ?? colors.lineStrong }]} />
              </View>
            </View>

            <View style={styles.calc}>
              <SectionLabel>{t('app.ions.chargeCalc')}</SectionLabel>
              <View style={styles.equation}>
                <View style={styles.term}>
                  <Text style={styles.termValue}>{label}</Text>
                  <Text style={styles.termCount}>× 1</Text>
                </View>
                <Text style={styles.operator}>+</Text>
                <View style={styles.term}>
                  <Text style={styles.termValue}>{counterSymbol}</Text>
                  <Text style={styles.termCount}>× {count}</Text>
                </View>
                <Text style={styles.operator}>→</Text>
                <View style={styles.resultTerm}>
                  <Text style={styles.resultValue}>{compound}</Text>
                  <Text style={styles.resultCount}>{t('app.ions.neutral')}</Text>
                </View>
              </View>

              <View style={styles.balance}>
                <Text style={styles.balanceLabel}>{t('app.ions.balance')}</Text>
                <Text style={styles.balanceValue}>
                  {charge > 0 ? `+${charge}` : charge} + {charge > 0 ? -count : count} = 0
                </Text>
              </View>

              <Text style={styles.note}>
                {compound} {t('app.ions.soluble')}
                {ion.flame ? ` ${t('app.ions.flame')} : ${ion.flame.fr}.` : ''}
              </Text>

              {reference && (
                <View style={styles.reference}>
                  <SectionLabel>
                    {t('app.ions.official')} · {reference.l === 'L' ? t('app.common.lycée') : t('app.common.university')}
                  </SectionLabel>
                  <Text style={styles.referenceEquation}>{reference.e}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(21,20,15,0.45)',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 104,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handleArea: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -4,
  },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.lineStrong },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  headerLeft: { flex: 1, minWidth: 0 },
  symbol: { fontFamily: font.displayBold, fontSize: 40, color: colors.ink, lineHeight: 44 },
  name: { fontFamily: font.display, fontSize: 16, color: colors.ink, marginTop: 2 },
  meta: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft, marginTop: 3 },
  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  orbCore: { width: 34, height: 34, borderRadius: 17, opacity: 0.9 },
  close: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLight,
  },
  calc: {},
  equation: { flexDirection: 'row', alignItems: 'stretch', gap: 6, marginTop: 10 },
  term: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  termValue: { fontFamily: font.displayBold, fontSize: 18, color: colors.ink },
  termCount: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft, marginTop: 4 },
  operator: { alignSelf: 'center', fontFamily: font.display, fontSize: 18, color: colors.inkSoft },
  resultTerm: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.card,
    borderRadius: radii.control,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  resultValue: { fontFamily: font.displayBold, fontSize: 18, color: colors.onCard },
  resultCount: { fontFamily: font.mono, fontSize: 11, color: colors.salmon, marginTop: 4 },
  balance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  balanceLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.6, color: colors.inkSoft },
  balanceValue: { fontFamily: font.mono, fontSize: 13, color: colors.accent },
  note: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft, marginTop: 14, lineHeight: 19 },
  reference: {
    marginTop: 18,
    padding: 14,
    borderRadius: radii.control,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.line,
  },
  referenceEquation: {
    marginTop: 10,
    fontFamily: font.mono,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
  },
});
