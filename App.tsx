import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlan } from './src/store/usePlan';
import TimerScreen from './src/screens/TimerScreen';
import AppsScreen from './src/screens/AppsScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import StatsScreen from './src/screens/StatsScreen';
import SetupScreen from './src/screens/SetupScreen';
import { C } from './src/theme';

const Tab = createBottomTabNavigator();

function Root() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.card, primary: C.accent } }}>
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarIconStyle: { display: 'none' }, tabBarLabelStyle: { fontSize: 13, marginBottom: 12 } }}>
          <Tab.Screen name="Timer" component={TimerScreen} />
          <Tab.Screen name="Apps" component={AppsScreen} />
          <Tab.Screen name="Schedule" component={ScheduleScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
          <Tab.Screen name="Setup" component={SetupScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const load = usePlan(s => s.load);
  useEffect(() => { load(); }, [load]);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <Root />
    </SafeAreaProvider>
  );
}
