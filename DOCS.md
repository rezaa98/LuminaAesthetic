# 📘 DOCUMENTATION SUITE: LuminaAesthetic
> **Sistem Pemindaian Estetika & Geometri Wajah Berbasis AI Terintegrasi Medis**
> **Versi Dokumen:** v2.29.0  
> **Tanggal Rilis:** 29 Mei 2026  
> **Status:** Produksi Aktif

---

## 🛠️ bagian 1: Technical Requirement Document (TRD)

### 1. Deskripsi Umum Proyek & Arsitektur
**LuminaAesthetic** adalah aplikasi analisis estetika & dermatologi wajah dinamis berkapasitas tinggi. Aplikasi ini mengintegrasikan kecerdasan buatan dari model **Gemini-3.1-Flash-lite** di sisi server dengan perpustakaan pemindaian penanda wajah lokal (**face-api.js**) di sisi browser untuk memberikan diagnosis bentuk wajah, tipe kulit, dan proporsi geometri wajah yang aman, berskala klinis, dan terlindungi privasinya.

Aplikasi dirancang dengan arsitektur **Full-Stack Hybrid Monolit Terpadu**:
- **Front-end SPA**: Menggunakan **React 19**, **Vite 6**, dan **Tailwind CSS 4** untuk menghadirkan antarmuka pengguna yang sangat lancar, adaptif, serta bebas dari kedipan.
- **Back-end API Server**: Bertumpu pada **Express** terdistribusikan secara lokal di Node.js, bertanggung jawab menyaring berkas biner gambar, mengamankan kunci rahasia API (API Keys), dan berinteraksi secara aman dengan SDK model Gemini (`@google/genai`).
- **Database & Auth Terdesentralisasi**: Menggunakan **Firebase Firestore** untuk persistensi riwayat pemindaian, peran pengguna (User Roles), dan pencatatan audit (Audit Logs), bersama **Firebase Authentication** untuk melindungi identitas medis pengguna.

```
+-----------------------------------------------------------------------------------+
|                                 SISTEM UTAMA (CLIENT)                             |
|  +---------------------+   +---------------------------+   +-------------------+  |
|  |   UI React SPA      |-->| face-api.js (Local Scan)  |-->|  localForage &    |  |
|  |   (Antarmuka User)  |   | (Pendeteksian Wajah)     |   |  PDF Generation   |  |
|  +---------------------+   +---------------------------+   +-------------------+  |
+------------------------------------------+----------------------------------------+
                                           | (Mengunggah gambar via Multipart/Base64)
                                           v
+-----------------------------------------------------------------------------------+
|                        BACK-END SERVICES & SECURED API KEYS                       |
|  +-----------------------------------------------------------------------------+  |
|  |  Express API Server (Port 3000)                                             |  |
|  |  - /api/analyze         : Menganalisis kulit, tipe rambut & rekomendasi     |  |
|  |  - /api/analyze-features: Menganalisis simetri detail & polygon spasial     |  |
|  +---------------+-------------------------------------------------------------+  |
+------------------|----------------------------------------------------------------+
                   | (Protokol SDK @google/genai Resmi)
                   v
+------------------+---------+     +-------------------------+     +----------------+
|  Gemini AI Core Engine     |     | Firebase Authentication |     | Firestore DB   |
|  (gemini-3.1-flash-lite)   |     | (Google / Email Auth)   |     | (NoSQL Cloud)  |
+----------------------------+     +-------------------------+     +----------------+
```

### 2. Spesifikasi Teknologi & Penumpukan Perangkat Lunak (Tech Stack)
| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework UI** | React 19.0.1 | Pemrograman reaktif fungsional dengan Hooks |
| **Penyusun Aset** | Vite 6.2.3 | Menangani bundling modul & prapemrosesan super cepat |
| **Gaya & Layout** | Tailwind CSS v4.1.14 | Metodologi CSS utilitas modern berskala penuh |
| **Pustaka Animasi** | Motion 12.23.24 | Transisi halaman bento & visualisasi interaktif |
| **Analisis Lokal** | @vladmandic/face-api^1.7.15 | Pengenalan orientasi wajah & kesiapan pose secara lokal |
| **Server Backend** | Express^4.21.2 | Proxy router backend penanganan API |
| **Keamanan File** | Multer^2.1.1 | Pemrosesan upload file dalam memori buffer |
| **Penyimpanan Riwayat** | Firebase Firestore 12.13.0 | Penyimpanan NoSQL terstruktur HIPAA-Ready |
| **Kuantifikasi Dokumen** | jspdf^4.2.1 & html2canvas | Mesin kompilasi rendering laporan klinis ke format PDF |

### 3. Skema Data (Database Blueprint & Rules)
Penyimpanan NoSQL Firestore memuat tiga klaster utama dengan validasi keamanan ketat tipe dokumen:

#### A. Entitas `users/{userId}`
Menyimpan batas rol kepustakaan pengguna guna memvalidasi tindakan administratif.
```json
{
  "name": "Ahmad Dani",
  "username": "ahmaddani_aesthetic",
  "role": "admin", // super_admin | admin | user
  "createdAt": 1774829302111
}
```

#### B. Entitas `history/{historyId}`
Menghimpun seluruh data hasil diagnosis wajah yang dilakukan oleh pengguna maupun tamu.
```json
{
  "timestamp": 1774829312000,
  "imageUrl": "https://firebasestorage.googleapis.com/... atau Base64 Lokal",
  "userId": "guest", // ID unik auth jika masuk, atau 'guest' untuk akun tamu tanpa login
  "userDisplayName": "Tamu Lumina",
  "analysisData": {
    "skinAnalysis": { "hydration": 78, "rednessLevels": "Rendah", "notes": "Kulit terhidrasi dengan baik..." },
    "skinType": { "type": "Normal", "description": "Tingkat sebum seimbang di seluruh zona wajah" },
    "facialMapping": [
      { "zone": "T-Zone", "condition": "Kering Ringan", "status": "STABIL", "description": "Dahi terlindung", "recommendations": ["Gunakan pelembab berbasis krim"], "colorHint": "emerald" }
    ],
    "faceFeatures": { "shape": "Oval", "eyes": "Almond", "jawline": "Sharp", "summary": "Bentuk wajah simetris ideal." },
    "spectacles": { "recommendedFrames": ["Round", "Cat-Eye"] },
    "hairstyles": { "recommendedStyles": ["Classic Undercut", "Side Swept"] },
    "colorAnalysis": {
      "dominantColors": ["#2C3E50", "#E74C3C"],
      "summary": "Warna-warna dingin sangat melengkapi kontras kulit Anda.",
      "detailedAnalysis": [
        { "colorName": "Navy Blue", "colorHex": "#1A5276", "compatibility": "High", "score": 92, "description": "Kontras tinggi mendukung kecerahan alami dahi." }
      ],
      "accessories": [
        { "name": "Anting Elegan", "desc": "Anting perak tipis pelengkap struktur rahang", "emoji": "💍" }
      ]
    },
    "personalizedCarePlan": [
      { "title": "Hidrasi Malam Hari", "description": "Gunakan serum asam hialuronat sebelum tidur." }
    ]
  },
  "consultantNotes": "Saran tambahan dari spesialis estetika...",
  "consultantName": "Dr. Aesthetic"
}
```

#### C. Entitas `audit_logs/{auditId}`
Catatan jejak aktivitas admin untuk menjamin akuntabilitas terhadap perubahan klinis / otentikasi.
```json
{
  "timestamp": 1774829399000,
  "userId": "ZsyAH83k9As92JKda91",
  "username": "dr_linda_aestetika",
  "role": "admin",
  "action": "UPDATE_CONSULTANT_NOTES",
  "details": "Menambahkan resep pelembab tambahan pada pemeriksaan pasien Guest ID: H-90218"
}
```

---

## 📋 bagian 2: Functional Specification Document (FSD)

### 1. Alur Perjalanan Pengguna (User Journey & Touchpoints)

```
[Mulai Aplikasi]
       |
       v
+------------------+
| Beranda Kosong   | (Ditampilkan onboarding bento 4 pilar presisi pendeteksian di desktop)
+------------------+
       |
       +---> [Metode Ambil Foto Wajah]
       |            |
       |            +---> Kategori A: Ambil Foto Menggunakan Live AI Camera (Rekomendasi)
       |            |     - Membuka feed video perangkat kamera depan pengguna.
       |            |     - Menampilkan overlay oval siluet garis bantu penyeimbang kepala.
       |            |     - Mengaktifkan animasi garis scan pendar dinamis secara realtime.
       |            |     - Validasi kebersihan posisi wajah sebelum capturing.
       |            |
       |            +---> Kategori B: Unggah Lembaran Mandiri dari Galeri
       |                  - Drop berkas gambar secara instan (format PNG, JPG, HEIC).
       |
       v
+------------------+
| Proses Analisis  | (Progress bar teranimasi sembari backend memanggil API Gemini)
+------------------+
       |
       v
+------------------+
| Dashboard Hasil  | (Integrasi layout modern yang menampilkan 5 fitur mutakhir)
+------------------+
       |
       +---> 1. Advisory Notes: Catatan visual premium berkotak oranye-emas dari spesialis.
       |
       +---> 2. Skin Hydration Metric: Dial grafik radial untuk kelembaban & tingkat kemerahan.
       |
       +---> 3. Interactive Face Mapping: Skema interaktif 3 Zona wajah (T-Zone, U-Zone, Chin).
       |
       +---> 4. Geometri Simetri AI: Akordeon interaktif titik simetri mata, bibir, alis & dahi.
       |
       +---> 5. Color Season & Accessory Matcher: Kartu analisis musim warna & set aksesoris gender-tailored.
       |
       +---> 6. Actionable Care Plan: Rencana kebiasaan harian penataan kecantikan.
       |
       +---> 7. Export PDF: Tombol kompilasi dokumen medis instan satu ketukan.
```

### 2. Penjelasan Detail Fitur Utama

#### A. Otorisasi Akses & Penanganan Hak Akun Guest (Tamu)
- Pengguna dapat langsung menggunakan aplikasi secara gratis tanpa mendaftar sebagai **Guest**. 
- Ketika Guest melakukan analisis, sistem menetapkan `userId: 'guest'` pada entitas analisis yang disimpan di Firestore.
- Aturan Firestore telah dioptimalkan secara dinamis untuk memungkinkan akun non-login melakukan penyimpanan berkas `history` secara mandiri serta membaca dokumen tersebut lewat rujukan ID tanpa merusak integritas keamanan dokumen pengguna terdaftar lainnya.

#### B. Panduan Penyelarasan Kamera Wajah Medis (Live Guidance AI)
- Memanfaatkan kamera depan pengguna dengan panduan visual berbasis klinis berupa oval garis bantu posisi kepala guna mengunci letak fokal mata, hidung, dan dagu secara simetris.
- Dilengkapi animasi pemindaian laser pemandu berkecepatan dinamis demi meyakinkan pengguna bahwa pemindaian berjalan dengan presisi tinggi.

#### C. Pemetaan Zona Wajah Interaktif (Interactive Face Mapping)
- Tiga zona wajah utama (**T-Zone**, **U-Zone**, **Dagu**) direpresentasikan dengan visualisasi interaktif.
- Setiap wilayah mendapatkan lencana status yang diwarnai dinamis sesuai dengan kondisi kesehatan area tersebut:
  - **Ijo (STABIL)**: Pertanda kondisi sehat terawat.
  - **Biru (INFO)**: Catatan informasi preventif ringan.
  - **Pink (RAWAT)**: Menunjukkan perlunya tindakan perawatan ekstra segera.

#### D. Pengisi Catatan Konsultan (Advisory Notes) & Manajemen Panel Admin
- Pengguna dengan peran akun **Super Admin** atau **Admin** dapat masuk ke dashboard pengelolaan khusus.
- Mereka berhak mencari riwayat analisis seluruh pasien, mengisi/memperbarui resep catatan estetika medis (*advisory notes*), serta memantau audit aktivitas log harian sistem demi mempertahankan standar keandalan layanan klinik estetika.

---

## 🔌 bagian 3: Spesifikasi Kontrak API (API Contracts)

### 1. `POST /api/analyze`
Mengunggah berkas gambar wajah untuk mendapatkan parameter analisis tipe kulit, kerangka dasar bentuk wajah, warna representatif, serta pilihan tipe penataan rambut/kacamata.

- **Content-Type**: `multipart/form-data`
- **Parameter Tubuh (Form Fields)**:
  - `image`: Berkas biner gambar (PNG, JPG, JPEG, dll) - *Wajib*
  - `language`: `id` atau `en` (Menentukan bahasa keluaran resep) - *Opsional (Default: 'id')*

#### Payload Respon Sukses (`200 OK`)
```json
{
  "skinAnalysis": {
    "hydration": 82,
    "rednessLevels": "Rendah",
    "notes": "Kelembaban kulit terpelihara merata, dahi sedikit kering akibat paparan angin."
  },
  "skinType": {
    "type": "Combination",
    "description": "Kadar sebum aktif di dahi (T-Zone) sementara daerah pipi (U-Zone) lebih netral."
  },
  "facialMapping": [
    {
      "zone": "T-Zone",
      "condition": "Sebum Aktif",
      "status": "RAWAT",
      "description": "Dahi menampilkan pantulan cahaya berkilau tipis karena penumpukan pori.",
      "recommendations": [
        "Gunakan pembersih dengan kandungan asam salisilat.",
        "Kurangi konsumsi makanan berminyak jenuh."
      ],
      "colorHint": "pink"
    }
  ],
  "faceFeatures": {
    "shape": "Oval",
    "eyes": "Almond",
    "jawline": "Ramping",
    "summary": "Struktur wajah oval simetris dengan penekanan rahang yang anggun."
  },
  "spectacles": {
    "recommendedFrames": ["Round", "Aviator", "Square"]
  },
  "hairstyles": {
    "recommendedStyles": ["Textured Crop", "Layered Fringe"]
  },
  "colorAnalysis": {
    "dominantColors": ["#1A365D", "#2D3748", "#E2E8F0"],
    "summary": "Suhu kulit dingin serasi dengan palet kontras monokromatik abu-abu atau biru tua.",
    "detailedAnalysis": [
      {
        "colorName": "Navy Blue",
        "colorHex": "#1A365D",
        "compatibility": "High",
        "score": 95,
        "description": "Meningkatkan kontras alami dan mencerahkan warna dasar rona wajah."
      }
    ],
    "accessories": [
      {
        "name": "Kacamata Frame Metalik",
        "desc": "Detail bingkai logam perak murni untuk mengelevasi karakter mata almond.",
        "emoji": "👓"
      }
    ]
  },
  "personalizedCarePlan": [
    {
      "title": "Aplikasi Sunscreen Siang Hari",
      "description": "Gunakan tabir surya berbentuk gel SPF 30+ setiap pagi sebelum bepergian luar ruangan."
    }
  ]
}
```

---

### 2. `POST /api/analyze-features`
Melakukan penguraian titik parameter simetri serta koordinat spasial spasifik bagian mata, bibir, hidung, alis, dahi, hingga kelopak pipi menggunakan gambar berformat Base64. Seluruh koordinat diskalakan secara matematis berpresisi tinggi (skala 0 - 1000).

- **Content-Type**: `application/json`
- **Spesifikasi Payload Request**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...",
  "language": "id"
}
```

#### Payload Respon Sukses (`200 OK`)
```json
{
  "faceBox": {
    "top": 210,
    "left": 315,
    "width": 380,
    "height": 450
  },
  "symmetryScore": 94,
  "symmetryDescription": "Tingkat penempatan alis kanan dan kiri seimbang secara horisontal dengan margin kemiringan minimal 1.5%.",
  "features": [
    {
      "id": "eyes",
      "name": "Mata",
      "label": "Almond Terbuka Sejajar",
      "points": [
        "Sudut mata bagian dalam berada pada sumbu horisontal yang lurus.",
        "Kelopak mata terlihat tegas tanpa gelambir lelah."
      ],
      "coordinate": {
         "x": 500,
         "y": 420
      },
      "areaPolygon": [
         { "x": 420, "y": 410 },
         { "x": 460, "y": 400 },
         { "x": 480, "y": 425 },
         { "x": 440, "y": 435 }
      ]
    }
  ]
}
```

---

## 📊 bagian 4: Kode Penanganan Error & Ketahanan Sistem

- **Ketahanan Api (Resilient API Retries)**: 
  Server backend dipasang interseptor handal `generateContentWithRetry()` dengan logika eksponensial penangguhan (Exponential Backoff). Jika API mendapatkan rujukan error beban kerja padat (`503`, `429`, `UNAVAILABLE`), server akan menunda eksekusi secara mekanis dan mengulangi permintaan hingga 3 kali percobaan sebelum melempar status kegagalan ke browser klien.
- **Validasi CORS & Keamanan Payload**:
  Membatasi asupan payload maksimal `50mb` baik lewat Multipart berkas biner maupun rujukan string Base64 guna menghindari terjadinya kelebihan kapasitas pemrosesan antrian sekuensial Node.js.

---

```
PROSEDUR PERUBAHAN & INTEGRASI SISTEM ESTETIKA:
Setiap kali melakukan pembaruan kode visual atau perbaikan aturan firebase, deklarasikan perubahan struktur tersebut pada file ChangelogModal.tsx serta tingkatkan nomor versi di footer guna memastikan kemudahan audit sistem bagi pihak evaluator medis.
```
