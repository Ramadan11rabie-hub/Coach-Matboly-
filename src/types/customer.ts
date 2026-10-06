export interface CustomerRegistration {
  id: string;
  name: string;
  countryCode: string;
  countryDialCode: string;
  countryName: string;
  rawPhoneNumber: string;
  fullInternationalPhone: string; // e.g. "+201001234567"
  email?: string;
  selectedPlanId: string;
  selectedPlanName: string; // e.g. "12 WEEKS VIP PROTOCOL"
  selectedPlanDuration: string;
  selectedPlanPrice: string;
  fitnessGoal?: string;
  trainingExperience?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string; // ISO string
  createdAtTimestamp: number;
}
