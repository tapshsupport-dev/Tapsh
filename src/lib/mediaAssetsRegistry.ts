export interface MediaAssetDefinition {
  key: string;
  label: string;
  category: "Branding" | "Admin Identity" | "Marketing & Landing" | "Hub Showcase";
  defaultPath: string;
  description: string;
  recommendedSize: string;
  aspectRatio: string;
  type: "image" | "text";
}

export const MEDIA_CATEGORIES = [
  "All",
  "Branding",
  "Admin Identity",
  "Marketing & Landing",
  "Hub Showcase",
] as const;

export const MEDIA_ASSET_REGISTRY: MediaAssetDefinition[] = [
  // ----------------------------------------------------
  // BRANDING & LOGOS
  // ----------------------------------------------------
  {
    key: "logo_dark",
    label: "Main Website Logo (Dark)",
    category: "Branding",
    defaultPath: "/images/logo-dark.png",
    description: "Used on light backgrounds: public website navigation bar, mobile admin header, and Hub footer.",
    recommendedSize: "Horizontal PNG/SVG (~300 x 80px), transparent background",
    aspectRatio: "3:1",
    type: "image",
  },
  {
    key: "logo_white",
    label: "Website Logo (White / Inverted)",
    category: "Branding",
    defaultPath: "/images/logo-white.png",
    description: "Used on dark backgrounds: public website footer, admin desktop sidebar, and admin login page.",
    recommendedSize: "Horizontal PNG/SVG (~300 x 80px), white lettering, transparent background",
    aspectRatio: "3:1",
    type: "image",
  },
  {
    key: "logo_icon",
    label: "Brand Icon / Favicon",
    category: "Branding",
    defaultPath: "/images/logo-icon.png",
    description: "Square emblem used in Hub headers, interactive animations, and browser identity.",
    recommendedSize: "Square 1:1 PNG/SVG (min 256 x 256px)",
    aspectRatio: "1:1",
    type: "image",
  },

  // ----------------------------------------------------
  // ADMIN IDENTITY
  // ----------------------------------------------------
  {
    key: "admin_avatar",
    label: "Admin Profile Avatar",
    category: "Admin Identity",
    defaultPath: "", // falls back to initials or default icon
    description: "Profile photo shown in the top navigation bar of the Admin Console (desktop & mobile).",
    recommendedSize: "Square 1:1 headshot / logo (min 200 x 200px)",
    aspectRatio: "1:1",
    type: "image",
  },
  {
    key: "admin_name",
    label: "Admin Display Name",
    category: "Admin Identity",
    defaultPath: "TAPSH Operations",
    description: "Operational label displayed next to your avatar in the Admin Console topbar.",
    recommendedSize: "Plain text (e.g. 'TAPSH Operations' or 'Administrator')",
    aspectRatio: "text",
    type: "text",
  },

  // ----------------------------------------------------
  // MARKETING & LANDING
  // ----------------------------------------------------
  {
    key: "hero_backdrop",
    label: "Home Hero Product Backdrop",
    category: "Marketing & Landing",
    defaultPath: "/images/hero_backdrop.png",
    description: "Full-width background image displayed on the main landing page hero banner.",
    recommendedSize: "High-resolution landscape (1920 x 1080px)",
    aspectRatio: "16:9",
    type: "image",
  },
  {
    key: "tapsh_lifestyle",
    label: "Lifestyle NFC Card Showcase",
    category: "Marketing & Landing",
    defaultPath: "/images/tapsh_lifestyle.png",
    description: "Featured physical product photo in the 'Why TAPSH?' section on the homepage.",
    recommendedSize: "High-res square or portrait (1000 x 1000px)",
    aspectRatio: "1:1",
    type: "image",
  },

  // ----------------------------------------------------
  // HUB SHOWCASE & INDUSTRY MOCKUPS
  // ----------------------------------------------------
  {
    key: "hub_preview",
    label: "TAPSH Hub Mobile Preview",
    category: "Hub Showcase",
    defaultPath: "/images/hub-preview.png",
    description: "Large mobile phone mockup featured prominently on the 'TAPSH Hub' overview page.",
    recommendedSize: "Vertical phone screen mockup (~800 x 1000px)",
    aspectRatio: "4:5",
    type: "image",
  },
  {
    key: "resort_hub_ui",
    label: "Resort / Hotel Hub Mockup",
    category: "Hub Showcase",
    defaultPath: "/images/resort_hub_ui.png",
    description: "Preview card for hospitality & hotel hubs on the Hub info page.",
    recommendedSize: "Vertical 9:16 screen UI (~600 x 1060px)",
    aspectRatio: "9:16",
    type: "image",
  },
  {
    key: "restaurant_hub_ui",
    label: "Restaurant / Café Hub Mockup",
    category: "Hub Showcase",
    defaultPath: "/images/restaurant_hub_ui.png",
    description: "Preview card for dining & café hubs on the Hub info page.",
    recommendedSize: "Vertical 9:16 screen UI (~600 x 1060px)",
    aspectRatio: "9:16",
    type: "image",
  },
  {
    key: "salon_hub_ui",
    label: "Salon / Spa Hub Mockup",
    category: "Hub Showcase",
    defaultPath: "/images/salon_hub_ui.png",
    description: "Preview card for salon & wellness hubs on the Hub info page.",
    recommendedSize: "Vertical 9:16 screen UI (~600 x 1060px)",
    aspectRatio: "9:16",
    type: "image",
  },
  {
    key: "clinic_hub_ui",
    label: "Clinic / Healthcare Hub Mockup",
    category: "Hub Showcase",
    defaultPath: "/images/clinic_hub_ui.png",
    description: "Preview card for healthcare & clinic hubs on the Hub info page.",
    recommendedSize: "Vertical 9:16 screen UI (~600 x 1060px)",
    aspectRatio: "9:16",
    type: "image",
  },
];
