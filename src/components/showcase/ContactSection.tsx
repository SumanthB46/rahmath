import { useState } from "react";
import { ChevronDown, CheckCircle2, Loader2, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import contactStudioImg from "@/assets/contact_studio.jpg";

export interface ContactSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
  };
}

export function ContactSection({ content }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const title = content?.title || "Get in Touch";
  const badge = content?.badge || "ARCHITECTURAL INQUIRIES";
  const subtitle =
    content?.subtitle ||
    "Consult with our architectural specialists for sample requests, customized slab cuts, and site quotes.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please provide your name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).then((r) => r.json());

      if (res.success) {
        setSubmitted(true);
        toast.success("Inquiry Received", {
          description: "Our material specialists will review your requirements and respond shortly.",
        });
      } else {
        throw new Error(res.message || "Failed to submit message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-5 sm:py-7 px-4 sm:px-6 bg-[#FAF7F2] text-[#2C2523] relative z-10 overflow-hidden border-t border-[#E7E2DA] font-sans">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">

        {/* Title Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-[10.5px] font-bold tracking-[0.24em] text-amber-800 uppercase font-mono block">
            {badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#4A4036] font-normal tracking-normal">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed max-w-md mx-auto font-normal">
            {subtitle}
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* Column 1: Inquiries Form Card */}
          <div className="md:col-span-7 bg-white border border-[#E7E2DA] p-6 sm:p-8 space-y-5 shadow-xs rounded-2xl">
            <div className="border-b border-[#F0ECE6] pb-3 mb-2">
              <h3 className="text-xl font-serif text-[#4A4036] font-normal">
                Project Consultation &amp; Inquiry
              </h3>
            </div>

            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-serif text-[#4A4036]">Message Received</h4>
                <p className="text-xs text-[#7A7067] max-w-xs mx-auto leading-relaxed">
                  Thank you for reaching out. A Mubarak material consultant will get in touch with you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", projectType: "", message: "" });
                  }}
                  className="mt-2 text-[11px] uppercase tracking-wider text-amber-900 font-bold underline hover:opacity-75 cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="sec-inq-name" className="block text-[11px] text-[#7A7067] font-semibold uppercase">
                      Full Name *
                    </label>
                    <input
                      id="sec-inq-name"
                      type="text"
                      required
                      placeholder="e.g. Ar. Vikram Seth"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-amber-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="sec-inq-phone" className="block text-[11px] text-[#7A7067] font-semibold uppercase">
                      Mobile Number
                    </label>
                    <input
                      id="sec-inq-phone"
                      type="tel"
                      placeholder="+91 98450 XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-amber-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="sec-inq-email" className="block text-[11px] text-[#7A7067] font-semibold uppercase">
                    Email Address *
                  </label>
                  <input
                    id="sec-inq-email"
                    type="email"
                    required
                    placeholder="vikram@studioarchitecture.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-amber-800 focus:outline-none transition-colors"
                  />
                </div>

                {/* Project Type */}
                <div className="space-y-1">
                  <label htmlFor="sec-inq-project" className="block text-[11px] text-[#7A7067] font-semibold uppercase">
                    Project Type
                  </label>
                  <div className="relative">
                    <select
                      id="sec-inq-project"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full text-xs text-[#2C2523] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-amber-800 focus:outline-none transition-colors appearance-none cursor-pointer pr-6"
                    >
                      <option value="" disabled className="text-[#A89F95]">
                        Select project scale / application
                      </option>
                      <option value="Residential Villa">Residential Villa / Apartment</option>
                      <option value="Commercial Project">Commercial / Corporate Office</option>
                      <option value="Hospitality & Resort">Hospitality, Hotel &amp; Resort</option>
                      <option value="Grand Format Slabs">Grand Format 120x240 Slabs</option>
                      <option value="Bespoke Sinks & Basins">Bespoke Sinks &amp; Monolith Basins</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A89F95] pointer-events-none" />
                  </div>
                </div>

                {/* Message Details */}
                <div className="space-y-1">
                  <label htmlFor="sec-inq-msg" className="block text-[11px] text-[#7A7067] font-semibold uppercase">
                    Message / Material Specifications
                  </label>
                  <textarea
                    id="sec-inq-msg"
                    rows={3}
                    placeholder="Specify surface dimensions, quantities in sq.ft, or finish preferences..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-amber-800 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Send Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="h-3.5 w-3.5 text-amber-300" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Column 2: Direct Contact & Showroom Connect */}
          <div className="md:col-span-5 space-y-6">
            {/* Direct & Connect Card */}
            <div className="bg-white border border-[#E7E2DA] p-6 sm:p-7 space-y-5 shadow-xs rounded-2xl">
              <div>
                <div className="border-b border-[#F0ECE6] pb-3 mb-4">
                  <h3 className="text-xl font-serif text-[#4A4036] font-normal">
                    Direct Contacts
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-2.5">
                    <span className="text-[11px] text-[#7A7067] uppercase font-semibold">General Inquiries</span>
                    <a href="mailto:info@mubarakceramics.com" className="text-stone-900 font-medium hover:text-amber-800 transition-colors">
                      info@mubarakceramics.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-2.5">
                    <span className="text-[11px] text-[#7A7067] uppercase font-semibold">Architect Support</span>
                    <a href="mailto:contact@mubarakceramics.com" className="text-stone-900 font-medium hover:text-amber-800 transition-colors">
                      contact@mubarakceramics.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-2.5">
                    <span className="text-[11px] text-[#7A7067] uppercase font-semibold">Showroom Desk</span>
                    <a href="tel:+919845012345" className="text-stone-900 font-medium hover:text-amber-800 transition-colors font-mono">
                      +91 98450 12345
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0ECE6] space-y-2.5">
                <h4 className="text-base font-serif text-[#4A4036] font-normal">
                  Connect &amp; Social
                </h4>
                <div className="flex items-center gap-5 text-xs text-stone-700 font-medium">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-800 transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://wa.me/919845012345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-800 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <Link
                    to="/catalog"
                    className="hover:text-amber-800 transition-colors"
                  >
                    PDF Catalogues
                  </Link>
                </div>
              </div>
            </div>

            {/* Studio Interior Photo */}
            <div className="border border-[#E7E2DA] overflow-hidden bg-[#EDE8E1] shadow-xs rounded-2xl">
              <img
                src={contactStudioImg}
                alt="Mubarak Ceramic Studio Experience"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
