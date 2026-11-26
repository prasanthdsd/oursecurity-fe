import { api } from '../../api';
import { useUser } from '../../auth/AuthContext';
import { AlertCard } from '../../components/items';
import { SosButton } from '../../components/SosButton';
import { Button, Empty, ErrorText, Loading, Screen, SectionTitle } from '../../components/ui';
import { useAction, useData } from '../../hooks/useData';

export function AlertsScreen() {
  const user = useUser();
  const responder = user.role !== 'RESIDENT';
  const { data, error, refreshing, refresh, reload } = useData(() => api.listAlerts());
  const action = useAction();
  const act = async (key: string, fn: () => Promise<unknown>) => {
    if (await action.run(key, fn)) reload();
  };
  const open = data?.filter((a) => a.status !== 'RESOLVED') ?? [];
  const resolved = data?.filter((a) => a.status === 'RESOLVED').slice(0, 20) ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <SosButton />
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          <SectionTitle>Open alerts</SectionTitle>
          {open.length === 0 ? (
            <Empty>No open emergencies. All clear.</Empty>
          ) : (
            open.map((a) => (
              <AlertCard key={a.id} alert={a}>
                {responder && a.status === 'ACTIVE' ? (
                  <Button small variant="danger" title="I'm responding" loading={action.busy === `k${a.id}`} onPress={() => act(`k${a.id}`, () => api.acknowledgeAlert(a.id))} />
                ) : null}
                {responder ? (
                  <Button small variant="secondary" title="Mark resolved" loading={action.busy === `r${a.id}`} onPress={() => act(`r${a.id}`, () => api.resolveAlert(a.id))} />
                ) : null}
              </AlertCard>
            ))
          )}
          <SectionTitle>Resolved</SectionTitle>
          {resolved.length === 0 ? <Empty>None yet.</Empty> : resolved.map((a) => <AlertCard key={a.id} alert={a} />)}
        </>
      )}
    </Screen>
  );
}
