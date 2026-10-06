import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Film,
  Calculator,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  DollarSign,
  User,
  HeartPulse,
  Share2,
  FileText,
  Sparkles,
  Users,
  MessageCircle,
  Phone,
  Calendar,
  Search,
  ExternalLink,
  Eye,
  Check,
  Clock,
  UserCheck,
  AlertCircle,
  LogOut,
  Image as ImageIcon,
  Save,
  Trophy,
  CreditCard,
} from 'lucide-react';
import { SiteConfig, ReelVideoItem, MembershipPlan, HealthierChoiceFeature, TransformationItem, TransformationsData, PlanDurationPrice } from '../types/fitness';
import { DEFAULT_SITE_CONFIG } from '../data/initialData';
import { CustomerRegistration } from '../types/customer';
import {
  getDefaultDurationPrices,
  getPlanCalculatedDurations,
  calculateDurationDiscount,
  getPlanOneMonthPrice,
  formatCurrency,
  getDurationLabel,
  normalizePlan,
} from '../lib/planPricing';
import { PlanDurationPricingEditor } from './PlanDurationPricingEditor';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  syncStatus?: 'synced' | 'saving' | 'error';
  hasSavedNotice?: boolean;
  config: SiteConfig;
  updateHero: (updates: Partial<SiteConfig['hero']>) => void;
  updateAbout: (updates: Partial<SiteConfig['about']>) => void;
  updateSubscription: (updates: Partial<SiteConfig['subscription']>) => void;
  updateCalculator?: (updates: Partial<NonNullable<SiteConfig['calculator']>>) => void;
  updatePlans: (updates: Partial<SiteConfig['plans']>) => void;
  updateTransformations?: (updates: Partial<SiteConfig['transformations']>, immediate?: boolean) => void;
  deleteTransformation?: (targetIdOrIndex: string | number) => Promise<{ success: boolean; error?: string }>;
  updateChoices?: (updates: Partial<SiteConfig['choices']>) => void;
  updateContact: (updates: Partial<SiteConfig['contact']>) => void;
  updateFooter: (updates: Partial<SiteConfig['footer']>) => void;
  updatePaymentInfo?: (updates: Partial<NonNullable<SiteConfig['paymentInfo']>>, immediate?: boolean) => void;
  saveAllChangesImmediately?: () => Promise<{ success: boolean; error?: string }>;
  resetToDefaults: () => void;
  exportConfigJSON: () => void;
  importConfigJSON: (jsonStr: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  customers: CustomerRegistration[];
  updateCustomerStatus: (customerId: string, status: CustomerRegistration['status']) => Promise<{ success: boolean }>;
  deleteCustomer: (customerId: string) => Promise<{ success: boolean }>;
}

type TabType = 'customers' | 'hero' | 'about' | 'calculator' | 'plans' | 'payment' | 'transformations' | 'choices' | 'contact' | 'footer' | 'backup';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onLogout,
  syncStatus = 'synced',
  hasSavedNotice = false,
  config,
  updateHero,
  updateAbout,
  updateSubscription,
  updateCalculator,
  updatePlans,
  updateTransformations,
  deleteTransformation,
  updateChoices,
  updateContact,
  updateFooter,
  updatePaymentInfo,
  saveAllChangesImmediately,
  resetToDefaults,
  exportConfigJSON,
  importConfigJSON,
  customers,
  updateCustomerStatus,
  deleteCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('customers');
  const [saveToast, setSaveToast] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmDeleteTransId, setConfirmDeleteTransId] = useState<string | null>(null);
  const [isDeletingTransId, setIsDeletingTransId] = useState<string | null>(null);

  // Customer Management Search & Filter states
  const [customerSearch, setCustomerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<CustomerRegistration | null>(null);

  if (!isOpen) return null;

  const triggerSaveNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Helper for image upload with automatic high-quality compression to ensure fast loading and reliable Firestore storage
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dataUrl: string) => void,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting same file triggers onChange
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const rawDataUrl = loadEvt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          callback(compressedDataUrl);
          triggerSaveNotification();
        } else {
          callback(rawDataUrl);
          triggerSaveNotification();
        }
      };
      img.onerror = () => {
        callback(rawDataUrl);
        triggerSaveNotification();
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Preset Vertical Fitness Video Options
  const PRESET_FITNESS_VIDEOS = [
    { label: 'تمارين أثقال وبار', url: 'https://assets.mixkit.co/videos/1199/1199-720.mp4' },
    { label: 'تدريب دمبل وبناء عضلات', url: 'https://assets.mixkit.co/videos/43666/43666-720.mp4' },
    { label: 'متابعة وتصحيح الأداء مع الكوتش', url: 'https://assets.mixkit.co/videos/34563/34563-720.mp4' },
    { label: 'كارديو وتحمل وحبال قتالية', url: 'https://assets.mixkit.co/videos/34567/34567-720.mp4' },
    { label: 'لياقة وسرعات هوائية', url: 'https://assets.mixkit.co/videos/41604/41604-720.mp4' },
  ];

  // Filter Customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.fullInternationalPhone.includes(customerSearch) ||
      c.selectedPlanName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.countryName.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCustomersCount = customers.filter((c) => c.status === 'new').length;

  // Function to generate and open WhatsApp conversation with Arabic confirmation message
  const handleOpenCustomerWhatsApp = (customer: CustomerRegistration) => {
    const cleanPhone = customer.fullInternationalPhone.replace(/[^0-9]/g, '');
    const arabicMessage = `مرحبًا ${customer.name} 👋
تم استلام طلب الاشتراك الخاص بك في باقة [${customer.selectedPlanName} - ${customer.selectedPlanDuration}].
سنتواصل معك لتأكيد الاشتراك وإتمام باقي الإجراءات.
شكرًا لاختيارك لنا 💪`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(arabicMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: CustomerRegistration['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE600] text-black animate-pulse">
            <Sparkles className="w-3 h-3" />
            عميل جديد
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Check className="w-3 h-3" />
            تم التأكيد
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <UserCheck className="w-3 h-3" />
            مشترك نشط
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <MessageCircle className="w-3 h-3" />
            تم التواصل
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 text-neutral-300">
            مكتمل
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-300 border border-red-800/40">
            ملغي
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 font-sans"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-[#121212] border border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-neutral-200 text-right">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0e0e0e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#FFE600] flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_12px_rgba(255,230,0,0.3)]">
              <Sliders className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-wide">
                  لوحة التحكم وإدارة الاشتراكات والعملاء
                </h2>
                {newCustomersCount > 0 && (
                  <span className="bg-[#FFE600] text-black text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
                    {newCustomersCount} طلب جديد
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                إدارة طلبات المشتركين، الرسائل المباشرة عبر واتساب، وتعديل كامل أقسام الموقع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {syncStatus === 'saving' ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#FFE600] font-bold bg-neutral-900 border border-[#FFE600]/40 px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-ping" />
                جاري الحفظ في السحابة...
              </span>
            ) : syncStatus === 'error' ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-950/80 border border-red-800/60 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                خطأ في المزامنة السحابية
              </span>
            ) : hasSavedNotice || saveToast ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#FFE600] font-bold bg-neutral-900 border border-[#FFE600]/40 px-3 py-1.5 rounded-full animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#FFE600]" />
                محفوظ في السحابة لجميع الزوار
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-neutral-900/90 border border-neutral-800 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                متصل بقاعدة البيانات المركزية
              </span>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-700 hover:border-red-500 hover:text-red-400 text-neutral-400 text-xs font-bold transition-colors cursor-pointer"
                title="تسجيل الخروج وقفل لوحة التحكم"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md bg-neutral-900 border border-neutral-700 hover:border-neutral-500 hover:text-white text-neutral-400 transition-colors cursor-pointer"
              title="إغلاق لوحة التحكم"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#161616] border-b border-neutral-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'customers', label: `العملاء والاشتراكات (${customers.length})`, icon: Users, isHighlight: true },
            { id: 'transformations', label: `قصص التحول (${config.transformations?.items?.length || 0})`, icon: Trophy, isHighlight: true },
            { id: 'calculator', label: 'حاسبة السعرات (Calculator)', icon: Calculator },
            { id: 'plans', label: 'باقات الاشتراك والأسعار', icon: DollarSign },
            { id: 'payment', label: 'طرق الدفع والتحويل (Payment)', icon: CreditCard, isHighlight: true },
            { id: 'hero', label: 'الواجهة الرئيسية (Hero)', icon: Sparkles },
            { id: 'about', label: 'عن كوتش المتبولي (About)', icon: User },
            { id: 'contact', label: 'التواصل والسوشيال ميديا', icon: Share2 },
            { id: 'footer', label: 'الفوتر والسياسات', icon: FileText },
            { id: 'backup', label: 'النسخ والضبط', icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFE600] text-black shadow-md font-black'
                    : tab.isHighlight && newCustomersCount > 0
                    ? 'bg-neutral-800 text-[#FFE600] border border-[#FFE600]/40'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'customers' && newCustomersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB: CUSTOMERS MANAGEMENT (العملاء والاشتراكات) */}
          {activeTab === 'customers' && (
            <div className="space-y-6 max-w-6xl">
              {/* Top Banner & Stats */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#FFE600] font-heading font-black text-xl">
                    <Users className="w-6 h-6" />
                    <span>إدارة العملاء وطلبات الاشتراكات المسجلة</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
                    جميع بيانات العملاء المسجلين من الموقع محفوظة بشكل دائم في قاعدة البيانات (Firebase Firestore). يمكنك مراجعة الباقة المختارة، وتغيير حالة الاشتراك، والتواصل المباشر عبر واتساب بضغطة زر مع رسالة تأكيد جاهزة.
                  </p>
                </div>

                {/* Quick Status Stats */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-black/60 border border-neutral-800 px-3 py-2 rounded text-center min-w-[80px]">
                    <span className="block text-xl font-heading font-black text-white">{customers.length}</span>
                    <span className="text-[10px] text-neutral-400 font-bold">إجمالي العملاء</span>
                  </div>
                  <div className="bg-[#FFE600]/10 border border-[#FFE600]/40 px-3 py-2 rounded text-center min-w-[80px]">
                    <span className="block text-xl font-heading font-black text-[#FFE600]">{newCustomersCount}</span>
                    <span className="text-[10px] text-[#FFE600] font-bold">طلبات جديدة</span>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded text-center min-w-[80px]">
                    <span className="block text-xl font-heading font-black text-emerald-400">
                      {customers.filter((c) => c.status === 'active' || c.status === 'confirmed').length}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">مشتركون مؤكدون</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="بحث باسم العميل، رقم الهاتف، اسم الباقة، أو الدولة..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full bg-black border border-neutral-700 rounded-sm pr-9 pl-4 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 whitespace-nowrap">تصفية حسب الحالة:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none cursor-pointer"
                  >
                    <option value="all">جميع الحالات ({customers.length})</option>
                    <option value="new">طلبات جديدة ({customers.filter((c) => c.status === 'new').length})</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="active">مشترك نشط</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Customers Table / List */}
              {filteredCustomers.length === 0 ? (
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-12 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto" />
                  <h4 className="font-heading font-black text-lg text-white">لا توجد طلبات اشتراك مطابقة</h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    {customers.length === 0
                      ? 'عندما يسجل أي عميل من الموقع باللغة الإنجليزية، ستظهر بياناته ورقم هاتفه والباقة المختارة هنا مباشرة.'
                      : 'جرب تعديل كلمة البحث أو فلتر الحالة لعرض المشتركين.'}
                  </p>
                </div>
              ) : (
                <div className="bg-black/60 border border-neutral-800 rounded-lg overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-neutral-300">
                      <thead className="bg-[#181818] text-neutral-400 font-bold border-b border-neutral-800">
                        <tr>
                          <th className="px-4 py-3.5">العميل</th>
                          <th className="px-4 py-3.5">الدولة ورقم الهاتف الدولي</th>
                          <th className="px-4 py-3.5">الباقة المختارة</th>
                          <th className="px-4 py-3.5">تاريخ التسجيل</th>
                          <th className="px-4 py-3.5">حالة الاشتراك</th>
                          <th className="px-4 py-3.5 text-center">إجراءات والتواصل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {filteredCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className={`hover:bg-neutral-900/60 transition-colors ${
                              customer.status === 'new' ? 'bg-[#FFE600]/5' : ''
                            }`}
                          >
                            {/* Name & Goal */}
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-white text-sm">{customer.name}</div>
                              {customer.fitnessGoal && (
                                <div className="text-[11px] text-[#FFE600] mt-0.5">{customer.fitnessGoal}</div>
                              )}
                              {customer.email && (
                                <div className="text-[10px] text-neutral-400">{customer.email}</div>
                              )}
                            </td>

                            {/* Phone & Country */}
                            <td className="px-4 py-3.5">
                              <div className="font-mono font-bold text-white text-xs ltr inline-block" dir="ltr">
                                {customer.fullInternationalPhone}
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-0.5">
                                {customer.countryName} ({customer.countryDialCode})
                              </div>
                            </td>

                            {/* Plan */}
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-white">
                                {customer.selectedPlanName}
                              </div>
                              <div className="inline-flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-neutral-400">{customer.selectedPlanDuration}</span>
                                <span className="text-xs font-black text-[#FFE600]">{customer.selectedPlanPrice}</span>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3.5 text-neutral-400 text-[11px] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                <span>{new Date(customer.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</span>
                              </div>
                              <span className="text-[10px] text-neutral-500">
                                {new Date(customer.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            {/* Status Dropdown */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="space-y-1">
                                <div>{getStatusBadge(customer.status)}</div>
                                <select
                                  value={customer.status}
                                  onChange={async (e) => {
                                    await updateCustomerStatus(
                                      customer.id,
                                      e.target.value as CustomerRegistration['status']
                                    );
                                    triggerSaveNotification();
                                  }}
                                  className="bg-neutral-900 border border-neutral-700 rounded text-[10px] text-neutral-300 px-2 py-1 mt-1 focus:border-[#FFE600] focus:outline-none cursor-pointer"
                                >
                                  <option value="new">عميل جديد (New)</option>
                                  <option value="contacted">تم التواصل (Contacted)</option>
                                  <option value="confirmed">تم التأكيد (Confirmed)</option>
                                  <option value="active">مشترك نشط (Active)</option>
                                  <option value="completed">مكتمل (Completed)</option>
                                  <option value="cancelled">ملغي (Cancelled)</option>
                                </select>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* WhatsApp Direct Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenCustomerWhatsApp(customer)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold rounded-sm text-xs transition-all shadow-sm cursor-pointer"
                                  title="فتح محادثة واتساب مع رسالة تأكيد جاهزة"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-black" />
                                  <span>واتساب</span>
                                </button>

                                {/* View Details Modal Button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedCustomerModal(customer)}
                                  className="p-1.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded text-neutral-300 hover:text-white cursor-pointer"
                                  title="عرض كافة تفاصيل المشترك"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`هل أنت متأكد من حذف العميل (${customer.name})؟`)) {
                                      await deleteCustomer(customer.id);
                                      triggerSaveNotification();
                                    }
                                  }}
                                  className="p-1.5 bg-red-950/50 border border-red-800/60 hover:bg-red-900 rounded text-red-400 hover:text-white cursor-pointer"
                                  title="حذف هذا العميل"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER DETAILS POPUP MODAL */}
          {selectedCustomerModal && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
              <div className="bg-[#161616] border-2 border-[#FFE600] rounded-xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="font-heading font-black text-xl text-white">
                    ملف المشترك: {selectedCustomerModal.name}
                  </h3>
                  <button
                    onClick={() => setSelectedCustomerModal(null)}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-black/60 p-3 rounded border border-neutral-800">
                    <span className="text-neutral-400 block mb-1 font-bold">الباقة والاشتراك:</span>
                    <p className="text-sm font-bold text-white">{selectedCustomerModal.selectedPlanName}</p>
                    <p className="text-xs text-[#FFE600] font-black mt-0.5">
                      المدة: {selectedCustomerModal.selectedPlanDuration} — السعر: {selectedCustomerModal.selectedPlanPrice}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/60 p-2.5 rounded border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">رقم الهاتف الدولي:</span>
                      <span className="font-mono text-white font-bold ltr inline-block" dir="ltr">
                        {selectedCustomerModal.fullInternationalPhone}
                      </span>
                    </div>
                    <div className="bg-black/60 p-2.5 rounded border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">الدولة:</span>
                      <span className="text-white font-bold">{selectedCustomerModal.countryName}</span>
                    </div>
                  </div>

                  {selectedCustomerModal.email && (
                    <div className="bg-black/60 p-2.5 rounded border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">البريد الإلكتروني:</span>
                      <span className="text-white">{selectedCustomerModal.email}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/60 p-2.5 rounded border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">الهدف التدريبي:</span>
                      <span className="text-white font-bold">{selectedCustomerModal.fitnessGoal || 'غير محدد'}</span>
                    </div>
                    <div className="bg-black/60 p-2.5 rounded border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">الخبرة الرياضية:</span>
                      <span className="text-white font-bold">{selectedCustomerModal.trainingExperience || 'غير محدد'}</span>
                    </div>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded border border-neutral-800">
                    <span className="text-neutral-400 block mb-1">تاريخ ووقت التسجيل:</span>
                    <span className="text-white">
                      {new Date(selectedCustomerModal.createdAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenCustomerWhatsApp(selectedCustomerModal);
                    }}
                    className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-black font-heading font-black text-sm rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-black" />
                    <span>مراسلة عبر واتساب</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerModal(null)}
                    className="px-4 py-3 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-xs font-bold rounded-sm cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HERO BANNER */}
          {activeTab === 'hero' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-md">
                <h3 className="font-heading font-black text-xl text-white mb-1">
                  إعدادات الواجهة الرئيسية (HERO BANNER)
                </h3>
                <p className="text-xs text-neutral-400">
                  تعديل العنوان الترحيبي، النص البارز [ BE YOURSELF ]، صورة أو فيديو الخلفية، وزر الانضمام.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    الشارة العلوية (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={config.hero.badge}
                    onChange={(e) => updateHero({ badge: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    عنوان الكوتش الرئيسي (Main Title)
                  </label>
                  <input
                    type="text"
                    value={config.hero.mainTitle}
                    onChange={(e) => updateHero({ mainTitle: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FFE600] mb-1">
                  النص البارز المميز في المنتصف (Reference: [ BE YOURSELF ]) *
                </label>
                <input
                  type="text"
                  value={config.hero.highlightText}
                  onChange={(e) => updateHero({ highlightText: e.target.value })}
                  className="w-full bg-black border-2 border-[#FFE600] rounded-sm px-4 py-2.5 text-base font-bold text-white focus:outline-none"
                  placeholder="[ BE YOURSELF ]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  الوصف الترحيبي ورسالة الكوتش (Subheadline)
                </label>
                <textarea
                  rows={2}
                  value={config.hero.subheadline}
                  onChange={(e) => updateHero({ subheadline: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نص زر الانضمام (CTA Button)
                  </label>
                  <input
                    type="text"
                    value={config.hero.buttonText}
                    onChange={(e) => updateHero({ buttonText: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                <div className="bg-black/50 p-4 border border-neutral-800 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-neutral-200">
                      درجة تعتيم/ظلام خلفية الواجهة (Hero Overlay Darkness)
                    </label>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded bg-[#FFE600] text-black shadow-sm">
                      {config.hero.overlayDarkness ?? 0}%
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    0% تعني ظهور الصورة أو الفيديو بوضوح كامل دون أي تعتيم (Default). 100% تعني تعتيم أسود كامل.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={config.hero.overlayDarkness ?? 0}
                    onChange={(e) => updateHero({ overlayDarkness: Number(e.target.value) })}
                    className="w-full accent-[#FFE600] h-2 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  {/* Quick percentage presets */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-neutral-800/80">
                    <span className="text-[10px] text-neutral-500 font-bold ml-1">تحديد سريع:</span>
                    {[
                      { label: '0% (بدون تعتيم)', value: 0 },
                      { label: '25%', value: 25 },
                      { label: '50%', value: 50 },
                      { label: '75%', value: 75 },
                      { label: '100% (تعتيم كامل)', value: 100 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => updateHero({ overlayDarkness: preset.value })}
                        className={`text-[10px] px-2 py-1 rounded transition-colors ${
                          (config.hero.overlayDarkness ?? 0) === preset.value
                            ? 'bg-[#FFE600] text-black font-black'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Media Settings: Image or Video */}
              <div className="bg-black/60 p-4 border border-neutral-800 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    نوع خلفية الواجهة (صورة أو فيديو)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateHero({ mediaType: 'image' })}
                      className={`px-3 py-1 text-xs font-bold rounded-sm ${
                        config.hero.mediaType === 'image'
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      صورة ثابتة
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHero({ mediaType: 'video' })}
                      className={`px-3 py-1 text-xs font-bold rounded-sm ${
                        config.hero.mediaType === 'video'
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      فيديو متحرك
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    رابط ملف الوسائط (Media URL):
                  </label>
                  <input
                    type="text"
                    value={config.hero.mediaUrl}
                    onChange={(e) => updateHero({ mediaUrl: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    أو رفع صورة / فيديو من جهازك:
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload(e, (dataUrl) => updateHero({ mediaUrl: dataUrl }))}
                    className="text-xs text-neutral-400 file:mr-0 file:ml-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#FFE600] file:text-black hover:file:bg-[#fff033]"
                  />
                </div>

                {/* Preview Box */}
                <div className="mt-2 h-36 rounded overflow-hidden relative border border-neutral-800 bg-neutral-950">
                  {config.hero.mediaType === 'video' ? (
                    <video
                      src={config.hero.mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={config.hero.mediaUrl}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: (config.hero.overlayDarkness ?? 0) / 100 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-heading font-black text-2xl text-white tracking-widest uppercase">
                      {config.hero.highlightText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT COACH MATBOLY */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-md">
                <h3 className="font-heading font-black text-xl text-white mb-1">
                  قسم: من هو كوتش المتبولي (ABOUT COACH)
                </h3>
                <p className="text-xs text-neutral-400">
                  تعديل سيرة المدرب، المؤهلات والشهادات، الصور الشخصية، وإحصائيات التحولات والخبرة.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    عنوان القسم (Section Title)
                  </label>
                  <input
                    type="text"
                    value={config.about.sectionTitle}
                    onChange={(e) => updateAbout({ sectionTitle: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    العنوان الفرعي (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.about.subtitle}
                    onChange={(e) => updateAbout({ subtitle: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    اسم المدرب
                  </label>
                  <input
                    type="text"
                    value={config.about.coachName}
                    onChange={(e) => updateAbout({ coachName: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    المسمى الوظيفي والشهادات (Coach Title)
                  </label>
                  <input
                    type="text"
                    value={config.about.coachTitle}
                    onChange={(e) => updateAbout({ coachTitle: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  النبذة التعريفية - الفقرة الأولى
                </label>
                <textarea
                  rows={3}
                  value={config.about.bioParagraph1}
                  onChange={(e) => updateAbout({ bioParagraph1: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  النبذة التعريفية - الفقرة الثانية
                </label>
                <textarea
                  rows={3}
                  value={config.about.bioParagraph2}
                  onChange={(e) => updateAbout({ bioParagraph2: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Credentials / Qualifications List */}
              <div className="bg-black/60 p-4 border border-neutral-800 rounded-md">
                <label className="block text-xs font-bold text-[#FFE600] mb-2">
                  الاعتمادات والمؤهلات الرياضية (سطر لكل مؤهل):
                </label>
                <textarea
                  rows={4}
                  value={config.about.credentials.join('\n')}
                  onChange={(e) =>
                    updateAbout({
                      credentials: e.target.value.split('\n').filter((c) => c.trim().length > 0),
                    })
                  }
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  placeholder="Certified Strength & Conditioning Specialist (CSCS)..."
                />
              </div>

              {/* Coach Stats */}
              <div className="bg-black/60 p-4 border border-neutral-800 rounded-md space-y-3">
                <label className="block text-xs font-bold text-white mb-2">
                  إحصائيات النجاح الأربعة:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {config.about.stats.map((st, idx) => (
                    <div key={idx} className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => {
                          const nextStats = [...config.about.stats];
                          nextStats[idx] = { ...nextStats[idx], value: e.target.value };
                          updateAbout({ stats: nextStats });
                        }}
                        className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-sm font-bold text-[#FFE600] mb-1"
                      />
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => {
                          const nextStats = [...config.about.stats];
                          nextStats[idx] = { ...nextStats[idx], label: e.target.value };
                          updateAbout({ stats: nextStats });
                        }}
                        className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-[11px] text-neutral-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Photos (Direct URL Only) */}
              <div className="bg-black/80 p-5 border-2 border-neutral-800 hover:border-[#FFE600]/40 transition-colors rounded-lg space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <h4 className="font-heading font-black text-lg text-[#FFE600] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#FFE600]" />
                      <span>صورة كوتش المتبولي عبر الرابط المباشر (DIRECT IMAGE URL ONLY)</span>
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      الصق رابط الصورة المباشر (Direct Image URL) وسيتم حفظها فورياً وبشكل دائم في قاعدة البيانات وتظهر على الموقع لجميع الزوار.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    حفظ سحابي دائم في Firestore
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Primary Coach Photo */}
                  <div className="bg-neutral-900/70 p-4 border border-neutral-800 rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-white uppercase tracking-wider">
                        الصورة الرئيسية للكوتش (Primary Photo URL)
                      </label>
                      <span className="text-[10px] text-[#FFE600] font-bold bg-[#FFE600]/10 px-2 py-0.5 rounded">
                        الأساسية في الموقع
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] text-neutral-300 font-medium">
                        رابط الصورة المباشر:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          value={config.about.primaryPhoto || config.about.primaryImage || ''}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            updateAbout({ primaryPhoto: val, primaryImage: val });
                          }}
                          placeholder="https://i.postimg.cc/... أو https://images.unsplash.com/..."
                          className="flex-1 bg-black border border-neutral-700 focus:border-[#FFE600] rounded-sm px-3 py-2 text-xs text-white font-mono placeholder:font-sans placeholder:text-neutral-500 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (config.about.primaryPhoto || config.about.primaryImage || '').trim();
                            updateAbout({ primaryPhoto: val, primaryImage: val }, true);
                          }}
                          className="bg-[#FFE600] hover:bg-[#fff033] active:scale-95 text-black text-xs font-bold px-4 py-2 rounded-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,230,0,0.3)] shrink-0 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>حفظ وتطبيق</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        * الصق الرابط المباشر للصورة (مثل روابط PostImg، Imgur، Cloudinary، أو Unsplash). لا يلزم رفع ملف من جهازك.
                      </p>
                    </div>

                    {/* Image Preview */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                        <span className="font-semibold text-neutral-300">معاينة الصورة المباشرة:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const defaultUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop';
                              updateAbout({ primaryPhoto: defaultUrl, primaryImage: defaultUrl }, true);
                            }}
                            className="text-[10px] text-[#FFE600] hover:underline cursor-pointer"
                          >
                            استعادة الصورة الافتراضية
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateAbout({ primaryPhoto: '', primaryImage: '' }, true);
                            }}
                            className="text-[10px] text-neutral-400 hover:text-red-400 hover:underline cursor-pointer"
                          >
                            مسح الرابط
                          </button>
                        </div>
                      </div>
                      <div className="relative w-full h-64 bg-black rounded border border-neutral-800 overflow-hidden flex items-center justify-center group">
                        {(config.about.primaryPhoto || config.about.primaryImage) ? (
                          <img
                            src={config.about.primaryPhoto || config.about.primaryImage}
                            alt="Coach Matboly Preview"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const errEl = parent.querySelector('.img-error-badge');
                                if (errEl) (errEl as HTMLElement).style.display = 'flex';
                              }
                            }}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-center p-4 text-neutral-500 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                            <span>لا توجد صورة محددة - يرجى لصق رابط الصورة أعلاه ثم الضغط على "حفظ وتطبيق"</span>
                          </div>
                        )}
                        <div className="img-error-badge hidden absolute inset-0 bg-red-950/90 border border-red-800 p-4 flex-col items-center justify-center text-center text-xs text-red-200">
                          <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
                          <span>تعذر تحميل الصورة من هذا الرابط - يرجى التأكد من أن الرابط مباشر وينتهي بصيغة صورة (.jpg, .png, إلخ) أو متاح للعامة.</span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-sm border border-neutral-800 px-2.5 py-1 rounded text-[10px] text-[#FFE600] font-bold">
                          {config.about.coachName || 'المتبولي'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary / Action Photo */}
                  <div className="bg-neutral-900/70 p-4 border border-neutral-800 rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-white uppercase tracking-wider">
                        صورة ثانوية إضافية (Secondary Action Photo URL)
                      </label>
                      <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                        اختياري (صورة مصغرة)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] text-neutral-300 font-medium">
                        رابط الصورة الثانوي المباشر:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          value={config.about.secondaryPhoto || config.about.secondaryImage || ''}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            updateAbout({ secondaryPhoto: val, secondaryImage: val });
                          }}
                          placeholder="https://images.unsplash.com/... أو أي رابط صورة"
                          className="flex-1 bg-black border border-neutral-700 focus:border-[#FFE600] rounded-sm px-3 py-2 text-xs text-white font-mono placeholder:font-sans placeholder:text-neutral-500 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (config.about.secondaryPhoto || config.about.secondaryImage || '').trim();
                            updateAbout({ secondaryPhoto: val, secondaryImage: val }, true);
                          }}
                          className="bg-[#FFE600] hover:bg-[#fff033] active:scale-95 text-black text-xs font-bold px-4 py-2 rounded-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,230,0,0.3)] shrink-0 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>حفظ وتطبيق</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        * تظهر كصورة تدريب مصغرة في زاوية كارت الكوتش.
                      </p>
                    </div>

                    {/* Secondary Preview */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                        <span className="font-semibold text-neutral-300">معاينة الصورة الثانوية:</span>
                        <button
                          type="button"
                          onClick={() => {
                            updateAbout({ secondaryPhoto: '', secondaryImage: '' }, true);
                          }}
                          className="text-[10px] text-neutral-400 hover:text-red-400 hover:underline cursor-pointer"
                        >
                          إزالة الصورة الثانوية
                        </button>
                      </div>
                      <div className="relative w-full h-64 bg-black rounded border border-neutral-800 overflow-hidden flex items-center justify-center group">
                        {(config.about.secondaryPhoto || config.about.secondaryImage) ? (
                          <img
                            src={config.about.secondaryPhoto || config.about.secondaryImage}
                            alt="Secondary Action Preview"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                            }}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-center p-4 text-neutral-500 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                            <span>لا توجد صورة ثانوية (اختياري)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALORIE & MACRO CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-neutral-900/90 p-5 border-2 border-[#FFE600]/40 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#FFE600] font-heading font-black text-xl">
                    <Calculator className="w-6 h-6" />
                    <span>إعدادات حاسبة السعرات والماكروز (Calorie Calculator)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed max-w-2xl">
                    تتيح حاسبة السعرات الذكية للزوار حساب معدل الأيض الأساسي (BMR) ومعدل الحرق اليومي (TDEE) وتوزيع الماكروز أوتوماتيكياً بمعادلات ميفلين-سانت جيور وكاتش-ماكاردل المعتمدة. يمكنك تخصيص نصوص العناوين وزر الاشتراك هنا.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (updateCalculator) {
                      updateCalculator(DEFAULT_SITE_CONFIG.calculator);
                      setSaveToast(true);
                      setTimeout(() => setSaveToast(false), 2000);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-neutral-800 border border-neutral-700 hover:border-[#FFE600] hover:text-[#FFE600] text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة النصوص الافتراضية</span>
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-md p-6 space-y-5">
                <h4 className="font-heading font-black text-base text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FFE600]" />
                  <span>تخصيص نصوص قسم الحاسبة</span>
                </h4>

                {/* Badge */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    النص الترويجي الصغير (Badge):
                  </label>
                  <input
                    type="text"
                    value={config.calculator?.badge || ''}
                    onChange={(e) =>
                      updateCalculator &&
                      updateCalculator({ badge: e.target.value })
                    }
                    placeholder="حاسبة السعرات والماكروز الذكية"
                    className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded-sm text-sm focus:outline-none"
                  />
                </div>

                {/* Section Title */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    عنوان القسم الرئيسي (Section Title):
                  </label>
                  <input
                    type="text"
                    value={config.calculator?.sectionTitle || ''}
                    onChange={(e) =>
                      updateCalculator &&
                      updateCalculator({ sectionTitle: e.target.value })
                    }
                    placeholder="احسب احتياج جسمك وسعراتك بدقة"
                    className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded-sm text-sm focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    الوصف التوضيحي (Subtitle):
                  </label>
                  <textarea
                    rows={2}
                    value={config.calculator?.subtitle || ''}
                    onChange={(e) =>
                      updateCalculator &&
                      updateCalculator({ subtitle: e.target.value })
                    }
                    placeholder="معادلة علمية معتمدة لحساب معدل الحرق اليومي (BMR) والاحتياج الفعلي (TDEE) مع توزيع دقيق للماكروز"
                    className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded-sm text-sm focus:outline-none leading-relaxed"
                  />
                </div>

                {/* CTA Button Text */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    نص زر التحويل للاشتراك (CTA Button Text):
                  </label>
                  <input
                    type="text"
                    value={config.calculator?.ctaText || ''}
                    onChange={(e) =>
                      updateCalculator &&
                      updateCalculator({ ctaText: e.target.value })
                    }
                    placeholder="اشترك الآن واحصل على دايت وجدول تمرين مخصص 100%"
                    className="w-full bg-black border border-neutral-800 focus:border-[#FFE600] text-white px-3.5 py-2.5 rounded-sm text-sm focus:outline-none"
                  />
                </div>

                {/* Quick Info Box */}
                <div className="bg-black/60 border border-neutral-800 p-4 rounded-sm text-xs text-neutral-400 space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-[#FFE600] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>المعادلات الحسابية المعتمدة في الحاسبة:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-300 ps-2">
                    <li>
                      <strong>معادلة ميفلين-سانت جيور (Mifflin-St Jeor):</strong> تُطبَّق تلقائياً بالاعتماد على الطول والوزن والعمر والنوع.
                    </li>
                    <li>
                      <strong>معادلة كاتش-ماكاردل (Katch-McArdle):</strong> تُفعَّل تلقائياً بمجرد إدخال المشترك لنسبة الدهون (%) لحساب الأيض بدقة الكتلة الصافية (Lean Body Mass).
                    </li>
                    <li>
                      <strong>توزيع الماكروز:</strong> 2.0g-2.2g بروتين لكل كجم، 25% دهون صحية، وباقي السعرات كاربوهيدرات معقدة لدعم الطاقة والاستشفاء.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEMBERSHIP PLANS & PRICING */}
          {activeTab === 'plans' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-md flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-xl text-white mb-1">
                    إدارة باقات الاشتراك والأسعار (MEMBERSHIP PLANS)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    تُعرض الباقات كـ باقتين في كل صف (2x2). يمكنك تعديل الأسعار، المميزات، الخصومات، وإضافة أو حذف باقات.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (saveAllChangesImmediately) {
                        await saveAllChangesImmediately();
                      }
                      triggerSaveNotification();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFE600] text-black font-heading font-black text-xs rounded-sm hover:bg-[#fff033] shadow-md cursor-pointer"
                    title="حفظ التعديلات في قاعدة البيانات السحابية فوراً"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ التعديلات في قاعدة البيانات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultDurations = getDefaultDurationPrices(500);
                      const newPlan: MembershipPlan = {
                        id: `plan-${Date.now()}`,
                        name: 'VIP PROTOCOL',
                        duration: '3 MONTHS',
                        price: '1,200 EGP',
                        originalPrice: '1,500 EGP',
                        currency: 'EGP',
                        periodText: 'TOTAL ACCESS',
                        description: 'خطة تدريب وتغذية متكاملة تشمل تدريب مخصص ومتابعة دورية مباشرة مع كوتش المتبولي.',
                        features: [
                          'جدول تدريبي مخصص يتجدد أسبوعياً حسب مستواك',
                          'خطة تغذية محسوبة السعرات والماكروز بمرونة كاملة',
                          'متابعة أسبوعية مباشرة عبر واتساب للصور والقياسات',
                          'تصحيح تكنيك وفيديوهات الأداء الحركي',
                        ],
                        ctaText: 'JOIN PLAN',
                        ctaLink: '#contact',
                        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
                        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
                        durationPrices: defaultDurations,
                        defaultDurationMonths: 3,
                      };
                      updatePlans({ plans: [...config.plans.plans, newPlan] });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white font-heading font-black text-xs rounded-sm hover:bg-neutral-700 cursor-pointer border border-neutral-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FFE600]" />
                    <span>إضافة باقة جديدة</span>
                  </button>
                </div>
              </div>

              {/* Section Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    عنوان قسم الباقات (Section Title)
                  </label>
                  <input
                    type="text"
                    value={config.plans.sectionTitle}
                    onChange={(e) => updatePlans({ sectionTitle: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    العنوان الفرعي (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.plans.subtitle}
                    onChange={(e) => updatePlans({ subtitle: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>
              </div>

              {/* Individual Plan Cards */}
              <div className="space-y-4">
                {config.plans.plans.map((plan, idx) => (
                  <div
                    key={plan.id}
                    className={`bg-black/80 border p-5 rounded-lg space-y-4 ${
                      plan.isPopular ? 'border-2 border-[#FFE600]' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FFE600] text-black font-heading font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-heading font-black text-lg text-white">
                          {plan.name} — ({plan.duration})
                        </h4>
                        {plan.isPopular && (
                          <span className="bg-[#FFE600] text-black text-[10px] font-black px-2 py-0.5 rounded">
                            الباقة المميزة الأكثر طلباً
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...config.plans.plans];
                            next[idx] = { ...next[idx], isPopular: !next[idx].isPopular };
                            updatePlans({ plans: next });
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${
                            plan.isPopular
                              ? 'bg-[#FFE600] text-black'
                              : 'bg-neutral-900 border border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {plan.isPopular ? '★ باقة مميزة' : 'تعيين كباقة مميزة'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (config.plans.plans.length <= 1) {
                              alert('يجب الإبقاء على باقة واحدة على الأقل.');
                              return;
                            }
                            const next = config.plans.plans.filter((_, i) => i !== idx);
                            updatePlans({ plans: next });
                          }}
                          className="p-1 bg-red-950/50 border border-red-800/80 hover:bg-red-900 text-red-300 rounded cursor-pointer"
                          title="حذف الباقة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                          اسم الباقة (Plan Name)
                        </label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const next = [...config.plans.plans];
                            next[idx] = { ...next[idx], name: e.target.value };
                            updatePlans({ plans: next });
                          }}
                          className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                          الشارة المميزة (Badge Text)
                        </label>
                        <input
                          type="text"
                          value={plan.badgeText || ''}
                          onChange={(e) => {
                            const next = [...config.plans.plans];
                            next[idx] = { ...next[idx], badgeText: e.target.value };
                            updatePlans({ plans: next });
                          }}
                          className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                          placeholder="MOST POPULAR / BEST VALUE"
                        />
                      </div>
                    </div>

                    {/* PACKAGE IMAGE & DISPLAY PRICE ROW */}
                    <div className="bg-neutral-950/80 p-3.5 border border-neutral-800 rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FFE600] flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>صورة الباقة والأسعار المعروضة (Package Image & Display Price)</span>
                        </span>
                        {(plan.imageUrl || plan.image) && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...config.plans.plans];
                              next[idx] = { ...next[idx], imageUrl: '', image: '' };
                              updatePlans({ plans: next });
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            حذف صورة الباقة
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        {/* Image Preview & Upload */}
                        <div className="sm:col-span-1">
                          <div className="relative h-28 rounded border border-neutral-700 bg-neutral-900 overflow-hidden flex items-center justify-center group">
                            {plan.imageUrl || plan.image ? (
                              <img
                                src={plan.imageUrl || plan.image}
                                alt={plan.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-2 text-neutral-500 text-[11px]">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                <span>لا توجد صورة محددة</span>
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[11px] font-bold gap-1">
                              <Upload className="w-4 h-4 text-[#FFE600]" />
                              <span>تغيير الصورة</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (dataUrl) => {
                                    const next = [...config.plans.plans];
                                    next[idx] = { ...next[idx], imageUrl: dataUrl, image: dataUrl };
                                    updatePlans({ plans: next });
                                  })
                                }
                              />
                            </label>
                          </div>
                          <label className="mt-1.5 inline-flex items-center justify-center gap-1.5 w-full py-1 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] font-bold rounded cursor-pointer">
                            <Upload className="w-3 h-3 text-[#FFE600]" />
                            <span>رفع صورة من الجهاز</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (dataUrl) => {
                                  const next = [...config.plans.plans];
                                  next[idx] = { ...next[idx], imageUrl: dataUrl, image: dataUrl };
                                  updatePlans({ plans: next });
                                })
                              }
                            />
                          </label>
                        </div>

                        {/* Image URL & Main Prices */}
                        <div className="sm:col-span-2 space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-400 mb-0.5">
                              رابط صورة الباقة المباشر (Direct Image URL)
                            </label>
                            <input
                              type="text"
                              value={plan.imageUrl || plan.image || ''}
                              onChange={(e) => {
                                const next = [...config.plans.plans];
                                next[idx] = { ...next[idx], imageUrl: e.target.value, image: e.target.value };
                                updatePlans({ plans: next });
                              }}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-300 mb-0.5">
                                سعر الباقة المعروض (Display Price)
                              </label>
                              <input
                                type="text"
                                value={plan.price || ''}
                                onChange={(e) => {
                                  const next = [...config.plans.plans];
                                  next[idx] = { ...next[idx], price: e.target.value };
                                  updatePlans({ plans: next });
                                }}
                                placeholder="1,200 EGP"
                                className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-[#FFE600] font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-300 mb-0.5">
                                السعر قبل الخصم (Original Price)
                              </label>
                              <input
                                type="text"
                                value={plan.originalPrice || ''}
                                onChange={(e) => {
                                  const next = [...config.plans.plans];
                                  next[idx] = { ...next[idx], originalPrice: e.target.value };
                                  updatePlans({ plans: next });
                                }}
                                placeholder="1,500 EGP"
                                className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-400"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-300 mb-0.5">
                                مدة الباقة (Duration Text)
                              </label>
                              <input
                                type="text"
                                value={plan.duration || ''}
                                onChange={(e) => {
                                  const next = [...config.plans.plans];
                                  next[idx] = { ...next[idx], duration: e.target.value };
                                  updatePlans({ plans: next });
                                }}
                                placeholder="3 MONTHS / 3 شهور"
                                className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-300 mb-0.5">
                                رمز العملة (Currency)
                              </label>
                              <input
                                type="text"
                                value={plan.currency || 'EGP'}
                                onChange={(e) => {
                                  const next = [...config.plans.plans];
                                  next[idx] = { ...next[idx], currency: e.target.value };
                                  updatePlans({ plans: next });
                                }}
                                placeholder="EGP / $ / SAR"
                                className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DURATION PRICING & AUTOMATIC DISCOUNT MATRIX */}
                    <div>
                      <PlanDurationPricingEditor
                        plan={plan}
                        onChangePlan={(updated) => {
                          const next = [...config.plans.plans];
                          next[idx] = updated;
                          updatePlans({ plans: next });
                        }}
                        isRTL={true}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                          نص الملاحظة أو الميزة الرئيسية (Period / Access Text)
                        </label>
                        <input
                          type="text"
                          value={plan.periodText || ''}
                          onChange={(e) => {
                            const next = [...config.plans.plans];
                            next[idx] = { ...next[idx], periodText: e.target.value };
                            updatePlans({ plans: next });
                          }}
                          className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                          placeholder="FULL ACCESS / تجديد دوري"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                          وصف الباقة العام (Description)
                        </label>
                        <input
                          type="text"
                          value={plan.description}
                          onChange={(e) => {
                            const next = [...config.plans.plans];
                            next[idx] = { ...next[idx], description: e.target.value };
                            updatePlans({ plans: next });
                          }}
                          className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Plan Features Checklist */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#FFE600] mb-1">
                        مميزات الباقة (سطر لكل ميزة):
                      </label>
                      <textarea
                        rows={3}
                        value={plan.features.join('\n')}
                        onChange={(e) => {
                          const next = [...config.plans.plans];
                          next[idx] = {
                            ...next[idx],
                            features: e.target.value.split('\n').filter((f) => f.trim().length > 0),
                          };
                          updatePlans({ plans: next });
                        }}
                        className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENT & CONVERSION METHODS (طرق الدفع والتحويل) */}
          {activeTab === 'payment' && (
            <div className="space-y-6 max-w-5xl">
              {/* Header Banner */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#FFE600] font-heading font-black text-xl">
                    <CreditCard className="w-6 h-6" />
                    <span>طرق الدفع والتحويل البنكي وتفاصيل العملات (PAYMENT & CONVERSION)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
                    تحكم كامل في جميع بيانات الدفع والتحويل للمشتركين داخل وخارج مصر (إنستاباي، فودافون كاش، الحساب البنكي، والآيبان، وتفاصيل تحويل العملات). يتم حفظ هذه البيانات بشكل دائم في قاعدة البيانات السحابية وتظهر للمشتركين في نافذة الاشتراك وأسفل باقات التدريب.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (saveAllChangesImmediately) {
                        await saveAllChangesImmediately();
                      }
                      triggerSaveNotification();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFE600] text-black font-heading font-black text-xs rounded-sm hover:bg-[#fff033] shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ بيانات الدفع في قاعدة البيانات</span>
                  </button>
                </div>
              </div>

              {/* Status and Master Toggle */}
              <div className="bg-black/80 border border-neutral-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">تفعيل قسم طرق الدفع والتحويل في الموقع</h4>
                  <p className="text-xs text-neutral-400">
                    عند التفعيل، تظهر بيانات التحويل البنكي وإنستاباي وفودافون كاش للمشتركين في شاشة إتمام الطلب ومباشرة تحت الباقات.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.paymentInfo?.enabled === true}
                    onChange={(e) => {
                      if (updatePaymentInfo) {
                        updatePaymentInfo({ enabled: e.target.checked }, true);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE600]"></div>
                </label>
              </div>

              {/* Section Header Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    عنوان قسم الدفع والتحويل (Section Title)
                  </label>
                  <input
                    type="text"
                    value={config.paymentInfo?.title || ''}
                    onChange={(e) => {
                      if (updatePaymentInfo) {
                        updatePaymentInfo({ title: e.target.value });
                      }
                    }}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                    placeholder="عنوان قسم الدفع"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    الوصف الفرعي (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.paymentInfo?.subtitle || ''}
                    onChange={(e) => {
                      if (updatePaymentInfo) {
                        updatePaymentInfo({ subtitle: e.target.value });
                      }
                    }}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                    placeholder="الوصف الفرعي"
                  />
                </div>
              </div>

              {/* Instant Electronic Transfers: InstaPay & Vodafone Cash */}
              <div className="bg-black/80 border border-neutral-800 p-5 rounded-lg space-y-4">
                <h4 className="font-heading font-black text-sm text-[#FFE600] uppercase tracking-wider flex items-center gap-2">
                  <span>⚡ التحويل الإلكتروني الفوري (InstaPay & Mobile Wallets)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      حساب إنستاباي (InstaPay IPA / Phone / Username)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.instapayAddress || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ instapayAddress: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none font-mono"
                      placeholder="user@instapay أو رقم الهاتف"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">يظهر كزر نسخ فوري للمتدربين عند الدفع.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      رقم فودافون كاش / المحافظ الإلكترونية (Vodafone Cash / Smart Wallet)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.vodafoneCashNumber || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ vodafoneCashNumber: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none font-mono"
                      placeholder="010XXXXXXXX"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">رقم المحفظة لتحويل فودافون كاش وأورانج كاش واتصالات كاش.</p>
                  </div>
                </div>
              </div>

              {/* Direct Bank Account & IBAN Details */}
              <div className="bg-black/80 border border-neutral-800 p-5 rounded-lg space-y-4">
                <h4 className="font-heading font-black text-sm text-[#FFE600] uppercase tracking-wider flex items-center gap-2">
                  <span>🏦 بيانات الحساب البنكي والآيبان (Bank Transfer Details)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      اسم البنك (Bank Name)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.bankName || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ bankName: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                      placeholder="اسم البنك"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      اسم صاحب الحساب (Account Holder Name)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.accountHolderName || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ accountHolderName: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                      placeholder="اسم صاحب الحساب"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      رقم الحساب البنكي (Bank Account Number)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.bankAccountNumber || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ bankAccountNumber: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none font-mono"
                      placeholder="رقم الحساب"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      رقم الآيبان الدولي (IBAN Number)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.bankIban || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ bankIban: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none font-mono"
                      placeholder="EG..."
                    />
                  </div>
                </div>
              </div>

              {/* Currency Conversion Rates & International Payment Instructions */}
              <div className="bg-black/80 border border-neutral-800 p-5 rounded-lg space-y-4">
                <h4 className="font-heading font-black text-sm text-[#FFE600] uppercase tracking-wider flex items-center gap-2">
                  <span>🌍 معلومات وأسعار تحويل العملات للمغتربين (Currency Conversion & Overseas)</span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      أسعار ومعدلات تحويل العملات (Currency Conversion Rates)
                    </label>
                    <input
                      type="text"
                      value={config.paymentInfo?.currencyConversionRate || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ currencyConversionRate: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-[#FFE600] font-bold focus:border-[#FFE600] focus:outline-none font-mono"
                      placeholder="1 USD = 50 EGP | 1 SAR = 13.3 EGP | 1 AED = 13.6 EGP | 1 KWD = 163 EGP"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      توضيح أسعار التحويل المعتمدة للمتدربين من دول الخليج أو أوروبا أو أمريكا.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        رقم كود فوري / المحافظ الذكية (Fawry / Digital Wallet Code)
                      </label>
                      <input
                        type="text"
                        value={config.paymentInfo?.fawryNumber || ''}
                        onChange={(e) => {
                          if (updatePaymentInfo) {
                            updatePaymentInfo({ fawryNumber: e.target.value });
                          }
                        }}
                        className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                        placeholder="كود الدفع أو رقم المحفظة"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        حساب بايبال للمشتركين الدوليين (PayPal Email)
                      </label>
                      <input
                        type="text"
                        value={config.paymentInfo?.paypalEmail || ''}
                        onChange={(e) => {
                          if (updatePaymentInfo) {
                            updatePaymentInfo({ paypalEmail: e.target.value });
                          }
                        }}
                        className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                        placeholder="coach@paypal.me أو بريد بايبال"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      تعليمات وإرشادات إتمام التحويل (Transfer Instructions)
                    </label>
                    <textarea
                      rows={3}
                      value={config.paymentInfo?.transferInstructions || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ transferInstructions: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                      placeholder="تعليمات إضافية للمتدربين"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      ملاحظات وشروط إضافية لسياسة الدفع (Additional Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={config.paymentInfo?.notes || ''}
                      onChange={(e) => {
                        if (updatePaymentInfo) {
                          updatePaymentInfo({ notes: e.target.value });
                        }
                      }}
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                      placeholder="ملاحظات وشروط إضافية"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Save */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (saveAllChangesImmediately) {
                      await saveAllChangesImmediately();
                    }
                    triggerSaveNotification();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFE600] text-black font-heading font-black text-sm rounded-sm hover:bg-[#fff033] shadow-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ جميع بيانات الدفع والتحويل في قاعدة البيانات</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: TRANSFORMATIONS SECTION (قصص التحول) */}
          {(activeTab === 'transformations' || activeTab === 'choices') && (
            <div className="space-y-6 max-w-5xl">
              {/* Top Banner & Actions */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#FFE600] font-heading font-black text-xl">
                    <Trophy className="w-6 h-6" />
                    <span>إدارة قصص التحول (TRANSFORMATIONS)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
                    تحكم كامل في قسم التحولات. أضف صور التحول باستخدام رابط الصورة المباشر فقط (Direct Image URL) بدون الحاجة لرفع صور من الجهاز. تعرض التحولات كـ شريط متحرك بانورامي مستمر كامل العرض على الموقع، ويتم حفظ جميع التعديلات سحابياً في Firestore.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const currentItems = Array.isArray(config.transformations?.items) ? config.transformations.items : [];
                      const newItem: TransformationItem = {
                        id: `trans-${Date.now()}`,
                        name: 'بطل جديد',
                        duration: '90 يوم',
                        weightChange: '-15 كجم',
                        tag: 'تنشيف وبناء عضل',
                        description: 'خطة تدريب وتغذية مخصصة حقق من خلالها تحولاً جذرياً في نسبة الدهون وزيادة الكتلة العضلية.',
                        beforeImageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
                        afterImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
                        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
                      };
                      if (updateTransformations) {
                        updateTransformations({ items: [newItem, ...currentItems] }, true);
                      }
                      setSaveToast(true);
                      setTimeout(() => setSaveToast(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#FFE600] hover:bg-[#ffe100] text-black font-black text-xs px-4 py-2 rounded-sm shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة قصة تحول جديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (updateTransformations) {
                        updateTransformations({ ...config.transformations }, true);
                      }
                      setSaveToast(true);
                      setTimeout(() => setSaveToast(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs px-3.5 py-2 rounded-sm transition-all cursor-pointer"
                    title="تأكيد وحفظ التغييرات السحابية"
                  >
                    <Save className="w-4 h-4 text-[#FFE600]" />
                    <span>حفظ وتطبيق فوراً</span>
                  </button>
                </div>
              </div>

              {/* Section Header Controls */}
              <div className="bg-black/60 border border-neutral-800 rounded-lg p-4 sm:p-5 space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <Sparkles className="w-4 h-4 text-[#FFE600]" />
                  <span>عناوين ونصوص القسم الرئيسية (Section Headings)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      شارة القسم (Badge Text)
                    </label>
                    <input
                      type="text"
                      value={config.transformations?.badge || ''}
                      onChange={(e) => {
                        if (updateTransformations) {
                          updateTransformations({ badge: e.target.value });
                        }
                      }}
                      placeholder="TRANSFORMATION STORIES • قبل وبعد"
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      عنوان القسم الرئيسي (Section Title) *
                    </label>
                    <input
                      type="text"
                      value={config.transformations?.sectionTitle || ''}
                      onChange={(e) => {
                        if (updateTransformations) {
                          updateTransformations({ sectionTitle: e.target.value });
                        }
                      }}
                      placeholder="قصص ونتائج التحول الحقيقية"
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      العنوان الفرعي (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={config.transformations?.subtitle || ''}
                      onChange={(e) => {
                        if (updateTransformations) {
                          updateTransformations({ subtitle: e.target.value });
                        }
                      }}
                      placeholder="شاهد التغييرات المذهلة للأبطال..."
                      className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Transformations Items List */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">قائمة قصص التحول المسجلة</span>
                    <span className="bg-[#FFE600]/20 text-[#FFE600] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#FFE600]/30">
                      {config.transformations?.items?.length || 0} حالة
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    صيغة العرض: 1200 × 675 (16:9) مقارنة قبل وبعد • الحذف والتعديل يُحفظ مباشرة في قاعدة البيانات
                  </span>
                </div>

                {(!config.transformations?.items || config.transformations.items.length === 0) ? (
                  <div className="text-center py-12 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-lg p-6">
                    <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400 font-bold">لا توجد قصص تحول مسجلة حالياً</p>
                    <p className="text-xs text-neutral-500 mt-1 mb-4">اضغط على زر إضافة قصة تحول جديدة لبدء إضافة صور الأبطال بروابط مباشرة</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem: TransformationItem = {
                          id: `trans-${Date.now()}`,
                          name: 'أحمد كمال',
                          duration: '90 يوم',
                          weightChange: '-18 كجم دهون',
                          tag: 'تنشيف وبناء عضل صافي',
                          description: 'تحول كامل من نسبة دهون 28% إلى 11% مع بناء كتلة عضلية واضحة وتقسيم عضلات البطن.',
                          beforeImageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
                          afterImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
                          imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
                        };
                        if (updateTransformations) {
                          updateTransformations({ items: [newItem] }, true);
                        }
                        setSaveToast(true);
                        setTimeout(() => setSaveToast(false), 2500);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#FFE600] text-black font-bold text-xs px-4 py-2 rounded-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة قصة تحول نموذجية</span>
                    </button>
                  </div>
                ) : (
                  config.transformations.items.map((item, idx) => {
                    const itemId = item.id || `trans-item-${idx}`;
                    const isConfirmingDelete = confirmDeleteTransId === itemId;
                    const beforeImg = item.beforeImageUrl || item.imageUrl || '';
                    const afterImg = item.afterImageUrl || item.imageUrl || '';

                    return (
                      <div
                        key={itemId}
                        className="bg-[#141414] border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 sm:p-5 space-y-4 transition-all"
                      >
                        {/* Card Top Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#FFE600] text-black text-xs font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="font-heading font-black text-white text-base">
                              {item.name || `قصة تحول #${idx + 1}`}
                            </h4>
                            {item.tag && (
                              <span className="text-[10px] bg-neutral-800 text-[#FFE600] px-2 py-0.5 rounded border border-neutral-700">
                                {item.tag}
                              </span>
                            )}
                          </div>

                          {/* Card Controls: Reorder & Delete */}
                          <div className="flex items-center gap-2">
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-2 bg-red-950/90 border border-red-700 p-1.5 rounded shadow-lg animate-in fade-in duration-200">
                                <span className="text-[11px] text-red-200 font-bold px-1 flex items-center gap-1">
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>تأكيد الحذف النهائي؟</span>
                                </span>
                                <button
                                  type="button"
                                  disabled={isDeletingTransId === itemId}
                                  onClick={async () => {
                                    setIsDeletingTransId(itemId);
                                    try {
                                      if (deleteTransformation) {
                                        const res = await deleteTransformation(item.id || idx);
                                        if (res.success) {
                                          setSaveToast(true);
                                          setTimeout(() => setSaveToast(false), 2500);
                                        }
                                      } else if (config.transformations?.items) {
                                        const next = config.transformations.items.filter((_, i) => i !== idx);
                                        if (updateTransformations) {
                                          updateTransformations({ items: next }, true);
                                        }
                                        setSaveToast(true);
                                        setTimeout(() => setSaveToast(false), 2500);
                                      }
                                    } finally {
                                      setIsDeletingTransId(null);
                                      setConfirmDeleteTransId(null);
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded cursor-pointer disabled:opacity-50 transition-colors shadow flex items-center gap-1"
                                >
                                  {isDeletingTransId === itemId ? (
                                    <>
                                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>جارٍ الحذف...</span>
                                    </>
                                  ) : (
                                    <span>نعم، احذف نهائياً</span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={isDeletingTransId === itemId}
                                  onClick={() => setConfirmDeleteTransId(null)}
                                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded cursor-pointer transition-colors"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    if (idx === 0 || !config.transformations?.items) return;
                                    const next = [...config.transformations.items];
                                    const temp = next[idx - 1];
                                    next[idx - 1] = next[idx];
                                    next[idx] = temp;
                                    if (updateTransformations) updateTransformations({ items: next }, true);
                                    setSaveToast(true);
                                    setTimeout(() => setSaveToast(false), 2000);
                                  }}
                                  className="p-1.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 disabled:opacity-30 rounded cursor-pointer"
                                  title="تحريك لأعلى"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                                </button>

                                <button
                                  type="button"
                                  disabled={idx === (config.transformations?.items?.length || 1) - 1}
                                  onClick={() => {
                                    if (!config.transformations?.items || idx === config.transformations.items.length - 1) return;
                                    const next = [...config.transformations.items];
                                    const temp = next[idx + 1];
                                    next[idx + 1] = next[idx];
                                    next[idx] = temp;
                                    if (updateTransformations) updateTransformations({ items: next }, true);
                                    setSaveToast(true);
                                    setTimeout(() => setSaveToast(false), 2000);
                                  }}
                                  className="p-1.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 disabled:opacity-30 rounded cursor-pointer"
                                  title="تحريك لأسفل"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmDeleteTransId(itemId);
                                  }}
                                  className="px-3 py-1.5 bg-red-950/80 border border-red-800 hover:bg-red-900 text-red-200 hover:text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                                  title="حذف هذه القصة نهائياً من قاعدة البيانات والموقع"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>حذف القصة</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 1200 x 675 (16:9) Before & After Image URL Inputs + Live Preview */}
                        <div className="bg-black/80 border border-neutral-800 p-3.5 rounded-lg space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-neutral-800/80 pb-2">
                            <label className="text-xs font-bold text-[#FFE600] flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-[#FFE600]" />
                              <span>صور المقارنة قبل وبعد بتنسيق 1200 × 675 (16:9 Format) *</span>
                            </label>
                            <span className="text-[10px] text-neutral-400">
                              روابط مباشرة من الإنترنت (Unsplash, Imgur, Cloudinary, إلخ)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* BEFORE Image URL Input */}
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-300 mb-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                                <span>رابط صورة قبل التحول (BEFORE Photo URL - Left Side)</span>
                              </label>
                              <input
                                type="url"
                                value={item.beforeImageUrl || ''}
                                onChange={(e) => {
                                  if (!config.transformations?.items) return;
                                  const next = [...config.transformations.items];
                                  next[idx] = { ...next[idx], beforeImageUrl: e.target.value };
                                  if (updateTransformations) updateTransformations({ items: next });
                                }}
                                placeholder="https://... (الصق رابط صورة قبل التحول المباشر)"
                                className="w-full bg-[#111] border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:border-[#FFE600] focus:outline-none"
                              />
                            </div>

                            {/* AFTER Image URL Input */}
                            <div>
                              <label className="block text-[11px] font-bold text-[#FFE600] mb-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
                                <span>رابط صورة بعد التحول (AFTER Photo URL - Right Side)</span>
                              </label>
                              <input
                                type="url"
                                value={item.afterImageUrl || ''}
                                onChange={(e) => {
                                  if (!config.transformations?.items) return;
                                  const next = [...config.transformations.items];
                                  next[idx] = { ...next[idx], afterImageUrl: e.target.value };
                                  if (updateTransformations) updateTransformations({ items: next });
                                }}
                                placeholder="https://... (الصق رابط صورة بعد التحول المباشر)"
                                className="w-full bg-[#111] border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:border-[#FFE600] focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Live 1200 x 675 (16:9) Split Preview Box */}
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-neutral-400 block mb-1.5">
                              معاينة حية لتنسيق قبل وبعد 16:9 (Live Comparison Preview - اليسار قبل واليمين بعد):
                            </span>
                            <div dir="ltr" className="relative w-full max-w-lg aspect-[16/9] bg-neutral-950 border border-neutral-700 rounded-md overflow-hidden flex items-stretch mx-auto select-none">
                              {/* Left BEFORE */}
                              <div className="w-1/2 h-full relative overflow-hidden bg-neutral-900 border-r border-neutral-800">
                                {beforeImg ? (
                                  <img
                                    src={beforeImg}
                                    alt="Before Preview"
                                    className="w-full h-full object-cover object-center"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-neutral-500">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[9px]">صورة قبل (BEFORE)</span>
                                  </div>
                                )}
                                <span className="absolute top-2 left-2 bg-black/85 text-neutral-200 text-[9px] font-black px-1.5 py-0.5 rounded border border-neutral-700 uppercase">
                                  BEFORE • قبل
                                </span>
                              </div>

                              {/* Right AFTER */}
                              <div className="w-1/2 h-full relative overflow-hidden bg-neutral-900">
                                {afterImg ? (
                                  <img
                                    src={afterImg}
                                    alt="After Preview"
                                    className="w-full h-full object-cover object-center"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-neutral-500">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[9px]">صورة بعد (AFTER)</span>
                                  </div>
                                )}
                                <span className="absolute top-2 right-2 bg-[#FFE600] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-heading">
                                  AFTER • بعد
                                </span>
                              </div>

                              {/* Center Divider & VS Badge */}
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#FFE600] pointer-events-none" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black border border-[#FFE600] text-[#FFE600] text-[8px] font-black flex items-center justify-center pointer-events-none font-heading">
                                VS
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fields: Name, Duration, Weight Change / Result, Tag */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                              اسم البطل / المتدرب (Name) *
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                if (!config.transformations?.items) return;
                                const next = [...config.transformations.items];
                                next[idx] = { ...next[idx], name: e.target.value };
                                if (updateTransformations) updateTransformations({ items: next });
                              }}
                              placeholder="مثال: أحمد كمال"
                              className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                              المدة الزمنية (Duration)
                            </label>
                            <input
                              type="text"
                              value={item.duration || ''}
                              onChange={(e) => {
                                if (!config.transformations?.items) return;
                                const next = [...config.transformations.items];
                                next[idx] = { ...next[idx], duration: e.target.value };
                                if (updateTransformations) updateTransformations({ items: next });
                              }}
                              placeholder="مثال: 90 يوم / 3 شهور"
                              className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-[#FFE600] font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                              النتيجة المحققة (Result)
                            </label>
                            <input
                              type="text"
                              value={item.weightChange || ''}
                              onChange={(e) => {
                                if (!config.transformations?.items) return;
                                const next = [...config.transformations.items];
                                next[idx] = { ...next[idx], weightChange: e.target.value };
                                if (updateTransformations) updateTransformations({ items: next });
                              }}
                              placeholder="مثال: -18 كجم دهون / +6 كجم عضل"
                              className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                              نوع التحول (Tag / Category)
                            </label>
                            <input
                              type="text"
                              value={item.tag || ''}
                              onChange={(e) => {
                                if (!config.transformations?.items) return;
                                const next = [...config.transformations.items];
                                next[idx] = { ...next[idx], tag: e.target.value };
                                if (updateTransformations) updateTransformations({ items: next });
                              }}
                              placeholder="مثال: تنشيف وتقسيم عضلات"
                              className="w-full bg-black border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Detailed Description */}
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                            وصف وتفاصيل قصة التحول (Description) *
                          </label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              if (!config.transformations?.items) return;
                              const next = [...config.transformations.items];
                              next[idx] = { ...next[idx], description: e.target.value };
                              if (updateTransformations) updateTransformations({ items: next });
                            }}
                            placeholder="اكتب تفاصيل التغيير والالتزام والنتائج التي حققها المتدرب..."
                            className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-xs text-white leading-relaxed focus:border-[#FFE600] focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Additional Add Button at bottom for convenience */}
                {config.transformations?.items && config.transformations.items.length > 0 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const currentItems = config.transformations?.items || [];
                        const newItem: TransformationItem = {
                          id: `trans-${Date.now()}`,
                          name: '',
                          duration: '90 يوم',
                          weightChange: '-12 كجم',
                          tag: 'تنشيف وبناء عضل',
                          description: '',
                          beforeImageUrl: '',
                          afterImageUrl: '',
                          imageUrl: '',
                        };
                        if (updateTransformations) {
                          updateTransformations({ items: [...currentItems, newItem] }, true);
                        }
                        setSaveToast(true);
                        setTimeout(() => setSaveToast(false), 2500);
                      }}
                      className="inline-flex items-center gap-2 bg-[#FFE600] hover:bg-[#ffe100] text-black font-black text-xs px-6 py-2.5 rounded-sm shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة قصة تحول أخرى (Add Another Transformation)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT & SOCIALS */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-md">
                <h3 className="font-heading font-black text-xl text-white mb-1">
                  بيانات التواصل وروابط السوشيال ميديا (GET IN TOUCH)
                </h3>
                <p className="text-xs text-neutral-400">
                  تعديل رقم الواتساب المباشر، البريد الإلكتروني، وحسابات تيك توك وإنستجرام وفيسبوك.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#FFE600] mb-1">
                    رقم الواتساب المباشر (Direct WhatsApp Number) *
                  </label>
                  <input
                    type="text"
                    value={config.contact.whatsappNumber}
                    onChange={(e) => updateContact({ whatsappNumber: e.target.value })}
                    className="w-full bg-black border-2 border-[#FFE600] rounded-sm px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    placeholder="+201000000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    البريد الإلكتروني الرسمي (Email)
                  </label>
                  <input
                    type="email"
                    value={config.contact.email}
                    onChange={(e) => updateContact({ email: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-black/60 p-4 border border-neutral-800 rounded-md space-y-3">
                <h4 className="text-xs font-bold text-[#FFE600]">حسابات التواصل الاجتماعي:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Instagram Profile Link</label>
                    <input
                      type="text"
                      value={config.contact.socials.instagram}
                      onChange={(e) =>
                        updateContact({
                          socials: { ...config.contact.socials, instagram: e.target.value },
                        })
                      }
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">TikTok Account Link</label>
                    <input
                      type="text"
                      value={config.contact.socials.tiktok}
                      onChange={(e) =>
                        updateContact({
                          socials: { ...config.contact.socials, tiktok: e.target.value },
                        })
                      }
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Facebook Page Link</label>
                    <input
                      type="text"
                      value={config.contact.socials.facebook}
                      onChange={(e) =>
                        updateContact({
                          socials: { ...config.contact.socials, facebook: e.target.value },
                        })
                      }
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">YouTube Channel Link</label>
                    <input
                      type="text"
                      value={config.contact.socials.youtube || ''}
                      onChange={(e) =>
                        updateContact({
                          socials: { ...config.contact.socials, youtube: e.target.value },
                        })
                      }
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FOOTER & POLICIES */}
          {activeTab === 'footer' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-md">
                <h3 className="font-heading font-black text-xl text-white mb-1">
                  الفوتر والسياسات القانونية (FOOTER & POLICIES)
                </h3>
                <p className="text-xs text-neutral-400">
                  تعديل حقوق الملكية، شروط الاستخدام، سياسة الخصوصية، وصفحة الدعم الفني والمساعدة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  نص حقوق الملكية (Copyright Notice)
                </label>
                <input
                  type="text"
                  value={config.footer.copyrightText}
                  onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  محتوى شروط الخدمة والاستخدام (Terms & Conditions)
                </label>
                <textarea
                  rows={4}
                  value={config.footer.termsContent}
                  onChange={(e) => updateFooter({ termsContent: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  محتوى سياسة الخصوصية (Privacy Policy)
                </label>
                <textarea
                  rows={4}
                  value={config.footer.privacyContent}
                  onChange={(e) => updateFooter({ privacyContent: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  محتوى صفحة المساعدة والدعم الفني (Support & Help)
                </label>
                <textarea
                  rows={4}
                  value={config.footer.supportContent}
                  onChange={(e) => updateFooter({ supportContent: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-sm px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 8: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-md">
                <h3 className="font-heading font-black text-xl text-white mb-1">
                  النسخ الاحتياطي واستعادة البيانات (BACKUP & RESTORE)
                </h3>
                <p className="text-xs text-neutral-400">
                  تصدير كامل إعدادات الموقع، الفيديوهات، والأسعار إلى ملف JSON أو استيراد نسخة سابقة أو استعادة الضبط الأصلي.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/60 p-5 border border-neutral-800 rounded-md flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-heading font-black text-base text-[#FFE600] mb-1">
                      تصدير نسخة احتياطية (EXPORT JSON)
                    </h4>
                    <p className="text-xs text-neutral-300">
                      قم بتحميل ملف يحتوي على كامل بيانات الموقع لحفظه بأمان على جهازك واستعادته في أي وقت.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportConfigJSON}
                    className="w-full py-2.5 bg-[#FFE600] hover:bg-[#fff033] text-black font-heading font-black text-sm rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل ملف النسخة الاحتياطية</span>
                  </button>
                </div>

                <div className="bg-black/60 p-5 border border-neutral-800 rounded-md flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-heading font-black text-base text-white mb-1">
                      استيراد نسخة سابقة (IMPORT JSON)
                    </h4>
                    <p className="text-xs text-neutral-300">
                      رفع ملف نسخة احتياطية JSON لتطبيق كافة الإعدادات والأسعار المحفوظة مسبقاً.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const res = importConfigJSON(evt.target?.result as string);
                            if (!res.success) {
                              setImportError(res.error || 'الملف غير صالح');
                            } else {
                              setImportError(null);
                              triggerSaveNotification();
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="text-xs text-neutral-400 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                    />
                    {importError && (
                      <p className="text-xs text-red-400 mt-2 font-bold">{importError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hard Reset Box */}
              <div className="bg-red-950/20 border border-red-900/60 p-5 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-heading font-black text-base text-red-400 mb-1">
                    استعادة الإعدادات الافتراضية الأصلية (RESET TO DEFAULTS)
                  </h4>
                  <p className="text-xs text-neutral-400">
                    سيتم مسح كافة التعديلات المخزنة واسترجاع التصميم والمحتوى الأصلي المعتمد.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الأصلية للموقع؟')) {
                      resetToDefaults();
                      triggerSaveNotification();
                    }
                  }}
                  className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-heading font-bold text-xs rounded-sm whitespace-nowrap cursor-pointer"
                >
                  استعادة الضبط الأصلي
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#0e0e0e] border-t border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>قاعدة البيانات السحابية (Cloud Firestore) متصلة ونشطة</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FFE600] hover:bg-[#fff033] text-black font-heading font-black text-xs uppercase tracking-wider rounded-sm cursor-pointer"
          >
            إغلاق لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};
