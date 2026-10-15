// Run from project root: node tools/patch-android.js
const fs = require('fs');
const P = 'com.studyfocuslock.focus';

const manPath = 'android/app/src/main/AndroidManifest.xml';
let m = fs.readFileSync(manPath, 'utf8');
if (!m.includes('FocusAccessibilityService')) {
  const perms = `
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>
`;
  const comps = `
        <service android:name="${P}.FocusAccessibilityService" android:exported="true"
            android:label="Study Focus Lock" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter><action android:name="android.accessibilityservice.AccessibilityService" /></intent-filter>
            <meta-data android:name="android.accessibilityservice" android:resource="@xml/accessibility_service_config" />
        </service>
        <service android:name="${P}.EnforcementService" android:exported="false" android:foregroundServiceType="specialUse">
            <property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE" android:value="study_focus_enforcement" />
        </service>
        <receiver android:name="${P}.BootReceiver" android:exported="true">
            <intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>
        </receiver>
        <receiver android:name="${P}.AdminReceiver" android:exported="true" android:permission="android.permission.BIND_DEVICE_ADMIN">
            <meta-data android:name="android.app.device_admin" android:resource="@xml/device_admin" />
            <intent-filter><action android:name="android.app.action.DEVICE_ADMIN_ENABLED" /></intent-filter>
        </receiver>
        <activity android:name="${P}.BlockActivity" android:exported="false" android:excludeFromRecents="true"
            android:launchMode="singleTask" android:taskAffinity=""
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar" />
`;
  m = m.replace('<application', perms + '\n    <application').replace('</application>', comps + '    </application>');
  fs.writeFileSync(manPath, m);
  console.log('Patched AndroidManifest.xml');
} else console.log('Manifest already patched');

const appPath = 'android/app/src/main/java/com/studyfocuslock/MainApplication.kt';
let a = fs.readFileSync(appPath, 'utf8');
if (!a.includes('FocusPackage')) {
  const re = /PackageList\(this\)\.packages\.apply \{/;
  if (!re.test(a)) { console.error('Could not find PackageList in MainApplication.kt - add add(' + P + '.FocusPackage()) manually.'); process.exit(1); }
  a = a.replace(re, m0 => m0 + `\n              add(${P}.FocusPackage())`);
  fs.writeFileSync(appPath, a);
  console.log('Patched MainApplication.kt');
} else console.log('MainApplication already patched');
