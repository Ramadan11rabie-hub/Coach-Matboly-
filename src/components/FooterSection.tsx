import React from 'react';
import { Settings, ArrowUp, Lock } from 'lucide-react';
import { FooterData } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';

interface FooterSectionProps {
  data: FooterData;
  onOpenDashboard: () => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'support') => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ data, onOpenDashboard, onOpenLegal }) => {
  const { t, isRTL, logoUrl } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070707] border-t border-neutral-900 text-neutral-400 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between pb-10 border-b border-neutral-800/80">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src={logoUrl}
                alt="Coach Matboly Official Logo"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,230,0,0.3)]"
              />
              <span className="font-heading font-black text-2xl text-white tracking-wider uppercase">
                {t.footer.brandName}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Legal Links */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold tracking-wider uppercase">
            <button
              onClick={() => onOpenLegal('terms')}
              className="text-neutral-300 hover:text-[#FFE600] transition-colors cursor-pointer"
            >
              {t.footer.terms}
            </button>
            <span className="text-neutral-700">•</span>
            <button
              onClick={() => onOpenLegal('privacy')}
              className="text-neutral-300 hover:text-[#FFE600] transition-colors cursor-pointer"
            >
              {t.footer.privacy}
            </button>
            <span className="text-neutral-700">•</span>
            <button
              onClick={() => onOpenLegal('support')}
              className="text-neutral-300 hover:text-[#FFE600] transition-colors cursor-pointer"
            >
              {t.footer.support}
            </button>
          </div>

          {/* Scroll to Top */}
          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-sm bg-neutral-900 border border-neutral-800 hover:border-[#FFE600] hover:text-[#FFE600] text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Settings Button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-neutral-500 font-medium text-center sm:text-start">
            {t.footer.copyright}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDashboard}
              id="admin-settings-button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/90 border border-neutral-800 hover:border-[#FFE600] text-neutral-400 hover:text-[#FFE600] transition-all font-semibold uppercase tracking-wider text-xs cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(255,230,0,0.2)] group"
              title={isRTL ? 'الإعدادات ولوحة التحكم' : 'Admin Settings & Dashboard'}
            >
              <Settings className="w-4 h-4 text-neutral-400 group-hover:text-[#FFE600] group-hover:rotate-45 transition-transform duration-300" />
              <span>{isRTL ? 'الإعدادات' : 'SETTINGS'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

