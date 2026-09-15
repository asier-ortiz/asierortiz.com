/**
 * Design tokens read from the Tailwind config at build time, for the few places that need
 * a literal colour outside CSS: the theme-color meta tag and the web app manifest.
 * One source of truth, so the browser chrome and the install screen follow the palette.
 */
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.mjs';

const { theme } = resolveConfig(tailwindConfig);
const colors = theme.colors as Record<string, Record<string, string>>;

/** Page background (`bg-base-950` on <html>); browsers paint their UI around the page with it. */
export const backgroundColor = colors.base['950'];
