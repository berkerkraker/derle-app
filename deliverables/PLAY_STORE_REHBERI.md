# Derle — Play Store Yayın Rehberi (sıfır teknik bilgi için)

Bu rehber, **Derle** uygulamasını Google Play Store'a yüklemen için adım adım anlatır.
Teknik kısımların tamamı senin için hazır. Senin yapman gerekenler aşağıda **"SEN YAP"** etiketiyle işaretli.

---

## 0) Özet — kim ne yapıyor?

| Konu | Durum |
|---|---|
| Uygulama (Yakala / Düzen / Ayarlar) | ✅ Hazır, çalışıyor |
| Koyu/açık tema, TR/EN dil | ✅ Çalışıyor |
| AI ile not düzenleme (kelimeleri koruyan) | ✅ Hazır — **sadece OpenAI anahtarın eklenince devreye girer** |
| AI yoksa local motor (not asla kaybolmaz) | ✅ Çalışıyor |
| Google ile giriş + bulut yedek + senkron | ✅ Hazır (Emergent yönetimli, ekstra kurulum yok) |
| Hesap & veri silme (uygulama içi) | ✅ Hazır |
| App icon / adaptive icon / splash | ✅ Üretildi |
| Paket adı, versiyon | ✅ `app.yamanlabs.notes`, 1.0.0 (versionCode 1) |
| Domain sayfaları (privacy/terms/support/delete-account) | 📄 HTML dosyaları hazır — **SEN YAYINLA** |
| OpenAI API anahtarı | 🔑 **SEN VER** (bana yaz, ben backend'e koyarım) |
| APK / AAB üretimi | 🟢 Emergent **Publish** butonuyla (SEN tıkla) |

---

## 1) AI — model, anahtar, güvenlik

- **Kullanılan model:** `gpt-5.4-mini` (varsayılan). Eğer hesabında bu model yoksa otomatik olarak `gpt-4o-mini`'ye düşer. İkisi de ucuz ve hızlıdır. **5 dolarlık bütçe çok uzun gider** çünkü AI sadece "Ekle"ye bastığında 1 kez çalışır, her tuşta değil, ve cevap kısadır.
- **Anahtar nereye konacak:** Sadece **sunucuda (`backend/.env` → `OPENAI_API_KEY`)**. 
- **Anahtar nereye KESİNLİKLE konmayacak:** Mobil uygulamanın içine. Telefon doğrudan OpenAI'a gitmez; her zaman bizim güvenli sunucumuza gider, sunucu OpenAI'a gider. Yani anahtarın APK içinde sızmaz.
- **AI bozulursa:** Not yine kaydedilir; cihazdaki local motor metni böler/kategoriler. **Hiçbir not kaybolmaz.**
- **AI kelimelerini korur:** Sadece yazım hatasını düzeltir ve uzun metni anlamlı parçalara böler. Cümleni yeniden yazmaz, kısaltmaz, içinden bir şey silmez.

### SEN YAP — OpenAI anahtarı
1. https://platform.openai.com/api-keys adresine gir, **Create new secret key** ile bir anahtar oluştur (sk-... ile başlar).
2. Faturalandırmaya 5$ yükle (Billing).
3. Anahtarı **buraya, sohbete yapıştır.** Ben `backend/.env` içine koyarım; sen hiçbir dosyaya elle dokunmazsın.

---

## 2) Notlar nerede saklanıyor / yedekleme

- **Cihazda:** Tüm notlar önce telefonda saklanır (offline-first). İnternet olmasa da çalışır.
- **Bulutta (Google ile giriş yapınca):** Notların yalnızca sana özel güvenli veritabanında yedeklenir. Telefon değişirsen aynı Google hesabıyla giriş yapınca notların geri gelir.
- **Google'a not kaydedilmez:** Google hesabı sadece kimlik içindir; notların Gmail'e yazılmaz.
- **Ek manuel yedek:** Ayarlar → Veri → "Notları dışa aktar" ile JSON panoya kopyalanır; "Panodan içe aktar" ile geri yüklenir.
- **Çakışma:** En son güncellenen kazanır (last-write-wins); veri kaybı olmaz.

---

## 3) Domain sayfaları (yamanlabs.app) — SEN YAYINLA

Google Play, hesap sistemi olan uygulamalar için **herkese açık** bir gizlilik politikası URL'si ve veri silme bilgisi ister. 4 hazır HTML dosyası teslimatlarda:

- `privacy.html` → **https://yamanlabs.app/privacy**
- `terms.html` → **https://yamanlabs.app/terms**
- `support.html` → **https://yamanlabs.app/support**
- `delete-account.html` → **https://yamanlabs.app/delete-account**

### Domain'ini (Dynadot) nasıl bağlarsın — en kolay yol (Netlify, ücretsiz)
1. https://app.netlify.com → ücretsiz hesap aç.
2. "Add new site → Deploy manually" → 4 HTML dosyasını sürükleyip bırak. (İpucu: her dosyayı `index.html` olarak ayrı klasöre koy: `privacy/index.html`, `terms/index.html`, `support/index.html`, `delete-account/index.html` → böylece `/privacy` gibi temiz adresler olur.)
3. Site yayınlanınca Netlify sana `xxx.netlify.app` adresi verir.
4. Netlify → **Domain settings → Add custom domain → yamanlabs.app**.
5. Netlify sana DNS kayıtları verir. **Dynadot** paneline gir → **My Domains → yamanlabs.app → DNS Settings** → Netlify'ın verdiği kayıtları gir (genelde bir `A` kaydı veya `CNAME`). Kaydet.
6. 1–2 saat içinde adresler yayında olur. (Alternatif: Dynadot'un kendi "Website Builder / Hosting" hizmetiyle de aynı dosyaları yükleyebilirsin.)

> Not: İstersen bu adımı da bana bırakabilirsin ama domain DNS değişikliğini yalnızca sen kendi Dynadot hesabından yapabilirsin; ben dosyaları ve tam talimatı hazırlarım.

---

## 4) APK / AAB üretimi — SEN TIKLA

Bu projede APK/AAB üretmek için harici araç (EAS CLI vb.) gerekmez. Emergent'in **Publish** özelliğini kullan:

1. Sağ üstteki **Publish** (Yayınla) butonuna tıkla.
2. Android için **AAB** (Play Store'a yüklenecek) ve test için **APK** üretmeyi seç.
3. İstenen bilgileri (uygulama adı, paket adı) onayla — zaten ayarlı: **Derle**, `app.yamanlabs.notes`.
4. Build bitince **AAB** dosyasını indir (Play Store için) ve istersen **APK**'yı telefonuna kurup test et.

> APK'yı Netlify'a koyup test etmene gerek yok; APK'yı doğrudan telefonuna kurarak test edebilirsin. Play Store'a ise **AAB** yüklenir.

---

## 5) Google Play Console — adım adım (SEN YAP)

### A. Uygulama oluştur
1. https://play.google.com/console → **Create app**.
2. **App name:** Derle
3. **Default language:** Türkçe (tr-TR)
4. **App or game:** App
5. **Free or paid:** Free
6. Bildirimleri (Developer Program Policies, US export laws) **kabul et** → Create app.

### B. Paket adı
- Build sırasında paket adı **`app.yamanlabs.notes`** olarak gelir. İlk AAB'yi yüklediğinde Console bunu otomatik tanır. (Paket adı sonradan değiştirilemez — bu yüzden doğru: `app.yamanlabs.notes`.)

### C. Play App Signing
- AAB yüklerken **Play App Signing**'i kabul et (önerilen, varsayılan). Google imza anahtarını senin için saklar — ekstra bir şey yapmana gerek yok.

### D. Store listing (Mağaza kaydı)
- **App name:** Derle
- **Short description (80 karakter):** Aklını boşalt; AI notlarını otomatik düzenlesin. Hızlı, sade, akıllı.
- **Full description:** Uygulamanın "dış beyin" fikrini anlat (örnek metin teslimatlarda README'de). AI destekli olduğunu mutlaka belirt.
- **App icon:** 512×512 (Publish çıktısındaki ikon) 
- **Feature graphic:** 1024×500 (basit bir yeşil görsel + "Derle" yazısı yeterli)
- **Ekran görüntüleri:** En az 2 telefon görseli (Yakala + Düzen ekranları).

### E. Privacy Policy
- **App content → Privacy policy** → **https://yamanlabs.app/privacy** gir.

### F. Data safety (Veri güvenliği) — şu yanıtları ver
- **Veri topluyor musunuz?** Evet.
- **Toplanan veriler:**
  - **Kişisel bilgi → E-posta adresi, Ad:** Toplanır. Amaç: **Hesap yönetimi / kimlik doğrulama.** Paylaşılmıyor.
  - **Uygulama etkinliği → Kullanıcı tarafından oluşturulan içerik (notlar):** Toplanır (yalnızca giriş yapınca buluta). Amaç: **Uygulama işlevselliği (yedek/senkron).** Paylaşılmıyor.
- **Veriler aktarımda şifreleniyor mu?** Evet (HTTPS).
- **Kullanıcı silme talep edebilir mi?** Evet → **https://yamanlabs.app/delete-account**
- **Üçüncü taraflarla paylaşım?** Hayır (OpenAI yalnızca metni işleme amaçlı "işleyen" konumundadır, satış/paylaşım yok — bunu Data Safety'de "paylaşım" olarak işaretlemene gerek yoktur; isteğe bağlı açıklamada belirtilebilir).

### G. Content rating (İçerik derecelendirme)
- Anketi doldur → "Yardımcı / üretkenlik" türü, şiddet/içerik yok → büyük olasılıkla **Everyone / 3+**.

### H. Target audience
- Hedef yaş: **18+** veya **13+** (çocuklara yönelik değil) seç.

### I. Test → Yayın
1. **Testing → Internal testing** → **Create release** → C. adımındaki **AAB**'yi yükle.
2. Test kullanıcısı olarak kendi e-postanı ekle, test linkiyle telefonunda dene.
3. Her şey iyiyse **Production → Create release** → aynı AAB → **Review & rollout**.
4. Google incelemesi (genelde birkaç saat–birkaç gün) sonrası yayında.

---

## 6) Yayından önce kontrol listesi
- [ ] OpenAI anahtarı backend'e eklendi (bana verildi) ve AI çalışıyor.
- [ ] yamanlabs.app/privacy, /terms, /support, /delete-account açılıyor.
- [ ] Publish ile AAB üretildi.
- [ ] Play Console'da privacy policy URL'si ve Data safety dolduruldu.
- [ ] Store listing (açıklama, ikon, ekran görüntüleri) tamam.
- [ ] Internal testing'de uygulama telefonunda sorunsuz açıldı.

> Markete sürdüğünde uygulama **kullanıma hazır** olacaktır: notlar local + bulut, AI + local fallback, koyu/açık tema, TR/EN, hesap/veri silme — hepsi çalışır durumda.
