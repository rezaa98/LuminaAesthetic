import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Palette, Check, CircleAlert, Sparkles, Shirt, User, Camera, Sliders, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalysisResult } from '../types';
import { RecoloredImage } from './RecoloredImage';

interface ColorAnalysisModalProps {
  data: AnalysisResult;
  imageSrc: string | null;
  onClose: () => void;
}

type OutfitStyle = 'hijab' | 'blazer' | 'tshirt' | 'shirt';
type SimulatorMode = 'photo' | 'avatar';

export const ColorAnalysisModal = ({ data, imageSrc, onClose }: ColorAnalysisModalProps) => {
  const { language } = useLanguage();
  const [activeOutfit, setActiveOutfit] = useState<OutfitStyle>('hijab');
  const [simulatorMode, setSimulatorMode] = useState<SimulatorMode>('photo');
  
  // Try-on calibration states
  const [shirtColor, setShirtColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>({ x: 50, y: 72 });
  const [tolerance, setTolerance] = useState<number>(45);
  const originalImageRef = useRef<HTMLImageElement>(null);

  if (!data?.colorAnalysis) return null;

  // Determine season based on AI comments or color profile
  const determineSeason = (data: AnalysisResult) => {
    const summary = (data.colorAnalysis?.summary || "").toLowerCase();
    if (summary.includes("cool") || summary.includes("dingin") || summary.includes("summer") || summary.includes("winter")) {
      if (summary.includes("soft") || summary.includes("muted")) return "Soft Summer";
      return "Cool Winter";
    }
    if (summary.includes("warm") || summary.includes("hangat") || summary.includes("autumn") || summary.includes("spring")) {
      if (summary.includes("deep") || summary.includes("muted") || summary.includes("autumn") || summary.includes("gugur")) return "Soft Autumn";
      return "Warm Spring";
    }
    return "Soft Summer"; // default
  };

  const season = determineSeason(data);

  // Auto sample shirt on mount
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0);

      // Best estimate location for clothing: center-bottom (72% down, 50% across)
      const sampleX = Math.round(canvas.width * 0.5);
      const sampleY = Math.round(canvas.height * 0.72);

      try {
        const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
        // Verify we didn't sample pure transparent/black/white
        if (pixel[3] > 10) {
          setShirtColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
          setClickCoords({ x: 50, y: 72 });
        } else {
          // fallback to vibrant royal blue
          setShirtColor({ r: 63, g: 81, b: 181 });
          setClickCoords({ x: 50, y: 72 });
        }
      } catch (err) {
        console.error("Auto sampling on mount failed, using fallback:", err);
        setShirtColor({ r: 63, g: 81, b: 181 }); // royal blue default
        setClickCoords({ x: 50, y: 72 });
      }
    };
  }, [imageSrc]);

  // Click to calibrate the exact shirt color from the original photo
  const handleOriginalImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const xRatio = canvas.width / rect.width;
    const yRatio = canvas.height / rect.height;

    const clickX = Math.round((e.clientX - rect.left) * xRatio);
    const clickY = Math.round((e.clientY - rect.top) * yRatio);

    try {
      const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
      setShirtColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      setClickCoords({
        x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
        y: Math.round(((e.clientY - rect.top) / rect.height) * 100)
      });
    } catch (err) {
      console.error("Failed to sample color from clicked point:", err);
    }
  };

  // Seasonal Metadata exactly as the professional chart layout
  const getSeasonDetails = (seasonName: string) => {
    switch (seasonName) {
      case 'Soft Summer':
        return {
          title: 'SOFT SUMMER',
          hueLabel: 'COOL',
          valueLabel: 'LIGHT-MEDIUM',
          chromaLabel: 'SOFT / MUTED',
          hueVal: 80, 
          valueVal: 45, 
          chromaVal: 20, 
          neutrals: [
            { name: language === 'id' ? 'Biru Dongker' : 'Soft Navy', hex: '#2F3C54' },
            { name: language === 'id' ? 'Abu Slate' : 'Slate Gray', hex: '#707C94' },
            { name: language === 'id' ? 'Taupe Dingin' : 'Cool Taupe', hex: '#A89F91' },
            { name: language === 'id' ? 'Kelabu Perak' : 'Silver Gray', hex: '#C2C5CC' }
          ],
          accessories: [
            { name: language === 'id' ? 'Perhiasan Perak' : 'Silver Jewelry', desc: 'Silver, Platinum, White Gold' },
            { name: language === 'id' ? 'Tas Slate / Pastel' : 'Muted Bag', desc: 'Soft Mauve, Slate Blue' },
            { name: language === 'id' ? 'Syal Muted' : 'Cool Scarf', desc: 'Soft Lavender, Sage' },
            { name: language === 'id' ? 'Kacamata Abu' : 'Gray/Taupe Frames', desc: 'Muted grey frames match' }
          ],
          tips: language === 'id' ? [
            'Gunakan warna kalem, dingin, dan muted',
            'Tampilan kontras rendah sangat cocok',
            'Hindari warna hangat, terang, dan kontras tinggi'
          ] : [
            'Use cool, soft, and muted colors',
            'Low contrast styling fits you best',
            'Avoid overly warm, bright, or high contrast shades'
          ],
          colorDots: ['#9EA1C4', '#667C9D', '#7E9C96', '#9C8592', '#C4A9B1', '#E5D1D0', '#DCE0DC']
        };
      case 'Cool Winter':
        return {
          title: 'COOL WINTER',
          hueLabel: 'ICE COOL',
          valueLabel: 'MEDIUM-DARK CONTRAST',
          chromaLabel: 'CLEAR & BRIGHT',
          hueVal: 95, 
          valueVal: 75, 
          chromaVal: 85,
          neutrals: [
            { name: 'Pure Black', hex: '#111111' },
            { name: 'Crisp White', hex: '#FFFFFF' },
            { name: 'Charcoal Gray', hex: '#374151' },
            { name: 'True Navy', hex: '#1E3A8A' }
          ],
          accessories: [
            { name: 'White Gold / Gem', desc: 'Diamante, Platinum, White Gold' },
            { name: 'Bold Onyx Bag', desc: 'Shiny black or intense cobalt' },
            { name: 'Royal Scarf', desc: 'Emerald, Sapphire shades' },
            { name: 'Sharp Black Frames', desc: 'High-contrast definition' }
          ],
          tips: language === 'id' ? [
            'Pilihlah warna dingin baur dan kontras tajam',
            'Gunakan kontras hitam-putih murni',
            'Hindari warna hangat pudar dan kuning kusam'
          ] : [
            'Wear intense, cool and sharp colors',
            'Pure black and white blends are fabulous',
            'Avoid warm earthy/faded pastel tones'
          ],
          colorDots: ['#1E3A8A', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F43F5E', '#111827']
        };
      case 'Soft Autumn':
        return {
          title: 'SOFT AUTUMN',
          hueLabel: 'WARM / EARTHY',
          valueLabel: 'MEDIUM-DARK',
          chromaLabel: 'MUTED & RICH',
          hueVal: 25, 
          valueVal: 65, 
          chromaVal: 35,
          neutrals: [
            { name: 'Olive Drab', hex: '#4B5320' },
            { name: 'Espresso brown', hex: '#3E2723' },
            { name: 'Rich Ivory', hex: '#FFFDD0' },
            { name: 'Warm Taupe', hex: '#B38B6D' }
          ],
          accessories: [
            { name: 'Warm Gold / Bronze', desc: 'Bright yellow or brushed gold' },
            { name: 'Terracotta Bag', desc: 'Rich brown or earth clay red' },
            { name: 'Mustard Scarf', desc: 'Ochre, Sage or Camel shades' },
            { name: 'Tortoiseshell Frames', desc: 'Warm mottled amber frames' }
          ],
          tips: language === 'id' ? [
            'Gunakan nada warna hangat dan bersahaja',
            'Warna dengan tone emas/olive',
            'Hindari warna neon cerah & super dingin'
          ] : [
            'Favor warm, rich, and earthy tones',
            'Gold and olive accents work wonders',
            'Avoid ice-cold and flashy neon shades'
          ],
          colorDots: ['#8A7968', '#9B8E7A', '#6B7A65', '#8C6C58', '#AB7A5E', '#D9A05B', '#E6C594']
        };
      case 'Warm Spring':
      default:
        return {
          title: 'WARM SPRING',
          hueLabel: 'WARM & SHINY',
          valueLabel: 'MEDIUM-LIGHT',
          chromaLabel: 'VIBRANT / BRIGHT',
          hueVal: 35, 
          valueVal: 30, 
          chromaVal: 80,
          neutrals: [
            { name: 'Camel Tan', hex: '#C19A6B' },
            { name: 'Warm Honey', hex: '#D4AF37' },
            { name: 'Ivory Cream', hex: '#FFFFF0' },
            { name: 'Golden Khaki', hex: '#F0E68C' }
          ],
          accessories: [
            { name: 'Bright Yellow Gold', desc: 'Highly polished radiant gold' },
            { name: 'Coral Pink Bag', desc: 'Vibrant Peach or sunny nectar' },
            { name: 'Golden Scarf', desc: 'Clear turquoise or soft apricot' },
            { name: 'Clear/Gold Frames', desc: 'Translucent amber/champagne' }
          ],
          tips: language === 'id' ? [
            'Gunakan warna cerah, hangat, dan bersinar',
            'Model segar peach atau coral sanggup memukau',
            'Hindari warna kusam, gelap mati, abu-abu dingin'
          ] : [
            'Wear bright, warm and sunny colors',
            'Fresh peach, turquoise or coral are superb',
            'Avoid dark muted tones and cold grays'
          ],
          colorDots: ['#F59E0B', '#10B981', '#F472B6', '#EF4444', '#14B8A6', '#FBBF24', '#FFFF00']
        };
    }
  };

  const details = getSeasonDetails(season);
  const bestColors = data.colorAnalysis.detailedAnalysis;

  const getNotIdealColors = (seasonName: string) => {
    switch (seasonName) {
      case 'Soft Summer':
        return [
          { colorName: 'MUSTARD', colorHex: '#D4A373', compatibility: language === 'id' ? 'Rendah' : 'Low', score: 32, note: language === 'id' ? 'Meredupkan aura wajah' : 'Dulls down facial aura' },
          { colorName: 'BRIGHT ORANGE', colorHex: '#F65A2A', compatibility: language === 'id' ? 'Rendah' : 'Low', score: 28, note: language === 'id' ? 'Terlalu menusuk mata' : 'Overwhelms the sight' },
          { colorName: 'JET BLACK', colorHex: '#121212', compatibility: language === 'id' ? 'Cukup' : 'Medium', score: 45, note: language === 'id' ? 'Tampak terlalu keras' : 'Looks a bit too harsh' },
          { colorName: 'WARM BEIGE', colorHex: '#EAE1CE', compatibility: language === 'id' ? 'Rendah' : 'Low', score: 38, note: language === 'id' ? 'Membuat wajah kusam' : 'Makes skin look washed' }
        ];
      case 'Cool Winter':
        return [
          { colorName: 'BRIGHT ORANGE', colorHex: '#E65C00', compatibility: 'Rendah', score: 22, note: language === 'id' ? 'Kontras tidak alami' : 'Unnatural warm contrast' },
          { colorName: 'MUSTARD', colorHex: '#CA9510', compatibility: 'Rendah', score: 25, note: language === 'id' ? 'Membuat kulit pucat' : 'Makes skin look pale' },
          { colorName: 'SOFT BEIGE', colorHex: '#DFD3C3', compatibility: 'Rendah', score: 30, note: language === 'id' ? 'Menghilangkan dimensi' : 'Flattens face definition' },
          { colorName: 'GOLDEN BROWN', colorHex: '#8D5B4C', compatibility: 'Rendah', score: 35, note: language === 'id' ? 'Suhu warna bentrok' : 'Clashing color temperature' }
        ];
      case 'Soft Autumn':
        return [
          { colorName: 'BRIGHT FUCHSIA', colorHex: '#D21F6D', compatibility: 'Rendah', score: 18, note: language === 'id' ? 'Sangat tabrakan' : 'Crashes aggressively' },
          { colorName: 'ICY BLUE', colorHex: '#D4F0FC', compatibility: 'Rendah', score: 24, note: language === 'id' ? 'Wajah nampak pucat' : 'Makes face pale' },
          { colorName: 'JET BLACK', colorHex: '#080808', compatibility: 'Cukup', score: 40, note: language === 'id' ? 'Terlalu kaku & berat' : 'Too flat and heavy' },
          { colorName: 'NEON GREEN', colorHex: '#39FF14', compatibility: 'Rendah', score: 15, note: language === 'id' ? 'Membasuh warna kulit' : 'Washes out gold undertones' }
        ];
      case 'Warm Spring':
      default:
        return [
          { colorName: 'COOL GREY', colorHex: '#8C92AC', compatibility: 'Rendah', score: 20, note: language === 'id' ? 'Nampak murung' : 'Appears gloomy' },
          { colorName: 'ROYAL BLUE', colorHex: '#0020C2', compatibility: 'Cukup', score: 42, note: language === 'id' ? 'Kontras terlalu dingin' : 'Too cold contrast' },
          { colorName: 'JET BLACK', colorHex: '#0F0F0F', compatibility: 'Rendah', score: 35, note: language === 'id' ? 'Menumpas kesegaran' : 'Overwhelms natural brightness' },
          { colorName: 'DEEP MAGENTA', colorHex: '#800080', compatibility: 'Rendah', score: 28, note: language === 'id' ? 'Terlalu ekstrem' : 'Extremely heavy contrast' }
        ];
    }
  };

  const notIdealColors = getNotIdealColors(season);

  // SVG Outfits drawing for classical avatar backup mode
  const renderOutfitShape = (style: OutfitStyle, colorHex: string) => {
    switch (style) {
      case 'hijab':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
            <path d="M15,100 C15,75 25,56 50,56 C75,56 85,75 85,100 Z" fill={colorHex} />
            <path d="M38,56 C42,75 50,88 50,88 C50,88 58,75 62,56" fill={colorHex} stroke="#ffffff35" strokeWidth="2" />
            <path d="M48,56 C49,70 51,70 52,56" fill="none" stroke="#ffffff25" strokeWidth="1" />
            <line x1="50" y1="88" x2="50" y2="100" stroke="#00000018" strokeWidth="2" />
          </svg>
        );
      case 'blazer':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
            <path d="M40,50 L50,68 L60,50 Z" fill="#ffffff" />
            <line x1="50" y1="58" x2="50" y2="68" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M15,100 C15,70 24,52 50,52 C76,52 85,70 85,100 Z" fill={colorHex} />
            <path d="M41,52 L50,72 L59,52" fill="none" stroke="#00000025" strokeWidth="2.5" />
          </svg>
        );
      case 'shirt':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
            <path d="M15,100 C15,70 25,55 50,55 C75,55 85,70 85,100 Z" fill={colorHex} />
            <line x1="50" y1="62" x2="50" y2="100" stroke="#00000015" strokeWidth="1.5" />
            <circle cx="50" cy="70" r="1.5" fill="#ffffff70" />
            <circle cx="50" cy="78" r="1.5" fill="#ffffff70" />
            <circle cx="50" cy="86" r="1.5" fill="#ffffff70" />
            <path d="M35,55 L50,63 L65,55 L58,52 L42,52 Z" fill={colorHex} filter="brightness(0.92)" stroke="#ffffff20" strokeWidth="1" />
          </svg>
        );
      case 'tshirt':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
            <path d="M15,100 C15,68 25,53 50,53 C75,53 85,68 85,100 Z" fill={colorHex} />
            <path d="M38,53 C42,61 58,61 62,53" fill="none" stroke="#00000015" strokeWidth="2.5" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-7xl bg-[#F6F5F2] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh]"
      >
        {/* Top Header Panel */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 rounded-2xl text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black font-sans text-stone-800 tracking-tight flex items-center gap-2">
                PERSONALIZED COLOR REPORT & TRY-ON
              </h1>
              <p className="text-stone-400 text-xs font-mono font-bold tracking-widest uppercase">
                {language === 'id' ? `Season Profile: ${details.title}` : `Season Profile: ${details.title}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setSimulatorMode('photo')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${simulatorMode === 'photo' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <Camera className="w-3.5 h-3.5 text-indigo-500" /> {language === 'id' ? 'Foto Asli' : 'Virtual Try-On'}
              </button>
              <button
                onClick={() => setSimulatorMode('avatar')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${simulatorMode === 'avatar' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> {language === 'id' ? 'Siluet Avatar' : 'Silhouette Outfits'}
              </button>
            </div>

            {/* Avatar Outfit style toggle only shows under Avatar simulatorMode */}
            {simulatorMode === 'avatar' && (
              <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button 
                  onClick={() => setActiveOutfit('hijab')}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeOutfit === 'hijab' ? 'bg-[#ECE9E4] text-stone-800' : 'text-stone-500'}`}
                >
                  Hijab
                </button>
                <button 
                  onClick={() => setActiveOutfit('blazer')}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeOutfit === 'blazer' ? 'bg-[#ECE9E4] text-stone-800' : 'text-stone-500'}`}
                >
                  Blazer
                </button>
                <button 
                  onClick={() => setActiveOutfit('shirt')}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeOutfit === 'shirt' ? 'bg-[#ECE9E4] text-stone-800' : 'text-stone-500'}`}
                >
                  Shirt
                </button>
                <button 
                  onClick={() => setActiveOutfit('tshirt')}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeOutfit === 'tshirt' ? 'bg-[#ECE9E4] text-stone-800' : 'text-stone-500'}`}
                >
                  T-Shirt
                </button>
              </div>
            )}

            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors border border-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrolling Canvas */}
        <div className="p-4 md:p-8 overflow-y-auto flex-1 stone-scroll">
          
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            
            {/* Left Column: Calibration Card or Original Photo */}
            <div className="w-full lg:w-[35%] bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-col shrink-0">
              <span className="text-stone-400 text-xs font-black tracking-widest font-mono uppercase mb-3 block">
                {language === 'id' ? 'FOTO SEBELUM PERUBAHAN (ORIGINAL)' : 'ORIGINAL BASE IMAGE'}
              </span>

              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-inner border border-stone-100 bg-stone-100 flex items-center justify-center">
                {imageSrc ? (
                  <div className="relative w-full h-full group">
                    <img 
                      ref={originalImageRef}
                      src={imageSrc} 
                      alt="Original calibration target" 
                      referrerPolicy="no-referrer"
                      onClick={handleOriginalImageClick}
                      className="w-full h-full object-cover cursor-crosshair hover:brightness-[0.97] transition-all"
                    />

                    {/* Circular visual pin marker showing where the color is sampled */}
                    {clickCoords && (
                      <div 
                        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-full bg-indigo-500 shadow-xl flex items-center justify-center pointer-events-none transition-all duration-300"
                        style={{ left: `${clickCoords.x}%`, top: `${clickCoords.y}%` }}
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                      </div>
                    )}
                    
                    {/* Floating Season Metadata badge */}
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-100 shadow-md text-center pointer-events-none">
                      <span className="text-[9px] font-black tracking-widest text-indigo-500 block">
                        DETECTED SPECTRUM Profile
                      </span>
                      <span className="text-sm font-black text-stone-800">
                        {details.title}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 font-mono text-xs gap-3">
                    <Camera className="w-8 h-8 text-stone-300" />
                    NO VISUAL ATTACHMENT
                  </div>
                )}
              </div>

              {/* Advanced Clothing Calibration controls (Extremely useful for different fabrics) */}
              {imageSrc && (
                <div className="mt-4 p-4 bg-stone-50 border border-stone-200/60 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                      {language === 'id' ? 'Sampel Kain Baju:' : 'Calibrated Fabric:'}
                    </span>
                    {shirtColor && (
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                        <div 
                          className="w-4.5 h-4.5 rounded-full border border-stone-300 shadow-sm" 
                          style={{ backgroundColor: `rgb(${shirtColor.r}, ${shirtColor.g}, ${shirtColor.b})` }}
                        />
                        <span className="text-[10px] font-mono text-stone-600 font-bold">
                          RGB({shirtColor.r},{shirtColor.g},{shirtColor.b})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Informative calibration message */}
                  <p className="text-[10px] text-stone-400 font-semibold mb-3 leading-snug">
                    {language === 'id' ? '💡 Tips: Klik pada warna baju asli Anda di foto atas untuk menyelaraskan filter warna jika kurang presisi.' : '💡 Tip: Directly click your clothing inside the photo above to center and recalibrate the dynamic tint overlay.'}
                  </p>

                  {/* Tolerance tuning slider */}
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-[11px] font-black tracking-wide text-stone-500 font-mono">
                      <span>{language === 'id' ? 'SENSITIVITAS DETEKSI' : 'TINT DETECTION AREA'}</span>
                      <span className="text-indigo-600 font-mono">{tolerance}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="75" 
                      value={tolerance} 
                      onChange={(e) => setTolerance(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Comparative Grid Panels */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Palette Chips Header Container */}
              <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
                <span className="text-stone-400 text-xs font-black tracking-widest font-mono">SEASON SEASONAL PALETTE:</span>
                <div className="flex gap-2.5">
                  {details.colorDots.map((c, i) => (
                    <div 
                      key={i} 
                      className="w-6 h-6 rounded-full border border-stone-300 shadow bg-cover hover:scale-110 transition-transform cursor-pointer" 
                      style={{ backgroundColor: c }}
                      title={`Season color: ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* GRID: BEST COLORS RECOMENDED */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <h3 className="text-xs font-black tracking-widest font-mono text-stone-400 uppercase mb-4 flex items-center gap-2">
                  <span className="p-1 rounded bg-[#EBF7EE] text-emerald-600"><Check className="w-4 h-4" strokeWidth={3} /></span>
                  {language === 'id' ? 'REKOMENDASI WARNA TERBAIK (BEST CLOTHING)' : 'SUITABLE CLOTHING SIMULATOR'}
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {bestColors.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="bg-[#F8F7F4] rounded-2xl border border-stone-200 overflow-hidden flex flex-col relative group">
                      
                      {/* Interactive Visual Area */}
                      <div className="h-60 bg-[#ECE9E4]/40 flex items-center justify-center relative overflow-hidden transition-all duration-300">
                        {simulatorMode === 'photo' && imageSrc ? (
                          <RecoloredImage 
                            imageSrc={imageSrc} 
                            targetColorHex={item.colorHex} 
                            shirtColor={shirtColor}
                            tolerance={tolerance}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                            {/* SVG TryOn Backup */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: item.colorHex }} />
                            
                            {/* Torso Area */}
                            <div className="w-[120px] h-[120px] absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-10">
                              {renderOutfitShape(activeOutfit, item.colorHex)}
                            </div>

                            {/* Head Area */}
                            <div className="w-14 h-14 rounded-full absolute bottom-[46px] left-1/2 -translate-x-1/2 z-20 overflow-hidden border-2 border-white shadow-xl bg-white flex items-center justify-center">
                              {imageSrc ? (
                                <img src={imageSrc} alt="face reference" className="w-full h-full object-cover scale-[1.3] translate-y-[-1px]" />
                              ) : (
                                <User className="w-7 h-7 text-stone-400" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Similarity Float badge */}
                        <div className="absolute top-2.5 right-2.5 bg-white/95 px-2 py-0.5 rounded-md border border-stone-200 shadow-sm text-[10px] font-black text-stone-700">
                          {item.score}% Match
                        </div>
                      </div>

                      {/* Card labels */}
                      <div className="p-3.5 border-t border-stone-200 bg-white flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex }}></div>
                          <span className="text-xs font-black text-stone-800 truncate tracking-tight">{item.colorName.toUpperCase()}</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-stone-400 tracking-wider text-center uppercase mb-1.5">
                          {item.compatibility.toUpperCase()}
                        </span>
                        
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 text-center rounded py-0.5 border border-emerald-100/30">
                          ★ Glow Accent
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* GRID: NOT IDEAL COLORS WARNING */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <h3 className="text-xs font-black tracking-widest font-mono text-stone-400 uppercase mb-4 flex items-center gap-2">
                  <span className="p-1 rounded bg-rose-50 text-rose-500"><CircleAlert className="w-3.5 h-3.5" /></span>
                  {language === 'id' ? 'WARNA DINYATAKAN KURANG COCOK (NOT IDEAL COLORS)' : 'NOT IDEAL CLOTHING COLORS'}
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {notIdealColors.map((item, idx) => (
                    <div key={idx} className="bg-[#F8F7F4] rounded-2xl border border-stone-200 overflow-hidden flex flex-col relative group">
                      
                      {/* Interactive Visual Area */}
                      <div className="h-60 bg-[#ECE9E4]/40 flex items-center justify-center relative overflow-hidden transition-all duration-300">
                        {simulatorMode === 'photo' && imageSrc ? (
                          <RecoloredImage 
                            imageSrc={imageSrc} 
                            targetColorHex={item.colorHex} 
                            shirtColor={shirtColor}
                            tolerance={tolerance}
                            className="w-full h-full object-cover filter brightness-[0.93] group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: item.colorHex }} />
                            
                            <div className="w-[120px] h-[120px] absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-10">
                              {renderOutfitShape(activeOutfit, item.colorHex)}
                            </div>

                            <div className="w-14 h-14 rounded-full absolute bottom-[46px] left-1/2 -translate-x-1/2 z-20 overflow-hidden border-2 border-rose-300 shadow-xl bg-white flex items-center justify-center grayscale">
                              {imageSrc ? (
                                <img src={imageSrc} alt="face reference" className="w-full h-full object-cover scale-[1.3] translate-y-[-1px] opacity-90 grayscale" />
                              ) : (
                                <User className="w-7 h-7 text-stone-400" />
                              )}
                            </div>
                          </div>
                        )}

                        <div className="absolute top-2.5 right-2.5 bg-white/95 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100 shadow-sm text-[10px] font-black">
                          {item.score}% Match
                        </div>
                      </div>

                      {/* Card labels */}
                      <div className="p-3.5 border-t border-stone-200 bg-white flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex }}></div>
                          <span className="text-xs font-black text-stone-600 truncate">{item.colorName.toUpperCase()}</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-rose-500 tracking-wider text-center uppercase mb-1.5">
                          {item.compatibility.toUpperCase()}
                        </span>

                        <span className="text-[9px] text-stone-400 font-bold bg-stone-100 text-center rounded py-0.5 border border-stone-200 truncate">
                          {item.note}
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Neutrals Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col">
              <h3 className="text-stone-400 text-xs font-black tracking-widest font-mono uppercase mb-4">
                BEST NEUTRALS (WARNA DASAR TERBAIK)
              </h3>
              <div className="grid grid-cols-4 gap-3 flex-1 items-center">
                {details.neutrals.map((neu, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border border-stone-200 shadow-sm transition-transform hover:scale-110 mb-2" style={{ backgroundColor: neu.hex }} />
                    <span className="text-[10px] font-bold text-stone-800 text-center uppercase leading-tight tracking-tight min-h-[24px] overflow-hidden">{neu.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm md:col-span-2">
              <h3 className="text-stone-400 text-xs font-black tracking-widest font-mono uppercase mb-4">
                {language === 'id' ? 'REKOMENDASI AKSESORIS KULIT' : 'BEST ACCESSORIES RECOMMENDATIONS'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(data.colorAnalysis.accessories || details.accessories).map((acc, idx) => {
                  const renderAccIcon = () => {
                    if ('emoji' in acc && acc.emoji) {
                      return <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-lg">{acc.emoji}</div>;
                    }
                    switch(idx) {
                      case 0:
                        return <div className="w-8 h-8 rounded-full border-2 border-[#DCE0DC] bg-[#fdfdfd] flex items-center justify-center font-bold text-[#707C94] text-xs">Ag</div>;
                      case 1:
                        return <div className="w-8 h-8 rounded bg-[#B3A9B4] flex items-center justify-center text-white text-base">👜</div>;
                      case 2:
                        return <div className="w-8 h-8 rounded bg-[#9E90A2] flex items-center justify-center text-white text-base">🧣</div>;
                      case 3:
                      default:
                        return <div className="w-8 h-8 rounded border-2 border-stone-700 bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-xs">👓</div>;
                    }
                  };

                  const descText = 'desc' in acc ? (acc as { desc: string }).desc : 'description' in acc ? (acc as { description: string }).description : '';

                  return (
                    <div key={idx} className="bg-[#F8F7F4] rounded-xl p-3 border border-stone-200/50 flex flex-col items-center text-center transition-transform hover:scale-105 select-none duration-200">
                      <div className="mb-2">
                        {renderAccIcon()}
                      </div>
                      <span className="text-xs font-extrabold text-stone-800 tracking-tight block mb-0.5">{acc.name}</span>
                      <span className="text-[9.5px] font-semibold text-stone-400 leading-tight uppercase tracking-wider">{descText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Seasonal Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h3 className="text-stone-400 text-xs font-black tracking-widest font-mono uppercase mb-4">
                SEASON SPECTRUM SLIDERS (KARAKTERISTIK WARNA)
              </h3>
              
              <div className="space-y-4 font-mono font-black text-stone-500">
                <div>
                  <div className="flex justify-between text-[10px] uppercase mb-1">
                    <span>WARM</span>
                    <span className="text-indigo-600">COOL</span>
                  </div>
                  <div className="w-full h-2 bg-gradient-to-r from-amber-400 via-stone-200 to-indigo-400 rounded-full relative">
                    <div className="w-4 h-4 rounded-full border border-stone-400 bg-white shadow absolute -top-1 -translate-x-1/2 transition-all duration-75" style={{ left: `${details.hueVal}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase mb-1">
                    <span>LIGHT</span>
                    <span>DARK</span>
                  </div>
                  <div className="w-full h-2 bg-gradient-to-r from-stone-50 via-stone-300 to-stone-900 rounded-full relative">
                    <div className="w-4 h-4 rounded-full border border-stone-400 bg-white shadow absolute -top-1 -translate-x-1/2 transition-all duration-75" style={{ left: `${details.valueVal}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase mb-1">
                    <span>SOFT (MUTED)</span>
                    <span>BRIGHT (CLEAR)</span>
                  </div>
                  <div className="w-full h-2 bg-gradient-to-r from-stone-300 via-stone-400 to-rose-500 rounded-full relative">
                    <div className="w-4 h-4 rounded-full border border-stone-400 bg-white shadow absolute -top-1 -translate-x-1/2 transition-all duration-75" style={{ left: `${details.chromaVal}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-stone-400 text-xs font-black tracking-widest font-mono uppercase mb-4 flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-4 h-4 text-[#B2A496]" />
                  QUICK MODE GUIDE (PANDUAN RINGKAS)
                </h3>
                <div className="space-y-3">
                  {details.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="p-0.5 rounded-full bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-xs font-bold text-stone-700 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-semibold text-stone-400 border-t border-stone-100 pt-3 mt-4 text-center">
                📊 PERSAL COLOR GRID REPORT • PRIVACY GUARANTEED MEDICAL GRADE CERTIFICATE
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};
