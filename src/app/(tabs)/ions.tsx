import {useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { IonSheet, type IonDetails } from '@/components/IonSheet';
import { contentWidthStyle, ScreenHeader, ScrollCue, SectionLabel } from '@/components/ui';
import {
  baseFormula,
  ionDisplayName,
  ionsReference,
  type IonKind,
  type IonReference,
} from '@/data/ionsReference';
import { useSettings } from '@/store/settings';
import {  font, radii } from '@/theme/tokens';

const SUP_DIGITS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
};

const FLAME_COLORS: Record<string, string> = {
  'Li⁺': '#C53A16',
  'Na⁺': '#E8A317',
  'K⁺': '#A77BC4',
  'Ca²⁺': '#B4472B',
  'Ba²⁺': '#7F9E3C',
  'Cu²⁺': '#2E9E7A',
  'Ag⁺': '#B9B4A4',
};

function chargeFromFormula(formula: string): number {
  const match = formula.match(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/);
  if (!match) return 0;
  const digits = match[1].split('').map((digit) => SUP_DIGITS[digit]).join('');
  const magnitude = digits ? parseInt(digits, 10) : 1;
  return match[2] === '⁻' ? -magnitude : magnitude;
}

export default function IonsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const locale = useSettings((state) => state.locale);
  const [segment, setSegment] = useState<'Monatomic' | 'Polyatomic'>('Monatomic');
  const [activeFormula, setActiveFormula] = useState<string | null>(null);
  const [atBottom, setAtBottom] = useState(false);

  const kinds: IonKind[] = segment === 'Monatomic' ? ['cation', 'anion'] : ['polycation', 'oxoanion', 'organic'];
  const list: IonReference[] = ionsReference.filter((ion) => kinds.includes(ion.k));
  const active = list.find((ion) => ion.f === activeFormula) ?? null;

  const sheetIon: IonDetails | null = active
    ? {
        symbol: baseFormula(active.f),
        charge: `${chargeFromFormula(active.f) > 0 ? '+' : '-'}${Math.abs(chargeFromFormula(active.f)) || 1}`,
        name: ionDisplayName(active, locale),
        groupName: t(`app.ions.families.${active.k}`),
        flame: FLAME_COLORS[active.f]
          ? { fr: t(`app.ions.flames.${active.f}`), hex: FLAME_COLORS[active.f] }
          : undefined,
      }
    : null;

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <ScreenHeader eyebrow={t('app.ions.eyebrow')} title={t('app.ions.title')} />

      <View style={styles.segment} accessibilityRole="tablist">
        {(['Monatomic', 'Polyatomic'] as const).map((key) => (
          <Text
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: segment === key }}
            onPress={() => {
              setSegment(key);
              setActiveFormula(null);
            }}
            style={[styles.segmentItem, segment === key && styles.segmentActive]}
          >
            {key === 'Monatomic' ? t('app.ions.monatomic') : t('app.ions.polyatomic')}
          </Text>
        ))}
      </View>

      <View style={styles.listWrap}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            setAtBottom(contentOffset.y + layoutMeasurement.height >= contentSize.height - 8);
          }}
          scrollEventThrottle={32}
        >
          <View style={styles.listHeader}>
            <SectionLabel>{list.length} IONS</SectionLabel>
            <Text style={styles.hint}>{t('app.ions.hint')}</Text>
          </View>
          {list.map((ion) => {
            const charge = chargeFromFormula(ion.f);
            const flameColor = FLAME_COLORS[ion.f];
            const flameLabel = flameColor ? t(`app.ions.flames.${ion.f}`) : undefined;
            return (
              <Pressable
                key={ion.f}
                accessibilityRole="button"
                accessibilityState={{ selected: activeFormula === ion.f }}
                accessibilityLabel={`${ionDisplayName(ion, locale)}, ${charge > 0 ? t('app.ions.cation') : t('app.ions.anion')}, ${ion.l === 'L' ? t('app.common.lycée') : t('app.common.university')}${flameLabel ? `, ${t('app.ions.flame')} ${flameLabel}` : ''}. ${t('app.ions.open')}`}
                hitSlop={4}
                onPress={() => setActiveFormula(ion.f)}
                style={[styles.row, activeFormula === ion.f && styles.rowActive]}
              >
                <View style={[styles.rowDot, { backgroundColor: flameColor ?? colors.lineStrong }]} />
                <View style={styles.rowMain}>
                  <Text style={styles.rowSymbol}>{ion.f}</Text>
                  <Text style={styles.rowName} numberOfLines={1}>{ionDisplayName(ion, locale)}</Text>
                </View>
                <Text style={styles.rowFlame} numberOfLines={1}>
                  {flameLabel ?? (ion.l === 'L' ? t('app.common.lycée') : t('app.common.university'))}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {!atBottom && <ScrollCue label={t('app.ions.scroll')} />}
      </View>

      <IonSheet
        visible={!!active}
        ion={sheetIon}
        reference={active ? { ...active, n: ionDisplayName(active, locale) } : undefined}
        onClose={() => setActiveFormula(null)}
      />
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    borderRadius: radii.control,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 11,
    fontFamily: font.display,
    fontSize: 14,
    color: colors.ink,
    borderRadius: 7,
  },
  segmentActive: { backgroundColor: colors.card, color: colors.onCard, fontFamily: font.displayBold },
  listWrap: { flex: 1, position: 'relative' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 60 },
  listHeader: { marginBottom: 8 },
  hint: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft, marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderRadius: radii.control,
  },
  rowActive: { backgroundColor: colors.paperLight, borderLeftWidth: 3, borderLeftColor: colors.accent },
  rowDot: { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  rowMain: { flex: 1, minWidth: 0 },
  rowSymbol: { fontFamily: font.displayBold, fontSize: 20, color: colors.ink },
  rowName: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  rowFlame: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft, maxWidth: 96, textAlign: 'right' },
});
