import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { FocusLock } from '../native/FocusLock';
import { usePlan } from '../store/usePlan';
import { Status } from '../types';
import { useTasks } from '../store/useTasks';
import { dayLabel, dayStartMs, minToStr, nextSession } from '../utils/time';
import { C, s } from '../theme';

const OPTIONS = [25, 45, 60, 90];

export default function TimerScreen() {
  const [mins, setMins] = useState(45);
  const [st, setSt] = useState<Status | null>(null);
  const plan = usePlan(p => p.plan);
  const tasks = useTasks(t => t.tasks);
  const next = nextSession(plan.schedules);
  const dueSoon = tasks.filter(t => !t.done && t.endAt !== undefined && t.endAt < dayStartMs(1)).length;

  const refresh = useCallback(async () => setSt(await FocusLock.getStatus()), []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const start = async () => {
    if (!plan.blockedPackages.length) return Alert.alert('No apps selected', 'Pick apps to block in the Apps tab first.');
    if (!(await FocusLock.isAccessibilityEnabled())) return Alert.alert('Setup needed', 'Enable the accessibility service in the Setup tab.');
    Alert.alert('Start focus session?', `Selected apps will be blocked for ${mins} minutes. You cannot cancel once started.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: async () => {
          try { await FocusLock.startManualSession(mins); refresh(); }
          catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  return (
    <View style={s.screen}>
      <Text style={s.h1}>Study timer</Text>
      <View style={[s.card, { alignItems: 'center', paddingVertical: 32 }]}>
        {st?.active ? (
          <>
            <Text style={{ color: st.onBreak ? C.good : C.accent, fontSize: 52, fontWeight: '800' }}>{st.remainingMin} min</Text>
            <Text style={s.sub}>{st.onBreak ? 'Break - apps unlocked' : `Focus (${st.source}) - apps blocked`}</Text>
          </>
        ) : (
          <>
            <Text style={{ color: C.text, fontSize: 52, fontWeight: '800' }}>{mins} min</Text>
            <Text style={s.sub}>No active session</Text>
          </>
        )}
      </View>
      <View style={s.card}>
        <Text style={s.sub}>Next session</Text>
        <Text style={s.text}>{next ? `${next.schedule.label} - ${dayLabel(next.dayOffset)} ${minToStr(next.schedule.startMinute)}` : 'Nothing scheduled'}</Text>
        <Text style={[s.sub, { marginTop: 6 }]}>Tasks due today or overdue</Text>
        <Text style={{ color: dueSoon ? C.bad : C.good, fontSize: 16, fontWeight: '700' }}>{dueSoon}</Text>
      </View>
      {!st?.active && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {OPTIONS.map(o => (
              <TouchableOpacity key={o} style={[s.chip, mins === o && s.chipOn]} onPress={() => setMins(o)}>
                <Text style={{ color: mins === o ? '#0F172A' : C.text }}>{o} min</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.btn} onPress={start}>
            <Text style={s.btnText}>Start focus session</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
