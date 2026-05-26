import { motion } from 'motion/react';
import { AnalysisResult } from '../types';
import { ScanFace, Scissors } from 'lucide-react';
import { useState } from 'react';

interface DashboardViewProps {
  data: AnalysisResult;
  onReset: () => void;
  onTryOnAR: () => void;
}

export function DashboardView({ data, onReset, onTryOnAR }: DashboardViewProps) {
  const [showTypeModal, setShowTypeModal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full">

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 grid grid-cols-2 grid-rows-3 gap-4"
      >
        {/* 1. Skin Analysis */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-pink-100 p-4 shadow-sm col-span-1 row-span-1" data-testid="card-skin-analysis">
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Skin Diagnosis</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Tingkat Hidrasi: <span className="text-pink-600">{data.skinAnalysis.hydration}%</span></p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-3">{data.skinAnalysis.notes}</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-pink-500 flex items-center justify-center text-[10px] font-bold text-pink-600 shrink-0">
              MOD
            </div>
          </div>
        </motion.div>

        {/* 2. Skin Type Comparison */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm col-span-1 row-span-1 flex flex-col" data-testid="card-skin-type">
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Skin Type</h3>
          <div className="flex justify-between items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-tight line-clamp-1">{data.skinType.type}</span>
            <button onClick={() => setShowTypeModal(true)} className="text-[10px] text-slate-400 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors shrink-0">Compare</button>
          </div>
          <div className="mt-3 flex gap-1 h-2 mb-1">
            <div className="w-[70%] bg-blue-400 rounded-l-full"></div>
            <div className="w-[30%] bg-slate-200 rounded-r-full"></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{data.skinType.description}</p>
        </motion.div>

        {/* 3. Face Feature Analysis */}
        <motion.div variants={itemVariants} className="bg-slate-900 text-white rounded-xl p-4 shadow-xl col-span-1 row-span-2 flex flex-col" data-testid="card-face-feature">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">Geometry Analysis</h3>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
              <div>
                <p className="text-xs text-slate-400">Face Shape</p>
                <p className="text-sm font-semibold">{data.faceFeatures.shape}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div>
                <p className="text-xs text-slate-400">Eye Type</p>
                <p className="text-sm font-semibold">{data.faceFeatures.eyes}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div>
                <p className="text-xs text-slate-400">Jawline</p>
                <p className="text-sm font-semibold">{data.faceFeatures.jawline}</p>
              </div>
            </div>
            <div className="mt-auto p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[11px] leading-relaxed text-slate-300 italic">"Bentuk wajah oval sangat fleksibel untuk berbagai gaya kacamata dan rambut."</p>
            </div>
          </div>
        </motion.div>

        {/* 4. Spectacles Guide */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm col-span-1 row-span-1 flex flex-col" data-testid="card-spectacles">
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Glasses Frame</h3>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {data.spectacles.recommendedFrames.map((frame, idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center">
                <p className="text-[11px] font-bold line-clamp-2 leading-tight">{frame}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={onTryOnAR}
            className="w-full mt-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-[10px] font-bold border border-pink-100 hover:bg-pink-100 transition-colors uppercase tracking-wider text-center"
            data-testid="btn-virtual-try-on"
          >
            Virtual Try-On
          </button>
        </motion.div>

        {/* 5. Hairstyles Analysis */}
        <motion.div variants={itemVariants} className="bg-pink-500 text-white rounded-xl p-4 shadow-sm col-span-1 row-span-1 flex flex-col" data-testid="card-hairstyles">
          <h3 className="text-xs font-bold uppercase text-pink-200 mb-2 tracking-wider">Hairstyle Recs</h3>
          <div className="flex gap-3 items-center flex-1">
            <div className="flex-1 flex flex-col justify-center gap-2">
              {data.hairstyles.recommendedStyles.map((style, idx) => (
                <p key={idx} className="text-sm font-bold leading-tight">{style}</p>
              ))}
            </div>
            <Scissors className="w-10 h-10 text-white opacity-20" viewBox="0 0 24 24" strokeWidth={1} />
          </div>
        </motion.div>
      </motion.div>

      {/* Type Comparison Modal Simulation */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="font-bold text-lg mb-4">Perbandingan Tipe Kulit</h3>
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">Tipe Anda: Oily</span>
                <p className="text-sm text-slate-600">Pori-pori besar, rentan jerawat, kilap di T-Zone.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kering (Dry)</span>
                <p className="text-sm text-slate-600">Terasa ketat, bersisik, kurang kelembapan alami.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kombinasi</span>
                <p className="text-sm text-slate-600">Berminyak di T-Zone, namun kering di area pipi.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowTypeModal(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
            >
              Kembali
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
