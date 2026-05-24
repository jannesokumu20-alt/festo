import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_CONTENT, loadContent, type SiteContent, submitBooking } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mileyn Events Services Limited — Premium Event Planning in Nairobi, Kenya" },
      { name: "description", content: "From intimate weddings to grand corporate events. Full planning, design and on-site management in Nairobi, Kenya." },
      { property: "og:title", content: "Mileyn Events — You Dream It. We Build It." },
      { property: "og:description", content: "Premium event planning, design and coordination. 150+ events delivered." },
    ],
  }),
  component: Home,
});

function Home() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ name: "", phone: "", eventType: "", guestCount: "", budget: "", date: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const bookingRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContent().then(setContent).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your name");
    if (!form.phone.trim()) return setError("Please enter your phone number");
    if (!form.eventType) return setError("Please select an event type");
    if (!form.guestCount) return setError("Please select guest count");
    if (!form.budget) return setError("Please select your budget");
    
    setError("");
    setSubmitting(true);
    
    try {
      // Submit booking with email and WhatsApp
      await submitBooking(
        {
          name: form.name,
          phone: form.phone,
          eventType: form.eventType,
          guestCount: form.guestCount,
          budget: form.budget,
          date: form.date,
        },
        content.social.email,
        content.social.whatsapp
      );
      
      setSubmitting(false);
      setSubmitted(true);
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", phone: "", eventType: "", guestCount: "", budget: "", date: "" });
      }, 5000);
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || "Failed to submit. Please try again or contact directly.");
    }
  };

  const filteredGallery = filter === "all" ? content.gallery : content.gallery.filter((g) => g.cat === filter);
  const allCats = Array.from(new Set(content.gallery.map((g) => g.cat)));
  const cats = [{ v: "all", l: "All Events" }, ...allCats.map((c) => ({ v: c, l: c.charAt(0).toUpperCase() + c.slice(1) }))];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img src={content.brand.logo} alt={`${content.brand.name} logo`} className="h-11 w-11 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="font-display text-[18px] font-semibold text-primary tracking-wide" style={{ fontFamily: "var(--font-display)" }}>{content.brand.name}</div>
              <div className="text-[10px] tracking-[0.2em] text-secondary uppercase">{content.brand.subtitle}</div>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {["Home", "Services", "Gallery", "Stories", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[13px] font-medium tracking-wide hover:text-primary transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => scrollTo(bookingRef)} className="hidden md:inline-flex px-5 py-2.5 rounded-full text-[13px] font-medium text-primary-foreground transition-transform hover:scale-[...]
              Get In Touch
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
              <span className={`block h-0.5 w-6 bg-ink transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-ink transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-24 px-8 md:hidden">
          <div className="flex flex-col gap-6">
            {["Home", "Services", "Gallery", "Stories", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="text-3xl font-display hover:text-primary" style={{ fontFamily: "var(--font-display)" }}>{l}</a>
            ))}
            <button onClick={() => scrollTo(bookingRef)} className="mt-4 px-6 py-3 rounded-full text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>Get Free Quote</button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border text-[12px] tracking-wide text-ink-soft mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {content.hero.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-display leading-[1.05] mb-6" style={{ fontFamily: "var(--font-display)" }}>
              {content.hero.titleLine1}<br />
              <span className="italic" style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{content.hero.titleLine2}</span><br />
              {content.hero.titleLine3}
            </h1>
            <p className="text-lg text-ink-soft max-w-xl mb-10 leading-relaxed">{content.hero.description}</p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button onClick={() => scrollTo(bookingRef)} className="px-7 py-4 rounded-full text-primary-foreground font-medium tracking-wide transition-transform hover:scale-105" style={{ backg[...]
                {content.hero.ctaPrimary}
              </button>
              <button onClick={() => scrollTo(galleryRef)} className="px-7 py-4 rounded-full border-2 border-ink/15 font-medium hover:border-primary hover:text-primary transition-colors">
                {content.hero.ctaSecondary}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-ink-soft">
              <div>{content.hero.badge1}</div>
              <div className="h-4 w-px bg-border" />
              <div>{content.hero.badge2}</div>
            </div>
          </div>

          <div className="relative h-[500px] hidden md:block">
            <div className="absolute inset-0 rounded-[40px] overflow-hidden" style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}>
              <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent 50%)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={content.hero.heroImage} alt="Mileyn Events" className="w-48 h-48 rounded-full bg-white/95 p-4 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {content.stats.map((s, i) => (
            <div key={i} className="text-center md:text-left md:border-l md:border-border md:pl-6 first:border-l-0 first:pl-0">
              <div className="text-5xl md:text-6xl font-display font-bold text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>{s.n}</div>
              <div className="font-medium">{s.l}</div>
              <div className="text-sm text-ink-soft mt-1">{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section id="services" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-secondary text-[12px] tracking-[0.3em] uppercase mb-4">Our Services</div>
            <h2 className="text-4xl md:text-6xl font-display" style={{ fontFamily: "var(--font-display)" }}>{content.servicesHeading}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.packages.map((p, idx) => (
              <div key={idx} className={`relative rounded-3xl p-8 border transition-transform hover:-translate-y-1 ${p.featured ? "bg-card border-primary/30" : "bg-card border-border"}`} style={p[...]
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold text-primary-foreground tracking-wide" style={{ background: "var(--gra[...]
                    ⭐ {p.badge}
                  </div>
                )}
                <h3 className="text-2xl font-display font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>{p.name}</h3>
                <p className="text-sm text-ink-soft mb-6 leading-relaxed">{p.tagline}</p>
                <div className="mb-6 pb-6 border-b">
                  <div className="text-3xl font-display font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>{p.price}</div>
                  <div className="text-xs text-ink-soft mt-1">Starting price · Final quote after consultation</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm"><span className="text-primary mt-0.5">✓</span> {f}</li>
                  ))}
                </ul>
                <button onClick={() => scrollTo(bookingRef)} className={`w-full py-3.5 rounded-full font-medium text-sm transition-all ${p.featured ? "text-primary-foreground hover:scale-105" : "[...]
                  Book This Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" ref={galleryRef} className="py-24 md:py-32 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-secondary text-[12px] tracking-[0.3em] uppercase mb-4">Our Portfolio</div>
            <h2 className="text-4xl md:text-6xl font-display" style={{ fontFamily: "var(--font-display)" }}>{content.galleryHeading}</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {cats.map((c) => (
              <button key={c.v} onClick={() => setFilter(c.v)} className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition-all ${filter === c.v ? "text-primary-foreground" : "bg-trans[...]
                {c.l}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((g, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer bg-muted">
                {g.image ? (
                  <img src={g.image} alt={g.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, oklch(0.6 0.2 340), oklch(0.4 0.15 200))` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-80 mb-1">{g.cat}</div>
                  <div className="font-display text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>{g.title}</div>
                  <div className="text-sm opacity-90">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-secondary text-[12px] tracking-[0.3em] uppercase mb-4">Client Stories</div>
            <h2 className="text-4xl md:text-6xl font-display" style={{ fontFamily: "var(--font-display)" }}>{content.testimonialsHeading}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.testimonials.map((t, i) => (
              <div key={i} className="bg-cream rounded-3xl p-8 border">
                <div className="text-primary mb-4">★★★★★</div>
                <p className="text-ink-soft leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3 pt-6 border-t">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-primary-foreground font-semibold" style={{ background: "var(--gradient-brand)" }}>{t.initial}</div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-ink-soft">{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="contact" ref={bookingRef} className="py-24 md:py-32 relative overflow-hidden" style={{ background: "oklch(0.15 0.02 320)" }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at top, oklch(0.55 0.22 350 / 0.4), transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-12 text-white">
            <div className="text-secondary text-[12px] tracking-[0.3em] uppercase mb-4">Get Started Today</div>
            <h2 className="text-4xl md:text-6xl font-display mb-4" style={{ fontFamily: "var(--font-display)" }}>{content.booking.heading}</h2>
            <p className="text-white/60">{content.booking.subheading}</p>
          </div>

          {submitted ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white backdrop-blur">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-3xl font-display mb-3" style={{ fontFamily: "var(--font-display)" }}>Thank you, {form.name.split(" ")[0]}!</h3>
              <p className="text-white/70">We've received your request. A planner will reach out via WhatsApp and Email within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur space-y-5">
              {error && <div className="bg-destructive/20 border border-destructive/40 text-white px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Your Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Amara Johnson" />
                <Field label="Phone / WhatsApp *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+254 700 000 000" type="tel" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Select label="Event Type *" value={form.eventType} onChange={(v) => setForm({ ...form, eventType: v })} options={["Wedding", "Corporate Event", "Birthday Celebration", "Social Ev[...]
                <Select label="Guest Count *" value={form.guestCount} onChange={(v) => setForm({ ...form, guestCount: v })} options={["Under 50", "50 – 100", "100 – 200", "200 – 500", "500+[...]
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Select label="Budget *" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} options={["Under KES 200,000", "KES 200,000 – 550,000", "KES 550,000 – 1,200,000[...]
                <Field label="Preferred Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-4 rounded-full text-primary-foreground font-medium tracking-wide transition-transform hover:scale-[1.02] disabled:op[...]
                {submitting ? "Submitting..." : "Check Availability — Free →"}
              </button>
              <p className="text-center text-xs text-white/40">Or call us directly · {content.booking.phoneDisplay}</p>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-background border-t">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={content.brand.logo} alt={content.brand.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="font-display font-semibold text-primary" style={{ fontFamily: "var(--font-display)" }}>{content.brand.name}</div>
              <div className="text-[10px] tracking-[0.2em] text-secondary uppercase">{content.brand.subtitle}</div>
            </div>
          </div>
          <div className="text-sm text-ink-soft">© {new Date().getFullYear()} {content.footer.copyright}</div>
        </div>
      </footer>

      {/* FLOATING SOCIAL */}
      <FloatingSocial social={content.social} />

      {/* HIDDEN ADMIN TRIGGER */}
      <AdminTrigger />
    </div>
  );
}

function FloatingSocial({ social }: { social: SiteContent["social"] }) {
  const items = [
    social.whatsapp && {
      href: `https://wa.me/${social.whatsapp.replace(/[^\d]/g, "")}`,
      label: "WhatsApp",
      bg: "#25D366",
      svg: (
        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 [...]
      ),
    },
    social.email && {
      href: `mailto:${social.email}`,
      label: "Email",
      bg: "linear-gradient(135deg, oklch(0.55 0.22 350), oklch(0.65 0.18 340))",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1[...]
      ),
    },
    social.instagram && {
      href: social.instagram,
      label: "Instagram",
      bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"[...]
      ),
    },
  ].filter(Boolean) as { href: string; label: string; bg: string; svg: React.ReactNode }[];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {items.map((it) => (
        <a key={it.label} href={it.href} target="_blank" rel="noopener noreferrer" aria-label={it.label} title={it.label}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
          style={{ background: it.bg }}>
          {it.svg}
        </a>
      ))}
    </div>
  );
}

function AdminTrigger() {
  const navigate = useNavigate();
  const lastTap = useRef(0);
  const onActivate = () => {
    const now = Date.now();
    if (now - lastTap.current < 3000 && lastTap.current !== 0) {
      lastTap.current = 0;
      const dest = typeof window !== "undefined" && sessionStorage.getItem("mileyn_admin") === "1" ? "/admin" : "/admin-login";
      navigate({ to: dest });
    } else {
      lastTap.current = now;
    }
  };
  return (
    <button
      onClick={onActivate}
      onDoubleClick={onActivate}
      aria-label=""
      tabIndex={-1}
      className="fixed bottom-4 left-4 z-40 w-6 h-6 bg-black/90 hover:bg-black active:scale-90 transition-transform cursor-default opacity-70 hover:opacity-100"
      style={{ borderRadius: 2 }}
    />
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-2 uppercase tracking-wider">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg px-4 py-3.5 text-sm text-white bg-white/5 border border-white/10 outline-none transition-colors focus:border-primary placeholder:text-white/30" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-2 uppercase tracking-wider">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-4 py-3.5 text-sm text-white bg-white/5 border border-white/10 outline-none transition-colors focus:border-primary appearance-none">
        <option value="" className="bg-ink">Select...</option>
        {options.map((o) => <option key={o} value={o} className="bg-ink">{o}</option>)}
      </select>
    </label>
  );
}
