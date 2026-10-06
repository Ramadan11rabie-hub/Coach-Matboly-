import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { SiteConfig } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  config: SiteConfig;
  onOpenCheckout: (planId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onOpenCheckout }) => {
  const { language, toggleLanguage, t, isRTL, logoUrl } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.about, href: '#about-coach' },
    { label: t.nav.howTo, href: '#calorie-calculator' },
    { label: t.nav.memberships, href: '#membership-plans' },
    { label: t.nav.transformations || t.nav.whyUs, href: '#transformations' },
    { label: t.nav.contact, href: '#get-in-touch' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#090909]/95 backdrop-blur-md border-b border-[#222222] py-3 shadow-2xl'
          : 'bg-gradient-to-b from-[#000000]/90 via-[#000000]/60 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a
          href="#"
          className="flex items-center gap-2.5 sm:gap-3 group select-none"
          title={language === 'ar' ? 'المتبولي' : 'Coach Matboly'}
        >
          <img
            src={logoUrl}
            alt="Coach Matboly Official Logo"
            className="h-10 sm:h-12 md:h-13 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(255,230,0,0.35)] group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <span className="font-heading font-black text-xl sm:text-2xl md:text-3xl text-white tracking-wider uppercase truncate">
            {language === 'ar' ? 'المتبولي' : 'Coach Matboly'}
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xs sm:text-sm font-bold tracking-wider text-neutral-300 hover:text-[#FFE600] transition-colors uppercase whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Zone: Language Switcher Button + Join CTA Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Globe Language Switcher Button (Switch between Arabic and English) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:text-black hover:bg-[#FFE600] hover:border-[#FFE600] transition-all focus-visible:outline-2 focus-visible:outline-[#FFE600] cursor-pointer shadow-md group"
            title={t.nav.switchLangTooltip}
            aria-label={t.nav.switchLangTooltip}
          >
            <Globe className="w-4 h-4 text-[#FFE600] group-hover:text-black transition-colors" />
            <span className="text-xs font-heading font-black uppercase tracking-wider">
              {t.nav.currentLangDisplay}
            </span>
          </button>

          {/* Join Today Button */}
          <button
            onClick={() => onOpenCheckout()}
            className="hidden sm:inline-flex items-center justify-center bg-[#FFE600] hover:bg-[#ffe100] active:scale-95 text-black font-heading font-extrabold text-sm sm:text-base tracking-wider uppercase px-5 py-2.5 rounded-sm transition-all shadow-[0_0_15px_rgba(255,230,0,0.3)] hover:shadow-[0_0_22px_rgba(255,230,0,0.5)] whitespace-nowrap cursor-pointer"
          >
            {t.nav.joinToday}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-md border border-neutral-800 bg-neutral-900 text-white hover:text-[#FFE600] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e0e0e] border-b border-neutral-800 px-5 pt-4 pb-6 mt-3 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-bold tracking-wider text-neutral-200 hover:text-[#FFE600] hover:bg-neutral-900/80 px-3 py-2.5 rounded-md transition-colors uppercase"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCheckout();
              }}
              className="w-full bg-[#FFE600] text-black font-heading font-black text-lg py-3 rounded-sm tracking-wider uppercase shadow-[0_0_15px_rgba(255,230,0,0.3)] cursor-pointer"
            >
              {t.nav.joinToday}
            </button>

            {/* Mobile Language Switcher Quick Action */}
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-700 text-neutral-200 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-[#FFE600] hover:text-[#FFE600] cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#FFE600]" />
              <span>{language === 'ar' ? 'تغيير اللغة إلى English' : 'Switch Language to العربية'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

