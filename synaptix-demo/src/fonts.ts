/**
 * Locally bundled fonts (SIL OFL 1.1). Vite copies the woff2 files from the
 * @fontsource packages into the build; nothing is fetched from a CDN at runtime.
 *
 * - IBM Plex Sans KR: primary UI family (Latin + Hangul) — brand spec §11
 * - Noto Sans JP / SC / TC: Japanese and Chinese glyph coverage for customer messages
 * - IBM Plex Mono: references, times, labels
 */
import '@fontsource/ibm-plex-sans-kr/400.css';
import '@fontsource/ibm-plex-sans-kr/500.css';
import '@fontsource/ibm-plex-sans-kr/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/500.css';
