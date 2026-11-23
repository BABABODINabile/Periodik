import { StyleSheet, Text, View } from 'react-native';

import { allElements, getLocalizedName } from '@/lib/elements';
import { categoryColors } from '@/theme/categories';
import { colors, font } from '@/theme/tokens';

const CELL_W = 66;
const CELL_H = 84;
const GAP = 4;
const LABEL = 58;
const PAGE_W = 1400;

const LEGEND: { label: string; color: string }[] = [
  { label: 'Métal alcalin', color: categoryColors['Alkali Metal'] },
  { label: 'Alcalino-terreux', color: categoryColors['Alkaline Earth Metal'] },
  { label: 'Transition', color: categoryColors['Transition Metal'] },
  { label: 'Post-transition', color: categoryColors['Post-transition Metal'] },
  { label: 'Métalloïde', color: categoryColors['Metalloid'] },
  { label: 'Autre non-métal', color: categoryColors['Other nonmetal'] },
  { label: 'Halogène', color: categoryColors['Halogen'] },
  { label: 'Gaz noble', color: categoryColors['Noble Gas'] },
  { label: 'Lanthanides', color: categoryColors['Lanthanide'] },
  { label: 'Actinides', color: categoryColors['Actinide'] },
];

export function PeriodicTableExport({ exportRef }: { exportRef: { current: unknown } }) {
  const rows = new Map<number, typeof allElements>();
  allElements.forEach((element) => {
    const list = rows.get(element.row) ?? [];
    list.push(element);
    rows.set(element.row, list);
  });

  return (
    <View ref={exportRef as never} collapsable={false} style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>PÉRIODIK</Text>
          <Text style={styles.title}>Tableau périodique des éléments</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.meta}>118 ÉLÉMENTS · 18 GROUPES · 7 PÉRIODES</Text>
          <Text style={styles.sub}>Données : Zperiod © 2026 Philip Zhao · MIT</Text>
        </View>
      </View>

      <View style={styles.columnHead}>
        <View style={{ width: LABEL }} />
        {Array.from({ length: 18 }, (_, index) => (
          <Text key={index} style={styles.columnNumber}>
            {index + 1}
          </Text>
        ))}
      </View>

      {Array.from({ length: 10 }, (_, index) => index + 1).map((rowNumber) => (
        <View
          key={rowNumber}
          style={[styles.row, rowNumber === 8 && styles.rowGap, rowNumber === 9 && styles.fBlock]}
        >
          {rowNumber !== 8 && <View style={{ width: LABEL }} />}
          {rowNumber !== 8 &&
            Array.from({ length: 18 }, (_, columnIndex) => {
              const element = (rows.get(rowNumber) ?? []).find((item) => item.column === columnIndex + 1);
              if (!element) return <View key={`empty-${columnIndex}`} style={styles.cellEmpty} />;
              return (
                <View
                  key={`${element.number}-${element.symbol}`}
                  style={[styles.cell, { backgroundColor: categoryColors[element.category] ?? colors.line }]}
                >
                  <Text style={styles.number}>{element.number}</Text>
                  <Text style={styles.symbol}>{element.symbol}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {getLocalizedName(element, 'fr')}
                  </Text>
                </View>
              );
            })}
        </View>
      ))}

      <View style={styles.legend}>
        {LEGEND.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>PÉRIODIK · Support d’apprentissage de chimie</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: PAGE_W,
    backgroundColor: colors.paper,
    padding: 48,
    paddingBottom: 36,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 },
  brand: { fontFamily: font.mono, fontSize: 16, letterSpacing: 3, color: colors.accent },
  title: { fontFamily: font.displayBold, fontSize: 36, color: colors.ink, marginTop: 6 },
  headerRight: { alignItems: 'flex-end' },
  meta: { fontFamily: font.mono, fontSize: 12, color: colors.inkSoft },
  sub: { fontFamily: font.mono, fontSize: 10, color: colors.inkFaint, marginTop: 5 },
  columnHead: { flexDirection: 'row', height: 26 },
  columnNumber: { width: CELL_W, marginRight: GAP, textAlign: 'center', fontFamily: font.mono, fontSize: 12, color: colors.inkSoft },
  row: { flexDirection: 'row', height: CELL_H, marginBottom: GAP },
  rowGap: { height: 20, marginBottom: GAP },
  fBlock: { marginTop: 16 },
  cell: { width: CELL_W, height: CELL_H, marginRight: GAP, borderRadius: 5, padding: 6 },
  cellEmpty: { width: CELL_W, height: CELL_H, marginRight: GAP },
  number: { fontFamily: font.mono, fontSize: 12, color: colors.ink },
  symbol: { fontFamily: font.displayBold, fontSize: 30, color: colors.ink, lineHeight: 34 },
  name: { fontFamily: font.display, fontSize: 10, color: colors.inkSoft },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.line },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 220 },
  legendDot: { width: 14, height: 14, borderRadius: 3 },
  legendText: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft },
  footer: { fontFamily: font.mono, fontSize: 11, color: colors.inkFaint, marginTop: 22 },
});
