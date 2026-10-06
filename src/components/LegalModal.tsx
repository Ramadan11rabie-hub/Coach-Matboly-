import React from 'react';
import { X, ShieldCheck, FileText, HelpCircle } from 'lucide-react';
import { FooterData } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';

interface LegalModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy' | 'support' | null;
  onClose: () => void;
  data: FooterData;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose, data }) => {
  const { t, language } = useLanguage();
  if (!isOpen || !type) return null;

  let title = t.footer.terms;
  let content = data.termsContent;
  let Icon = FileText;

  if (type === 'privacy') {
    title = t.footer.privacy;
    content = data.privacyContent;
    Icon = ShieldCheck;
  } else if (type === 'support') {
    title = t.footer.support;
    content = data.supportContent;
    Icon = HelpCircle;
  }

  if (language === 'ar') {
    if (type === 'terms') {
      content = 'شروط وأحكام التدريب والمتابعة مع كوتش المتبولي:\n1. جميع البرامج مصممة خصيصاً لكل متدرب بناءً على بيانات الاستبيان الصحي والبدني.\n2. يتم إرسال خطة التغذية والتمارين فور إتمام التسجيل وتأكيد البيانات.\n3. المتابعة أسبوعية من خلال الواتساب لتقييم التطور وتعديل السعرات والأوزان.\n4. نلتزم بأعلى معايير الخصوصية والأمان لكافة البيانات والصور الشخصية.';
    } else if (type === 'privacy') {
      content = 'سياسة الخصوصية وأمان البيانات:\nنحن في كوتش المتبولي نلتزم بحماية خصوصيتك ومعلوماتك الشخصية. لا يتم مشاركة أرقام الهواتف أو الصور أو التفاصيل الصحية مع أي جهة خارجية، وتستخدم فقط لغرض المتابعة الرياضية والغذائية الشخصية.';
    } else if (type === 'support') {
      content = 'خدمة العملاء والدعم الفني:\nلأي استفسار بخصوص الاشتراكات أو تعديل البيانات، يمكنك التواصل المباشر عبر الواتساب على مدار الساعة وسيقوم فريق الدعم أو الكابتن بالرد عليك في أقرب وقت.';
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141414] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0e0e0e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#FFE600] text-black flex items-center justify-center font-bold">
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-black text-xl text-white uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md bg-neutral-900 border border-neutral-700 hover:text-white text-neutral-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto whitespace-pre-wrap text-sm text-neutral-300 leading-relaxed font-sans">
          {content}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0e0e0e] border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#FFE600] hover:bg-[#fff033] text-black font-heading font-black text-sm px-5 py-2 rounded-sm uppercase tracking-wider cursor-pointer"
          >
            {t.checkout.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

