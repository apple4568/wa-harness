import type { SVGProps } from 'react';
import type { Channel } from '@/domain/types';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...rest,
});

/** Simple monochrome channel marks (not brand logos). 16 px grid, 1.5 px stroke. */
export function InstagramGlyph({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="3" />
      <circle cx="8" cy="8" r="2.6" />
      <circle cx="11.3" cy="4.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappGlyph({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M8 2.5a5.5 5.5 0 0 0-4.7 8.35L2.5 13.5l2.75-.75A5.5 5.5 0 1 0 8 2.5Z" />
      <path d="M6.2 6.1c.1 1.9 1.8 3.6 3.7 3.7l.6-.8-1.1-.6-.6.4c-.5-.2-1.2-.9-1.4-1.4l.4-.6-.6-1.1-1 .4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LineGlyph({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M8 2.75c-3.2 0-5.75 2.1-5.75 4.7 0 2.3 2 4.2 4.7 4.6l-.3 1.95 2.3-1.8c2.9-.2 4.8-2.2 4.8-4.75 0-2.6-2.55-4.7-5.75-4.7Z" />
      <path d="M5.4 6.4v2.4M7.4 6.4v2.4M9.4 6.4v2.4l1.6-2.4v2.4" strokeWidth="1.2" />
    </svg>
  );
}

export function WechatGlyph({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M6.5 2.75c-2.5 0-4.25 1.55-4.25 3.5 0 1.2.7 2.2 1.75 2.8l-.4 1.45 1.7-.9c.4.1.8.15 1.2.15" />
      <path d="M10 6.25c2 0 3.75 1.3 3.75 3 0 1-.6 1.9-1.5 2.4l.35 1.25-1.45-.8c-.35.1-.75.15-1.15.15-2 0-3.75-1.3-3.75-3s1.75-3 3.75-3Z" />
      <circle cx="5.2" cy="5.6" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="7.6" cy="5.6" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="8.9" cy="8.8" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="11.1" cy="8.8" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChannelGlyph({ channel, size = 16, ...rest }: IconProps & { channel: Channel }) {
  switch (channel) {
    case 'instagram':
      return <InstagramGlyph size={size} {...rest} />;
    case 'whatsapp':
      return <WhatsappGlyph size={size} {...rest} />;
    case 'line':
      return <LineGlyph size={size} {...rest} />;
    case 'wechat':
      return <WechatGlyph size={size} {...rest} />;
  }
}

/** Synaptix "node" glyph used to mark the assistant: two nodes joined by a link. */
export function NodeGlyph({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)} viewBox="0 0 16 16">
      <circle cx="4" cy="11" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="5" r="2.1" fill="currentColor" stroke="none" />
      <path d="M5.5 9.5 10.5 6.5" strokeWidth="1.8" />
    </svg>
  );
}

/** Synaptix brand symbol (inline copy of public/brand/symbol-*.svg path, current-colour fill). */
export function SynaptixSymbol({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size * 0.796} height={size} viewBox="10.2 0 79.6 100" aria-hidden="true" {...rest}>
      <path
        fill="currentColor"
        d="M 78.89 11.1 C 66.24 -4.96 41.4 -3.3 31.21 14.51 C 29.42 17.64 28.24 21.11 27.72 24.68 C 26.3 34.54 30.26 44.69 37.96 51.01 C 42.43 54.67 46.9 58.33 51.37 61.99 C 53.22 63.51 54.59 65.58 55.27 67.88 C 58.5 78.88 45.84 87.65 36.56 80.74 C 37.46 78.4 37.83 75.95 37.46 73.46 C 37.09 70.94 36 68.54 34.36 66.6 C 26.83 57.72 12.26 61.75 10.36 73.24 C 10.05 75.16 10.14 77.14 10.65 79.02 C 11.19 81.05 12.2 82.94 13.58 84.51 C 15.57 86.79 18.19 88.21 21.11 88.9 C 33.76 104.96 58.6 103.3 68.79 85.49 C 70.58 82.36 71.76 78.89 72.28 75.32 C 73.7 65.46 69.74 55.31 62.04 48.99 C 57.57 45.33 53.1 41.67 48.63 38.01 C 46.78 36.49 45.41 34.42 44.73 32.12 C 41.5 21.12 54.16 12.35 63.44 19.26 C 62.54 21.6 62.17 24.05 62.54 26.54 C 62.82 28.47 63.52 30.33 64.58 31.96 C 70.88 41.74 85.85 39.65 89.23 28.51 C 89.97 26.07 90.01 23.44 89.35 20.98 C 88.81 18.95 87.8 17.06 86.42 15.49 C 84.43 13.21 81.81 11.79 78.89 11.1 Z"
      />
    </svg>
  );
}
