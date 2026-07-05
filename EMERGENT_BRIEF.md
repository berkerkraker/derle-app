# DERLE v1.5 — UX & GÖRSEL CİLA GÖREVİ

Rol: Kıdemli mobil ürün tasarımcısı + React Native geliştiricisi olarak çalış.
Proje: Bu repo, yayına hazır bir Expo uygulamasıdır (Expo SDK 54, React Native 0.81,
expo-router, Reanimated 4). Tüm uygulama kodu `frontend/` klasöründedir.
Uygulama TAMAMEN cihaz-içi çalışır: hesap yok, sunucu yok, veri toplanmaz — bu ürünün
kimliğidir ve korunacaktır.

## AMAÇ
Uygulamayı "hobi projesi" görünümünden "1 milyon indirilen premium uygulama"
görünümüne taşı. Mimari ve işlev AYNEN kalacak; yalnızca görsel katman ve
mikro-etkileşimler cilalanacak.

## YAPILACAKLAR (yalnızca görsel/etkileşim katmanı)
1. **Yakala ekranı** (`frontend/app/(tabs)/index.tsx`): giriş kutusu + Derle/Ekle
   buton alanını premium hissettir — boşluk ritmi, gölge/katman dili, tipografi
   ölçeği. Başlık alanı ("Aklında ne var?" + tarih) daha rafine dursun.
2. **Düzen ekranı** (`frontend/app/(tabs)/organize.tsx`): kategori bölümlerinin
   görsel hiyerarşisi, kart/başlık ritmi, boş durumların zarafeti.
3. **Ayarlar** (`frontend/app/settings.tsx`): satır düzeni zaten standart;
   yalnızca ince ayar (ikon rozetleri, bölüm boşlukları, kart yarıçap tutarlılığı).
4. **Sheet'ler** (`frontend/src/context/EditSheetContext.tsx`,
   `frontend/src/components/DerlePreview.tsx`): başlık/eylem hiyerarşisi,
   buton ağırlıkları, iç boşluklar.
5. **Mikro-etkileşimler**: tüm dokunulabilir öğelere pressed-state geri bildirimi;
   geçişler 150–250 ms; abartılı yaylanma YOK (sakin ve kararlı his).
6. **Tema**: renk sistemi `frontend/src/theme/colors.ts` içinde. Marka yeşili
   (#0F766E açık / #2DD4BF koyu vurgu) korunacak. Yaptığın her değişikliği
   AÇIK ve KOYU temada ayrı ayrı kontrol et.
7. **Tab bar** (`frontend/app/(tabs)/_layout.tsx`): iki sekmeli özel bar'ı
   daha zarif yap (aktif durum belirginliği, ikon-etiket dengesi).

## SINIRLAR — İHLAL ETME
- Yeni npm paketi EKLEME. `package.json`, `app.json`, `android/`, `ios/`,
  sürüm numaraları ve build dosyalarına DOKUNMA.
- Hesap/bulut/AI servis çağrısı EKLEME; ağ isteği atan hiçbir kod yazma.
- Şu dosyaların MANTIĞINA dokunma (görselle ilgileri yok):
  `frontend/src/lib/localOrganize.ts`, `frontend/src/context/NotesContext.tsx`,
  `frontend/src/utils/storage/*`, `frontend/src/i18n/I18nContext.tsx`.
- Tüm `testID` prop'ları AYNEN kalacak (test altyapısı bunlara bağlı).
- Mevcut i18n anahtarları (`t("...")`) aynen kalacak; yeni metin gerekirse
  `frontend/src/i18n/strings.ts` dosyasına TR + EN çifti olarak ekle.
  Koda sabit metin (hardcoded string) YAZMA.
- Dosya SİLME. Ekran/route ekleme-çıkarma yok; bilgi mimarisi aynı kalacak.
- Erişilebilirlik: dokunma hedefleri en az 44px, kontrast oranları korunacak.

## BİTİŞ KRİTERİ
- Değişen dosyaların listesini ve her birinde ne yaptığını kısaca yaz.
- Açık ve koyu temada ekran görüntüleriyle önizleme ver.
- Değişiklikleri bu repoya, **`emergent-ux` dalına** push et (main'e DEĞİL).
