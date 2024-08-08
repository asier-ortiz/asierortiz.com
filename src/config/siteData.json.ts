export interface SocialLinkProps {
  platform:
      | "github"
      | "twitter"
      | "mastodon"
      | "linkedin"
      | "instagram"
      | "threads"
      | "facebook"
      | "youtube"
      | "twitch"
      | "tiktok"
      | "snapchat"
      | "reddit"
      | "pinterest"
      | "medium"
      | "dev"
      | "dribbble"
      | "behance"
      | "codepen"
      | "producthunt"
      | "discord"
      | "slack"
      | "whatsapp"
      | "telegram"
      | "email";
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
}

const siteData: SiteDataProps = {
  name: "Asier Ortiz",
  title: "Asier Ortiz - Mobile & Web App Developer",
  description: "Asier Ortiz portfolio website",
  useViewTransitions: true,
  useAnimations: true,

  socialLinks: [
    {
      platform: "github",
      link: "https://github.com/asier-ortiz",
    },
    {
      platform: "twitter",
      link: "https://x.com/asierortiz_",
    },
    {
      platform: "email",
      link: "mailto:asierortiz@outlook.es",
    },
  ],

  author: {
    name: "Asier Ortiz",
    email: "asierortiz@outlook.es",
    twitter: "asierortiz",
  },

  defaultImage: {
    src: "/images/logo.jpg", // Default Image for social networks
    alt: "Asier Ortiz logo",
  },
};

export default siteData;
