import { ImageResponse } from 'next/og';
import { profile } from '@/data/profile';

// Build-time generated Open Graph card so shared links preview well
// (Section 7). Swap for real brand art before publishing if desired.
export const runtime = 'edge';
export const alt = `${profile.identity.name} — ${profile.identity.titles.join(' & ')}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 72,
          background: 'linear-gradient(135deg, #131313 0%, #1e1e1e 55%, #26210f 100%)',
          color: '#d4d4d4',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#f5a623',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            TK
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#8c8c8c' }}>
            {profile.identity.org} · {profile.identity.location}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, color: '#ffffff' }}>
          {profile.identity.name}
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#f5a623', marginTop: 12 }}>
          {profile.identity.titles.join('  ·  ')}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#9c9c9c',
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          {profile.identity.tagline}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 10,
            background: 'linear-gradient(90deg, #f5a623, #3f8ae0)',
            display: 'flex',
          }}
        />
      </div>
    ),
    size,
  );
}
