import { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, space } from '../theme';
import { humanize } from '../format';

export function Screen({
  children,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
        }
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.muted }]}>{children}</Text>;
}

type Variant = 'primary' | 'secondary' | 'danger' | 'success';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  small,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
}) {
  const bg = { primary: colors.primary, secondary: colors.card, danger: colors.danger, success: colors.success }[variant];
  const fg = variant === 'secondary' ? colors.primary : colors.primaryText;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Row({ children, gap = space.sm }: { children: ReactNode; gap?: number }) {
  return <View style={{ flexDirection: 'row', gap, flexWrap: 'wrap', alignItems: 'center' }}>{children}</View>;
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} accessibilityLabel={label} style={[styles.input, style]} {...props} />
    </View>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
  format = humanize,
}: {
  format?: (v: T) => string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <View style={{ marginBottom: space.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Row>
        {options.map((o) => (
          <Pressable
            key={o}
            accessibilityRole="button"
            accessibilityState={{ selected: value === o }}
            onPress={() => onChange(o)}
            style={[styles.chip, value === o && styles.chipActive]}
          >
            <Text style={[styles.chipText, value === o && { color: colors.primaryText }]}>{format(o)}</Text>
          </Pressable>
        ))}
      </Row>
    </View>
  );
}

const badgeTone: Record<string, [string, string]> = {
  PENDING_APPROVAL: [colors.warningSoft, colors.warning],
  PRE_APPROVED: [colors.infoSoft, colors.primary],
  APPROVED: [colors.successSoft, colors.success],
  CHECKED_IN: [colors.successSoft, colors.success],
  DENIED: [colors.dangerSoft, colors.danger],
  AT_GATE: [colors.warningSoft, colors.warning],
  ACTIVE: [colors.dangerSoft, colors.danger],
  ACKNOWLEDGED: [colors.warningSoft, colors.warning],
};

export function Badge({ value }: { value: string }) {
  const [bg, fg] = badgeTone[value] ?? [colors.neutralSoft, colors.muted];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{humanize(value)}</Text>
    </View>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <Card>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>{children}</Text>
    </Card>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <View style={styles.error}>
      <Text style={{ color: colors.danger }}>{children}</Text>
    </View>
  );
}

export function Loading() {
  return <ActivityIndicator style={{ marginVertical: space.xl }} color={colors.primary} />;
}

export function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card style={{ flexBasis: '47%', flexGrow: 1, marginBottom: 0 }}>
      <Text style={[styles.statValue, tone ? { color: tone } : null]}>{value}</Text>
      <Text style={{ color: colors.muted }}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: space.lg, paddingBottom: space.xl * 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: space.lg,
    marginBottom: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    marginBottom: space.sm,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 2 },
  body: { fontSize: 15, color: colors.text, marginBottom: 2 },
  button: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: space.lg, alignItems: 'center', justifyContent: 'center' },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: space.md },
  buttonText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, color: colors.muted, marginBottom: space.xs },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  error: { backgroundColor: colors.dangerSoft, borderRadius: 10, padding: space.md, marginBottom: space.md },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.text },
});
