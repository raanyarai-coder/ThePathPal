import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'es' | 'zh' | 'tl' | 'ar';

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
  { code: 'zh', name: 'Mandarin', nativeName: '中文 (繁體/簡體)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
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
    heroBadge: 'CMS Medicare G0511 Covered • $0 Out-of-Pocket',
    heroTitlePrefix: 'Compassionate Hospital',
    heroTitleHighlight: 'Companion & Guidance',
    heroSubtitle: 'Connecting elderly, disabled, and non-English speaking patients with background-checked Community Health Workers for stress-free hospital visits.',
    heroStat1: 'Doorstep-to-Clinic Pal',
    heroStat2: 'Medicare & Medicaid Covered',
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
    medicareCovered: 'Medicare $0 Cost Covered',
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
    heroBadge: 'Cubierto por Medicare G0511 • $0 de su Bolsillo',
    heroTitlePrefix: 'Acompañante y Escolta',
    heroTitleHighlight: 'Hospitalaria Compasiva',
    heroSubtitle: 'Conectando a adultos mayores, personas con discapacidad y pacientes de habla hispana con promotores de salud acreditados para visitas hospitalarias sin estrés.',
    heroStat1: 'Escolta desde Puerta a Clínica',
    heroStat2: 'Cubierto por Medicare y Medicaid',
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
    medicareCovered: 'Cubierto 100% por Medicare ($0 Costo)',
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

  zh: {
    // Nav & Common
    appName: 'PathPal',
    tagline: '陪同同行，就醫無憂',
    navHome: '首頁',
    navPatient: '患者專區',
    navPal: '陪伴員專區',
    navHospital: '醫院管理端',
    navAbout: '關於與社會影響',
    btnRequestPal: '預約陪伴導航員',
    btnBecomePal: '加入成為陪伴員',
    btnHospitalPartner: '醫院合作',
    btnEmergencySos: '緊急 SOS 911',
    btnLiveGps: '實時 GPS 雷達',

    // Hero
    heroBadge: '聯邦醫療保險 G0511 全額涵蓋 • 零自付額',
    heroTitlePrefix: '溫馨貼心的',
    heroTitleHighlight: '醫院全程就醫陪同導航',
    heroSubtitle: '為長者、行動不便者及非英語患者連接經過嚴格審查的社區健康指導員，提供無壓力的醫院就診護送。',
    heroStat1: '門口到診室全程接送',
    heroStat2: 'Medicare 及 Medicaid 保險涵蓋',
    heroStat3: '多語種專屬導航員',

    // Portals Selector
    portalTitle: '為不同角色量身打造的入口',
    portalSubtitle: '專為患者、陪同導航員及醫院管理團隊設計的專屬功能平台。',
    patientPortalTitle: '患者與家屬門戶',
    patientPortalDesc: '預約陪伴員、追蹤實時 GPS 位置，並管理加密 HIPAA 醫療摘要。',
    palPortalTitle: '陪伴導航員 (Pal) 門戶',
    palPortalDesc: '接收附近護送任務、查看每小時津貼 ($22-$28/小時) 並掌握患者協助需求。',
    hospitalPortalTitle: '醫院管理員中心',
    hospitalPortalDesc: '實時監控患者陪同調度、降低門診缺席率並提升 HCAHPS 滿意度評分。',

    // Patient Portal
    welcomePatient: '歡迎，Maria Santos',
    medicareCovered: 'Medicare 保險涵蓋 ($0 自付額)',
    bookEscortTitle: '預約醫院陪同導航員',
    patientName: '患者姓名',
    phoneLabel: '接收通知的電話號碼',
    hospitalLabel: '目的地醫院',
    clinicLabel: '門診 / 科別',
    dateLabel: '就診日期',
    timeLabel: '就診時間',
    meetingPointLabel: '院區集合地點',
    languagePrefLabel: '偏好語言',
    accommodationsLabel: '特殊協助需求',
    wheelchairOption: '輪椅護送',
    armAssistanceOption: '手臂攙扶支持',
    submitEscortBtn: '提交就醫陪同申請',
    scheduledEscortsTitle: '您即將到來的陪同行程',

    // Pal Portal
    welcomePal: '歡迎，Elena Rostova',
    dutyStatus: '值班狀態：',
    onDuty: '值班中 (可接收任務)',
    offDuty: '休息中',
    availableEscortsFeed: '待處理的患者護送請求',
    acceptEscortBtn: '接受護送任務',
    stipendRate: '每小時津貼率',

    // Hospital Portal
    hospitalTitle: 'Metro Health 醫療中心',
    noShowReduction: '降低缺席率',
    hcahpsBoost: 'HCAHPS 滿意度提升',
    liveDispatchTable: '院區陪同人員實時調度表',

    // Emergency SOS
    sosModalTitle: '緊急 SOS 救援程序',
    call911: '立即撥打 911',
    alertSecurity: '通報院區安衛中心',
    triggerSosBtn: '觸發緊急 SOS 調度程序',
  },

  tl: {
    // Nav & Common
    appName: 'PathPal',
    tagline: 'Kailanman Huwag Mag-isang Maglakbay',
    navHome: 'Bahay',
    navPatient: 'Portal ng Pasyente',
    navPal: 'Portal ng Kasama (Pal)',
    navHospital: 'Admin ng Ospital',
    navAbout: 'Tungkol at Epekto',
    btnRequestPal: 'Humingi ng Kasama',
    btnBecomePal: 'Maging isang Pal',
    btnHospitalPartner: 'Partner na Ospital',
    btnEmergencySos: 'Emergency SOS 911',
    btnLiveGps: 'Live GPS Radar',

    // Hero
    heroBadge: 'Sagot ng Medicare G0511 • $0 Gastos sa Bulsa',
    heroTitlePrefix: 'Mapagkalingang Kasama at',
    heroTitleHighlight: 'Gabay sa Ospital',
    heroSubtitle: 'Iniuugnay ang mga nakatatanda, may kapansanan, at mga pasyenteng hindi marunong mag-Ingles sa mga sertipikadong Community Health Worker para sa ligtas na pagbisita sa ospital.',
    heroStat1: 'Paghahatid mula Pinto Hanggang Klinika',
    heroStat2: 'Sagot ng Medicare at Medicaid',
    heroStat3: 'Maring Wika na Kasama',

    // Portals Selector
    portalTitle: 'Nakatalagang Karanasan para sa Bawat Tungkulin',
    portalSubtitle: 'Sadyang dinisenyong mga portal para sa mga pasyente, kasamang Pal, at mga koponan sa ospital.',
    patientPortalTitle: 'Portal ng Pasyente at Pamilya',
    patientPortalDesc: 'Kumuha ng kasama, subaybayan ang live GPS, at pamahalaan ang iyong HIPAA medikal na buod.',
    palPortalTitle: 'Portal ng Kasamang Pal',
    palPortalDesc: 'Tanggapin ang mga malapit na reserbasyon, subaybayan ang bayad ($22-$28/oras), at tingnan ang pangangailangan ng pasyente.',
    hospitalPortalTitle: 'Portal ng Pamamahala sa Ospital',
    hospitalPortalDesc: 'Suriin ang live na pagpapadala ng kasama, bawasan ang hindi pagdating ng pasyente, at itaas ang HCAHPS scores.',

    // Patient Portal
    welcomePatient: 'Maligayang pagdating, Maria Santos',
    medicareCovered: 'Libre sa Medicare ($0 Gastos)',
    bookEscortTitle: 'Mag-book ng Kasama sa Ospital',
    patientName: 'Buong Pangalan ng Pasyente',
    phoneLabel: 'Numero ng Telepono para sa Update',
    hospitalLabel: 'Ospital na Pupuntahan',
    clinicLabel: 'Klinika / Departamento',
    dateLabel: 'Petsa ng Konsulta',
    timeLabel: 'Oras ng Konsulta',
    meetingPointLabel: 'Lugar ng Pagkikita sa Ospital',
    languagePrefLabel: 'Gulong na Wika',
    accommodationsLabel: 'Kailangan na Tulong',
    wheelchairOption: 'Paggabay sa Wheelchair',
    armAssistanceOption: 'Pagalalay sa Bisig',
    submitEscortBtn: 'Isumite ang Hiling sa Kasama',
    scheduledEscortsTitle: 'Iyong Mga Nakatakdang Pagbisita',

    // Pal Portal
    welcomePal: 'Maligayang pagdating, Elena Rostova',
    dutyStatus: 'Lalagyan ng Tungkulin:',
    onDuty: 'NAGTATRABAHO (TUMATANGGAP NG TUNGKULIN)',
    offDuty: 'HINDI NAGTATRABAHO',
    availableEscortsFeed: 'Mga Naghihintay na Hiling ng Pasyente',
    acceptEscortBtn: 'Tanggapin ang Tungkulin',
    stipendRate: 'Kita Bawat Oras',

    // Hospital Portal
    hospitalTitle: 'Metro Health Medical Center',
    noShowReduction: 'Pagbawas sa Hindi Pagdating',
    hcahpsBoost: 'Pagtaas ng HCAHPS Rating',
    liveDispatchTable: 'Talahanayan ng Live Dispatch ng Kasama',

    // Emergency SOS
    sosModalTitle: 'Gipit na Emergency SOS Sequence',
    call911: 'Tumawag sa 911 Agad',
    alertSecurity: 'Abisuhan ang Security Desk ng Campus',
    triggerSosBtn: 'Paganahin ang SOS Dispatch Sequence',
  },

  ar: {
    // Nav & Common
    appName: 'PathPal',
    tagline: 'لا تتنقل بمفردك أبداً',
    navHome: 'الرئيسية',
    navPatient: 'بوابة المريض',
    navPal: 'بوابة المرافق (Pal)',
    navHospital: 'إدارة المستشفى',
    navAbout: 'من نحن والأثر الاجتماعي',
    btnRequestPal: 'طلب مرافق طبي',
    btnBecomePal: 'الانضمام كمرافق',
    btnHospitalPartner: 'الشراكة مع المستشفيات',
    btnEmergencySos: 'طوارئ SOS 911',
    btnLiveGps: 'رادار GPS المباشر',

    // Hero
    heroBadge: 'مغطى بالكامل عبر Medicare G0511 • $0 تكلفة إضافية',
    heroTitlePrefix: 'مرافقة وإرشاد',
    heroTitleHighlight: 'طبي للمستشفيات بحرص وعناية',
    heroSubtitle: 'ربط كبار السن وذوي الإعاقة والمرضى غير الناطقين بالإنجليزية بمرشدين صحيين معتمدين لمرافقتهم أثناء زيارات المستشفى بكل راحة.',
    heroStat1: 'مرافقة من الباب إلى العيادة',
    heroStat2: 'تغطية كاملة من Medicare و Medicaid',
    heroStat3: 'مرافقون يتحدثون لغات متعددة',

    // Portals Selector
    portalTitle: 'تجارب مخصصة لكل فئة',
    portalSubtitle: 'واجهات مخصصة صُممت خصيصاً للمرضى، المرافقين، وفريق الرعاية بالمستشفى.',
    patientPortalTitle: 'بوابة المريض والعائلة',
    patientPortalDesc: 'اطلب مرافقاً، تتبع الموقع مباشرة عبر GPS، وإدارة ملخصك الطبي المشفر بموجب HIPAA.',
    palPortalTitle: 'بوابة المرافق الطبي (Pal)',
    palPortalDesc: 'قبول طلبات المرافقة القريبة، تتبع المكافآت المالية ($22-$28/ساعة)، والاطلاع على احتياجات المريض.',
    hospitalPortalTitle: 'بوابة إدارة المستشفى',
    hospitalPortalDesc: 'متابعة توجيه المرافقين في الوقت الفعلي، تقليل عدم حضور المواعيد، ورفع تقييمات HCAHPS.',

    // Patient Portal
    welcomePatient: 'أهلاً بك، ماريا سانتوس',
    medicareCovered: 'تغطية Medicare بنسبة 100% ($0 تكلفة)',
    bookEscortTitle: 'حجز مرافق طبي للمستشفى',
    patientName: 'الاسم الكامل للمريض',
    phoneLabel: 'رقم الهاتف للتحديثات',
    hospitalLabel: 'المستشفى المقصود',
    clinicLabel: 'العيادة / القسم',
    dateLabel: 'تاريخ الموعد',
    timeLabel: 'وقت الموعد',
    meetingPointLabel: 'نقطة الالتقاء بالمبنى',
    languagePrefLabel: 'اللغة المفضلة',
    accommodationsLabel: 'المساعدة الخاصة المطلوبة',
    wheelchairOption: 'مرافقة كرسي متحرك',
    armAssistanceOption: 'دعم ومساندة باليد',
    submitEscortBtn: 'إرسال طلب المرافقة',
    scheduledEscortsTitle: 'زياراتك المحددة القادمة',

    // Pal Portal
    welcomePal: 'أهلاً بك، إلينا روستوفا',
    dutyStatus: 'حالة الخدمة:',
    onDuty: 'في الخدمة (استقبال الطلبات)',
    offDuty: 'خارج الخدمة',
    availableEscortsFeed: 'طلبات المرافقة المعلقة',
    acceptEscortBtn: 'قبول مهمة المرافقة',
    stipendRate: 'مكافأة الساعة',

    // Hospital Portal
    hospitalTitle: 'مركز مترو هيلث الطبي',
    noShowReduction: 'تقليل نسبة الغياب',
    hcahpsBoost: 'ارتفاع تقييم HCAHPS',
    liveDispatchTable: 'جدول توجيه المرافقين المباشر بالمبنى',

    // Emergency SOS
    sosModalTitle: 'إجراءات طوارئ SOS العاجلة',
    call911: 'الاتصال بـ 911 فوراً',
    alertSecurity: 'إبلاغ مكتب أمن المستشفى',
    triggerSosBtn: 'تفعيل إرسال طوارئ SOS العاجل',
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
