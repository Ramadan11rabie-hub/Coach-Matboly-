import React, { useState } from 'react';
import { Send, MessageCircle, CheckCircle } from 'lucide-react';
import { GetInTouchData } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';

interface GetInTouchSectionProps {
  data: GetInTouchData;
}

export const GetInTouchSection: React.FC<GetInTouchSectionProps> = ({ data }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: 'Fat Loss & Muscle Building',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Direct WhatsApp prefilled message or instant consultation submission
    const cleanPhone = (data.whatsappNumber || '+1234567890').replace(/[^0-9]/g, '');
    const textMsg = encodeURIComponent(
      `Hello Coach Matboly! My name is ${formData.name}. I'm interested in fitness coaching for: ${formData.goal}. Contact: ${formData.phone || formData.email}. Note: ${formData.message}`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${textMsg}`;

    setSubmitted(true);
    // Optionally open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="get-in-touch" className="relative py-24 sm:py-32 bg-black overflow-hidden border-t border-neutral-800">
      {/* Background Hero Banner with High Contrast Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img
          src={data.backgroundImage}
          alt="Get In Touch Fitness Backdrop"
          className="w-full h-full object-cover object-center"
        />
        {/* Layered dark gradients for maximum legibility */}
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/50 to-black" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Banner Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/80 border border-[#FFE600]/50 text-[#FFE600] text-xs font-bold tracking-widest uppercase mb-3 rounded-full shadow-[0_0_15px_rgba(255,230,0,0.2)]">
            <MessageCircle className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>{t.contact.badge}</span>
          </div>

          <h2 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight uppercase leading-none">
            {data.sectionTitle || t.contact.sectionTitle}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-neutral-300 font-semibold tracking-wider uppercase mt-4 max-w-2xl mx-auto">
            {data.subtitle || t.contact.subtitle}
          </p>

          <div className="w-24 h-1.5 bg-[#FFE600] mx-auto mt-5" />
        </div>

        {/* Social Media Prominent Buttons Row (Facebook, TikTok, Instagram, WhatsApp, YouTube) */}
        <div className="mb-14">
          <p className="text-center text-xs font-bold tracking-widest text-[#FFE600] uppercase mb-5">
            {t.contact.socialTitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
            {/* Facebook Button */}
            {data.socials.facebook && (
              <a
                href={data.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 rounded-sm bg-neutral-900/90 border border-neutral-700 hover:border-[#FFE600] hover:bg-[#FFE600] hover:text-black text-white transition-all font-heading font-bold text-base tracking-wider uppercase shadow-lg group"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>{t.contact.socialButtons.facebook}</span>
              </a>
            )}

            {/* TikTok Button */}
            {data.socials.tiktok && (
              <a
                href={data.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 rounded-sm bg-neutral-900/90 border border-neutral-700 hover:border-[#FFE600] hover:bg-[#FFE600] hover:text-black text-white transition-all font-heading font-bold text-base tracking-wider uppercase shadow-lg group"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                <span>{t.contact.socialButtons.tiktok}</span>
              </a>
            )}

            {/* Instagram Button */}
            {data.socials.instagram && (
              <a
                href={data.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 rounded-sm bg-neutral-900/90 border border-neutral-700 hover:border-[#FFE600] hover:bg-[#FFE600] hover:text-black text-white transition-all font-heading font-bold text-base tracking-wider uppercase shadow-lg group"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{t.contact.socialButtons.instagram}</span>
              </a>
            )}

            {/* WhatsApp Direct Chat */}
            {data.socials.whatsapp && (
              <a
                href={data.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 rounded-sm bg-[#25D366] hover:bg-[#20ba5a] text-black transition-all font-heading font-black text-base tracking-wider uppercase shadow-[0_0_15px_rgba(37,211,102,0.4)]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{t.contact.socialButtons.whatsapp}</span>
              </a>
            )}

            {/* YouTube if provided */}
            {data.socials.youtube && (
              <a
                href={data.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 rounded-sm bg-neutral-900/90 border border-neutral-700 hover:border-[#FFE600] hover:bg-[#FFE600] hover:text-black text-white transition-all font-heading font-bold text-base tracking-wider uppercase shadow-lg group"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>{t.contact.socialButtons.youtube}</span>
              </a>
            )}
          </div>
        </div>

        {/* Quick Consultation Form Box */}
        <div className="max-w-2xl mx-auto bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 rounded-lg shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
              {t.contact.formTitle}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {t.contact.formSubtitle}
            </p>
          </div>

          {submitted ? (
            <div className="bg-neutral-800/80 border border-[#FFE600]/40 p-6 rounded-md text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-[#FFE600] mx-auto" />
              <h4 className="font-heading font-black text-2xl text-white uppercase">
                {t.contact.successTitle}
              </h4>
              <p className="text-xs text-neutral-300">
                {t.contact.successDesc}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-[#FFE600] hover:underline uppercase tracking-wider mt-2"
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    {t.contact.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.contact.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/80 border border-neutral-700 rounded-sm px-3.5 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none placeholder-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    {t.contact.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.contact.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/80 border border-neutral-700 rounded-sm px-3.5 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none placeholder-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  {t.contact.goalLabel}
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-black/80 border border-neutral-700 rounded-sm px-3.5 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                >
                  {t.contact.goals.map((g, idx) => (
                    <option key={idx} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  {t.contact.notesLabel}
                </label>
                <textarea
                  rows={3}
                  placeholder={t.contact.notesPlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-black/80 border border-neutral-700 rounded-sm px-3.5 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none placeholder-neutral-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFE600] hover:bg-[#fff033] active:scale-[0.99] text-black font-heading font-black text-xl py-4 rounded-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,230,0,0.35)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>{t.contact.submitBtn}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

