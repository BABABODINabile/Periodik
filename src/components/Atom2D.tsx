import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { font } from '@/theme/tokens';
import type { BaseElement, ElementDetail } from '@/types';
import { valenceOf } from '@/lib/valence';
import { SHELL_COLORS } from '@/theme/shells';

const SHELLS = [2, 8, 8, 18, 18, 32, 32];
const SHELL_LETTERS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

function shellCounts(atomicNumber: number): number[] {
  let remaining = atomicNumber;
  return SHELLS.map((capacity) => {
    const count = Math.min(remaining, capacity);
    remaining -= count;
    return count;
  }).filter((count) => count > 0);
}

export function Atom2D({
  element,
  detail,
  height,
}: {
  element: BaseElement;
  detail?: ElementDetail;
  height: number;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  const shells = shellCounts(element.number);
  const valence = valenceOf(detail);
  const valenceShell = valence !== null ? shells.length - 1 : -1;
  const size = Math.min(height, 260) - 16;
  const outer = size / 2 - 12;
  const inner = shells.length > 1 ? Math.min(44, outer * 0.48) : outer;
  const step = shells.length > 1 ? (outer - inner) / (shells.length - 1) : 0;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.legend}>
        {shells.map((count, index) => (
          <View key={index} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: SHELL_COLORS[index] }]} />
            <Text style={styles.legendLetter}>{SHELL_LETTERS[index]}</Text>
            <Text style={styles.legendCount}>{count}</Text>
          </View>
        ))}
      </View>

      <View
        style={[styles.diagram, { width: size, height: size }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('app.atom.diagram', { symbol: element.symbol, count: shells.length, shells: shells.join(', ') })}
      >
        {shells.map((count, shellIndex) => {
          const radius = shells.length === 1 ? inner : inner + shellIndex * step;
          const isValence = shellIndex === valenceShell;
          return (
            <View key={`shell-${shellIndex}`} style={StyleSheet.absoluteFill}>
              <View
                style={[
                  styles.ring,
                  isValence && styles.ringValence,
                  {
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                    left: size / 2 - radius,
                    top: size / 2 - radius,
                    borderColor: SHELL_COLORS[shellIndex],
                  },
                ]}
              />
              {Array.from({ length: count }, (_, index) => {
                const angle = (index / count) * Math.PI * 2 - Math.PI / 2 + (shellIndex % 2) * 0.12;
                return (
                  <View
                    key={`electron-${shellIndex}-${index}`}
                    style={[
                      styles.electron,
                      {
                        left: size / 2 + Math.cos(angle) * radius - 4,
                        top: size / 2 + Math.sin(angle) * radius - 4,
                        backgroundColor: SHELL_COLORS[shellIndex],
                        borderColor: SHELL_COLORS[shellIndex],
                      },
                    ]}
                  />
                );
              })}
            </View>
          );
        })}
        <View style={styles.nucleus}>
          <Text style={styles.nucleusText}>{element.symbol}</Text>
        </View>
      </View>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.card,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 52,
    paddingRight: 10,
  },
  diagram: { position: 'relative' },
  legend: { position: 'absolute', left: 14, top: 92, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendLetter: { fontFamily: font.mono, fontSize: 10, color: colors.onCard },
  legendCount: { fontFamily: font.mono, fontSize: 9, color: colors.inkFaint, textAlign: 'right', width: 18 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: colors.inkFaint, opacity: 0.5 },
  ringValence: { borderWidth: 2, opacity: 0.9 },
  electron: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.salmon },
  nucleus: {
    position: 'absolute', left: '50%', top: '50%', marginLeft: -23, marginTop: -23,
    width: 46, height: 46, borderRadius: 23, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  nucleusText: { fontFamily: font.displayBold, fontSize: 20, color: colors.onCard },
});
