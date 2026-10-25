import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTasks } from '../store/useTasks';
import { dayLabel, dayStartMs, fmtWhen, strToMin } from '../utils/time';
import { C, s } from '../theme';

export default function TasksScreen() {
  const { tasks, load, add, toggle, remove } = useTasks();
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(0); // -1 = no date
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');

  useEffect(() => { load(); }, [load]);

  const submit = () => {
    if (!title.trim()) return Alert.alert('Enter a task name');
    let startAt: number | undefined, endAt: number | undefined;
    if (day >= 0) {
      const base = dayStartMs(day);
      if (startStr.trim()) {
        const m = strToMin(startStr);
        if (m === null) return Alert.alert('Invalid start time', 'Use HH:MM (24h), e.g. 17:30');
        startAt = base + m * 60000;
      }
      const em = strToMin(endStr);
      if (em === null) return Alert.alert('End time needed', 'Add an end time (HH:MM) so I can remind you when the task is over.');
      endAt = base + em * 60000;
      if (startAt !== undefined && endAt <= startAt) return Alert.alert('End must be after start');
      if (endAt < Date.now()) return Alert.alert('That end time has already passed');
    }
    add({ title: title.trim(), startAt, endAt });
    setTitle(''); setStartStr(''); setEndStr('');
    Keyboard.dismiss();
  };

  const pending = tasks.filter(t => !t.done).sort((a, b) => (a.endAt ?? Infinity) - (b.endAt ?? Infinity));
  const done = tasks.filter(t => t.done);
  const now = Date.now();

  const Row = ({ t }: { t: (typeof tasks)[number] }) => {
    const overdue = !t.done && t.endAt !== undefined && t.endAt < now;
    return (
      <View style={[s.card, s.row]}>
        <TouchableOpacity onPress={() => toggle(t.id)} style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 24, color: t.done ? C.good : C.sub }}>{t.done ? '☑' : '☐'}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.text, t.done && { textDecorationLine: 'line-through', color: C.sub }]}>{t.title}</Text>
          {t.endAt !== undefined && (
            <Text style={{ color: overdue ? C.bad : C.sub, fontSize: 13 }}>
              {t.startAt !== undefined ? `${fmtWhen(t.startAt)} to ` : 'Until '}{fmtWhen(t.endAt)}{overdue ? '  (overdue)' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => remove(t.id)}><Text style={{ color: C.bad }}>Delete</Text></TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Tasks</Text>
      <View style={s.card}>
        <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="New task (e.g. Chapter 4 maths)" placeholderTextColor={C.sub} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[-1, 0, 1, 2, 3, 4, 5, 6].map(o => (
            <TouchableOpacity key={o} style={[s.chip, day === o && s.chipOn]} onPress={() => setDay(o)}>
              <Text style={{ color: day === o ? '#0F172A' : C.text }}>{o === -1 ? 'No date' : dayLabel(o)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {day >= 0 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[s.input, { flex: 1 }]} value={startStr} onChangeText={setStartStr} placeholder="Start HH:MM (optional)" placeholderTextColor={C.sub} />
            <TextInput style={[s.input, { flex: 1 }]} value={endStr} onChangeText={setEndStr} placeholder="End HH:MM" placeholderTextColor={C.sub} />
          </View>
        )}
        <TouchableOpacity style={s.btn} onPress={submit}><Text style={s.btnText}>Add task</Text></TouchableOpacity>
        <Text style={[s.sub, { marginTop: 8 }]}>You get a notification at the start and end time, even if the app is closed.</Text>
      </View>

      <Text style={[s.text, { marginVertical: 8 }]}>To do ({pending.length})</Text>
      {pending.length === 0 && <Text style={s.sub}>Nothing pending.</Text>}
      {pending.map(t => <Row key={t.id} t={t} />)}
      {done.length > 0 && <Text style={[s.text, { marginVertical: 8 }]}>Done ({done.length})</Text>}
      {done.map(t => <Row key={t.id} t={t} />)}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
