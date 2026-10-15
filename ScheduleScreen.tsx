import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePlan } from '../store/usePlan';
import { PlannedBreak, StudySchedule, Weekday } from '../types';
import { DAY_NAMES, minToStr, strToMin } from '../utils/time';
import { C, s } from '../theme';

export default function ScheduleScreen() {
  const { plan, update } = usePlan();
  const [label, setLabel] = useState('Evening study');
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('20:00');
  const [days, setDays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [brOffset, setBrOffset] = useState('50');
  const [brDur, setBrDur] = useState('10');

  const add = () => {
    const sm = strToMin(start), em = strToMin(end);
    if (sm === null || em === null || em <= sm) return Alert.alert('Invalid time', 'Use HH:MM (24h) and make end later than start.');
    if (!days.length) return Alert.alert('Pick at least one day');
    const breaks: PlannedBreak[] = [];
    const o = parseInt(brOffset, 10), d = parseInt(brDur, 10);
    if (o > 0 && d > 0 && o + d < em - sm) breaks.push({ startOffsetMin: o, durationMin: d });
    const sch: StudySchedule = { id: String(Date.now()), label: label || 'Study', days, startMinute: sm, endMinute: em, breaks, enabled: true };
    update({ schedules: [...plan.schedules, sch] });
  };

  const patch = (id: string, p: Partial<StudySchedule>) =>
    update({ schedules: plan.schedules.map(x => (x.id === id ? { ...x, ...p } : x)) });
  const remove = (id: string) => update({ schedules: plan.schedules.filter(x => x.id !== id) });

  return (
    <ScrollView style={s.screen}>
      <Text style={s.h1}>Recurring schedules</Text>
      {plan.schedules.map(x => (
        <View key={x.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.text}>{x.label}</Text>
            <Switch value={x.enabled} onValueChange={v => patch(x.id, { enabled: v })} />
          </View>
          <Text style={s.sub}>{minToStr(x.startMinute)} - {minToStr(x.endMinute)} | {x.days.map(d => DAY_NAMES[d]).join(' ')}</Text>
          {x.breaks.map((b, i) => (
            <Text key={i} style={s.sub}>Break: after {b.startOffsetMin} min for {b.durationMin} min</Text>
          ))}
          <TouchableOpacity onPress={() => remove(x.id)}><Text style={{ color: C.bad, marginTop: 6 }}>Delete</Text></TouchableOpacity>
        </View>
      ))}

      <Text style={[s.text, { marginTop: 12, marginBottom: 8 }]}>New schedule</Text>
      <TextInput style={s.input} value={label} onChangeText={setLabel} placeholder="Label" placeholderTextColor={C.sub} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[s.input, { flex: 1 }]} value={start} onChangeText={setStart} placeholder="Start HH:MM" placeholderTextColor={C.sub} />
        <TextInput style={[s.input, { flex: 1 }]} value={end} onChangeText={setEnd} placeholder="End HH:MM" placeholderTextColor={C.sub} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {DAY_NAMES.map((n, i) => {
          const on = days.includes(i as Weekday);
          return (
            <TouchableOpacity key={n} style={[s.chip, on && s.chipOn]}
              onPress={() => setDays(on ? days.filter(d => d !== i) : [...days, i as Weekday])}>
              <Text style={{ color: on ? '#0F172A' : C.text }}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[s.sub, { marginVertical: 6 }]}>Planned break (minutes after start / length). Set 0 for none.</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[s.input, { flex: 1 }]} value={brOffset} onChangeText={setBrOffset} keyboardType="number-pad" />
        <TextInput style={[s.input, { flex: 1 }]} value={brDur} onChangeText={setBrDur} keyboardType="number-pad" />
      </View>
      <TouchableOpacity style={s.btn} onPress={add}><Text style={s.btnText}>Add schedule</Text></TouchableOpacity>
      <Text style={[s.sub, { marginTop: 12, marginBottom: 40 }]}>Schedules can't be edited while a session is running.</Text>
    </ScrollView>
  );
}
