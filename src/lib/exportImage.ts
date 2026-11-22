import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Capture une vue en PNG net et l'ouvre dans la feuille de partage (ou la télécharge sur web). */
export async function exportViewAsImage(
  ref: { current: unknown },
  filename: string,
): Promise<void> {
  const target = ref.current;
  if (!target) return;

  try {
    if (Platform.OS === 'web') {
      const uri = await captureRef(target as never, { format: 'png', result: 'data-uri' });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = String(uri);
      link.click();
      return;
    }

    const uri = await captureRef(target as never, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      fileName: `${filename}-${Date.now()}`,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: filename.replace(/-/g, ' '),
      });
    }
  } catch {
    Alert.alert(
      'Export indisponible',
      Platform.OS === 'web'
        ? 'L’export image nécessite l’application mobile (Expo Go / build).'
        : 'Impossible de générer l’image. Réessayez.',
    );
  }
}
