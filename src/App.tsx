import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { PalPortalPage } from './pages/PalPortalPage';
import { HospitalPortalPage } from './pages/HospitalPortalPage';
import { AboutAndImpactPage } from './pages/AboutAndImpactPage';
import { PalSignupPage } from './pages/PalSignupPage';
import { PalVerifyPage } from './pages/PalVerifyPage';
import { Footer } from './components/Footer';

import { RequestPalModal } from './components/RequestPalModal';
import { BecomePalModal } from './components/BecomePalModal';
import { PalAccountModal } from './components/PalAccountModal';
import { PaymentModal } from './components/PaymentModal';
import { LiveGpsTrackerModal } from './components/LiveGpsTrackerModal';
import { ChargesAndEarningsModal } from './components/ChargesAndEarningsModal';
import { PushNotificationManager } from './components/PushNotificationManager';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CalendarIntegrationModal } from './components/CalendarIntegrationModal';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { CareBotChat } from './components/CareBotChat';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';

type PageType = 'home' | 'patient' | 'pal' | 'hospital' | 'about' | 'pal-signup' | 'pal-verify';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [becomePalModalOpen, setBecomePalModalOpen] = useState(false);
  const [palAccountModalOpen, setPalAccountModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [chargesModalOpen, setChargesModalOpen] = useState(false);
  const [chargesModalTab, setChargesModalTab] = useState<'patient_charges' | 'pal_earnings'>('patient_charges');
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [keyboardModalOpen, setKeyboardModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [supabaseAuthModalOpen, setSupabaseAuthModalOpen] = useState(false);

  const handleOpenChargesModal = (tab: 'patient_charges' | 'pal_earnings' = 'patient_charges') => {
    setChargesModalTab(tab);
    setChargesModalOpen(true);
  };

  // Sync Hash and Path on mount and change
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase();
      const rawHash = window.location.hash.replace('#', '');
      const hashPage = rawHash.split('?')[0].toLowerCase();

      // Check if arriving on password reset recovery
      if (
        pathname.includes('/pal/reset') ||
        pathname.includes('/pal-reset') ||
        hashPage === 'pal-reset' ||
        window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery')
      ) {
        setCurrentPage('pal');
        return;
      }

      // Check if arriving on email verification route or auth callback
      if (
        pathname.includes('/pal/verify') ||
        pathname.includes('/pal-verify') ||
        hashPage === 'pal-verify' ||
        window.location.hash.includes('access_token') ||
        window.location.search.includes('type=signup') ||
        window.location.search.includes('type=email') ||
        window.location.search.includes('code=')
      ) {
        setCurrentPage('pal-verify');
        return;
      }

      if (hashPage === 'pal-apply' || hashPage === 'become-pal' || hashPage === 'apply-pal') {
        setBecomePalModalOpen(true);
        return;
      }

      if (
        hashPage === 'pal-signup' ||
        pathname.includes('/pal/signup') ||
        pathname.includes('/pal-signup')
      ) {
        setCurrentPage('pal-signup');
        return;
      }

      if (['home', 'patient', 'pal', 'hospital', 'about', 'pal-signup', 'pal-verify'].includes(hashPage)) {
        setCurrentPage(hashPage as PageType);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Global Keyboard Shortcuts for WCAG Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't override if user is typing in input or textarea, unless it's Alt shortcut
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if (e.altKey) {
        const key = e.key.toLowerCase();
        
        if (key === '1') {
          e.preventDefault();
          navigateToPage('home');
        } else if (key === '2') {
          e.preventDefault();
          navigateToPage('patient');
        } else if (key === '3') {
          e.preventDefault();
          navigateToPage('pal');
        } else if (key === '4') {
          e.preventDefault();
          navigateToPage('hospital');
        } else if (key === '5') {
          e.preventDefault();
          navigateToPage('about');
        } else if (key === 'r') {
          e.preventDefault();
          setRequestModalOpen(true);
        } else if (key === 'g') {
          e.preventDefault();
          setGpsModalOpen(true);
        } else if (key === 'k') {
          e.preventDefault();
          setKeyboardModalOpen(true);
        } else if (key === 'c') {
          e.preventDefault();
          setCalendarModalOpen(true);
        }
      } else if (e.key === 'Escape' && !isInput) {
        // Close modals on Escape
        setCalendarModalOpen(false);
        setKeyboardModalOpen(false);
        setRequestModalOpen(false);
        setBecomePalModalOpen(false);
        setPalAccountModalOpen(false);
        setPaymentModalOpen(false);
        setGpsModalOpen(false);
        setChargesModalOpen(false);
        setPushModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateToPage = (page: PageType) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#FFF8F9] text-[#1F3449] selection:bg-[#E85D75] selection:text-white font-sans antialiased flex flex-col justify-between">
          <div>
          {/* Offline Status Banner */}
          <OfflineStatusBanner />

          {/* Main Navigation Bar */}
          <Navbar
            currentPage={currentPage}
            onNavigatePage={navigateToPage}
            onRequestPal={() => setRequestModalOpen(true)}
            onBecomePal={() => setBecomePalModalOpen(true)}
            onOpenPayment={() => setPaymentModalOpen(true)}
            onOpenPalAccount={() => navigateToPage('pal')}
            onOpenGpsModal={() => setGpsModalOpen(true)}
            onOpenPushNotifications={() => setPushModalOpen(true)}
            onOpenKeyboardModal={() => setKeyboardModalOpen(true)}
            onOpenCalendarModal={() => setCalendarModalOpen(true)}
            onOpenSupabaseAuth={() => setSupabaseAuthModalOpen(true)}
          />

          {/* Dedicated Page Views */}
          <main className="min-h-[70vh]">
            {currentPage === 'home' && (
              <HomePage
                onNavigatePage={navigateToPage}
                onRequestPal={() => setRequestModalOpen(true)}
                onBecomePal={() => setBecomePalModalOpen(true)}
                onOpenGpsModal={() => setGpsModalOpen(true)}
                onOpenChargesModal={(tab) => handleOpenChargesModal(tab)}
              />
            )}

            {currentPage === 'patient' && (
              <PatientPortalPage
                onOpenGpsModal={() => setGpsModalOpen(true)}
                onOpenChargesModal={(tab) => handleOpenChargesModal(tab || 'patient_charges')}
                onOpenSupabaseAuth={() => setSupabaseAuthModalOpen(true)}
                onOpenRequestPal={() => setRequestModalOpen(true)}
              />
            )}

            {currentPage === 'pal' && (
              <PalPortalPage
                onOpenGpsModal={() => setGpsModalOpen(true)}
                onOpenChargesModal={(tab) => handleOpenChargesModal(tab || 'pal_earnings')}
                onBecomePal={() => setBecomePalModalOpen(true)}
              />
            )}

            {currentPage === 'hospital' && (
              <HospitalPortalPage />
            )}

            {currentPage === 'about' && (
              <AboutAndImpactPage
                onRequestPal={() => setRequestModalOpen(true)}
                onBecomePal={() => setBecomePalModalOpen(true)}
                onOpenPayment={() => setPaymentModalOpen(true)}
              />
            )}

            {currentPage === 'pal-signup' && (
              <PalSignupPage
                onNavigateToVerify={() => navigateToPage('pal-verify')}
                onNavigateToLogin={() => navigateToPage('pal')}
              />
            )}

            {currentPage === 'pal-verify' && (
              <PalVerifyPage
                onNavigateToLogin={() => navigateToPage('pal')}
                onNavigateToPortal={() => navigateToPage('pal')}
              />
            )}
          </main>
        </div>

        {/* Global Footer */}
        <Footer
          onRequestPal={() => setRequestModalOpen(true)}
          onBecomePal={() => setBecomePalModalOpen(true)}
        />

        {/* Interactive Modals */}
        <RequestPalModal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          onOpenAuth={() => setSupabaseAuthModalOpen(true)}
        />
        <BecomePalModal
          isOpen={becomePalModalOpen}
          onClose={() => setBecomePalModalOpen(false)}
        />
        <PalAccountModal
          isOpen={palAccountModalOpen}
          onClose={() => setPalAccountModalOpen(false)}
        />
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
        />
        <LiveGpsTrackerModal
          isOpen={gpsModalOpen}
          onClose={() => setGpsModalOpen(false)}
        />
        <ChargesAndEarningsModal
          isOpen={chargesModalOpen}
          onClose={() => setChargesModalOpen(false)}
          onRequestPal={() => setRequestModalOpen(true)}
          onBecomePal={() => setBecomePalModalOpen(true)}
          initialTab={chargesModalTab}
        />
        <PushNotificationManager
          isOpen={pushModalOpen}
          onClose={() => setPushModalOpen(false)}
        />
        <KeyboardShortcutsModal
          isOpen={keyboardModalOpen}
          onClose={() => setKeyboardModalOpen(false)}
        />
        <CalendarIntegrationModal
          isOpen={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
          userRole={currentPage === 'pal' ? 'pal' : 'patient'}
        />
        <SupabaseAuthModal
          isOpen={supabaseAuthModalOpen}
          onClose={() => setSupabaseAuthModalOpen(false)}
        />

        {/* Interactive CareBot Chatbot */}
        <CareBotChat />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

