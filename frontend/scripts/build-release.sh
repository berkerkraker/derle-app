#!/usr/bin/env bash
# Derle — imzalı release APK + AAB üretimi (tamamen yerel, Expo/EAS hesabı gerekmez).
#
# Gereksinimler (bir kez kurulur):
#   ~/tools/jdk17                      — Temurin JDK 17
#   ~/android-sdk                      — Android SDK (platform 36, build-tools 36.0.0)
#   ~/derle-release-keys/              — keystore + keystore.properties (REPOYA GİRMEZ)
#
# Kullanım:  ./scripts/build-release.sh
# Çıktılar:  dist-release/derle-<sürüm>.apk  ve  .aab
set -euo pipefail

export JAVA_HOME="$HOME/tools/jdk17"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

FRONTEND="$(cd "$(dirname "$0")/.." && pwd)"
KEYS_PROPS="$HOME/derle-release-keys/keystore.properties"
[ -f "$KEYS_PROPS" ] || { echo "HATA: $KEYS_PROPS yok — imza anahtarları bulunamadı."; exit 1; }

# node (nvm) hazırla
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$FRONTEND"

# 1) Native proje yoksa üret (android/ gitignore'da — kaynak gerçekliği app.json)
[ -d android ] || npx expo prebuild -p android --no-install

# 2) İmza yapılandırmasını enjekte et (idempotent)
GRADLE="android/app/build.gradle"
if ! grep -q "DERLE_UPLOAD_STORE_FILE" "$GRADLE"; then
  perl -0pi -e "s|(signingConfigs \{\n        debug \{[^}]*\}\n)|\$1        release {
            def props = new Properties()
            file('$KEYS_PROPS').withInputStream { props.load(it) }
            storeFile file(props['DERLE_UPLOAD_STORE_FILE'])
            storePassword props['DERLE_UPLOAD_STORE_PASSWORD']
            keyAlias props['DERLE_UPLOAD_KEY_ALIAS']
            keyPassword props['DERLE_UPLOAD_KEY_PASSWORD']
        }\n|" "$GRADLE"
  perl -0pi -e "s|(release \{\n            // Caution[^\n]*\n            // see[^\n]*\n            signingConfig signingConfigs)\.debug|\$1.release|" "$GRADLE"
fi
grep -q "signingConfig signingConfigs.release" "$GRADLE" || { echo "HATA: imza enjeksiyonu başarısız."; exit 1; }

# 3) Build
cd android
./gradlew --no-daemon assembleRelease bundleRelease

# 4) İmzayı doğrula + çıktıyı adlandır
cd "$FRONTEND"
VERSION=$(node -p "require('./app.json').expo.version")
BT="$ANDROID_HOME/build-tools/36.0.0"
mkdir -p dist-release
cp android/app/build/outputs/apk/release/app-release.apk "dist-release/derle-$VERSION.apk"
cp android/app/build/outputs/bundle/release/app-release.aab "dist-release/derle-$VERSION.aab"
"$BT/apksigner" verify --print-certs "dist-release/derle-$VERSION.apk" | head -4

echo
echo "TAMAM ✔  dist-release/derle-$VERSION.apk  +  .aab"
