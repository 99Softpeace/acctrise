import type { SVGProps } from "react";

type SocialIconProps = SVGProps<SVGSVGElement>;

export function InstagramIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M14.5 8.2V6.7c0-.7.5-1.1 1.2-1.1h1.6V3h-2.4c-2.6 0-4.1 1.6-4.1 4.2v1H8.7V11h2.1v10h3.1V11h2.6l.4-2.8h-3.4Z" />
    </svg>
  );
}

export function LinkedInIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M6.5 8.8H3.7V20h2.8V8.8ZM5.1 4A1.6 1.6 0 1 0 5.1 7.2 1.6 1.6 0 0 0 5.1 4ZM20.3 13.6c0-3-1.6-4.9-4.1-4.9-1.8 0-2.7 1-3.1 1.7V8.8h-2.8V20h2.8v-5.9c0-1.6.8-2.7 2.2-2.7 1.3 0 2.1.9 2.1 2.7V20h2.9v-6.4Z" />
    </svg>
  );
}