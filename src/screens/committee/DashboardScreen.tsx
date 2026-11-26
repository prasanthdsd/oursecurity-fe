import { api } from '../../api';
import { AlertCard, VisitCard } from '../../components/items';
import { Empty, ErrorText, Loading, Row, Screen, SectionTitle, Stat } from '../../components/ui';
import { useData } from '../../hooks/useData';
import { colors } from '../../theme';

export function DashboardScreen() {
  const { data, error, refreshing, refresh } = useData(async () => {
    const [summary, alerts, visits] = await Promise.all([api.summary(), api.listAlerts(), api.listVisits()]);
    return { summary, alerts: alerts.filter((a) => a.status !== 'RESOLVED'), visits: visits.slice(0, 10) };
  });

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorText>{error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Stat label="Visitors today" value={data.summary.visitorsToday} />
            <Stat label="Pending approvals" value={data.summary.pendingApprovals} tone={colors.warning} />
            <Stat label="Parcels at gate" value={data.summary.deliveriesAtGate} />
            <Stat label="Open alerts" value={data.summary.activeAlerts} tone={data.summary.activeAlerts ? colors.danger : undefined} />
            <Stat label="Residents" value={data.summary.residents} />
            <Stat label="Guards" value={data.summary.guards} />
          </Row>
          {data.alerts.length > 0 ? (
            <>
              <SectionTitle>Open alerts</SectionTitle>
              {data.alerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
            </>
          ) : null}
          <SectionTitle>Recent gate activity</SectionTitle>
          {data.visits.length === 0 ? <Empty>No visits yet.</Empty> : data.visits.map((v) => <VisitCard key={v.id} visit={v} showFlat hidePass />)}
        </>
      )}
    </Screen>
  );
}
