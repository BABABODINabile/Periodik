import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';
import { useMemo, useRef, useState } from 'react';
import type { View as RNView } from 'react-native';

import { ElementSheetExport } from '@/components/ElementSheetExport';
import { exportViewAsImage } from '@/lib/exportImage';

import { Atom2D } from '@/components/Atom2D';
import { AtomViewer } from '@/components/AtomViewer';
import { LewisDiagram } from '@/components/LewisDiagram';
import { BackHeader, contentWidthStyle, SectionLabel, StatCard } from '@/components/ui';
import { findElement, getDetail, getLocalizedDetail, getLocalizedName, localizedPhase } from '@/lib/elements';
import { useSettings } from '@/store/settings';
import { isLewisApplicable } from '@/lib/valence';
import { categoryLabelKeys } from '@/theme/categories';
import {  font, radii } from '@/theme/tokens';

const TABS = ['atome', 'donnees', 'usages', 'histoire'] as const;
type Tab = (typeof TABS)[number];
const SHELLS = [2, 8, 8, 18, 18, 32, 32];
const LABELS: Record<Tab, string> = {
  atome: 'app.element.tabs.atom',
  donnees: 'app.element.tabs.data',
  usages: 'app.element.tabs.uses',
  histoire: 'app.element.tabs.history',
};

function shellsOf(atomicNumber: number): number[] {
  let remaining = atomicNumber;
  return SHELLS.map((capacity) => {
    const count = Math.min(remaining, capacity);
    remaining -= count;
    return count;
  }).filter((count) => count > 0);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Group({ title, items }: { title: string; items?: string[] }) {
  const styles = useStyles();
  if (!items?.length) return null;
  return (
    <View style={styles.group}>
      <SectionLabel>{title}</SectionLabel>
      {items.map((item, index) => (
        <Text key={`${item}-${index}`} style={styles.groupItem}>
          {item}
        </Text>
      ))}
    </View>
  );
}

export default function ElementScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { number } = useLocalSearchParams<{ number: string }>();
  const { t } = useTranslation();
  const locale = useSettings((state) => state.locale);
  const [tab, setTab] = useState<Tab>('atome');
  const [mode, setMode] = useState<'2d' | '3d' | 'lewis'>('2d');
  const exportRef = useRef<RNView>(null);
  const element = findElement(Number(number));
  const detail = element ? getDetail(element.number) : undefined;
  const local = element ? getLocalizedDetail(element.number, locale) : undefined;
  const lewisAllowed = element ? isLewisApplicable(element, detail) : false;
  const effectiveMode = mode === 'lewis' && !lewisAllowed ? '2d' : mode;

  if (!element) {
    return (
      <View style={[styles.screen, contentWidthStyle]}>
        <BackHeader title={t('app.nav.table')} />
        <Text style={styles.empty}>{t('app.element.noData')}</Text>
      </View>
    );
  }

  const l1 = detail?.level1_basic;
  const l2 = detail?.level2_atomic;
  const l3 = detail?.level3_properties;
  const name = getLocalizedName(element, locale);
  const shells = shellsOf(element.number);
  const mass = l2?.mass?.highSchool?.replace('.', ',') ?? '—';
  const categoryLabel = l1?.type ? t(categoryLabelKeys[l1.type] ?? '') : element.category;

  const go = (delta: number) => {
    const next = element.number + delta;
    if (next >= 1 && next <= 118) router.replace(`/element/${next}`);
  };

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <BackHeader
        title={t('app.nav.table')}
        right={
          <View style={styles.arrows}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('app.element.export')}
              hitSlop={8}
              onPress={() => element && void exportViewAsImage(exportRef, `periodik-${element.symbol}`)}
            >
              <Feather name="download" size={18} color={colors.ink} />
            </Pressable>
            <Feather name="chevron-left" size={18} color={colors.inkSoft} onPress={() => go(-1)} />
            <Feather name="chevron-right" size={18} color={colors.inkSoft} onPress={() => go(1)} />
          </View>
        }
      />

      <View style={styles.tabs}>
        {TABS.map((key) => (
          <Text
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}
          >
            {t(LABELS[key])}
          </Text>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {tab === 'atome' && (
          <>
            <View style={styles.viewSwitch}>
              <SectionLabel>{t('app.element.representation')}</SectionLabel>
              <View style={styles.segmented}>
                {(['2d', '3d', ...(lewisAllowed ? ['lewis' as const] : [])] as const).map((key) => (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: mode === key }}
                    onPress={() => setMode(key)}
                    style={[styles.segment, effectiveMode === key && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, effectiveMode === key && styles.segmentTextActive]}>
                      {key === '2d' ? t('app.element.scheme') : key === '3d' ? t('app.element.spatial') : t('app.element.lewis')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.atomCard}>
              <View style={styles.atomHead}>
                <Text style={styles.atomNumber}>{element.number}</Text>
                <Text style={styles.atomSymbol}>{element.symbol}</Text>
              </View>
              {effectiveMode === '2d' ? (
                <Atom2D element={element} detail={detail} height={250} />
              ) : effectiveMode === '3d' ? (
                <AtomViewer element={element} detail={detail} height={250} />
              ) : (
                <LewisDiagram element={element} detail={detail} height={250} />
              )}
              <View style={styles.atomFooter}>
                <View style={styles.atomFooterLeft}>
                  <Text style={styles.atomName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.atomCategory} numberOfLines={1}>
                    {categoryLabel}
                  </Text>
                </View>
                <View style={styles.atomFooterRight}>
                  <Text style={styles.shellCaption}>{t('app.element.shells')}</Text>
                  <Text style={styles.shellValue}>{shells.join('·')}</Text>
                </View>
              </View>
            </View>

            {effectiveMode === 'lewis' && (
              <Text style={styles.representationNote}>
                {lewisAllowed ? t('app.element.lewisNote') : t('app.element.lewisUnavailable')}
              </Text>
            )}

            <View style={styles.stats}>
              <StatCard label={t('app.element.mass')} value={`${mass} u`} />
              <StatCard label={t('app.element.group')} value={String(l1?.group ?? '—')} />
              <StatCard label={t('app.element.period')} value={String(l1?.period ?? '—')} />
            </View>

            <View style={styles.configRow}>
              <Text style={styles.configLabel}>{t('app.element.configuration')}</Text>
              <Text style={styles.configValue}>{l3?.electronic?.configuration ?? '—'}</Text>
            </View>

            <View style={styles.dots}>
              {TABS.map((key, index) => (
                <View key={key} style={[styles.dot, index === 0 && styles.dotActive]} />
              ))}
            </View>
          </>
        )}

        {tab === 'donnees' && (
          <>
            <InfoRow label={t('app.element.atom.identity')} value={categoryLabel} />
            <InfoRow label={t('app.element.atom.state')} value={localizedPhase(l1?.phaseAtSTP, locale)} />
            <InfoRow label={t('app.element.atom.valence')} value={l1?.valenceElectrons ?? '—'} />
            <InfoRow label={t('app.element.atom.protons')} value={String(l2?.protons ?? element.number)} />
            <InfoRow label={t('app.element.atom.electrons')} value={String(l2?.electronsNeutral ?? element.number)} />
            <InfoRow label={t('app.element.atom.electronegativity')} value={String(l3?.physical?.electronegativity ?? '—')} />
            <InfoRow label={t('app.element.atom.radius')} value={String(l3?.physical?.atomicRadius ?? '—')} />
            <InfoRow label={t('app.element.atom.melting')} value={String(l3?.physical?.meltingPoint ?? '—')} />
            <InfoRow label={t('app.element.atom.boiling')} value={String(l3?.physical?.boilingPoint ?? '—')} />
            <Group
              title={t('app.element.atom.isotopes')}
              items={l2?.naturalIsotopes?.map((i) => `${i.name} — ${i.neutron}, ${i.percent}`)}
            />
          </>
        )}

        {tab === 'usages' && (
          <>
            <Group title={t('app.element.atom.commonUses')} items={local?.uses} />
            <Group title={t('app.element.atom.hazards')} items={local?.hazards} />
            <Group title={t('app.element.atom.stse')} items={local?.stseContext} />
          </>
        )}

        {tab === 'histoire' && (
          <>
            <InfoRow label={t('app.element.atom.discovery')} value={local?.history?.discoveryYear ?? '—'} />
            <InfoRow label={t('app.element.atom.discoveredBy')} value={local?.history?.discoveredBy ?? '—'} />
            <InfoRow label={t('app.element.atom.namedBy')} value={local?.history?.namedBy ?? '—'} />
            {!!local?.chemistryNotes && <Group title={t('app.element.atom.note')} items={[local.chemistryNotes]} />}
            {!!local?.biologicalRole && <Group title={t('app.element.atom.role')} items={[local.biologicalRole]} />}
          </>
        )}
      </ScrollView>

      <View style={styles.offscreen} pointerEvents="none">
        <ElementSheetExport exportRef={exportRef} element={element} />
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
  offscreen: { position: 'absolute', left: -10000, top: 0 },
  empty: { padding: 24, fontFamily: font.display, color: colors.inkSoft },
  arrows: { flexDirection: 'row', gap: 16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: {
    flex: 1,
    paddingVertical: 12,
    textAlign: 'center',
    fontFamily: font.display,
    fontSize: 14,
    color: colors.inkSoft,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { color: colors.ink, fontFamily: font.displayBold, borderBottomColor: colors.ink },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 40 },
  viewSwitch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  segmented: { flexDirection: 'row', borderWidth: 1, borderColor: colors.lineStrong, borderRadius: radii.control, padding: 2 },
  segment: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7 },
  segmentActive: { backgroundColor: colors.card },
  segmentText: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  segmentTextActive: { color: colors.onCard },
  atomCard: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' },
  atomHead: { position: 'absolute', top: 16, left: 18, zIndex: 2 },
  atomNumber: { fontFamily: font.mono, fontSize: 11, color: colors.onCard },
  atomSymbol: { fontFamily: font.displayBold, fontSize: 48, color: colors.onCard, lineHeight: 52 },
  atomFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  atomFooterLeft: { flex: 1, minWidth: 0, marginRight: 12 },
  atomName: { fontFamily: font.displayBold, fontSize: 16, color: colors.onCard },
  atomCategory: { fontFamily: font.display, fontSize: 13, color: colors.lineStrong, marginTop: 2 },
  atomFooterRight: { alignItems: 'flex-end', flexShrink: 0 },
  shellCaption: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, color: colors.inkFaint },
  shellValue: { fontFamily: font.mono, fontSize: 11, color: colors.onCard, marginTop: 4, textAlign: 'right', maxWidth: 160 },
  representationNote: { fontFamily: font.display, fontSize: 12, color: colors.inkSoft, lineHeight: 18, marginTop: 10 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 12 },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  configLabel: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft },
  configValue: { fontFamily: font.mono, fontSize: 14, color: colors.ink },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 30 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lineStrong },
  dotActive: { width: 18, backgroundColor: colors.accent },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  infoLabel: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft, flex: 1 },
  infoValue: { fontFamily: font.displayBold, fontSize: 13, color: colors.ink, textAlign: 'right', flex: 1.2 },
  group: { marginTop: 22 },
  groupItem: { fontFamily: font.display, fontSize: 14, color: colors.ink, lineHeight: 21, marginTop: 8 },
});
