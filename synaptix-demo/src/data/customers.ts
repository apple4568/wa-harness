/**
 * Fictional customers. Names, handles and locations are invented for the demo;
 * phone-style handles are deliberately masked ("+61 ·· 4821").
 */
import type { Customer } from '../domain/types.ts';

export const CUSTOMER_LIST: Customer[] = [
  {
    // First contact on Instagram: we have a handle, not a name. Scenario 1 fills it in
    // via IDENTIFY_CUSTOMER once she gives it for the booking.
    id: 'cust-misaki',
    language: 'ja',
    handle: '@misaki.sato',
    location: 'Tokyo, JP',
    monogram: 'MS',
  },
  {
    id: 'cust-chiaying',
    name: '林佳穎',
    readingKo: '린자잉 · Lin Chia-ying',
    language: 'zh-Hant',
    handle: 'chiaying.lin',
    location: 'Taipei, TW',
    monogram: 'CY',
  },
  {
    id: 'cust-wei',
    name: '王伟',
    readingKo: '왕웨이 · Wang Wei',
    language: 'zh-Hans',
    handle: 'wangwei_sh',
    location: 'Shanghai, CN',
    monogram: 'WW',
  },
  {
    id: 'cust-emily',
    name: 'Emily Carter',
    readingKo: '에밀리 카터',
    language: 'en',
    handle: '+61 ·· 4821 (simulated)',
    location: 'Sydney, AU',
    monogram: 'EC',
  },
  {
    id: 'cust-hina',
    name: '中村 陽菜',
    readingKo: '나카무라 히나 · Nakamura Hina',
    language: 'ja',
    handle: '@hina.nkmr',
    location: 'Osaka, JP',
    monogram: 'HN',
  },
  {
    id: 'cust-ken',
    name: '田中 健',
    readingKo: '다나카 켄 · Tanaka Ken',
    language: 'ja',
    handle: 'ken.tanaka',
    location: 'Fukuoka, JP',
    monogram: 'KT',
  },
  {
    id: 'cust-sophie',
    name: 'Sophie Müller',
    readingKo: '소피 뮐러',
    language: 'en',
    handle: '+49 ·· 7734 (simulated)',
    location: 'Berlin, DE',
    monogram: 'SM',
  },
  {
    id: 'cust-meiling',
    name: '陈美玲',
    readingKo: '천메이링 · Chen Meiling',
    language: 'zh-Hans',
    handle: 'meiling_chen',
    location: 'Shenzhen, CN',
    monogram: 'ML',
  },
  {
    id: 'cust-daniel',
    name: 'Daniel Reyes',
    readingKo: '다니엘 레예스',
    language: 'en',
    handle: '+63 ·· 2210 (simulated)',
    location: 'Manila, PH',
    monogram: 'DR',
  },
];

export const CUSTOMERS: Record<string, Customer> = Object.fromEntries(CUSTOMER_LIST.map((c) => [c.id, c]));
