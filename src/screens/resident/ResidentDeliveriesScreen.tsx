import { api } from '../../api';
import { DeliveryCard } from '../../components/items';
import { Button, Empty, ErrorText, Loading, Screen, SectionTitle } from '../../components/ui';
import { useAction, useData } from '../../hooks/useData';

export function ResidentDeliveriesScreen() {
  const { data, error, refreshing, refresh, reload } = useData(() => api.listDeliveries());
  const action = useAction();
  const waiting = data?.filter((d) => d.status === 'AT_GATE') ?? [];
  const past = data?.filter((d) => d.status !== 'AT_GATE') ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          <SectionTitle>At the gate</SectionTitle>
          {waiting.length === 0 ? (
            <Empty>Nothing waiting for you.</Empty>
          ) : (
            waiting.map((d) => (
              <DeliveryCard key={d.id} delivery={d}>
                <Button
                  small
                  title="I collected it"
                  loading={action.busy === `c${d.id}`}
                  onPress={async () => {
                    if (await action.run(`c${d.id}`, () => api.collectDelivery(d.id))) reload();
                  }}
                />
              </DeliveryCard>
            ))
          )}
          <SectionTitle>Past deliveries</SectionTitle>
          {past.length === 0 ? <Empty>No past deliveries.</Empty> : past.map((d) => <DeliveryCard key={d.id} delivery={d} />)}
        </>
      )}
    </Screen>
  );
}
