import { SiteConfig } from '../types/fitness';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hero: {
    badge: 'ELITE ONLINE & IN-PERSON COACHING',
    mainTitle: 'COACH MATBOLY',
    highlightText: '[ BE YOURSELF ]',
    subheadline: 'TRANSFORM YOUR PHYSIQUE, ELEVATE YOUR DISCIPLINE, UNLEASH YOUR TRUE POTENTIAL',
    buttonText: 'JOIN TODAY',
    buttonLink: '#membership-plans',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1600&auto=format&fit=crop',
    overlayDarkness: 0,
  },
  about: {
    sectionTitle: 'WHO IS COACH MATBOLY',
    coachName: 'Coach Matboly',
    subtitle: 'PROFESSIONAL FITNESS ATHLETE & MASTER TRANSFORMATION COACH',
    paragraphs: [
      'With over a decade of high-performance coaching experience, Coach Matboly has helped hundreds of dedicated individuals break through genetic plateaus, shed stubborn fat, and build sculpted, functional physiques.',
      'My coaching philosophy is rooted in science-backed training protocols, individualized nutritional precision, and uncompromising mental discipline. Whether you are stepping into the gym for the first time or preparing for peak athletic conditioning, we build a tailored roadmap designed exclusively for your lifestyle.',
    ],
    credentials: [
      'Certified Strength & Conditioning Specialist (CSCS)',
      'Advanced Sports Nutrition & Macronutrient Specialist',
      'Over 500+ Documented Client Body Transformations',
      'Former Competitive Physique Athlete & Trainer',
    ],
    stats: [
      { value: '10+', label: 'Years Coaching' },
      { value: '500+', label: 'Transformations' },
      { value: '98%', label: 'Success Rate' },
      { value: '24/7', label: 'Direct Support' },
    ],
    primaryPhoto: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    secondaryPhoto: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    signatureText: 'COACH MATBOLY',
  },
  subscription: {
    sectionTitle: 'HOW TO SUBSCRIPTION',
    subtitle: 'FOLLOW THESE 3 SIMPLE STEPS TO START YOUR PERSONALIZED JOURNEY TODAY',
    reels: [
      {
        id: 'reel-1',
        stepNumber: '01',
        title: 'SELECT YOUR GOAL & PLAN',
        description: 'Choose your desired membership tier that matches your timeline and personal fitness aspirations.',
        videoUrl: 'https://assets.mixkit.co/videos/1199/1199-720.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
        badge: 'STEP 1',
      },
      {
        id: 'reel-2',
        stepNumber: '02',
        title: 'RECEIVE CUSTOM PROTOCOL',
        description: 'Get your customized training split, macro targets, and form video guides directly on your phone.',
        videoUrl: 'https://assets.mixkit.co/videos/43666/43666-720.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
        badge: 'STEP 2',
      },
      {
        id: 'reel-3',
        stepNumber: '03',
        title: 'EXECUTE & TRANSFORM',
        description: 'Track weekly check-ins with Coach Matboly, adjust metrics in real-time, and guarantee results.',
        videoUrl: 'https://assets.mixkit.co/videos/34563/34563-720.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop',
        badge: 'STEP 3',
      },
    ],
  },
  calculator: {
    badge: 'حاسبة السعرات والماكروز الذكية',
    sectionTitle: 'احسب احتياج جسمك وسعراتك بدقة',
    subtitle: 'معادلة علمية معتمدة لحساب معدل الحرق اليومي، السعرات المناسبة لهدفك، والماكروز (بروتين، كارب، دهون)',
    ctaText: 'ابدأ خطتك التدريبية والغذائية المخصصة الآن',
  },
  plans: {
    sectionTitle: 'MEMBERSHIP PLANS',
    subtitle: 'INVEST IN YOUR HEALTH AND GET TAILORED COACHING DESIGNED FOR GUARANTEED RESULTS',
    plans: [
      {
        id: 'plan-1',
        name: 'STARTER PASS',
        currency: 'EGP',
        duration: '1 MONTH',
        price: '500 EGP',
        periodText: 'Monthly Commitment',
        isPopular: false,
        badgeText: 'GETTING STARTED',
        description: 'Ideal for kickstarting your routine with customized workout splits and nutrition guidelines.',
        durationPrices: [
          { id: 'p1-1', months: 1, label: '1 Month', labelAr: 'شهر واحد', price: 500, isDefault: true },
          { id: 'p1-2', months: 2, label: '2 Months', labelAr: 'شهرين', price: 950 },
          { id: 'p1-3', months: 3, label: '3 Months', labelAr: '3 شهور', price: 1350 },
        ],
        features: [
          'Personalized Workout Split (Gym/Home)',
          'Customized Macronutrient Targets',
          'Weekly Email Progress Check-ins',
          'Exercise Video Demonstration Library',
          'Private Community Support Group',
        ],
        ctaText: 'START 1 MONTH',
        ctaLink: '#checkout',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'plan-2',
        name: 'MOMENTUM BUILDER',
        currency: 'EGP',
        duration: '3 MONTHS',
        price: '1,200 EGP',
        originalPrice: '1,500 EGP',
        periodText: 'Total / Save 20%',
        isPopular: true,
        badgeText: 'MOST POPULAR',
        description: 'The optimal timeframe to build sustainable muscle mass, shed body fat, and create permanent habits.',
        durationPrices: [
          { id: 'p2-1', months: 1, label: '1 Month', labelAr: 'شهر واحد', price: 500 },
          { id: 'p2-2', months: 2, label: '2 Months', labelAr: 'شهرين', price: 900 },
          { id: 'p2-3', months: 3, label: '3 Months', labelAr: '3 شهور', price: 1200, isDefault: true },
          { id: 'p2-6', months: 6, label: '6 Months', labelAr: '6 شهور', price: 2200 },
        ],
        features: [
          'Everything in Starter Pass',
          'Weekly 1-on-1 Video Form Assessment',
          'Bi-Weekly Nutrition & Calorie Tweaks',
          'Direct WhatsApp Messaging Access',
          'Supplementation Protocol & Guide',
          'Progressive Overload Tracking Sheet',
        ],
        ctaText: 'JOIN 3 MONTHS',
        ctaLink: '#checkout',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'plan-3',
        name: 'TOTAL TRANSFORMATION',
        currency: 'EGP',
        duration: '6 MONTHS',
        price: '2,200 EGP',
        originalPrice: '3,000 EGP',
        periodText: 'Total / Save 27%',
        isPopular: false,
        badgeText: 'BEST VALUE',
        description: 'A complete physical overhaul for those serious about dramatic aesthetic and athletic results.',
        durationPrices: [
          { id: 'p3-1', months: 1, label: '1 Month', labelAr: 'شهر واحد', price: 500 },
          { id: 'p3-3', months: 3, label: '3 Months', labelAr: '3 شهور', price: 1200 },
          { id: 'p3-6', months: 6, label: '6 Months', labelAr: '6 شهور', price: 2200, isDefault: true },
          { id: 'p3-12', months: 12, label: '12 Months', labelAr: 'سنة كاملة', price: 4000 },
        ],
        features: [
          'Everything in Momentum Plan',
          'Priority 24/7 WhatsApp Voice Support',
          'Dynamic Cardio & Conditioning Split',
          'Plateau-Busting Periodization Blocks',
          'Travel & Restaurant Dining Cheat Sheets',
          'Personalized Mobility & Recovery Routine',
        ],
        ctaText: 'JOIN 6 MONTHS',
        ctaLink: '#checkout',
        imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'plan-4',
        name: 'ELITE VIP YEAR',
        currency: 'EGP',
        duration: '12 MONTHS',
        price: '4,000 EGP',
        originalPrice: '6,000 EGP',
        periodText: 'Total / Save 33%',
        isPopular: false,
        badgeText: 'MAXIMUM GAINS',
        description: 'Year-round elite mentorship with Coach Matboly. Total body recomposition and peak performance.',
        durationPrices: [
          { id: 'p4-1', months: 1, label: '1 Month', labelAr: 'شهر واحد', price: 500 },
          { id: 'p4-3', months: 3, label: '3 Months', labelAr: '3 شهور', price: 1200 },
          { id: 'p4-6', months: 6, label: '6 Months', labelAr: '6 شهور', price: 2200 },
          { id: 'p4-12', months: 12, label: '12 Months', labelAr: 'سنة كاملة', price: 4000, isDefault: true },
        ],
        features: [
          'Full 365-Day Complete VIP Access',
          '1-on-1 Monthly Strategy Zoom Calls',
          'Unlimited Workout Plan Revisions',
          'Real-Time Meal Adjustments & Coaching',
          'Exclusive VIP Merch Welcome Pack',
          'Guaranteed Results Transformation Contract',
        ],
        ctaText: 'JOIN 12 MONTHS',
        ctaLink: '#checkout',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  transformations: {
    badge: 'TRANSFORMATION STORIES • قبل وبعد',
    sectionTitle: 'قصص ونتائج التحول الحقيقية',
    subtitle: 'شاهد التغييرات المذهلة للأبطال الذين التزموا بخطط وبرامج كوتش المتبولي المخصصة',
    items: [
      {
        id: 'trans-1',
        name: 'أحمد كمال (Ahmed Kamal)',
        duration: '90 يوم (12 أسبوع)',
        weightChange: '-18 كجم دهون',
        tag: 'تنشيف وبناء عضل صافي',
        description: 'تحول كامل من نسبة دهون 28% إلى 11% مع بناء كتلة عضلية واضحة وتقسيم عضلات البطن بدون حرمان أو تعب.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        afterImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'trans-2',
        name: 'محمود عبد الرحمن (Mahmoud A.)',
        duration: '6 أشهر (24 أسبوع)',
        weightChange: '-26 كجم وزن',
        tag: 'خسارة وزن جذرية وتغيير نمط حياة',
        description: 'خسارة ملحوظة في دهون البطن والخصر وزيادة هائلة في طاقة الجسم والنشاط اليومي مع التزام بالتمارين والتغذية.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        afterImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'trans-3',
        name: 'كابتن طارق علي (Tarek Ali)',
        duration: '4 أشهر (16 أسبوع)',
        weightChange: '+7 كجم عضل صافي',
        tag: 'تضخيم وبناء كتل عضلية',
        description: 'برنامج غذائي وتدريبي مكثف لرفع الأوزان وزيادة الحجم العضلي وتفصيل الصدر والظهر والأكتاف.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        afterImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'trans-4',
        name: 'عمر شريف (Omar Sherif)',
        duration: '90 يوم (12 أسبوع)',
        weightChange: '-14 كجم دهون',
        tag: 'تنشيف وتقسيم الجسم',
        description: 'إبراز تفاصيل العضلات وتقسيم عضلات البطن مع الحفاظ على القوة العضلية والأداء الرياضي العالي.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
        afterImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'trans-5',
        name: 'يوسف حسام (Youssef H.)',
        duration: '120 يوم (16 أسبوع)',
        weightChange: '-21 كجم',
        tag: 'إعادة تشكيل الجسم (Body Recomposition)',
        description: 'تحول جذري في شكل القوام وتحسين الصحة العامة واللياقة البدنية تحت إشراف وتوجيه كوتش المتبولي المباشر.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        afterImageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
        imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'trans-6',
        name: 'سيف الدين (Seif Eldin)',
        duration: '75 يوم',
        weightChange: '-11 كجم دهون',
        tag: 'لياقة وقوة بدنية',
        description: 'وصول لأفضل فورمة رياضية مع زيادة قدرة التحمل العضلي والرشاقة في وقت قياسي.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        afterImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  choices: {
    sectionTitle: 'MAKE HEALTHIER CHOICES',
    subtitle: 'THE THREE PILLARS OF LIFELONG PHYSICAL AND MENTAL EXCELLENCE',
    features: [
      {
        id: 'choice-1',
        iconName: 'dumbbell',
        title: 'CUSTOMIZED WORKOUT REGIMEN',
        description: 'Every rep, set, tempo, and rest period is calibrated to your biomechanics, training age, and target goals.',
        highlightNumber: '01',
        imageBg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'choice-2',
        iconName: 'apple',
        title: 'SUSTAINABLE NUTRITION PROTOCOL',
        description: 'No starving, no extreme bland diets. Enjoy delicious foods calculated precisely for your metabolism and body fat loss.',
        highlightNumber: '02',
        imageBg: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'choice-3',
        iconName: 'shield',
        title: '24/7 ACCOUNTABILITY & COACHING',
        description: 'Direct access to Coach Matboly to eliminate guesswork, fix technique mistakes, and keep you disciplined every single day.',
        highlightNumber: '03',
        imageBg: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop',
      },
    ],
  },
  contact: {
    sectionTitle: 'GET IN TOUCH TODAY',
    subtitle: 'START YOUR TRANSFORMATION WITH COACH MATBOLY - REACH OUT DIRECTLY VIA WHATSAPP OR SOCIALS',
    backgroundImage: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=1600&auto=format&fit=crop',
    whatsappNumber: '+201000000000',
    email: 'coach@coachmatboly.com',
    phone: '+20 100 000 0000',
    location: 'Elite Training Facility & Worldwide Online Coaching',
    socials: {
      facebook: 'https://facebook.com',
      tiktok: 'https://tiktok.com',
      instagram: 'https://instagram.com',
      whatsapp: 'https://wa.me/201000000000',
      youtube: 'https://youtube.com',
    },
  },
  footer: {
    brandName: 'COACH MATBOLY',
    tagline: 'TRANSFORM YOUR BODY. ELEVATE YOUR MIND.',
    copyrightText: `© ${new Date().getFullYear()} COACH MATBOLY FITNESS. ALL RIGHTS RESERVED.`,
    termsContent: `TERMS & CONDITIONS - COACH MATBOLY FITNESS COACHING

1. COACHING SERVICES
Coach Matboly provides customized online training, nutritional guidance, and direct coaching. All workout and dietary recommendations are designed for healthy individuals and should be followed under personal responsibility.

2. HEALTH & MEDICAL CLEARANCE
Before starting any physical exercise or nutrition program, clients are strongly advised to consult with a qualified medical professional. Coach Matboly does not provide medical diagnoses or treatment.

3. SUBSCRIPTION & PAYMENTS
All membership plans are paid upfront for the designated duration (1, 3, 6, or 12 months). Upon successful payment, customized programs are delivered following the onboarding assessment.

4. CANCELLATION & REFUND POLICY
Due to the digital and custom nature of personalized training and nutritional programs, fees are non-refundable once the customized plan has been generated and delivered.

5. CLIENT CONDUCT & COMMUNICATION
Clients are expected to uphold respectful communication during weekly check-ins and WhatsApp interactions. Dedicated coaching support is provided in accordance with the purchased tier.`,
    privacyContent: `PRIVACY POLICY - COACH MATBOLY FITNESS

1. INFORMATION WE COLLECT
We collect personal information necessary to design your custom fitness plans, including your name, contact details, age, body weight, fitness history, and dietary preferences.

2. HOW WE USE YOUR INFORMATION
Your personal data is used solely to:
- Deliver customized workout and meal plans
- Conduct weekly check-ins and progress assessments
- Provide customer support and program updates

3. DATA SECURITY & CONFIDENTIALITY
All client check-in photos, measurements, and personal data are kept strictly confidential and will never be shared, sold, or publicly displayed without your explicit written consent.

4. COOKIES & LOCAL STORAGE
This website uses local browser storage to remember your user preferences and dashboard settings.

5. CONTACT PRIVACY OFFICER
For privacy inquiries, please contact: privacy@coachmatboly.com`,
    supportContent: `SUPPORT & CLIENT ASSISTANCE

Need help with your subscription or have questions for Coach Matboly?

- WHATSAPP: Fast direct response on WhatsApp
- EMAIL: support@coachmatboly.com
- RESPONSE TIME: Within 24 Hours on Business Days
- WORKING HOURS: Saturday - Thursday: 9:00 AM - 9:00 PM

Check-in Schedule:
- Weekly check-in forms are submitted every week.
- Program updates and coaching video reviews are returned within 24-48 hours.`,
  },
};
