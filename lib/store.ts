"use client";

import { useMagicAuth, getStoredUser, isLoggedIn } from "@siva/shared-ui";
export { useMagicAuth, getStoredUser, isLoggedIn };

export const SITE_CONFIG = {
  name: "AnyLocal",
  site: "anylocal",
  accentColor: "#f97316",
  freeLimit: 5,
  freeFeature: "free searches",
  lockedFeature: "unlimited searches + saved places",
};

export const AFFILIATES = [
  {
    name: "Notion",
    tagline: "Manage your local business listings and customer notes",
    cta: "Try Notion →",
    color: "#000000",
    icon: "📝",
    url: "https://notion.so/?affiliate=siva",
  },
  {
    name: "Canva",
    tagline: "Create eye-catching banners to promote your business",
    cta: "Design Free →",
    color: "#7c3aed",
    icon: "🎨",
    url: "https://canva.com/?affiliate=siva",
  },
  {
    name: "Buffer",
    tagline: "Schedule social posts to drive traffic to your listing",
    cta: "Try Buffer →",
    color: "#2d5be3",
    icon: "📅",
    url: "https://buffer.com/?affiliate=siva",
  },
];
