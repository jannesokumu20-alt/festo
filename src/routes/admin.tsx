import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CONTENT,
  loadContent,
  saveContent,
  uploadImage,
  deleteImageByUrl,
  type SiteContent,
  type Pkg,
  type GalleryItem,
  type Testimonial,
  type Stat,
} from "@/lib/site-content";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard · Mileyn Events" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "brand" | "hero" | "stats" | "packages" | "gallery" | "testimonials" | "booking" | "social" | "footer";

function AdminPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("brand");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("mileyn_admin") !== "1") {
      navigate({ to: "/admin-login" });
      return;
    }
    loadContent().then(setContent).catch(() => setContent(DEFAULT_CONTENT));
  }, [navigate]);

  if (!content) return <div className="min-h-screen flex items-center justify-center text-ink-soft">Loading dashboard…</div>;

  const update = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => setContent({ ...content, [k]: v });

  const save = async () => {
    setSaving(true); setErr("");
    try {
      await saveContent(content);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const logout = () => { sessionStorage.removeItem("mileyn_admin"); navigate({ to: "/" }); };

  const reset = () => {
    if (confirm("Reset ALL content to factory defaults? This will overwrite everything.")) setContent(DEFAULT_CONTENT);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "brand", label: "Brand" },
    { id: "hero", label: "Hero" },
    { id: "stats", label: "Stats" },
    { id: "packages", label: "Packages" },
    { id: "gallery", label: "Gallery" },
    { id: "testimonials", label: "Testimonials" },
    { id: "booking", label: "Booking" },
    { id: "social", label: "Social & Contact" },
    { id: "footer", label: "Footer" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="font-display text-xl font-semibold text-primary" style={{ fontFamily: "var(--font-display)" }}>Mileyn Admin</div>
            {savedAt && <span className="text-xs text-ink-soft">Saved {savedAt}</span>}
            {err && <span className="text-xs text-destructive">⚠ {err}</span>}
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="text-sm px-3 py-1.5 rounded-full border hover:border-primary hover:text-primary">View Site ↗</a>
            <button onClick={reset} className="text-sm px-3 py-1.5 rounded-full border hover:border-destructive hover:text-destructive">Reset</button>
            <button onClick={logout} className="text-sm px-3 py-1.5 rounded-full border hover:border-ink">Logout</button>
            <button onClick={save} disabled={saving} className="text-sm px-4 py-1.5 rounded-full text-primary-foreground font-medium disabled:opacity-60" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-ink-soft hover:text-primary"}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {tab === "brand" && <BrandEditor content={content} update={update} />}
        {tab === "hero" && <HeroEditor content={content} update={update} />}
        {tab === "stats" && <StatsEditor content={content} update={update} />}
        {tab === "packages" && <PackagesEditor content={content} update={update} />}
        {tab === "gallery" && <GalleryEditor content={content} update={update} />}
        {tab === "testimonials" && <TestimonialsEditor content={content} update={update} />}
        {tab === "booking" && <BookingEditor content={content} update={update} />}
        {tab === "social" && <SocialEditor content={content} update={update} />}
        {tab === "footer" && <FooterEditor content={content} update={update} />}

        <div className="pt-6 flex justify-end">
          <button onClick={save} disabled={saving} className="px-6 py-3 rounded-full text-primary-foreground font-medium disabled:opacity-60" style={{ background: "var(--gradient-brand)" }}>
            {saving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---------- shared bits ---------- */
type EditorProps = { content: SiteContent; update: <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => void };

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="bg-card border rounded-2xl p-5 sm:p-6">
      {title && <h2 className="font-display text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>}
      {children}
    </section>
  );
}

function Text({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink-soft mb-1.5">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full rounded-lg border px-3 py-2 bg-background outline-none focus:border-primary text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border px-3 py-2 bg-background outline-none focus:border-primary text-sm" />
      )}
    </label>
  );
}

function ImageUploader({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handle = async (file: File) => {
    setBusy(true); setError("");
    try {
      const oldUrl = value;
      const url = await uploadImage(file);
      onChange(url);
      if (oldUrl && oldUrl.includes("site-images/")) await deleteImageByUrl(oldUrl).catch(() => {});
    } catch (e: any) { setError(e?.message || "Upload failed"); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (value && value.includes("site-images/")) await deleteImageByUrl(value).catch(() => {});
    onChange("");
  };

  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-ink-soft mb-1.5">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-ink-soft">No image</span>}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="text-sm px-3 py-1.5 rounded-full border hover:border-primary hover:text-primary disabled:opacity-60">
            {busy ? "Uploading…" : value ? "Replace Image" : "Upload Image"}
          </button>
          {value && <button type="button" onClick={remove} className="text-xs text-destructive hover:underline text-left">Remove</button>}
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

/* ---------- per-section editors ---------- */
function BrandEditor({ content, update }: EditorProps) {
  return (
    <Card title="Brand">
      <div className="grid sm:grid-cols-2 gap-4">
        <Text label="Brand Name" value={content.brand.name} onChange={(v) => update("brand", { ...content.brand, name: v })} />
        <Text label="Subtitle" value={content.brand.subtitle} onChange={(v) => update("brand", { ...content.brand, subtitle: v })} />
        <div className="sm:col-span-2">
          <ImageUploader label="Logo" value={content.brand.logo} onChange={(v) => update("brand", { ...content.brand, logo: v || DEFAULT_CONTENT.brand.logo })} />
        </div>
      </div>
    </Card>
  );
}

function HeroEditor({ content, update }: EditorProps) {
  const h = content.hero;
  const set = (patch: Partial<typeof h>) => update("hero", { ...h, ...patch });
  return (
    <Card title="Hero Section">
      <div className="grid sm:grid-cols-2 gap-4">
        <Text label="Top Badge" value={h.badge} onChange={(v) => set({ badge: v })} />
        <Text label="CTA Primary" value={h.ctaPrimary} onChange={(v) => set({ ctaPrimary: v })} />
        <Text label="Headline — Line 1" value={h.titleLine1} onChange={(v) => set({ titleLine1: v })} />
        <Text label="Headline — Line 2 (italic)" value={h.titleLine2} onChange={(v) => set({ titleLine2: v })} />
        <Text label="Headline — Line 3" value={h.titleLine3} onChange={(v) => set({ titleLine3: v })} />
        <Text label="CTA Secondary" value={h.ctaSecondary} onChange={(v) => set({ ctaSecondary: v })} />
        <div className="sm:col-span-2"><Text label="Description" value={h.description} onChange={(v) => set({ description: v })} multiline /></div>
        <Text label="Trust Badge 1" value={h.badge1} onChange={(v) => set({ badge1: v })} />
        <Text label="Trust Badge 2" value={h.badge2} onChange={(v) => set({ badge2: v })} />
        <div className="sm:col-span-2">
          <ImageUploader label="Hero Image (right card)" value={h.heroImage} onChange={(v) => set({ heroImage: v || DEFAULT_CONTENT.hero.heroImage })} />
        </div>
      </div>
    </Card>
  );
}

function StatsEditor({ content, update }: EditorProps) {
  const set = (i: number, patch: Partial<Stat>) => {
    const next = content.stats.slice();
    next[i] = { ...next[i], ...patch };
    update("stats", next);
  };
  const add = () => update("stats", [...content.stats, { n: "0", l: "New stat", s: "subtitle" }]);
  const remove = (i: number) => update("stats", content.stats.filter((_, j) => j !== i));
  return (
    <Card title="Stats Strip">
      <div className="space-y-3">
        {content.stats.map((s, i) => (
          <div key={i} className="grid sm:grid-cols-[1fr_2fr_2fr_auto] gap-3 items-end border rounded-lg p-3">
            <Text label="Number" value={s.n} onChange={(v) => set(i, { n: v })} />
            <Text label="Label" value={s.l} onChange={(v) => set(i, { l: v })} />
            <Text label="Subtext" value={s.s} onChange={(v) => set(i, { s: v })} />
            <button onClick={() => remove(i)} className="text-xs text-destructive border border-destructive/30 rounded-full px-3 py-1.5 hover:bg-destructive/10">Delete</button>
          </div>
        ))}
        <button onClick={add} className="text-sm px-4 py-2 rounded-full border hover:border-primary hover:text-primary">+ Add Stat</button>
      </div>
    </Card>
  );
}

function PackagesEditor({ content, update }: EditorProps) {
  const set = (i: number, patch: Partial<Pkg>) => {
    const next = content.packages.slice(); next[i] = { ...next[i], ...patch }; update("packages", next);
  };
  const add = () => update("packages", [...content.packages, { name: "New Package", tagline: "", price: "KES 0", features: ["Feature 1"], featured: false }]);
  const remove = (i: number) => update("packages", content.packages.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <Card title="Section Heading">
        <Text label="Services Heading (use a comma or sentence break for two lines)" value={content.servicesHeading} onChange={(v) => update("servicesHeading", v)} />
      </Card>
      {content.packages.map((p, i) => (
        <Card key={i} title={`Package ${i + 1}`}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Name" value={p.name} onChange={(v) => set(i, { name: v })} />
            <Text label="Price" value={p.price} onChange={(v) => set(i, { price: v })} />
            <div className="sm:col-span-2"><Text label="Tagline" value={p.tagline} onChange={(v) => set(i, { tagline: v })} multiline /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.featured} onChange={(e) => set(i, { featured: e.target.checked })} />
              Featured (highlighted)
            </label>
            <Text label="Badge (e.g. Most Popular)" value={p.badge ?? ""} onChange={(v) => set(i, { badge: v || undefined })} />
            <div className="sm:col-span-2">
              <span className="block text-xs uppercase tracking-wider text-ink-soft mb-1.5">Features (one per line)</span>
              <textarea
                value={p.features.join("\n")}
                onChange={(e) => set(i, { features: e.target.value.split("\n").filter((x) => x.trim()) })}
                rows={6}
                className="w-full rounded-lg border px-3 py-2 bg-background outline-none focus:border-primary text-sm font-mono"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => remove(i)} className="text-xs text-destructive border border-destructive/30 rounded-full px-3 py-1.5 hover:bg-destructive/10">Delete Package</button>
          </div>
        </Card>
      ))}
      <button onClick={add} className="text-sm px-4 py-2 rounded-full border hover:border-primary hover:text-primary">+ Add Package</button>
    </div>
  );
}

function GalleryEditor({ content, update }: EditorProps) {
  const set = (i: number, patch: Partial<GalleryItem>) => {
    const next = content.gallery.slice(); next[i] = { ...next[i], ...patch }; update("gallery", next);
  };
  const add = () => update("gallery", [...content.gallery, { cat: "wedding", title: "New Event", desc: "Description", image: "" }]);
  const remove = async (i: number) => {
    const item = content.gallery[i];
    if (item.image) await deleteImageByUrl(item.image).catch(() => {});
    update("gallery", content.gallery.filter((_, j) => j !== i));
  };
  return (
    <div className="space-y-4">
      <Card title="Section Heading">
        <Text label="Gallery Heading" value={content.galleryHeading} onChange={(v) => update("galleryHeading", v)} />
      </Card>
      {content.gallery.map((g, i) => (
        <Card key={i} title={`Item ${i + 1}`}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Category (wedding, corporate, social, destination, …)" value={g.cat} onChange={(v) => set(i, { cat: v })} />
            <Text label="Title" value={g.title} onChange={(v) => set(i, { title: v })} />
            <div className="sm:col-span-2"><Text label="Description" value={g.desc} onChange={(v) => set(i, { desc: v })} /></div>
            <div className="sm:col-span-2"><ImageUploader label="Image" value={g.image} onChange={(v) => set(i, { image: v })} /></div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => remove(i)} className="text-xs text-destructive border border-destructive/30 rounded-full px-3 py-1.5 hover:bg-destructive/10">Delete Item</button>
          </div>
        </Card>
      ))}
      <button onClick={add} className="text-sm px-4 py-2 rounded-full border hover:border-primary hover:text-primary">+ Add Gallery Item</button>
    </div>
  );
}

function TestimonialsEditor({ content, update }: EditorProps) {
  const set = (i: number, patch: Partial<Testimonial>) => {
    const next = content.testimonials.slice(); next[i] = { ...next[i], ...patch }; update("testimonials", next);
  };
  const add = () => update("testimonials", [...content.testimonials, { text: "", name: "Client", event: "Event · Year", initial: "C" }]);
  const remove = (i: number) => update("testimonials", content.testimonials.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <Card title="Section Heading">
        <Text label="Testimonials Heading" value={content.testimonialsHeading} onChange={(v) => update("testimonialsHeading", v)} />
      </Card>
      {content.testimonials.map((t, i) => (
        <Card key={i} title={`Testimonial ${i + 1}`}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Text label="Quote" value={t.text} onChange={(v) => set(i, { text: v })} multiline /></div>
            <Text label="Name" value={t.name} onChange={(v) => set(i, { name: v })} />
            <Text label="Event" value={t.event} onChange={(v) => set(i, { event: v })} />
            <Text label="Initial (1 letter)" value={t.initial} onChange={(v) => set(i, { initial: v.slice(0, 1).toUpperCase() })} />
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => remove(i)} className="text-xs text-destructive border border-destructive/30 rounded-full px-3 py-1.5 hover:bg-destructive/10">Delete</button>
          </div>
        </Card>
      ))}
      <button onClick={add} className="text-sm px-4 py-2 rounded-full border hover:border-primary hover:text-primary">+ Add Testimonial</button>
    </div>
  );
}

function BookingEditor({ content, update }: EditorProps) {
  const b = content.booking;
  const set = (patch: Partial<typeof b>) => update("booking", { ...b, ...patch });
  return (
    <Card title="Booking Section">
      <div className="grid sm:grid-cols-2 gap-4">
        <Text label="Heading" value={b.heading} onChange={(v) => set({ heading: v })} />
        <Text label="Phone Display (under form)" value={b.phoneDisplay} onChange={(v) => set({ phoneDisplay: v })} />
        <div className="sm:col-span-2"><Text label="Subheading" value={b.subheading} onChange={(v) => set({ subheading: v })} multiline /></div>
      </div>
    </Card>
  );
}

function SocialEditor({ content, update }: EditorProps) {
  const s = content.social;
  const set = (patch: Partial<typeof s>) => update("social", { ...s, ...patch });
  return (
    <Card title="Social & Contact Icons">
      <p className="text-sm text-ink-soft mb-4">These power the floating WhatsApp, Email and Instagram buttons on the live site.</p>
      <div className="grid sm:grid-cols-1 gap-4">
        <Text label="WhatsApp Number (digits only, with country code, e.g. 254700000000)" value={s.whatsapp} onChange={(v) => set({ whatsapp: v.replace(/[^\d]/g, "") })} />
        <Text label="Email Address" value={s.email} onChange={(v) => set({ email: v })} />
        <Text label="Instagram URL (full link)" value={s.instagram} onChange={(v) => set({ instagram: v })} />
      </div>
    </Card>
  );
}

function FooterEditor({ content, update }: EditorProps) {
  return (
    <Card title="Footer">
      <Text label="Copyright text (year is added automatically)" value={content.footer.copyright} onChange={(v) => update("footer", { copyright: v })} />
    </Card>
  );
}
