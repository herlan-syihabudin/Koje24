// lib/settings.ts
export type Settings = {
  shippingCost: number;
  minOrder: number;
  maintenanceMode: boolean;
  contact: {
    whatsapp: string;
    email: string;
    address: string;
  };
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  seo: {
    title: string;
    description: string;
  };
  promoGlobal: {
    active: boolean;
    discountPercent: number;
    minSpend: number;
  };
};

export const defaultSettings: Settings = {
  shippingCost: 15000,
  minOrder: 0,
  maintenanceMode: false,
  contact: {
    whatsapp: "6282213139580",
    email: "info@koje24.com",
    address: "Bekasi, Indonesia",
  },
  social: {
    instagram: "https://instagram.com/koje24",
    facebook: "",
    twitter: "",
  },
  seo: {
    title: "KOJE24 - Cold Pressed Juice",
    description: "Cold-pressed juice alami tanpa gula tambahan. Detox, energi, dan imunitas.",
  },
  promoGlobal: {
    active: false,
    discountPercent: 10,
    minSpend: 50000,
  },
};
