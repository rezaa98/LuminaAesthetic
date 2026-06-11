import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const factsID = [
  "Tahukah Anda? Kulit wajah memperbarui dirinya sendiri setiap 28 hari.",
  "Pijat wajah dapat meningkatkan sirkulasi darah dan produksi kolagen.",
  "Tidur yang cukup sangat penting untuk mengurangi hiperpigmentasi sekitar mata.",
  "Kelembaban udara berpengaruh besar pada tingkat hidrasi kulit alami.",
  "Rasio simetri wajah sering kali dikaitkan dengan daya tarik genetik.",
  "Tabir surya (sunscreen) adalah pertahanan terbaik melawan penuaan dini."
];

const factsEN = [
  "Did you know? Facial skin renews itself approximately every 28 days.",
  "Facial massages can improve blood circulation and stimulate collagen production.",
  "Adequate sleep is crucial for reducing hyperpigmentation around the eyes.",
  "Air humidity greatly affects the natural hydration levels of your skin.",
  "Facial symmetry ratios are often associated with genetic attractiveness.",
  "Sunscreen is your best defense against premature aging."
];

export function AnalysisLoading() {
  const { language } = useLanguage();
  const facts = language === 'id' ? factsID : factsEN;
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 3500); // Change fact every 3.5 seconds

    return () => clearInterval(interval);
  }, [facts.length]);

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

      <h3 className="text-lg font-bold text-pink-600 mb-2">
        {language === 'id' ? 'Memproses Data...' : 'Processing Data...'}
      </h3>
      
      <p className="text-sm text-slate-500 italic animate-pulse text-center mb-6">
        {language === 'id' ? 'AI sedang menganalisis wajah Anda...' : 'AI is analyzing your face...'}
      </p>

      {/* Progress bar simulation */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
        <motion.div 
          className="h-full bg-pink-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      </div>

      {/* Fun Facts Section */}
      <div className="max-w-[80%] min-h-[60px] bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3 shadow-sm">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentFactIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-slate-600 font-medium leading-relaxed"
            >
              {facts[currentFactIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
