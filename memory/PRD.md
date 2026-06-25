# Derle — PRD (Product Requirements Document)

## Orijinal problem
Kullanıcının çok beğendiği çalışan "Notun" APK'sını referans alarak, ondan daha kaliteli, Play Store'a hazır, AI destekli ama AI'ya bağımlı olmayan bir "dış beyin" not uygulaması. Kullanıcı uygulamaya girer girmez "Aklında ne var?" alanına ham düşüncelerini yazar; AI yazımı düzeltir ve metni anlamlı parçalara bölüp kategori/öncelik atar (kelimeleri KORUYARAK). Ana ekranda yalnızca öncelikli notlar görünür; gerisi Düzen ekranında kategorilere ayrılır.

- **İsim:** Derle · **Domain:** yamanlabs.app · **Paket:** app.yamanlabs.notes · **Sürüm:** 1.0.0 (versionCode 1)

## Mimari
- **Frontend:** Expo SDK 54 + expo-router. Tab'lar: Yakala + Düzen. Ayarlar sağ üst dişliden modal. Edit, kök seviyede özel animasyonlu overlay (gorhom yerine, web+native güvenilir). Klavye: react-native-keyboard-controller (KeyboardAwareScrollView + KeyboardStickyView).
- **State:** Context'ler — Theme (system/light/dark), I18n (tr/en), Auth (Google), Notes (CRUD + sync + local fallback), EditSheet.
- **Depolama:** `@/src/utils/storage` (cihaz). Notlar `derle.notes` (JSON), ayarlar ayrı anahtarlar, oturum `secureSet`.
- **Backend:** FastAPI + MongoDB. `/api/ai/organize` (OpenAI proxy, kullanıcının kendi anahtarı, başarısızlıkta `source:fallback`), `/api/auth/session|me|logout|account`, `/api/notes|notes/sync` (offline-first LWW + tombstone).
- **AI:** model `gpt-4o-mini` → local fallback. Kelime koruyan prompt + JSON schema. Anahtar yalnızca `backend/.env`.

## Personalar
- Kafası dağınık, gün içinde sürekli aklına iş/fikir gelen, hızlı not alıp önemliyi kaybetmek istemeyen kullanıcı (taşınma, sağlık, para/iş planları).

## Çekirdek gereksinimler (statik)
1. Açık "Aklında ne var?" alanı, otomatik odak, kelime sınırı hissi yok.
2. Panelin altında SADECE öncelikli notlar; gerisi Düzen'e.
3. AI kelimeleri korur (sadece imla + bölme), JSON, sadece "Ekle"de çalışır, ucuz/hızlı, anahtar app içinde değil.
4. AI hata → local fallback, not asla kaybolmaz.
5. Not düzenleme + silme (swipe + edit sheet).
6. Tek dokunuşla öncelik (yıldız) toggle + AI otomatik önceliklendirme.
7. Az ama akıllı kategori (7): Yapılacak, Fikirler, Kişisel, Alışveriş, Sağlık, Para/İş, Notlar + özel kategoriler.
8. Gerçek/dolu Ayarlar: koyu/açık tema, TR/EN tam, özel kategoriler, veri (export/import), gizlilik.
9. Google ile giriş (opsiyonel) + bulut yedek + offline-first senkron + hesap/veri silme.
10. Hızlı açılış, Android'de tutarlı, klavye input/butonu kapatmaz, tutarlı koyu/açık tema.

## Yapıldı

### Orijinal Geliştirme (2026-06-23, eski hesap)
- Tüm çekirdek gereksinimler (1–10) uygulandı ve önizlemede doğrulandı (capture, organize gruplama, edit overlay, pin, koyu tema, TR/EN, ayarlar).
- Marka ikonları (yeşil-teal şimşek): icon / adaptive / splash / favicon üretildi.
- app.json Play Store için yapılandırıldı (paket, sürüm, izinler boş, scheme `derle`).
- Domain HTML sayfaları (privacy/terms/support/delete-account) + Play Store rehberi (`/app/deliverables`).
- Local fallback motoru çalışıyor (anahtarsız); backend health/auth/sync uçları hazır.

### Release Candidate Kalite Turu (2026-06-25)

### Yapıldı:
- **AI prompt** yeniden yazıldı: tek cümlede birden fazla görev AGGRESSIVELY ayrıştırılıyor.
  Örnek: "süt al kahve al annemi ara müşteriyle konuş sunumu hazırla" → 5 ayrı not (doğrulandı ✅)
- **localOrganize.ts**: virgül/noktalı virgül bazlı bölme eklendi (fallback iyileştirildi).
- **NotesContext.addFromText**: Non-blocking yeniden yazıldı.
  Ekle'ye basınca → anında local save, UI donmaz, AI arka planda çalışır, sonuç gelince notlar güncellenir.
- **Capture ekranı (index.tsx)**: Öncelikli notlar artık kategori başlıklarıyla gruplanıyor
  (Alışveriş, Kişisel, Para/İş, vb.) — aç/kapat destekli. AI işlenirken küçük spinner.
- **Checkbox.tsx**: Reanimated spring animasyonu eklendi (bounce on toggle).
- **settings.tsx**: Dil seçimi kompaktlaştırıldı (SegmentedControl → TR/EN pill butonlar).
  Titreşim tek satır toggle (sub-label kaldırıldı).
- **backend/server.py**: AI model default gpt-4o-mini olarak düzeltildi.
- **OPENAI_API_KEY** backend'e eklendi → ai_configured=True.

### Test Sonuçları (11/11 backend + tüm frontend ✅)
- AI doğru ayrıştırıyor: source=ai, items=5 (alisveris/kisisel/gorevler/para_is)
- Non-blocking: input anında temizleniyor, not hemen görünüyor
- Priority gruplandırma: capture ekranında kategori başlıkları çalışıyor
- Settings: TR/EN pill, tek satır haptics
- Dark theme çalışıyor
- Organize aç/kapat çalışıyor
- GitHub repo (https://github.com/berkerkraker/derle-app) yeni Emergent ortamına aktarıldı.
- Tüm frontend ekranlar: app/(tabs)/index, organize, settings, legal, delete-account.
- Tüm src/: components (9 dosya), context (Auth/Notes/EditSheet), i18n (TR/EN), lib (api/format/haptics/localOrganize), theme, hooks, utils.
- Backend: server.py (392 satır, FastAPI+MongoDB+OpenAI proxy) aktarıldı.
- app.json: name=Derle, slug=derle, scheme=derle, package=app.yamanlabs.notes güncellendi.
- splash-icon.png dahil tüm assets aktarıldı.
- Eksik paketler kuruldu: @gorhom/bottom-sheet@5.2.14, expo-clipboard@8.0.8, react-native-keyboard-controller@1.18.5.
- backend/.env: DB_NAME=derle_db, OPENAI_API_KEY placeholder eklendi.
- root app/index.tsx: Redirect to /(tabs) ile güncellendi.
- Tüm testler geçti: 6/6 backend, tüm frontend akışları (welcome, yakala, note ekleme, düzen, edit, ayarlar, tema).

## Bekleyen / sonraki adımlar
- **P0:** OPENAI_API_KEY girişi → Emergent "Secrets/Env" alanına veya backend/.env'e.
- **P0:** Google girişini gerçek hesapla uçtan uca doğrulamak.
- **P1:** Publish ile AAB/APK üretip Internal testing.
- **P1:** Domain sayfalarını yamanlabs.app'e yayınlamak (Netlify/Dynadot DNS).
- **P2:** Mağaza görselleri (feature graphic, ekran görüntüleri), tam açıklama metni.

## Mocked / not
- AI şu an anahtar boş olduğundan local fallback ile çalışır (bilinçli, hata değil).
- OPENAI_API_KEY backend/.env içinde boş — kullanıcı dolduracak.
