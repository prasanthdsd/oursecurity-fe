import { useAuth, useUser } from '../../auth/AuthContext';
import { Body, Button, Card, Screen, Title } from '../../components/ui';
import { config } from '../../config';
import { humanize } from '../../format';

export function ProfileScreen() {
  const user = useUser();
  const { logout } = useAuth();
  return (
    <Screen>
      <Card>
        <Title>{user.name}</Title>
        <Body muted>{humanize(user.role)}</Body>
        <Body muted>{user.phone}</Body>
        {user.flatNumber ? <Body muted>Flat {user.flatNumber}</Body> : null}
      </Card>
      <Card>
        <Body muted>Server: {config.demoMode ? 'Demo mode (no server)' : config.apiUrl}</Body>
      </Card>
      <Button variant="secondary" title="Log out" onPress={logout} />
    </Screen>
  );
}
