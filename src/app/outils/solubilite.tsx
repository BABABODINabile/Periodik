import {useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { BackHeader, contentWidthStyle, ToolNote } from '@/components/ui';
import {  font } from '@/theme/tokens';

const ANIONS = ['NO₃⁻', 'Cl⁻', 'SO₄²⁻', 'OH⁻', 'CO₃²⁻'];
const CATIONS = ['Na⁺', 'Ca²⁺', 'Ag⁺', 'Cu²⁺', 'Ba²⁺', 'Fe³⁺'];

type Solubility = 'S' | 'P' | 'I' | null;

const TABLE: Solubility[][] = [
  ['S', 'S', 'S', 'S', 'S'],
  ['S', 'S', 'P', 'P', 'I'],
  ['S', 'I', 'P', 'I', 'I'],
  ['S', 'S', 'S', 'I', 'I'],
  ['S', 'S', 'I', 'S', 'I'],
  ['S', 'S', 'S', 'I', null],
];

const INFO: Record<string, { name: string; status: string; detail: string }> = {
  'Ag-Cl': {
    name: 'AgCl',
    status: 'INSOLUBLE ↓',
    detail: 'Chlorure d’argent : précipité blanc qui se forme en mélangeant Ag⁺ et Cl⁻.',
  },
  'Ba-SO₄²⁻': {
    name: 'BaSO₄',
    status: 'INSOLUBLE ↓',
    detail: 'Sulfate de baryum : précipité blanc, très peu soluble même en milieu acide.',
  },
  'Fe³⁺-OH⁻': {
    name: 'Fe(OH)₃',
    status: 'INSOLUBLE ↓',
    detail: 'Hydroxyde de fer(III) : précipité brun-rouge caractéristique.',
  },
  default: {
    name: 'NaCl',
    status: 'SOLUBLE',
    detail: 'La plupart des sels de sodium sont solubles dans l’eau à température ambiante.',
  },
};

export default function SolubiliteScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const [selected, setSelected] = useState('Ag-Cl');
  const base = INFO[selected] ?? INFO['default'];
  const infoKey = `app.solubility.info.${selected in INFO ? selected : 'default'}`;
  const info = {
    name: base.name,
    status: t(`${infoKey}.status`),
    detail: t(`${infoKey}.detail`),
  };

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <BackHeader title={t('app.nav.tools')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('app.solubility.title')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <View style={styles.corner} />
              {ANIONS.map((anion) => (
                <Text key={anion} style={styles.columnHeader}>
                  {anion}
                </Text>
              ))}
            </View>
            {CATIONS.map((cation, rowIndex) => (
              <View key={cation} style={styles.row}>
                <Text style={styles.rowHeader}>{cation}</Text>
                {ANIONS.map((anion, columnIndex) => {
                  const value = TABLE[rowIndex][columnIndex];
                  const key = `${cation}-${anion}`;
                  const active = selected === key;
                  return (
                    <Pressable
                      key={anion}
                      accessibilityRole="button"
                      accessibilityLabel={`${cation} ${anion} : ${value ?? 'non renseigné'}`}
                      hitSlop={4}
                      onPress={() => value && setSelected(key)}
                      style={[
                        styles.cell,
                        value === 'I' && styles.cellInsoluble,
                        value === 'P' && styles.cellPartial,
                        active && styles.cellActive,
                      ]}
                    >
                      <Text style={[styles.cellText, value === 'I' && styles.cellTextLight]}>
                        {value ?? '–'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.legend}>
          <Text style={styles.legendItem}>
            <Text style={styles.legendBox}>S</Text> {t('app.solubility.soluble')}
          </Text>
          <Text style={styles.legendItem}>
            <Text style={[styles.legendBox, styles.legendBoxPartial]}>P</Text> {t('app.solubility.partial')}
          </Text>
          <Text style={styles.legendItem}>
            <Text style={[styles.legendBox, styles.legendBoxDark]}>I</Text> {t('app.solubility.insoluble')}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoTop}>
            <Text style={styles.infoName}>{info.name}</Text>
            <Text style={[styles.infoStatus, info.status.includes('INSOLUBLE') && styles.infoStatusWarn]}>
              {info.status}
            </Text>
          </View>
          <Text style={styles.infoDetail}>{info.detail}</Text>
        </View>

        <ToolNote label={t('app.solubility.readLabel')}>{t('app.solubility.read')}</ToolNote>
        <ToolNote label={t('app.solubility.rulesLabel')}>{t('app.solubility.rules')}</ToolNote>
        <ToolNote label={t('app.common.limit')} tone="limit">{t('app.solubility.limits')}</ToolNote>
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
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  corner: { width: 58 },
  columnHeader: { width: 58, textAlign: 'center', fontFamily: font.mono, fontSize: 10, color: colors.inkSoft, paddingBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowHeader: { width: 58, fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  cell: { width: 58, height: 36, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center', borderRadius: 2, marginRight: 4 },
  cellInsoluble: { backgroundColor: colors.card },
  cellPartial: { backgroundColor: colors.line, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.inkSoft },
  cellActive: { borderWidth: 2, borderColor: colors.accent },
  cellText: { fontFamily: font.displayBold, fontSize: 14, color: colors.ink },
  cellTextLight: { color: colors.paper },
  legend: { flexDirection: 'row', gap: 14, marginTop: 18 },
  legendItem: { fontFamily: font.display, fontSize: 12, color: colors.inkSoft },
  legendBox: { fontFamily: font.mono, fontSize: 10, color: colors.ink, backgroundColor: colors.paperLight, paddingHorizontal: 3, borderRadius: 2 },
  legendBoxPartial: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkSoft },
  legendBoxDark: { backgroundColor: colors.card, color: colors.onCard },
  infoCard: { marginTop: 22, backgroundColor: colors.card, borderRadius: 14, padding: 18 },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between' },
  infoName: { fontFamily: font.displayBold, fontSize: 20, color: colors.onCard },
  infoStatus: { fontFamily: font.mono, fontSize: 10, color: colors.salmon },
  infoStatusWarn: { color: colors.salmon },
  infoDetail: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft, lineHeight: 19, marginTop: 10 },
});
