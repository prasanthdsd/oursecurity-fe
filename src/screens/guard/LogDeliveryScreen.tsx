import { useState } from 'react';
import { api } from '../../api';
import { Button, Chips, ErrorText, Field, Screen } from '../../components/ui';
import { useAction } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

const COURIERS = ['Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'BlueDart', 'Other'] as const;

export function LogDeliveryScreen() {
  const nav = useRootNav();
  const [flat, setFlat] = useState('');
  const [courier, setCourier] = useState<(typeof COURIERS)[number] | null>(null);
  const [other, setOther] = useState('');
  const [desc, setDesc] = useState('');
  const { busy, error, setError, run } = useAction();

  const submit = async () => {
    const name = courier === 'Other' ? other.trim() : courier;
    if (!flat.trim() || !name) return setError('Flat number and courier are required.');
    const ok = await run('save', () => api.logDelivery({ flatNumber: flat.trim().toUpperCase(), courier: name, description: desc.trim() }));
    if (ok) nav.goBack();
  };

  return (
    <Screen>
      <ErrorText>{error}</ErrorText>
      <Field label="Flat number" value={flat} onChangeText={setFlat} autoCapitalize="characters" placeholder="e.g. A-101" />
      <Chips label="Courier" format={(c) => c} options={COURIERS} value={courier} onChange={setCourier} />
      {courier === 'Other' ? <Field label="Courier name" value={other} onChangeText={setOther} /> : null}
      <Field label="Description (optional)" value={desc} onChangeText={setDesc} placeholder="Small box, food bag…" />
      <Button title="Log and notify resident" loading={busy === 'save'} onPress={submit} />
    </Screen>
  );
}
