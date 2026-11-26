import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { Body, Button, Card, ErrorText, Field, Screen } from '../../components/ui';
import { config } from '../../config';
import { useAction } from '../../hooks/useData';
import { colors, space } from '../../theme';

// Same as the backend's dev seed users.
const DEMO = [
  { label: 'Resident', phone: '9000000003', password: 'resident123' },
  { label: 'Guard', phone: '9000000002', password: 'guard123' },
  { label: 'Committee', phone: '9000000001', password: 'admin123' },
];

export function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, setError, run } = useAction();

  const submit = () => {
    if (!phone.trim() || !password) return setError('Enter your phone number and password.');
    run('login', () => login(phone.trim(), password));
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.logo}>🛡️</Text>
        <Text style={styles.name}>OurSecurity</Text>
        <Body muted>Gate security for your community</Body>
      </View>
      <ErrorText>{error}</ErrorText>
      <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={submit} />
      <Button title="Log in" loading={busy === 'login'} onPress={submit} />

      {config.demoMode || __DEV__ ? (
        <Card style={{ marginTop: space.xl }}>
          <Body muted>
            {config.demoMode ? 'Demo mode: no server set, data is kept on this phone only.' : 'Development seed users:'}
          </Body>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            {DEMO.map((d) => (
              <Pressable
                key={d.label}
                style={styles.demo}
                onPress={() => {
                  setPhone(d.phone);
                  setPassword(d.password);
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: space.xl * 2, marginBottom: space.xl },
  logo: { fontSize: 56 },
  name: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: space.sm },
  demo: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
});
