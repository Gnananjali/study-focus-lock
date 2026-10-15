import { StyleSheet } from 'react-native';

export const C = { bg: '#0F172A', card: '#1E293B', text: '#F8FAFC', sub: '#94A3B8', accent: '#38BDF8', good: '#4ADE80', bad: '#F87171' };

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 16 },
  h1: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  text: { color: C.text, fontSize: 16 },
  sub: { color: C.sub, fontSize: 14 },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { backgroundColor: C.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: C.card, marginRight: 6, marginBottom: 6 },
  chipOn: { backgroundColor: C.accent },
  input: { backgroundColor: C.card, color: C.text, borderRadius: 8, padding: 10, marginBottom: 8 },
});
