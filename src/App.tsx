import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { PalPortalPage } from './pages/PalPortalPage';
import { HospitalPortalPage } from './pages/HospitalPortalPage';
import { AboutAndImpactPage } from './pages/AboutAndImpactPage';
import { Footer } from './components/Footer';

import { RequestPalModal } from './components/RequestPalModal';
import { BecomePalModal } from './components/BecomePalModal';
import { HospitalPartnerModal } from './components/HospitalPartnerModal';
import { PalAccountModal } from './components/PalAccountModal';
import { PaymentModal } from './components/PaymentModal';
import { LiveGpsTrackerModal } from './components/LiveGpsTrackerModal';
import { ChargesAndEarningsModal } from './components/ChargesAndEarningsModal';
import { PushNotificationManager } from './components/PushNotificationManager';
import { SosEmergencyModal } from './components/SosEmergencyModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CalendarIntegrationModal } from './components/CalendarIntegrationModal';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { CareBotChat } from './components/CareBotChat';

type PageType = 'home' | 'patient' | 'pal' | 'hospital' | 'about';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [becomePalModalOpen, setBecomePalModalOpen] = useState(false);
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [palAccountModalOpen, setPalAccountModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [chargesModalOpen, setChargesModalOpen] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [keyboardModalOpen, setKeyboardModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // Sync Hash on mount and change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageType;
      if (['home', 'patient', 'pal', 'hospital', 'about'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Keyboard Shortcuts for WCAG Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't override if user is typing in input or textarea, unless it's Alt shortcut
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if (e.altKey) {
        const key = e.key.toLowerCase();
        
        if (key === 's' || key === 'e') {
          e.preventDefault();
          setSosModalOpen(true);
        } else if (key === '1') {
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
        setHospitalModalOpen(false);
        setPalAccountModalOpen(false);
        setPaymentModalOpen(false);
        setGpsModalOpen(false);
        setChargesModalOpen(false);
        setPushModalOpen(false);
        setSosModalOpen(false);
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
        <div className="min-h-screen bg-[#0A0D14] text-white selection:bg-[#00F0FF] selection:text-black font-sans antialiased flex flex-col justify-between">
          <div>
          {/* Offline Status Banner */}
          <OfflineStatusBanner onOpenSosModal={() => setSosModalOpen(true)} />

          {/* Main Navigation Bar */}
          <Navbar
            currentPage={currentPage}
            onNavigatePage={navigateToPage}
            onRequestPal={() => setRequestModalOpen(true)}
            onBecomePal={() => setBecomePalModalOpen(true)}
            onHospitalPartner={() => setHospitalModalOpen(true)}
            onOpenPayment={() => setPaymentModalOpen(true)}
            onOpenPalAccount={() => navigateToPage('pal')}
            onOpenGpsModal={() => setGpsModalOpen(true)}
            onOpenChargesModal={() => setChargesModalOpen(true)}
            onOpenPushNotifications={() => setPushModalOpen(true)}
            onOpenSosModal={() => setSosModalOpen(true)}
            onOpenKeyboardModal={() => setKeyboardModalOpen(true)}
            onOpenCalendarModal={() => setCalendarModalOpen(true)}
          />

          {/* Dedicated Page Views */}
          <main className="min-h-[70vh]">
            {currentPage === 'home' && (
              <HomePage
                onNavigatePage={navigateToPage}
                onRequestPal={() => setRequestModalOpen(true)}
                onBecomePal={() => setBecomePalModalOpen(true)}
                onHospitalPartner={() => setHospitalModalOpen(true)}
                onOpenGpsModal={() => setGpsModalOpen(true)}
                onOpenChargesModal={() => setChargesModalOpen(true)}
                onOpenSosModal={() => setSosModalOpen(true)}
              />
            )}

            {currentPage === 'patient' && (
              <PatientPortalPage
                onOpenGpsModal={() => setGpsModalOpen(true)}
                onOpenChargesModal={() => setChargesModalOpen(true)}
                onOpenSosModal={() => setSosModalOpen(true)}
              />
            )}

            {currentPage === 'pal' && (
              <PalPortalPage
                onOpenGpsModal={() => setGpsModalOpen(true)}
                onOpenChargesModal={() => setChargesModalOpen(true)}
                onOpenSosModal={() => setSosModalOpen(true)}
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
          </main>
        </div>

        {/* Global Footer */}
        <Footer
          onRequestPal={() => setRequestModalOpen(true)}
          onBecomePal={() => setBecomePalModalOpen(true)}
          onHospitalPartner={() => setHospitalModalOpen(true)}
        />

        {/* Interactive Modals */}
        <RequestPalModal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
        />
        <BecomePalModal
          isOpen={becomePalModalOpen}
          onClose={() => setBecomePalModalOpen(false)}
        />
        <HospitalPartnerModal
          isOpen={hospitalModalOpen}
          onClose={() => setHospitalModalOpen(false)}
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
          onOpenSosModal={() => setSosModalOpen(true)}
        />
        <ChargesAndEarningsModal
          isOpen={chargesModalOpen}
          onClose={() => setChargesModalOpen(false)}
          onRequestPal={() => setRequestModalOpen(true)}
          onBecomePal={() => setBecomePalModalOpen(true)}
        />
        <PushNotificationManager
          isOpen={pushModalOpen}
          onClose={() => setPushModalOpen(false)}
        />
        <SosEmergencyModal
          isOpen={sosModalOpen}
          onClose={() => setSosModalOpen(false)}
        />
        <KeyboardShortcutsModal
          isOpen={keyboardModalOpen}
          onClose={() => setKeyboardModalOpen(false)}
          onOpenSos={() => setSosModalOpen(true)}
        />
        <CalendarIntegrationModal
          isOpen={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
          userRole={currentPage === 'pal' ? 'pal' : 'patient'}
        />

        {/* Interactive CareBot Chatbot */}
        <CareBotChat />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

