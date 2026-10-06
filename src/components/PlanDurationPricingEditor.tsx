import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Check,
  Star,
  Eye,
  Info,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { MembershipPlan, PlanDurationPrice } from '../types/fitness';
import {
  calculateDurationDiscount,
  formatCurrency,
  getDurationLabel,
  getPlanOneMonthPrice,
  getDefaultDurationPrices,
} from '../lib/planPricing';

interface PlanDurationPricingEditorProps {
  plan: MembershipPlan;
  onChangePlan: (updatedPlan: MembershipPlan) => void;
  isRTL?: boolean;
}

export const PlanDurationPricingEditor: React.FC<PlanDurationPricingEditorProps> = ({
  plan,
  onChangePlan,
  isRTL = true,
}) => {
  const currency = plan.currency || 'EGP';

  // Ensure durationPrices exists and has items
  const durations: PlanDurationPrice[] =
    Array.isArray(plan.durationPrices) && plan.durationPrices.length > 0
      ? plan.durationPrices
      : getDefaultDurationPrices();

  // Find 1-month base price
  const oneMonthPrice = getPlanOneMonthPrice({ ...plan, durationPrices: durations });

  // Custom duration state for adding any other available durations
  const [customMonths, setCustomMonths] = useState<number>(4);
  const [customPrice, setCustomPrice] = useState<number>(1400);

  // Preview selected duration
  const defaultDur = durations.find((d) => d.isDefault) || durations.find((d) => d.months === 3) || durations[0];
  const [previewDurationId, setPreviewDurationId] = useState<string>(defaultDur?.id || durations[0]?.id || 'dur-3');

  const updateDurations = (newDurations: PlanDurationPrice[]) => {
    // Sort ascending by months
    newDurations.sort((a, b) => a.months - b.months);

    // Make sure at least one is default
    if (!newDurations.some((d) => d.isDefault) && newDurations.length > 0) {
      newDurations[0].isDefault = true;
    }

    // Recalculate default duration and update plan legacy fields
    const activeDefault = newDurations.find((d) => d.isDefault) || newDurations[0];
    const newOneMonth = getPlanOneMonthPrice({ ...plan, durationPrices: newDurations });
    const defaultCalc = calculateDurationDiscount(
      activeDefault.months,
      activeDefault.price,
      newOneMonth,
      currency,
      isRTL
    );

    onChangePlan({
      ...plan,
      currency,
      durationPrices: newDurations,
      defaultDurationMonths: activeDefault.months,
      duration: activeDefault.label,
      price: defaultCalc.formattedSellingPrice,
      originalPrice: defaultCalc.hasDiscount ? defaultCalc.formattedRegularPrice : undefined,
    });
  };

  const handlePriceChange = (durId: string, newPriceValue: number) => {
    const safePrice = Math.max(0, newPriceValue);
    const updated = durations.map((d) => (d.id === durId ? { ...d, price: safePrice } : d));
    updateDurations(updated);
  };

  const handleSetDefault = (durId: string) => {
    const updated = durations.map((d) => ({
      ...d,
      isDefault: d.id === durId,
    }));
    updateDurations(updated);
  };

  const handleDeleteDuration = (durId: string) => {
    if (durations.length <= 1) {
      alert('يجب الإبقاء على مدة اشتراك واحدة على الأقل.');
      return;
    }
    const updated = durations.filter((d) => d.id !== durId);
    updateDurations(updated);
  };

  const handleAddStandardDuration = (monthsToAdd: number) => {
    if (durations.some((d) => d.months === monthsToAdd)) {
      return;
    }
    // Estimate reasonable price with discount
    const estimatedPrice =
      monthsToAdd === 1
        ? oneMonthPrice || 500
        : Math.round(oneMonthPrice * monthsToAdd * 0.8);

    const newDur: PlanDurationPrice = {
      id: `dur-${monthsToAdd}-${Date.now()}`,
      months: monthsToAdd,
      label: getDurationLabel(monthsToAdd, false),
      labelAr: getDurationLabel(monthsToAdd, true),
      price: estimatedPrice,
      isDefault: false,
    };

    updateDurations([...durations, newDur]);
  };

  const handleAddCustomDuration = () => {
    if (customMonths <= 0) return;
    if (durations.some((d) => d.months === customMonths)) {
      alert(`المدة (${customMonths} شهر) مضافة بالفعل.`);
      return;
    }

    const newDur: PlanDurationPrice = {
      id: `dur-${customMonths}-${Date.now()}`,
      months: customMonths,
      label: getDurationLabel(customMonths, false),
      labelAr: getDurationLabel(customMonths, true),
      price: customPrice,
      isDefault: false,
    };

    updateDurations([...durations, newDur]);
  };

  // Preview active calculation
  const activePreviewDur = durations.find((d) => d.id === previewDurationId) || durations[0];
  const activePreviewCalc = calculateDurationDiscount(
    activePreviewDur?.months || 1,
    activePreviewDur?.price || 0,
    oneMonthPrice,
    currency,
    isRTL
  );

  return (
    <div className="bg-[#121212] border border-neutral-700/80 rounded-lg p-4 sm:p-5 space-y-5">
      {/* Top Banner explaining the automatic discount engine */}
      <div className="bg-gradient-to-r from-neutral-900 to-black p-3.5 rounded border border-[#FFE600]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#FFE600] text-black font-black flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 fill-black" />
          </div>
          <div>
            <h5 className="font-heading font-black text-sm text-[#FFE600] uppercase tracking-wider">
              نظام تسعير المدد وحساب الخصم التلقائي (Automatic Discount System)
            </h5>
            <p className="text-[11px] text-neutral-300">
              أدخل سعر البيع الفعلي لكل مدة (شهر، شهرين، 3 شهور، إلخ). يقوم النظام تلقائياً وبشكل فوري بحساب السعر الأصلي (سعر شهر × عدد الشهور) ونسبة الخصم (OFF %) بدون أي إدخال يدوي.
            </p>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <label className="text-[11px] font-bold text-neutral-300">العملة:</label>
          <select
            value={currency}
            onChange={(e) => {
              const newCur = e.target.value;
              onChangePlan({ ...plan, currency: newCur });
            }}
            className="bg-black border border-neutral-700 rounded px-2.5 py-1 text-xs text-[#FFE600] font-bold focus:border-[#FFE600] focus:outline-none"
          >
            <option value="EGP">EGP (جنيه مصري)</option>
            <option value="USD">$ (دولار أمريكي)</option>
            <option value="SAR">SAR (ريال سعودي)</option>
            <option value="AED">AED (درهم إماراتي)</option>
          </select>
        </div>
      </div>

      {/* 1 Month Unit Price Indicator */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#FFE600] shrink-0" />
          <span className="text-neutral-300 font-medium">
            سعر الأساس لحساب الخصومات (سعر الشهر الواحد):
          </span>
          <span className="font-heading font-black text-sm text-[#FFE600]">
            {formatCurrency(oneMonthPrice, currency, isRTL)}
          </span>
        </div>
        <span className="text-[11px] text-neutral-400">
          * يتم حساب السعر الأصلي لأي مدة = ({oneMonthPrice} {currency} × عدد الشهور)
        </span>
      </div>

      {/* Durations Table / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black text-white uppercase tracking-wider">
            قائمة مدد الاشتراك والأسعار المتاحة للباقة ({durations.length} مدد):
          </label>
          <span className="text-[10px] text-neutral-400">
            السعر المدخل هنا هو سعر البيع الفعلي المعروض للمستخدم
          </span>
        </div>

        <div className="space-y-2.5">
          {durations.map((dur) => {
            const isOneMonth = dur.months === 1;
            const calc = calculateDurationDiscount(
              dur.months,
              dur.price,
              oneMonthPrice,
              currency,
              isRTL
            );

            return (
              <div
                key={dur.id}
                className={`p-3.5 rounded border transition-all ${
                  dur.isDefault
                    ? 'bg-neutral-900/90 border-[#FFE600]/80 shadow-[0_0_15px_rgba(255,230,0,0.1)]'
                    : 'bg-black/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Duration Label & Months */}
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <div className="w-7 h-7 rounded bg-neutral-800 text-[#FFE600] flex items-center justify-center font-heading font-black text-xs shrink-0">
                      {dur.months}M
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-black text-sm text-white">
                          {isRTL ? dur.labelAr || getDurationLabel(dur.months, true) : dur.label}
                        </span>
                        {dur.isDefault && (
                          <span className="bg-[#FFE600] text-black text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                            الافتراضي
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {dur.months} {dur.months === 1 ? 'Month' : 'Months'}
                      </span>
                    </div>
                  </div>

                  {/* Selling Price Input */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-neutral-300 shrink-0">
                      سعر البيع الفعلي:
                    </label>
                    <div className="relative w-36">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={dur.price === 0 ? '' : dur.price}
                        onChange={(e) => handlePriceChange(dur.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-black border border-neutral-700 focus:border-[#FFE600] rounded px-3 py-1.5 text-sm text-[#FFE600] font-heading font-black text-left focus:outline-none"
                      />
                      <span className="absolute left-2 top-1.5 text-xs text-neutral-500 font-bold pointer-events-none">
                        {currency}
                      </span>
                    </div>
                  </div>

                  {/* Automatic Calculations Breakdown */}
                  <div className="flex-1 bg-neutral-900/60 p-2 rounded border border-neutral-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {isOneMonth ? (
                      <span className="text-neutral-400 text-[11px]">
                        هذا هو السعر الأساسي (500 EGP / شهر). لا يوجد خصم على الشهر الفردي.
                      </span>
                    ) : (
                      <>
                        <div className="text-neutral-400">
                          <span>السعر الأصلي: </span>
                          <span className="line-through text-neutral-300 font-bold">
                            /{calc.formattedRegularPrice}/
                          </span>
                        </div>
                        <div className="text-white font-medium">
                          <span>سعر البيع: </span>
                          <span className="text-[#FFE600] font-black">{calc.formattedSellingPrice}</span>
                        </div>
                        {calc.hasDiscount ? (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-[#FFE600] text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                              {calc.discountBadge}
                            </span>
                            <span className="text-neutral-300 text-[11px] font-bold">
                              (خصم {calc.formattedDiscountAmount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">
                            (لا يوجد خصم - السعر مساوٍ أو أكبر من سعر الأساس)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions: Set Default & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    {!dur.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(dur.id)}
                        className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-[#FFE600] rounded text-[11px] text-neutral-300 hover:text-white cursor-pointer"
                        title="تعيين كمدة افتراضية تظهر أولاً للعميل"
                      >
                        تعيين كافتراضي
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={durations.length <= 1}
                      onClick={() => handleDeleteDuration(dur.id)}
                      className="p-1.5 bg-red-950/40 border border-red-800/80 hover:bg-red-900 text-red-300 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                      title="حذف هذه المدة من الباقة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add More Durations Bar */}
      <div className="bg-black/60 p-3.5 rounded border border-neutral-800 space-y-3">
        <label className="block text-xs font-bold text-neutral-300">
          إضافة مدد اشتراك أخرى للباقة:
        </label>

        {/* Quick add standard durations */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-neutral-400">إضافة مدة شائعة بنقرة واحدة:</span>
          {[1, 2, 3, 6, 12].map((m) => {
            const alreadyExists = durations.some((d) => d.months === m);
            if (alreadyExists) return null;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleAddStandardDuration(m)}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-[#FFE600] text-xs font-bold text-neutral-200 hover:text-[#FFE600] rounded cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{getDurationLabel(m, isRTL)}</span>
              </button>
            );
          })}
        </div>

        {/* Custom duration input */}
        <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-neutral-400">أو إضافة مدة مخصصة:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="60"
              value={customMonths}
              onChange={(e) => setCustomMonths(parseInt(e.target.value) || 1)}
              className="w-16 bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-white text-center"
              placeholder="الشهور"
            />
            <span className="text-xs text-neutral-400">شهر</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-400">بسعر:</span>
            <input
              type="number"
              min="0"
              value={customPrice}
              onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
              className="w-24 bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-[#FFE600] font-bold text-center"
              placeholder="السعر"
            />
            <span className="text-xs text-neutral-400">{currency}</span>
          </div>

          <button
            type="button"
            onClick={handleAddCustomDuration}
            className="px-3 py-1 bg-[#FFE600] hover:bg-[#fff033] text-black font-heading font-black text-xs rounded cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة المدة المخصصة</span>
          </button>
        </div>
      </div>

      {/* LIVE WEBSITE PREVIEW CARD */}
      <div className="bg-[#0b0b0b] border-2 border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FFE600]" />
            <h6 className="font-heading font-black text-xs text-white uppercase tracking-wider">
              معاينة طريقة العرض الحية على الموقع (Live Website Card Preview)
            </h6>
          </div>
          <span className="text-[10px] text-neutral-400">
            تتحدث الأرقام والخصم تلقائياً فور كتابة أي سعر أعلاه
          </span>
        </div>

        {/* Duration selector tabs in preview */}
        <div className="flex flex-wrap gap-1.5">
          {durations.map((d) => {
            const isSelected = d.id === previewDurationId;
            const c = calculateDurationDiscount(d.months, d.price, oneMonthPrice, currency, isRTL);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setPreviewDurationId(d.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#FFE600] text-black font-black shadow-sm'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <span>{isRTL ? d.labelAr || getDurationLabel(d.months, true) : d.label}</span>
                {c.hasDiscount && (
                  <span
                    className={`text-[9px] font-black px-1 rounded ${
                      isSelected ? 'bg-black text-[#FFE600]' : 'bg-[#FFE600]/20 text-[#FFE600]'
                    }`}
                  >
                    {c.discountBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* The Exact User Requested Format:
            3 Months
            /1,500 EGP/
            1,200 EGP
            20% OFF
        */}
        <div className="bg-black/90 p-4 rounded border border-neutral-800/80 max-w-sm">
          <span className="text-[10px] font-bold text-[#FFE600] uppercase tracking-wider block">
            {plan.name || 'STARTER PASS'}
          </span>

          <div className="mt-2">
            {/* 1. Duration Title: e.g. 3 Months */}
            <h4 className="font-heading font-black text-2xl text-white uppercase tracking-wide">
              {activePreviewDur ? (isRTL ? activePreviewDur.labelAr || getDurationLabel(activePreviewDur.months, true) : activePreviewDur.label) : '3 Months'}
            </h4>

            {/* 2. Regular Price: /1,500 EGP/ (Strikethrough) */}
            {activePreviewCalc.hasDiscount ? (
              <div className="mt-1">
                <span className="text-sm font-bold text-neutral-500 line-through">
                  {activePreviewCalc.strikethroughDisplay}
                </span>
              </div>
            ) : null}

            {/* 3. Final Price: 1,200 EGP & 4. Discount Percentage: 20% OFF */}
            <div className="mt-1 flex items-baseline flex-wrap gap-2.5">
              <span className="font-heading font-black text-3xl text-[#FFE600] tracking-tight">
                {activePreviewCalc.formattedSellingPrice}
              </span>

              {activePreviewCalc.hasDiscount && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-[#FFE600] text-black shadow-sm uppercase">
                  {isRTL ? activePreviewCalc.discountBadgeAr : activePreviewCalc.discountBadge}
                </span>
              )}
            </div>

            {/* Savings Callout */}
            {activePreviewCalc.hasDiscount && (
              <p className="text-[11px] font-bold text-neutral-400 mt-1">
                {isRTL
                  ? `وفرت ${activePreviewCalc.formattedDiscountAmount} مع باقة الـ ${activePreviewDur.labelAr || activePreviewDur.label}`
                  : `You save ${activePreviewCalc.formattedDiscountAmount}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
