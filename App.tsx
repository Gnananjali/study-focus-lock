import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlan } from './src/store/usePlan';
import TimerScreen from './src/screens/TimerScreen';
import TasksScreen from './src/screens/TasksScreen';
import JournalScreen from './src/screens/JournalScreen';
import BlockScreen from './src/screens/BlockScreen';
import StatsScreen from './src/screens/StatsScreen';
import { useTasks } from './src/store/useTasks';
import { FocusLock } from './src/native/FocusLock';
import { C } from './src/theme';

const Tab = createBottomTabNavigator();

function Root() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.card, primary: C.accent } }}>
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarIconStyle: { display: 'none' }, tabBarLabelStyle: { fontSize: 11, marginBottom: 12 } }}>
          <Tab.Screen name="Timer" component={TimerScreen} />
          <Tab.Screen name="Tasks" component={TasksScreen} />
          <Tab.Screen name="Journal" component={JournalScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
          <Tab.Screen name="Block" component={BlockScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const load = usePlan(s => s.load);
  const loadTasks = useTasks(s => s.load);
  useEffect(() => { load(); loadTasks(); FocusLock.startService(); }, [load, loadTasks]);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <Root />
    </SafeAreaProvider>
  );
}
