import { motion } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal = ({ onClose }: ChangelogModalProps) => {
  const versions = [
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
