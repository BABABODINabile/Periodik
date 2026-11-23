import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
  type View as RNView,
} from 'react-native';

import { PeriodicTableExport } from '@/components/PeriodicTableExport';
import { exportViewAsImage } from '@/lib/exportImage';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { Pill, ScreenHeader } from '@/components/ui';
import { allElements, getLocalizedName } from '@/lib/elements';
import { useSettings } from '@/store/settings';
import { categoryColors, categoryLabelKeys, legendCategories } from '@/theme/categories';
import {  font, MAX_TABLE_WIDTH, radii } from '@/theme/tokens';

const CELL_W = 35;
const CELL_H = 46;
const GAP = 3;
const ROW_LABEL = 26;
const GRID_LEFT = ROW_LABEL + 8;
const GRID_W = GRID_LEFT + 18 * CELL_W + 17 * GAP;
const GRID_H = 20 + 7 * (CELL_H + GAP) + 16 + GAP + 8 + 2 * (CELL_H + GAP);

export default function TableScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const locale = useSettings((state) => state.locale);
  const setLocale = useSettings((state) => state.setLocale);
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_TABLE_WIDTH);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const gridRef = useRef<ScrollViewInstance>(null);
  const exportRef = useRef<RNView>(null);

  const normalized = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalized) return null;
    return new Set(
      allElements
        .filter((element) =>
          getLocalizedName(element, locale).toLowerCase().includes(normalized) ||
          element.symbol.toLowerCase().includes(normalized) ||
          String(element.number) === normalized,
        )
        .map((element) => element.number),
    );
  }, [normalized, locale]);

  const rows = useMemo(() => {
    const map = new Map<number, typeof allElements>();
    allElements.forEach((element) => {
      const list = map.get(element.row) ?? [];
      list.push(element);
      map.set(element.row, list);
    });
    return map;
  }, []);

  return (
    <View style={[styles.screen, styles.tableRoot]}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <ScreenHeader
          eyebrow={t('app.table.eyebrow')}
          title={t('app.table.title')}
          right={
            <View style={styles.headerActions}>
              <View style={styles.langSwitch}>
                {(['fr', 'en'] as const).map((code) => (
                  <Pressable
                    key={code}
                    accessibilityRole="button"
                    accessibilityLabel={t('aria.changeLanguage')}
                    accessibilityState={{ selected: locale === code }}
                    hitSlop={8}
                    onPress={() => setLocale(code)}
                    style={[styles.langButton, locale === code && styles.langButtonActive]}
                  >
                    <Text style={[styles.langText, locale === code && styles.langTextActive]}>
                      {code.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('app.table.export')}
                hitSlop={8}
                onPress={() => void exportViewAsImage(exportRef, 'periodik-tableau')}
                style={styles.exportButton}
              >
                <Feather name="download" size={18} color={colors.ink} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('app.common.theme')} : ${t(
                  mode === 'light' ? 'app.common.themeLight' : mode === 'dark' ? 'app.common.themeDark' : 'app.common.themeSystem',
                )}`}
                hitSlop={8}
                onPress={() => setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light')}
                style={styles.exportButton}
              >
                <Feather
                  name={mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'smartphone'}
                  size={18}
                  color={colors.ink}
                />
              </Pressable>
            </View>
          }
        />

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Feather name="search" size={20} color={colors.inkSoft} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('app.table.search')}
              placeholderTextColor={colors.inkSoft}
              style={styles.searchInput}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app.table.compare')}
            hitSlop={6}
            onPress={() => router.push('/comparer')}
            style={styles.compareButton}
          >
            <Feather name="bar-chart-2" size={20} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          style={styles.filters}
        >
          <Pill label={t('app.table.all')} active={!category} onPress={() => setCategory(null)} />
          {legendCategories.map((name) => (
            <Pill
              key={name}
              label={t(categoryLabelKeys[name] ?? '')}
              dot={categoryColors[name]}
              active={category === name}
              onPress={() => setCategory(category === name ? null : name)}
            />
          ))}
        </ScrollView>

        <View style={styles.scrollControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app.table.goBegin')}
            hitSlop={6}
            onPress={() => gridRef.current?.scrollTo({ x: 0, animated: true })}
            style={[styles.scrollButton, offsetX <= 1 && styles.scrollButtonDisabled]}
          >
            <Feather name="chevron-left" size={14} color={colors.inkSoft} />
            <Text style={styles.scrollButtonText}>{t('app.table.begin')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app.table.goEnd')}
            hitSlop={6}
            onPress={() => gridRef.current?.scrollTo({ x: GRID_W, animated: true })}
            style={styles.scrollButton}
          >
            <Text style={styles.scrollButtonText}>{t('app.table.end')}</Text>
            <Feather name="chevron-right" size={14} color={colors.inkSoft} />
          </Pressable>
        </View>

        <View style={styles.axisHeader}>
          <Text style={styles.axisLabel}>{t('app.table.period')}</Text>
          <Text style={styles.axisLabel}>{t('app.table.group')}</Text>
        </View>

        <View style={[styles.gridArea, { height: GRID_H }]}>
          <View
            style={[
              styles.rowNumbers,
              contentWidth > GRID_W + 40 && { left: (contentWidth - GRID_W) / 2 },
            ]}
            pointerEvents="none"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
              <Text key={row} style={[styles.rowNumber, { top: (row - 1) * (CELL_H + GAP) + 17 }]}>
                {row}
              </Text>
            ))}
          </View>
          <ScrollView
            ref={gridRef}
            horizontal
            showsHorizontalScrollIndicator
            nestedScrollEnabled
            contentOffset={{ x: 0, y: 0 }}
            onScroll={(event) => setOffsetX(event.nativeEvent.contentOffset.x)}
            scrollEventThrottle={32}
            contentContainerStyle={[
              styles.gridContent,
              contentWidth > GRID_W + 40 && styles.gridContentCentered,
            ]}
          >
            <View style={styles.gridInner}>
              <View style={styles.headerRow}>
                <View style={styles.gutter} />
                {Array.from({ length: 18 }, (_, index) => (
                  <Text key={index} style={styles.columnNumber}>
                    {index + 1}
                  </Text>
                ))}
              </View>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((rowNumber) => (
                <View
                  key={rowNumber}
                  style={[styles.row, rowNumber === 8 && styles.rowGap, rowNumber === 9 && styles.rowFBlock]}
                >
                  {rowNumber !== 8 && <View style={styles.gutter} />}
                  {Array.from({ length: 18 }, (_, columnIndex) => {
                    const element = (rows.get(rowNumber) ?? []).find((item) => item.column === columnIndex + 1);
                    if (!element) return <View key={`slot-${columnIndex}`} style={styles.cellSlot} />;
                    const dimmed =
                      (matches !== null && !matches.has(element.number)) ||
                      (category !== null && element.category !== category);
                    const isPlaceholder = typeof element.number !== 'number';
                    return (
                      <View key={`${element.number}-${element.symbol}`} style={styles.cellSlot}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${getLocalizedName(element, locale)}, ${element.number}`}
                          hitSlop={2}
                          onPress={() =>
                            router.push(
                              `/element/${isPlaceholder ? (element.series === 'actinide' ? 89 : 57) : element.number}`,
                            )
                          }
                          style={[
                            styles.cell,
                            { backgroundColor: categoryColors[element.category] },
                            dimmed && styles.dimmed,
                          ]}
                        >
                          <Text style={styles.cellNumber}>{element.number}</Text>
                          <Text style={[styles.cellSymbol, isPlaceholder && styles.cellSymbolCompact]}>
                            {element.symbol}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ))}
              <View style={styles.rightEdge} />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.offscreen} pointerEvents="none">
        <PeriodicTableExport exportRef={exportRef} />
      </View>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  tableRoot: { width: '100%', maxWidth: MAX_TABLE_WIDTH, alignSelf: 'center' },
  page: { flex: 1 },
  pageContent: { paddingBottom: 120 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exportButton: { width: 36, height: 36, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  offscreen: { position: 'absolute', left: -10000, top: 0, opacity: 1 },
  langSwitch: { flexDirection: 'row', borderWidth: 1, borderColor: colors.lineStrong, borderRadius: radii.pill, padding: 2 },
  langButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill },
  langButtonActive: { backgroundColor: colors.card },
  langText: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  langTextActive: { color: colors.onCard },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    borderRadius: radii.control,
  },
  searchInput: { flex: 1, fontFamily: font.display, fontSize: 15, color: colors.ink },
  compareButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: { flexGrow: 0, height: 50, paddingHorizontal: 20, gap: 8, marginBottom: 6 },
  scrollControls: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  scrollButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 6 },
  scrollButtonDisabled: { opacity: 0.4 },
  scrollButtonText: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  axisHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 4 },
  axisLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.6, color: colors.inkSoft },
  gridArea: { position: 'relative' },
  rowNumbers: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: ROW_LABEL,
    zIndex: 2,
    bottom: 0,
    backgroundColor: colors.paper,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  rowNumber: { position: 'absolute', width: ROW_LABEL, textAlign: 'center', fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  headerRow: { flexDirection: 'row', height: 20 },
  gutter: { width: GRID_LEFT },
  columnNumber: { width: CELL_W, marginRight: GAP, fontFamily: font.mono, fontSize: 10, color: colors.inkSoft, textAlign: 'center' },
  cellSlot: { width: CELL_W, height: CELL_H, marginRight: GAP },
  row: { flexDirection: 'row', height: CELL_H, marginBottom: GAP },
  rowGap: { height: 16, marginBottom: GAP },
  rowFBlock: { marginTop: 8 },
  cell: { width: CELL_W, height: CELL_H, borderRadius: radii.cell, paddingTop: 4, paddingLeft: 4 },
  dimmed: { opacity: 0.22 },
  cellNumber: { fontFamily: font.mono, fontSize: 9, color: colors.onCategory },
  cellSymbol: { fontFamily: font.displayBold, fontSize: 17, color: colors.onCategory, lineHeight: 22 },
  cellSymbolCompact: { fontSize: 10, lineHeight: 11 },
  gridInner: { position: 'relative', width: GRID_W + 8 },
  rightEdge: {
    position: 'absolute',
    left: GRID_W,
    top: 0,
    bottom: 0,
    width: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
  },
  gridContent: { width: GRID_W + 8 },
  gridContentCentered: { flexGrow: 1, justifyContent: 'center' },
});
