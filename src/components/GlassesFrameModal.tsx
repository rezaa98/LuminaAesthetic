import { motion } from 'motion/react';
import { X, ScanFace } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GlassesFrameModalProps {
  data: any;
  onClose: () => void;
  onTryOnAR?: () => void;
}

export const GlassesFrameModal = ({ data, onClose, onTryOnAR }: GlassesFrameModalProps) => {
  const { lang, language } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-white flex flex-col rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ScanFace className="text-pink-500 w-5 h-5" />
              {lang.glassesFrame || 'Glasses Frame Guide'}
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">{lang.faceShapeGuideSub || 'Based on your AI geometry analysis'}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Info Panel */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <h3 className="text-xl font-black text-slate-800">{lang.faceShapeGuide || 'Face Shape Guide'}</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">{lang.detectedShape || 'Detected Shape'}</p>
                  <p className="text-3xl font-black text-slate-800 mb-4">{data.faceFeatures.shape}</p>
                  <p className="text-sm rounded-xl p-4 bg-white border border-slate-100 text-slate-600 leading-relaxed font-semibold shadow-sm">
                    {data.faceFeatures.summary}
                  </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="w-full md:w-2/3 flex flex-col sm:flex-row gap-6">
                {/* Glasses */}
                <div className="flex-1 bg-pink-50 border border-pink-100 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-500 rounded-full opacity-5"></div>
                  <h4 className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {lang.mathGlassesFit || 'Mathematical Glasses Fit'}
                  </h4>
                  <div className="flex flex-col gap-3 flex-grow z-10">
                    {data.spectacles?.recommendedFrames?.map((frame: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-pink-100/50 shadow-sm transition-transform hover:-translate-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
                          <span className="text-base font-bold text-slate-700">{frame}</span>
                        </div>
                    ))}
                  </div>
                  {onTryOnAR && (
                    <button 
                      onClick={() => {
                          onClose();
                          onTryOnAR();
                      }}
                      className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all hover:shadow-md flex items-center justify-center gap-2 z-10"
                    >
                      <ScanFace className="w-4 h-4" />
                      {lang.virtualTryOn || 'Virtual Try-On'}
                    </button>
                  )}
                </div>

                {/* Hairstyles */}
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500 rounded-full opacity-5"></div>
                  <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {lang.optimalHairGeo || 'Optimal Hair Geometry'}
                  </h4>
                  <div className="flex flex-col gap-3 flex-grow z-10">
                    {data.hairstyles?.recommendedStyles?.map((style: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-blue-100/50 shadow-sm transition-transform hover:-translate-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                          <span className="text-base font-bold text-slate-700">{style}</span>
                        </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
