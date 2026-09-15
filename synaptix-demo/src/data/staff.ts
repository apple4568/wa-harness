/**
 * Simulated staff identities (no real authentication — `state.role` decides who is "logged in").
 */
import type { Role } from '../domain/types.ts';

export interface StaffIdentity {
  id: string;
  /** Romanised display name, e.g. "Kim Seo-yeon". */
  name: string;
  /** Hangul name shown next to the romanised one. */
  nameKo: string;
  role: Role;
  /** Job title shown in the header, e.g. "Front desk". */
  title: string;
  monogram: string;
}

export const STAFF: StaffIdentity = {
  id: 'staff-seoyeon',
  name: 'Kim Seo-yeon',
  nameKo: '김서연',
  role: 'staff',
  title: 'Front desk',
  monogram: 'SY',
};

export const MANAGER: StaffIdentity = {
  id: 'manager-jihoon',
  name: 'Park Ji-hoon',
  nameKo: '박지훈',
  role: 'manager',
  title: 'Clinic manager',
  monogram: 'JH',
};

export const STAFF_BY_ROLE: Record<Role, StaffIdentity> = {
  staff: STAFF,
  manager: MANAGER,
};

export const STAFF_BY_ID: Record<string, StaffIdentity> = {
  [STAFF.id]: STAFF,
  [MANAGER.id]: MANAGER,
};
