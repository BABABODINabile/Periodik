import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { BackHeader, contentWidthStyle, SectionLabel } from '@/components/ui';
import { balanceEquation as rawBalanceEquation } from '@/lib/vendor/equationBalancer';
import {  font, radii } from '@/theme/tokens';

interface BalancedTerm {
  formula: string;
  coefficient: number;
}
interface BalancedResult {
  reactants: BalancedTerm[];
  products: BalancedTerm[];
  formatted: string;
}
const balanceEquation = rawBalanceEquation as (input: string) => BalancedResult;

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

const PRESETS = [
  'H2 + O2 -> H2O',
  'Fe + O2 -> Fe2O3',
  'C3H8 + O2 -> CO2 + H2O',
  'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2',
  'Fe2(SO4)3 + KOH -> Fe(OH)3 + K2SO4',
  'CuSO4•5H2O -> CuSO4 + H2O',
];

function prettyEquation(value: string): string {
  return value
    .replace(/->/g, '→')
    .replace(/(\d)(?=[A-Z])/g, '$1 ')
    .replace(/([A-Za-z\)])(\d)/g, (_, atom: string, digit: string) => `${atom}${SUBSCRIPTS[digit]}`)
    .replace(/([₀-₉])\s+(?=[A-Z])/g, '$1');
}

function atomCounts(formula: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const matches = formula.match(/([A-Z][a-z]?)(\d*)/g) ?? [];
  matches.forEach((token) => {
    const element = token.match(/[A-Z][a-z]?/)?.[0];
    const digits = token.match(/\d+/)?.[0];
    if (!element) return;
    counts[element] = (counts[element] ?? 0) + (digits ? parseInt(digits, 10) : 1);
  });
  return counts;
}

function sideCounts(terms: BalancedTerm[]): Record<string, number> {
  return terms.reduce<Record<string, number>>((acc, term) => {
    const atoms = atomCounts(term.formula);
    Object.entries(atoms).forEach(([element, count]) => {
      acc[element] = (acc[element] ?? 0) + count * term.coefficient;
    });
    return acc;
  }, {});
}

export default function EquilibreurScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [input, setInput] = useState('H2 + O2 -> H2O');

  const state = useMemo(() => {
    try {
      const result = balanceEquation(input);
      const left = sideCounts(result.reactants);
      const right = sideCounts(result.products);
      const elements = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
      const verified = elements.every((element) => (left[element] ?? 0) === (right[element] ?? 0));
      return { result, left, right, elements, verified, error: null as string | null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Équation invalide';
      const ionic = /ionic|charged|ionique/i.test(message);
      return {
        result: null,
        left: {},
        right: {},
        elements: [],
        verified: false,
        error: ionic
          ? t('app.balancer.errorIonic')
          : t('app.balancer.errorSyntax'),
      };
    }
  }, [input, t]);

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <BackHeader title={t('app.nav.tools')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('app.balancer.title')}</Text>

        <View style={styles.fieldBlock}>
          <SectionLabel>{t('app.balancer.equation')}</SectionLabel>
          <TextInput
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('app.balancer.equation')}
            style={styles.input}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
          {PRESETS.map((preset) => (
            <Text
              key={preset}
              accessibilityRole="button"
              accessibilityLabel={`${t('app.balancer.example')} : ${preset}`}
              onPress={() => setInput(preset)}
              style={styles.preset}
            >
              {preset.replace(/(\d)(?=[A-Z])/g, '$1 ')}
            </Text>
          ))}
        </ScrollView>

        {state.error ? (
          <View style={styles.errorCard}>
            <Feather name="alert-circle" size={18} color={colors.accent} />
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        ) : (
          state.result && (
            <>
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultLabel}>{t('app.balancer.balanced')}</Text>
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={12} color={colors.paper} />
                    <Text style={styles.verifiedText}>{t('app.balancer.verified')}</Text>
                  </View>
                </View>
                <Text style={styles.resultValue}>{prettyEquation(state.result.formatted)}</Text>
              </View>

              <View style={styles.checkCard}>
                <SectionLabel>{t('app.balancer.atomCount')}</SectionLabel>
                <View style={styles.checkHead}>
                  <Text style={styles.checkHeadCell}>{t('app.balancer.element')}</Text>
                  <Text style={styles.checkHeadCell}>{t('app.balancer.reactants')}</Text>
                  <Text style={styles.checkHeadCell}>{t('app.balancer.products')}</Text>
                  <Text style={styles.checkHeadCell} />
                </View>
                {state.elements.map((element) => {
                  const left = state.left[element] ?? 0;
                  const right = state.right[element] ?? 0;
                  return (
                    <View key={element} style={styles.checkRow}>
                      <Text style={styles.checkElement}>{element}</Text>
                      <Text style={styles.checkValue}>{left}</Text>
                      <Text style={styles.checkValue}>{right}</Text>
                      <Feather
                        name={left === right ? 'check' : 'x'}
                        size={14}
                        color={colors.accent}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={styles.methodCard}>
                <Feather name="info" size={15} color={colors.inkSoft} />
                <Text style={styles.methodText}>{t('app.balancer.method')}</Text>
              </View>
            </>
          )
        )}
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
  fieldBlock: { marginBottom: 12 },
  input: {
    marginTop: 10,
    height: 48,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    borderRadius: radii.control,
    paddingHorizontal: 14,
    fontFamily: font.mono,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paperLight,
  },
  presets: { flexDirection: 'row', gap: 8, marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 18 },
  preset: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: font.mono,
    fontSize: 11,
    color: colors.inkSoft,
  },
  errorCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.control,
    padding: 14,
    backgroundColor: colors.paperLight,
  },
  errorText: { flex: 1, fontFamily: font.display, fontSize: 13, color: colors.ink, lineHeight: 19 },
  resultCard: { backgroundColor: colors.card, borderRadius: 14, padding: 18, minHeight: 104, justifyContent: 'center' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, color: colors.inkFaint },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedText: { fontFamily: font.mono, fontSize: 9, color: colors.paper },
  resultValue: { fontFamily: font.mono, fontSize: 17, color: colors.onCard, marginTop: 12 },
  checkCard: { marginTop: 18, borderWidth: 1, borderColor: colors.line, borderRadius: radii.control, padding: 14, backgroundColor: colors.paperLight },
  checkHead: { flexDirection: 'row', marginTop: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.line },
  checkHeadCell: { flex: 1, fontFamily: font.mono, fontSize: 10, color: colors.inkSoft },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  checkElement: { flex: 1, fontFamily: font.displayBold, fontSize: 14, color: colors.ink },
  checkValue: { flex: 1, fontFamily: font.mono, fontSize: 13, color: colors.inkSoft },
  methodCard: { flexDirection: 'row', gap: 10, marginTop: 18, alignItems: 'flex-start' },
  methodText: { flex: 1, fontFamily: font.display, fontSize: 12, color: colors.inkSoft, lineHeight: 18 },
});
