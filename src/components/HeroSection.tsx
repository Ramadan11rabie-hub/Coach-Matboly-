import React from 'react';
import { ChevronDown, Sparkles, Award } from 'lucide-react';
import { HeroData } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';

interface HeroSectionProps {
  data: HeroData;
  onJoinClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, onJoinClick }) => {
  const { t, isRTL, language } = useLanguage();

  const scrollToNext = () => {
    const target = document.querySelector('#about-coach') || document.querySelector('#membership-plans');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const rawMainTitle = data.mainTitle || t.hero.mainTitle;
  const heroCoachName = language === 'ar'
    ? rawMainTitle.replace(/مدبولي/g, 'المتبولي')
    : rawMainTitle;

  const currentOverlayDarkness = data.overlayDarkness ?? 0;

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex items-center justify-center overflow-hidden bg-black pt-20 pb-16">
      {/* Background Media (Image or Video) with Dark Atmosphere */}
      <div className="absolute inset-0 z-0">
        {data.mediaType === 'video' ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center"
            src={data.mediaUrl}
          />
        ) : (
          <img
            src={data.mediaUrl}
            alt="Coach Matboly Fitness"
            className="w-full h-full object-cover object-center sm:object-top transform scale-105 transition-transform duration-1000 ease-out"
          />
        )}

        {/* Dynamic Dark Overlay for Background Image/Video Controlled via Admin */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-200"
          style={{ opacity: currentOverlayDarkness / 100 }}
        />
        {/* Subtle Vignette & Gradient if darkness > 0 */}
        {currentOverlayDarkness > 0 && (
          <>
            <div 
              className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-black/80 pointer-events-none transition-opacity duration-200"
              style={{ opacity: Math.min(1, currentOverlayDarkness / 60) }}
            />
            <div 
              className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none transition-opacity duration-200"
              style={{ opacity: Math.min(1, currentOverlayDarkness / 60) }}
            />
          </>
        )}
        
        {/* Subtle dynamic grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Main Content Box */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-[#FFE600]/40 text-[#FFE600] text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 sm:mb-8 shadow-[0_0_15px_rgba(255,230,0,0.15)] animate-in fade-in duration-700">
          <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-ping" />
          <span>{data.badge || t.hero.badge}</span>
        </div>

        {/* Coach Name Subheading */}
        <p className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-neutral-300 tracking-widest uppercase mb-2">
          {heroCoachName}
        </p>

        {/* Core Main Highlight Text: [ BE YOURSELF ] / [ اصنع نسختك الأقوى ] */}
        <h1 className="font-heading font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tight uppercase leading-[0.9] sm:leading-[0.88] my-3 select-none">
          <span className="text-[#FFE600] drop-shadow-[0_0_25px_rgba(255,230,0,0.4)]">
            {data.highlightText || t.hero.highlightText}
          </span>
        </h1>

        {/* Subtitle / Ethos Statement */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-semibold text-neutral-300 tracking-wider uppercase mt-4 mb-8 sm:mb-10 px-2 leading-relaxed">
          {data.subheadline || t.hero.subheadline}
        </p>

        {/* Large Prominent Yellow CTA Button matching reference */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          <button
            onClick={onJoinClick}
            className="w-full sm:w-auto min-w-[240px] sm:min-w-[280px] bg-[#FFE600] hover:bg-[#fff033] active:scale-[0.98] text-black font-heading font-black text-2xl sm:text-3xl py-4 sm:py-5 px-8 sm:px-12 rounded-sm uppercase tracking-widest transition-all duration-200 shadow-[0_0_25px_rgba(255,230,0,0.5)] hover:shadow-[0_0_40px_rgba(255,230,0,0.75)] cursor-pointer group flex items-center justify-center gap-3"
          >
            <span>{data.buttonText || t.hero.buttonText}</span>
            <span className={`text-xl sm:text-2xl transform transition-transform duration-200 ${isRTL ? 'group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5'}`}>
              {isRTL ? '←' : '→'}
            </span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 sm:mt-14 flex items-center justify-center gap-6 sm:gap-10 text-neutral-400 text-xs sm:text-sm font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FFE600]" />
            <span className="uppercase tracking-wider font-semibold">{t.hero.tailoredBadge}</span>
          </div>
          <div className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-neutral-700" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFE600]" />
            <span className="uppercase tracking-wider font-semibold">{t.hero.guaranteedBadge}</span>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Down Indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 text-neutral-400 hover:text-[#FFE600] transition-colors p-2 cursor-pointer animate-bounce"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </section>
  );
};
