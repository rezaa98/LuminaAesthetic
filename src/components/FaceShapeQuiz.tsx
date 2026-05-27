import React, { useState } from 'react';
import { HelpCircle, ChevronRight, RotateCcw, Glasses } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaceShapeQuizProps {
  language: 'id' | 'en';
}

type Question = {
  id: string;
  en: string;
  id_lang: string;
  options: {
    en: string;
    id_lang: string;
    scores: Record<string, number>;
  }[];
};

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'q1',
    en: 'What is the widest part of your face?',
    id_lang: 'Bagian manakah dari wajah Anda yang paling lebar?',
    options: [
      { en: 'Forehead', id_lang: 'Dahi', scores: { Heart: 2, Oval: 1 } },
      { en: 'Cheekbones', id_lang: 'Tulang Pipi', scores: { Diamond: 2, Round: 2, Oval: 1 } },
      { en: 'Jaw', id_lang: 'Tulang Rahang', scores: { Square: 2 } },
      { en: 'All roughly equal', id_lang: 'Ketiganya hampir sama lebar', scores: { Square: 1, Rectangle: 2 } },
    ]
  },
  {
    id: 'q2',
    en: 'What is the shape of your jawline?',
    id_lang: 'Seperti apa bentuk garis rahang Anda?',
    options: [
      { en: 'Pointy / V-shaped', id_lang: 'Runcing / Bentuk V', scores: { Heart: 2, Diamond: 2 } },
      { en: 'Soft and curved', id_lang: 'Melengkung lembut (bulat)', scores: { Round: 2, Oval: 1 } },
      { en: 'Sharp and angular', id_lang: 'Tajam dan bersudut (kotak)', scores: { Square: 2, Rectangle: 2 } },
    ]
  },
  {
    id: 'q3',
    en: 'How does the length of your face compare to its width?',
    id_lang: 'Bagaimana perbandingan panjang dan lebar wajah Anda?',
    options: [
      { en: 'Noticeably longer than it is wide', id_lang: 'Jelas lebih panjang daripada lebarnya', scores: { Oval: 2, Rectangle: 2 } },
      { en: 'Length and width are about equal', id_lang: 'Panjang dan lebarnya kurang lebih sama', scores: { Round: 2, Square: 2 } },
    ]
  },
  {
    id: 'q4',
    en: 'How would you describe your overall facial features?',
    id_lang: 'Secara umum, bagaimana struktur fitur wajah Anda?',
    options: [
      { en: 'Soft styling with rounder curves', id_lang: 'Fitur wajah lebih ke arah bulat/halus', scores: { Round: 1, Oval: 1 } },
      { en: 'Prominent, striking bone structure', id_lang: 'Tulang wajah menonjol tegas dan tajam', scores: { Square: 1, Diamond: 1, Rectangle: 1 } },
      { en: 'Broad upper, tapering down', id_lang: 'Lebar di dahi, makin mengecil ke dagu', scores: { Heart: 2 } },
    ]
  }
];

export const FaceShapeQuiz: React.FC<FaceShapeQuizProps> = ({ language }) => {
  const isEn = language === 'en';
  const [step, setStep] = useState<number>(0);
  const [scores, setScores] = useState<Record<string, number>>({
    Oval: 0, Round: 0, Square: 0, Heart: 0, Diamond: 0, Rectangle: 0
  });

  const handleStart = () => {
    setStep(1);
    setScores({ Oval: 0, Round: 0, Square: 0, Heart: 0, Diamond: 0, Rectangle: 0 });
  };

  const handleSelect = (optionScores: Record<string, number>) => {
    const newScores = { ...scores };
    Object.keys(optionScores).forEach((shape) => {
      if (newScores[shape] !== undefined) {
          newScores[shape] += optionScores[shape];
      }
    });
    setScores(newScores);
    setStep(s => s + 1);
  };

  const calculateResult = (): string => {
    let topShape = 'Oval';
    let max = -1;
    for (const shape in scores) {
      if (scores[shape] > max) {
        max = scores[shape];
        topShape = shape;
      }
    }
    return topShape;
  };

  if (step === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border text-center border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm"
      >
        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-sky-500" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">
          {isEn ? "Don't have a photo? Take the Quiz" : 'Tidak punya foto? Ikuti Kuis Wajah'}
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          {isEn ? 'Answer 4 simple questions comparing your facial proportions to identify your face shape manually.' 
                : 'Jawab 4 pertanyaan sederhana terkait proporsi Anda untuk mengetahui bentuk wajah Anda secara cepat.'}
        </p>
        <button 
          onClick={handleStart}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
        >
          {isEn ? 'Start Quick Quiz' : 'Mulai Kuis Cepat'}
        </button>
      </motion.div>
    );
  }

  if (step > QUIZ_QUESTIONS.length) {
    const result = calculateResult();
    let idResult = result;
    if (result === 'Round') idResult = 'Bulat';
    if (result === 'Square') idResult = 'Kotak';
    if (result === 'Diamond') idResult = 'Berlian';
    if (result === 'Rectangle') idResult = 'Persegi Panjang';
    if (result === 'Heart') idResult = 'Hati';

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border text-center border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm"
      >
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          {isEn ? 'Your Calculated Shape' : 'Hasil Perhitungan Bentuk'}
        </h4>
        <h3 className="text-3xl font-black text-sky-600 mb-6 font-serif tracking-tight">
          {isEn ? result : idResult}
        </h3>
        <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 mb-6 flex flex-col items-center">
            <Glasses className="w-6 h-6 text-sky-500 mb-3" />
            <p className="text-[11px] sm:text-xs text-sky-800 font-semibold max-w-xs leading-relaxed">
              {isEn ? `Based on your structural dimensions, an ${result.toLowerCase()} silhouette was detected. Knowing your face shape helps guide you toward the most flattering eyewear styles and grooming aesthetics.` 
                    : `Berdasarkan dimensi struktural Anda, terdeteksi tipe siluet ${idResult.toLowerCase()}. Mengetahui bentuk wajah membantu Anda menemukan gaya kacamata dan potongan rambut yang paling proporsional.`}
            </p>
        </div>
        <button 
          onClick={handleStart}
          className="flex items-center gap-2 mx-auto text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isEn ? 'Retake Quiz' : 'Ulangi Kuis'}
        </button>
      </motion.div>
    );
  }

  const q = QUIZ_QUESTIONS[step - 1];

  return (
    <motion.div 
      key={`step-${step}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm text-left"
    >
      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">
        {isEn ? `STEP ${step} OF 4` : `LANGKAH ${step} DARI 4`}
      </p>
      <h3 className="text-lg font-bold text-slate-800 mb-6">
        {isEn ? q.en : q.id_lang}
      </h3>
      <div className="space-y-3">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt.scores)}
            className="w-full text-left px-5 py-4 border border-slate-200 rounded-2xl hover:border-sky-500 hover:bg-sky-50 transition-all flex justify-between items-center group"
          >
            <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-900">
              {isEn ? opt.en : opt.id_lang}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};
