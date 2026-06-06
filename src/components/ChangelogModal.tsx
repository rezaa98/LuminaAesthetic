import { motion } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal = ({ onClose }: ChangelogModalProps) => {
  const versions = [
    {
      version: "v2.60.0",
      date: "06 June 2026",
      changes: [
        "Interactive Onboarding Tutorial: Menambahkan panduan langkah-demi-langkah (driver.js) untuk pengguna baru yang menyentuh fase unggah gambar dan tahap analisis matriks wajah."
      ],
    },
    {
      version: "v2.59.0",
      date: "06 June 2026",
      changes: [
        "Visualisasi Data: Integrasi Recharts untuk menampilkan visual radar chart metrik kualitas kulit (hidrasi, elastisitas, pori-pori, tekstur) menggantikan indikator teks lama di Dashboard."
      ],
    },
    {
      version: "v2.58.0",
      date: "31 May 2026",
      changes: [
        "Sistem Kontrol Global: Super Admin kini memiliki akses melalui Panel Kontrol Global untuk mengatur batas harian uji coba Guest dan User. Pengaturan ini tersentralisasi dan juga memungkinkan mematikan modul-modul analisis tertentu secara massal berdasarkan sistem."
      ],
    },
    {
      version: "v2.57.3",
      date: "31 May 2026",
      changes: [
        "Perbaikan Sistem: Menangani issue 'Uncaught Error in snapshot listener' akibat permission denied pada modul Firestore, mencegah crash aplikasi saat memuat Admin Panel."
      ],
    },
    {
      version: "v2.57.2",
      date: "31 May 2026",
      changes: [
        "Sistem Limitasi: Menambahkan notifikasi modal interaktif ketika batas pemakaian tercapai (1x untuk Guest), dengan integrasi tombol pintasan unuk masuk (login) menggunakan akun Google."
      ],
    },
    {
      version: "v2.57.1",
      date: "31 May 2026",
      changes: [
        "Perbaikan Sistem: Mencegah tampilan halaman HTML putih kosong akibat pemblokiran cookie cross-origin (Safari/Incognito) dengan memberikan instruksi untuk membuka aplikasi di tab baru."
      ],
    },
    {
      version: "v2.57.0",
      date: "31 May 2026",
      changes: [
        "Fitur Baru: Menambahkan notifikasi Disclaimer Medis sebagai langkah preventif saat pengguna mencoba membuka kamera untuk pengambilan foto (AI Live Camera)."
      ],
    },
    {
      version: "v2.56.5",
      date: "31 May 2026",
      changes: [
        "Konsistensi Tipografi: Menyesuaikan ukuran font dan struktur visual judul 'Rasio Keselarasan Simetri Wajah' (text-[10px] uppercase) beserta skor metrik agar sepadan dengan proporsi panel Kecocokan Warna pada tab Analisis Warna."
      ],
    },
    {
      version: "v2.56.4",
      date: "31 May 2026",
      changes: [
        "Konsistensi Tipografi: Mengecilkan ukuran font pada rangkuman geometri wajah, grid horizontal, dan rasio emas agar ukurannya seragam (text-[10px]/text-[11px]) menyamai elemen di tab Analisis Warna."
      ],
    },
    {
      version: "v2.56.3",
      date: "31 May 2026",
      changes: [
        "Memperbaiki error 'Failed to fetch' saat mengambil Geometri Wajah dengan mengubah metode parsing Base64 uri lokal secara manual, untuk menghindari pemblokiran memory browser pada string Base64 yang panjang."
      ],
    },
    {
      version: "v2.56.2",
      date: "31 May 2026",
      changes: [
        "Konsistensi Tipografi: Menyesuaikan ulang ukuran font pada label (text-sm) dan nilai (text-base) di panel Geometri Wajah agar selaras dan konsisten ukurannya dengan elemen antarmuka lainnya pada Dashboard."
      ],
    },
    {
      version: "v2.56.1",
      date: "31 May 2026",
      changes: [
        "Konsistensi Tipografi: Mengecilkan ukuran font pada hasil analisis bentuk, mata, dan rahang di panel Geometri Wajah agar selaras dan konsisten ukurannya (text-sm/text-base) dengan elemen antarmuka lainnya pada Dashboard."
      ],
    },
    {
      version: "v2.56.0",
      date: "31 May 2026",
      changes: [
        "Perbaikan Visual UI Geometri Wajah: Merombak panel 'Geometri Wajah' pada Dashboard (DashboardView.tsx) agar memiliki tata letak list vertikal presisi lengkap dengan metrik keselarasan, menyelaraskan desain dengan rancangan mock-up terbaru.",
      ],
    },
    {
      version: "v2.55.1",
      date: "31 May 2026",
      changes: [
        "Memperbaiki error 'Missing or insufficient permissions' yang muncul di console terkait percobaan mengambil jumlah riwayat (getCountFromServer). Aplikasi kini menggunakan listener efisien ke totalScans dari overview statistik global untuk stabilitas yang lebih baik."
      ],
    },
    {
      version: "v2.55.0",
      date: "30 May 2026",
      changes: [
        "Sistem Backend Rate Limiting berbasis IP: Mengimplementasikan sistem pengaman 'Throttling / Pembatasan Kuota' langsung dari server (server.ts) secara in-memory untuk mengelola batas permintaan analisis harian per IP Address. Fitur ini secara aktif mencegah penyalahgunaan walau melalui model private/incognito yang tidak bisa dilacak session-nya.",
        "Log Audit IP Throttling: Menambahkan tab baru (IP Throttling Monitor) pada Admin Panel yang khusus menampilkan jejak akses beserta IP pengguna, memperlihatkan jumlah percobaan serta aksi pemblokiran/izin oleh Firewall lokal."
      ],
    },
    {
      version: "v2.54.0",
      date: "29 May 2026",
      changes: [
        "Revolusi Realisme 3D: Tangkai kacamata (temple arms) kini memproyeksikan secara riil ke belakang menuju telinga dalam ruang 3D sejati menggunakan properti `preserve-3d`. Saat rotasi wajah terdeteksi (yaw), tangkai panjang kacamata akan merespon dengan presisi perspektif dan tidak lagi mengawang melayang di udara.",
        "Pembersihan Antarmuka: Menghilangkan overlay titik statis 'T-Zone' pada saat melihat foto untuk memastikan kejernihan pemandangan uji coba kacamata."
      ],
    },
    {
      version: "v2.53.0",
      date: "29 May 2026",
      changes: [
        "Penyempurnaan Simulasi 3D & Fokus Visual: Mengembalikan tangkai kacamata ke model 2D Isometrik bawaan dengan efek perspektif murni yang lebih stabil untuk mencegah posisi kacamata 'offside' ketika wajah menoleh.",
        "Menyembunyikan UI Titik Pelacakan (Landmark Mata & Hidung) saat mode Preview AR sehingga pengguna dapat melihat bingkai kacamata lebih jelas dan fokus tanpa gangguan elemen pemindaian."
      ],
    },
    {
      version: "v2.52.0",
      date: "29 May 2026",
      changes: [
        "Simulasi Tangkai 3D (Tingkat Lanjut): Kacamata kini menggunakan engine 3D murni untuk tangkainya (temple arms). Saat wajah menoleh (side-profile), tangkai kacamata akan secara realistis menjulur ke belakang (Z-axis) ke arah telinga, memecahkan masalah ilusi 2D pipih yang terjadi pada rilis sebelumnya."
      ],
    },
    {
      version: "v2.51.0",
      date: "29 May 2026",
      changes: [
        "Peningkatan Engine AI Pelacakan Wajah: Mengganti model ringan (TinyFaceDetector) menjadi SSD MobileNet V1 pada AR Try-On, meningkatkan akurasi signifikan untuk mendeteksi wajah dengan hadap ekstrem (Side Profiles / Hadap Kanan & Kiri yang terlampau jauh)."
      ],
    },
    {
      version: "v2.50.0",
      date: "29 May 2026",
      changes: [
        "Kontrol 3D Kacamata Ekstensif (Fix Side Profile): Menambahkan tuas kendali manual rotasi 3-sumbu penuh (Yaw/Hadap Kiri-Kanan, Pitch/Angguk Atas-Bawah, dan Roll/Miring) agar pengguna dapat menyesuaikan presisi 'fitting' kacamata ketika wajah menoleh (side-profile) atau di luar jangkauan pemindaian 'Auto-Sync' Face-API."
      ],
    },
    {
      version: "v2.49.0",
      date: "29 May 2026",
      changes: [
        "Sistem Retry Fallback Model: Mengembalikan mekanisme jeda percobaan ulang (exponential backoff) pada setiap model sebelum melakukan fallback ke model lain, agar aplikasi dapat menangani error 503 (server overloaded) dan 429 (rate limited) lebih elegan tanpa gagal secara prematur."
      ],
    },
    {
      version: "v2.48.0",
      date: "29 May 2026",
      changes: [
        "Desain UI/UX Baru: Mengganti peringatan deteksi kacamata (alert bawaan browser) dengan Popup UI kustom berbasis Animasi yang lebih modern, rapih, elegan, dan informatif untuk mengingatkan pengguna."
      ],
    },
    {
      version: "v2.47.0",
      date: "29 May 2026",
      changes: [
        "Kontrol Pintar Mesin AI & Bypass Deteksi (Fitur Super Admin): Menyediakan panel UI khusus untuk Role Super Admin guna mengatur preferensi fallback urutan pemanggilan AI Model (mulai dari 3.5-flash hingga 1.5-pro).",
        "Toggle Deteksi Kacamata (Opt-Out): Memberikan Super Admin limitasi hemat kuota API dengan tombol interaktif untuk menonaktifkan pengecekan kacamata dari alur upload (berguna ketika traffic sedang penuh).",
        "Sistem Self-Healing Model API: Mengimplementasikan mekanisme otomatis pergeseran rute model API dari tier satu ke lainnya jika Google AI Engine melempar kode error 429 (Rate Limit) dan 404 (Model Deprecated/Not Found)."
      ],
    },
    {
      version: "v2.46.0",
      date: "29 May 2026",
      changes: [
        "Migrasi Model AI & Perbaikan Total (Fix 404 Error): Beralih menggunakan seri mutakhir 'gemini-3.5-flash' yang sesuai dengan arsitektur SDK @google/genai terbaru (v1beta). Keputusan ini mengatasi ketidakcocokan versi sebelumnya ('gemini-1.5-flash' dan model legacy lainnya yang tidak lagi didukung oleh endpoint API) serta memberikan batas performa (rate limit) ringan yang lebih mumpuni."
      ],
    },
    {
      version: "v2.45.0",
      date: "29 May 2026",
      changes: [
        "Optimalisasi Kuota & Performa API (Fix Error 429): Mengganti dan menyeragamkan antrean seluruh detektor ke model 'gemini-1.5-flash'. Model ini memiliki batasan pemrosesan limit jauh lebih besar (sangat tinggi untuk request rate dan token) di Free Tier dibandingkan seri 2.0-flash maupun 1.5-pro, sehingga mencegah aplikasi dari kendala rate limit / kuota habis dan menghindari ketidakstabilan parsing (error 500) yang terjadi pada opsi Pro/Flash-lite sebelumnya."
      ],
    },
    {
      version: "v2.44.0",
      date: "29 May 2026",
      changes: [
        "Peningkatan Kapasitas & Stabilitas API Backend: Mengganti model AI utama ke 'gemini-1.5-pro' untuk merespons pelaporan limit kuota tersendat (Error 429) pada versi gemini-2.0-flash di free tier. Model ini menyediakan batasan limit yang jauh lebih aman sembari tetap menjaga akurasi mendetail."
      ],
    },
    {
      version: "v2.43.0",
      date: "29 May 2026",
      changes: [
        "Optimalisasi Akurasi Rotasi Live Try-On: Memperbaiki bug kalkulasi titik tumpu (pivot point) 3D model yang sebelumnya menggunakan bagian atas pangkal hidung (nasion) yang konstan, diubah menggunakan ujung hidung (nose tip / landmark 30) yang sangat responsif, sehingga kini rotasi YAW bingkai kacamata dapat mengikuti pergerakan tengokan wajah pengguna secara luwes dan akurat.",
        "Pemulihan API Model Backend: Melakukan migrasi backend instance dari 'gemini-3.1-flash-lite' kembali menuju 'gemini-2.0-flash' untuk memastikan kompatibilitas Endpoint dan menyelesaikan masalah API Version v1beta Error 404 (Not Found)."
      ],
    },
    {
      version: "v2.42.0",
      date: "29 May 2026",
      changes: [
        "Peningkatan UX Kamera & Model Filter Kacamata: Menambahkan efek *mirroring* (-scale-x-100) pada feed kamera langsung dan *canvas output* agar visualisasi gerakan kepala pengguna natural seperti cermin aslinya. Memperbarui instance pipeline detektor kacamata (*fallback*) dengan model API terbaru yang didukung untuk menyelesaikan isu bypass *NOT_FOUND* pada endpoint analisis model.",
      ],
    },
    {
      version: "v2.41.0",
      date: "29 May 2026",
      changes: [
        "Optimalisasi Tampilan Kalibrasi Wajah: Memindahkan instruksi 'Kalibrasi Posisi Wajah' ke bagian atas layar dengan padding yang lebih rapi (top-4) dan ukuran dinamis, agar tidak menghalangi wajah pengguna secara langsung di dalam area _scanning oval_. Perbaikan ini membuat antarmuka menjadi lebih intuitif, clean, dan tidak mengganggu saat pengambilan gambar."
      ],
    },
    {
      version: "v2.40.0",
      date: "29 May 2026",
      changes: [
        "Rollback dan Migrasi Sistem Deteksi Kacamata (Option A): Mengembalikan modul filter kacamata dari _client-side_ (face-api.js) ke _server-side_ menggunakan model AI Gemini API khusus. Pendekatan ini mengatasi masalah bypass deteksi (sehingga kacamata pengguna tidak lolos pemindaian) dan memastikan kalibrasi wajah yang sangat akurat di backend server sebelum melangkah ke proses analitik utama.",
      ],
    },
    {
      version: "v2.39.0",
      date: "29 May 2026",
      changes: [
        "Sistem Deteksi Kacamata Sisi-Klien (Option C): Mengimplementasikan modul filter kacamata native memanfaatkan `face-api.js` pada saat pengambilan foto live di browser, menampilkan notifikasi seketika tanpa perlu mengirim payload ke server/API Gemini. Catatan: Pendekatan klien ini dapat menyebabkan latensi/lag 1-2 detik pada saat memencet tombol ambil foto.",
      ],
    },
    {
      version: "v2.38.0",
      date: "29 May 2026",
      changes: [
        "Optimalisasi Tata Letak Ultra-Wide (Responsive Grid Re-architecture): Melebarkan batas maksimum antarmuka (max-w-[90rem]) untuk menghilangkan kekosongan sisa batas layar pada monitor besar. Papan Diagnosis kini secara adaptif memetakan matriks kolom menjadi 3 unit di sisi desktop lebar, memberikan porsi data yang padat, presisi, dan terkalibrasi tanpa adanya stretch whitespace yang mengganggu.",
      ],
    },
    {
      version: "v2.37.0",
      date: "29 May 2026",
      changes: [
        "Resolusi Masalah Quota Firestore (Database Payload Optimizer): Menambahkan modul pemampatan gambar berbasis native-canvas pada engine konversi di sisi klien. Gambar besar kini diubah secara dinamis menjadi Base64 berukuran ringan (dibawah 500KB) sebelum disimpan ke Cloud Firestore untuk mencegah kegagalan \"Document exceeds maximum allowed size\" saat masuk ke lembar riwayat medis.",
      ],
    },
    {
      version: "v2.36.0",
      date: "29 May 2026",
      changes: [
        "Sistem Stabilisasi Trajektori EMA (Exponential Moving Average): Mengimplementasikan filter penghalus secara matematis untuk menangani getaran mikroskopis (jitter) selama sesi AR Face Tracking langsung. Mengurangi goyangan kacamata virtual dan menahan pelacakan spasial secara responsif dan jauh lebih presisi.",
      ],
    },
    {
      version: "v2.35.0",
      date: "29 May 2026",
      changes: [
        "Kompresi Gambar Otomatis (Auto-Compression Engine): Kini aplikasi secara otomatis memampatkan foto yang melebihi batas ukuran (10MB) di sisi peramban (client-side) tanpa kehilangan kualitas pengenalan wajah. Tidak akan ada lagi pemblokiran unggahan akibat kamera beresolusi tinggi, meningkatkan persentase inklusi analisis tanpa beban hambatan format (Frictionless High-Res Processing).",
      ],
    },
    {
      version: "v2.34.0",
      date: "29 May 2026",
      changes: [
        "Pemetaan Spasial 3D Parallax & Ukuran Autentik (Authentic 3D Parallax Mapping): Merombak sistem coba virtual kacamata. Komponen sekarang bergeser dan berotasi secara penuh ke sumbu Pitch, Yaw, dan Roll menduplikasi rotasi wajah asli secara presisi menggunakan transformStyle: preserve-3d CSS modern.",
        "Akurasi Sizing Horisontal Rill (True Horizontal Span Precision): Penskalaan bingkai kacamata kini diukur secara presisi mengambil indeks poin rahang-ke-rahang sejati dari faceAPI (Cheekbone limits) untuk proporsi matematis yang akurat, tidak lagi mengandalkan skala box default.",
      ],
    },
    {
      version: "v2.33.0",
      date: "29 May 2026",
      changes: [
        "Migrasi Infrastruktur Firebase Cloud Rill (Live Firebase Cloud Migration): Berhasil melakukan provisi otomatis database NoSQL cloud Firestore serta Firebase Auth rill pada proyek 'chesspedia' dengan penautan kredensial kunci API resmi.",
        "Pemasangan Aturan Keamanan Produksi (Production Rules Deployment): Mendeploy berkas firestore.rules dengan enkapsulasi Zero-Trust dan Attribute-Based Access Control secara aman di cloud untuk melindungi kerahasiaan medis pengguna.",
      ],
    },
    {
      version: "v2.32.0",
      date: "29 May 2026",
      changes: [
        "Inisialisasi Firebase Tangguh & Mode Sandbox Offline (Resilient Firebase Initialization & Sandbox Fallback): Membungkus inisialisasi Firebase SDK dalam penanganan kesalahan proaktif. Jika API Key tidak valid atau dummy (misal, akibat penghapusan config), aplikasi tidak akan crash pada waktu muat melainkan beralih secara otomatis ke Mode Sandbox dengan mock database yang aman, menjaga kestabilan total aplikasi.",
      ],
    },
    {
      version: "v2.31.0",
      date: "29 May 2026",
      changes: [
        "Validasi Ukuran Unggah Foto Proaktif (Delightful Image Size Validation): Menambahkan sistem pencegahan mandiri untuk berkas lebih dari 10MB di sisi klien dengan memberikan spanduk notifikasi kesalahan terintegrasi berpendar merah yang intuitif, menggantikan peringatan sistem bawaan ataupun rilis error default.",
        "Sinkronisasi Batas Informasi Label (Information Limit Alignment): Menyelaraskan teks batas informasi di komponen galeri uploader menjadi 10MB demi memelihara kejujuran batasan visual.",
      ],
    },
    {
      version: "v2.30.0",
      date: "29 May 2026",
      changes: [
        "Kampanye Profesional LinkedIn (LinkedIn Professional Post Drafting): Membuat dokumen khusus LINKEDIN_POST.md yang merangkum asal muasal ide orisinal 'Lumière Beauty Clinic / LuminaAesthetic' dari pengalaman personal terkena cacar air dewasa di awal April, yang dikonseptualisasikan secara matang dalam 3 pilar pengetesan: Masalah (30%), Solusi (40%), dan Keunikan (30%).",
        "Penyelarasan Siklus Rilis (Siklus Rilis v2.30.0): Melakukan bump versi antarmuka utama pengguna serta footer penjejak ke tingkat v2.30.0 demi koherensi pelaporan rilis."
      ],
    },
    {
      version: "v2.29.0",
      date: "29 May 2026",
      changes: [
        "Pusat Dokumentasi Terpadu (Comprehensive System Documentation): Membuat dokumen sistem DOCS.md yang mencakup Technical Requirement Document (TRD), Functional Specification Document (FSD) yang terperinci, alur interaksi terpetakan, ERD, dan spesifikasi kontrak API backend.",
        "Penyempurnaan Versi Sistem (System Versioning): Memperbarui pelabelan footer dan modal sejarah versi ke v2.29.0 demi transparansi rilis siklus pengembangan."
      ],
    },
    {
      version: "v2.28.0",
      date: "29 May 2026",
      changes: [
        "Resolusi Izin Akun Tamu (Guest Permissions): Memperbarui Firestore Rules (firestore.rules & DRAFT_firestore.rules) guna mendukung pembuatan entri analisis mandiri bagi Guest (userId: 'guest') serta pengambilan data yang aman tanpa memerlukan login.",
        "Pembersihan Area Kosong Seluler (Mobile Space Clean-Up): Menyembunyikan panel kosong berisi pedoman bento di tampilan seluler (appState !== 'results') untuk merampingkan alur berfoto secara dinamis tanpa guliran ekstrem.",
        "Roda Penyelaras Tata Letak Desktop (Desktop Space Balancing): Mengganti perataan 'justify-between' dengan alur sentris 'justify-center gap-y-6' pada panel kosong guna menyatukan elemen visual di berbagai tinggi layar desktop tanpa kerenggangan."
      ],
    },
    {
      version: "v2.27.0",
      date: "28 May 2026",
      changes: [
        "Restrukturisasi Tata Letak Kiri-Kanan Seimbang: Memisahkan panel input klinis mandiri di navigasi sebelah kiri, serta memindahkan bento pedoman presisi ke area dashboard kanan saat kosong.",
        "Refinement Penilaian Rekomendasi: Memperkecil lencana rekomendasi serta menyederhanakan uploader galeri tanpa tombol 'pilih berkas' redundan demi kerapian visual vertikal sidebar.",
        "Pusat Panduan Estetika Interaktif: Menghadirkan Onboarding Bento interaktif di sisi kanan ('dashboard-empty') berisi 4 pilar pedoman presisi (Posisi, Cahaya, Ekspresi, & Wajah Bersih) yang terintegrasi pengaman medis HIPAA."
      ],
    },
    {
      version: "v2.26.0",
      date: "28 May 2026",
      changes: [
        "Pengutamaan Kamera AI Live: Memindahkan posisi instrumen pembuka Kamera Sistem Live ke urutan teratas sebagai prioritas utama bagi kenyamanan berfoto langsung.",
        "Desain Panel Kamera Refined: Mendesain ulang kartu Kamera AI dengan efek bayangan membal, animasi bouncing, serta indikator hijau pendar presisi.",
        "Uploader File Sekunder Kompak: Menyederhanakan dropzone pengunggah berkas eksternal menjadi horizontal di bawah pembatas pemisah elegan untuk menjaga fokus alur kerja interaksi."
      ],
    },
    {
      version: "v2.25.0",
      date: "28 May 2026",
      changes: [
        "Dashboard Ultra-Compact Seluler: Mendesain ulang margin, celah (gaps), dan padding kartu menjadi dinamis kompak p-3 sm:p-4 untuk kenyamanan pemantauan data di smartphone.",
        "Anotasi Catatan Estetika Eksklusif: Menghadirkan widget panel resep/catatan klinis dinamis dari konsultan (Advisory Notes) di urutan pertama dashboard hasil dengan sentuhan visual emas-oranye mewah.",
        "Akordeon Lipat Presisi Simetri AI: Mempersingkat tinggi kartu analisis geometri dengan menu lipat (collapsible toggle) interaktif untuk rasio keselarasan bentuk dahi, alis, bibir, dan dagu.",
        "Integrasi Tombol Kontrol Ekspansi: Mempermudah penyesuaian detail parameter proporsi estetis dengan sekali sentuh tanpa memperpanjang gulir vertikal seluler."
      ],
    },
    {
      version: "v2.24.1",
      date: "28 May 2026",
      changes: [
        "Resolusi Autentikasi Firebase: Memperbaiki error 'auth/invalid-api-key' dengan mengalihkan pemuatan konfigurasi langsung dari file 'firebase-applet-config.json' terikat lokal produk.",
        "Penghapusan Ketergantungan Env Client: Mengeliminasi ketergantungan runtime client terhadap variabel lingkungan '.env' eksternal atau build-time replacements."
      ],
    },
    {
      version: "v2.24.0",
      date: "28 May 2026",
      changes: [
        "Optimalisasi Tata Letak Live Try-On: Memindahkan komponen slider presisi kalibrasi (Y/X offset, Skala, dan Kemiringan) tepat di bawah panel preview wajah tanpa perlu melakukan scroll.",
        "Peningkatan Grafis Bingkai Bingkisan 3D SVG: Menambahkan efek pantulan realistik 3D metal logam, gloss gradien lensa, lengkungan bayangan gagang (temple arms back reflections), serta rivet berkilau.",
        "Kalibrasi Deteksi Alinyemen Mata AI: Menyesuaikan pusat frame agar kacamata terpasang pas secara anatomis di posisi mata target otomatis (koordinat x: 63 & 137).",
        "Perbaikan Bug Linter & Kompilation: Mengatasi konflik perbandingan tipe peran pengguna (user role) di App.tsx serta mengadopsi penanganan aman platform 'import.meta as any' dalam firebase.ts."
      ],
    },
    {
      version: "v2.23.0",
      date: "27 May 2026",
      changes: [
        "Mendesain infografis poster editorial premium 'Spectacles Guide' dengan layout visual-first, garis tipis, dan kartu melengkung mewah.",
        "Mengimplementasikan pemrosesan analisis kontur otomatis wajah (kombinasi rasio geometri kualifikasi) untuk rekomendasi kacamata cocok vs tidak cocok.",
        "Menyajikan simulasi side-by-side kacamata yang cocok dan tidak cocok secara real-time langsung di atas potret subjek wajah yang sama.",
        "Membangun Salon Coba Kacamata Virtual Interatif (Live Try-On Suite) lengkap dengan slider presisi kalibrasi (Y/X offset, Skala, dan Kemiringan) serta opsi penyesuaian material warna bingkai secara instan."
      ],
    },
    {
      version: "v2.22.0",
      date: "27 May 2026",
      changes: [
        "Menambahkan overlay bingkai pola oval kontur silhouette wajah (Face Shape Oval Outline) interaktif di pemindai kamera.",
        "Menyematkan pemantauan kepatuhan kalibrasi real-time (Presisi, Terang, Netral) guna mempermudah penempatan posisi.",
        "Mendesain panel edukasi pedoman foto presisi estetika AI di halaman awal untuk konsistensi pengambilan gambar pasien."
      ],
    },
    {
      version: "v2.21.0",
      date: "27 May 2026",
      changes: [
        "Menambahkan 4 bar visualisasi metrik rincian simetri elemen wajah (Alis, Mata, Bibir/Hidung, dan Dagu) pada panel dasar untuk menyeimbangkan layout visual.",
        "Mengimplementasikan pemanggilan latar belakang (background pre-fetching) real-time Gemini AI langsung saat pemindaian awal selesai.",
        "Menyetel konsistensi penuh skor dan visualisasi simetri wajah agar data sebelum dan sesudah mengklik tombol detail geometri seragam sempurna."
      ],
    },
    {
      version: "v2.20.0",
      date: "27 May 2026",
      changes: [
        "Mendesain panel kecantikan & proporsi geometri simetri AI baru untuk mengisi ruang kosong di bawah bagian rahang visualisasi dahi.",
        "Menyajikan skor visual persentase simetri wajah (Facial Symmetry Score) adaptif yang terintegrasi dengan data riwayat klinis pasien.",
        "Menghadirkan mini-grid status kalibrasi kualifikasi Grid Horizontal klinis serta penunjuk Rasio Emas (Golden Ratio) penyeimbang estetika."
      ],
    },
    {
      version: "v2.19.0",
      date: "27 May 2026",
      changes: [
        "Menambahkan fitur ekspor log audit keamanan sistem ke dalam format berkas CSV secara instan untuk analisis cepat berbasis spreadsheet.",
        "Mengintegrasikan fitur ekspor log audit sistem kedalam format Laporan Ringkasan PDF multi-halaman berdesain medis premium dan berstempel kepatuhan HIPAA.",
        "Membatasi kontrol ekspor dokumen log sistem secara eksklusif hanya dapat diakses oleh pemegang peran akun Super Admin."
      ],
    },
    {
      version: "v2.18.1",
      date: "27 May 2026",
      changes: [
        "Meningkatkan antarmuka pengguna (UX) dengan memisahkan dialog konfirmasi hapus data medis menjadi format Modal Popup mengambang (overlay) dan latar blur (backdrop).",
        "Menghilangkan konfirmasi inline sebaris data nama demi visualisasi panel registrasi yang lebih bersih dan rapi.",
        "Menampilkan detail lengkap riwayat diagnosa pasien secara ringkas dan aman langsung di dalam kartu dialog sebelum eksekusi penghapusan."
      ],
    },
    {
      version: "v2.18.0",
      date: "27 May 2026",
      changes: [
        "Menghadirkan fitur Hapus Record Medis & Catatan Pemindaian eksklusif bagi Super Admin (CEO/Dr. Clara).",
        "Dilengkapi dialog konfirmasi bawaan (double check) sebelum menghapus berkas pasien guna meminimalkan kesalahan klinis.",
        "Mengintegrasikan detektor log audit otomatis untuk setiap peristiwa pembersihan/penghapusan data secara transparan bagi tata kelola sertifikasi keamanan."
      ],
    },
    {
      version: "v2.17.0",
      date: "27 May 2026",
      changes: [
        "Mendukung responsivitas scrollbar adaptif penuh pada daftar registrasi Diagnosis Ledgers & Anotasi Medis.",
        "Mengintegrasikan modul penjelajah data berbasis paginasi (default 5 data per halaman, dengan pemilih ukuran halaman 5, 10, 20, 50, dan 100 baris).",
        "Menghadirkan fitur ekspor/unduhan laporan PDF klinis instan secara independen langsung dari dasbor Admin & Super Admin untuk setiap klien yang terdaftar."
      ],
    },
    {
      version: "v2.16.0",
      date: "27 May 2026",
      changes: [
        "Meningkatkan lapisan pengamanan riwayat (history): Mengisolasi riwayat agar data lengkap pemindaian hanya dapat dibaca oleh Admin dan Super Admin.",
        "Membatasi hak akses pengguna biasa (user) secara ketat, sehingga mereka hanya dapat melihat dan membaca data riwayat yang ditambahkan melalui akun mereka sendiri."
      ],
    },
    {
      version: "v2.15.0",
      date: "27 May 2026",
      changes: [
        "Menambahkan Landing Page spektakuler yang merangkum parameter dan stats kegunaan klinis Lumina Aesthetic AI.",
        "Mengintegrasikan sistem autentikasi formal dan registrasi akun kustom dengan 3 Demo Presets instan (Super Admin, Aesthetic Consultant, VIP Client).",
        "Mengimplementasikan Role-Based Access Control (RBAC) lengkap dengan dasbor anotasi catatan klinis dokter untuk admin, pelacakan audit keamanan real-time untuk Super Admin, dan riwayat yang terisolasi aman/terpusat.",
        "Mengalirkan komentar medis/expert anotasi konsultan secara dinamis langsung ke visualizer dasbor hasil dan dokumen cetak PDF."
      ],
    },
    {
      version: "v2.14.0",
      date: "27 May 2026",
      changes: [
        "Menambahkan integrasi penuh Personal Color Analysis ke dalam dokumen dokumen ekspor PDF Report.",
        "Mengimplementasikan detektor status data dinamis: Jika modul Analisis Warna atau Geometri Wajah belum dijalankan, halaman PDF akan merender halaman status edukatif (Option B) daripada halaman kosong.",
        "Menyertakan bagan rekomendasi aksesoris AI-Generated dan pakaian terbaik secara dinamis dalam visualisasi PDF.",
        "Mematangkan aspek paginasi multi-halaman A4 yang terstruktur rapi untuk menghindari elemen teks terpotong masa unduhan."
      ],
    },
    {
      version: "v2.13.0",
      date: "27 May 2026",
      changes: [
        "Menghadirkan rekomendasi Aksesoris Kulit dinamis berbasis kecerdasan buatan (AI-Generated Accessories).",
        "Menyesuaikan jenis aksesoris secara personal berdasarkan deteksi gender/presentasi penampilan oleh Gemini (maskulin vs feminin vs netral).",
        "Mengintegrasikan emoji visual otomatis serta deskripsi gaya yang selaras dengan musim palet warna pengguna.",
        "Menyediakan sistem fallback cerdas ke rekomendasi statis musiman untuk menjamin kecocokan data riwayat lama."
      ],
    },
    {
      version: "v2.12.0",
      date: "27 May 2026",
      changes: [
        "Menghadirkan Virtual Try-On interaktif berbasis foto asli pengguna menggunakan canvas warna pakaian.",
        "Menyediakan alat kalibrasi warna baju instan melalui klik pada bagian baju di foto dasar.",
        "Menambahkan slider penyesuaian sensitivitas deteksi jangkauan warna kain baju demi hasil pencampuran warna yang presisi.",
        "Mendukung transisi fleksibel antara mode Foto Asli (Virtual Try-on) dan Gaya Siluet (Avatar)."
      ],
    },
    {
      version: "v2.11.0",
      date: "27 May 2026",
      changes: [
        "Menghadirkan simulasi visual avatar interaktif pada modal analisis warna (Color Analysis).",
        "Menyediakan pilihan jenis pakaian/outfit (Hijab & Blus, Jas/Blazer, Kemeja, T-Shirt) yang secara dinamis diwarnai dengan warna pakaian rekomendasi.",
        "Menyertakan visualizer slider karakteristik spektrum musiman (Hue, Value, Chroma) dan rekomendasi aksesoris kulit berdasarkan profil season wajah pengguna."
      ],
    },
    {
      version: "v2.10.1",
      date: "27 May 2026",
      changes: [
        "Menambahkan komponen progress bar interaktif pada kartu Color Analysis untuk representasi visual rata-rata tingkat kecocokan warna pakaian.",
        "Meningkatkan ketahanan sistem API dengan validasi respons JSON untuk mencegah crash akibat Unexpected token HTML pada client-side."
      ],
    },
    {
      version: "v2.10.0",
      date: "27 May 2026",
      changes: [
        "Menambahkan fitur Color Analysis berbasis AI untuk simulasi warna pakaian yang paling cocok dengan skintone wajah.",
        "Menggabungkan rekomendasi Gaya Rambut & Kacamata ke dalam satu panduan Bentuk Wajah (Face Shape Guide)."
      ],
    },
    {
      version: "v2.9.6",
      date: "27 May 2026",
      changes: [
        "Memperbaiki hardcoded text 'Gunakan Kamera Sistem' dan deskripsi 'Privasi Terjamin' agar mendukung lokalisasi (ID/EN) di halaman unggah foto."
      ],
    },
    {
      version: "v2.9.5",
      date: "26 May 2026",
      changes: [
        "Memperluas sistem Dictionary Caching pada tingkat Dashboard (App level). Saat toggle bahasa (ID \u2194 EN), bagian Skin Diagnosis dan seluruh kartu hasil analisis AI kini otomatis diperbarui (re-translate) secara efisien menggunakan cache lokal terpusat."
      ],
    },
    {
      version: "v2.9.4",
      date: "26 May 2026",
      changes: [
        "Memperbaiki error 'Quota Limit / Rate Limit 429' (limitation 0) pada gemini-2.0-flash dengan beralih ke model `gemini-3.1-flash-lite` yang lebih ringan, cepat, dan kompatibel serta memiliki limit yang lebih besar untuk pengujian preview gratis."
      ],
    },
    {
      version: "v2.9.3",
      date: "26 May 2026",
      changes: [
        "Memperbaiki error 'models/gemini-1.5-flash is not found' dengan mengganti instance model backend ke `gemini-2.0-flash` yang kompatibel dengan versi SDK saat ini."
      ],
    },
    {
      version: "v2.9.2",
      date: "26 May 2026",
      changes: [
        "Memperbaiki error 'Quota Limit / Rate Limit 429' dengan mengganti model AI yang beroperasi ke `gemini-1.5-flash` yang memiliki free limit lebih tinggi."
      ],
    },
    {
      version: "v2.9.1",
      date: "26 May 2026",
      changes: [
        "Mengimplementasikan caching Memori Multi-Bahasa. Analisis AI sekarang dicatat di memori berdasarkan bahasa yang dipilih (Dictionary Caching), untuk mencegah hit API berulang kali secara sia-sia saat toggle bahasa."
      ],
    },
    {
      version: "v2.9.0",
      date: "26 May 2026",
      changes: [
        "Memperbaiki bug bahasa 'Analisis Geometri Detail' yang tidak berubah ke bahasa Inggris melalui sistem auto-invalidasi cache saat bahasa diganti.",
        "Menerjemahkan teks statis yang tertinggal dalam menu 'Skin Diagnosis' dan 'Perbandingan Tipe Kulit' agar beradaptasi dengan bahasa terpilih.",
        "Menyelesaikan layout `h-full` pada modal geometri wajah untuk mencegah gambar menumpuk di atas data kartu teks pada layar ponsel (mobile layout fix)."
      ],
    },
    {
      version: "v2.8.3",
      date: "26 May 2026",
      changes: [
        "Memperbaiki tata letak (layout) fitur 'Analisis Geometri Detail' pada perangkat mobile dan tablet agar tidak tumpang tindih.",
        "Mengganti posisi sticky yang menutupi konten di layar kecil menjadi flow vertikal yang lebih rapi.",
        "Menambahkan terjemahan dan penyelarasan text (alignment) yang lebih baik pada mobile."
      ],
    },
    {
      version: "v2.8.2",
      date: "26 May 2026",
      changes: [
        "Meningkatkan model AI ke `gemini-3.5-flash` untuk stabilitas lebih baik dan mengurangi 'transient errors'.",
        "Memperbarui log sistem agar pesan retry otomatis jaringan tidak membingungkan pengguna."
      ],
    },
    {
      version: "v2.8.1",
      date: "26 May 2026",
      changes: [
        "Menghubungkan parameter bahasa (ID/EN) ke sistem prompt AI di backend sehingga output deskripsi dari Gemini menyesuaikan bahasa yang dipilih.",
        "Menerjemahkan teks 'Analysis Result', 'Skin Type', 'Hairstyle Recs', dan tombol 'Compare' & 'Mulai Analisis Baru'."
      ],
    },
    {
      version: "v2.8.0",
      date: "26 May 2026",
      changes: [
        "Memperbaiki fitur Switcher Bahasa agar dapat mengubah teks pada dialog analisis mendalam dan fitur lainnya dengan benar.",
        "Mengekstraksi Face Shape Guide ke menu baru 'Glasses Frame Detail' agar antarmuka Face Geometry tetap minimalis dan terfokus pada analisis geometris dasar.",
        "Menambahkan modal terpisah (Glasses Frame Guide) yang berisi gaya kacamata dan panduan rambut secara spesifik."
      ],
    },
    {
      version: "v2.7.0",
      date: "26 May 2026",
      changes: [
        "Menambahkan fitur Switcher Bahasa (ID / EN) secara dinamis di header untuk memudahkan preferensi bahasa.",
        "Menerjemahkan teks aplikasi (Menu, Analisis Kulit, Face Shape Guide, Rekomendasi, Riwayat) untuk dukungan bilingual penuh."
      ],
    },
    {
      version: "v2.6.1",
      date: "26 May 2026",
      changes: [
        "Menambahkan section baru 'Face Shape Guide' di dalam jendela Face Geometry Analysis yang menggunakan data AI untuk memberikan penjelasan interaktif tentang gaya rambut (Hairstyles) dan kacamata (Glasses) paling direkomendasikan secara matematis berdasarkan bentuk wajah.",
        "Menyediakan akses langsung ke fitur Virtual Try-On (AR) dari menu Glasses Frame di dalam panduan Face Shape."
      ],
    },
    {
      version: "v2.6.0",
      date: "26 May 2026",
      changes: [
        "Menambahkan kapabilitas AI Gemini untuk menganalisa dan membuat rekomendasi Skin Diagnosis Mapping Zone (T-Zone, U-Zone, Chin) secara dinamis sesuai kondisi wajah tiap pasien, menggantikan data statis/template bawaan."
      ],
    },
    {
      version: "v2.5.9",
      date: "26 May 2026",
      changes: [
        "Mendesain ulang orientasi PDF Report dengan membaginya secara eksplisit menjadi beberapa halaman A4 untuk mencegah output yang terpotong dan tumpang tindih.",
        "Menambahkan nilai fallback otomatis untuk Personalized Care Plan apabila API sebelumnya belum dimuat ulang, guna menghindari section kosong pada laporan."
      ],
    },
    {
      version: "v2.5.8",
      date: "26 May 2026",
      changes: [
        "Meningkatkan fitur Download Report dengan dukungan paginasi PDF dinamis sehingga semua data (termasuk Face Geometry) berhasil dimuat dan tidak lagi terpotong.",
        "Mengganti teks template statis pada bagian 'Personalized Care Plan' menjadi hasil analisis perawatan yang digenerate langsung oleh AI Gemini secara spesifik untuk kulit pengguna."
      ],
    },
    {
      version: "v2.5.7",
      date: "26 May 2026",
      changes: [
        "Memperluas jangkauan fitur Download PDF Report untuk turut menyertakan data hasil Face Geometry Analysis yang komprehensif.",
        "Menambahkan rekaman history target hidrasi (Hydration Tracker) ke dalam lembar PDF sebagai data tambahan yang mendukung personalisasi rencana perawatan (Personal Care Plan)."
      ],
    },
    {
      version: "v2.5.6",
      date: "26 May 2026",
      changes: [
        "Menjamin pemanggilan AI Face Geometry (face-api.js) via useEffect dijamin berjalan meskipun event onLoad gambar tidak terpicu secara default.",
        "Mengimplementasi variasi warna yang spesifik dan konsisten untuk semua jenis polygon face bounding box (kegagalan deteksi lokal kini mendukung fallback warna topology face geometry agar visualisasi pro tetap konsisten)."
      ],
    },
    {
      version: "v2.5.5",
      date: "26 May 2026",
      changes: [
        "Menghilangkan efek zoom in pada modal Face Geometry Analysis.",
        "Meningkatkan visualisasi Face Geometry dengan warna dan gradien soft transparan yang berbeda untuk setiap area wajah (Mata biru, Hidung amber, Bibir rose, Rahang hijau) untuk menyesuaikan estetika topo wajah profesional klinik kecantikan.",
      ],
    },
    {
      version: "v2.5.4",
      date: "26 May 2026",
      changes: [
        "Memperbaiki bug rendering koordinat (titik dan polygon bersinar) pada Face Geometry Analysis yang tidak muncul karena skala absolut 1000px dari AI yang melebihi batas batas viewBox 100% dari container SVG.",
        "Akurasi zoom Face Box di perbaiki ketika area kotak deteksi melampaui koordinat normal.",
        "Mengganti ekstraksi koordinat AI dengan analitik FaceGeometry (face-api.js) untuk presisi 100% pada penempatan polygon, shape wajah, dan titik referensi.",
        "Desain polygon dengan gradien soft transparan untuk estetika tampilan profesional."
      ],
    },
    {
      version: "v2.5.3",
      date: "26 May 2026",
      changes: [
        "Memperbaiki bug di mana grafis wajah (polygon area) dan fitur zoom tidak muncul saat membuka kembali modal Face Geometry Analysis akibat penggunaan data cache lama yang belum memiliki struktur data terbaru."
      ],
    },
    {
      version: "v2.5.2",
      date: "26 May 2026",
      changes: [
        "Menambahkan nilai kembali (fallback) untuk ringkasan tipe wajah jika data sebelumnya (cache) belum memiliki output AI."
      ],
    },
    {
      version: "v2.5.1",
      date: "26 May 2026",
      changes: [
        "Memperbarui teks analisis bentuk wajah pada modul Face Geometry Analysis agar deskripsinya dihasilkan secara dinamis menggunakan AI, bukan teks statis."
      ],
    },
    {
      version: "v2.5.0",
      date: "26 May 2026",
      changes: [
        "Memperbarui visualisasi titik fitur wajah pada Modal Face Geometry. Sekarang titik kordinat diperluas menjadi pemetaan area (polygon) bercahaya persis seperti pada modul Skin Diagnosis untuk memberikan visualisasi batas area wajah (mata, pipi, dll) yang jauh lebih jelas dan intuitif."
      ],
    },
    {
      version: "v2.4.1",
      date: "26 May 2026",
      changes: [
        "Menambahkan kontrol toggle (filter fitur) di Face Geometry Analysis untuk menyembunyikan/menampilkan garis penghubung dan titik koordinat dari bagian wajah tertentu (seperti mata, hidung, atau mulut)."
      ],
    },
    {
      version: "v2.4.0",
      date: "26 May 2026",
      changes: [
        "Menambahkan fitur Interaktif Symmetry Mode pada overlay Face Geometry Analysis, yang memungkinkan pengguna melihat simulasi pencerminan sisi kiri dan kanan wajah.",
        "Menambahkan toggle Symmetry Grid untuk melihat tingkat simetri vertikal dan horizontal wajah."
      ],
    },
    {
      version: "v2.3.6",
      date: "26 May 2026",
      changes: [
        "Memperbaiki fitur Zoom dan Garis Geometri (Face Features) yang hilang dengan memperbaiki parsing angka dan nilai koordinat yang dikembalikan oleh AI."
      ],
    },
    {
      version: "v2.3.5",
      date: "26 May 2026",
      changes: [
        "Memperbaiki isu layar blank putih di popup Face Geometry Analysis (disebabkan nilai skala zoom AI yang ekstrem tidak terduga)."
      ],
    },
    {
      version: "v2.3.4",
      date: "26 May 2026",
      changes: [
        "Memperbaiki error model Gemini tidak ditemukan pada API (404) dengan mengganti model target ke gemini-3.1-flash-lite yang tersedia dan memiliki limit lebih besar."
      ],
    },
    {
      version: "v2.3.3",
      date: "26 May 2026",
      changes: [
        "Menghapus waktu tunggu instruksi model (60s delays) untuk API Quota Exceeded dan mengubah model menjadi gemini-1.5-flash untuk kapasitas limit yang lebih besar."
      ],
    },
    {
      version: "v2.3.2",
      date: "26 May 2026",
      changes: [
        "Memperbarui model AI dari gemini-3.5-flash ke gemini-2.0-flash untuk menangani error Quota Rate Limit (429)."
      ],
    },
    {
      version: "v2.3.1",
      date: "26 May 2026",
      changes: [
        "Memperbaiki penanganan error transient API model dengan memperpanjang waktu tunggu (wait time) pada error rate-limiting (429)."
      ],
    },
    {
      version: "v2.3.0",
      date: "26 May 2026",
      changes: [
        "Menambahkan caching data hasil analisis AI agar tidak memanggil server berkali-kali untuk gambar yang sama.",
        "Menambahkan fitur Zoom In otomatis ke area wajah pada geometri analisis.",
        "Menambahkan titik penanda (coordinate dots) serta garis penghubung presisi ke setiap fitur wajah melalui deteksi AI."
      ],
    },
    {
      version: "v2.2.2",
      date: "26 May 2026",
      changes: [
        "Memperbaiki isu layout (halaman terpotong saat scroll) pada modal Detailed Face Geometry Analysis.",
        "Menghilangkan garis penghubung elemen agar tampilan lebih ringkas dan tidak ambigu."
      ],
    },
    {
      version: "v2.2.1",
      date: "26 May 2026",
      changes: [
        "Memperbaiki pesan error transient API model dan memperbarui model yang digunakan ke versi terbaru (gemini-3.5-flash) untuk mengurangi kejadian 503."
      ],
    },
    {
      version: "v2.2.0",
      date: "26 May 2026",
      changes: [
        "Menambahkan skor simetri wajah (Symmetry Score 0-100) dan penjelasan tingkat simetri pada modul analisis geometri wajah."
      ],
    },
    {
      version: "v2.1.3",
      date: "26 May 2026",
      changes: [
        "Menambahkan sistem retry otomatis pada API Server saat model gemini sedang mengalami kepadatan tinggi (Error 503)."
      ],
    },
    {
      version: "v2.1.2",
      date: "26 May 2026",
      changes: [
        "Memperbaiki bug encoding format Base64 pada gambar blob url saat integrasi model AI untuk analisis fitur geometri wajah.",
        "Pembenaran versi model AI yang dipanggil ke versi stabil."
      ],
    },
    {
      version: "v2.1.1",
      date: "26 May 2026",
      changes: [
        "Menyesuaikan tata letak tombol Changelog dan SCAN_ID di area footer agar lebih rapi.",
        "Memperbarui label versi dengan riwayat pembaruan tata letak."
      ],
    },
    {
      version: "v2.1.0",
      date: "26 May 2026",
      changes: [
        "Storage persistence implemented with localforage.",
        "Side-by-side progress comparison view added to history.",
        "Filtering options for History based on hydration score and skin type.",
        "Interactive and responsive PDF generation using html-to-image.",
        "Fully responsive UI layout across device dimensions.",
      ],
    },
    {
      version: "v1.1.0",
      date: "Previous Release",
      changes: [
        "Added AR face tracking overlays directly to the dashboard analysis.",
        "Enhanced visual styling for the dashboard.",
      ],
    },
    {
      version: "v1.0.0",
      date: "Initial Release",
      changes: [
        "Skin analysis platform with basic upload functionality.",
        "Dashboard view with skin diagnosis, treatments, and recommendations.",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Changelog & Updates
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Lumina Aesthetic Version History
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
          {versions.map((ver, idx) => (
            <div key={idx} className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-3 h-3 bg-pink-500 rounded-full border-4 border-slate-50 shadow-sm z-10" />
              {idx !== versions.length - 1 && (
                <div className="absolute left-1.5 top-4 bottom-[-32px] w-[2px] bg-slate-200" />
              )}

              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-600 font-bold text-xs tracking-wider">
                  {ver.version}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {ver.date}
                </span>
              </div>

              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <ul className="space-y-3">
                  {ver.changes.map((change, cIdx) => (
                    <li
                      key={cIdx}
                      className="flex items-start gap-2 text-sm text-slate-600 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
