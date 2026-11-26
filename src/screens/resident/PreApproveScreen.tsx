import { useState } from 'react';
import { Share, Text } from 'react-native';
import { api, Visit } from '../../api';
import { Body, Button, Card, Chips, ErrorText, Field, Screen, Title } from '../../components/ui';
import { formatTime } from '../../format';
import { useAction } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';
import { colors, space } from '../../theme';

const WHEN = ['NOW', 'IN_1_HOUR', 'THIS_EVENING', 'TOMORROW'] as const;
type When = (typeof WHEN)[number];

function expectedAt(w: When): string {
  const d = new Date();
  if (w === 'IN_1_HOUR') d.setHours(d.getHours() + 1);
  if (w === 'THIS_EVENING') d.setHours(18, 0, 0, 0);
  if (w === 'TOMORROW') {
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
  }
  return d.toISOString();
}

export function PreApproveScreen() {
  const nav = useRootNav();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Guest');
  const [when, setWhen] = useState<When>('NOW');
  const [created, setCreated] = useState<Visit | null>(null);
  const { busy, error, setError, run } = useAction();

  const submit = () => {
    if (!name.trim()) return setError('Enter the visitor’s name.');
    run('save', async () => {
      setCreated(
        await api.preApprove({
          visitorName: name.trim(),
          visitorPhone: phone.trim(),
          purpose: purpose.trim() || 'Guest',
          expectedAt: expectedAt(when),
        }),
      );
    });
  };

  if (created) {
    return (
      <Screen>
        <Card>
          <Title>Pass created for {created.visitorName}</Title>
          <Body muted>Share this code. The guard enters it at the gate.</Body>
          <Text style={{ fontSize: 40, fontWeight: '800', letterSpacing: 8, color: colors.primary, marginVertical: space.lg, textAlign: 'center' }}>
            {created.passCode}
          </Text>
          <Body muted>Expected {formatTime(created.expectedAt)}</Body>
        </Card>
        <Button
          title="Share code"
          onPress={() =>
            Share.share({
              message: `Your gate pass for flat ${created.flatNumber} is ${created.passCode}. Show it to the security guard on arrival.`,
            })
          }
        />
        <Button variant="secondary" title="Done" style={{ marginTop: space.sm }} onPress={() => nav.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ErrorText>{error}</ErrorText>
      <Field label="Visitor name" value={name} onChangeText={setName} placeholder="e.g. Meera" />
      <Field label="Visitor phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Purpose" value={purpose} onChangeText={setPurpose} />
      <Chips label="Arriving" options={WHEN} value={when} onChange={setWhen} />
      <Button title="Create pass" loading={busy === 'save'} onPress={submit} />
    </Screen>
  );
}
