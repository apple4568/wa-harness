/**
 * Labels + small helpers for the knowledge library screens (view-local; not part of src/lib).
 */
import type { DemoState, KnowledgeCategory, KnowledgeItem, KnowledgeState, Language } from '@/domain/types';
import { PHOTO_PROVENANCE } from '@/data/knowledge';

export const CATEGORY_ORDER: KnowledgeCategory[] = ['facility', 'services', 'access', 'hours', 'policies', 'consultation'];

export const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  facility: 'Facility',
  services: 'Services',
  access: 'Access',
  hours: 'Hours',
  policies: 'Policies',
  consultation: 'Consultation',
};

export const STATE_LABEL: Record<KnowledgeState, string> = {
  draft: 'Draft',
  approved: 'Approved',
  withdrawn: 'Withdrawn',
};

export const STATE_ORDER: KnowledgeState[] = ['draft', 'approved', 'withdrawn'];

/** Order in which text bodies are listed when an item is expanded. */
export const BODY_LANGUAGES: Language[] = ['en', 'ko', 'ja', 'zh-Hans', 'zh-Hant'];

export const UPLOAD_PROVENANCE = 'Uploaded by staff during this session — illustrative';

export interface SampleAsset {
  src: string;
  title: string;
  alt: string;
  usage: string;
}

/** Bundled sample renderings available in the "Add photo" dialog. */
export const SAMPLE_ASSETS: SampleAsset[] = [
  {
    src: '/photos/recovery-lounge.svg',
    title: 'Recovery lounge',
    alt: 'Illustration of the recovery lounge with two recliners, a side table and a wide window',
    usage: 'Send when a customer asks where they can rest after a consultation or treatment.',
  },
  {
    src: '/photos/treatment-room.svg',
    title: 'Treatment room',
    alt: 'Illustration of a treatment room with a reclining bed, cabinet and curtain',
    usage: 'Send when a customer asks what a treatment room looks like.',
  },
  {
    src: '/photos/lounge.svg',
    title: 'Lounge',
    alt: 'Illustration of the lounge with a sofa, low table and tall window',
    usage: 'Send when a customer asks about the waiting or lounge area.',
  },
];

export const SAMPLE_PROVENANCE = PHOTO_PROVENANCE;

/** Unique runtime id: `kb-session-<seq>` (ADD_KNOWLEDGE does not bump seq, so suffix if taken). */
export function nextKnowledgeId(state: DemoState, preferred?: string): string {
  if (preferred && !state.knowledge[preferred]) return preferred;
  const base = `kb-session-${state.seq}`;
  if (!state.knowledge[base]) return base;
  let n = 2;
  while (state.knowledge[`${base}-${n}`]) n += 1;
  return `${base}-${n}`;
}

/** "a customer asks where they can rest…" from "Send when a customer asks where they can rest…". */
export function usageCondition(item: KnowledgeItem): string | undefined {
  const usage = item.photo?.usage;
  if (!usage) return undefined;
  const m = /^(?:send|use)\s+when\s+(.+)$/i.exec(usage.trim());
  return m ? m[1].replace(/\.$/, '') : undefined;
}
