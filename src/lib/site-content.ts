import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/mileyn-logo.jpeg";

export type Pkg = { name: string; tagline: string; price: string; features: string[]; featured: boolean; badge?: string };
export type GalleryItem = { cat: string; title: string; desc: string; image: string };
export type Testimonial = { text: string; name: string; event: string; initial: string };
export type Stat = { n: string; l: string; s: string };

export type SiteContent = {
  brand: { name: string; subtitle: string; logo: string };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badge1: string;
    badge2: string;
    heroImage: string;
  };
  stats: Stat[];
  servicesHeading: string;
  packages: Pkg[];
  galleryHeading: string;
  gallery: GalleryItem[];
  testimonialsHeading: string;
  testimonials: Testimonial[];
  booking: { heading: string; subheading: string; phoneDisplay: string };
  social: { whatsapp: string; email: string; instagram: string };
  footer: { copyright: string };
};

export const DEFAULT_CONTENT: SiteContent = {
  brand: { name: "MILEYN EVENTS", subtitle: "Services Limited", logo },
  hero: {
    badge: "Premium Event Planning · Nairobi, Kenya",
    titleLine1: "You Dream It.",
    titleLine2: "We Build It.",
    titleLine3: "Flawlessly.",
    description:
      "From intimate weddings to grand corporate events — full planning, design, and on-site management. Every detail, personally attended to.",
    ctaPrimary: "Get Free Quote →",
    ctaSecondary: "See Our Work",
    badge1: "🏆 150+ Events Delivered",
    badge2: "★★★★★ 5.0 · 80+ reviews",
    heroImage: logo,
  },
  stats: [
    { n: "150+", l: "Events Completed", s: "Since 2017" },
    { n: "98%", l: "Client Satisfaction", s: "Verified reviews" },
    { n: "10+", l: "Years Experience", s: "Team expertise" },
    { n: "50+", l: "Trusted Partners", s: "Vendors & venues" },
  ],
  servicesHeading: "Choose Your Perfect Planning Package",
  packages: [
    { name: "The Essential", tagline: "For couples who've done the planning and need expert execution on the day.", price: "KES 200k – 400k", features: ["Day-of coordination (8 hours)", "Vendor confirmation & timeline", "Ceremony & reception management", "1 dedicated planner on-site", "Emergency kit & backup plans"], featured: false },
    { name: "The Signature", tagline: "Our bestseller. Partial planning + full design for couples who want involvement without stress.", price: "KES 550k – 1.1M", features: ["Everything in Essential", "3-month planning support", "Full décor & floral design", "Vendor sourcing & negotiation", "Budget management", "2 planning sessions / month"], featured: true, badge: "Most Popular" },
    { name: "The Ultimate", tagline: "For couples who want to enjoy every moment while we handle absolutely everything.", price: "KES 1.2M+", features: ["Everything in Signature", "Full-service planning", "Venue sourcing & tours", "Catering coordination", "Guest accommodation", "Post-event wrap-up & gifts"], featured: false },
  ],
  galleryHeading: "See How We Bring Visions to Life",
  gallery: [
    { cat: "wedding", title: "Grand Wedding Reception", desc: "300 guests · Westlands", image: "" },
    { cat: "corporate", title: "Annual Corporate Gala", desc: "500 guests · Sarova Stanley", image: "" },
    { cat: "social", title: "50th Birthday", desc: "80 guests · Karen", image: "" },
    { cat: "wedding", title: "Garden Wedding Ceremony", desc: "200 guests · Mombasa", image: "" },
    { cat: "corporate", title: "Product Launch", desc: "400 guests · KICC", image: "" },
    { cat: "destination", title: "Destination Wedding", desc: "150 guests · Diani Beach", image: "" },
  ],
  testimonialsHeading: "Real couples. Real memories.",
  testimonials: [
    { text: "Mileyn didn't just plan our wedding — they understood our vision and created something even more beautiful than we imagined.", name: "Amara & Daniel", event: "Wedding · Nairobi 2024", initial: "A" },
    { text: "Our corporate launch was handled with such professionalism. 400 guests, zero hiccups. Calm, organized, creative.", name: "Grace Wanjiru", event: "Corporate Launch · Nairobi 2024", initial: "G" },
    { text: "I was stressed about planning from abroad but Mileyn made it effortless. The day exceeded every expectation.", name: "Fatima & James", event: "Destination Wedding · Diani 2023", initial: "F" },
  ],
  booking: {
    heading: "Check Availability — It's Free",
    subheading: "No credit card. No obligation. A planner reaches out within 2 hours.",
    phoneDisplay: "+254 700 MILEYN",
  },
  social: {
    whatsapp: "254700000000",
    email: "hello@mileynevents.co.ke",
    instagram: "https://instagram.com/mileynevents",
  },
  footer: {
    copyright: "Mileyn Events Services Limited. All rights reserved.",
  },
};

function merge<T>(base: T, partial: any): T {
  if (Array.isArray(base)) return (Array.isArray(partial) ? partial : base) as T;
  if (base && typeof base === "object") {
    const out: any = { ...base };
    if (partial && typeof partial === "object") {
      for (const k of Object.keys(partial)) {
        out[k] = k in (base as any) ? merge((base as any)[k], partial[k]) : partial[k];
      }
    }
    return out;
  }
  return (partial ?? base) as T;
}

export async function loadContent(): Promise<SiteContent> {
  const { data, error } = await supabase.from("site_content").select("data").eq("key", "main").maybeSingle();
  if (error || !data) return DEFAULT_CONTENT;
  return merge(DEFAULT_CONTENT, data.data ?? {});
}

export async function saveContent(content: SiteContent): Promise<void> {
  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "main", data: content as any, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImageByUrl(url: string): Promise<void> {
  const match = url.match(/site-images\/(.+)$/);
  if (!match) return;
  await supabase.storage.from("site-images").remove([match[1]]);
}
