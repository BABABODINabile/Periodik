import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { contentWidthStyle, ScreenHeader } from '@/components/ui';
import {  font, radii } from '@/theme/tokens';

const TOOLS = [
  { number: '01', key: 'app.tools.items.balancer', route: '/outils/equilibreur' },
  { number: '02', key: 'app.tools.items.mass', route: '/outils/masse' },
  { number: '03', key: 'app.tools.items.empirical', route: '/outils/empirique' },
  { number: '04', key: 'app.tools.items.solubility', route: '/outils/solubilite' },
];

export default function OutilsScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <ScreenHeader eyebrow={t('app.tools.eyebrow')} title={t('app.tools.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.number}
            accessibilityRole="button"
            onPress={() => router.push(tool.route as never)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.number}>{tool.number}</Text>
              <Text style={styles.level}>{t(`${tool.key}.level`)}</Text>
            </View>
            <Text style={styles.name}>{t(`${tool.key}.name`)}</Text>
            <Text style={styles.example}>{t(`${tool.key}.example`)}</Text>
          </Pressable>
        ))}
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
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardPressed: { backgroundColor: colors.line },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  number: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  level: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  name: { fontFamily: font.displayBold, fontSize: 17, color: colors.ink, marginTop: 6 },
  example: { fontFamily: font.mono, fontSize: 12, color: colors.inkSoft, marginTop: 8 },
});
