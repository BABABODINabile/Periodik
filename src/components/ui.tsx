import { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import {  font, MAX_CONTENT_WIDTH, radii } from '@/theme/tokens';

/** À appliquer sur la vue racine d'un écran pour le centrer sur les grands formats. */
export const contentWidthStyle = {
  width: '100%',
  maxWidth: MAX_CONTENT_WIDTH,
  alignSelf: 'center',
} as const;

export function ScreenHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 32 : 20) }]}>
      <View style={styles.headerText}>
        <Text style={styles.brand}>PÉRIODIK</Text>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function BackHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.backHeader, { paddingTop: insets.top + (Platform.OS === 'ios' ? 32 : 20) }]}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('app.common.back')}>
        <Feather name="arrow-left" size={22} color={colors.ink} />
      </Pressable>
      <View style={styles.backTitleWrap}>
        <Text style={styles.backBrand}>PÉRIODIK</Text>
        <Text style={styles.backTitle}>{title}</Text>
      </View>
      <View style={styles.backRight}>{right}</View>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Pill({
  label,
  active,
  dot,
  onPress,
}: {
  label: string;
  active?: boolean;
  dot?: string;
  onPress?: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      hitSlop={6}
      onPress={onPress}
      style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}
    >
      {!!dot && <View style={[styles.pillDot, { backgroundColor: dot }]} />}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function ToolNote({
  label,
  children,
  tone = 'info',
}: {
  label: string;
  children: ReactNode;
  tone?: 'info' | 'limit';
}) {
  const styles = useStyles();
  return (
    <View style={[styles.toolNote, tone === 'limit' && styles.toolNoteLimit]}>
      <Text style={styles.toolNoteLabel}>{label}</Text>
      <Text style={styles.toolNoteText}>{children}</Text>
    </View>
  );
}

export function ScrollCue({ label }: { label: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.scrollCue} pointerEvents="none" accessible={false}>
      <Feather name="chevron-down" size={14} color={colors.inkSoft} />
      <Text style={styles.scrollCueText}>{label}</Text>
    </View>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const TABS = [
  { href: '/', key: 'app.nav.table', icon: 'grid' },
  { href: '/ions', key: 'app.nav.ions', icon: 'plus-circle' },
  { href: '/outils', key: 'app.nav.tools', icon: 'sliders' },
  { href: '/quiz', key: 'app.nav.quiz', icon: 'help-circle' },
] as const;

export function BottomNav() {
  const { colors } = useTheme();
  const styles = useStyles();
  const pathname = usePathname();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingBottom: insets.bottom || 20 }]}>
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Pressable
            key={tab.href}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => router.push(tab.href as never)}
            style={styles.navItem}
          >
            <Feather name={tab.icon as never} size={22} color={active ? colors.accent : colors.inkSoft} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{t(tab.key)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  headerText: { flex: 1 },
  brand: { fontFamily: font.mono, fontSize: 10, letterSpacing: 2.5, color: colors.accent, marginBottom: 6 },
  eyebrow: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkSoft,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { marginTop: 4, fontFamily: font.displayBold, fontSize: 30, letterSpacing: -0.6, color: colors.ink },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 18,
    minHeight: 64,
  },
  backTitleWrap: { flex: 1 },
  backBrand: { fontFamily: font.mono, fontSize: 9, letterSpacing: 2, color: colors.accent },
  backTitle: { fontFamily: font.display, fontSize: 17, color: colors.ink },
  backRight: { minWidth: 24, alignItems: 'flex-end' },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.inkSoft,
    textTransform: 'uppercase',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: colors.card, borderColor: colors.card },
  pillIdle: { backgroundColor: 'transparent', borderColor: colors.inkFaint },
  pillText: { fontFamily: font.display, fontSize: 14, color: colors.ink },
  pillTextActive: { color: colors.onCard },
  pillDot: { width: 10, height: 10, borderRadius: 2 },
  statCard: {
    flex: 1,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, color: colors.inkSoft },
  statValue: { marginTop: 4, fontFamily: font.displayBold, fontSize: 17, color: colors.ink },
  toolNote: {
    marginTop: 22,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  toolNoteLimit: { borderLeftColor: colors.lineStrong },
  toolNoteLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, color: colors.inkSoft },
  toolNoteText: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft, lineHeight: 20, marginTop: 6 },
  scrollCue: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  scrollCueText: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.paper,
    paddingTop: 12,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52 },
  navLabel: { fontFamily: font.display, fontSize: 12, fontWeight: '500', color: colors.inkSoft },
  navLabelActive: { color: colors.accent, fontFamily: font.displayBold },
});
