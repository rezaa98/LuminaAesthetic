import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Joyride, Step, STATUS, TooltipRenderProps, EVENTS } from 'react-joyride';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { ChevronRight, X, Sparkles } from 'lucide-react';

interface TutorialTourProps {
  steps: Step[];
  tutorialKey: string;
  forceRun?: boolean;
  onTourClose?: () => void;
}

const AestheticTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  size
}) => {
  const { language } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white rounded-[24px] p-1 w-full max-w-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100"
      {...tooltipProps}
    >
      <div className="bg-slate-50/50 rounded-[20px] p-5 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>

        <button
          {...closeProps}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Sparkles size={14} className="text-pink-300" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {language === 'id' ? 'Langkah' : 'Step'} {index + 1} / {size}
            </span>
          </div>

          {step.title && (
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-2">
              {step.title}
            </h3>
          )}
          <div className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
            {step.content}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {index > 0 && (
                <button
                  {...backProps}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  {language === 'id' ? 'Kembali' : 'Back'}
                </button>
              )}
            </div>
            <button
              {...primaryProps}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {continuous && index < size - 1 ? (
                <>
                  {language === 'id' ? 'Selanjutnya' : 'Next'} <ChevronRight size={16} />
                </>
              ) : (
                language === 'id' ? 'Selesai' : 'Finish'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TutorialTour: React.FC<TutorialTourProps> = ({ steps, tutorialKey, forceRun, onTourClose }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const handleForceStart = () => {
      setRun(true);
    };
    window.addEventListener(`START_TUTORIAL_${tutorialKey}`, handleForceStart);

    if (forceRun) {
      setRun(true);
    } else {
      // We add a slight delay to ensure DOM is fully painted
      const isDone = localStorage.getItem(tutorialKey);
      if (!isDone) {
        const timer = setTimeout(() => setRun(true), 1500);
        return () => {
          clearTimeout(timer);
          window.removeEventListener(`START_TUTORIAL_${tutorialKey}`, handleForceStart);
        };
      }
    }
    
    return () => window.removeEventListener(`START_TUTORIAL_${tutorialKey}`, handleForceStart);
  }, [tutorialKey, forceRun]);

  const handleJoyrideCallback = (data: any) => {
    const { status, type, step } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (type === EVENTS.TOOLTIP || type === EVENTS.STEP_BEFORE) {
      if (step && step.target) {
        // Find element and scroll into view smoothly
        const element = document.querySelector(step.target);
        if (element) {
          // Hanya scroll untuk 'face geometry' dan 'visual analysis' seperti diminta
          const shouldScroll = step.target === '[data-testid="card-face-feature"]' || 
                               step.target === '[data-testid="card-spectacles"]' ||
                               step.target === '[data-testid="card-skin-analysis"]';

          if (shouldScroll) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Dispatch a scroll event to trigger tooltip repositioning during smooth scroll
            const scrollContainer = document.getElementById('dashboard-report-content');
            if (scrollContainer) {
              // Simulate scroll events while the smooth scroll is animating to force react-joyride to update tooltip placement
              let frameId: number;
              let startTime = Date.now();
              const triggerScroll = () => {
                window.dispatchEvent(new Event('scroll'));
                if (Date.now() - startTime < 800) {
                  frameId = requestAnimationFrame(triggerScroll);
                }
              };
              frameId = requestAnimationFrame(triggerScroll);
            }
          }
        }
      }
    }

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(tutorialKey, 'true');
      if (onTourClose) onTourClose();
    }
  };

  const stepsWithConfig = steps.map(step => ({
    ...step,
    skipBeacon: true,
    skipScroll: true,
  }));

  return (
    <Joyride
      steps={stepsWithConfig}
      run={run}
      continuous={true}
      scrollToFirstStep={false}
      onEvent={handleJoyrideCallback}
      tooltipComponent={AestheticTooltip}
      floaterProps={{
        disableAnimation: true,
        styles: {
          options: {
            zIndex: 10000,
          },
        },
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          overlayColor: 'rgba(15, 23, 42, 0.4)',
          zIndex: 1000,
        }
      } as any}
    />
  );
};
