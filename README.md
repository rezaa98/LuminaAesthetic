# Lumina AI - Optometric Design Suite

Aplikasi web berbasis AI untuk analisis geometri wajah tingkat lanjut dan simulasi penempatan kacamata 3D (AR Try-On). Aplikasi ini menggunakan kombinasi *Computer Vision* (Face-API) dan kemampuan inferensi visi cerdas dari Gen AI (Gemini) untuk memberikan panduan estetik, presisi dimensi wajah, dan simulasi fitur coba kacamata virtual dengan penyesuaian otomatis proporsi yang akurat.

## 🛠️ Tech Stack

### Frontend
- **React.js 18 & Vite**: Framework UI dan proses *build tool* yang modern dan cepat.
- **TypeScript**: Manajemen tipe (*type-safety*) guna keandalan, pemeliharaan, dan skalabilitas kode base.
- **Tailwind CSS**: *Utility-first CSS* untuk penataan gaya UI yang cepat, presisi, dan responsif.
- **Framer Motion (`motion/react`)**: Digunakan untuk animasi interaktif, transisi halaman/modal yang mulus, dan *micro-interactions* pada UI.
- **@vladmandic/face-api**: Digunakan untuk Machine Learning lokal (*client-side browser*). Mengekstrak 68-titik *face landmarks* untuk mendapatkan titik koordinat presisi dari mata, hidung, proporsi jarak antar-kacamata (IPD), dan mendeteksi orientasi rotasi (pitch, yaw, roll) secara 3D.
- **Lucide React**: Kumpulan aset ikon garis (*stroke/outline interfaces*).
- **jsPDF & html2canvas**: Digunakan untuk penangkapan DOM (*DOM capture*) menjadi ekstraksi Laporan Optometrik ke format dokumen PDF.

### Backend (Full-Stack Model)
- **Node.js & Express**: Server backend yang merutekan *request* REST API klien ke berbagai penyedia alat dan juga memuat bundel aplikasi web secara lokal melalui _Static Folder_ dan Vite middleware saat _development mode_.
- **@google/genai (Gemini 3.1 Flash Lite)**: Mesin model AI generatif yang ada pada server. AI ini bertugas memindai (*scan*) gambar portret pengguna dan memberikan analisis Json estetik wajah (skor metrik, penjelasan fitur wajah, rekomendasi warna/kacamata, batas kotak *bounding-box*, serta evaluasi tingkat asimetris wajah). API Key Gemini dilindungi di sisi server (.env).

---

## 🌟 Fitur Kunci

1. **Analisis Geometri Struktur Wajah (Vision AI Engine)**
   Sistem membaca foto wajah dan akan menganalisis mendetail terkait bentuk silang anatomi (apakah lonjong, kotak, oval, atau bulat), skor simetri, penempatan alis, tulang hidung, rahang, serta mata.

2. **Simulasi AR Coba Kacamata Virtual (*Virtual Try-On*)**
   - **Auto-Alignment**: Menggunakan `face-api.js` untuk mendeteksi jarak hidung dan *inter-pupillary distance* (jarak tengah mata). Simulasi ini *menempelkan* SVG kacamata secara sempurna pada hidung, merespons rotasi/kemiringan posisi kamera (tilt/yaw/pitch), dan menyesuaikan lebar sesuai kenyataan biologis.
   - **Skala Manual & Fine-tuning**: Menyediakan opsi manual menggeser (*offset X dan Y*), merotasi (*tilt*), dan perbesaran kacamata untuk penyesuaian akhir oleh pasien. 
   - **Panduan Kelayakan Bentuk**: Menyocokkan kalkulasi bentuk wajah siluet pengguna dengan kacamata untuk menunjukkan mana yang "*Sangat Direkomendasikan*" dan mana bentuk kacamata yang perlu "*Dihindari*".

3. **Analisis Profil Warna (*Skin Tone Analysis*)**
   Menyediakan indikasi warna bingkai/lensa atau elemen mode mana yang cocok berdasarkan pendeteksian nuansa tona kulit (Cool, Warm, Neutral).

4. **Ekstrak Laporan PDF Medro-Estetik**
   Ekspor hasil parameter pengukuran analitis, gambar try-on kacamata, dan spesifikasi AI ke dalam report PDF. Berguna jika pengguna ingin membawanya ke kasir optik fisik atau mendiskusikan kustomisasi resep lensa medis.

5. **Dukungan Bilingual Lintas Batas**
   Aplikasi dan sistem interpretasi AI memiliki saklar *real-time* ganti bahasa (Bahasa Indonesia dan Bahasa Inggris). Semantik aplikasi, antarmuka, hingga output analisis Gemini akan menyesuaikan.

---

## 🔄 Flow Penggunaan Utama

1. **Upload / Pengambilan Foto Pelaporan**: Pengguna diminta mengunggah foto wajah/selfie (*frontal headshot*) terbaru mereka melalui antarmuka sambutan yang minimalis.
2. **Proses Inferensi Cerdas**: Gambar dikirimkan via antarmuka POST Node.js di sisi belakang (`/api/analyze-features`) yang merutekannya aman ke Gemini API dan mengembalikan pemetaan komprehensif json.
3. **Membaca Wawasan Medro**: Menelusuri panel Laporan Utama (Dashboard) dan menggali poin-poin penjelasan deskriptif bagian fitur mikro (mata, rahang, dll) menggunakan modal Geometri Wajah dengan *holographic bounding boxes*.
4. **Modul Live Try-On (Simulasi)**: Membuka fasilitas tes kacamata. Lapisan atas (*Overlay*) Face-API secara diam-diam memetakan posisi mata/telinga di perangkat pengguna lokal kemudian menyuntik filter frame kacamata secara *overlay* proporsional di foto asli!
5. **Eksplorasi Katalog & Sesuaikan**: Coba bentuk-bentuk spesifik (*Round, Cat-eye, Narrow, dll*), warna, dan geser kacamata dengan kendali slider.
6. **Ekspor & Evaluasi**: Simpan hasil (ke PDF) dengan klik ekspor.

---

## 🕹️ User Sandbox (Developer / PM Tool)

Aplikasi memiliki tabungan khusus, "User/Sandbox Floating Dock",  yakni utilitas navigasi kecil mirip pildox (*pill dock*) yang bisa berada melayang di layar bagian bawah/samping layar (jika diaktifkan) atau via panel khusus. 

### Tujuan Sandbox:
Membantu tim desainer, *product manager*, maupun *developer tester* untuk secara cepat berpindah antara bagian simulasi status pengguna (User State) dan melakukan pengujian *bypass* (melewati pengurusan berulang) tanpa menyentuh *database code*.

### Apa yang Dapat Dilakukan Sandbox:
- **Role Profiler (Misal: Guest, Patient, Aesthetic Doctor)**: 
  Simulasi previlese antarmuka. Misalnya untuk melakukan prapertunjukan UI panel tambahan jika berperan sebagai Spesialis daripada pengguna awam.
- **Fast-Forward & State Bypassing**: Akses langsung mengisi *dummy data pre-load image* agar tidak perlu terus-terusan mengunggah (_upload_) foto dari diska setiap kali *refresh* halaman. Sangat menghemat waktu *Quality Assurance* (QA).
- **Global Toggles (Switch Bahasa dsb)**: Tombol *force-reset* dan pengaturan tema cepat untuk simulasi *client localization*.

---

## ⚙️ Info Developer & Manajemen Run

### Prasyarat Instalasi Lingkungan Server
- Node.js versi terbaru yang stabil (v18.x atau yang lebih tinggi).
- Pembuatan dan pengisian rahasia berkas lingkungan utama (`.env`) berbasis percontohan pada `.env.example` -> Wajib mengisi **GEMINI_API_KEY**.

### Manajemen Paket Instalasi Aplikasi
1. Buka root repositori utama.
2. Ketik dan jalankan perintah manajer paket `npm install` untuk memasang pustaka klien maupun basis *backend*.

### Perintah Pembangunan dan Proses Esekusi (*Scripting*)
- `npm run dev`: Merintis sesi peladen lokal (*development* mode) pada Port standar `3000`. Vite menjalankan proses pergantian modul secara panas (*Hot Module Reloading* / HMR), memudahkan perancangan klien interaktif melalui skrip `server.ts`.
- `npm run build`: Transpilasi skrip. Memadatkan aplikasi React (frontend) menjadi sumber daya minifikasi di map bundel statikal `dist/` dan menerjemahkan `server.ts` agar diubah ke target moduler node `dist/server.cjs` menggunakan pemaket sekring (*esbuild*).
- `npm run start`: Eksekusi mandiri untuk penggelaran rilis ke jenjang publik. Perintah ini hanya beroperasi jikalau *build* berhasil, meladen API backend dan fail statik `/dist` secara penuh untuk diproduksi.

### Arsitektur Direktori Utama
- `server.ts`: Lapisan perantara perutean jaringan peladen (Express.js backend handler) tempat di mana API Eksternal asimetris dan kunci dipusatkan.
- `/src/components/*`: Menampung komponen modular *Re-usable* React. Khusus seperti `GlassesFrameModal.tsx` tempat semua logika face-api kacamata tertulis, `FaceFeatureModal` untuk holograpik *bounding-box*, dll.
- `/src/hooks/*` & `/src/contexts/*`: Wadah *state management context* bahasa global serta fungsi-fungsi logika interaktif.
- `/src/main.tsx` & `/src/App.tsx`: Induk utama antarmuka DOM (*root hierarchy flow*).
