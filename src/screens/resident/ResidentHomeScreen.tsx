import { api, DeliveryInstruction } from '../../api';
import { useUser } from '../../auth/AuthContext';
import { DeliveryCard, VisitCard } from '../../components/items';
import { SosButton } from '../../components/SosButton';
import { Body, Button, Empty, ErrorText, Loading, Screen, SectionTitle, Title, Card } from '../../components/ui';
import { useAction, useData } from '../../hooks/useData';

export function ResidentHomeScreen() {
  const user = useUser();
  const { data, error, refreshing, refresh, reload } = useData(async () => {
    const [pending, deliveries, alerts] = await Promise.all([
      api.listVisits('PENDING_APPROVAL'),
      api.listDeliveries('AT_GATE'),
      api.listAlerts('ACTIVE'),
    ]);
    return { pending, deliveries, alerts };
  });
  const action = useAction();
  const act = async (key: string, fn: () => Promise<unknown>) => {
    if (await action.run(key, fn)) reload();
  };
  const instruct = (id: number, i: DeliveryInstruction) => act(`d${id}${i}`, () => api.setDeliveryInstruction(id, i));

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Card>
        <Title>Hello, {user.name.split(' ')[0]}</Title>
        <Body muted>Flat {user.flatNumber}</Body>
      </Card>
      <SosButton />
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          {data.alerts.length > 0 ? (
            <Body>⚠️ {data.alerts.length} active emergency alert(s) in the community. See the Alerts tab.</Body>
          ) : null}
          <SectionTitle>Waiting at the gate</SectionTitle>
          {data.pending.length === 0 ? (
            <Empty>No visitors are waiting for your approval.</Empty>
          ) : (
            data.pending.map((v) => (
              <VisitCard key={v.id} visit={v}>
                <Button
                  small
                  variant="success"
                  title="Allow entry"
                  loading={action.busy === `a${v.id}`}
                  onPress={() => act(`a${v.id}`, () => api.approveVisit(v.id))}
                />
                <Button
                  small
                  variant="danger"
                  title="Deny"
                  loading={action.busy === `x${v.id}`}
                  onPress={() => act(`x${v.id}`, () => api.denyVisit(v.id))}
                />
              </VisitCard>
            ))
          )}
          <SectionTitle>Deliveries at the gate</SectionTitle>
          {data.deliveries.length === 0 ? (
            <Empty>No parcels waiting.</Empty>
          ) : (
            data.deliveries.map((d) => (
              <DeliveryCard key={d.id} delivery={d}>
                <Button
                  small
                  variant={d.instruction === 'SEND_UP' ? 'primary' : 'secondary'}
                  title="Send it up"
                  loading={action.busy === `d${d.id}SEND_UP`}
                  onPress={() => instruct(d.id, 'SEND_UP')}
                />
                <Button
                  small
                  variant={d.instruction === 'LEAVE_AT_GATE' ? 'primary' : 'secondary'}
                  title="Keep at gate"
                  loading={action.busy === `d${d.id}LEAVE_AT_GATE`}
                  onPress={() => instruct(d.id, 'LEAVE_AT_GATE')}
                />
              </DeliveryCard>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
