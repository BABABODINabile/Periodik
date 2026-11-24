import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import {useState, useMemo } from 'react';

import { BackHeader, contentWidthStyle, SectionLabel } from '@/components/ui';
import { findElement, getDetail, getLocalizedName } from '@/lib/elements';
import { useSettings } from '@/store/settings';
import { colors as staticColors, font, radii } from '@/theme/tokens';

const PRESETS = [26, 29, 13, 6, 8, 79, 47, 82];
const BAR_COLORS = [staticColors.ink, staticColors.accent, staticColors.lineStrong];

const METRICS: { key: string; labelKey: string; unit: string }[] = [
  { key: 'density', labelKey: 'app.compare.density', unit: 'g/cm³' },
  { key: 'meltingPoint', labelKey: 'app.compare.fusion', unit: '°C' },
  { key: 'boilingPoint', labelKey: 'app.compare.boiling', unit: '°C' },
  { key: 'electronegativity', labelKey: 'app.compare.electronegativity', unit: 'Pauling' },
];

function numeric(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ComparerScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const locale = useSettings((state) => state.locale);
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>([26, 29, 13]);

  const elements = selected.map((number) => findElement(number)).filter(Boolean);
  const toggle = (number: number) =>
    setSelected((current) =>
      current.includes(number)
        ? current.filter((item) => item !== number)
        : current.length < 3
          ? [...current, number]
          : [...current.slice(1), number],
    );

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <BackHeader title={t('app.compare.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel>{elements.length} {t('app.compare.elements')}</SectionLabel>
        <Text style={styles.title}>{t('app.compare.title')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cards}>
          {PRESETS.map((number) => {
            const element = findElement(number);
            if (!element) return null;
            const index = selected.indexOf(number);
            const active = index >= 0;
            return (
              <Pressable
                key={number}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => toggle(number)}
                style={[styles.card, active && { borderColor: BAR_COLORS[index] ?? colors.accent, borderTopWidth: 3 }]}
              >
                <Text style={styles.cardSymbol}>{element.symbol}</Text>
                <Text style={styles.cardName}>{getLocalizedName(element, locale)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {METRICS.map((metric) => {
          const values = elements.map((element) => ({
            element,
            value: numeric(getDetail(element!.number)?.level3_properties?.physical?.[metric.key]),
          }));
          const max = Math.max(...values.map((item) => item.value), 1);
          return (
            <View key={metric.key} style={styles.metric}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{t(metric.labelKey)}</Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </View>
              {values.map((item, index) => (
                <View key={item.element!.number} style={styles.barRow}>
                  <Text style={styles.barSymbol}>{item.element!.symbol}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(3, (item.value / max) * 100)}%`, backgroundColor: BAR_COLORS[index] },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>
                    {item.value.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { fontFamily: font.displayBold, fontSize: 30, letterSpacing: -0.6, color: colors.ink, marginBottom: 14 },
  cards: { flexDirection: 'row', gap: 8, marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 26 },
  card: { width: 108, height: 84, borderWidth: 1, borderColor: colors.line, borderRadius: radii.control, padding: 12, backgroundColor: colors.paperLight },
  cardSymbol: { fontFamily: font.displayBold, fontSize: 22, color: colors.ink },
  cardName: { fontFamily: font.display, fontSize: 12, color: colors.inkSoft, marginTop: 4 },
  metric: { marginBottom: 26 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metricLabel: { fontFamily: font.displayBold, fontSize: 15, color: colors.ink },
  metricUnit: { fontFamily: font.mono, fontSize: 10, color: colors.inkSoft },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barSymbol: { width: 22, fontFamily: font.mono, fontSize: 11, color: colors.ink },
  barTrack: { flex: 1, height: 10, backgroundColor: colors.line, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 58, textAlign: 'right', fontFamily: font.mono, fontSize: 11, color: colors.ink },
});
