import React, { useState } from 'react';
import {
  Calculator,
  Flame,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  Dumbbell,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Scale
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CalorieCalculatorData } from '../types/fitness';
import { CalorieCalculatorModal } from './CalorieCalculatorModal';

interface CalorieCalculatorSectionProps {
  data?: CalorieCalculatorData;
  onJoinClick?: () => void;
}

export const CalorieCalculatorSection: React.FC<CalorieCalculatorSectionProps> = ({
  data,
  onJoinClick,
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calcT = t.calculator;

  return (
    <section
      id="calorie-calculator"
      className="relative py-14 sm:py-20 md:py-24 bg-[#090909] text-white overflow-hidden scroll-mt-20 border-b border-neutral-900"
    >
      {/* Background aesthetic lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#FFE600]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-24 end-10 w-[300px] h-[300px] bg-[#FFE600]/4 rounded-full blur-[100px] pointer-events-none" />

      {/* Hidden legacy anchor for backwards compatibility */}
      <div id="how-to-subscription" className="sr-only" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Interactive Widget Container */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-gradient-to-b from-[#141414] via-[#101010] to-[#0c0c0c] border-2 border-neutral-800 hover:border-[#FFE600]/80 rounded-xl p-6 sm:p-8 md:p-10 shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,230,0,0.18)] cursor-pointer overflow-hidden"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFE600] to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

          {/* Top Tag & Interactive Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-full text-xs font-bold text-[#FFE600] uppercase tracking-wider shadow-[0_0_12px_rgba(255,230,0,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>{data?.badge || calcT.badge}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400 group-hover:text-white transition-colors font-mono">
              <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-ping" />
              <span>{isRTL ? 'حاسبة تفاعلية معتمدة' : 'Interactive Verified Widget'}</span>
            </div>
          </div>

          {/* Header Title & Subtitle */}
          <div className="max-w-3xl mb-8">
            <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight leading-tight group-hover:text-white transition-colors">
              {data?.sectionTitle || calcT.sectionTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
              {data?.subtitle || calcT.subtitle}
            </p>
          </div>

          {/* Counter / Calculator Metrics Showcase (4 Preview Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {/* Metric 1: BMR */}
            <div className="bg-black/60 border border-neutral-800/80 group-hover:border-neutral-700 p-3.5 sm:p-4 rounded-lg transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span className="font-bold uppercase tracking-wider">BMR</span>
                <Flame className="w-4 h-4 text-[#FFE600]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-xl sm:text-2xl text-white">
                  1,780
                </span>
                <span className="text-[11px] text-neutral-400 uppercase font-mono">kcal</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                {isRTL ? 'معدل الحرق الأساسي بالراحة' : 'Basal Metabolic Rate'}
              </p>
            </div>

            {/* Metric 2: TDEE */}
            <div className="bg-black/60 border border-neutral-800/80 group-hover:border-neutral-700 p-3.5 sm:p-4 rounded-lg transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span className="font-bold uppercase tracking-wider">TDEE</span>
                <Zap className="w-4 h-4 text-[#FFE600]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-xl sm:text-2xl text-white">
                  2,650
                </span>
                <span className="text-[11px] text-neutral-400 uppercase font-mono">kcal</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                {isRTL ? 'إجمالي الحرق اليومي بالنشاط' : 'Total Daily Energy Burn'}
              </p>
            </div>

            {/* Metric 3: Target Calories */}
            <div className="bg-[#181818] border border-[#FFE600]/40 p-3.5 sm:p-4 rounded-lg transition-all shadow-[0_0_15px_rgba(255,230,0,0.08)]">
              <div className="flex items-center justify-between text-[#FFE600] text-xs mb-2">
                <span className="font-bold uppercase tracking-wider">
                  {isRTL ? 'سعرات الهدف' : 'Target Goal'}
                </span>
                <Target className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#FFE600]">
                  2,120
                </span>
                <span className="text-[11px] text-[#FFE600]/80 uppercase font-mono">kcal/d</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1">
                {isRTL ? 'حرق دهون / بناء عضلات' : 'Custom Cut / Bulk Deficit'}
              </p>
            </div>

            {/* Metric 4: Macro Ratio */}
            <div className="bg-black/60 border border-neutral-800/80 group-hover:border-neutral-700 p-3.5 sm:p-4 rounded-lg transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span className="font-bold uppercase tracking-wider">
                  {isRTL ? 'الماكروز' : 'Macros'}
                </span>
                <Dumbbell className="w-4 h-4 text-[#FFE600]" />
              </div>
              <div className="flex items-baseline gap-1.5 font-heading font-bold text-xs sm:text-sm">
                <span className="text-[#FFE600]">165g P</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[#38bdf8]">210g C</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[#f97316]">58g F</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                {isRTL ? 'بروتين • كاربوهيدرات • دهون' : 'Protein • Carbs • Fats'}
              </p>
            </div>
          </div>

          {/* Interactive Trigger CTA Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-[#FFE600] shrink-0" />
              <span>
                {isRTL
                  ? 'معادلات معتمدة علمياً (Mifflin-St Jeor & Katch-McArdle LBM)'
                  : 'Gold-Standard Formulas: Mifflin-St Jeor & Katch-McArdle LBM'}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded bg-[#FFE600] group-hover:bg-[#fff033] text-black font-heading font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,230,0,0.3)] hover:shadow-[0_0_30px_rgba(255,230,0,0.5)] transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 stroke-[2.5]" />
              <span>{isRTL ? 'افتَح حاسبة السعرات الآن' : 'Open Calorie Calculator'}</span>
              <ArrowRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                  isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* Clean Interactive Popup Modal */}
      <CalorieCalculatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJoinClick={onJoinClick}
        customTitle={data?.sectionTitle}
        customSubtitle={data?.subtitle}
        customCtaText={data?.ctaText}
      />
    </section>
  );
};
