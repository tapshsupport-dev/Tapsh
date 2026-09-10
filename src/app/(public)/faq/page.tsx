import FAQAccordion from "@/components/FAQAccordion";

export const metadata = {
  title: "How It Works - TAPSH",
  description: "Frequently asked questions and how TAPSH NFC technology works.",
};

export default function HowItWorksPage() {
  return (
    <div className="pt-20">
      <FAQAccordion />
    </div>
  );
}
