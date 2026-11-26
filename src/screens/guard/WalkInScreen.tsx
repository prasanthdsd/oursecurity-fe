import { useState } from 'react';
import { api } from '../../api';
import { Body, Button, ErrorText, Field, Screen } from '../../components/ui';
import { useAction } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

export function WalkInScreen() {
  const nav = useRootNav();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [flat, setFlat] = useState('');
  const { busy, error, setError, run } = useAction();

  const submit = async () => {
    if (!name.trim() || !flat.trim()) return setError('Visitor name and flat number are required.');
    const ok = await run('save', () =>
      api.walkIn({ visitorName: name.trim(), visitorPhone: phone.trim(), purpose: purpose.trim() || 'Visit', flatNumber: flat.trim().toUpperCase() }),
    );
    if (ok) nav.goBack();
  };

  return (
    <Screen>
      <Body muted>The resident gets an approval request. You will see their answer on the Gate tab.</Body>
      <ErrorText>{error}</ErrorText>
      <Field label="Visitor name" value={name} onChangeText={setName} />
      <Field label="Visitor phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="Delivery, guest, service…" />
      <Field label="Flat number" value={flat} onChangeText={setFlat} autoCapitalize="characters" placeholder="e.g. A-101" />
      <Button title="Ask resident to approve" loading={busy === 'save'} onPress={submit} />
    </Screen>
  );
}
