import { api } from '../../api';
import { DeliveryCard } from '../../components/items';
import { Button, Empty, ErrorText, Loading, Screen, SectionTitle } from '../../components/ui';
import { useAction, useData } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

export function GuardDeliveriesScreen() {
  const nav = useRootNav();
  const { data, error, refreshing, refresh, reload } = useData(() => api.listDeliveries());
  const action = useAction();
  const act = async (key: string, fn: () => Promise<unknown>) => {
    if (await action.run(key, fn)) reload();
  };
  const atGate = data?.filter((d) => d.status === 'AT_GATE') ?? [];
  const done = data?.filter((d) => d.status !== 'AT_GATE').slice(0, 20) ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Button title="Log a delivery" onPress={() => nav.navigate('LogDelivery')} />
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          <SectionTitle>At the gate ({atGate.length})</SectionTitle>
          {atGate.length === 0 ? (
            <Empty>No parcels at the gate.</Empty>
          ) : (
            atGate.map((d) => (
              <DeliveryCard key={d.id} delivery={d} showFlat>
                <Button small variant="success" title="Handed over" loading={action.busy === `c${d.id}`} onPress={() => act(`c${d.id}`, () => api.collectDelivery(d.id))} />
                <Button small variant="secondary" title="Returned" loading={action.busy === `r${d.id}`} onPress={() => act(`r${d.id}`, () => api.returnDelivery(d.id))} />
              </DeliveryCard>
            ))
          )}
          <SectionTitle>Recent</SectionTitle>
          {done.length === 0 ? <Empty>Nothing yet.</Empty> : done.map((d) => <DeliveryCard key={d.id} delivery={d} showFlat />)}
        </>
      )}
    </Screen>
  );
}
