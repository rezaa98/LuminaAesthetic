import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FloatingHelpButtonProps {
  onClick: () => void;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({ onClick }) => {
  const { language } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white text-slate-700 px-4 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
    >
      <HelpCircle size={20} className="text-pink-400 group-hover:text-pink-500 transition-colors" />
      <span className="text-xs font-bold uppercase tracking-wider">{language === 'id' ? 'Panduan' : 'Getting Started'}</span>
    </button>
  );
};
