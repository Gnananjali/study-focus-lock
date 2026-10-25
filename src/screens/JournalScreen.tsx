import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useJournal } from '../store/useJournal';
import { FocusLock } from '../native/FocusLock';
import { dateKey, minToStr, strToMin } from '../utils/time';
import { C, s } from '../theme';

const MOODS = ['😞', '🙁', '😐', '🙂', '😄'];

export default function JournalScreen() {
  const { entries, load, save } = useJournal();
  const today = dateKey();
  const [sel, setSel] = useState(today);
  const [text, setText] = useState('');
  const [mood, setMood] = useState(3);
  const [saved, setSaved] = useState(false);
  const [remOn, setRemOn] = useState(true);
  const [remStr, setRemStr] = useState('21:00');

  useEffect(() => {
    load();
    FocusLock.getJournalReminder().then(r => { setRemOn(r.enabled); setRemStr(minToStr(r.minute)); });
  }, [load]);

  const stamp = entries[sel]?.updatedAt;
  useEffect(() => {
    setText(entries[sel]?.text ?? '');
    setMood(entries[sel]?.mood ?? 3);
    setSaved(false);
  }, [sel, stamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const shift = (delta: number) => {
    const [y, m, d] = sel.split('-').map(Number);
    const k = dateKey(new Date(y, m - 1, d + delta));
    if (k <= today) setSel(k);
  };

  const doSave = async () => {
    await save(sel, text, mood);
    setSaved(true);
  };

  const applyReminder = (enabled: boolean, str: string) => {
    const m = strToMin(str);
    if (m === null) return Alert.alert('Invalid time', 'Use HH:MM (24h), e.g. 21:00');
    setRemOn(enabled);
    FocusLock.setJournalReminder(enabled, m);
  };

  const past = Object.keys(entries).filter(k => entries[k].text.trim()).sort().reverse();

  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Journal</Text>
      <View style={[s.row, { marginBottom: 8 }]}>
        <TouchableOpacity onPress={() => shift(-1)}><Text style={{ color: C.accent, fontSize: 22 }}>◀</Text></TouchableOpacity>
        <Text style={s.text}>{sel === today ? `Today (${sel})` : sel}</Text>
        <TouchableOpacity onPress={() => shift(1)}><Text style={{ color: sel === today ? C.sub : C.accent, fontSize: 22 }}>▶</Text></TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {MOODS.map((e, i) => (
          <TouchableOpacity key={i} style={[s.chip, mood === i + 1 && s.chipOn]} onPress={() => { setMood(i + 1); setSaved(false); }}>
            <Text style={{ fontSize: 22 }}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[s.input, { minHeight: 180, textAlignVertical: 'top' }]}
        multiline
        value={text}
        onChangeText={t => { setText(t); setSaved(false); }}
        placeholder="What did you study and do today? What went well? What will you improve?"
        placeholderTextColor={C.sub}
      />
      <TouchableOpacity style={s.btn} onPress={doSave}>
        <Text style={s.btnText}>{saved ? 'Saved ✓' : 'Save entry'}</Text>
      </TouchableOpacity>

      <View style={[s.card, { marginTop: 16 }]}>
        <View style={s.row}>
          <Text style={s.text}>Daily reminder</Text>
          <Switch value={remOn} onValueChange={v => applyReminder(v, remStr)} />
        </View>
        <TextInput
          style={[s.input, { marginTop: 8 }]}
          value={remStr}
          onChangeText={setRemStr}
          onEndEditing={() => applyReminder(remOn, remStr)}
          placeholder="HH:MM" placeholderTextColor={C.sub}
        />
        <Text style={s.sub}>Reminds you at this time if you haven't written today's entry.</Text>
      </View>

      <Text style={[s.text, { marginVertical: 8 }]}>Past entries ({past.length})</Text>
      {past.map(k => (
        <TouchableOpacity key={k} style={s.card} onPress={() => setSel(k)}>
          <Text style={s.text}>{MOODS[entries[k].mood - 1] ?? ''} {k}</Text>
          <Text style={s.sub} numberOfLines={2}>{entries[k].text}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
