import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { SiteConfig } from '../types/fitness';
import { COUNTRIES, DEFAULT_COUNTRY, CountryItem } from '../data/countries';
import { CustomerRegistration } from '../types/customer';
import { useLanguage } from '../context/LanguageContext';
import { getPlanCalculatedDurations } from '../lib/planPricing';

interface PlanCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  config: SiteConfig;
  onSaveCustomer: (customerData: Omit<CustomerRegistration, 'id' | 'createdAt' | 'createdAtTimestamp' | 'status'>) => Promise<{ success: boolean; id?: string; error?: string }>;
}

export const PlanCheckoutModal: React.FC<PlanCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId,
  config,
  onSaveCustomer,
}) => {
  const { t, isRTL, language } = useLanguage();
  const plans = config.plans.plans;
  const [activePlanId, setActivePlanId] = useState<string>(selectedPlanId || plans[1]?.id || plans[0]?.id);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);

  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('Intermediate (1-3 years)');
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Building & Hypertrophy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');

  useEffect(() => {
    if (selectedPlanId) {
      setActivePlanId(selectedPlanId);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    if (isOpen) {
      setSubmittedSuccess(false);
    }
  }, [isOpen]);

  const currentPlanIndex = plans.findIndex((p) => p.id === activePlanId);
  const currentPlan = plans[currentPlanIndex >= 0 ? currentPlanIndex : 0] || plans[0];
  const realPlan = {
    name: currentPlan?.name || 'Selected Plan',
    duration: currentPlan?.duration || '',
    badgeText: currentPlan?.badgeText || '',
    periodText: currentPlan?.periodText || '',
    imageUrl: currentPlan?.imageUrl || currentPlan?.image || '',
  };

  const calculatedDurations = currentPlan ? getPlanCalculatedDurations(currentPlan, isRTL) : [];

  // Reset duration index when switching plan
  useEffect(() => {
    if (calculatedDurations.length > 0) {
      const defaultIdx = calculatedDurations.findIndex((d) => d.isDefault);
      setSelectedDurationIndex(defaultIdx >= 0 ? defaultIdx : Math.min(2, calculatedDurations.length - 1));
    }
  }, [activePlanId]);

  if (!isOpen || !currentPlan) return null;

  const activeDuration = calculatedDurations[selectedDurationIndex] || calculatedDurations[0];

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
      c.nameAr.includes(searchCountry) ||
      c.dialCode.includes(searchCountry)
  );

  const formatCleanInternationalNumber = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').replace(/^0+/, '');
    return `${selectedCountry.dialCode}${cleanPhone}`;
  };

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);

    const fullPhone = formatCleanInternationalNumber();
    const durationLabel = activeDuration?.displayLabel || currentPlan.duration;
    const priceDisplay = activeDuration?.formattedSellingPrice || currentPlan.price;
    const discountInfo = activeDuration?.hasDiscount ? ` (${activeDuration.discountBadge})` : '';

    // 1. Save customer to persistent Firestore Database
    await onSaveCustomer({
      name: name.trim(),
      countryCode: selectedCountry.code,
      countryDialCode: selectedCountry.dialCode,
      countryName: selectedCountry.name,
      rawPhoneNumber: phoneNumber.trim(),
      fullInternationalPhone: fullPhone,
      email: email.trim() ? email.trim() : '',
      selectedPlanId: currentPlan.id,
      selectedPlanName: currentPlan.name,
      selectedPlanDuration: durationLabel,
      selectedPlanPrice: `${priceDisplay}${discountInfo}`,
      trainingExperience: experience,
      fitnessGoal,
      notes: '',
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);

    // 2. Open Coach's WhatsApp with registration details pre-filled
    const coachPhone = (config.contact.whatsappNumber || '+201000000000').replace(/[^0-9]/g, '');
    const waMessage = encodeURIComponent(
      `Hello Coach Matboly! 🏋️‍♂️\nI have just registered on your website for [${realPlan.name} - ${durationLabel}] (${priceDisplay}${discountInfo}).\n\n📌 Details:\n- Name: ${name}\n- Phone: ${fullPhone}\n- Country: ${selectedCountry.flag} ${language === 'ar' ? selectedCountry.nameAr : selectedCountry.name}\n- Experience: ${experience}\n- Goal: ${fitnessGoal}\n\nReady to start!`
    );
    const waUrl = `https://wa.me/${coachPhone}?text=${waMessage}`;

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#121212] border-2 border-[#FFE600] rounded-xl shadow-2xl overflow-hidden text-neutral-200 my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0c0c0c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#FFE600] text-black font-black flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white uppercase tracking-wider">
                {t.checkout.modalTitle || t.checkout.title || (isRTL ? 'الانضمام لبرنامج التدريب' : 'JOIN COACHING PROGRAM')}
              </h3>
              <p className="text-xs text-neutral-400">
                {t.checkout.modalSubtitle || t.checkout.subtitle || (isRTL ? 'إشراف ومتابعة مباشرة مع كوتش المتبولي' : 'Direct Mentorship with Coach Matboly')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-[#FFE600] text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(255,230,0,0.5)]">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="font-heading font-black text-2xl text-white uppercase">
                {t.checkout.submittedTitle}
              </h4>
              <p className="text-sm text-neutral-300 max-w-md mx-auto">
                {t.checkout.submittedDesc}{' '}
                <strong className="text-[#FFE600]">{name}</strong>! [{realPlan.name} - {activeDuration?.displayLabel}]
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#FFE600] text-black font-heading font-black text-sm px-6 py-3 rounded-sm uppercase tracking-wider hover:bg-[#fff033]"
                >
                  {t.checkout.closeBtn}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Package Selector (Tabs) */}
              <div>
                <label className="block text-xs font-bold text-[#FFE600] uppercase tracking-wider mb-2">
                  {isRTL ? 'اختر الباقة:' : 'Select Package:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {plans.map((p) => {
                    const isSelected = p.id === activePlanId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePlanId(p.id)}
                        className={`p-2.5 rounded-sm border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFE600] border-[#FFE600] text-black shadow-md font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        <p className="font-heading font-black text-xs sm:text-sm uppercase truncate">
                          {p.name}
                        </p>
                        <p className={`text-xs font-extrabold ${isSelected ? 'text-black' : 'text-[#FFE600]'}`}>
                          {p.price}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Selector for the Active Plan */}
              {calculatedDurations.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                    {isRTL ? 'اختر مدة الاشتراك للباقة:' : 'Select Duration:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {calculatedDurations.map((dur, dIdx) => {
                      const isSelectedDur = selectedDurationIndex === dIdx;
                      return (
                        <button
                          key={dur.id || dIdx}
                          type="button"
                          onClick={() => setSelectedDurationIndex(dIdx)}
                          className={`px-3 py-2 rounded-sm border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelectedDur
                              ? 'bg-[#FFE600] border-[#FFE600] text-black font-extrabold shadow-sm'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                          }`}
                        >
                          <span>{dur.displayLabel}</span>
                          {dur.hasDiscount && (
                            <span
                              className={`text-[10px] font-black px-1.5 rounded-full ${
                                isSelectedDur
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

              {/* Active Plan & Duration Presentation */}
              <div className="bg-black/90 border border-neutral-800 p-4 rounded-md">
                <div className="flex items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {realPlan.imageUrl && (
                      <img
                        src={realPlan.imageUrl}
                        alt={realPlan.name}
                        className="w-12 h-12 rounded object-cover border border-neutral-700 shrink-0"
                      />
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-[#FFE600] uppercase tracking-wider block">
                        {realPlan.name}
                      </span>
                      <h4 className="font-heading font-black text-xl sm:text-2xl text-white uppercase">
                        {activeDuration?.displayLabel || realPlan.duration}
                      </h4>
                    </div>
                  </div>
                  {realPlan.badgeText && (
                    <span className="px-2 py-0.5 rounded bg-[#FFE600] text-black text-[10px] font-black uppercase">
                      {realPlan.badgeText}
                    </span>
                  )}
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <div>
                    {activeDuration?.hasDiscount && (
                      <span className="text-sm sm:text-base text-neutral-400 font-bold line-through">
                        {activeDuration.strikethroughDisplay}
                      </span>
                    )}
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-heading font-black text-3xl sm:text-4xl text-[#FFE600]">
                        {activeDuration?.formattedSellingPrice || currentPlan.price}
                      </span>
                      {activeDuration?.hasDiscount && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-[#FFE600] text-black shadow-sm uppercase">
                          {isRTL ? activeDuration.discountBadgeAr : activeDuration.discountBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {activeDuration?.hasDiscount && (
                    <p className="text-xs font-bold text-neutral-400">
                      {isRTL
                        ? `وفر ${activeDuration.formattedDiscountAmount}`
                        : `Save ${activeDuration.formattedDiscountAmount}`}
                    </p>
                  )}
                </div>
              </div>

              {/* User Information Form */}
              <form onSubmit={handleProceed} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    {t.checkout.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.contact.fullNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                {/* Country Code & Phone Field */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    {t.checkout.countryPhoneLabel}
                  </label>
                  <div className="flex items-stretch gap-2">
                    {/* Country Selector with Flag */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="h-full bg-neutral-900 border border-neutral-700 hover:border-[#FFE600] px-3 py-2 rounded-sm flex items-center gap-1.5 text-sm text-white font-medium cursor-pointer min-w-[110px] justify-between"
                      >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="font-bold text-xs">{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      {/* Country Dropdown Popover */}
                      {isCountryDropdownOpen && (
                        <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-1 w-72 bg-[#161616] border border-neutral-700 rounded shadow-2xl z-50 max-h-60 overflow-y-auto`}>
                          <div className="p-2 border-b border-neutral-800 sticky top-0 bg-[#161616]">
                            <input
                              type="text"
                              placeholder={t.checkout.searchCountry}
                              value={searchCountry}
                              onChange={(e) => setSearchCountry(e.target.value)}
                              className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                              autoFocus
                            />
                          </div>
                          <div className="py-1">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setIsCountryDropdownOpen(false);
                                  setSearchCountry('');
                                }}
                                className={`w-full px-3 py-1.5 text-left flex items-center justify-between text-xs hover:bg-neutral-800 transition-colors cursor-pointer ${
                                  selectedCountry.code === country.code ? 'bg-[#FFE600]/15 text-[#FFE600]' : 'text-neutral-200'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{country.flag}</span>
                                  <span>{language === 'ar' ? country.nameAr : country.name}</span>
                                </span>
                                <span className="font-mono text-neutral-400 font-bold">{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                      <input
                        type="tel"
                        required
                        placeholder="100 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    {t.contact.email} ({t.contact.optional})
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                {/* Fitness Goal */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    {t.checkout.fitnessGoalLabel || t.checkout.goalLabel || (isRTL ? 'الهدف الرياضي الأساسي' : 'Primary Fitness Goal')}
                  </label>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  >
                    <option value="Fat Loss & Shredding">
                      {t.checkout.goals?.fatLoss || t.checkout.goalFatLoss || (isRTL ? 'حرق الدهون ونحت القوام' : 'Fat Loss & Shredding')}
                    </option>
                    <option value="Muscle Building & Hypertrophy">
                      {t.checkout.goals?.muscle || t.checkout.goalMuscleBuilding || (isRTL ? 'بناء وزيادة الكتلة العضلية' : 'Muscle Building & Hypertrophy')}
                    </option>
                    <option value="Strength & Athletic Conditioning">
                      {t.checkout.goals?.strength || t.checkout.goalStrength || (isRTL ? 'زيادة القوة والأداء الرياضي' : 'Strength & Athletic Performance')}
                    </option>
                    <option value="Complete Body Recomposition">
                      {t.checkout.goals?.recomp || t.checkout.goalBodyRecomposition || (isRTL ? 'إعادة تشكيل الجسم (خسارة دهون وبناء عضل معاً)' : 'Complete Body Recomposition')}
                    </option>
                  </select>
                </div>

                {/* Training Experience */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    {t.checkout.experienceLabel || (isRTL ? 'الخبرة التدريبية السابقة' : 'Training Experience')}
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2.5 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  >
                    <option value="Beginner (< 1 year)">
                      {t.checkout.exp?.beginner || t.checkout.expBeginner || (isRTL ? 'مبتدئ (أقل من سنة)' : 'Beginner (< 1 year)')}
                    </option>
                    <option value="Intermediate (1-3 years)">
                      {t.checkout.exp?.intermediate || t.checkout.expIntermediate || (isRTL ? 'متوسط (1 إلى 3 سنوات)' : 'Intermediate (1-3 years)')}
                    </option>
                    <option value="Advanced (3+ years)">
                      {t.checkout.exp?.advanced || t.checkout.expAdvanced || (isRTL ? 'متقدم (أكثر من 3 سنوات)' : 'Advanced (3+ years)')}
                    </option>
                  </select>
                </div>

                {/* Submit / WhatsApp CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FFE600] hover:bg-[#fff033] text-black font-heading font-black text-base sm:text-lg rounded-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,230,0,0.35)] disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>
                    {isSubmitting
                      ? (t.checkout.savingOrder || t.checkout.submittingBtn || (isRTL ? 'جاري حفظ بياناتك...' : 'SAVING REGISTRATION...'))
                      : `${t.checkout.proceedBtn || t.checkout.confirmBtn || (isRTL ? 'تأكيد التسجيل والمتابعة عبر واتساب' : 'CONFIRM & START ON WHATSAPP')} (${activeDuration?.formattedSellingPrice || currentPlan.price})`}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
