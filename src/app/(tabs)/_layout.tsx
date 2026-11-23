import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/ui';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <Slot />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.paper } });
