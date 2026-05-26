import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function AnalysisLoading() {
  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-sm relative z-10"
      data-testid="analysis-loading-view"
    >
      <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
        {/* Outer glowing rings */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-pink-200"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border border-pink-300"
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        
        {/* Core spinner */}
        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center shadow-inner relative z-10 border border-pink-100">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="text-pink-500" size={28} strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-pink-600 mb-2">Memproses Data...</h3>
      
      <p className="text-sm text-slate-500 italic animate-pulse text-center mb-6">
        AI sedang menganalisis wajah Anda...
      </p>

      {/* Progress bar simulation */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <motion.div 
          className="h-full bg-pink-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
