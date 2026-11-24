import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';


import { BackHeader, contentWidthStyle, SectionLabel, ToolNote } from '@/components/ui';
import { atomicMass, parseFormula } from '@/lib/chemistry';
import { colors as staticColors, font, radii } from '@/theme/tokens';

const PRESETS = ['H2O', 'NaCl', 'Ca(OH)2', 'CuSO4·5H2O'];
const BAR_COLORS = [staticColors.ink, staticColors.accent, staticColors.lineStrong, staticColors.inkFaint, staticColors.salmon];

export default function MasseScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const [formula, setFormula] = useState('Ca(OH)2');
  const result = useMemo(() => {
    const atoms = parseFormula(formula);
    const rows = Object.entries(atoms)
      .map(([symbol, count]) => {
        const unit = atomicMass(symbol);
        return { symbol, count, unit, mass: unit * count, share: 0 };
      })
      .filter((row) => row.mass > 0);
    const total = rows.reduce((sum, row) => sum + row.mass, 0);
    rows.forEach((row) => {
      row.share = total > 0 ? row.mass / total : 0;
    });
    return { rows, total };
  }, [formula]);

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <BackHeader title={t('app.nav.tools')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('app.mass.title')}</Text>
        <SectionLabel>{t('app.mass.formula')}</SectionLabel>
        <TextInput
          value={formula}
          onChangeText={setFormula}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
          {PRESETS.map((preset) => (
            <Text
              key={preset}
              accessibilityRole="button"
              onPress={() => setFormula(preset)}
              style={styles.preset}
            >
              {preset.replace(/([A-Za-z\)])(\d)/g, (_, atom: string, digit: string) =>
                `${atom}${'₀₁₂₃₄₅₆₇₈₉'[Number(digit)]}`,
              )}
            </Text>
          ))}
        </ScrollView>

        <Text style={styles.mLabel}>M</Text>
        <View style={styles.bigMass}>
          <Text style={styles.bigValue}>{result.total.toFixed(3).replace('.', ',')}</Text>
          <Text style={styles.bigUnit}>g/mol</Text>
        </View>

        <View style={styles.bar}>
          {result.rows.map((row, index) => (
            <View key={row.symbol} style={[styles.barPart, { flex: row.share, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }]} />
          ))}
        </View>

        <View style={styles.rows}>
          {result.rows.map((row, index) => (
            <View key={row.symbol} style={styles.row}>
              <View style={[styles.rowDot, { backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }]} />
              <Text style={styles.rowSymbol}>{row.symbol}</Text>
              <Text style={styles.rowFormula}>
                {row.count} × {row.unit.toFixed(3).replace('.', ',')}
              </Text>
              <Text style={styles.rowMass}>{row.mass.toFixed(3).replace('.', ',')}</Text>
              <Text style={styles.rowShare}>{(row.share * 100).toFixed(1).replace('.', ',')} %</Text>
            </View>
          ))}
        </View>

        <ToolNote label={t('app.common.how')}>{t('app.mass.how')}</ToolNote>
        <ToolNote label={t('app.common.limit')} tone="limit">{t('app.mass.limits')}</ToolNote>
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
  title: { fontFamily: font.displayBold, fontSize: 30, letterSpacing: -0.6, color: colors.ink, marginBottom: 18 },
  input: {
    marginTop: 10,
    height: 48,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    borderRadius: radii.control,
    paddingHorizontal: 14,
    fontFamily: font.mono,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperLight,
  },
  presets: { flexDirection: 'row', gap: 8, marginTop: 12, marginHorizontal: -20, paddingHorizontal: 20 },
  preset: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkSoft,
  },
  mLabel: { fontFamily: font.mono, fontSize: 12, color: colors.inkSoft, marginTop: 28 },
  bigMass: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 },
  bigValue: { fontFamily: font.displayBold, fontSize: 52, letterSpacing: -2, color: colors.ink },
  bigUnit: { fontFamily: font.display, fontSize: 16, color: colors.inkSoft },
  bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 16, backgroundColor: colors.line },
  barPart: { height: 12 },
  rows: { marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowDot: { width: 9, height: 9, borderRadius: 5 },
  rowSymbol: { fontFamily: font.displayBold, fontSize: 14, color: colors.ink, width: 26 },
  rowFormula: { flex: 1, fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  rowMass: { fontFamily: font.mono, fontSize: 12, color: colors.ink, width: 62, textAlign: 'right' },
  rowShare: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft, width: 56, textAlign: 'right' },
});
