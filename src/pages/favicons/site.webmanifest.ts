/**
 * Web app manifest, generated at build time so the name, description and colours come from
 * the same sources as the rest of the site (siteData and the Tailwind palette).
 */
import siteData from '@/config/siteData.json';
import { backgroundColor } from '@/config/theme';

export function GET() {
  const manifest = {
    name: siteData.name,
    short_name: siteData.name,
    description: siteData.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: backgroundColor,
    icons: [
      { src: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
