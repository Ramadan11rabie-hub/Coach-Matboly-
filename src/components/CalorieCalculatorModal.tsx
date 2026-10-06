import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Flame,
  Zap,
  Target,
  Activity,
  Dumbbell,
  Droplet,
  Wheat,
  Scale,
  Ruler,
  Calendar,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  RotateCcw,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export interface CalorieCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinClick?: () => void;
  customTitle?: string;
  customSubtitle?: string;
  customCtaText?: string;
}

type Gender = 'male' | 'female';
type GoalType = 'cut' | 'aggressiveCut' | 'maintain' | 'bulk';

interface ActivityOption {
  key: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  multiplier: number;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { key: 'sedentary', multiplier: 1.2 },
  { key: 'light', multiplier: 1.375 },
  { key: 'moderate', multiplier: 1.55 },
  { key: 'very', multiplier: 1.725 },
  { key: 'extra', multiplier: 1.9 },
];

interface CalculationResults {
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  isKatchFormula: boolean;
  leanBodyMassKg: number | null;
  proteinGrams: number;
  proteinCalories: number;
  carbGrams: number;
  carbCalories: number;
  fatGrams: number;
  fatCalories: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  selectedGoal: GoalType;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
}

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  isOpen,
  onClose,
  onJoinClick,
  customTitle,
  customSubtitle,
  customCtaText,
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const heightId = useId();
  const weightId = useId();
  const ageId = useId();
  const bodyFatId = useId();

  // Inputs state - NO PRE-FILLED OR DEFAULT DATA
  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [activityMultiplier, setActivityMultiplier] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('cut');

  // Calculation results state - ONLY POPULATED WHEN USER CLICKS "CALCULATE"
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset all fields completely
  const handleReset = () => {
    setGender(null);
    setHeight('');
    setWeight('');
    setAge('');
    setBodyFat('');
    setActivityMultiplier(null);
    setSelectedGoal('cut');
    setResults(null);
    setValidationError(null);
  };

  const calcT = t.calculator;

  // Perform calculation ONLY when user clicks the Calculate button
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Gender
    if (!gender) {
      setValidationError(
        calcT.selectGenderPrompt ||
          (isRTL ? 'يرجى اختيار الجنس (ذكر أو أنثى).' : 'Please select your gender (Male or Female).')
      );
      return;
    }

    // 2. Validate Age
    if (age === '' || typeof age !== 'number' || isNaN(age) || age < 12 || age > 110) {
      setValidationError(
        isRTL
          ? 'يرجى إدخال عمر صحيح بين 12 و 110 سنة.'
          : 'Please enter a valid age between 12 and 110 years.'
      );
      return;
    }

    // 3. Validate Height
    if (height === '' || typeof height !== 'number' || isNaN(height) || height < 90 || height > 250) {
      setValidationError(
        isRTL
          ? 'يرجى إدخال طول صحيح بين 90 و 250 سم.'
          : 'Please enter a valid height between 90 and 250 cm.'
      );
      return;
    }

    // 4. Validate Weight
    if (weight === '' || typeof weight !== 'number' || isNaN(weight) || weight < 30 || weight > 350) {
      setValidationError(
        isRTL
          ? 'يرجى إدخال وزن صحيح بين 30 و 350 كجم.'
          : 'Please enter a valid weight between 30 and 350 kg.'
      );
      return;
    }

    // 5. Validate Activity Multiplier
    if (!activityMultiplier) {
      setValidationError(
        calcT.selectActivityPrompt ||
          (isRTL ? 'يرجى اختيار مستوى النشاط اليومي.' : 'Please select your daily activity level.')
      );
      return;
    }

    // Validation passed: clear error and calculate
    setValidationError(null);

    const w = weight;
    const h = height;
    const a = age;

    const parsedBodyFat =
      typeof bodyFat === 'number' && !isNaN(bodyFat) && bodyFat >= 3 && bodyFat <= 60
        ? bodyFat
        : null;

    // Calculation Logic based ONLY on entered data:
    let bmrVal: number;
    let isKatchFormula = false;
    let leanBodyMassKg: number | null = null;

    if (parsedBodyFat !== null) {
      isKatchFormula = true;
      leanBodyMassKg = Math.round(w * (1 - parsedBodyFat / 100) * 10) / 10;
      bmrVal = Math.round(370 + 21.6 * leanBodyMassKg);
    } else {
      if (gender === 'male') {
        bmrVal = Math.round(10 * w + 6.25 * h - 5 * a + 5);
      } else {
        bmrVal = Math.round(10 * w + 6.25 * h - 5 * a - 161);
      }
    }

    // TDEE
    const tdeeVal = Math.round(bmrVal * activityMultiplier);

    // Goal adjustment
    let goalMultiplier = 0.8; // Cut (-20%)
    if (selectedGoal === 'aggressiveCut') goalMultiplier = 0.75; // Aggressive Cut (-25%)
    if (selectedGoal === 'maintain') goalMultiplier = 1.0; // Maintenance
    if (selectedGoal === 'bulk') goalMultiplier = 1.1; // Lean Hypertrophy (+10%)

    const rawTargetCalories = Math.round(tdeeVal * goalMultiplier);
    const minSafeCalories = gender === 'female' ? 1200 : 1450;
    const recommendedCalories = Math.max(minSafeCalories, rawTargetCalories);

    // Macronutrients:
    // Protein: 2.0g per kg (or 2.2g per kg LBM if body fat known)
    const proteinGrams = Math.round(
      leanBodyMassKg !== null ? leanBodyMassKg * 2.2 : w * 2.0
    );
    const proteinCalories = proteinGrams * 4;

    // Fats: 25% of calories
    const fatCalories = Math.round(recommendedCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);

    // Carbohydrates: remaining calories
    const remainingCarbCalories = Math.max(
      0,
      recommendedCalories - (proteinCalories + fatCalories)
    );
    const carbGrams = Math.round(remainingCarbCalories / 4);

    // Visual percentages
    const totalMacroCalories =
      proteinCalories + fatCalories + remainingCarbCalories || recommendedCalories;
    const proteinPercent = Math.round((proteinCalories / totalMacroCalories) * 100);
    const fatPercent = Math.round((fatCalories / totalMacroCalories) * 100);
    const carbPercent = Math.max(0, 100 - proteinPercent - fatPercent);

    setResults({
      bmr: bmrVal,
      tdee: tdeeVal,
      recommendedCalories,
      isKatchFormula,
      leanBodyMassKg,
      proteinGrams,
      proteinCalories,
      carbGrams,
      carbCalories: remainingCarbCalories,
      fatGrams,
      fatCalories,
      proteinPercent,
      carbPercent,
      fatPercent,
      selectedGoal,
      gender,
      age: a,
      height: h,
      weight: w,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="calorie-calculator-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
          aria-labelledby="calculator-modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-5xl bg-[#111111] border-2 border-[#FFE600]/40 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_25px_rgba(255,230,0,0.15)] overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-[#161616] border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#FFE600] text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                  <Calculator className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      id="calculator-modal-title"
                      className="font-heading font-black text-lg sm:text-xl text-white uppercase tracking-tight"
                    >
                      {customTitle || calcT.sectionTitle}
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE600]/10 border border-[#FFE600]/30 text-[10px] font-bold text-[#FFE600] uppercase">
                      <Sparkles className="w-3 h-3 text-[#FFE600]" />
                      {calcT.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block line-clamp-1">
                    {customSubtitle || calcT.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:border-[#FFE600] text-neutral-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title={calcT.resetBtn || (isRTL ? 'مسح البيانات' : 'Clear Data')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{calcT.resetBtn || (isRTL ? 'مسح البيانات' : 'Clear')}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 hover:border-[#FFE600] hover:bg-[#FFE600] text-neutral-400 hover:text-black flex items-center justify-center transition-all cursor-pointer"
                  aria-label={isRTL ? 'إغلاق' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Two-Column Responsive Layout */}
            <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
              <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                
                {/* LEFT / FIRST COLUMN: Form Inputs (7 cols on lg) */}
                <div className="lg:col-span-7 space-y-5 bg-[#0d0d0d] p-4 sm:p-6 rounded-md border border-neutral-800">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="text-xs font-heading font-black text-[#FFE600] uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      {isRTL ? 'البيانات الشخصية والقياسات' : 'Personal Data & Measurements'}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {isRTL ? 'أدخل بياناتك أولاً' : 'Enter Your Details'}
                    </span>
                  </div>

                  {/* 1. Gender */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      {calcT.genderLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setGender('male');
                          setValidationError(null);
                        }}
                        className={`py-3 px-4 rounded border font-heading font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                          gender === 'male'
                            ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.3)]'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <span className="text-base font-bold">♂</span>
                        <span>{calcT.male}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGender('female');
                          setValidationError(null);
                        }}
                        className={`py-3 px-4 rounded border font-heading font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                          gender === 'female'
                            ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.3)]'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <span className="text-base font-bold">♀</span>
                        <span>{calcT.female}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2 & 3. Age & Height */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={ageId}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#FFE600]" />
                        <span>{calcT.ageLabel}</span>
                        <span className="text-red-500">*</span>
                        <span className="text-neutral-500 font-normal">({calcT.ageUnit})</span>
                      </label>
                      <div className="relative">
                        <input
                          id={ageId}
                          type="number"
                          min={12}
                          max={110}
                          inputMode="numeric"
                          value={age}
                          onChange={(e) => {
                            setAge(e.target.value === '' ? '' : Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded text-sm font-bold focus:outline-none transition-colors placeholder:text-neutral-600"
                          placeholder={isRTL ? 'أدخل العمر' : 'Enter age'}
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold uppercase pointer-events-none">
                          {calcT.ageUnit}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={heightId}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5"
                      >
                        <Ruler className="w-3.5 h-3.5 text-[#FFE600]" />
                        <span>{calcT.heightLabel}</span>
                        <span className="text-red-500">*</span>
                        <span className="text-neutral-500 font-normal">({calcT.heightUnit})</span>
                      </label>
                      <div className="relative">
                        <input
                          id={heightId}
                          type="number"
                          min={90}
                          max={250}
                          inputMode="numeric"
                          value={height}
                          onChange={(e) => {
                            setHeight(e.target.value === '' ? '' : Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded text-sm font-bold focus:outline-none transition-colors placeholder:text-neutral-600"
                          placeholder={isRTL ? 'أدخل الطول بالسم' : 'Enter height in cm'}
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold uppercase pointer-events-none">
                          {calcT.heightUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 & 5. Weight & Body Fat % (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={weightId}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#FFE600]" />
                        <span>{calcT.weightLabel}</span>
                        <span className="text-red-500">*</span>
                        <span className="text-neutral-500 font-normal">({calcT.weightUnit})</span>
                      </label>
                      <div className="relative">
                        <input
                          id={weightId}
                          type="number"
                          min={30}
                          max={350}
                          inputMode="decimal"
                          value={weight}
                          onChange={(e) => {
                            setWeight(e.target.value === '' ? '' : Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded text-sm font-bold focus:outline-none transition-colors placeholder:text-neutral-600"
                          placeholder={isRTL ? 'أدخل الوزن بالكجم' : 'Enter weight in kg'}
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold uppercase pointer-events-none">
                          {calcT.weightUnit}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={bodyFatId}
                        className="flex items-center justify-between text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5"
                      >
                        <span className="flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-[#FFE600]" />
                          <span>{calcT.bodyFatLabel}</span>
                        </span>
                        <span className="text-[10px] text-[#FFE600] bg-[#FFE600]/10 px-1.5 py-0.5 rounded border border-[#FFE600]/20 font-bold">
                          {calcT.bodyFatOptional}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          id={bodyFatId}
                          type="number"
                          min={3}
                          max={60}
                          step="0.5"
                          inputMode="decimal"
                          value={bodyFat}
                          onChange={(e) => {
                            setBodyFat(e.target.value === '' ? '' : Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded text-sm font-bold focus:outline-none transition-colors placeholder:text-neutral-600"
                          placeholder={isRTL ? 'اختياري (مثال: 15)' : 'Optional (e.g. 15)'}
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Fat Helper Callout */}
                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800/80 text-[11px] leading-relaxed text-neutral-400 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#FFE600] shrink-0 mt-0.5" />
                    <p>{calcT.bodyFatHint}</p>
                  </div>

                  {/* 6. Activity Level */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      {calcT.activityLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-1.5">
                      {ACTIVITY_OPTIONS.map((opt) => {
                        const info = calcT.activityLevels[opt.key];
                        const isSelected = activityMultiplier === opt.multiplier;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              setActivityMultiplier(opt.multiplier);
                              setValidationError(null);
                            }}
                            className={`w-full text-start p-2.5 sm:p-3 rounded border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-[#181818] border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.15)]'
                                : 'bg-black border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-heading font-bold text-xs sm:text-sm ${
                                    isSelected ? 'text-[#FFE600]' : 'text-white'
                                  }`}
                                >
                                  {info.label}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                                  ×{opt.multiplier}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                                {info.desc}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-[#FFE600] bg-[#FFE600]'
                                  : 'border-neutral-600'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7. Target Goal */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      {calcT.goalLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['cut', 'aggressiveCut', 'maintain', 'bulk'] as GoalType[]).map(
                        (goalKey) => {
                          const goalInfo = calcT.goals[goalKey];
                          const isSelected = selectedGoal === goalKey;
                          return (
                            <button
                              key={goalKey}
                              type="button"
                              onClick={() => setSelectedGoal(goalKey)}
                              className={`p-2.5 rounded border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                                isSelected
                                  ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.25)]'
                                  : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                              }`}
                            >
                              <span className="font-heading font-black text-xs uppercase tracking-tight block">
                                {goalInfo.label}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5 px-0.5">
                      {calcT.goals[selectedGoal].desc}
                    </p>
                  </div>

                  {/* VALIDATION ERROR BANNER */}
                  {validationError && (
                    <div className="p-3 bg-red-950/70 border border-red-800 rounded-md text-red-200 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="font-bold">{validationError}</span>
                    </div>
                  )}

                  {/* CLEAR "CALCULATE" BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-[#FFE600] hover:bg-[#fff033] active:scale-[0.99] text-black font-heading font-black text-base rounded uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(255,230,0,0.3)] hover:shadow-[0_0_35px_rgba(255,230,0,0.5)] cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <Calculator className="w-5 h-5 stroke-[2.5]" />
                      <span>{results ? (calcT.recalculateBtn || (isRTL ? 'إعادة الحساب وتحديث النتائج' : 'Recalculate Daily Needs')) : (calcT.calculateBtn || (isRTL ? 'احسب احتياجي اليومي الآن' : 'Calculate Daily Needs'))}</span>
                    </button>
                    <p className="text-[11px] text-neutral-500 text-center mt-2">
                      {isRTL
                        ? 'يتم الحساب بدقة بالاعتماد الكامل على قياساتك الشخصية فقط.'
                        : 'Calculated with medical accuracy based solely on your entered data.'}
                    </p>
                  </div>

                </div>

                {/* RIGHT / SECOND COLUMN: Calculated Output Results OR Awaiting State (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-4">
                  {results ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Primary Output Card */}
                      <div className="bg-gradient-to-b from-[#1b1b1b] to-[#111111] border-2 border-[#FFE600] rounded-md p-5 sm:p-6 shadow-[0_0_30px_rgba(255,230,0,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 end-0 bg-[#FFE600] text-black font-heading font-black text-[10px] px-3 py-1 uppercase tracking-widest rounded-es flex items-center gap-1 shadow-md">
                          <Target className="w-3 h-3 fill-current" />
                          <span>{calcT.goals[results.selectedGoal].label}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                          <Flame className="w-4 h-4 text-[#FFE600]" />
                          <span>{calcT.recommendedCaloriesLabel}</span>
                        </div>

                        <div className="flex items-baseline gap-2 my-2">
                          <span className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight text-shadow-[0_0_20px_rgba(255,230,0,0.35)]">
                            {results.recommendedCalories.toLocaleString()}
                          </span>
                          <span className="text-sm font-bold text-[#FFE600] uppercase">
                            {calcT.caloriesUnit}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                          {calcT.recommendedCaloriesDesc}
                        </p>

                        {/* BMR and TDEE Split */}
                        <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-neutral-800">
                          <div className="bg-black/80 border border-neutral-800 p-3 rounded">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                              <Flame className="w-3 h-3 text-[#FFE600]" />
                              <span>BMR</span>
                            </div>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="font-heading font-black text-xl text-white">
                                {results.bmr.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-neutral-400 uppercase">kcal</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2 leading-tight">
                              {calcT.bmrDesc}
                            </p>
                          </div>

                          <div className="bg-black/80 border border-neutral-800 p-3 rounded">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                              <Zap className="w-3 h-3 text-[#FFE600]" />
                              <span>TDEE</span>
                            </div>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="font-heading font-black text-xl text-white">
                                {results.tdee.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-neutral-400 uppercase">kcal</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2 leading-tight">
                              {calcT.tdeeDesc}
                            </p>
                          </div>
                        </div>

                        {/* Formula Indicator */}
                        <div className="mt-3.5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>{calcT.formulaUsed}</span>
                          <span className="font-bold text-[#FFE600] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#FFE600]" />
                            {results.isKatchFormula ? calcT.katchFormula : calcT.mifflinFormula}
                          </span>
                        </div>
                      </div>

                      {/* Macronutrient Breakdown in Grams */}
                      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-md p-5 sm:p-6 shadow-xl space-y-4">
                        <div>
                          <h4 className="font-heading font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-[#FFE600]" />
                            <span>{calcT.macrosTitle}</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">{calcT.macrosSubtitle}</p>
                        </div>

                        {/* Macro Percentage Distribution Bar */}
                        <div>
                          <div className="h-2.5 w-full rounded overflow-hidden flex bg-neutral-900 border border-neutral-800">
                            <div
                              style={{ width: `${results.proteinPercent}%` }}
                              className="bg-[#FFE600] transition-all duration-300"
                              title={`Protein: ${results.proteinPercent}%`}
                            />
                            <div
                              style={{ width: `${results.carbPercent}%` }}
                              className="bg-[#38bdf8] transition-all duration-300"
                              title={`Carbs: ${results.carbPercent}%`}
                            />
                            <div
                              style={{ width: `${results.fatPercent}%` }}
                              className="bg-[#f97316] transition-all duration-300"
                              title={`Fats: ${results.fatPercent}%`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 font-mono">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#FFE600]" /> {calcT.proteinLabel}{' '}
                              {results.proteinPercent}%
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> {calcT.carbsLabel}{' '}
                              {results.carbPercent}%
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#f97316]" /> {calcT.fatsLabel}{' '}
                              {results.fatPercent}%
                            </span>
                          </div>
                        </div>

                        {/* 3 Macro Cards in Grams */}
                        <div className="grid grid-cols-3 gap-2.5">
                          {/* Protein */}
                          <div className="bg-black border border-neutral-800 hover:border-[#FFE600]/40 p-2.5 sm:p-3 rounded text-center transition-all">
                            <div className="w-6 h-6 rounded bg-[#FFE600]/10 text-[#FFE600] flex items-center justify-center mx-auto mb-1.5">
                              <Dumbbell className="w-3 h-3 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-neutral-300 block truncate">
                              {calcT.proteinLabel}
                            </span>
                            <div className="mt-0.5">
                              <span className="font-heading font-black text-xl text-[#FFE600]">
                                {results.proteinGrams}
                              </span>
                              <span className="text-[9px] text-neutral-400 block font-bold uppercase">
                                {calcT.gramsUnit}
                              </span>
                            </div>
                            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">
                              {results.proteinCalories} kcal
                            </span>
                          </div>

                          {/* Carbs */}
                          <div className="bg-black border border-neutral-800 hover:border-[#38bdf8]/40 p-2.5 sm:p-3 rounded text-center transition-all">
                            <div className="w-6 h-6 rounded bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center mx-auto mb-1.5">
                              <Wheat className="w-3 h-3 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-neutral-300 block truncate">
                              {calcT.carbsLabel}
                            </span>
                            <div className="mt-0.5">
                              <span className="font-heading font-black text-xl text-[#38bdf8]">
                                {results.carbGrams}
                              </span>
                              <span className="text-[9px] text-neutral-400 block font-bold uppercase">
                                {calcT.gramsUnit}
                              </span>
                            </div>
                            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">
                              {results.carbCalories} kcal
                            </span>
                          </div>

                          {/* Fats */}
                          <div className="bg-black border border-neutral-800 hover:border-[#f97316]/40 p-2.5 sm:p-3 rounded text-center transition-all">
                            <div className="w-6 h-6 rounded bg-[#f97316]/10 text-[#f97316] flex items-center justify-center mx-auto mb-1.5">
                              <Droplet className="w-3 h-3 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-neutral-300 block truncate">
                              {calcT.fatsLabel}
                            </span>
                            <div className="mt-0.5">
                              <span className="font-heading font-black text-xl text-[#f97316]">
                                {results.fatGrams}
                              </span>
                              <span className="text-[9px] text-neutral-400 block font-bold uppercase">
                                {calcT.gramsUnit}
                              </span>
                            </div>
                            <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">
                              {results.fatCalories} kcal
                            </span>
                          </div>
                        </div>

                        {/* Join / Action CTA */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onJoinClick) onJoinClick();
                            }}
                            className="w-full py-3.5 bg-[#FFE600] hover:bg-[#fff033] active:scale-98 text-black font-heading font-black text-sm rounded uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,230,0,0.25)] hover:shadow-[0_0_25px_rgba(255,230,0,0.45)] cursor-pointer flex items-center justify-center gap-2 group"
                          >
                            <span>{customCtaText || calcT.ctaButton}</span>
                            <ArrowRight
                              className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                                isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''
                              }`}
                            />
                          </button>
                          <p className="text-[10px] text-neutral-500 text-center mt-2 leading-relaxed">
                            {calcT.ctaNote}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* AWAITING USER INPUT STATE: No calculated numbers shown until user clicks Calculate */
                    <div className="bg-[#0d0d0d] border border-neutral-800 rounded-md p-6 sm:p-8 text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-[#161616] border-2 border-neutral-800 flex items-center justify-center mx-auto text-[#FFE600] shadow-[0_0_20px_rgba(255,230,0,0.08)]">
                        <Calculator className="w-8 h-8 stroke-[2]" />
                      </div>

                      <div className="max-w-sm mx-auto">
                        <h4 className="font-heading font-black text-lg text-white uppercase tracking-tight">
                          {calcT.awaitingTitle || (isRTL ? 'بانتظار إدخال بياناتك الشخصية' : 'Enter Your Measurements')}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                          {calcT.awaitingDesc ||
                            (isRTL
                              ? 'أدخل قياساتك على اليمين ثم اضغط على زر "احسب احتياجي اليومي الآن" لتوليد نتائجك وسعراتك والماكروز بدقة.'
                              : 'Fill in your stats on the left and click "Calculate Daily Needs" to reveal your personalized caloric targets, BMR, TDEE, and macro breakdown.')}
                        </p>
                      </div>

                      {/* Preview of what will be calculated */}
                      <div className="grid grid-cols-2 gap-3 pt-2 text-start">
                        <div className="p-3 bg-black/60 border border-neutral-800/80 rounded">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                            <Flame className="w-3.5 h-3.5 text-[#FFE600]" />
                            <span>BMR</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-300 block mt-1">
                            {isRTL ? 'معدل الحرق الأساسي' : 'Basal Metabolism'}
                          </span>
                        </div>

                        <div className="p-3 bg-black/60 border border-neutral-800/80 rounded">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                            <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
                            <span>TDEE</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-300 block mt-1">
                            {isRTL ? 'الحرق اليومي بالنشاط' : 'Daily Energy Burn'}
                          </span>
                        </div>

                        <div className="p-3 bg-black/60 border border-neutral-800/80 rounded">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                            <Target className="w-3.5 h-3.5 text-[#FFE600]" />
                            <span>Calories</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-300 block mt-1">
                            {isRTL ? 'السعرات المستهدفة' : 'Goal Daily Calories'}
                          </span>
                        </div>

                        <div className="p-3 bg-black/60 border border-neutral-800/80 rounded">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                            <Dumbbell className="w-3.5 h-3.5 text-[#FFE600]" />
                            <span>Macros</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-300 block mt-1">
                            {isRTL ? 'جرامات البروتين والكارب' : 'Protein, Carbs, Fats'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600]" />
                        <span>
                          {isRTL
                            ? 'لا توجد قيم مسبقة أو افتراضية تؤثر على النتيجة'
                            : 'Zero default values used — strictly calculated for you'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-7 py-3 bg-[#161616] border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse" />
                <span className="text-[11px]">
                  {isRTL
                    ? 'معادلات علمية معتمدة: ميفلين-سانت جيور وكاتش-ماكاردل'
                    : 'Validated Medical Formulas: Mifflin-St Jeor & Katch-McArdle'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
