import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';

interface GlassesDetectedModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
}

export const GlassesDetectedModal = ({ isOpen, onClose, language }: GlassesDetectedModalProps) => {
  const isEn = language === 'en';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-rose-500" />
              </div>
              
              <h2 className="text-lg font-black text-slate-800 tracking-tight mb-2">
                {isEn ? 'Glasses Detected' : 'Terdeteksi Kacamata'}
              </h2>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {isEn 
                  ? 'Please remove your glasses, spectacles, eyewear, or sunglasses for accurate skin and facial analysis.' 
                  : 'Mohon lepas kacamata Anda untuk hasil analisis wajah dan kulit yang lebih presisi.'}
              </p>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
              >
                {isEn ? 'Understood' : 'Mengerti'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
