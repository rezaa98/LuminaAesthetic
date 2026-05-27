import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Compass, Palette, Heart, Users, ArrowRight, ArrowUpRight, CheckCircle2, UserCheck, Activity, Award } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onStartAsGuest: () => void;
  onOpenLogIn: (presetRole?: UserRole) => void;
  language: 'id' | 'en';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAsGuest, onOpenLogIn, language }) => {
  const isEn = language === 'en';

  const stats = [
    { value: '150k+', label: isEn ? 'Faces Scanned' : 'Wajah Teranalisis', desc: isEn ? 'Secure clinical queries processed' : 'Kueri klinis diproses aman' },
    { value: '98.4%', label: isEn ? 'AI Accuracy Metric' : 'Akurasi Deteksi AI', desc: isEn ? 'Skin diagnosis precision' : 'Presisi diagnosis tipe kulit' },
    { value: '4.9 ★', label: isEn ? 'Client Rating' : 'Kepuasan Pengguna', desc: isEn ? 'Highly rated aesthetic insights' : 'Saran estetika teruji klinis' },
    { value: '3+', label: isEn ? 'Bespoke User Roles' : 'Peran Akses Terstruktur', desc: isEn ? 'Client, Consultant, and Admin' : 'Klien, Konsultan & Admin Utama' }
  ];

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-pink-500" />,
      title: isEn ? 'Aesthetic AI Skin Diagnosis' : 'Diagnosis Kulit Klinis AI',
      desc: isEn ? 'Analyzes hydration levels, redness points (T-Zone/U-Zone), and maps deep skin compositions.' : 'Menganalisis kadar hidrasi, poin kemerahan (T-Zone/U-Zone), dan memetakan struktur kulit terdalam Anda.'
    },
    {
      icon: <Palette className="w-6 h-6 text-indigo-500" />,
      title: isEn ? 'Personal Color Spectrum' : 'Analisis Spektrum Warna',
      desc: isEn ? 'Identifies your color season (Spring, Summer, Autumn, Winter) and details exact wardrobe & accessory synergy.' : 'Menemukan palet musim Anda (Spring, Summer, Autumn, Winter) serta memberikan rujukan rona busana & kosmetik.'
    },
    {
      icon: <Compass className="w-6 h-6 text-purple-500" />,
      title: isEn ? '3D Geometry Face Matrix' : 'Matriks Geometri Wajah 3D',
      desc: isEn ? 'Calculates eyebrow placement, facial symmetry scores, jawline soft/sharp curvature indices, and frame suitability.' : 'Menghitung rasio alis, skor simometri wajah penuh, indeks kelengkungan rahang, serta kesesuaian bingkai mata.'
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: isEn ? 'Expert Clinic Integration' : 'Integrasi Rekomendasi Klinik',
      desc: isEn ? 'Direct annotation capabilities where certified medical consultants review AI charts and write bespoke notes.' : 'Kemampuan anotasi rujukan di mana konsultan kecantikan bersertifikat meninjau bagan dan menyertakan saran resep.'
    }
  ];

  const roleShowcase = [
    {
      role: 'super_admin' as UserRole,
      title: isEn ? 'Super Admin Panel' : 'Super Admin (Dr. Lumina)',
      desc: isEn ? 'Access system statistics, review database audits, promotion panel, and adjust role access.' : 'Akses dashboard statistik klinik, audit jejak keamanan, manajemen promosi status, dan penetapan role.'
    },
    {
      role: 'admin' as UserRole,
      title: isEn ? 'Consultant Dashboard' : 'Konsultan Estetika (Nurse)',
      desc: isEn ? 'Audit patient scanning history, review AI outputs, and append custom clinical advice annotations directly.' : 'Menyortir direktori riwayat pasien, memverifikasi hasil foto AI, dan menyertakan anotasi resep rujukan.'
    },
    {
      role: 'user' as UserRole,
      title: isEn ? 'Standard Client View' : 'Klien Utama (Pengguna Biasa)',
      desc: isEn ? 'Upload selfie, track continuous water hydration, run simulated try-ons, and download high-contrast PDF reports.' : 'Unggah swafoto, melacak asupan air harian, simulasi AR kacamata, dan mengunduh laporan PDF A3 resmi.'
    }
  ];

  return (
    <div className="w-full flex flex-col md:overflow-y-auto h-full scrollbar-thin bg-slate-50 text-slate-800 pb-16">
      
      {/* Hero Spark Banner */}
      <section className="relative px-6 pt-16 pb-12 sm:pt-20 lg:pt-24 flex flex-col items-center justify-center text-center overflow-hidden max-w-4xl mx-auto w-full shrink-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-pink-100/40 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-100/40 blur-3xl -z-10"></div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-100 rounded-full mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-pink-600 uppercase">
            {isEn ? 'V2.15 ADVANCED AESTHETIC ECOSYSTEM' : 'V2.15 EKOSISTEM ESTETIKA MANDIRI'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-3xl"
        >
          {isEn ? 'Discover Your Perfect Profile with ' : 'Ungkap Keindahan Profil Wajah Bersama '} 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 underline decoration-pink-500/20">Lumina Aesthetic</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed mb-10 font-normal"
        >
          {isEn 
            ? 'Clinically backed artificial intelligence mapped for modern face profiles. Deep skin analyses, Seasonal color pairing, 3D spectacles fitting with granular clinic consultant reviews.'
            : 'Kecerdasan buatan klinis untuk pemetaan wajah modern secara akurat. Diagnosis kulit mendalam, rujukan spektrum warna musiman, kacamata AR, lengkap dengan audit anotas konsultan.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md shrink-0"
        >
          <button
            onClick={() => onOpenLogIn()}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-pink-500/15 hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98]"
            id="btn-landing-login"
          >
            {isEn ? 'Sign In / Register' : 'Masuk / Daftar Akun'}
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onStartAsGuest}
            className="flex-1 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-2xl font-bold text-sm tracking-wide shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98]"
            id="btn-landing-guest"
          >
            {isEn ? 'Try Instant Scan' : 'Uji Pindai Instan (Tamu)'}
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </button>
        </motion.div>
      </section>

      {/* Metrics Counter */}
      <section className="px-6 py-6 border-y border-slate-200/60 bg-white/70 backdrop-blur-sm shrink-0">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
              <span className="text-[9px] text-slate-400 mt-0.5 max-w-[130px] leading-snug">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full shrink-0">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isEn ? 'Advanced Multi-Axis Analysis' : 'Analisis Terintegrasi Multi-Sumbu'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            {isEn ? 'Clinical AI metrics engineered with human aesthetic expertise.' : 'Bagan parameter klinis ditenagai AI dengan sentuhan saran medis terpercaya.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="p-6 bg-white border border-slate-200/50 rounded-2xl hover:border-pink-200 transition-colors shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-slate-800 text-sm mb-1">{feat.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Roles & Audit Ledger Access */}
      <section className="px-6 py-12 bg-indigo-950 text-white rounded-3xl max-w-4xl mx-auto w-11/12 sm:w-full shrink-0 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <Award className="w-8 h-8 text-pink-400 mx-auto mb-2 animate-bounce" />
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isEn ? 'Role-Based Client Management' : 'Sistem Kontrol Akses & Peran'}
          </h2>
          <p className="text-xs text-indigo-300 mt-1 max-w-md mx-auto">
            {isEn 
              ? 'Lumina implements Role-Based Access Control (RBAC). Select a clinic profile below to test with pre-configured logs instantly.'
              : 'Lumina menerapkan sistem RBAC. Klik salah satu preset dibawah ini untuk langsung menguji fungsi analisis dan panel koordinasi.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          {roleShowcase.map((roleInfo, idx) => (
            <div 
              key={idx} 
              onClick={() => onOpenLogIn(roleInfo.role)}
              className="p-5 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer rounded-2xl border border-white/10 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black uppercase bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">
                    {roleInfo.role.replace('_', ' ')}
                  </span>
                  <UserCheck className="w-4 h-4 text-pink-400" />
                </div>
                <h3 className="font-extrabold text-white text-sm mb-1">{roleInfo.title}</h3>
                <p className="text-[10px] text-indigo-200 leading-normal font-semibold mb-4">{roleInfo.desc}</p>
              </div>
              <span className="text-[10.5px] font-black text-pink-300 flex items-center gap-1 group mt-auto pt-2 border-t border-white/5">
                {isEn ? 'Launch Presets' : 'Buka Demo Preset'}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
