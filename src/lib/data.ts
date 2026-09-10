// --------------------------------------------------
// TAPSH ENTERPRISE DATA & REPOSITORY SCHEMA
// --------------------------------------------------

export type AuditLog = {
  id: string;
  entityType: "CUSTOMER" | "HUB" | "INVOICE" | "PAYMENT";
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
};

export type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // 0.18 for 18% GST
  taxAmount: number;
  total: number;
  amountPaid: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  paymentMethods: string[];
};

export type Customer = {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  businessType: "Resort / Hotel" | "Restaurant / Café" | "Salon / Spa" | "Clinic" | "Retail" | "Office" | "Homestay" | "Other";
  notes: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
};

export type HubLink = {
  id: string;
  category: "reviews" | "social" | "contact" | "website" | "wifi" | "maps" | "custom";
  title: string;
  url: string;
  icon?: string;
};

export type Hub = {
  id: string;
  customerId: string;
  slug: string;
  businessName: string;
  businessType: string;
  shortDescription: string;
  logoUrl?: string;
  coverUrl?: string;
  accentColor?: string;
  greetingMessage?: string;
  phone: string;
  whatsapp: string;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  links: HubLink[];
  createdAt: string;
};

// --------------------------------------------------
// ORIGINAL ENTERPRISE CLIENTS & HUBS DATABASE
// --------------------------------------------------

export const mockCustomers: Customer[] = [
  {
    id: "cus_tamara_coorg",
    businessName: "The Tamara Coorg",
    contactPerson: "Ananya Rao (General Manager)",
    phone: "+91 82722 80000",
    email: "reservations@thetamara.com",
    address: "Kabbinakad Estate, Napoklu Nad, Madikeri",
    city: "Coorg, Karnataka",
    businessType: "Resort / Hotel",
    notes: "Equipped with 56 luxury cottage NFC stands and reception review docks.",
    status: "ACTIVE",
    createdAt: "2026-01-15T10:30:00.000Z"
  },
  {
    id: "cus_subko_coffee",
    businessName: "Subko Coffee Roasters & Bakehouse",
    contactPerson: "Rahul Sharma (Operations Lead)",
    phone: "+91 91360 12340",
    email: "hello@subko.coffee",
    address: "21A, Chapel Road, Ranwar, Bandra West",
    city: "Mumbai, Maharashtra",
    businessType: "Restaurant / Café",
    notes: "Deploying NFC discs across all barista counters and outdoor patio seating.",
    status: "ACTIVE",
    createdAt: "2026-02-01T14:15:00.000Z"
  },
  {
    id: "cus_truefitt_hill",
    businessName: "Truefitt & Hill Gentlemen's Grooming",
    contactPerson: "Vikramaditya Singh (Franchise Partner)",
    phone: "+91 80 4125 5566",
    email: "bangalore@truefittandhill.in",
    address: "100ft Road, HAL 2nd Stage, Indiranagar",
    city: "Bengaluru, Karnataka",
    businessType: "Salon / Spa",
    notes: "NFC mirror-mount cards for direct Google 5-star feedback and stylist tipping.",
    status: "ACTIVE",
    createdAt: "2026-02-14T11:00:00.000Z"
  },
  {
    id: "cus_dr_vaidya",
    businessName: "Dr. Vaidya's Aesthetic & Dental Studio",
    contactPerson: "Dr. Sneha Vaidya (Lead Consultant)",
    phone: "+91 98450 11223",
    email: "clinic@drvaidya.com",
    address: "80 Feet Road, 4th Block, Koramangala",
    city: "Bengaluru, Karnataka",
    businessType: "Clinic",
    notes: "Reception NFC card for Google patient reviews and instant WhatsApp appointments.",
    status: "ACTIVE",
    createdAt: "2026-02-20T09:45:00.000Z"
  },
  {
    id: "cus_blue_tokai",
    businessName: "Blue Tokai Coffee Roasters",
    contactPerson: "Preeti Reddy (Regional Store Manager)",
    phone: "+91 98850 44332",
    email: "jubilee@bluetokai.com",
    address: "Road No. 36, CBI Colony, Jubilee Hills",
    city: "Hyderabad, Telangana",
    businessType: "Restaurant / Café",
    notes: "Automated Wi-Fi one-tap connect plus Google feedback on table tents.",
    status: "ACTIVE",
    createdAt: "2026-03-02T16:20:00.000Z"
  },
  {
    id: "cus_fabindia_cp",
    businessName: "Fabindia Experience Centre",
    contactPerson: "Rajesh Mehta (Store Director)",
    phone: "+91 11 4300 5500",
    email: "cp.delhi@fabindia.net",
    address: "Block A, Inner Circle, Connaught Place",
    city: "New Delhi, Delhi",
    businessType: "Retail",
    notes: "Billing counter smart discs for loyalty signup and Google store ratings.",
    status: "ACTIVE",
    createdAt: "2026-03-05T12:00:00.000Z"
  }
];

export const mockHubs: Hub[] = [
  {
    id: "hub_tamara_coorg",
    customerId: "cus_tamara_coorg",
    slug: "tamara-coorg",
    businessName: "The Tamara Coorg",
    businessType: "Resort / Hotel",
    shortDescription: "Luxury nature retreat tucked in the lush verdant hills of Western Ghats.",
    accentColor: "#554940",
    greetingMessage: "We hope your stay is enchanting ♡",
    coverUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000",
    phone: "+91 82722 80000",
    whatsapp: "918272280000",
    status: "ACTIVE",
    links: [
      { id: "l1", category: "reviews", title: "Rate Us on Google", url: "https://g.page/r/the-tamara-coorg/review", icon: "google" },
      { id: "l2", category: "reviews", title: "TripAdvisor Excellence", url: "https://www.tripadvisor.in/Hotel_Review-The_Tamara_Coorg", icon: "tripadvisor" },
      { id: "l3", category: "reviews", title: "MakeMyTrip Reviews", url: "https://www.makemytrip.com/hotels/the_tamara_coorg", icon: "mmt" },
      { id: "l4", category: "contact", title: "Concierge & Front Desk", url: "https://wa.me/918272280000?text=Hello%20Concierge", icon: "whatsapp" },
      { id: "l5", category: "contact", title: "In-Room Dining Order", url: "tel:+918272280000", icon: "phone" },
      { id: "l6", category: "wifi", title: "Guest Wi-Fi Network", url: "wifi:TAMARA_GUEST", icon: "wifi" },
      { id: "l7", category: "website", title: "Elevation Spa & Wellness", url: "https://www.thetamara.com/coorg/spa", icon: "globe" },
      { id: "l8", category: "maps", title: "Resort Driving Route", url: "https://maps.google.com/?q=The+Tamara+Coorg", icon: "map" }
    ],
    createdAt: "2026-01-15T11:00:00.000Z"
  },
  {
    id: "hub_subko_coffee",
    customerId: "cus_subko_coffee",
    slug: "subko-coffee",
    businessName: "Subko Coffee Roasters",
    businessType: "Restaurant / Café",
    shortDescription: "Specialty coffee roastery and craft bakehouse from the Indian Subcontinent.",
    accentColor: "#554940",
    greetingMessage: "Enjoy your brew & bakes ♡",
    coverUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000",
    phone: "+91 91360 12340",
    whatsapp: "919136012340",
    status: "ACTIVE",
    links: [
      { id: "l9", category: "reviews", title: "Review on Google", url: "https://g.page/r/subko-bandra/review", icon: "google" },
      { id: "l10", category: "social", title: "Instagram @subkocoffee", url: "https://instagram.com/subkocoffee", icon: "instagram" },
      { id: "l11", category: "contact", title: "WhatsApp Ordering", url: "https://wa.me/919136012340", icon: "whatsapp" },
      { id: "l12", category: "wifi", title: "Subko High-Speed Wi-Fi", url: "wifi:Subko_Brew_5G", icon: "wifi" },
      { id: "l13", category: "website", title: "Explore Bean Origins", url: "https://subko.coffee/pages/origins", icon: "globe" }
    ],
    createdAt: "2026-02-01T14:30:00.000Z"
  },
  {
    id: "hub_truefitt_hill",
    customerId: "cus_truefitt_hill",
    slug: "truefitt-hill-indiranagar",
    businessName: "Truefitt & Hill Indiranagar",
    businessType: "Salon / Spa",
    shortDescription: "World's oldest barbershop offering royal grooming rituals since 1805.",
    accentColor: "#554940",
    greetingMessage: "A pleasure grooming you, Sir ♡",
    phone: "+91 80 4125 5566",
    whatsapp: "918041255566",
    status: "ACTIVE",
    links: [
      { id: "l14", category: "reviews", title: "Share 5-Star Experience", url: "https://g.page/r/truefitt-indiranagar/review", icon: "google" },
      { id: "l15", category: "website", title: "Book Royal Shave / Haircut", url: "https://truefittandhill.in/appointments", icon: "globe" },
      { id: "l16", category: "contact", title: "Reception WhatsApp", url: "https://wa.me/918041255566", icon: "whatsapp" },
      { id: "l17", category: "social", title: "Instagram @truefittandhill_in", url: "https://instagram.com/truefittandhill_in", icon: "instagram" }
    ],
    createdAt: "2026-02-14T11:30:00.000Z"
  },
  {
    id: "hub_dr_vaidya",
    customerId: "cus_dr_vaidya",
    slug: "dr-vaidya-clinic",
    businessName: "Dr. Vaidya's Aesthetic Studio",
    businessType: "Clinic",
    shortDescription: "Comprehensive facial aesthetics, cosmetic dentistry and smile design.",
    accentColor: "#879A77",
    greetingMessage: "Keep smiling with confidence ♡",
    phone: "+91 98450 11223",
    whatsapp: "919845011223",
    status: "ACTIVE",
    links: [
      { id: "l18", category: "reviews", title: "Review Dr. Vaidya on Google", url: "https://g.page/r/dr-vaidya-clinic/review", icon: "google" },
      { id: "l19", category: "contact", title: "Book Next Appointment", url: "https://wa.me/919845011223?text=Appointment%20Query", icon: "whatsapp" },
      { id: "l20", category: "maps", title: "Clinic Location & Parking", url: "https://maps.google.com/?q=Dr+Vaidya+Clinic+Koramangala", icon: "map" },
      { id: "l21", category: "website", title: "Treatment Portfolio", url: "https://drvaidya.com/treatments", icon: "globe" }
    ],
    createdAt: "2026-02-20T10:15:00.000Z"
  },
  {
    id: "hub_blue_tokai",
    customerId: "cus_blue_tokai",
    slug: "blue-tokai-jubilee",
    businessName: "Blue Tokai Coffee Roasters",
    businessType: "Restaurant / Café",
    shortDescription: "Artisan single-estate Arabica, pour-overs and wholesome bites.",
    accentColor: "#554940",
    greetingMessage: "Great coffee brewed just for you ♡",
    phone: "+91 98850 44332",
    whatsapp: "919885044332",
    status: "ACTIVE",
    links: [
      { id: "l22", category: "reviews", title: "Google Feedback (1-Tap)", url: "https://g.page/r/blue-tokai-jubilee/review", icon: "google" },
      { id: "l23", category: "wifi", title: "Complimentary Wi-Fi", url: "wifi:BTCR_Guest", icon: "wifi" },
      { id: "l24", category: "social", title: "Instagram @bluetokaicoffee", url: "https://instagram.com/bluetokaicoffee", icon: "instagram" },
      { id: "l25", category: "website", title: "Order Coffee Beans", url: "https://bluetokai.com", icon: "globe" }
    ],
    createdAt: "2026-03-02T16:45:00.000Z"
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv_2026_0341",
    invoiceNumber: "TAPSH/2026/0341",
    customerId: "cus_tamara_coorg",
    date: "2026-02-10T10:00:00.000Z",
    dueDate: "2026-02-24T10:00:00.000Z",
    items: [
      { productId: "prod_nfc_stand", productName: "TAPSH Matte Black NFC Table Stand (Brass Base)", quantity: 20, unitPrice: 1800, total: 36000 },
      { productId: "prod_hub_cloud", productName: "TAPSH Hub Annual Cloud Routing & Dynamic Hub", quantity: 1, unitPrice: 8500, total: 8500 },
      { productId: "prod_nfc_discs", productName: "TAPSH Walnut Wood NFC Review Disc", quantity: 15, unitPrice: 1200, total: 18000 }
    ],
    subtotal: 62500,
    discount: 2500,
    taxRate: 0.18,
    taxAmount: 10800,
    total: 70800,
    amountPaid: 70800,
    status: "PAID",
    paymentMethods: ["UPI", "BANK_TRANSFER"]
  },
  {
    id: "inv_2026_0342",
    invoiceNumber: "TAPSH/2026/0342",
    customerId: "cus_subko_coffee",
    date: "2026-02-18T14:00:00.000Z",
    dueDate: "2026-03-04T14:00:00.000Z",
    items: [
      { productId: "prod_nfc_discs", productName: "TAPSH Walnut Wood NFC Review Disc (Laser-Engraved)", quantity: 12, unitPrice: 1200, total: 14400 },
      { productId: "prod_hub_cloud", productName: "TAPSH Hub Annual Cloud Routing & Dynamic Hub", quantity: 1, unitPrice: 6000, total: 6000 }
    ],
    subtotal: 20400,
    discount: 400,
    taxRate: 0.18,
    taxAmount: 3600,
    total: 23600,
    amountPaid: 23600,
    status: "PAID",
    paymentMethods: ["UPI"]
  },
  {
    id: "inv_2026_0343",
    invoiceNumber: "TAPSH/2026/0343",
    customerId: "cus_truefitt_hill",
    date: "2026-02-25T11:30:00.000Z",
    dueDate: "2026-03-11T11:30:00.000Z",
    items: [
      { productId: "prod_nfc_cards", productName: "TAPSH Smart Matte NFC Stylist Mirror Cards", quantity: 8, unitPrice: 950, total: 7600 },
      { productId: "prod_nfc_stand", productName: "TAPSH Premium Reception Review Stand", quantity: 2, unitPrice: 2200, total: 4400 },
      { productId: "prod_hub_cloud", productName: "TAPSH Hub Annual Cloud Routing & Dynamic Hub", quantity: 1, unitPrice: 6000, total: 6000 }
    ],
    subtotal: 18000,
    discount: 0,
    taxRate: 0.18,
    taxAmount: 3240,
    total: 21240,
    amountPaid: 15000,
    status: "PARTIAL",
    paymentMethods: ["UPI"]
  },
  {
    id: "inv_2026_0344",
    invoiceNumber: "TAPSH/2026/0344",
    customerId: "cus_dr_vaidya",
    date: "2026-03-01T09:30:00.000Z",
    dueDate: "2026-03-15T09:30:00.000Z",
    items: [
      { productId: "prod_nfc_stand", productName: "TAPSH Dental Reception Review & Wi-Fi Dock", quantity: 2, unitPrice: 2200, total: 4400 },
      { productId: "prod_hub_cloud", productName: "TAPSH Hub Annual Cloud Routing & Management", quantity: 1, unitPrice: 6000, total: 6000 }
    ],
    subtotal: 10400,
    discount: 400,
    taxRate: 0.18,
    taxAmount: 1800,
    total: 11800,
    amountPaid: 0,
    status: "PENDING",
    paymentMethods: ["UPI"]
  },
  {
    id: "inv_2026_0345",
    invoiceNumber: "TAPSH/2026/0345",
    customerId: "cus_blue_tokai",
    date: "2026-03-06T15:00:00.000Z",
    dueDate: "2026-03-20T15:00:00.000Z",
    items: [
      { productId: "prod_nfc_discs", productName: "TAPSH Walnut Wood NFC Review Disc", quantity: 10, unitPrice: 1200, total: 12000 },
      { productId: "prod_hub_cloud", productName: "TAPSH Hub Annual Cloud Routing & Dynamic Hub", quantity: 1, unitPrice: 6000, total: 6000 }
    ],
    subtotal: 18000,
    discount: 500,
    taxRate: 0.18,
    taxAmount: 3150,
    total: 20650,
    amountPaid: 10000,
    status: "PARTIAL",
    paymentMethods: ["UPI"]
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "log_101",
    entityType: "HUB",
    entityId: "hub_tamara_coorg",
    field: "links.spa_booking",
    oldValue: "None",
    newValue: "https://www.thetamara.com/coorg/spa",
    changedBy: "tapsh.support@gmail.com",
    timestamp: "2026-03-08T14:20:00.000Z"
  },
  {
    id: "log_102",
    entityType: "INVOICE",
    entityId: "inv_2026_0345",
    field: "amountPaid",
    oldValue: "₹0",
    newValue: "₹10,000 (UPI Advance)",
    changedBy: "tapsh.support@gmail.com",
    timestamp: "2026-03-07T11:10:00.000Z"
  },
  {
    id: "log_103",
    entityType: "CUSTOMER",
    entityId: "cus_fabindia_cp",
    field: "status",
    oldValue: "PENDING_ONBOARDING",
    newValue: "ACTIVE",
    changedBy: "admin@tapsh.com",
    timestamp: "2026-03-05T12:30:00.000Z"
  },
  {
    id: "log_104",
    entityType: "HUB",
    entityId: "hub_subko_coffee",
    field: "wifi_ssid",
    oldValue: "Subko_Old_2G",
    newValue: "Subko_Brew_5G",
    changedBy: "tapsh.support@gmail.com",
    timestamp: "2026-03-03T09:40:00.000Z"
  }
];

// Helper functions for dynamic dashboard computation
export function getDashboardMetrics() {
  const totalCustomers = mockCustomers.length;
  const activeHubs = mockHubs.filter(h => h.status === "ACTIVE").length;
  
  const pendingInvoices = mockInvoices.filter(i => i.status === "PENDING" || i.status === "PARTIAL");
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);
  const totalRevenue = mockInvoices.reduce((acc, inv) => acc + inv.amountPaid, 0);

  return {
    totalCustomers,
    activeHubs,
    pendingInvoicesCount: pendingInvoices.length,
    pendingAmount,
    totalRevenue
  };
}

export function createCustomerAndHub(data: any): Hub {
  const customerId = `cus_${Date.now()}`;
  const hubId = `hub_${Date.now()}`;
  const slug = (data.businessName || "hub").toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const customer: Customer = {
    id: customerId,
    businessName: data.businessName,
    contactPerson: "Primary Business Contact",
    phone: data.phone || "+91 99000 00000",
    email: data.email || `contact@${slug}.com`,
    address: data.address || "Commercial Premises",
    city: "India",
    businessType: data.businessType || "Other",
    notes: data.description || "Created via TAPSH Admin Setup Wizard.",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  };
  
  const hub: Hub = {
    id: hubId,
    customerId,
    slug,
    businessName: data.businessName,
    businessType: data.businessType || "Other",
    shortDescription: data.description || "Welcome to our space.",
    logoUrl: data.logo || "",
    coverUrl: data.coverImage || "",
    accentColor: "#554940",
    greetingMessage: data.greetingMessage || "Thank you ♡",
    phone: data.phone || "",
    whatsapp: (data.whatsapp || "").replace(/[^0-9]/g, ""),
    status: "ACTIVE",
    links: data.links || [],
    createdAt: new Date().toISOString()
  };
  
  mockCustomers.unshift(customer);
  mockHubs.unshift(hub);
  
  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    entityType: "HUB",
    entityId: hubId,
    field: "creation",
    oldValue: "None",
    newValue: `Created Hub tapsh.in/h/${slug}`,
    changedBy: "tapsh.support@gmail.com",
    timestamp: new Date().toISOString()
  });

  return hub;
}
