/**
 * TEMPORARY shim while src/data/seed.ts and src/scenarios are still landing.
 * Components import { useDemo, usePlayer, DemoProvider } from here; when the real
 * store compiles this file re-exports '@/state/store' and the stub is deleted.
 */
export { DemoProvider, useDemo, usePlayer } from '@/components/dev/stubStore';
