import { api } from '../../api';
import { useUser } from '../../auth/AuthContext';
import { Body, Button, Card, Empty, ErrorText, Loading, Screen, Title } from '../../components/ui';
import { formatTime } from '../../format';
import { useData } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

export function NoticesScreen() {
  const user = useUser();
  const nav = useRootNav();
  const { data, error, refreshing, refresh } = useData(() => api.listNotices(), false);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {user.role === 'COMMITTEE' ? <Button title="Post a notice" onPress={() => nav.navigate('PostNotice')} style={{ marginBottom: 12 }} /> : null}
      <ErrorText>{error}</ErrorText>
      {!data ? (
        <Loading />
      ) : data.length === 0 ? (
        <Empty>No notices yet.</Empty>
      ) : (
        data.map((n) => (
          <Card key={n.id}>
            <Title>{n.title}</Title>
            <Body>{n.body}</Body>
            <Body muted>
              {n.postedByName} · {formatTime(n.createdAt)}
            </Body>
          </Card>
        ))
      )}
    </Screen>
  );
}
