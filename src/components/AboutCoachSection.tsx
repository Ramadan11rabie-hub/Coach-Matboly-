import React from 'react';
import { CheckCircle2, Award, Zap, Flame } from 'lucide-react';
import { AboutCoachData } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';

interface AboutCoachSectionProps {
  data: AboutCoachData;
  onJoinClick: () => void;
}

export const AboutCoachSection: React.FC<AboutCoachSectionProps> = ({ data, onJoinClick }) => {
  const { t, isRTL, language } = useLanguage();

  const coachPhotoSrc =
    data.primaryPhoto ||
    data.primaryImage ||
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop';

  const secondaryPhotoSrc = data.secondaryPhoto || data.secondaryImage;
  const rawCoachName = data.coachName || t.about.coachName;
  const coachDisplayName = language === 'ar'
    ? rawCoachName.replace(/مدبولي/g, 'المتبولي')
    : rawCoachName;

  const rawParagraphs =
    data.paragraphs && data.paragraphs.length > 0
      ? data.paragraphs
      : (data.bioParagraph1 || data.bioParagraph2)
      ? [data.bioParagraph1, data.bioParagraph2].filter(Boolean) as string[]
      : t.about.paragraphs;

  const displayParagraphs = rawParagraphs.map(p => language === 'ar' ? p.replace(/مدبولي/g, 'المتبولي') : p);

  const displayCredentials =
    data.credentials && data.credentials.length > 0 ? data.credentials : t.about.credentials;

  const displayStats = data.stats && data.stats.length > 0 ? data.stats : t.about.stats;

  return (
    <section id="about-coach" className="relative py-20 sm:py-28 bg-[#0e0e0e] border-t border-b border-neutral-800/80 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFE600]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFE600]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-[#FFE600] text-xs font-bold tracking-widest uppercase mb-3 rounded-full">
            <Flame className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>{t.about.badge}</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight uppercase">
            {data.sectionTitle || t.about.sectionTitle}
          </h2>
          <p className="font-heading text-sm sm:text-base md:text-lg text-[#FFE600] font-bold tracking-widest uppercase mt-2">
            {data.subtitle || t.about.subtitle}
          </p>
          <div className="w-20 h-1 bg-[#FFE600] mx-auto mt-4" />
        </div>

        {/* 2-Column Responsive Layout: Visual + Story/Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Coach Photo Gallery / Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative group mx-auto max-w-md lg:max-w-none">
              {/* Geometric Yellow Frame Accent */}
              <div className={`absolute -top-3 ${isRTL ? '-right-3' : '-left-3'} w-full h-full border-2 border-[#FFE600] rounded-sm pointer-events-none transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`} />
              
              {/* Primary Image Container */}
              <div className="relative z-10 bg-neutral-900 overflow-hidden rounded-sm shadow-2xl aspect-[4/5]">
                <img
                  src={coachPhotoSrc}
                  alt={coachDisplayName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to default high quality fitness coach portrait if link fails
                    const target = e.currentTarget;
                    if (target.src !== 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop') {
                      target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop';
                    }
                  }}
                  className="w-full h-full object-cover object-center filter grayscale-[15%] contrast-110 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Bottom Photo Overlay Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm border border-neutral-800 p-3.5 rounded-sm flex items-center justify-between">
                  <div>
                    <p className="font-heading font-black text-lg text-white uppercase tracking-wider">
                      {coachDisplayName}
                    </p>
                    <p className="text-[11px] font-bold tracking-widest text-[#FFE600] uppercase">
                      {data.coachTitle || t.about.tagCoach}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-[#FFE600] flex items-center justify-center rounded-sm text-black font-black">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                </div>
              </div>

              {/* Secondary floating thumbnail if available */}
              {secondaryPhotoSrc && (
                <div className={`hidden sm:block absolute -bottom-6 ${isRTL ? '-left-6' : '-right-6'} z-20 w-36 h-44 bg-black p-1 rounded-sm border-2 border-neutral-700 shadow-2xl overflow-hidden`}>
                  <img
                    src={secondaryPhotoSrc}
                    alt="Coaching session"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop') {
                        target.src = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop';
                      }
                    }}
                    className="w-full h-full object-cover rounded-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Coach Bio, Ethos & Credentials */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Bio Paragraphs */}
            <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
              {displayParagraphs.map((p, idx) => (
                <p key={idx} className="font-normal">
                  {p}
                </p>
              ))}
            </div>

            {/* Credentials / Highlights Checklist */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 rounded-sm space-y-3 my-2">
              <p className="font-heading font-bold text-xs sm:text-sm tracking-widest text-[#FFE600] uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFE600]" />
                <span>{t.about.qualificationsTitle}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {displayCredentials.map((cred, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#FFE600] shrink-0 mt-0.5" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {displayStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-black border border-neutral-800/90 p-3.5 sm:p-4 rounded-sm text-center hover:border-[#FFE600]/50 transition-colors"
                >
                  <p className="font-heading font-black text-2xl sm:text-3xl text-[#FFE600] tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA action */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onJoinClick}
                className="w-full sm:w-auto bg-[#FFE600] hover:bg-[#fff033] active:scale-98 text-black font-heading font-black text-xl py-3.5 px-8 rounded-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,230,0,0.3)] hover:shadow-[0_0_30px_rgba(255,230,0,0.5)] cursor-pointer"
              >
                {t.about.trainBtn}
              </button>
              <a
                href="#how-to-subscription"
                className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
              >
                {t.about.learnHow}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

