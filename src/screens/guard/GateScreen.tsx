import { useState } from 'react';
import { api, Visit } from '../../api';
import { VisitCard } from '../../components/items';
import { Body, Button, Card, Empty, ErrorText, Field, Loading, Row, Screen, SectionTitle, Title } from '../../components/ui';
import { useAction, useData } from '../../hooks/useData';
import { useRootNav } from '../../navigation/hooks';
import { colors } from '../../theme';

export function GateScreen() {
  const nav = useRootNav();
  const [code, setCode] = useState('');
  const [admitted, setAdmitted] = useState<Visit | null>(null);
  const { data, error, refreshing, refresh, reload } = useData(() => api.listVisits());
  const action = useAction();

  const verify = async () => {
    if (code.trim().length < 4) return action.setError('Enter the pass code the visitor shows you.');
    setAdmitted(null);
    await action.run('verify', async () => {
      setAdmitted(await api.verifyPass(code));
      setCode('');
      reload();
    });
  };
  const act = async (key: string, fn: () => Promise<unknown>) => {
    if (await action.run(key, fn)) reload();
  };

  const waiting = data?.filter((v) => v.status === 'PENDING_APPROVAL') ?? [];
  const approved = data?.filter((v) => v.status === 'APPROVED') ?? [];
  const denied = data?.filter((v) => v.status === 'DENIED' && !v.checkedInAt).slice(0, 3) ?? [];
  const inside = data?.filter((v) => v.status === 'CHECKED_IN') ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Card>
        <Title>Verify a pass</Title>
        <Field label="Pass code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="6-digit code" />
        <Row>
          <Button title="Verify & check in" loading={action.busy === 'verify'} onPress={verify} />
          <Button variant="secondary" title="New walk-in" onPress={() => nav.navigate('WalkIn')} />
        </Row>
      </Card>
      {admitted ? (
        <Card style={{ backgroundColor: colors.successSoft, borderColor: colors.success }}>
          <Title>✅ {admitted.visitorName} may enter</Title>
          <Body>
            Flat {admitted.flatNumber} · {admitted.purpose}
          </Body>
        </Card>
      ) : null}
      <ErrorText>{error ?? action.error}</ErrorText>
      {!data ? (
        <Loading />
      ) : (
        <>
          <SectionTitle>Approved, ready to enter</SectionTitle>
          {approved.length === 0 ? (
            <Empty>No approved visitors waiting.</Empty>
          ) : (
            approved.map((v) => (
              <VisitCard key={v.id} visit={v} showFlat>
                <Button small variant="success" title="Check in" loading={action.busy === `i${v.id}`} onPress={() => act(`i${v.id}`, () => api.checkIn(v.id))} />
              </VisitCard>
            ))
          )}
          <SectionTitle>Waiting for resident</SectionTitle>
          {waiting.length === 0 ? <Empty>No pending requests.</Empty> : waiting.map((v) => <VisitCard key={v.id} visit={v} showFlat />)}
          {denied.length > 0 ? (
            <>
              <SectionTitle>Recently denied</SectionTitle>
              {denied.map((v) => (
                <VisitCard key={v.id} visit={v} showFlat />
              ))}
            </>
          ) : null}
          <SectionTitle>Inside the community ({inside.length})</SectionTitle>
          {inside.length === 0 ? (
            <Empty>No visitors inside.</Empty>
          ) : (
            inside.map((v) => (
              <VisitCard key={v.id} visit={v} showFlat>
                <Button small variant="secondary" title="Check out" loading={action.busy === `o${v.id}`} onPress={() => act(`o${v.id}`, () => api.checkOut(v.id))} />
              </VisitCard>
            ))
          )}
        </>
      )}
      <Body muted>{'\n'}Lists refresh automatically every few seconds.</Body>
    </Screen>
  );
}
