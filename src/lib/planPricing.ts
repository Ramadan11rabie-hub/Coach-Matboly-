import { MembershipPlan, PlanDurationPrice } from '../types/fitness';

export interface CalculatedDurationDiscount {
  id: string;
  months: number;
  label: string;
  labelAr: string;
  displayLabel: string;
  sellingPrice: number;
  regularPrice: number;
  discountAmount: number;
  discountPercentage: number;
  hasDiscount: boolean;
  formattedSellingPrice: string;
  formattedRegularPrice: string;
  strikethroughDisplay: string;
  formattedDiscountAmount: string;
  discountBadge: string;
  discountBadgeAr: string;
  isDefault?: boolean;
}

export function formatCurrency(amount: number, currency = 'EGP', isArabic = false): string {
  const formattedNumber = Number(amount || 0).toLocaleString();
  const cleanCurrency = (currency || 'EGP').trim();

  if (cleanCurrency === 'EGP' || cleanCurrency === 'ج.م' || cleanCurrency === 'LE' || cleanCurrency === 'EGP') {
    return isArabic ? `${formattedNumber} ج.م` : `${formattedNumber} EGP`;
  }
  if (cleanCurrency === '$' || cleanCurrency === 'USD') {
    return isArabic ? `${formattedNumber} $` : `$${formattedNumber}`;
  }
  if (cleanCurrency === 'SAR' || cleanCurrency === 'ر.س') {
    return isArabic ? `${formattedNumber} ر.س` : `${formattedNumber} SAR`;
  }
  if (cleanCurrency === 'AED' || cleanCurrency === 'د.إ') {
    return isArabic ? `${formattedNumber} د.إ` : `${formattedNumber} AED`;
  }
  return `${formattedNumber} ${cleanCurrency}`;
}

export function getDurationLabel(months: number, isArabic = false): string {
  if (isArabic) {
    if (months === 1) return 'شهر واحد';
    if (months === 2) return 'شهرين (2 شهر)';
    if (months >= 3 && months <= 10) return `${months} شهور`;
    if (months === 12) return 'سنة كاملة (12 شهر)';
    return `${months} شهر`;
  }
  if (months === 1) return '1 Month';
  if (months === 12) return '12 Months (1 Year)';
  return `${months} Months`;
}

export function getDefaultDurationPrices(baseOneMonthPrice = 500): PlanDurationPrice[] {
  const base = Math.max(1, baseOneMonthPrice || 500);
  return [
    {
      id: 'dur-1',
      months: 1,
      label: '1 Month',
      labelAr: 'شهر واحد',
      price: base,
      isDefault: false,
    },
    {
      id: 'dur-2',
      months: 2,
      label: '2 Months',
      labelAr: 'شهرين',
      price: Math.round(base * 1.8),
      isDefault: false,
    },
    {
      id: 'dur-3',
      months: 3,
      label: '3 Months',
      labelAr: '3 شهور',
      price: Math.round(base * 2.4),
      isDefault: true,
    },
    {
      id: 'dur-6',
      months: 6,
      label: '6 Months',
      labelAr: '6 شهور',
      price: Math.round(base * 4.4),
      isDefault: false,
    },
    {
      id: 'dur-12',
      months: 12,
      label: '12 Months',
      labelAr: 'سنة كاملة',
      price: Math.round(base * 8),
      isDefault: false,
    },
  ];
}

/**
 * Calculates regular price, discount amount, and discount percentage automatically.
 * Formula:
 * - Regular Price = 1-Month Price × Duration in Months
 * - Final Price = Selling Price entered by admin
 * - Discount = Regular Price - Final Price
 * - Discount % = Math.round((Discount / Regular Price) * 100)
 */
export function calculateDurationDiscount(
  durationMonths: number,
  sellingPrice: number,
  oneMonthPrice: number,
  currency = 'EGP',
  isArabic = false
): {
  regularPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  hasDiscount: boolean;
  formattedSellingPrice: string;
  formattedRegularPrice: string;
  strikethroughDisplay: string;
  formattedDiscountAmount: string;
  discountBadge: string;
  discountBadgeAr: string;
} {
  const safeMonths = Math.max(1, durationMonths || 1);
  const safeSelling = Math.max(0, sellingPrice || 0);
  const safeOneMonth = Math.max(0, oneMonthPrice || 0);

  // Regular price = 1 month price * months
  const regularPrice = Math.round(safeOneMonth * safeMonths);
  const finalPrice = safeSelling;

  // Discount is calculated only if regularPrice > finalPrice
  const discountAmount = regularPrice > finalPrice ? regularPrice - finalPrice : 0;
  const discountPercentage =
    regularPrice > 0 && discountAmount > 0
      ? Math.round((discountAmount / regularPrice) * 100)
      : 0;

  const hasDiscount = discountAmount > 0 && discountPercentage > 0;

  const formattedSellingPrice = formatCurrency(finalPrice, currency, isArabic);
  const formattedRegularPrice = formatCurrency(regularPrice, currency, isArabic);
  // Display format requested: /1,500 EGP/
  const strikethroughDisplay = `/${formattedRegularPrice}/`;
  const formattedDiscountAmount = formatCurrency(discountAmount, currency, isArabic);

  return {
    regularPrice,
    finalPrice,
    discountAmount,
    discountPercentage,
    hasDiscount,
    formattedSellingPrice,
    formattedRegularPrice,
    strikethroughDisplay,
    formattedDiscountAmount,
    discountBadge: `${discountPercentage}% OFF`,
    discountBadgeAr: `خصم ${discountPercentage}%`,
  };
}

/**
 * Parses numeric price from any price string, e.g. "$149" -> 149, "1,200 EGP" -> 1200
 */
export function parseNumericPrice(priceStr?: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Returns the 1-month selling price used as the baseline for all duration calculations.
 */
export function getPlanOneMonthPrice(plan: Partial<MembershipPlan>): number {
  if (plan.durationPrices && plan.durationPrices.length > 0) {
    const oneMonth = plan.durationPrices.find((d) => d.months === 1);
    if (oneMonth && oneMonth.price > 0) {
      return oneMonth.price;
    }
    // If no 1-month explicitly, approximate unit price from the lowest duration
    const sorted = [...plan.durationPrices].sort((a, b) => a.months - b.months);
    if (sorted[0] && sorted[0].months > 0 && sorted[0].price > 0) {
      return Math.round(sorted[0].price / sorted[0].months);
    }
  }

  // Fallback to legacy plan price
  const num = parseNumericPrice(plan.price);
  return num > 0 ? num : 500;
}

/**
 * Returns all calculated durations with discount details for a plan.
 */
export function getPlanCalculatedDurations(
  plan: MembershipPlan,
  isArabic = false
): CalculatedDurationDiscount[] {
  const currency = plan.currency || 'EGP';
  let durations = plan.durationPrices;

  if (!durations || durations.length === 0) {
    // Generate default durations with legacy values
    const basePrice = parseNumericPrice(plan.price) || 500;
    durations = [
      { id: 'dur-1', months: 1, label: '1 Month', labelAr: 'شهر واحد', price: basePrice },
      { id: 'dur-2', months: 2, label: '2 Months', labelAr: 'شهرين', price: Math.round(basePrice * 1.8) },
      { id: 'dur-3', months: 3, label: '3 Months', labelAr: '3 شهور', price: Math.round(basePrice * 2.4), isDefault: true },
      { id: 'dur-6', months: 6, label: '6 Months', labelAr: '6 شهور', price: Math.round(basePrice * 4.4) },
      { id: 'dur-12', months: 12, label: '12 Months', labelAr: 'سنة كاملة', price: Math.round(basePrice * 8) },
    ];
  }

  const oneMonthPrice = getPlanOneMonthPrice({ ...plan, durationPrices: durations });

  return durations.map((d) => {
    const calc = calculateDurationDiscount(d.months, d.price, oneMonthPrice, currency, isArabic);
    const displayLabel = isArabic ? (d.labelAr || getDurationLabel(d.months, true)) : (d.label || getDurationLabel(d.months, false));

    return {
      id: d.id,
      months: d.months,
      label: d.label || getDurationLabel(d.months, false),
      labelAr: d.labelAr || getDurationLabel(d.months, true),
      displayLabel,
      sellingPrice: calc.finalPrice,
      regularPrice: calc.regularPrice,
      discountAmount: calc.discountAmount,
      discountPercentage: calc.discountPercentage,
      hasDiscount: calc.hasDiscount,
      formattedSellingPrice: calc.formattedSellingPrice,
      formattedRegularPrice: calc.formattedRegularPrice,
      strikethroughDisplay: calc.strikethroughDisplay,
      formattedDiscountAmount: calc.formattedDiscountAmount,
      discountBadge: calc.discountBadge,
      discountBadgeAr: calc.discountBadgeAr,
      isDefault: d.isDefault,
    };
  });
}

/**
 * Normalizes a MembershipPlan, ensuring durationPrices is clean and synchronized.
 */
export function normalizePlan(plan: MembershipPlan): MembershipPlan {
  const currency = plan.currency || 'EGP';
  let durationPrices = Array.isArray(plan.durationPrices) && plan.durationPrices.length > 0
    ? [...plan.durationPrices]
    : getDefaultDurationPrices();

  // Sort durations ascending by months
  durationPrices.sort((a, b) => a.months - b.months);

  // Find 1-month price
  const oneMonthPrice = getPlanOneMonthPrice({ ...plan, durationPrices });

  // Find default duration (or 3-month or first)
  const defaultDuration =
    durationPrices.find((d) => d.isDefault) ||
    durationPrices.find((d) => d.months === 3) ||
    durationPrices[0];

  const calcDefault = calculateDurationDiscount(
    defaultDuration.months,
    defaultDuration.price,
    oneMonthPrice,
    currency,
    false
  );

  const effectivePrice = (plan.price && String(plan.price).trim().length > 0)
    ? plan.price
    : calcDefault.formattedSellingPrice;

  return {
    ...plan,
    currency,
    durationPrices,
    defaultDurationMonths: defaultDuration.months,
    duration: plan.duration || defaultDuration.label,
    price: effectivePrice,
    originalPrice: plan.originalPrice !== undefined ? plan.originalPrice : (calcDefault.hasDiscount ? calcDefault.formattedRegularPrice : undefined),
    imageUrl: plan.imageUrl || plan.image || undefined,
    image: plan.imageUrl || plan.image || undefined,
  };
}
