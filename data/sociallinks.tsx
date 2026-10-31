/**
 * Application Social & Mobile Store Links
 */
export const PLAYSTORE_LINK =
  "https://play.google.com/store/apps/details?id=com.sribeesonline.sribees_mobile&pcampaignid=web_share";

export const SRIBEES_DIGITAL_LINK = "https://www.sribeesdigital.com/";

export const PlaystoreLink = PLAYSTORE_LINK;
export const SribeesDigitalLink = SRIBEES_DIGITAL_LINK;

export const SOCIAL_LINKS = {
  playstore: PLAYSTORE_LINK,
  sribeesDigital: SRIBEES_DIGITAL_LINK,
  facebook: "https://www.facebook.com/sribeesonline",
  instagram: "https://www.instagram.com/sribeesonline",
  youtube: "https://www.youtube.com/@sribeesonline",
  supportEmail: "support@sribeesonline.com",
} as const;

export default {
  PlaystoreLink,
  PLAYSTORE_LINK,
  SRIBEES_DIGITAL_LINK,
  SribeesDigitalLink,
  SOCIAL_LINKS,
};