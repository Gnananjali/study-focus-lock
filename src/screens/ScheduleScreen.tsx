import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePlan } from '../store/usePlan';
import { PlannedBreak, StudySchedule, Weekday } from '../types';
import { DAY_NAMES, minToStr, nextSession, dayLabel, strToMin } from '../utils/time';
import { C, s } from '../theme';

const PRESETS: { label: string; days: Weekday[] }[] = [
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Weekends', days: [0, 6] },
  { label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
];

export default function ScheduleScreen() {
  const { plan, update } = usePlan();
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState('Evening study');
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('20:00');
  const [days, setDays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [breaks, setBreaks] = useState<PlannedBreak[]>([{ startOffsetMin: 50, durationMin: 10 }]);

  const reset = () => {
    setEditId(null); setLabel('Evening study'); setStart('18:00'); setEnd('20:00');
    setDays([1, 2, 3, 4, 5]); setBreaks([{ startOffsetMin: 50, durationMin: 10 }]);
  };

  const edit = (x: StudySchedule) => {
    setEditId(x.id); setLabel(x.label); setStart(minToStr(x.startMinute)); setEnd(minToStr(x.endMinute));
    setDays(x.days); setBreaks(x.breaks);
  };

  const save = async () => {
    const sm = strToMin(start), em = strToMin(end);
    if (sm === null || em === null || em <= sm) return Alert.alert('Invalid time', 'Use HH:MM (24h) and make end later than start.');
    if (!days.length) return Alert.alert('Pick at least one day');
    const len = em - sm;
    const clean = breaks
      .filter(b => b.startOffsetMin >= 0 && b.durationMin > 0)
      .sort((a, b) => a.startOffsetMin - b.startOffsetMin);
    for (let i = 0; i < clean.length; i++) {
      const b = clean[i];
      if (b.startOffsetMin + b.durationMin >= len) return Alert.alert('Break too late', 'Every break must finish before the session ends.');
      if (i > 0 && clean[i - 1].startOffsetMin + clean[i - 1].durationMin > b.startOffsetMin)
        return Alert.alert('Breaks overlap', 'Breaks cannot overlap each other.');
    }
    const sch: StudySchedule = {
      id: editId ?? String(Date.now()), label: label.trim() || 'Study', days,
      startMinute: sm, endMinute: em, breaks: clean,
      enabled: editId ? plan.schedules.find(x => x.id === editId)?.enabled ?? true : true,
    };
    await update({ schedules: editId ? plan.schedules.map(x => (x.id === editId ? sch : x)) : [...plan.schedules, sch] });
    reset();
  };

  const patch = (id: string, p: Partial<StudySchedule>) =>
    update({ schedules: plan.schedules.map(x => (x.id === id ? { ...x, ...p } : x)) });
  const remove = (id: string) => {
    if (editId === id) reset();
    update({ schedules: plan.schedules.filter(x => x.id !== id) });
  };
  const setBreak = (i: number, p: Partial<PlannedBreak>) => setBreaks(breaks.map((b, j) => (j === i ? { ...b, ...p } : b)));
  const num = (t: string) => parseInt(t.replace(/\D/g, ''), 10) || 0;

  const next = nextSession(plan.schedules);

  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Schedule</Text>

      <View style={s.card}>
        <Text style={s.sub}>Next session</Text>
        <Text style={{ color: C.accent, fontSize: 18, fontWeight: '700' }}>
          {next ? `${next.schedule.label} - ${dayLabel(next.dayOffset)} ${minToStr(next.schedule.startMinute)}` : 'Nothing scheduled'}
        </Text>
      </View>

      {plan.schedules.map(x => (
        <View key={x.id} style={[s.card, editId === x.id && { borderWidth: 1, borderColor: C.accent }]}>
          <View style={s.row}>
            <Text style={s.text}>{x.label}</Text>
            <Switch value={x.enabled} onValueChange={v => patch(x.id, { enabled: v })} />
          </View>
          <Text style={s.sub}>{minToStr(x.startMinute)} - {minToStr(x.endMinute)} | {x.days.map(d => DAY_NAMES[d]).join(' ')}</Text>
          {x.breaks.map((b, i) => (
            <Text key={i} style={s.sub}>Break {i + 1}: after {b.startOffsetMin} min for {b.durationMin} min</Text>
          ))}
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 6 }}>
            <TouchableOpacity onPress={() => edit(x)}><Text style={{ color: C.accent }}>Edit</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(x.id)}><Text style={{ color: C.bad }}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[s.text, { marginTop: 12, marginBottom: 8 }]}>{editId ? 'Edit schedule' : 'New schedule'}</Text>
      <TextInput style={s.input} value={label} onChangeText={setLabel} placeholder="Label" placeholderTextColor={C.sub} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[s.input, { flex: 1 }]} value={start} onChangeText={setStart} placeholder="Start HH:MM" placeholderTextColor={C.sub} />
        <TextInput style={[s.input, { flex: 1 }]} value={end} onChangeText={setEnd} placeholder="End HH:MM" placeholderTextColor={C.sub} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <TouchableOpacity key={p.label} style={[s.chip, { borderWidth: 1, borderColor: C.accent }]} onPress={() => setDays(p.days)}>
            <Text style={{ color: C.accent }}>{p.label}</Text>
          </TouchableOpacity>
        ))}
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

      <Text style={[s.sub, { marginVertical: 6 }]}>Planned breaks: minutes after start / length in minutes. Apps unlock during breaks.</Text>
      {breaks.map((b, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput style={[s.input, { flex: 1 }]} value={String(b.startOffsetMin)} onChangeText={t => setBreak(i, { startOffsetMin: num(t) })} keyboardType="number-pad" />
          <TextInput style={[s.input, { flex: 1 }]} value={String(b.durationMin)} onChangeText={t => setBreak(i, { durationMin: num(t) })} keyboardType="number-pad" />
          <TouchableOpacity onPress={() => setBreaks(breaks.filter((_, j) => j !== i))} style={{ paddingBottom: 8 }}>
            <Text style={{ color: C.bad, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => setBreaks([...breaks, { startOffsetMin: 60, durationMin: 10 }])}>
        <Text style={{ color: C.accent, marginBottom: 6 }}>+ Add another break</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnText}>{editId ? 'Save changes' : 'Add schedule'}</Text></TouchableOpacity>
      {editId && <TouchableOpacity style={{ alignItems: 'center', marginTop: 10 }} onPress={reset}><Text style={s.sub}>Cancel editing</Text></TouchableOpacity>}
      <Text style={[s.sub, { marginTop: 12, marginBottom: 40 }]}>Schedules cannot be changed while a session is running.</Text>
    </ScrollView>
  );
}
