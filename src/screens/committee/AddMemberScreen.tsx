import { useState } from 'react';
import { api, Role } from '../../api';
import { Button, Chips, ErrorText, Field, Screen } from '../../components/ui';
import { useAction } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

const ROLES: readonly Role[] = ['RESIDENT', 'GUARD', 'COMMITTEE'];

export function AddMemberScreen() {
  const nav = useRootNav();
  const [role, setRole] = useState<Role>('RESIDENT');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flat, setFlat] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, setError, run } = useAction();

  const submit = async () => {
    if (!name.trim() || !phone.trim()) return setError('Name and phone are required.');
    if (role === 'RESIDENT' && !flat.trim()) return setError('Residents need a flat number.');
    if (password.length < 6) return setError('Set a starting password of at least 6 characters.');
    const ok = await run('save', () =>
      api.createUser({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
        flatNumber: role === 'RESIDENT' ? flat.trim().toUpperCase() : null,
      }),
    );
    if (ok) nav.goBack();
  };

  return (
    <Screen>
      <ErrorText>{error}</ErrorText>
      <Chips label="Role" options={ROLES} value={role} onChange={setRole} />
      <Field label="Full name" value={name} onChangeText={setName} />
      <Field label="Phone number (used to log in)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {role === 'RESIDENT' ? <Field label="Flat number" value={flat} onChangeText={setFlat} autoCapitalize="characters" placeholder="e.g. A-101" /> : null}
      <Field label="Starting password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Add member" loading={busy === 'save'} onPress={submit} />
    </Screen>
  );
}
