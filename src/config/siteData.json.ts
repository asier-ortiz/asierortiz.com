import type { ImageMetadata } from 'astro';
import defaultOgImage from '@/assets/images/default-og-image.png';

export interface SocialLinkProps {
  platform:
    | 'github'
    | 'twitter'
    | 'mastodon'
    | 'linkedin'
    | 'instagram'
    | 'threads'
    | 'facebook'
    | 'youtube'
    | 'twitch'
    | 'tiktok'
    | 'snapchat'
    | 'reddit'
    | 'pinterest'
    | 'medium'
    | 'dev'
    | 'dribbble'
    | 'behance'
    | 'codepen'
    | 'producthunt'
    | 'discord'
    | 'slack'
    | 'whatsapp'
    | 'telegram'
    | 'email'
    | 'kaggle'
    | 'rss';
  link: string;
}

export interface SiteDataProps {
  name: string;
  title: string;
  description: string;
  useAnimations?: boolean;
  socialLinks: SocialLinkProps[];
  author: {
    name: string;
    email: string;
  };
  defaultImage: {
    src: ImageMetadata;
    alt: string;
  };
  blog: {
    /** Listing heading. */
    title: string;
    /** One-line pitch: listing intro, page meta and feed description. */
    description: string;
  };
  newsletter: {
    url: string;
    label?: string;
  };
  language: string;
}

const siteData: SiteDataProps = {
  name: 'Asier Ortiz',
  title: 'Asier Ortiz - Full-Stack & Data Developer',
  description:
    'Asier Ortiz, full-stack and data developer: web and mobile products from concept to production, plus a blog on the lessons behind them.',
  useAnimations: true,

  socialLinks: [
    {
      platform: 'github',
      link: 'https://github.com/asier-ortiz',
    },
    {
      platform: 'kaggle',
      link: 'https://www.kaggle.com/asierortiz',
    },
    {
      platform: 'linkedin',
      link: 'https://www.linkedin.com/in/asier-ortiz',
    },
    {
      platform: 'email',
      link: 'mailto:hello@asierortiz.com',
    },
    {
      platform: 'rss',
      link: '/rss.xml',
    },
  ],

  author: {
    name: 'Asier Ortiz',
    email: 'hello@asierortiz.com',
  },

  // Share card for pages without one of their own (1200x630, the monogram plus the role).
  defaultImage: {
    src: defaultOgImage,
    alt: 'Asier Ortiz monogram with the words Full-Stack & Data Developer and asierortiz.com',
  },

  blog: {
    title: 'Between commits',
    description:
      'Posts about web, mobile and AI. Mostly notes from projects, things that broke, things I figured out along the way.',
  },

  newsletter: {
    url: 'https://buttondown.com/asierortiz',
    label: 'Subscribe to Asier Ortiz’s newsletter',
  },

  language: 'en-us',
};

export default siteData;
