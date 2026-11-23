import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, type ThemePalette } from '@/theme';
import { font } from '@/theme/tokens';
import type { BaseElement, ElementDetail } from '@/types';
import { valenceOf } from '@/lib/valence';

/** Répartition des électrons de valence : un par côté puis appariement (Hund simplifié). */
function electronSides(count: number): [number, number, number, number] {
  const sides: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < count; i += 1) sides[i % 4] += 1;
  return sides;
}

export function LewisDiagram({
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
  const valence = valenceOf(detail) ?? 0;
  const sides = useMemo(() => electronSides(valence), [valence]);
  const size = Math.min(height, 260);
  const box = 116;
  const cx = size / 2;
  const cy = size / 2;

  const pair = (side: number, horizontal: boolean) => {
    const offset = 8;
    const count = sides[side];
    if (!count) return null;
    const positions = count === 1 ? [0] : [-offset / 2, offset / 2];
    return positions.map((shift, index) => (
      <View
        key={`${side}-${index}`}
        style={[
          styles.electron,
          horizontal
            ? { left: cx - 3.5 + (side === 1 ? box / 2 + 8 : -box / 2 - 8), top: cy - 3.5 + shift }
            : { left: cx - 3.5 + shift, top: cy - 3.5 + (side === 2 ? box / 2 + 8 : -box / 2 - 8) },
        ]}
      />
    ));
  };

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[styles.diagram, { width: size, height: size }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${t('app.element.lewis')} — ${element.symbol} : ${valence} électrons de valence`}
      >
        <Text style={[styles.symbol, { width: box, height: box, lineHeight: box }]}>{element.symbol}</Text>
        {pair(0, false)}
        {pair(1, true)}
        {pair(2, false)}
        {pair(3, true)}
      </View>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  container: { width: '100%', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  diagram: { position: 'relative' },
  symbol: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -58,
    marginTop: -58,
    textAlign: 'center',
    fontFamily: font.displayBold,
    fontSize: 62,
    color: colors.onCard,
  },
  electron: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.salmon },
});
