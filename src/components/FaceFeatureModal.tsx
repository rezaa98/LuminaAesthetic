import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, UserCircle, Eye, Loader, ScanFace, Droplet, Smile } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FaceFeatureModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

interface DetailedFeature {
  id: string; // shape, eyes, eyebrows, nose, cheeks, lips
  name: string;
  label: string;
  points: string[];
}

export const FaceFeatureModal = ({ imageSrc, onClose }: FaceFeatureModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DetailedFeature[]>([]);
  const [symmetryScore, setSymmetryScore] = useState<number | null>(null);
  const [symmetryDescription, setSymmetryDescription] = useState<string | null>(null);

  useEffect(() => {
    if (!imageSrc) return;

    let isMounted = true;

    const analyzeFeatures = async () => {
      setLoading(true);
      setError(null);
      try {
        let base64 = imageSrc;
        if (imageSrc.startsWith('blob:')) {
          const fetchedBlob = await fetch(imageSrc).then(r => r.blob());
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fetchedBlob);
          });
        }

        const res = await fetch('/api/analyze-features', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64 })
        });
        
        if (!res.ok) {
          throw new Error('Analysis failed');
        }

        const data = await res.json();
        if (isMounted) {
          setFeatures(data.features || []);
          if (data.symmetryScore !== undefined) setSymmetryScore(data.symmetryScore);
          if (data.symmetryDescription) setSymmetryDescription(data.symmetryDescription);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error running analysis');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    analyzeFeatures();

    return () => {
      isMounted = false;
    };
  }, [imageSrc]);

  const getIconForFeature = (id: string, className: string = "w-4 h-4") => {
    switch (id) {
      case 'shape': return <UserCircle className={className} />;
      case 'eyes': return <Eye className={className} />;
      case 'eyebrows': return <ScanFace className={className} />;
      case 'nose': return <Droplet className={className} />;
      case 'cheeks': return <Smile className={className} />;
      case 'lips': return <Smile className={className} />; // Or another icon
      default: return <CheckCircle2 className={className} />;
    }
  };

  const renderFeatureCard = (feature: DetailedFeature, alignRight: boolean = false) => {
    return (
      <motion.div 
        initial={{ opacity: 0, x: alignRight ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 max-w-sm w-full relative z-10 flex flex-col ${alignRight ? 'items-end text-right' : 'items-start text-left'}`}
      >
        <div className={`flex items-center gap-2 mb-2 ${alignRight ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
            {getIconForFeature(feature.id)}
          </div>
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{feature.name}</h4>
            <h3 className="text-sm font-black text-slate-800">{feature.label}</h3>
          </div>
        </div>
        <ul className={`space-y-1.5 mt-2 ${alignRight ? 'text-right' : 'text-left'}`}>
          {feature.points.map((pt, idx) => (
            <li key={idx} className={`text-xs text-slate-600 font-medium flex items-start gap-1.5 ${alignRight ? 'flex-row-reverse' : ''}`}>
              <div className={`w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5`}></div>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[90vh] bg-slate-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white shrink-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ScanFace className="text-pink-500 w-5 h-5" />
              Detailed Face Geometry Analysis
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">AI-powered deep facial feature structure analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto relative w-full h-full flex items-center justify-center p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-pink-100 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                 <ScanFace className="w-6 h-6 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-600 animate-pulse tracking-wide">ANALYZING FACIAL MAP...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100 max-w-md">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Analysis Failed</h3>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : (
            <div className="w-full h-full max-w-5xl mx-auto relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              
              {/* Left Column Data */}
              <div className="flex flex-col gap-6 w-full md:w-1/3 order-2 md:order-1 items-end relative z-10">
                {features.filter((f, i) => i % 2 === 0).map(f => (
                   <div key={f.id} className="relative w-full flex justify-end">
                      {renderFeatureCard(f, true)}
                      {/* Connection Line Desktop Only */}
                      <div className="hidden md:block absolute top-1/2 -right-16 w-16 h-[1px] bg-pink-500/30"></div>
                   </div>
                ))}
              </div>

              {/* Center Portrait & Symmetry */}
              <div className="flex flex-col items-center w-2/3 md:w-1/3 order-1 md:order-2 shrink-0 z-20 gap-4">
                <div className="relative aspect-[3/4] max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                  {imageSrc && (
                    <>
                      <img src={imageSrc} alt="Portrait" className="w-full h-full object-cover" />
                      
                      {/* Scanner Effect */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-full relative">
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,1)] animate-[scan_3s_ease-in-out_infinite]"></div>
                          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {symmetryScore !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl w-full p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center mt-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-400 to-rose-600 transition-all duration-1000" style={{ width: `${symmetryScore}%` }}></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1 mb-1">Symmetry Score</span>
                    <div className="flex items-end justify-center gap-1 mb-1">
                      <span className="text-3xl font-black text-slate-800 leading-none">{symmetryScore}</span>
                      <span className="text-sm font-bold text-slate-400 mb-1">/100</span>
                    </div>
                    {symmetryDescription && (
                      <p className="text-xs font-semibold text-slate-500 mt-1 pb-1">{symmetryDescription}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right Column Data */}
              <div className="flex flex-col gap-6 w-full md:w-1/3 order-3 md:order-3 items-start relative z-10">
                {features.filter((f, i) => i % 2 !== 0).map(f => (
                   <div key={f.id} className="relative w-full flex justify-start">
                      {/* Connection Line Desktop Only */}
                      <div className="hidden md:block absolute top-1/2 -left-16 w-16 h-[1px] bg-pink-500/30"></div>
                      {renderFeatureCard(f, false)}
                   </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
