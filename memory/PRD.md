# Derle — PRD (Product Requirements Document)

## Orijinal problem
Kullanıcının çok beğendiği çalışan "Notun" APK'sını referans alarak, ondan daha kaliteli, Play Store'a hazır, AI destekli ama AI'ya bağımlı olmayan bir "dış beyin" not uygulaması. Kullanıcı uygulamaya girer girmez "Aklında ne var?" alanına ham düşüncelerini yazar; AI yazımı düzeltir ve metni anlamlı parçalara bölüp kategori/öncelik atar (kelimeleri KORUYARAK). Ana ekranda yalnızca öncelikli notlar görünür; gerisi Düzen ekranında kategorilere ayrılır.

- **İsim:** Derle · **Domain:** yamanlabs.app · **Paket:** app.yamanlabs.notes · **Sürüm:** 1.0.0 (versionCode 1)

## Mimari
- **Frontend:** Expo SDK 54 + expo-router. Tab'lar: Yakala + Düzen. Ayarlar sağ üst dişliden modal. Edit, kök seviyede özel animasyonlu overlay (gorhom yerine, web+native güvenilir). Klavye: react-native-keyboard-controller (KeyboardAwareScrollView + KeyboardStickyView).
- **State:** Context'ler — Theme (system/light/dark), I18n (tr/en), Auth (Google), Notes (CRUD + sync + local fallback), EditSheet.
- **Depolama:** `@/src/utils/storage` (cihaz). Notlar `derle.notes` (JSON), ayarlar ayrı anahtarlar, oturum `secureSet`.
- **Backend:** FastAPI + MongoDB. `/api/ai/organize` (OpenAI proxy, kullanıcının kendi anahtarı, başarısızlıkta `source:fallback`), `/api/auth/session|me|logout|account`, `/api/notes|notes/sync` (offline-first LWW + tombstone).
- **AI:** model `gpt-5.4-mini` → fallback `gpt-4o-mini` → cihaz local motoru. Kelime koruyan prompt + JSON schema. Anahtar yalnızca `backend/.env`.

## Personalar
- Kafası dağınık, gün içinde sürekli aklına iş/fikir gelen, hızlı not alıp önemliyi kaybetmek istemeyen kullanıcı (taşınma, sağlık, para/iş planları).

## Çekirdek gereksinimler (statik)
1. Açık "Aklında ne var?" alanı, otomatik odak, kelime sınırı hissi yok.
2. Panelin altında SADECE öncelikli notlar; gerisi Düzen'e.
3. AI kelimeleri korur (sadece imla + bölme), JSON, sadece "Ekle"de çalışır, ucuz/hızlı, anahtar app içinde değil.
4. AI hata → local fallback, not asla kaybolmaz.
5. Not düzenleme + silme (swipe + edit sheet).
6. Tek dokunuşla öncelik (pin) toggle + AI otomatik önceliklendirme.
7. Az ama akıllı kategori (7): Yapılacak, Fikirler, Kişisel, Alışveriş, Sağlık, Para/İş, Notlar + özel kategoriler.
8. Gerçek/dolu Ayarlar: koyu/açık tema, TR/EN tam, özel kategoriler, veri (export/import), gizlilik.
9. Google ile giriş (opsiyonel) + bulut yedek + offline-first senkron + hesap/veri silme.
10. Hızlı açılış, Android'de tutarlı, klavye input/butonu kapatmaz, tutarlı koyu/açık tema.

## Yapıldı (2026-06-23)
- Tüm çekirdek gereksinimler (1–10) uygulandı ve önizlemede doğrulandı (capture, organize gruplama, edit overlay, pin, koyu tema, TR/EN, ayarlar).
- Marka ikonları (yeşil-teal şimşek): icon / adaptive / splash / favicon üretildi.
- app.json Play Store için yapılandırıldı (paket, sürüm, izinler boş, scheme `derle`).
- Domain HTML sayfaları (privacy/terms/support/delete-account) + Play Store rehberi (`/app/deliverables`).
- Local fallback motoru çalışıyor (anahtarsız); backend health/auth/sync uçları hazır.

## Yeni Emergent Ortamına Taşıma (2026-06-23)
- GitHub repo (berkerkraker/derle-app) yeni Emergent ortamına başarıyla aktarıldı.
- Tüm frontend ekranlar (app/(tabs)/index, organize, settings, legal, delete-account) taşındı.
- Tüm src/ (components, context, i18n, lib, theme, hooks, utils) taşındı.
- Backend server.py (392 satır, tam Derle backend) aktarıldı.
- app.json: name=Derle, slug=derle, package=app.yamanlabs.notes olarak güncellendi.
- splash-icon.png dahil tüm assets aktarıldı.
- Eksik paketler kuruldu: @gorhom/bottom-sheet, expo-clipboard, react-native-keyboard-controller.
- backend/.env'e DB_NAME=derle_db ve OPENAI_API_KEY placeholder eklendi.
- Expo preview çalışıyor: welcome overlay, yakala ekranı, not ekleme, düzen ekranı doğrulandı.
- Backend API çalışıyor: {"ok":true,"service":"derle","ai_configured":false}

## Bekleyen / sonraki adımlar
- **P0:** Kullanıcının OpenAI anahtarını `backend/.env`'e ekleyip gerçek AI'yı doğrulamak.
- **P0:** Google girişini gerçek hesapla uçtan uca doğrulamak (otomasyon tamamlayamıyor).
- **P1:** Domain sayfalarını yamanlabs.app'e yayınlamak (Netlify/Dynadot DNS).
- **P1:** Publish ile AAB/APK üretip Internal testing.
- **P2:** Mağaza görselleri (feature graphic, ekran görüntüleri), tam açıklama metni.

## Mocked / not
- AI şu an anahtar boş olduğundan local fallback ile çalışır (bilinçli, hata değil).
- OPENAI_API_KEY backend/.env içinde boş - kullanıcı dolduracak.
