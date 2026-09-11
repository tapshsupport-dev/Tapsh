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
  customerName?: string;
  customerDetails?: {
    businessName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
  };
  tapshHubUsed: boolean;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  deliveryCharges: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  amountPaid: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  paymentMethods: string[];
  paymentMethod?: "UPI" | "Bank Acc" | "Cash" | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  updatedAt?: string;
};

// --------------------------------------------------
// ORIGINAL ENTERPRISE CLIENTS & HUBS DATABASE
// --------------------------------------------------

export const mockCustomers: Customer[] = [];


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

export const mockInvoices: Invoice[] = [];

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

export function deleteAuditLog(id: string): boolean {
  const index = mockAuditLogs.findIndex(l => l.id === id);
  if (index !== -1) {
    mockAuditLogs.splice(index, 1);
    return true;
  }
  return false;
}

export function updateAuditLog(id: string, field: string, newValue: string): boolean {
  const log = mockAuditLogs.find(l => l.id === id);
  if (log) {
    log.field = field;
    log.newValue = newValue;
    log.timestamp = new Date().toISOString();
    return true;
  }
  return false;
}

export function deleteCustomer(id: string): boolean {
  const cIndex = mockCustomers.findIndex(c => c.id === id);
  if (cIndex !== -1) {
    mockCustomers.splice(cIndex, 1);
    // Also remove associated hub
    const hIndex = mockHubs.findIndex(h => h.customerId === id);
    if (hIndex !== -1) mockHubs.splice(hIndex, 1);
    return true;
  }
  return false;
}

