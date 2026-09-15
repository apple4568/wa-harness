/**
 * Clinic settings seed: working hours, holidays, escalation recipients and
 * (simulated) channel / CRM connection status.
 */
import type { Channel, Settings, WorkingHours } from '../domain/types.ts';

/** Clinic accounts per channel — used by every Conversation's `account` label. */
export const CHANNEL_ACCOUNTS: Record<Channel, string> = {
  instagram: '@midam.clinic',
  whatsapp: 'Midam Clinic (+82 ·· simulated)',
  line: 'Midam Clinic (LINE Official)',
  wechat: 'MidamClinic_Official',
};

export const WORKING_HOURS: WorkingHours = {
  byWeekday: {
    0: null, // Sunday closed
    1: { open: '10:00', close: '19:00' },
    2: { open: '10:00', close: '19:00' },
    3: { open: '10:00', close: '19:00' },
    4: { open: '10:00', close: '19:00' },
    5: { open: '10:00', close: '19:00' },
    6: { open: '10:00', close: '15:00' },
  },
  holidays: [
    { date: '2026-09-24', label: 'Chuseok (추석)' },
    { date: '2026-09-25', label: 'Chuseok (추석)' },
    { date: '2026-09-26', label: 'Chuseok (추석)' },
    { date: '2026-10-03', label: 'National Foundation Day (개천절)' },
    { date: '2026-10-09', label: 'Hangul Day (한글날)' },
  ],
  timeZone: 'Asia/Seoul',
};

export const SETTINGS: Settings = {
  workingHours: WORKING_HOURS,
  escalation: [
    {
      id: 'esc-front-desk-lead',
      name: 'Kim Seo-yeon (김서연)',
      role: 'Front desk lead',
      via: 'In-app + KakaoTalk (simulated)',
      enabled: true,
    },
    {
      id: 'esc-clinic-manager',
      name: 'Park Ji-hoon (박지훈)',
      role: 'Clinic manager',
      via: 'In-app + email (simulated)',
      enabled: true,
    },
    {
      id: 'esc-on-call',
      name: 'On-call coordinator',
      role: 'After-hours coordinator',
      via: 'SMS digest at next opening (simulated)',
      enabled: false,
    },
  ],
  channels: {
    instagram: { status: 'connected', account: CHANNEL_ACCOUNTS.instagram },
    whatsapp: { status: 'connected', account: CHANNEL_ACCOUNTS.whatsapp },
    line: { status: 'connected', account: CHANNEL_ACCOUNTS.line },
    wechat: { status: 'connected', account: CHANNEL_ACCOUNTS.wechat },
  },
  crmStatus: 'connected',
  aiPaused: false,
};
