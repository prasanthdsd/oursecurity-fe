import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { api, Role } from '../../api';
import { useUser } from '../../auth/AuthContext';
import { Body, Button, Card, Chips, Empty, ErrorText, Loading, Screen, Title } from '../../components/ui';
import { humanize } from '../../format';
import { useAction, useData } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';
import { colors, space } from '../../theme';

const ROLES: readonly Role[] = ['RESIDENT', 'GUARD', 'COMMITTEE'];

export function MembersScreen() {
  const me = useUser();
  const nav = useRootNav();
  const [role, setRole] = useState<Role>('RESIDENT');
  const [confirming, setConfirming] = useState<number | null>(null);
  const { data, error, refreshing, refresh, reload } = useData(() => api.listUsers(role), false);
  const action = useAction();

  useEffect(() => {
    setConfirming(null);
    reload();
  }, [role, reload]);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Button title="Add a member" onPress={() => nav.navigate('AddMember')} style={{ marginBottom: space.md }} />
      <Chips options={ROLES} value={role} onChange={setRole} />
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : data.length === 0 ? (
        <Empty>No {humanize(role).toLowerCase()}s yet.</Empty>
      ) : (
        data.map((u) => (
          <Card key={u.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Title>{u.name}</Title>
                <Body muted>
                  {u.phone}
                  {u.flatNumber ? ` · Flat ${u.flatNumber}` : ''}
                </Body>
              </View>
              {u.id !== me.id && confirming !== u.id ? (
                <Pressable onPress={() => setConfirming(u.id)} accessibilityRole="button">
                  <Text style={{ color: colors.danger }}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
            {confirming === u.id ? (
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
                <Button
                  small
                  variant="danger"
                  title={`Remove ${u.name.split(' ')[0]}`}
                  loading={action.busy === `d${u.id}`}
                  onPress={async () => {
                    if (await action.run(`d${u.id}`, () => api.deleteUser(u.id))) {
                      setConfirming(null);
                      reload();
                    }
                  }}
                />
                <Button small variant="secondary" title="Keep" onPress={() => setConfirming(null)} />
              </View>
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}
