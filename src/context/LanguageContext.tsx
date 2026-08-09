import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'es';

export interface Language {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇲🇽', dir: 'ltr' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & Common
    appName: 'PathPal',
    tagline: 'Never Navigate Alone',
    navHome: 'Home',
    navPatient: 'Patient Portal',
    navPal: 'Pal Portal',
    navHospital: 'Hospital Admin',
    navAbout: 'About & Impact',
    btnRequestPal: 'Request Companion Pal',
    btnBecomePal: 'Become a Pal',
    btnHospitalPartner: 'Hospital Partner',
    btnEmergencySos: 'Emergency SOS 911',
    btnLiveGps: 'Live GPS Radar',

    // Hero
    heroBadge: 'Health Plan & Insurance Covered • $0 Out-of-Pocket',
    heroTitlePrefix: 'Compassionate Hospital',
    heroTitleHighlight: 'Companion & Guidance',
    heroSubtitle: 'Connecting elderly, disabled, and non-English speaking patients with background-checked Community Health Workers for stress-free hospital visits.',
    heroStat1: 'Doorstep-to-Clinic Pal',
    heroStat2: 'Health Plan Subsidized',
    heroStat3: 'Multilingual CHWs',

    // Portals Selector
    portalTitle: 'Tailored Experiences for Every Role',
    portalSubtitle: 'Dedicated interfaces tailored specifically for patients, companion pals, and hospital care teams.',
    patientPortalTitle: 'Patient & Family Portal',
    patientPortalDesc: 'Request a companion, track live GPS location, and manage your encrypted HIPAA medical summary.',
    palPortalTitle: 'Companion Pal Portal',
    palPortalDesc: 'Accept nearby Pal assignments, track CHW stipends ($22-$28/hr), and view patient assistance needs.',
    hospitalPortalTitle: 'Hospital Admin Portal',
    hospitalPortalDesc: 'Monitor real-time patient companion dispatches, reduce appointment no-shows, and boost HCAHPS scores.',

    // Patient Portal
    welcomePatient: 'Welcome, Maria Santos',
    voucherSubsidized: '100% Subsidized / $0 Cost',
    bookEscortTitle: 'Schedule a Hospital Companion Pal',
    patientName: 'Patient Full Name',
    phoneLabel: 'Phone Number for Updates',
    hospitalLabel: 'Hospital Destination',
    clinicLabel: 'Clinic / Department',
    dateLabel: 'Appointment Date',
    timeLabel: 'Appointment Time',
    meetingPointLabel: 'Meeting Point at Campus',
    languagePrefLabel: 'Language Preference',
    accommodationsLabel: 'Accommodations Needed',
    wheelchairOption: 'Wheelchair Pal Assistance',
    armAssistanceOption: 'Arm Assistance Support',
    submitEscortBtn: 'Submit Pal Request',
    scheduledEscortsTitle: 'Your Upcoming Companion Visits',

    // Pal Portal
    welcomePal: 'Welcome, Elena Rostova',
    dutyStatus: 'Duty Status:',
    onDuty: 'ON-DUTY (RECEIVING ASSIGNMENTS)',
    offDuty: 'OFF-DUTY',
    availableEscortsFeed: 'Pending Patient Pal Requests',
    acceptEscortBtn: 'Accept Pal Assignment',
    stipendRate: 'Hourly Stipend Rate',

    // Hospital Portal
    hospitalTitle: 'Metro Health Medical Center',
    noShowReduction: 'No-Show Reduction',
    hcahpsBoost: 'HCAHPS Rating Boost',
    liveDispatchTable: 'Live Campus Companion Dispatch Table',

    // Emergency SOS
    sosModalTitle: 'Urgent Emergency SOS Sequence',
    call911: 'Call 911 Dispatch',
    alertSecurity: 'Alert Campus Security Desk',
    triggerSosBtn: 'Trigger Urgent SOS Dispatch Sequence',
  },

  es: {
    // Nav & Common
    appName: 'PathPal',
    tagline: 'Nunca Navegue Solo',
    navHome: 'Inicio',
    navPatient: 'Portal del Paciente',
    navPal: 'Portal del Acompañante (Pal)',
    navHospital: 'Admin Hospitalario',
    navAbout: 'Nosotros e Impacto',
    btnRequestPal: 'Solicitar Acompañante',
    btnBecomePal: 'Ser Acompañante',
    btnHospitalPartner: 'Socio Hospitalario',
    btnEmergencySos: 'SOS de Emergencia 911',
    btnLiveGps: 'Radar GPS en Vivo',

    // Hero
    heroBadge: 'Cubierto por Seguro Médico • $0 de su Bolsillo',
    heroTitlePrefix: 'Acompañante y Escolta',
    heroTitleHighlight: 'Hospitalaria Compasiva',
    heroSubtitle: 'Conectando a adultos mayores, personas con discapacidad y pacientes de habla hispana con promotores de salud acreditados para visitas hospitalarias sin estrés.',
    heroStat1: 'Escolta desde Puerta a Clínica',
    heroStat2: 'Cubierto por Seguro Médico',
    heroStat3: 'Acompañantes Multilingües',

    // Portals Selector
    portalTitle: 'Experiencias Personalizadas para Cada Rol',
    portalSubtitle: 'Interfaces dedicadas diseñadas específicamente para pacientes, acompañantes y personal hospitalario.',
    patientPortalTitle: 'Portal de Pacientes y Familias',
    patientPortalDesc: 'Solicite un acompañante, siga la ubicación GPS en vivo y gestione su historial médico cifrado HIPAA.',
    palPortalTitle: 'Portal del Acompañante Pal',
    palPortalDesc: 'Acepte solicitudes de escolta cercanas, consulte estipendios ($22-$28/h) y vea las necesidades de apoyo del paciente.',
    hospitalPortalTitle: 'Portal de Administración Hospitalaria',
    hospitalPortalDesc: 'Supervise los despachos de acompañantes en tiempo real, reduzca ausencias y mejore calificaciones HCAHPS.',

    // Patient Portal
    welcomePatient: 'Bienvenido/a, Maria Santos',
    voucherSubsidized: 'Subvencionado 100% ($0 Costo)',
    bookEscortTitle: 'Programar un Acompañante Hospitalario Pal',
    patientName: 'Nombre Completo del Paciente',
    phoneLabel: 'Número de Teléfono para Notificaciones',
    hospitalLabel: 'Hospital de Destino',
    clinicLabel: 'Clínica / Departamento',
    dateLabel: 'Fecha de la Cita',
    timeLabel: 'Hora de la Cita',
    meetingPointLabel: 'Punto de Encuentro en el Campus',
    languagePrefLabel: 'Idioma de Preferencia',
    accommodationsLabel: 'Asistencia Especial Requerida',
    wheelchairOption: 'Escolta en Silla de Ruedas',
    armAssistanceOption: 'Apoyo con Soporte de Brazo',
    submitEscortBtn: 'Enviar Solicitud de Acompañante',
    scheduledEscortsTitle: 'Sus Próximas Visitas Programadas',

    // Pal Portal
    welcomePal: 'Bienvenida, Elena Rostova',
    dutyStatus: 'Estado de Servicio:',
    onDuty: 'EN SERVICIO (RECIBIENDO ASIGNACIONES)',
    offDuty: 'FUERA DE SERVICIO',
    availableEscortsFeed: 'Solicitudes de Acompañamiento Pendientes',
    acceptEscortBtn: 'Aceptar Asignación de Acompañante',
    stipendRate: 'Tasa de Estipendio por Hora',

    // Hospital Portal
    hospitalTitle: 'Centro Médico Metro Health',
    noShowReduction: 'Reducción de Inasistencias',
    hcahpsBoost: 'Aumento en Calificación HCAHPS',
    liveDispatchTable: 'Tabla de Despacho de Acompañantes en Vivo',

    // Emergency SOS
    sosModalTitle: 'Secuencia de Emergencia SOS Urgente',
    call911: 'Llamar al 911 Inmediatamente',
    alertSecurity: 'Alertar a la Seguridad del Campus',
    triggerSosBtn: 'Activar Secuencia de Despacho SOS',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  currentLangObj: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('pathpal_lang') as SupportedLanguage;
    if (savedLang && TRANSLATIONS[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('pathpal_lang', lang);
    const langObj = LANGUAGES.find((l) => l.code === lang);
    if (langObj) {
      document.documentElement.dir = langObj.dir || 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const dir = currentLangObj.dir || 'ltr';

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, currentLangObj }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
