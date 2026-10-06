export interface HeroData {
  badge: string;
  mainTitle: string;
  highlightText: string; // e.g. "[ BE YOURSELF ]"
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  overlayDarkness: number; // 0 to 100
}

export interface CoachStat {
  value: string;
  label: string;
}

export interface AboutCoachData {
  sectionTitle: string;
  coachName: string;
  coachTitle?: string;
  subtitle: string;
  paragraphs: string[];
  bioParagraph1?: string;
  bioParagraph2?: string;
  credentials: string[];
  stats: CoachStat[];
  primaryPhoto: string;
  primaryImage?: string;
  secondaryPhoto?: string;
  secondaryImage?: string;
  signatureText?: string;
}

export interface ReelVideoItem {
  id: string;
  title: string;
  stepNumber: string;
  description: string;
  videoUrl: string;
  posterUrl?: string;
  badge?: string;
}

export interface HowToSubscriptionData {
  sectionTitle: string;
  subtitle: string;
  reels: ReelVideoItem[];
}

export interface CalorieCalculatorData {
  badge?: string;
  sectionTitle?: string;
  subtitle?: string;
  ctaText?: string;
}

export interface PlanDurationPrice {
  id: string;
  months: number;
  label: string;
  labelAr?: string;
  price: number;
  isDefault?: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  currency?: string; // e.g. 'EGP' or '$'
  durationPrices?: PlanDurationPrice[];
  defaultDurationMonths?: number;
  duration: string;
  price: string;
  originalPrice?: string;
  periodText: string;
  isPopular?: boolean;
  badgeText?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  image?: string;
}

export interface PaymentInfo {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  instapayAddress?: string;
  vodafoneCashNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  accountHolderName?: string;
  currencyConversionRate?: string;
  transferInstructions?: string;
  fawryNumber?: string;
  paypalEmail?: string;
  notes?: string;
}

export interface MembershipPlansData {
  sectionTitle: string;
  subtitle: string;
  plans: MembershipPlan[];
}

export interface TransformationItem {
  id: string;
  name: string;
  description: string;
  duration?: string;
  weightChange?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  imageUrl?: string;
  tag?: string;
}

export interface TransformationsData {
  sectionTitle: string;
  subtitle: string;
  badge?: string;
  items: TransformationItem[];
}

export interface HealthierChoiceFeature {
  id: string;
  iconName: 'dumbbell' | 'apple' | 'flame' | 'activity' | 'shield' | 'target' | 'heart' | 'zap';
  title: string;
  description: string;
  highlightNumber?: string;
  imageBg?: string;
}

export interface HealthierChoicesData {
  sectionTitle: string;
  subtitle: string;
  features: HealthierChoiceFeature[];
}

export interface SocialLinks {
  facebook: string;
  tiktok: string;
  instagram: string;
  whatsapp: string;
  youtube?: string;
}

export interface GetInTouchData {
  sectionTitle: string;
  subtitle: string;
  backgroundImage: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  location: string;
  socials: SocialLinks;
}

export interface FooterData {
  brandName: string;
  tagline: string;
  copyrightText: string;
  termsContent: string;
  privacyContent: string;
  supportContent: string;
}

export interface SiteConfig {
  hero: HeroData;
  about: AboutCoachData;
  subscription?: HowToSubscriptionData;
  calculator?: CalorieCalculatorData;
  plans: MembershipPlansData;
  paymentInfo?: PaymentInfo;
  transformations: TransformationsData;
  choices?: HealthierChoicesData;
  contact: GetInTouchData;
  footer: FooterData;
}
