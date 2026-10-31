import { ROUTES } from "@/constants/routes";
import { PLAYSTORE_LINK, SOCIAL_LINKS } from "@/constants/links";

export const STORE_URLS = {
  playStore: PLAYSTORE_LINK,
  // Placeholder until the live App Store listing URL is supplied.
  appStore: "https://apps.apple.com/app/sribees-online",
};

export const AFFILIATE_PORTAL_URL = "https://affiliate.sribees.online";

export const navLinks = [
  { label: "Shop", href: ROUTES.HOME },
  { label: "How it Works", href: ROUTES.HOW_IT_WORKS },
  { label: "About Us", href: ROUTES.ABOUT },
  { label: "Become a Partner", href: ROUTES.BECOME_PARTNER },
];

export const socialLinks = [
  { label: "Facebook", href: SOCIAL_LINKS.facebook },
  { label: "Instagram", href: SOCIAL_LINKS.instagram },
  { label: "YouTube", href: SOCIAL_LINKS.youtube },
];

export const footerSections = [
  {
    title: "PLATFORM",
    links: [
      { label: "Shop Online", href: ROUTES.HOME },
      { label: "Deals & Offers", href: ROUTES.PROMOTIONS },
      { label: "How It Works", href: ROUTES.HOW_IT_WORKS },
      { label: "About Us", href: ROUTES.ABOUT },
    ],
  },
  {
    title: "FOR BUSINESSES",
    links: [
      { label: "Become a Partner", href: ROUTES.BECOME_PARTNER },
      { label: "Partner Login", href: AFFILIATE_PORTAL_URL },
    ],
  },
  { title: "CONNECT", links: socialLinks },
  {
    title: "CONTACT",
    links: [
      { label: SOCIAL_LINKS.supportEmail, href: `mailto:${SOCIAL_LINKS.supportEmail}` },
    ],
  },
];
