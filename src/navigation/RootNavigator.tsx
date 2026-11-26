import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentProps, ComponentType } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import type { Role } from '../api';
import { useAuth } from '../auth/AuthContext';
import { AddMemberScreen } from '../screens/committee/AddMemberScreen';
import { DashboardScreen } from '../screens/committee/DashboardScreen';
import { MembersScreen } from '../screens/committee/MembersScreen';
import { PostNoticeScreen } from '../screens/committee/PostNoticeScreen';
import { GateScreen } from '../screens/guard/GateScreen';
import { GuardDeliveriesScreen } from '../screens/guard/GuardDeliveriesScreen';
import { LogDeliveryScreen } from '../screens/guard/LogDeliveryScreen';
import { WalkInScreen } from '../screens/guard/WalkInScreen';
import { PreApproveScreen } from '../screens/resident/PreApproveScreen';
import { ResidentDeliveriesScreen } from '../screens/resident/ResidentDeliveriesScreen';
import { ResidentHomeScreen } from '../screens/resident/ResidentHomeScreen';
import { ResidentVisitorsScreen } from '../screens/resident/ResidentVisitorsScreen';
import { AlertsScreen } from '../screens/shared/AlertsScreen';
import { LoginScreen } from '../screens/shared/LoginScreen';
import { NoticesScreen } from '../screens/shared/NoticesScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { RaiseAlertScreen } from '../screens/shared/RaiseAlertScreen';
import { navigationRef, usePushNavigation } from '../notifications/usePushNavigation';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

type Icon = ComponentProps<typeof Ionicons>['name'];
interface TabDef {
  name: string;
  title: string;
  icon: Icon;
  component: ComponentType;
}

// Each role sees its own set of tabs.
const TABS: Record<Role, TabDef[]> = {
  RESIDENT: [
    { name: 'Home', title: 'Home', icon: 'home-outline', component: ResidentHomeScreen },
    { name: 'Visitors', title: 'Visitors', icon: 'people-outline', component: ResidentVisitorsScreen },
    { name: 'Deliveries', title: 'Deliveries', icon: 'cube-outline', component: ResidentDeliveriesScreen },
    { name: 'Alerts', title: 'Alerts', icon: 'warning-outline', component: AlertsScreen },
    { name: 'Notices', title: 'Notices', icon: 'megaphone-outline', component: NoticesScreen },
  ],
  GUARD: [
    { name: 'Gate', title: 'Gate', icon: 'shield-checkmark-outline', component: GateScreen },
    { name: 'Deliveries', title: 'Deliveries', icon: 'cube-outline', component: GuardDeliveriesScreen },
    { name: 'Alerts', title: 'Alerts', icon: 'warning-outline', component: AlertsScreen },
    { name: 'Notices', title: 'Notices', icon: 'megaphone-outline', component: NoticesScreen },
  ],
  COMMITTEE: [
    { name: 'Dashboard', title: 'Dashboard', icon: 'stats-chart-outline', component: DashboardScreen },
    { name: 'Members', title: 'Members', icon: 'people-outline', component: MembersScreen },
    { name: 'Alerts', title: 'Alerts', icon: 'warning-outline', component: AlertsScreen },
    { name: 'Notices', title: 'Notices', icon: 'megaphone-outline', component: NoticesScreen },
  ],
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function RoleTabs({ role }: { role: Role }) {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => navigation.getParent()?.navigate('Profile')}
            style={{ paddingHorizontal: 16 }}
          >
            <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
          </Pressable>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      {TABS[role].map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} color={color} size={size} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, restoring } = useAuth();
  usePushNavigation(user?.role);

  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Tabs" options={{ headerShown: false }}>
              {() => <RoleTabs role={user.role} />}
            </Stack.Screen>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="RaiseAlert" component={RaiseAlertScreen} options={{ title: 'Emergency alert' }} />
              {user.role === 'RESIDENT' ? (
                <Stack.Screen name="PreApprove" component={PreApproveScreen} options={{ title: 'Pre-approve visitor' }} />
              ) : null}
              {user.role === 'GUARD' ? (
                <>
                  <Stack.Screen name="WalkIn" component={WalkInScreen} options={{ title: 'New walk-in visitor' }} />
                  <Stack.Screen name="LogDelivery" component={LogDeliveryScreen} options={{ title: 'Log delivery' }} />
                </>
              ) : null}
              {user.role === 'COMMITTEE' ? (
                <>
                  <Stack.Screen name="AddMember" component={AddMemberScreen} options={{ title: 'Add member' }} />
                  <Stack.Screen name="PostNotice" component={PostNoticeScreen} options={{ title: 'Post notice' }} />
                </>
              ) : null}
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
