import { ReactNode } from 'react';
import { Linking, Text, View } from 'react-native';
import type { Alert, Delivery, Visit } from '../api';
import { formatTime, humanize } from '../format';
import { colors, space } from '../theme';
import { Badge, Body, Card, Row, Title } from './ui';

function Header({ title, status }: { title: string; status: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm }}>
      <View style={{ flex: 1 }}>
        <Title>{title}</Title>
      </View>
      <Badge value={status} />
    </View>
  );
}

function Actions({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <View style={{ marginTop: space.md }}>
      <Row>{children}</Row>
    </View>
  );
}

export function VisitCard({
  visit,
  children,
  showFlat,
  hidePass,
}: {
  visit: Visit;
  children?: ReactNode;
  showFlat?: boolean;
  hidePass?: boolean;
}) {
  const when = visit.checkedOutAt
    ? `Left ${formatTime(visit.checkedOutAt)}`
    : visit.checkedInAt
      ? `Entered ${formatTime(visit.checkedInAt)}`
      : visit.expectedAt
        ? `Expected ${formatTime(visit.expectedAt)}`
        : `Requested ${formatTime(visit.createdAt)}`;
  return (
    <Card>
      <Header title={visit.visitorName} status={visit.status} />
      <Body muted>
        {visit.purpose}
        {showFlat ? ` · Flat ${visit.flatNumber}` : ''}
        {visit.visitorPhone ? ` · ${visit.visitorPhone}` : ''}
      </Body>
      <Body muted>{when}</Body>
      {!hidePass && visit.passCode && visit.status === 'PRE_APPROVED' ? (
        <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: 4, color: colors.primary, marginTop: space.sm }}>
          {visit.passCode}
        </Text>
      ) : null}
      <Actions>{children}</Actions>
    </Card>
  );
}

export function DeliveryCard({ delivery, children, showFlat }: { delivery: Delivery; children?: ReactNode; showFlat?: boolean }) {
  return (
    <Card>
      <Header title={`${delivery.courier}${showFlat ? ` · ${delivery.flatNumber}` : ''}`} status={delivery.status} />
      {delivery.description ? <Body muted>{delivery.description}</Body> : null}
      <Body muted>
        Arrived {formatTime(delivery.receivedAt)}
        {delivery.collectedAt ? ` · Collected ${formatTime(delivery.collectedAt)}` : ''}
      </Body>
      {delivery.instruction ? <Body>Resident says: {humanize(delivery.instruction)}</Body> : null}
      <Actions>{children}</Actions>
    </Card>
  );
}

const alertIcon: Record<Alert['type'], string> = { MEDICAL: '🚑', FIRE: '🔥', SECURITY: '🚨', OTHER: '⚠️' };

export function AlertCard({ alert, children }: { alert: Alert; children?: ReactNode }) {
  const active = alert.status === 'ACTIVE';
  return (
    <Card style={active ? { borderColor: colors.danger, borderWidth: 2 } : undefined}>
      <Header title={`${alertIcon[alert.type]} ${humanize(alert.type)} emergency`} status={alert.status} />
      {alert.message ? <Body>{alert.message}</Body> : null}
      <Body muted>
        {alert.raisedByName}
        {alert.flatNumber ? ` · Flat ${alert.flatNumber}` : ''} · {formatTime(alert.createdAt)}
      </Body>
      {alert.acknowledgedByName ? <Body muted>Responding: {alert.acknowledgedByName}</Body> : null}
      {alert.raisedByPhone && alert.status !== 'RESOLVED' ? (
        <Text style={{ color: colors.primary, marginTop: space.xs }} onPress={() => Linking.openURL(`tel:${alert.raisedByPhone}`)}>
          Call {alert.raisedByPhone}
        </Text>
      ) : null}
      <Actions>{children}</Actions>
    </Card>
  );
}
