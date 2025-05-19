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
  useViewTransitions?: boolean;
  useAnimations?: boolean;
  socialLinks: SocialLinkProps[];
  author: {
    name: string;
    email: string;
    twitter: string;
  };
  defaultImage: {
    src: string;
    alt: string;
  };
  rss: {
    title: string;
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
  title: 'Asier Ortiz - AI/ML & Web Developer',
  description: 'Asier Ortiz portfolio & blog',
  useViewTransitions: true,
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
      platform: 'twitter',
      link: 'https://x.com/asierortiz_',
    },
    {
      platform: 'instagram',
      link: 'https://www.instagram.com/asierortizgarcia',
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
    twitter: 'asierortiz',
  },

  defaultImage: {
    src: '/images/default-og-image.png', // Default Image for social networks
    alt: 'Default social image for Asier Ortiz portfolio & blog.',
  },

  rss: {
    title: 'Asier Ortiz - Blog',
    description: 'Latest posts about AI, Machine Learning and Web Development',
  },

  newsletter: {
    url: '',
    label: 'Subscribe to Asier Ortiz’s newsletter',
  },

  language: 'en-us',
};

export default siteData;
