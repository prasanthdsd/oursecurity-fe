import { api } from '../../api';
import { VisitCard } from '../../components/items';
import { Button, Empty, ErrorText, Loading, Screen, SectionTitle } from '../../components/ui';
import { useAction, useData } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';

export function ResidentVisitorsScreen() {
  const nav = useRootNav();
  const { data, error, refreshing, refresh, reload } = useData(() => api.listVisits());
  const action = useAction();

  const passes = data?.filter((v) => v.status === 'PRE_APPROVED') ?? [];
  const history = data?.filter((v) => v.status !== 'PRE_APPROVED' && v.status !== 'PENDING_APPROVAL') ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Button title="Pre-approve a visitor" onPress={() => nav.navigate('PreApprove')} />
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          <SectionTitle>Active passes</SectionTitle>
          {passes.length === 0 ? (
            <Empty>No active passes. Pre-approve guests so they skip the wait at the gate.</Empty>
          ) : (
            passes.map((v) => (
              <VisitCard key={v.id} visit={v}>
                <Button
                  small
                  variant="secondary"
                  title="Cancel pass"
                  loading={action.busy === `c${v.id}`}
                  onPress={async () => {
                    if (await action.run(`c${v.id}`, () => api.cancelVisit(v.id))) reload();
                  }}
                />
              </VisitCard>
            ))
          )}
          <SectionTitle>History</SectionTitle>
          {history.length === 0 ? <Empty>No visits yet.</Empty> : history.map((v) => <VisitCard key={v.id} visit={v} />)}
        </>
      )}
    </Screen>
  );
}
