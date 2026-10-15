import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FocusLock } from '../native/FocusLock';
import { C, s } from '../theme';

export default function StatsScreen() {
  const [data, setData] = useState<[string, number][]>([]);

  useFocusEffect(useCallback(() => {
    FocusLock.getStats().then(o => setData(Object.entries(o).sort((a, b) => a[0].localeCompare(b[0]))));
  }, []));

  const max = Math.max(60, ...data.map(d => d[1]));
  const total = data.reduce((a, d) => a + d[1], 0);
  const fmt = (sec: number) => `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;

  return (
    <View style={s.screen}>
      <Text style={s.h1}>Study statistics</Text>
      <View style={s.card}>
        <Text style={s.sub}>Last 7 days</Text>
        <Text style={{ color: C.accent, fontSize: 34, fontWeight: '800' }}>{fmt(total)}</Text>
      </View>
      <View style={[s.card, { flexDirection: 'row', alignItems: 'flex-end', height: 190 }]}>
        {data.map(([day, sec]) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.sub, fontSize: 10 }}>{Math.round(sec / 60)}m</Text>
            <View style={{ width: 22, height: Math.max(3, (sec / max) * 120), backgroundColor: C.accent, borderRadius: 4, marginVertical: 4 }} />
            <Text style={{ color: C.sub, fontSize: 10 }}>{day.slice(5)}</Text>
          </View>
        ))}
      </View>
      <Text style={s.sub}>Counts time spent in active, non-break focus sessions.</Text>
    </View>
  );
}
