// --------------------------------------------------
// FIREBASE NOSQL SCHEMA SIMULATION
// --------------------------------------------------

export type AuditLog = {
  id: string;
  entityType: "CUSTOMER" | "HUB" | "INVOICE";
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string; // Admin ID
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
  taxRate: number; // e.g., 0.18 for 18% GST
  taxAmount: number;
  total: number;
  amountPaid: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  paymentMethods: string[]; // e.g., ["UPI", "CASH"]
};

export type Customer = {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  businessType: string;
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
  accentColor?: string; // e.g., 'bg-[#6A7C64]'
  greetingMessage?: string; // e.g., 'Thank you <3'
  phone: string;
  whatsapp: string;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  links: HubLink[];
  createdAt: string;
};

// Mock Data
// --------------------------------------------------
// MOCK DATA
// --------------------------------------------------

export const mockAuditLogs: AuditLog[] = [
  {
    id: "log_1",
    entityType: "HUB",
    entityId: "hub_1",
    field: "whatsapp",
    oldValue: "+91 0000000000",
    newValue: "+91 9876543210",
    changedBy: "admin@tapsh.com",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "TAPSH-2026-00124",
    customerId: "cus_1",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    items: [
      { productId: "prod_1", productName: "TAPSH Review Stand", quantity: 5, unitPrice: 1500, total: 7500 },
      { productId: "prod_2", productName: "TAPSH Hub Setup Fee", quantity: 1, unitPrice: 4000, total: 4000 }
    ],
    subtotal: 11500,
    discount: 484, // Makes calculation neat
    taxRate: 0.18,
    taxAmount: 1983,
    total: 12999,
    amountPaid: 8000,
    status: "PARTIAL",
    paymentMethods: ["UPI"]
  }
];

export const mockCustomers: Customer[] = [
  {
    id: "cus_1",
    businessName: "The Grand Resort",
    contactPerson: "John Smith",
    phone: "+91 9876543210",
    email: "contact@grandresort.com",
    address: "123 Beach Road, Goa 403001",
    businessType: "Resort/Hotel",
    notes: "Requires fast WiFi NFC setup for all 50 rooms.",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

export const mockHubs: Hub[] = [
  {
    id: "hub_1",
    customerId: "cus_1",
    slug: "abc-resort",
    businessName: "The Grand Resort",
    businessType: "Resort/Hotel",
    shortDescription: "Relax • Reconnect • Belong",
    accentColor: "#6A7C64", // Olive green from the reference
    greetingMessage: "Thank you ♡",
    coverUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000",
    phone: "+91 9876543210",
    whatsapp: "+91 9876543210",
    status: "ACTIVE",
    links: [
      { id: "l1", category: "reviews", title: "Google", url: "https://g.page/review", icon: "google" },
      { id: "l2", category: "reviews", title: "MakeMyTrip", url: "https://makemytrip.com", icon: "mmt" },
      { id: "l3", category: "reviews", title: "Booking.com", url: "https://booking.com", icon: "booking" },
      { id: "l4", category: "reviews", title: "Tripadvisor", url: "https://tripadvisor.com", icon: "tripadvisor" },
      
      { id: "l5", category: "contact", title: "WhatsApp Reception", url: "https://wa.me/..." },
      { id: "l6", category: "contact", title: "Call Us", url: "tel:..." },
      { id: "l7", category: "maps", title: "Get Directions", url: "https://maps..." },
      { id: "l8", category: "website", title: "Visit Website", url: "https://..." },
      { id: "l9", category: "wifi", title: "Wi-Fi Info", url: "wifi:..." },
      { id: "l10", category: "website", title: "Book a Room", url: "https://..." }
    ],
    createdAt: new Date().toISOString(),
  }
];

export function createCustomerAndHub(data: any): Hub {
  const customerId = `cus_${Date.now()}`;
  const hubId = `hub_${Date.now()}`;
  const slug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const customer: Customer = {
    id: customerId,
    businessName: data.businessName,
    contactPerson: "Admin Setup",
    phone: "",
    email: "",
    address: "",
    businessType: data.businessType,
    notes: "",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  };
  
  const hub: Hub = {
    id: hubId,
    customerId,
    slug,
    businessName: data.businessName,
    businessType: data.businessType,
    shortDescription: data.description,
    logoUrl: data.logo,
    coverUrl: data.coverImage,
    greetingMessage: data.greetingMessage || "Thank you ♡",
    phone: "",
    whatsapp: "",
    status: "ACTIVE",
    links: data.links,
    createdAt: new Date().toISOString()
  };
  
  mockCustomers.push(customer);
  mockHubs.push(hub);
  
  return hub;
}
