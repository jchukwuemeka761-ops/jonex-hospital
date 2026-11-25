import {SLOTS_BY_CATEGORY} from './booking.logic';
import {
  CLINICAL_SERVICES,
  DOCTOR_PROFILES,
  EXECUTIVE_DIRECTORS,
  HOSPITAL_PROFILE,
  INFRASTRUCTURE_HIGHLIGHTS,
} from './hospital-data';

export interface AssistantMessage {
  readonly role: 'user' | 'assistant';
  readonly text: string;
}

export type AssistantPayloadValidation =
  | {
      readonly ok: true;
      readonly message: string;
      readonly history: readonly AssistantMessage[];
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export const ASSISTANT_SUGGESTED_QUESTIONS: readonly string[] = [
  'What are your opening hours and clinic schedule?',
  'Which services, tests, and fees do you offer?',
  'How do I book, reschedule, or cancel an appointment?',
  'Which doctors and executive directors lead Jonex Hospital?',
];

export function validateAssistantPayload(rawBody: unknown): AssistantPayloadValidation {
  if (!rawBody || typeof rawBody !== 'object') {
    return {ok: false, error: 'Request payload must be a JSON object.'};
  }

  const record = rawBody as Record<string, unknown>;
  const rawMessage = typeof record['message'] === 'string' ? record['message'].trim() : '';

  if (!rawMessage) {
    return {ok: false, error: 'Please enter a question for the Jonex Hospital Assistant.'};
  }
  if (rawMessage.length > 1200) {
    return {
      ok: false,
      error: 'Please keep each question under 1,200 characters.',
    };
  }

  const sanitizedHistory: AssistantMessage[] = [];
  if (Array.isArray(record['history'])) {
    for (const item of record['history'].slice(-10)) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const entry = item as Record<string, unknown>;
      const role = entry['role'];
      const text = typeof entry['text'] === 'string' ? entry['text'].trim() : '';
      if ((role === 'user' || role === 'assistant') && text.length > 0) {
        sanitizedHistory.push({
          role,
          text: text.slice(0, 2000),
        });
      }
    }
  }

  return {
    ok: true,
    message: rawMessage,
    history: sanitizedHistory,
  };
}

export function cleanAssistantReplyText(rawText: string): string {
  return rawText
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*\*\s+/gm, '• ')
    .trim();
}

export function buildHospitalKnowledgeContext(): string {
  const servicesSummary = CLINICAL_SERVICES.map(
    (s) =>
      `- ${s.title} (${s.department}, category: ${s.categoryLabel}): Duration ${s.durationMinutes} min | Fee range ${s.feeRangeNgn} | Lead: ${s.specialistName} (${s.specialistRole}) | Phone pre-confirm required: ${s.confirmOnSiteByPhone ? 'Yes (+234 807 801 6691)' : 'No, immediate online slot'} | Pre-visit instructions: ${s.preVisitNote}`,
  ).join('\n');

  const doctorsSummary = DOCTOR_PROFILES.map(
    (d) =>
      `- ${d.name} (${d.credentials}) — ${d.role} | Specialty: ${d.specialty} | Hours: ${d.clinicHours} | Languages: ${d.languages.join(', ')}`,
  ).join('\n');

  const directorsSummary = EXECUTIVE_DIRECTORS.map(
    (dir) => `- ${dir.name} (${dir.role} · ${dir.credential}): ${dir.focus}`,
  ).join('\n');

  const infraSummary = INFRASTRUCTURE_HIGHLIGHTS.map(
    (i) => `- ${i.title} (${i.department}): ${i.description}`,
  ).join('\n');

  const slotScheduleSummary = [
    `Surgery Consults: ${SLOTS_BY_CATEGORY.surgery.join(', ')}`,
    `General & Internal Medicine Checkups: ${SLOTS_BY_CATEGORY.checkup.join(', ')}`,
    `Diagnostic Lab & ECG/Ultrasound: ${SLOTS_BY_CATEGORY.diagnostic.join(', ')}`,
    `Maternity & Pediatrics: ${SLOTS_BY_CATEGORY.maternity.join(', ')}`,
    `Specialty / Dental Care: ${SLOTS_BY_CATEGORY.specialty.join(', ')}`,
  ].join('\n');

  return `You are the official Patient Information & Appointment Assistant for ${HOSPITAL_PROFILE.name} (${HOSPITAL_PROFILE.legalName}, ${HOSPITAL_PROFILE.cacRegistration}), located in Aba, Abia State, Nigeria.

Answer user questions clearly, warmly, and concisely using ONLY verified facts from this hospital website knowledge base below:

[HOSPITAL QUICK FACTS & LOCATION]
- Name: ${HOSPITAL_PROFILE.name} (Corporate entity: ${HOSPITAL_PROFILE.legalName}, CAC ${HOSPITAL_PROFILE.cacRegistration}, incorporated ${HOSPITAL_PROFILE.incorporatedDate})
- Primary Hospital Address: ${HOSPITAL_PROFILE.primaryAddress}
- Corporate Registry Office: ${HOSPITAL_PROFILE.corporateRegistryAddress}
- 24/7 Telephone / Front Desk: ${HOSPITAL_PROFILE.phoneDisplay}
- Capacity & Accreditation: ${HOSPITAL_PROFILE.bedsCount} beds, ${HOSPITAL_PROFILE.doctorsCount} doctors, ${HOSPITAL_PROFILE.accreditation}, Public Rating ${HOSPITAL_PROFILE.ratingScore}/5 (${HOSPITAL_PROFILE.ratingCount} reviews)
- Languages: ${HOSPITAL_PROFILE.languages.join(' and ')}
- Operating Hours: ${HOSPITAL_PROFILE.hoursPrimary}. ${HOSPITAL_PROFILE.hoursClinicNote}
- Accessibility & Payments: ${HOSPITAL_PROFILE.accessibility} Accepted payments: ${HOSPITAL_PROFILE.paymentMethods.join(', ')}.
- Vision: ${HOSPITAL_PROFILE.vision}
- Mission: ${HOSPITAL_PROFILE.mission}
- Quality Standard: ${HOSPITAL_PROFILE.qualityStandard}
- Important Transparency Note: ${HOSPITAL_PROFILE.capabilityNotice}

[EXECUTIVE BOARD OF DIRECTORS]
${directorsSummary}

[INFRASTRUCTURE & WINGS]
${infraSummary}

[DOCTORS & CLINIC SCHEDULES]
${doctorsSummary}

[SERVICES, FEES (NGN) & PRE-VISIT PREPARATION]
${servicesSummary}

[ONLINE APPOINTMENT BOOKING SYSTEM & AVAILABLE SLOTS]
- Patients book online at the Appointments page (/appointments) with no account login required.
- Available daily slots (next 8 days selectable):
${slotScheduleSummary}
- Visit modes: "In-Person at Ogbor Hill" or "Pre-Visit Phone Triage".
- Payment selection at booking: Credit or Debit Card, NFC Mobile Payment, or Front Desk Settlement.
- Patients can view, reschedule to another open time slot, or cancel existing bookings in the "My Bookings" tab on /appointments (stored in browser localStorage with double-booking prevention and JNX-YYYY-XXXX reference codes).
- Patients can also browse doctors on /doctors ("Book Session" pre-selects that doctor & service) or get live driving directions on /patients-and-visitors or the Home page (#directions).

[SAFETY & BOUNDARY RULES]
1. Stay strictly factual to the website details above. Do not invent unverified specialists, test prices, or equipment.
2. If a user describes urgent or emergency symptoms (severe chest pain, trouble breathing, heavy bleeding, acute trauma, high fever in newborns), advise them to visit the 24/7 Ogbor Hill facility at Ebenma Street or call ${HOSPITAL_PROFILE.phoneDisplay} immediately rather than waiting for an online slot.
3. Never provide personal medical diagnoses or prescriptions; offer general booking, hours, prep, service, and hospital navigation guidance instead.
4. Keep answers scannable and concise (under ~130 words unless listing all services), formatted in clean plain text WITHOUT markdown asterisks (** or *) or backticks (\`). Use simple numbered steps or bullet symbols (•) and mention relevant pages (/appointments, /services, /doctors, /patients-and-visitors).`;
}
