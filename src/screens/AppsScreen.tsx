import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Switch, Text, TextInput, View } from 'react-native';
import { FocusLock } from '../native/FocusLock';
import { usePlan } from '../store/usePlan';
import { AppInfo } from '../types';
import { C, s } from '../theme';

export default function AppsScreen() {
  const [apps, setApps] = useState<AppInfo[] | null>(null);
  const [q, setQ] = useState('');
  const { plan, update } = usePlan();

  useEffect(() => { FocusLock.getInstalledApps().then(setApps); }, []);

  const shown = useMemo(
    () => (apps ?? []).filter(a => a.label.toLowerCase().includes(q.toLowerCase())),
    [apps, q],
  );

  const toggle = (pkg: string, on: boolean) =>
    update({ blockedPackages: on ? [...plan.blockedPackages, pkg] : plan.blockedPackages.filter(p => p !== pkg) });

  return (
    <View style={s.screen}>
      <Text style={s.h1}>Apps to block ({plan.blockedPackages.length})</Text>
      <View style={[s.card, s.row]}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={s.text}>Strict mode</Text>
          <Text style={s.sub}>Also blocks Settings and the app installer during sessions</Text>
        </View>
        <Switch value={plan.strictMode} onValueChange={v => update({ strictMode: v })} />
      </View>
      <TextInput style={s.input} placeholder="Search apps" placeholderTextColor={C.sub} value={q} onChangeText={setQ} />
      {!apps ? <ActivityIndicator color={C.accent} /> : (
        <FlatList
          data={shown}
          keyExtractor={a => a.package}
          renderItem={({ item }) => (
            <View style={[s.card, s.row]}>
              <Text style={[s.text, { flex: 1 }]} numberOfLines={1}>{item.label}</Text>
              <Switch value={plan.blockedPackages.includes(item.package)} onValueChange={v => toggle(item.package, v)} />
            </View>
          )}
        />
      )}
    </View>
  );
}
