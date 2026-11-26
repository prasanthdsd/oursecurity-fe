import { useState } from 'react';
import { api } from '../../api';
import { Button, ErrorText, Field, Screen } from '../../components/ui';
import { useAction } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

export function PostNoticeScreen() {
  const nav = useRootNav();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { busy, error, setError, run } = useAction();

  const submit = async () => {
    if (!title.trim() || !body.trim()) return setError('Add a title and a message.');
    if (await run('save', () => api.postNotice(title.trim(), body.trim()))) nav.goBack();
  };

  return (
    <Screen>
      <ErrorText>{error}</ErrorText>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Message" value={body} onChangeText={setBody} multiline style={{ minHeight: 120, textAlignVertical: 'top' }} />
      <Button title="Post to all residents" loading={busy === 'save'} onPress={submit} />
    </Screen>
  );
}
