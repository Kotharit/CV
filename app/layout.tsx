import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { profile } from '@/data/profile';
import { THEME_IDS, THEME_STORAGE_KEY } from '@/lib/themes';
import './globals.css';

// TODO: point at the real production domain before publishing.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taha-kothari.example.com';

const TITLE = `${profile.identity.name} — ${profile.identity.titles.join(' & ')}`;
const DESCRIPTION = `${profile.identity.tagline} ${profile.identity.titles.join(' & ')} at ${profile.identity.org}, ${profile.identity.location}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${profile.identity.name}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'profile',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: profile.identity.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#131313',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before first paint: resolves ?theme= URL param (wins on first load)
 * → localStorage → default, and stamps it on <html data-theme>. Paired with
 * the CSS no-flash guard in globals.css. Keep key/ids in sync with lib/themes.
 */
const themeInitScript = `(function(){try{
var valid=${JSON.stringify(THEME_IDS)};
var p=new URLSearchParams(location.search).get('theme');
var s=null;try{s=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}
var t=valid.indexOf(p)>-1?p:(valid.indexOf(s)>-1?s:'premiere');
document.documentElement.dataset.theme=t;
if(valid.indexOf(p)>-1){try{localStorage.setItem('${THEME_STORAGE_KEY}',p)}catch(e){}}
}catch(e){document.documentElement.dataset.theme='premiere'}})();`;

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: profile.identity.name,
    jobTitle: profile.identity.titles.join(' & '),
    worksFor: { '@type': 'Organization', name: profile.identity.org },
    address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
    email: `mailto:${profile.identity.links.email}`,
    url: SITE_URL,
    sameAs: [profile.identity.links.linkedin, profile.identity.links.github],
    knowsAbout: [
      ...profile.expertise.it,
      ...profile.expertise.marketing,
      ...profile.expertise.creative,
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education[0].institution },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="premiere" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
