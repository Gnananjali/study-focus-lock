# Study Focus Lock - source overlay

1. npx @react-native-community/cli@latest init StudyFocusLock
2. cd StudyFocusLock
3. npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context zustand date-fns
4. Copy everything from this zip over the project folder (overwrite App.tsx)
5. node tools/patch-android.js
6. npx react-native run-android      (phone via USB)
   or: cd android && ./gradlew assembleRelease  -> android/app/build/outputs/apk/release/app-release.apk
7. Or push the project to GitHub, run the "Build APK" workflow (Actions tab), download the artifact.
