import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, space } from '../theme';

export function SosButton() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Raise an emergency alert"
      onPress={() => nav.navigate('RaiseAlert')}
      style={({ pressed }) => [styles.sos, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.big}>SOS</Text>
      <Text style={styles.small}>Tap to alert guards and the committee</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sos: { backgroundColor: colors.danger, borderRadius: radius, padding: space.lg, alignItems: 'center', marginBottom: space.md },
  big: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  small: { color: '#fff', opacity: 0.9, marginTop: 2 },
});
