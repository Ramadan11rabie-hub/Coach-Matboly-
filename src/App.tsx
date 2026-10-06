/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSiteConfig } from './hooks/useSiteConfig';
import { useCustomers } from './hooks/useCustomers';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutCoachSection } from './components/AboutCoachSection';
import { CalorieCalculatorSection } from './components/CalorieCalculatorSection';
import { MembershipPlansSection } from './components/MembershipPlansSection';
import { TransformationsSection } from './components/TransformationsSection';
import { GetInTouchSection } from './components/GetInTouchSection';
import { FooterSection } from './components/FooterSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PlanCheckoutModal } from './components/PlanCheckoutModal';
import { LegalModal } from './components/LegalModal';
import { MembershipPlan } from './types/fitness';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { isRTL } = useLanguage();
  const {
    config,
    syncStatus,
    hasSavedNotice,
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
  } = useSiteConfig();

  const {
    customers,
    addCustomer,
    updateCustomerStatus,
    deleteCustomer,
  } = useCustomers();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('matboly_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'support' | null>(null);

  const handleOpenAdminSettings = () => {
    if (isAdminAuthenticated) {
      setIsDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('matboly_admin_auth', 'true');
    } catch {
      // ignore
    }
    setIsAdminLoginOpen(false);
    setIsDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('matboly_admin_auth');
    } catch {
      // ignore
    }
    setIsDashboardOpen(false);
  };

  const handleOpenCheckout = (planId?: string) => {
    setSelectedPlanId(planId);
    setIsCheckoutOpen(true);
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlanId(plan.id);
    setIsCheckoutOpen(true);
  };

  return (
    <div className={`min-h-screen bg-[#0b0b0b] text-neutral-100 flex flex-col ${isRTL ? "font-['Cairo',sans-serif]" : "font-['Montserrat',sans-serif]"} selection:bg-[#FFE600] selection:text-black`}>
      {/* Top Navbar */}
      <Navbar
        config={config}
        onOpenCheckout={() => handleOpenCheckout()}
      />

      {/* Main Sections Stacked in Exact Requested Reference Order */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* 1. HERO / TOP BANNER */}
        <HeroSection
          data={config.hero}
          onJoinClick={() => handleOpenCheckout()}
        />

        {/* 2. WHO IS COACH MATBOLY */}
        <AboutCoachSection
          data={config.about}
          onJoinClick={() => handleOpenCheckout()}
        />

        {/* 3. CALORIE CALCULATOR */}
        <CalorieCalculatorSection
          data={config.calculator}
          onJoinClick={() => handleOpenCheckout()}
        />

        {/* 4. MEMBERSHIP PLANS (2 Plans per Row) */}
        <MembershipPlansSection
          data={config.plans}
          onSelectPlan={handleSelectPlan}
        />

        {/* 5. CLIENT TRANSFORMATIONS (Full-Width Animated Scrolling Banner) */}
        <TransformationsSection
          data={config.transformations}
          onJoinClick={() => handleOpenCheckout()}
        />

        {/* 6. GET IN TOUCH TODAY */}
        <GetInTouchSection
          data={config.contact}
        />
      </main>

      {/* 7. FOOTER WITH SETTINGS BUTTON */}
      <FooterSection
        data={config.footer}
        onOpenDashboard={handleOpenAdminSettings}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      {/* SECURE ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* ADMIN CMS DASHBOARD MODAL */}
      <AdminDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onLogout={handleAdminLogout}
        syncStatus={syncStatus}
        hasSavedNotice={hasSavedNotice}
        config={config}
        updateHero={updateHero}
        updateAbout={updateAbout}
        updateSubscription={updateSubscription}
        updateCalculator={updateCalculator}
        updatePlans={updatePlans}
        updateTransformations={updateTransformations}
        deleteTransformation={deleteTransformation}
        updateChoices={updateChoices}
        updateContact={updateContact}
        updateFooter={updateFooter}
        updatePaymentInfo={updatePaymentInfo}
        saveAllChangesImmediately={saveAllChangesImmediately}
        resetToDefaults={resetToDefaults}
        exportConfigJSON={exportConfigJSON}
        importConfigJSON={importConfigJSON}
        customers={customers}
        updateCustomerStatus={updateCustomerStatus}
        deleteCustomer={deleteCustomer}
      />

      {/* PLAN CHECKOUT & INTAKE MODAL (With Country Code & Flag Selector + Firestore Persistence) */}
      <PlanCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlanId={selectedPlanId}
        config={config}
        onSaveCustomer={addCustomer}
      />

      {/* LEGAL & SUPPORT MODAL */}
      <LegalModal
        isOpen={!!legalModalType}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        data={config.footer}
      />
    </div>
  );
}
