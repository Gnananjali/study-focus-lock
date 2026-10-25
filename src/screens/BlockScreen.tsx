import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AppsScreen from './AppsScreen';
import ScheduleScreen from './ScheduleScreen';
import SetupScreen from './SetupScreen';
import { C, s } from '../theme';

const TABS = ['Apps', 'Schedule', 'Setup'] as const;

export default function BlockScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Apps');
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', padding: 12, paddingBottom: 0 }}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={{ color: tab === t ? '#0F172A' : C.text }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'Apps' && <AppsScreen />}
      {tab === 'Schedule' && <ScheduleScreen />}
      {tab === 'Setup' && <SetupScreen />}
    </View>
  );
}
