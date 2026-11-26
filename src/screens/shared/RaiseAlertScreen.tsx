import { useState } from 'react';
import { api, AlertType } from '../../api';
import { Body, Button, Chips, ErrorText, Field, Screen } from '../../components/ui';
import { useAction } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

const TYPES: readonly AlertType[] = ['MEDICAL', 'FIRE', 'SECURITY', 'OTHER'];

export function RaiseAlertScreen() {
  const nav = useRootNav();
  const [type, setType] = useState<AlertType | null>(null);
  const [message, setMessage] = useState('');
  const { busy, error, setError, run } = useAction();

  const send = async () => {
    if (!type) return setError('Choose what kind of emergency it is.');
    const ok = await run('send', () => api.raiseAlert(type, message.trim()));
    if (ok) nav.goBack();
  };

  return (
    <Screen>
      <Body muted>Guards and the management committee are alerted at once. For life-threatening emergencies, also call 112.</Body>
      <ErrorText>{error}</ErrorText>
      <Chips label="Emergency type" options={TYPES} value={type} onChange={setType} />
      <Field label="Details (optional)" value={message} onChangeText={setMessage} placeholder="What is happening and where?" multiline />
      <Button variant="danger" title="Send emergency alert" loading={busy === 'send'} onPress={send} />
    </Screen>
  );
}
