import type { BookingStage, Channel, ConnectionStatus, Customer, DeliveryState, Language, Ownership } from '@/domain/types';
import { STAFF_BY_ID } from '@/data/staff';

export const CHANNEL_LABEL: Record<Channel, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  line: 'LINE',
  wechat: 'WeChat',
};

export const CHANNEL_ORDER: Channel[] = ['instagram', 'whatsapp', 'line', 'wechat'];

export const LANGUAGE_TAG: Record<Language, string> = {
  ja: 'JA',
  'zh-Hans': 'ZH-Hans',
  'zh-Hant': 'ZH-Hant',
  en: 'EN',
  ko: 'KO',
};

/** Compact but readable — "ZH-Hant" means nothing to a front-desk user. */
export const LANGUAGE_SHORT: Record<Language, string> = {
  ja: 'Japanese',
  'zh-Hans': 'Chinese (Simp.)',
  'zh-Hant': 'Chinese (Trad.)',
  en: 'English',
  ko: 'Korean',
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  ja: 'Japanese',
  'zh-Hans': 'Chinese (Simplified)',
  'zh-Hant': 'Chinese (Traditional)',
  en: 'English',
  ko: 'Korean',
};

export const OWNERSHIP_LABEL: Record<Ownership, string> = {
  ai: 'AI handling',
  needs_human: 'Needs human',
  human: 'Human handling',
};

export const DELIVERY_LABEL: Record<DeliveryState, string> = {
  sending: 'Sending…',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
};

export const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
};

export const STAGE_LABEL: Record<BookingStage, string> = {
  idle: 'No booking in progress',
  slots_offered: 'Time offered',
  customer_confirmed: 'Customer confirmed',
  submitting: 'Booking submitted',
  crm_success: 'CRM success',
  needs_review: 'Needs review',
  confirmation_sent: 'Confirmation sent',
};

/** Resolves a staff id (or free text) to a display name. */
export function staffName(idOrName: string | undefined): string {
  if (!idOrName) return '';
  const s = STAFF_BY_ID[idOrName];
  return s ? s.name : idOrName;
}

export function staffInitials(idOrName: string | undefined): string {
  if (!idOrName) return '';
  const s = STAFF_BY_ID[idOrName];
  if (s) return s.monogram;
  return idOrName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** "Sat 19 Sep · 11:00" but with a narrow no-break for the mono time column. */
export function shortDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/** What to call a customer on screen. Falls back to the channel handle while the
 *  name is still unknown — on first contact a channel gives us a handle, not a person. */
export function customerName(customer: Customer | undefined): string {
  if (!customer) return 'Unknown contact';
  return customer.name ?? customer.handle;
}

/** True while we still only have a handle. Staff should see that plainly. */
export function isUnidentified(customer: Customer | undefined): boolean {
  return !!customer && customer.name === undefined;
}
