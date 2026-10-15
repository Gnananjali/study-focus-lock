import React, { useCallback, useState } from 'react';
import { AppState, PermissionsAndroid, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FocusLock } from '../native/FocusLock';
import { C, s } from '../theme';

export default function SetupScreen() {
  const [ok, setOk] = useState({ acc: false, admin: false, battery: false });

  const refresh = useCallback(async () => {
    setOk({
      acc: await FocusLock.isAccessibilityEnabled(),
      admin: await FocusLock.isAdminActive(),
      battery: await FocusLock.isBatteryExempt(),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      FocusLock.startService();
      const sub = AppState.addEventListener('change', st => st === 'active' && refresh());
      return () => sub.remove();
    }, [refresh]),
  );

  const askNotif = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33)
      await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any);
  };

  const Item = ({ title, desc, done, onPress }: any) => (
    <View style={s.card}>
      <View style={s.row}>
        <Text style={s.text}>{title}</Text>
        <Text style={{ color: done ? C.good : C.bad, fontWeight: '700' }}>{done ? 'ON' : 'OFF'}</Text>
      </View>
      <Text style={[s.sub, { marginVertical: 6 }]}>{desc}</Text>
      {!done && (
        <TouchableOpacity style={s.btn} onPress={onPress}>
          <Text style={s.btnText}>Enable</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={s.screen}>
      <Text style={s.h1}>Setup</Text>
      <Item title="1. Accessibility service" desc="Required. Detects the foreground app. In Settings > Accessibility, find Study Focus Lock and turn it on." done={ok.acc} onPress={FocusLock.openAccessibilitySettings} />
      <Item title="2. Device admin" desc="Makes uninstalling harder. Recommended." done={ok.admin} onPress={FocusLock.requestAdmin} />
      <Item title="3. Unrestricted battery" desc="Stops the phone from killing the service. Also set 'Autostart' for this app on Xiaomi/Oppo/Vivo." done={ok.battery} onPress={FocusLock.requestBatteryExemption} />
      <TouchableOpacity style={s.btn} onPress={askNotif}>
        <Text style={s.btnText}>Allow notifications</Text>
      </TouchableOpacity>
      <Text style={[s.sub, { marginTop: 16 }]}>
        Limits: Android can't make this unbypassable. Safe mode, ADB or a factory reset can still remove it. Strict mode blocks the Settings app during sessions so the lock can't be switched off.
      </Text>
    </ScrollView>
  );
}
