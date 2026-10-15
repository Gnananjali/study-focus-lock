# Study Focus Lock - get the APK (no local tools needed)

1. Create a free account at github.com and a NEW repository (name: study-focus-lock, Public, no README).
2. On the new repo page click "uploading an existing file" and drag in EVERYTHING from this folder
   (including the hidden .github folder - if your file manager hides it, use GitHub Desktop or the git commands below).
3. Commit. Open the Actions tab -> "Build APK" runs automatically (about 10-15 min).
4. When it turns green, open the repo's Releases section (right side). Download StudyFocusLock.apk.
   That Releases page URL is the link you share.

Git alternative:
  git init && git add . && git commit -m "init" && git branch -M main
  git remote add origin https://github.com/YOURNAME/study-focus-lock.git && git push -u origin main
