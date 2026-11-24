import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { BackHeader, contentWidthStyle, SectionLabel, ToolNote } from '@/components/ui';
import { atomicMass, formatFormula, formulaMass } from '@/lib/chemistry';
import {  font, radii } from '@/theme/tokens';

interface Component {
  id: number;
  symbol: string;
  percent: string;
}

const DEFAULT: Component[] = [
  { id: 1, symbol: 'C', percent: '46,0' },
  { id: 2, symbol: 'H', percent: '6,7' },
  { id: 3, symbol: 'O', percent: '53,3' },
];

function toNumber(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function integerRatios(values: number[]): number[] {
  const min = Math.min(...values.filter((value) => value > 0));
  if (!Number.isFinite(min) || min === 0) return values.map(() => 0);
  const raw = values.map((value) => value / min);
  for (const multiplier of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]) {
    const scaled = raw.map((value) => value * multiplier);
    const rounded = scaled.map((value) => Math.round(value));
    const error = scaled.reduce((sum, value, index) => sum + Math.abs(value - rounded[index]), 0);
    if (error < 0.12 && rounded.every((value) => value > 0)) return rounded;
  }
  return raw.map((value) => Math.max(1, Math.round(value)));
}

export default function EmpiriqueScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [components, setComponents] = useState<Component[]>(DEFAULT);
  const [molarMass, setMolarMass] = useState('180,16');
  const [nextId, setNextId] = useState(4);

  const result = useMemo(() => {
    const valid = components.filter((item) => item.symbol.trim() && toNumber(item.percent) > 0);
    const masses = valid.map((item) => {
      const atomic = atomicMass(item.symbol.trim());
      return atomic > 0 ? toNumber(item.percent) / atomic : 0;
    });
    const ratios = integerRatios(masses);
    const atoms: Record<string, number> = {};
    valid.forEach((item, index) => {
      atoms[item.symbol.trim()] = ratios[index];
    });
    const empiricalMass = formulaMass(atoms);
    const target = toNumber(molarMass);
    const factor = empiricalMass > 0 && target > 0 ? Math.round(target / empiricalMass) : 0;
    const molecular: Record<string, number> = {};
    if (factor > 0) {
      Object.entries(atoms).forEach(([symbol, count]) => {
        molecular[symbol] = count * factor;
      });
    }
    return {
      moles: masses,
      ratios,
      empirical: formatFormula(atoms),
      empiricalMass,
      molecular: factor > 0 ? formatFormula(molecular) : null,
    };
  }, [components, molarMass]);

  const update = (id: number, patch: Partial<Component>) =>
    setComponents((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <BackHeader title={t('app.nav.tools')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('app.empirical.title')}</Text>
        <SectionLabel>{t('app.empirical.composition')}</SectionLabel>

        <View style={styles.rows}>
          {components.map((component) => (
            <View key={component.id} style={styles.row}>
              <TextInput
                value={component.symbol}
                onChangeText={(symbol) => update(component.id, { symbol })}
                maxLength={3}
                autoCapitalize="characters"
                style={styles.symbolInput}
              />
              <TextInput
                value={component.percent}
                onChangeText={(percent) => update(component.id, { percent })}
                keyboardType="decimal-pad"
                style={styles.percentInput}
              />
              <Text style={styles.percentUnit}>%</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('app.empirical.remove')}
                onPress={() => setComponents((current) => current.filter((item) => item.id !== component.id))}
              >
                <Feather name="x" size={18} color={colors.inkSoft} />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setComponents((current) => [...current, { id: nextId, symbol: '', percent: '' }]);
            setNextId((id) => id + 1);
          }}
          style={styles.add}
        >
          <Feather name="plus" size={16} color={colors.inkSoft} />
          <Text style={styles.addText}>{t('app.empirical.add')}</Text>
        </Pressable>

        <View style={styles.molarBlock}>
          <SectionLabel>{t('app.empirical.molar')}</SectionLabel>
          <TextInput
            value={molarMass}
            onChangeText={setMolarMass}
            keyboardType="decimal-pad"
            style={styles.molarInput}
          />
        </View>

        <View style={styles.result}>
          <Text style={styles.resultLabel}>{t('app.empirical.empiricalFormula')}</Text>
          <Text style={styles.resultValue}>{result.empirical || '—'}</Text>
          {result.molecular && (
            <>
              <Text style={styles.resultLabel}>{t('app.empirical.molecularFormula')}</Text>
              <Text style={styles.resultValue}>{result.molecular}</Text>
            </>
          )}
        </View>

        <View style={styles.steps}>
          <SectionLabel>{t('app.empirical.steps')}</SectionLabel>
          <Text style={styles.step}>
            1. n = m / M · {result.moles.map((value) => value.toFixed(3).replace('.', ',')).join(' · ')}
          </Text>
          <Text style={styles.step}>
            2. Rapports · {result.ratios.join(' : ')}
          </Text>
          <Text style={styles.step}>
            3. Masse empirique · {result.empiricalMass.toFixed(3).replace('.', ',')} g/mol
          </Text>
        </View>

        <ToolNote label={t('app.common.how')}>{t('app.empirical.how')}</ToolNote>
        <ToolNote label={t('app.common.limit')} tone="limit">{t('app.empirical.limits')}</ToolNote>
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
  rows: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  symbolInput: {
    width: 64,
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    backgroundColor: colors.paperLight,
    paddingHorizontal: 12,
    fontFamily: font.displayBold,
    fontSize: 15,
    color: colors.ink,
  },
  percentInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    backgroundColor: colors.paperLight,
    paddingHorizontal: 12,
    fontFamily: font.mono,
    fontSize: 14,
    color: colors.ink,
  },
  percentUnit: { fontFamily: font.mono, fontSize: 13, color: colors.inkSoft },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  addText: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft },
  molarBlock: { marginTop: 24 },
  molarInput: {
    marginTop: 10,
    height: 44,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    borderRadius: radii.control,
    backgroundColor: colors.paperLight,
    paddingHorizontal: 12,
    fontFamily: font.mono,
    fontSize: 14,
    color: colors.ink,
  },
  result: { marginTop: 24, backgroundColor: colors.card, borderRadius: 14, padding: 18 },
  resultLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, color: colors.inkFaint, marginTop: 8 },
  resultValue: { fontFamily: font.displayBold, fontSize: 28, color: colors.onCard, marginTop: 2 },
  steps: { marginTop: 24 },
  step: { fontFamily: font.mono, fontSize: 12, color: colors.inkSoft, marginTop: 8, lineHeight: 18 },
});
