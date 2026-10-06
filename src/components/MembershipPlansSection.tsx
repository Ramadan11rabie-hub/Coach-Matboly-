import React, { useState } from 'react';
import { Check, Flame, Zap, ShieldCheck } from 'lucide-react';
import { MembershipPlansData, MembershipPlan } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';
import { getPlanCalculatedDurations } from '../lib/planPricing';

interface MembershipPlansSectionProps {
  data: MembershipPlansData;
  onSelectPlan: (plan: MembershipPlan) => void;
}

interface PlanCardProps {
  plan: MembershipPlan;
  index: number;
  isHighlighted: boolean;
  onSelectPlan: (plan: MembershipPlan) => void;
  isRTL: boolean;
  t: any;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  index,
  isHighlighted,
  onSelectPlan,
  isRTL,
  t,
}) => {
  const calculatedDurations = getPlanCalculatedDurations(plan, isRTL);
  
  // Find default duration index
  const defaultIdx = calculatedDurations.findIndex((d) => d.isDefault);
  const initialIndex = defaultIdx >= 0 ? defaultIdx : Math.min(2, calculatedDurations.length - 1);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(Math.max(0, initialIndex));

  const activeDuration = calculatedDurations[selectedDurationIndex] || calculatedDurations[0];

  // Direct database fields - Never overridden by demo data
  const planName = plan.name;
  const planBadge = plan.badgeText;
  const planDesc = plan.description;
  const planFeatures = Array.isArray(plan.features) ? plan.features : [];
  const planImage = plan.imageUrl || plan.image;

  const handleCtaClick = () => {
    // Send selected plan with active duration and price details
    onSelectPlan({
      ...plan,
      name: planName,
      duration: activeDuration?.displayLabel || plan.duration,
      price: activeDuration?.formattedSellingPrice || plan.price,
      originalPrice: activeDuration?.hasDiscount ? activeDuration.formattedRegularPrice : plan.originalPrice,
      defaultDurationMonths: activeDuration?.months || plan.defaultDurationMonths,
    });
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl overflow-hidden transition-all duration-300 ${
        isHighlighted
          ? 'bg-neutral-900/95 border-2 border-[#FFE600] shadow-[0_0_35px_rgba(255,230,0,0.18)] scale-[1.01] z-10'
          : 'bg-[#121212] border border-neutral-800 hover:border-neutral-700 hover:shadow-xl'
      }`}
    >
      {/* Popular / Best Value Badge */}
      {planBadge && (
        <div className={`absolute top-4 ${isRTL ? 'right-6' : 'left-6'} z-20`}>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-md ${
              isHighlighted
                ? 'bg-[#FFE600] text-black shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                : 'bg-neutral-900/90 text-[#FFE600] border border-[#FFE600]/40 backdrop-blur-sm'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            {planBadge}
          </span>
        </div>
      )}

      {/* Package Image Header Banner (If Provided) */}
      {planImage && (
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-neutral-900 group">
          <img
            src={planImage}
            alt={planName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        </div>
      )}

      <div className={`p-6 sm:p-8 flex flex-col flex-1 justify-between ${planImage ? 'pt-2' : ''}`}>
        <div>
          {/* Plan Header */}
          <div className="pb-4 border-b border-neutral-800/80 pt-1">
            <span className="text-xs font-bold tracking-widest text-[#FFE600] uppercase block">
              {planName}
            </span>

            {/* Duration Selector Tabs (if multiple durations exist) */}
            {calculatedDurations.length > 1 && (
              <div className="mt-3.5 mb-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'اختر مدة الاشتراك:' : 'Select Duration:'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {calculatedDurations.map((dur, dIdx) => {
                    const isDurSelected = selectedDurationIndex === dIdx;
                    return (
                      <button
                        key={dur.id || dIdx}
                        type="button"
                        onClick={() => setSelectedDurationIndex(dIdx)}
                        className={`px-2.5 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isDurSelected
                            ? 'bg-[#FFE600] text-black font-extrabold shadow-sm'
                            : 'bg-neutral-900 border border-neutral-700/80 text-neutral-300 hover:border-neutral-500 hover:text-white'
                        }`}
                      >
                        <span>{dur.displayLabel}</span>
                        {dur.hasDiscount && (
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                              isDurSelected
                                ? 'bg-black text-[#FFE600]'
                                : 'bg-[#FFE600]/20 text-[#FFE600]'
                            }`}
                          >
                            {isRTL ? dur.discountBadgeAr : dur.discountBadge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing Presentation */}
            <div className="mt-3 pt-3 border-t border-neutral-800/60">
              {/* 1. Duration Name */}
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
                {activeDuration?.displayLabel || plan.duration}
              </h3>

              {/* 2. Regular Strikethrough Price */}
              {activeDuration?.hasDiscount ? (
                <div className="mt-1.5">
                  <span className="text-base sm:text-lg text-neutral-400 font-bold line-through tracking-tight">
                    {activeDuration.strikethroughDisplay}
                  </span>
                </div>
              ) : plan.originalPrice ? (
                <div className="mt-1.5">
                  <span className="text-base sm:text-lg text-neutral-400 font-bold line-through tracking-tight">
                    /{plan.originalPrice}/
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-xs text-neutral-400 font-medium">
                  {isRTL ? 'السعر الأساسي' : 'Standard Rate'}
                </div>
              )}

              {/* 3. Final Selling Price & Discount Badge */}
              <div className="mt-1 flex items-baseline flex-wrap gap-2.5 sm:gap-3">
                <span className="font-heading font-black text-4xl sm:text-5xl text-[#FFE600] tracking-tight">
                  {activeDuration?.formattedSellingPrice || plan.price}
                </span>

                {activeDuration?.hasDiscount && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FFE600] text-black shadow-md uppercase tracking-wider">
                    {isRTL ? activeDuration.discountBadgeAr : activeDuration.discountBadge}
                  </span>
                )}
              </div>

              {/* Savings Callout */}
              {activeDuration?.hasDiscount && (
                <p className="text-[11px] font-bold text-neutral-400 mt-1">
                  {isRTL
                    ? `وفرت ${activeDuration.formattedDiscountAmount} مع باقة الـ ${activeDuration.displayLabel}`
                    : `You save ${activeDuration.formattedDiscountAmount} with ${activeDuration.displayLabel}`}
                </p>
              )}
            </div>
          </div>

          {/* Plan Description */}
          {planDesc && (
            <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
              {planDesc}
            </p>
          )}

          {/* Features List with Yellow Checks */}
          {planFeatures.length > 0 && (
            <div className="space-y-3 pt-5 pb-6">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                {t.plans.includedTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {planFeatures.map((feature: string, fIdx: number) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                    <div className="w-4 h-4 rounded-full bg-[#FFE600]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#FFE600] stroke-[3]" />
                    </div>
                    <span className="font-medium leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Yellow CTA Button */}
        <div className="pt-4 mt-auto border-t border-neutral-800/60">
          <button
            onClick={handleCtaClick}
            className={`w-full py-4 px-6 rounded-sm font-heading font-black text-base sm:text-lg tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              isHighlighted
                ? 'bg-[#FFE600] hover:bg-[#fff033] active:scale-98 text-black shadow-[0_0_20px_rgba(255,230,0,0.35)]'
                : 'bg-neutral-800 hover:bg-[#FFE600] active:scale-98 text-white hover:text-black border border-neutral-700 hover:border-[#FFE600]'
            }`}
          >
            <span>
              {isRTL
                ? `اشترك في ${activeDuration?.displayLabel || plan.name}`
                : `JOIN ${activeDuration?.displayLabel || plan.name}`}
            </span>
            <span className="text-lg">{isRTL ? '←' : '→'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MembershipPlansSection: React.FC<MembershipPlansSectionProps> = ({
  data,
  onSelectPlan,
}) => {
  const { t, isRTL } = useLanguage();

  // Render all active plans from database
  const plans = Array.isArray(data?.plans) ? data.plans : [];

  return (
    <section id="membership-plans" className="relative py-20 sm:py-28 bg-[#0b0b0b] border-t border-b border-neutral-800/80 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFE600]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-[#FFE600] text-xs font-bold tracking-widest uppercase mb-3 rounded-full">
            <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>{t.plans.badge}</span>
          </div>

          <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight uppercase">
            {data.sectionTitle || t.plans.sectionTitle}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-semibold tracking-wider uppercase mt-3 max-w-2xl mx-auto">
            {data.subtitle || t.plans.subtitle}
          </p>

          <div className="w-20 h-1 bg-[#FFE600] mx-auto mt-4" />
        </div>

        {/* PLANS GRID: 2 Plans per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isHighlighted = plan.isPopular;
            return (
              <PlanCard
                key={plan.id || index}
                plan={plan}
                index={index}
                isHighlighted={Boolean(isHighlighted)}
                onSelectPlan={onSelectPlan}
                isRTL={isRTL}
                t={t}
              />
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-14 max-w-2xl mx-auto bg-neutral-900/60 border border-neutral-800 p-4 sm:p-5 rounded-md flex items-center justify-center gap-4 text-center">
          <ShieldCheck className="w-6 h-6 text-[#FFE600] shrink-0" />
          <p className="text-xs sm:text-sm text-neutral-300 font-medium">
            <strong className="text-white">{t.plans.guaranteeTitle}</strong> {t.plans.guaranteeText}
          </p>
        </div>
      </div>
    </section>
  );
};
