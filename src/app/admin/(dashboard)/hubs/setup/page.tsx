"use client";

import { useState } from "react";
import { 
  Check, ChevronRight, Upload, Plus, Trash2, 
  Building2, Coffee, Scissors, PlusCircle, ShoppingBag, Briefcase, 
  ChevronDown, ChevronUp, Copy, QrCode, Download, ExternalLink, User 
} from "lucide-react";
import HubView from "@/components/HubView";
import Link from "next/link";
import { createCustomerAndHub } from "@/lib/data";

const BUSINESS_TYPES = [
  { id: "Resort / Hotel", icon: Building2 },
  { id: "Restaurant / Café", icon: Coffee },
  { id: "Salon / Spa", icon: Scissors },
  { id: "Clinic", icon: PlusCircle },
  { id: "Shop / Retail", icon: ShoppingBag },
  { id: "Office", icon: Briefcase },
  { id: "Homestay", icon: Building2 },
  { id: "Other", icon: ShoppingBag }
];

const LINK_TEMPLATES = {
  reviews: [
    { title: "Google", icon: "google" },
    { title: "Booking.com", icon: "booking" },
    { title: "MakeMyTrip", icon: "mmt" },
    { title: "Goibibo", icon: "goibibo" },
    { title: "Tripadvisor", icon: "tripadvisor" },
    { title: "Other review platform", icon: "star" }
  ],
  social: [
    { title: "Instagram", icon: "instagram" },
    { title: "Facebook", icon: "facebook" },
    { title: "YouTube", icon: "youtube" },
    { title: "Other", icon: "link" }
  ],
  contact: [
    { title: "WhatsApp", icon: "whatsapp" },
    { title: "Phone / Call", icon: "phone" },
    { title: "Email", icon: "mail" },
    { title: "Google Maps / Directions", icon: "map" }
  ],
  website: [
    { title: "Website", icon: "globe" },
    { title: "Booking page", icon: "calendar" },
    { title: "Reservation", icon: "calendar" },
    { title: "Order online", icon: "shopping-cart" }
  ]
};

export default function HubSetupWizard() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdHub, setCreatedHub] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("reviews");

  const [data, setData] = useState({
    businessType: "",
    businessName: "",
    description: "",
    logo: "",
    coverImage: "",
    greetingMessage: "Thank you ♡",
    links: [] as any[],
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSaveAndCreate = () => {
    // Save to local mock backend
    const hub = createCustomerAndHub(data);
    setCreatedHub(hub);
    setIsSuccess(true);
  };

  const handleUpdateLink = (category: string, title: string, url: string, icon?: string) => {
    setData(prev => {
      const existingLinkIndex = prev.links.findIndex(l => l.category === category && l.title === title);
      const newLinks = [...prev.links];
      
      if (url.trim() === "") {
        // Remove if empty
        if (existingLinkIndex >= 0) newLinks.splice(existingLinkIndex, 1);
      } else {
        // Update or Add
        if (existingLinkIndex >= 0) {
          newLinks[existingLinkIndex].url = url;
        } else {
          newLinks.push({ id: `temp_${Date.now()}_${Math.random()}`, category, title, url, icon });
        }
      }
      return { ...prev, links: newLinks };
    });
  };

  const getLinkValue = (category: string, title: string) => {
    return data.links.find(l => l.category === category && l.title === title)?.url || "";
  };

  // STEP 1: BUSINESS TYPE
  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-tapsh-black mb-2">Select Business Type</h2>
        <p className="text-tapsh-charcoal font-medium text-lg">Choose the category that best describes your business.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {BUSINESS_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setData({ ...data, businessType: type.id })}
            className={`p-8 rounded-[2rem] border-2 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-4 ${
              data.businessType === type.id 
                ? 'border-tapsh-soft-green bg-tapsh-pale-blue text-tapsh-black scale-105 shadow-lg' 
                : 'border-tapsh-charcoal/30 bg-white text-tapsh-charcoal hover:border-tapsh-soft-green/50 hover:bg-tapsh-pale-blue/50'
            }`}
          >
            <type.icon className={`w-10 h-10 ${data.businessType === type.id ? 'text-tapsh-soft-green' : 'text-tapsh-charcoal'}`} />
            <span className="font-bold">{type.id}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 2: DETAILS
  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-tapsh-black mb-2">Add Business Details</h2>
        <p className="text-tapsh-charcoal font-medium text-lg">Tell us about your business.</p>
      </div>
      
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-tapsh-black mb-2 uppercase tracking-wider">Business Name *</label>
          <input 
            type="text" 
            value={data.businessName}
            onChange={(e) => setData({...data, businessName: e.target.value})}
            className="w-full px-6 py-4 rounded-2xl border border-tapsh-charcoal/40 bg-white text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent font-medium shadow-sm transition-all text-lg"
            placeholder="e.g. The Hillside Resort"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-tapsh-black mb-2 uppercase tracking-wider">Short Description</label>
          <textarea 
            rows={3}
            value={data.description}
            onChange={(e) => setData({...data, description: e.target.value})}
            className="w-full px-6 py-4 rounded-2xl border border-tapsh-charcoal/40 bg-white text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent font-medium shadow-sm transition-all text-lg resize-none"
            placeholder="A peaceful getaway in the heart of nature."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-tapsh-black mb-2 uppercase tracking-wider">Business Logo</label>
            <div className="border-2 border-dashed border-tapsh-charcoal/40 rounded-3xl p-8 text-center bg-white hover:bg-tapsh-pale-blue/50 hover:border-tapsh-soft-green transition-all cursor-pointer shadow-sm group">
              <Upload className="w-10 h-10 text-tapsh-soft-green mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm font-bold text-tapsh-black">Upload Logo</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-tapsh-black mb-2 uppercase tracking-wider">Cover Image (Optional)</label>
            <div className="border-2 border-dashed border-tapsh-charcoal/40 rounded-3xl p-8 text-center bg-white hover:bg-tapsh-pale-blue/50 hover:border-tapsh-soft-green transition-all cursor-pointer shadow-sm group">
              <Upload className="w-10 h-10 text-tapsh-soft-green mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm font-bold text-tapsh-black">Upload Cover</span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-tapsh-black mb-2 uppercase tracking-wider">Greeting Message</label>
          <input 
            type="text" 
            value={data.greetingMessage}
            onChange={(e) => setData({...data, greetingMessage: e.target.value})}
            className="w-full px-6 py-4 rounded-2xl border border-tapsh-charcoal/40 bg-white text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent font-medium shadow-sm transition-all text-lg"
            placeholder="Thank you ♡"
          />
        </div>
      </div>
    </div>
  );

  // STEP 3: LINKS
  const renderStep3 = () => {
    const AccordionItem = ({ id, title, icon: Icon, children }: any) => {
      const isExpanded = expandedCategory === id;
      return (
        <div className="border border-tapsh-charcoal/30 rounded-3xl overflow-hidden bg-white shadow-sm mb-4 transition-all">
          <button 
            onClick={() => setExpandedCategory(isExpanded ? null : id)}
            className="w-full flex items-center justify-between p-6 bg-white hover:bg-tapsh-pale-blue/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-tapsh-pale-blue text-tapsh-soft-green flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-tapsh-black text-lg">{title}</h3>
            </div>
            {isExpanded ? <ChevronUp className="w-6 h-6 text-tapsh-charcoal" /> : <ChevronDown className="w-6 h-6 text-tapsh-charcoal" />}
          </button>
          {isExpanded && (
            <div className="p-6 pt-0 bg-white border-t border-tapsh-charcoal/10">
              <div className="mt-6 space-y-4">
                {children}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-tapsh-black mb-2">Add Links (Optional)</h2>
          <p className="text-tapsh-charcoal font-medium text-lg">Add only the links you want to show. Leave the rest empty.</p>
        </div>

        <div className="space-y-4">
          <AccordionItem id="reviews" title="Review Links" icon={StarIcon}>
            {LINK_TEMPLATES.reviews.map(link => (
              <div key={link.title} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-tapsh-black">{link.title}</label>
                <input 
                  type="url" 
                  placeholder={`Enter ${link.title} URL`} 
                  value={getLinkValue("reviews", link.title)}
                  onChange={(e) => handleUpdateLink("reviews", link.title, e.target.value, link.icon)}
                  className="w-full px-5 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/20 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green transition-all"
                />
              </div>
            ))}
          </AccordionItem>

          <AccordionItem id="social" title="Social Media" icon={CameraIcon}>
            {LINK_TEMPLATES.social.map(link => (
              <div key={link.title} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-tapsh-black">{link.title}</label>
                <input 
                  type="url" 
                  placeholder={`Enter ${link.title} URL`} 
                  value={getLinkValue("social", link.title)}
                  onChange={(e) => handleUpdateLink("social", link.title, e.target.value, link.icon)}
                  className="w-full px-5 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/20 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green transition-all"
                />
              </div>
            ))}
          </AccordionItem>

          <AccordionItem id="contact" title="Contact" icon={PhoneIcon}>
             {LINK_TEMPLATES.contact.map(link => (
              <div key={link.title} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-tapsh-black">{link.title}</label>
                <input 
                  type="text" 
                  placeholder={`Enter ${link.title} detail`} 
                  value={getLinkValue("contact", link.title)}
                  onChange={(e) => handleUpdateLink("contact", link.title, e.target.value, link.icon)}
                  className="w-full px-5 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/20 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green transition-all"
                />
              </div>
            ))}
          </AccordionItem>

          <AccordionItem id="website" title="Website & Booking" icon={GlobeIcon}>
             {LINK_TEMPLATES.website.map(link => (
              <div key={link.title} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-tapsh-black">{link.title}</label>
                <input 
                  type="url" 
                  placeholder={`Enter ${link.title} URL`} 
                  value={getLinkValue("website", link.title)}
                  onChange={(e) => handleUpdateLink("website", link.title, e.target.value, link.icon)}
                  className="w-full px-5 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/20 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green transition-all"
                />
              </div>
            ))}
          </AccordionItem>
          
          <AccordionItem id="wifi" title="Wi-Fi (Optional)" icon={WifiIcon}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-tapsh-black">Wi-Fi Name (SSID)</label>
              <input 
                type="text" 
                placeholder="Network Name" 
                className="w-full px-5 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/20 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green transition-all"
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-bold text-tapsh-black">Wi-Fi Password</label>
              <input 
                type="text" 
                placeholder="Password" 
                className="w-full px-5 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue/20 text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green transition-all"
              />
            </div>
            <p className="text-xs font-bold text-tapsh-charcoal mt-2">Note: This creates a tap-to-connect Wi-Fi card.</p>
          </AccordionItem>
          
          <AccordionItem id="custom" title="Custom Links" icon={LinkIcon2}>
            <button className="w-full py-4 border-2 border-dashed border-tapsh-charcoal/40 rounded-xl text-tapsh-soft-green font-bold flex items-center justify-center gap-2 hover:bg-tapsh-pale-blue/50 transition-colors">
              <Plus className="w-5 h-5" /> Add Custom Link
            </button>
          </AccordionItem>
        </div>
      </div>
    );
  };

  // STEP 4: PREVIEW
  const renderStep4 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-tapsh-black mb-2">Preview & Save</h2>
        <p className="text-tapsh-charcoal font-medium text-lg">See exactly how your Hub will look.</p>
      </div>

      <div className="flex justify-center bg-tapsh-pale-blue rounded-3xl sm:rounded-[3rem] border border-tapsh-charcoal/30 p-2 sm:p-8 md:p-12 shadow-inner overflow-hidden">
        {/* Mobile Device Frame Mockup */}
        <div className="w-full max-w-[340px] sm:max-w-[375px] h-[750px] sm:h-[812px] bg-white rounded-[2.5rem] sm:rounded-[3rem] border-8 sm:border-[12px] border-tapsh-black shadow-2xl overflow-hidden relative origin-top">
          <HubView data={{
            ...data,
            businessName: data.businessName || "Your Business Name",
            description: data.description || "Welcome to our space. Select an option below.",
            // Fill with dummy data if empty so preview looks nice
            links: data.links.length > 0 ? data.links : [
              { id: 1, category: "reviews", title: "Google", url: "#" },
              { id: 2, category: "reviews", title: "Tripadvisor", url: "#" },
              { id: 3, category: "contact", title: "WhatsApp", url: "#" },
              { id: 4, category: "contact", title: "Call Us", url: "#" },
              { id: 5, category: "website", title: "Visit Website", url: "#" },
            ]
          }} />
        </div>
      </div>
    </div>
  );

  // SUCCESS SCREEN
  const renderSuccess = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto text-center py-12">
      <div className="w-24 h-24 bg-tapsh-pale-blue rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-tapsh-soft-green shadow-xl">
        <Check className="w-12 h-12 text-tapsh-soft-green" />
      </div>
      
      <h2 className="text-4xl font-bold text-tapsh-black mb-4">Your Hub is Ready!</h2>
      <p className="text-tapsh-charcoal font-medium text-lg mb-10">The permanent digital destination has been created successfully.</p>
      
      <div className="bg-tapsh-pale-blue p-8 rounded-3xl border border-tapsh-charcoal/30 mb-10 shadow-inner">
        <p className="text-sm font-bold text-tapsh-charcoal uppercase tracking-wider mb-4">Permanent Hub URL</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white px-6 py-4 rounded-xl border border-tapsh-charcoal/20 text-tapsh-black font-bold text-lg overflow-x-auto whitespace-nowrap shadow-sm text-left">
            tapsh.in/h/{createdHub?.slug}
          </code>
          <button className="p-4 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl hover:brightness-110 shadow-sm transition-all">
            <Copy className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <a href={`/h/${createdHub?.slug}`} target="_blank" className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-tapsh-charcoal/20 rounded-2xl hover:border-tapsh-soft-green hover:shadow-md transition-all text-tapsh-black font-bold group">
          <div className="w-12 h-12 bg-tapsh-pale-blue rounded-full flex items-center justify-center text-tapsh-soft-green group-hover:bg-tapsh-soft-green group-hover:text-tapsh-pale-blue transition-colors">
            <ExternalLink className="w-5 h-5" />
          </div>
          <span className="text-sm">View Live Hub</span>
        </a>
        <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-tapsh-charcoal/20 rounded-2xl hover:border-tapsh-soft-green hover:shadow-md transition-all text-tapsh-black font-bold group">
          <div className="w-12 h-12 bg-tapsh-pale-blue rounded-full flex items-center justify-center text-tapsh-soft-green group-hover:bg-tapsh-soft-green group-hover:text-tapsh-pale-blue transition-colors">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-sm">QR Code</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-tapsh-charcoal/20 rounded-2xl hover:border-tapsh-soft-green hover:shadow-md transition-all text-tapsh-black font-bold group">
          <div className="w-12 h-12 bg-tapsh-pale-blue rounded-full flex items-center justify-center text-tapsh-soft-green group-hover:bg-tapsh-soft-green group-hover:text-tapsh-pale-blue transition-colors">
            <Download className="w-5 h-5" />
          </div>
          <span className="text-sm">Download QR</span>
        </button>
        <Link href={`/admin/customers/${createdHub?.customerId}`} className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-tapsh-charcoal/20 rounded-2xl hover:border-tapsh-soft-green hover:shadow-md transition-all text-tapsh-black font-bold group">
          <div className="w-12 h-12 bg-tapsh-pale-blue rounded-full flex items-center justify-center text-tapsh-soft-green group-hover:bg-tapsh-soft-green group-hover:text-tapsh-pale-blue transition-colors">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm">Go to Customer</span>
        </Link>
      </div>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="max-w-5xl mx-auto pt-8">
        {renderSuccess()}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tapsh-black">Hub Setup</h1>
        <Link href="/admin/customers" className="text-tapsh-charcoal hover:text-tapsh-black font-bold text-sm">
          Cancel
        </Link>
      </div>

      {/* Wizard Header / Steps */}
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-[2rem] border border-tapsh-charcoal/20 shadow-sm overflow-x-auto whitespace-nowrap hide-scrollbar">
        {[
          { num: 1, label: "Business Type" },
          { num: 2, label: "Details" },
          { num: 3, label: "Links (Optional)" },
          { num: 4, label: "Preview & Save" }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-4 ${step >= s.num ? 'text-tapsh-black' : 'text-tapsh-charcoal/60'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 shadow-sm transition-colors ${
                step === s.num ? 'bg-tapsh-soft-green text-tapsh-pale-blue border-tapsh-soft-green' : 
                step > s.num ? 'bg-tapsh-black text-tapsh-pale-blue border-tapsh-black' : 'bg-white border-tapsh-charcoal/30'
              }`}>
                {step > s.num ? <Check className="w-6 h-6" /> : s.num}
              </div>
              <span className="font-bold hidden md:block tracking-wide">{s.label}</span>
            </div>
            {i < 3 && (
              <div className="flex-1 mx-6">
                <div className={`h-1.5 rounded-full transition-colors ${step > s.num ? 'bg-tapsh-black' : 'bg-tapsh-charcoal/10'}`}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-12 min-h-[600px] border border-tapsh-charcoal/20 shadow-xl relative pb-32">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation Footer */}
        {step < 4 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 border-t border-tapsh-charcoal/10 flex justify-between bg-white/80 backdrop-blur-md rounded-b-[2rem] sm:rounded-b-[2.5rem]">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                step === 1 ? 'bg-tapsh-pale-blue/30 text-tapsh-charcoal/30 cursor-not-allowed border border-transparent' : 'bg-white text-tapsh-black border-2 border-tapsh-charcoal/30 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/30'
              }`}
            >
              Back
            </button>
            <button 
              onClick={nextStep}
              disabled={(step === 1 && !data.businessType) || (step === 2 && !data.businessName)}
              className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md ${
                ((step === 1 && !data.businessType) || (step === 2 && !data.businessName))
                  ? 'bg-tapsh-pale-blue text-tapsh-charcoal cursor-not-allowed border border-transparent' 
                  : 'bg-tapsh-soft-green text-tapsh-pale-blue hover:brightness-110'
              }`}
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {step === 4 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 border-t border-tapsh-charcoal/10 flex justify-between bg-white/80 backdrop-blur-md rounded-b-[2rem] sm:rounded-b-[2.5rem]">
            <button 
              onClick={prevStep}
              className="px-8 py-4 rounded-2xl font-bold bg-white text-tapsh-black border-2 border-tapsh-charcoal/30 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/30 transition-all shadow-sm"
            >
              Back
            </button>
            <button 
              onClick={handleSaveAndCreate}
              className="px-12 py-4 rounded-2xl font-bold text-tapsh-pale-blue bg-tapsh-black hover:bg-tapsh-black transition-all shadow-xl hover:-translate-y-1"
            >
              Save & Create Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon Components for Accordion
const StarIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const CameraIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PhoneIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const GlobeIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
const WifiIcon = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
const LinkIcon2 = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
