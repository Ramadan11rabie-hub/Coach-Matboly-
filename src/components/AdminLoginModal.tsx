import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isRTL, logoUrl } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // Validate credentials: Username: Matboly, Password: coach@190
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    setTimeout(() => {
      if (
        (trimmedUser.toLowerCase() === 'matboly' || trimmedUser === 'Matboly') &&
        trimmedPass === 'coach@190'
      ) {
        setIsSubmitting(false);
        setUsername('');
        setPassword('');
        setErrorMessage('');
        onSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMessage(
          isRTL
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
            : 'Incorrect username or password. Please try again.'
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFE600] via-[#FFCC00] to-[#FFE600]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & Title */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-[#FFE600]/30 shadow-[0_0_20px_rgba(255,230,0,0.15)] mx-auto">
              <Lock className="w-7 h-7 text-[#FFE600]" />
            </div>

            <div>
              <h3 className="font-heading font-black text-2xl text-white tracking-wide uppercase">
                {isRTL ? 'تسجيل دخول الإدارة' : 'ADMIN LOGIN'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {isRTL
                  ? 'يرجى إدخال بيانات الدخول للوصول إلى لوحة التحكم والإعدادات'
                  : 'Enter your credentials to access the website management dashboard'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 flex items-center gap-2.5 text-red-200 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                {isRTL ? 'اسم المستخدم (Username)' : 'Username'}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Matboly"
                  className={`w-full bg-neutral-900/90 border border-neutral-700 rounded-lg ${
                    isRTL ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                  } py-3 text-sm text-white placeholder-neutral-600 focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] focus:outline-none transition-all`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                {isRTL ? 'كلمة المرور (Password)' : 'Password'}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-neutral-900/90 border border-neutral-700 rounded-lg ${
                    isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'
                  } py-3 text-sm text-white placeholder-neutral-600 focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] focus:outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3.5' : 'right-0 pr-3.5'} flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-[#FFE600] hover:bg-[#fff033] active:scale-[0.98] text-black font-heading font-black text-lg py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,230,0,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{isRTL ? 'دخول لوحة التحكم' : 'LOGIN TO DASHBOARD'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
            <p className="text-[11px] text-neutral-500">
              {isRTL
                ? 'لوحة إدارة المحتوى والاشتراكات خاصة بكوتش المتبولي فقط'
                : 'CMS & Subscription dashboard restricted to Coach Matboly'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
