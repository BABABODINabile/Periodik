import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Atom2D } from '@/components/Atom2D';
import {
  getDetail,
  getLocalizedDetail,
  getLocalizedIons,
  getLocalizedName,
  localizedPhase,
} from '@/lib/elements';
import { useSettings } from '@/store/settings';
import { categoryColors, categoryLabelKeys } from '@/theme/categories';
import { colors, font } from '@/theme/tokens';
import type { BaseElement } from '@/types';

const PAGE_W = 1000;

function valueOf(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function Block({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.dataRow}>
          <Text style={styles.dataLabel}>{label}</Text>
          <Text style={styles.dataValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${item}-${index}`} style={styles.bullet}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

export function ElementSheetExport({
  element,
  exportRef,
}: {
  element: BaseElement;
  exportRef: { current: unknown };
}) {
    const { t } = useTranslation();
    const locale = useSettings((state) => state.locale);
    const detail = getDetail(element.number);
    const local = getLocalizedDetail(element.number, locale);
    const l1 = detail?.level1_basic;
    const l2 = detail?.level2_atomic;
    const l3 = detail?.level3_properties;
    const physical = l3?.physical ?? {};
    const accent = categoryColors[element.category] ?? colors.line;
    const name = getLocalizedName(element, 'fr');
    const mass = l2?.mass?.highSchool ?? '—';

    return (
      <View ref={exportRef as never} collapsable={false} style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>PÉRIODIK</Text>
            <Text style={styles.kicker}>FICHE ÉLÉMENT · N° {element.number}</Text>
          </View>
          <Text style={styles.headerRight}>CHIMIE · LYCÉE / UNIVERSITÉ</Text>
        </View>

        <View style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: accent }]}>
            <Text style={styles.heroNumber}>{element.number}</Text>
            <Text style={styles.heroSymbol}>{element.symbol}</Text>
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroCategory}>
              {l1?.type ? t(categoryLabelKeys[l1.type] ?? '') : element.category}
            </Text>
          </View>
          <View style={styles.heroMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>MASSE ATOMIQUE</Text>
              <Text style={styles.metricValue}>{mass} u</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>GROUPE / PÉRIODE</Text>
              <Text style={styles.metricValue}>
                {valueOf(l1?.group)} / {valueOf(l1?.period)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>PROTONS · ELECTRONS</Text>
              <Text style={styles.metricValue}>
                {valueOf(l2?.protons ?? element.number)} · {valueOf(l2?.electronsNeutral ?? element.number)}
              </Text>
            </View>
          </View>
          <View style={styles.atomPanel}>
            <Atom2D element={element} detail={detail} height={320} />
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Block
              title="IDENTITÉ"
              rows={[
                [t('app.element.atom.identity'), l1?.type ? t(categoryLabelKeys[l1.type] ?? '') : element.category],
                [t('app.element.atom.state'), localizedPhase(l1?.phaseAtSTP, locale)],
                ['Électrons de valence', valueOf(l1?.valenceElectrons)],
                ['Configuration', valueOf(l3?.electronic?.configuration)],
                ['États d’oxydation', valueOf(l3?.electronic?.oxidationStates?.common)],
                ['Ions courants', getLocalizedIons(element.number, 'fr') ?? valueOf(l1?.commonIons)],
              ]}
            />
            <Block
              title="PROPRIÉTÉS PHYSIQUES"
              rows={[
                ['Électronégativité', valueOf(physical.electronegativity)],
                ['Rayon atomique', valueOf(physical.atomicRadius)],
                ['Densité', valueOf(physical.density)],
                ['Fusion', valueOf(physical.meltingPoint)],
                ['Ébullition', valueOf(physical.boilingPoint)],
                ['1ʳᵉ ionisation', valueOf(physical.firstIonization)],
                ['Affinité électronique', valueOf(physical.electronAffinity)],
              ]}
            />
          </View>
          <View style={styles.column}>
            <Block
              title="HISTOIRE"
              rows={[
                [t('app.element.atom.discovery'), valueOf(local?.history?.discoveryYear)],
                [t('app.element.atom.discoveredBy'), valueOf(local?.history?.discoveredBy)],
                [t('app.element.atom.namedBy'), valueOf(local?.history?.namedBy)],
              ]}
            />
            <ListBlock title="ISOTOPES NATURELS" items={l2?.naturalIsotopes?.map((i) => `${i.name} — ${i.neutron}, ${i.percent}`)} />
            <ListBlock title={t('app.element.atom.commonUses').toUpperCase()} items={local?.uses} />
            <ListBlock title={t('app.element.atom.hazards').toUpperCase()} items={local?.hazards} />
            <ListBlock title={t('app.element.atom.stse').toUpperCase()} items={local?.stseContext} />
            {!!local?.chemistryNotes && <ListBlock title={t('app.element.atom.note').toUpperCase()} items={[local.chemistryNotes]} />}
            {!!local?.biologicalRole && <ListBlock title={t('app.element.atom.role').toUpperCase()} items={[local.biologicalRole]} />}
          </View>
        </View>

        <Text style={styles.footer}>PÉRIODIK · Données dérivées de Zperiod © 2026 Philip Zhao · MIT</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  page: { width: PAGE_W, backgroundColor: colors.paper, padding: 48, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26 },
  brand: { fontFamily: font.mono, fontSize: 15, letterSpacing: 3, color: colors.accent },
  kicker: { fontFamily: font.mono, fontSize: 13, color: colors.inkSoft, marginTop: 6 },
  headerRight: { fontFamily: font.mono, fontSize: 11, color: colors.inkFaint },
  hero: { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  heroBadge: { width: 210, borderRadius: 16, padding: 18, justifyContent: 'space-between' },
  heroNumber: { fontFamily: font.mono, fontSize: 16, color: colors.ink },
  heroSymbol: { fontFamily: font.displayBold, fontSize: 86, color: colors.ink, lineHeight: 92 },
  heroName: { fontFamily: font.displayBold, fontSize: 24, color: colors.ink },
  heroCategory: { fontFamily: font.display, fontSize: 13, color: colors.inkSoft },
  heroMetrics: { flex: 1, gap: 12, justifyContent: 'center' },
  metric: { backgroundColor: colors.paperLight, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14 },
  metricLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, color: colors.inkSoft },
  metricValue: { fontFamily: font.displayBold, fontSize: 20, color: colors.ink, marginTop: 5 },
  atomPanel: { width: 360, borderRadius: 16, overflow: 'hidden' },
  columns: { flexDirection: 'row', gap: 32, marginTop: 26 },
  column: { flex: 1 },
  block: { marginBottom: 22 },
  blockTitle: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.accent,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 8,
    marginBottom: 6,
  },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7 },
  dataLabel: { fontFamily: font.display, fontSize: 12, color: colors.inkSoft, flex: 1 },
  dataValue: { fontFamily: font.displayBold, fontSize: 12, color: colors.ink, textAlign: 'right', flex: 1.3 },
  bullet: { fontFamily: font.display, fontSize: 12, color: colors.ink, lineHeight: 18, marginTop: 5 },
  footer: { fontFamily: font.mono, fontSize: 10, color: colors.inkFaint, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14 },
});
