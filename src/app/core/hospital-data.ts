export type CareCategory =
  | 'surgery'
  | 'checkup'
  | 'diagnostic'
  | 'maternity'
  | 'specialty';

export type PaymentMethod =
  | 'Credit or Debit Card'
  | 'NFC Mobile Payment'
  | 'Front Desk Settlement';

export type HospitalLanguage = 'English' | 'Igbo';

export interface BackdropSlide {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly subcaption: string;
}

export interface ExecutiveDirector {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly credential: string;
  readonly focus: string;
}

export interface DoctorProfile {
  readonly id: string;
  readonly name: string;
  readonly credentials: string;
  readonly role: string;
  readonly specialty: string;
  readonly category: CareCategory;
  readonly languages: readonly HospitalLanguage[];
  readonly clinicHours: string;
  readonly bio: string;
  readonly primaryServiceId: string;
}

export interface ClinicalService {
  readonly id: string;
  readonly category: CareCategory;
  readonly categoryLabel: string;
  readonly title: string;
  readonly department: string;
  readonly summary: string;
  readonly durationMinutes: number;
  readonly feeRangeNgn: string;
  readonly requiresReferral: boolean;
  readonly confirmOnSiteByPhone: boolean;
  readonly specialistName: string;
  readonly specialistRole: string;
  readonly preVisitNote: string;
}

export interface InfrastructureHighlight {
  readonly id: string;
  readonly indexLabel: string;
  readonly title: string;
  readonly department: string;
  readonly description: string;
  readonly equipmentList: readonly string[];
  readonly slideId: string;
  readonly targetCategory: CareCategory;
}

export interface PatientReview {
  readonly id: string;
  readonly author: string;
  readonly visitType: string;
  readonly rating: number;
  readonly dateLabel: string;
  readonly comment: string;
}

export interface FacilityFact {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}

export const HOSPITAL_PROFILE = {
  name: 'Jonex Hospital',
  legalName: 'Jonex Hospitals Ltd',
  cacRegistration: 'RC 259607',
  incorporatedDate: 'December 7, 1994',
  primaryAddress: '499P+27M, Ebenma Street, Ogbor Hill, Aba 450102, Abia State, Nigeria',
  corporateRegistryAddress: '122 Port Harcourt Road, Aba, Abia State, Nigeria',
  phoneDisplay: '+234 807 801 6691',
  phoneHref: 'tel:+2348078016691',
  bedsCount: 140,
  doctorsCount: 68,
  accreditation: 'HAS Accredited',
  languages: ['English', 'Igbo'] as readonly HospitalLanguage[],
  hoursPrimary: 'Open 24 Hours · Monday – Sunday',
  hoursClinicNote:
    'Standard outpatient specialist clinics operate 8:00 AM – 5:00 PM weekdays. Call ahead to confirm same-day specialist or diagnostic readiness.',
  ratingScore: '4.4',
  ratingCount: 9,
  accessibility:
    'Wheelchair-accessible entrance, covered patient drop-off portico, and dedicated parking lot at Ogbor Hill.',
  paymentMethods: ['Credit Cards', 'Debit Cards', 'NFC Mobile Payments'] as readonly string[],
  aboutUs:
    'Jonex Hospital, located in Aba, Abia State, Nigeria, is a leading healthcare institution dedicated to delivering personalized and comprehensive medical care with a steadfast focus on clinical innovation and patient welfare.',
  qualityStandard:
    'Jonex Hospital prioritizes excellence by implementing strict clinical protocols, ongoing staff development, and a patient-first approach. The hospital maintains high standards of hygiene, safety, and confidentiality to ensure the best patient experience.',
  vision:
    'To be recognized as a center of excellence in healthcare, known for innovation, quality, and compassionate care in Aba and beyond.',
  mission:
    'To deliver holistic healthcare services that empower patients through advanced technology, skilled professionals, and ethical medical practice.',
  specialtiesList: [
    'Internal Medicine',
    'General Surgery',
    'Obstetrics & Gynecology',
    'Pediatrics',
    'Orthopedics',
    'Cardiology',
    'Radiology',
    'Dental Care',
  ] as readonly string[],
  capabilityNotice:
    'Jonex Hospital operates as a private secondary care center. Because specialized ambulance dispatch, dental suites, advanced imaging, on-site lab assays, and pharmacy stock can vary by shift, our scheduling desk verifies exact on-site or partner readiness by phone before specialized procedures.',
} as const;

export const HERO_IMAGE = {
  src: 'assets/images/hero_jonex_hospital_aba_1795470038308.jpg',
  alt: 'Jonex Hospital exterior facade in Ogbor Hill, Aba showing sunlit glass atrium and wheelchair-accessible entrance ramp',
} as const;

/** Page 1 (/): Home — Surgeons & Active Hospital Operations */
export const HOME_BACKDROP_SLIDES: readonly BackdropSlide[] = [
  {
    id: 'home-scrub-prep',
    src: 'assets/images/nigerian_surgeons_scrub_prep_1795481837205.jpg',
    alt: 'Black Nigerian surgeons scrubbing and donning sterile surgical gloves outside the operating theatre',
    caption: 'Surgical Scrub & Sterile Preparation',
    subcaption: 'Surgeons & perioperative nurses preparing for theatre at Ogbor Hill',
  },
  {
    id: 'home-theatre-action',
    src: 'assets/images/nigerian_operating_room_action_1795481836683.jpg',
    alt: 'Black Nigerian surgical team operating under shadowless overhead theatre lamps',
    caption: 'Live Operating Theatre Operations',
    subcaption: 'Active general surgery and continuous anesthesia monitoring suite',
  },
  {
    id: 'home-surgical-team',
    src: 'assets/images/nigerian_surgical_team_1795481714686.jpg',
    alt: 'Perioperative surgical specialists coordinating sterile instruments inside theatre',
    caption: 'Perioperative Readiness & Recovery',
    subcaption: 'Dedicated theatre nursing and post-operative recovery supervision',
  },
];

/** Page 2 (/services): Infrastructure & Clinical Wings — Lab, Reception, Theatre/Cardiology, Labor Room, Pediatrics, Dental */
export const SERVICES_BACKDROP_SLIDES: readonly BackdropSlide[] = [
  {
    id: 'svc-reception',
    src: 'assets/images/nigerian_hospital_reception_1795481837658.jpg',
    alt: 'Black Nigerian nurses and patient coordinators welcoming visitors at the sunlit hospital reception counter',
    caption: 'Main Reception & Triage Desk',
    subcaption: 'Rapid outpatient registration, card/NFC settlement & bilingual English/Igbo desk',
  },
  {
    id: 'svc-lab',
    src: 'assets/images/nigerian_diagnostic_lab_1795481714763.jpg',
    alt: 'Black Nigerian medical laboratory scientists operating automated hematology and biochemistry analyzers',
    caption: 'Clinical Diagnostic & Hematology Wing',
    subcaption: 'Specimen processing, blood chemistry panels & partner pathology coordination',
  },
  {
    id: 'svc-labor-room',
    src: 'assets/images/nigerian_labor_delivery_room_1795481838191.jpg',
    alt: 'Black Nigerian obstetrician and midwives monitoring fetal telemetry in the labor and delivery suite',
    caption: 'Obstetrics, Labor & Delivery Suite',
    subcaption: '24/7 maternal care, fetal wellness monitoring & neonatal warming station',
  },
  {
    id: 'svc-cardiology',
    src: 'assets/images/nigerian_cardiology_ultrasound_1795481716122.jpg',
    alt: 'Black Nigerian cardiologist and nurse performing Doppler echocardiography for a patient',
    caption: 'Cardiology & Diagnostic Ultrasound Bay',
    subcaption: '12-lead ECG, Doppler echocardiography & radiology coordination',
  },
  {
    id: 'svc-pediatric',
    src: 'assets/images/nigerian_pediatric_ward_1795481838794.jpg',
    alt: 'Black Nigerian female pediatrician examining a cheerful child beside his mother',
    caption: 'Pediatric Outpatient & Immunization Clinic',
    subcaption: 'Infant growth tracking, fever triage & family-friendly exam suites',
  },
  {
    id: 'svc-dental',
    src: 'assets/images/nigerian_dental_clinic_clean_1795481852626.jpg',
    alt: 'Black Nigerian dentist and dental nurse reviewing digital oral X-rays beside treatment chair',
    caption: 'Dental & Oral Health Treatment Suite',
    subcaption: 'Visiting dental surgery, oral radiography & preventive care',
  },
];

/** Page 3 (/doctors): Doctors, Rounds & Medical Executive Team */
export const DOCTORS_BACKDROP_SLIDES: readonly BackdropSlide[] = [
  {
    id: 'doc-ward-rounds',
    src: 'assets/images/nigerian_ward_rounds_1795481916711.jpg',
    alt: 'Black Nigerian doctors and nurses walking together on morning clinical ward rounds',
    caption: 'Consultant Morning Ward Rounds',
    subcaption: 'Collaborative inpatient care across our 140-bed Ogbor Hill campus',
  },
  {
    id: 'doc-clinical-team',
    src: 'assets/images/nigerian_doctors_nurses_team_1795481715066.jpg',
    alt: 'Group portrait of Black Nigerian physicians, surgeons and nurses inside the sunlit atrium',
    caption: '68 Medical Doctors & Nursing Team',
    subcaption: 'Board-led multi-specialty care in English and Igbo',
  },
];

/** Page 4 (/appointments): Live Appointment & Session Booking Scenes */
export const APPOINTMENTS_BACKDROP_SLIDES: readonly BackdropSlide[] = [
  {
    id: 'appt-desk-booking',
    src: 'assets/images/nigerian_nurse_booking_desk_1795481839994.jpg',
    alt: 'Black Nigerian nurse scheduling an outpatient appointment on a hospital computer with a patient',
    caption: 'Live Reception & Nursing Slot Booking',
    subcaption: 'Real-time coordination between online reservations and hospital reception',
  },
  {
    id: 'appt-patient-online',
    src: 'assets/images/nigerian_patient_online_booking_1795481854067.jpg',
    alt: 'Black Nigerian woman reserving a hospital appointment online using a digital tablet from home',
    caption: 'Direct Patient Online Scheduling',
    subcaption: 'Reserve surgery consults, checkups & diagnostics from home in minutes',
  },
  {
    id: 'appt-doctor-tablet',
    src: 'assets/images/nigerian_doctor_tablet_consult_1795481854355.jpg',
    alt: 'Black Nigerian doctor reviewing a digital appointment calendar with a patient along a sunny corridor',
    caption: 'Specialist Session Confirmation',
    subcaption: 'Doctors verify pre-visit notes, fasting rules & lab readiness upfront',
  },
];

/** Page 5 (/patients-and-visitors): Waiting Room, Main Lobby, Arrival Driveway & Parking Garage */
export const VISITORS_BACKDROP_SLIDES: readonly BackdropSlide[] = [
  {
    id: 'vis-waiting-room',
    src: 'assets/images/nigerian_waiting_room_1795481887485.jpg',
    alt: 'Spacious sunlit Nigerian hospital waiting room with families seated comfortably near glass windows',
    caption: 'Patient & Family Waiting Lounge',
    subcaption: 'Natural daylight courtyard seating near outpatient triage counters',
  },
  {
    id: 'vis-lobby',
    src: 'assets/images/nigerian_hospital_lobby_1795481913567.jpg',
    alt: 'Modern double-height Nigerian hospital lobby with wide terrazzo walkway and wheelchair accessibility',
    caption: 'Main Hospital Lobby & Concierge Atrium',
    subcaption: 'Step-free arrival corridors and dedicated front-desk assistance',
  },
  {
    id: 'vis-driveway',
    src: 'assets/images/nigerian_hospital_driveway_1795481855442.jpg',
    alt: 'Covered white architectural drop-off driveway at the entrance of Jonex Hospital Aba',
    caption: 'Covered Patient Drop-Off Driveway',
    subcaption: 'Direct vehicular approach off Ebenma Street with sheltered access ramp',
  },
  {
    id: 'vis-parking',
    src: 'assets/images/nigerian_parking_bay_clean_1795481914816.jpg',
    alt: 'Clean paved hospital visitor parking lot and shaded carport garage bays beside clinic entrance',
    caption: 'Visitor Carport Garage & Accessible Bays',
    subcaption: 'Shaded on-site parking and marked wheelchair access next to main doors',
  },
];

export const EXECUTIVE_DIRECTORS: readonly ExecutiveDirector[] = [
  {
    id: 'dir-ndukauba',
    name: 'Dr. Ndukauba Eleweke',
    role: 'Director & Practicing Surgeon',
    credential: 'Consultant Surgeon · Aba',
    focus:
      'Board Director and surgeon practicing in Aba, guiding surgical standards, sterile operating protocols, and clinical governance at Jonex Hospitals Ltd.',
  },
  {
    id: 'dir-gnd',
    name: 'G.N.D. Eleweke',
    role: 'Director',
    credential: 'Executive Board · CAC RC 259607',
    focus:
      'Oversees institutional stewardship, patient care quality benchmarks, and continuous healthcare facility investment in Abia State.',
  },
  {
    id: 'dir-job',
    name: 'Job Eleweke',
    role: 'Director',
    credential: 'Executive Board · Jonex Hospitals Ltd',
    focus:
      'Guides operational continuity, biomedical readiness, and strategic healthcare access across Ogbor Hill and Greater Aba.',
  },
  {
    id: 'dir-ikwuoma',
    name: 'Ikwuoma Getrude Eleweke',
    role: 'Director',
    credential: 'Executive Board · Patient Welfare',
    focus:
      'Champions patient dignity, ethical practice, nursing standards, and transparent family communication across clinical departments.',
  },
];

export const DOCTOR_PROFILES: readonly DoctorProfile[] = [
  {
    id: 'doc-ndukauba-eleweke',
    name: 'Dr. Ndukauba Eleweke',
    credentials: 'Director · Consultant Surgeon',
    role: 'Medical Director & Practicing Surgeon (Aba)',
    specialty: 'General Surgery',
    category: 'surgery',
    languages: ['English', 'Igbo'],
    clinicHours: 'Mon – Fri · 8:30 AM – 4:00 PM (+ On-Call Surgery)',
    bio: 'Senior practicing surgeon in Aba overseeing elective abdominal surgery, hernia repair, soft-tissue procedures, and sterile surgical governance.',
    primaryServiceId: 'surg-general-consult',
  },
  {
    id: 'doc-uchechukwu-eze',
    name: 'Dr. Uchechukwu Eze',
    credentials: 'MBBS, FMCP',
    role: 'Consultant Internal Medicine',
    specialty: 'Internal Medicine',
    category: 'checkup',
    languages: ['English', 'Igbo'],
    clinicHours: 'Mon – Sat · 8:00 AM – 4:30 PM',
    bio: 'Leads executive health checkups, hypertension & diabetes clinics, infectious disease evaluations, and chronic adult care plans.',
    primaryServiceId: 'chk-annual-physical',
  },
  {
    id: 'doc-amaka-obinna',
    name: 'Dr. Amaka Obinna',
    credentials: 'MBBS, FWACS',
    role: 'Consultant Obstetrician & Gynecologist',
    specialty: 'Obstetrics & Gynecology',
    category: 'maternity',
    languages: ['English', 'Igbo'],
    clinicHours: 'Mon – Fri · 8:30 AM – 4:00 PM (+ 24/7 Labor Cover)',
    bio: 'Guides high-care antenatal clinics, safe delivery planning, maternal wellness screening, and gynecological surgical consults.',
    primaryServiceId: 'mat-antenatal',
  },
  {
    id: 'doc-chidinma-udeh',
    name: 'Dr. Chidinma Udeh',
    credentials: 'MBBS, MWACP',
    role: 'Pediatric Consultant Officer',
    specialty: 'Pediatrics',
    category: 'maternity',
    languages: ['English', 'Igbo'],
    clinicHours: 'Daily Clinic · 8:30 AM – 5:00 PM',
    bio: 'Specializes in newborn checkups, childhood fever triage, growth monitoring, nutrition counseling, and routine immunizations.',
    primaryServiceId: 'mat-pediatric-care',
  },
  {
    id: 'doc-emeka-okafor',
    name: 'Dr. Emeka Okafor',
    credentials: 'MBBS, FWACS (Ortho)',
    role: 'Visiting Orthopedic Consultant',
    specialty: 'Orthopedics',
    category: 'surgery',
    languages: ['English', 'Igbo'],
    clinicHours: 'Tue & Thu · 9:00 AM – 3:00 PM (Phone Confirm)',
    bio: 'Evaluates bone fractures, joint disorders, sports trauma, cast management, and surgical vs. conservative musculoskeletal care.',
    primaryServiceId: 'surg-orthopedic-eval',
  },
  {
    id: 'doc-chukwudi-obi',
    name: 'Dr. Chukwudi Obi',
    credentials: 'MBBS, FMCP (Cardio)',
    role: 'Cardiology & Diagnostic Lead',
    specialty: 'Cardiology & Radiology',
    category: 'diagnostic',
    languages: ['English', 'Igbo'],
    clinicHours: 'Mon, Wed, Fri · 9:00 AM – 4:00 PM',
    bio: 'Directs non-invasive cardiovascular diagnostics including 12-lead ECG, Doppler echocardiography, and hypertension risk stratification.',
    primaryServiceId: 'diag-cardio-ecg',
  },
  {
    id: 'doc-ngozi-nwosu',
    name: 'Dr. Ngozi Nwosu',
    credentials: 'MBBS, FMCA',
    role: 'Perioperative & Anesthesia Lead',
    specialty: 'Perioperative Medicine',
    category: 'surgery',
    languages: ['English', 'Igbo'],
    clinicHours: 'Mon – Fri · 8:30 AM – 3:30 PM',
    bio: 'Conducts pre-operative anesthesia clearance, airway evaluation, and post-anesthesia recovery monitoring inside the surgical suite.',
    primaryServiceId: 'surg-preop-clearance',
  },
  {
    id: 'doc-tobechukwu-agu',
    name: 'Dr. Tobechukwu Agu',
    credentials: 'BDS',
    role: 'Visiting Dental Surgeon',
    specialty: 'Dental Care',
    category: 'specialty',
    languages: ['English', 'Igbo'],
    clinicHours: 'Wed & Fri · 9:30 AM – 3:00 PM (Confirm by Phone)',
    bio: 'Provides oral examinations, acute toothache triage, restorative dental screening, and digital oral radiographic reviews.',
    primaryServiceId: 'spec-dental-check',
  },
];

export const INFRASTRUCTURE_HIGHLIGHTS: readonly InfrastructureHighlight[] = [
  {
    id: 'infra-reception',
    indexLabel: '01. Reception & Intake Counter',
    title: 'Hospital Reception & Bilingual Triage',
    department: 'Patient Access Desk',
    description:
      'Calm sunlit check-in desk staffed 24/7 in English and Igbo with credit card, debit card, and NFC contactless settlement.',
    equipmentList: [
      'Online booking check-in & reference slip lookup',
      'English & Igbo fluent patient coordination nurses',
      'Upfront itemized fee breakdown prior to procedures',
    ],
    slideId: 'svc-reception',
    targetCategory: 'checkup',
  },
  {
    id: 'infra-lab',
    indexLabel: '02. Clinical Diagnostic & Hematology Wing',
    title: 'Laboratory Testing & Preventive Screening',
    department: 'Diagnostics & Pathology',
    description:
      'Structured specimen intake for blood chemistry, malaria & typhoid panels, urinalysis, and pre-surgical baseline screening.',
    equipmentList: [
      'Automated hematology & biochemistry analyzers',
      'Digital optical microscopy & smear review station',
      'Cold-chain specimen intake & partner lab verification',
    ],
    slideId: 'svc-lab',
    targetCategory: 'diagnostic',
  },
  {
    id: 'infra-labor',
    indexLabel: '03. Maternity, Labor & Delivery Suite',
    title: 'Obstetric Labor Room & Neonatal Warmers',
    department: 'Obstetrics & Gynecology',
    description:
      'Dedicated private delivery bays with continuous fetal monitoring, obstetric oversight, and neonatal warming stabilization.',
    equipmentList: [
      'Digital cardiotocography (CTG) fetal monitor',
      'Infant resuscitation & radiant neonatal warmer',
      'Private family-centered antenatal exam suites',
    ],
    slideId: 'svc-labor-room',
    targetCategory: 'maternity',
  },
  {
    id: 'infra-imaging',
    indexLabel: '04. Cardiology & Ultrasound Bay',
    title: 'Echocardiography, 12-Lead ECG & Radiology',
    department: 'Cardiology & Imaging',
    description:
      'Focused cardiovascular assessments, resting ECG, diagnostic ultrasound consultations, and blood pressure profiling.',
    equipmentList: [
      'High-resolution Doppler echocardiogram console',
      'Continuous bedside 12-lead ECG telemetry monitor',
      'Phone-confirmed radiology & ultrasound scheduling',
    ],
    slideId: 'svc-cardiology',
    targetCategory: 'diagnostic',
  },
];

export const CLINICAL_SERVICES: readonly ClinicalService[] = [
  {
    id: 'surg-general-consult',
    category: 'surgery',
    categoryLabel: 'Surgery',
    title: 'General Surgery Consultation & Theatre Scheduling',
    department: 'General Surgery',
    summary:
      'Comprehensive surgical evaluation for hernia repair, appendicitis assessment, soft-tissue excision, and post-operative follow-up with itemized cost review.',
    durationMinutes: 45,
    feeRangeNgn: '₦15,000 – ₦25,000 (Consult)',
    requiresReferral: false,
    confirmOnSiteByPhone: true,
    specialistName: 'Dr. Ndukauba Eleweke',
    specialistRole: 'Director & Practicing Surgeon',
    preVisitNote:
      'Bring prior scan reports, medication list, and previous discharge summaries. Theatre dates are confirmed after pre-op clearance.',
  },
  {
    id: 'surg-preop-clearance',
    category: 'surgery',
    categoryLabel: 'Surgery',
    title: 'Pre-Operative Medical Clearance & Anesthesia Review',
    department: 'Perioperative Care',
    summary:
      'Mandatory pre-surgical physical fitness review, vital stabilization, blood pressure control, and anesthesia risk screening prior to scheduled surgery.',
    durationMinutes: 40,
    feeRangeNgn: '₦12,000 – ₦20,000',
    requiresReferral: false,
    confirmOnSiteByPhone: true,
    specialistName: 'Dr. Ngozi Nwosu, FMCA',
    specialistRole: 'Perioperative & Anesthesia Lead',
    preVisitNote:
      'Fast for 6 hours if combined with baseline fasting glucose or lipid blood draw. Confirm surgery schedule at reception.',
  },
  {
    id: 'surg-orthopedic-eval',
    category: 'surgery',
    categoryLabel: 'Surgery',
    title: 'Orthopedic Fracture, Joint & Trauma Evaluation',
    department: 'Orthopedics',
    summary:
      'Assessment of musculoskeletal injuries, joint pain, cast review, and surgical vs. conservative rehabilitation planning.',
    durationMinutes: 40,
    feeRangeNgn: '₦15,000 – ₦22,000',
    requiresReferral: false,
    confirmOnSiteByPhone: true,
    specialistName: 'Dr. Emeka Okafor, FWACS',
    specialistRole: 'Visiting Orthopedic Consultant',
    preVisitNote:
      'Please bring existing X-ray films or digital CDs. Call +234 807 801 6691 ahead to confirm orthopedic clinic day.',
  },
  {
    id: 'chk-annual-physical',
    category: 'checkup',
    categoryLabel: 'Checkups',
    title: 'Comprehensive Executive & Adult Health Checkup',
    department: 'Internal Medicine',
    summary:
      'Full head-to-toe physician examination covering cardiovascular vitals, hypertension/diabetes screening, BMI, and personalized preventive plan.',
    durationMinutes: 35,
    feeRangeNgn: '₦10,000 – ₦18,000',
    requiresReferral: false,
    confirmOnSiteByPhone: false,
    specialistName: 'Dr. Uchechukwu Eze, FMCP',
    specialistRole: 'Consultant Internal Medicine',
    preVisitNote:
      'Arrive 15 minutes early for vitals triage. Wear comfortable two-piece clothing for physical examination.',
  },
  {
    id: 'chk-general-outpatient',
    category: 'checkup',
    categoryLabel: 'Checkups',
    title: 'Same-Day General Practice & Acute Illness Visit',
    department: 'General Medicine',
    summary:
      'Prompt outpatient consultation for fever, respiratory symptoms, infections, blood pressure checks, and prescription review.',
    durationMinutes: 25,
    feeRangeNgn: '₦6,000 – ₦10,000',
    requiresReferral: false,
    confirmOnSiteByPhone: false,
    specialistName: 'Dr. Uchechukwu Eze, FMCP',
    specialistRole: 'Outpatient Clinical Team',
    preVisitNote:
      'Walk-in 24/7 triage available for urgent symptoms; scheduled slots minimize reception wait times.',
  },
  {
    id: 'diag-blood-panel',
    category: 'diagnostic',
    categoryLabel: 'Diagnostic Tests',
    title: 'Complete Blood Count, Malaria & Metabolic Panel',
    department: 'Diagnostics & Lab',
    summary:
      'Coordinated specimen draw for full blood count (FBC), fasting blood sugar, liver/kidney function, and malaria parasite screening.',
    durationMinutes: 20,
    feeRangeNgn: '₦8,500 – ₦24,000',
    requiresReferral: false,
    confirmOnSiteByPhone: true,
    specialistName: 'Dr. Chukwudi Obi, FMCP',
    specialistRole: 'Diagnostics & Specimen Review',
    preVisitNote:
      '8–10 hours overnight fasting required for glucose and lipid panels (water permitted). Call ahead to verify same-day on-site vs. partner lab turnaround.',
  },
  {
    id: 'diag-cardio-ecg',
    category: 'diagnostic',
    categoryLabel: 'Diagnostic Tests',
    title: 'Cardiac Screening, 12-Lead ECG & Ultrasound Check',
    department: 'Cardiology & Radiology',
    summary:
      'Non-invasive heart rhythm tracing, blood pressure profiling, and diagnostic ultrasound scheduling with physician interpretation.',
    durationMinutes: 35,
    feeRangeNgn: '₦12,000 – ₦28,000',
    requiresReferral: false,
    confirmOnSiteByPhone: true,
    specialistName: 'Dr. Chukwudi Obi, FMCP',
    specialistRole: 'Cardiology & Diagnostic Lead',
    preVisitNote:
      'Avoid caffeine 2 hours before ECG. Confirm imaging room availability directly by phone prior to specialized scans.',
  },
  {
    id: 'mat-antenatal',
    category: 'maternity',
    categoryLabel: 'Maternity & Pediatrics',
    title: 'Obstetrics, Antenatal & Women’s Wellness Visit',
    department: 'Obstetrics & Gynecology',
    summary:
      'Dedicated maternal care covering prenatal registration, trimester monitoring, safe delivery planning, and gynecological consultations.',
    durationMinutes: 40,
    feeRangeNgn: '₦10,000 – ₦18,000',
    requiresReferral: false,
    confirmOnSiteByPhone: false,
    specialistName: 'Dr. Amaka Obinna, FWACS',
    specialistRole: 'Consultant Obstetrician & Gynecologist',
    preVisitNote:
      'Bring antenatal card if transferring care. Delivery suite tours available during weekday clinic hours.',
  },
  {
    id: 'mat-pediatric-care',
    category: 'maternity',
    categoryLabel: 'Maternity & Pediatrics',
    title: 'Pediatric Consultation & Childhood Immunization',
    department: 'Pediatrics',
    summary:
      'Infant, toddler, and adolescent clinical checkups, fever triage, growth monitoring, and routine childhood immunization guidance.',
    durationMinutes: 30,
    feeRangeNgn: '₦7,500 – ₦14,000',
    requiresReferral: false,
    confirmOnSiteByPhone: false,
    specialistName: 'Dr. Chidinma Udeh, MWACP',
    specialistRole: 'Pediatric Consultant Officer',
    preVisitNote:
      'Please bring your child’s immunization record booklet for vaccination verification.',
  },
  {
    id: 'spec-dental-check',
    category: 'specialty',
    categoryLabel: 'Specialty Care',
    title: 'Dental Screening & Oral Health Consultation',
    department: 'Dental Care',
    summary:
      'Oral examination, toothache triage, hygiene assessment, and referral coordination for specialized restorative dental procedures.',
    durationMinutes: 30,
    feeRangeNgn: '₦8,000 – ₦15,000',
    requiresReferral: false,
    confirmOnSiteByPhone: true,
    specialistName: 'Dr. Tobechukwu Agu, BDS',
    specialistRole: 'Visiting Dental Surgeon',
    preVisitNote:
      'Important: Call +234 807 801 6691 before arrival to confirm visiting dental clinic schedule and on-site equipment readiness.',
  },
];

export const PATIENT_REVIEWS: readonly PatientReview[] = [
  {
    id: 'rev-1',
    author: 'Obinna C.',
    visitType: 'Outpatient & Internal Medicine · Ogbor Hill',
    rating: 5,
    dateLabel: 'Verified Local Guide',
    comment:
      'One of the neatest private hospitals around Ebenma Street. Nurses responded calmly on arrival and the consultant explained every step clearly.',
  },
  {
    id: 'rev-2',
    author: 'Nkechi M.',
    visitType: 'Maternity & Pediatric Follow-up',
    rating: 5,
    dateLabel: 'Verified Patient',
    comment:
      'Wheelchair access from the parking area made bringing my mother effortless, and paying by debit card at reception was straightforward.',
  },
  {
    id: 'rev-3',
    author: 'Ifeanyi A.',
    visitType: 'Fee & Medication Transparency Feedback',
    rating: 3,
    dateLabel: 'Verified Patient',
    comment:
      'Clinical team was attentive, though we wished medication pricing and outside lab steps were itemized upfront before treatment began.',
  },
];

export const FACILITY_FACTS: readonly FacilityFact[] = [
  {
    label: 'Hospital Capacity',
    value: '140 Beds',
    detail: 'Private & general inpatient wards, maternity suites, and recovery bays.',
  },
  {
    label: 'Medical Team',
    value: '68 Doctors',
    detail: 'Consultants, resident physicians, surgeons, and 24/7 perioperative nurses.',
  },
  {
    label: 'Quality Accreditation',
    value: 'HAS Accredited',
    detail: 'Strict clinical protocols, hygiene control, and confidential records.',
  },
  {
    label: 'Spoken Languages',
    value: 'English · Igbo',
    detail: 'Bilingual medical consultations and patient care coordination.',
  },
  {
    label: 'Operating Schedule',
    value: '24 Hours · 7 Days',
    detail: 'Round-the-clock admissions; weekday specialist clinics 8:00 AM – 5:00 PM.',
  },
  {
    label: 'Corporate Registry',
    value: 'CAC RC 259607',
    detail: 'Jonex Hospitals Ltd · Incorporated December 7, 1994 · Rated 4.4 / 5.',
  },
];
