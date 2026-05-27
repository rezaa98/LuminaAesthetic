import { motion } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal = ({ onClose }: ChangelogModalProps) => {
  const versions = [
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
