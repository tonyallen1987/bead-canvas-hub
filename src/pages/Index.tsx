import { Link, useNavigate } from "react-router-dom";
import { Camera, Wand2, Download, Compass, Calculator, ArrowRight, Upload, ImagePlus } from "lucide-react";
import { useRef, useCallback } from "react";
import BeadDecoration from "@/components/BeadDecoration";
import PageMeta from "@/components/PageMeta";

const features = [
  {
    icon: ImagePlus,
    title: "Upload Any Photo → Instant Bead Pattern",
    desc: "Upload a photo of anything — your pet, a game character, a logo — and Perlerly automatically converts it into a pixel art Perler bead pattern in seconds. Choose your grid size and download the result for free.",
    to: "/designer",
    color: "bg-bead-pink",
    cta: "Try it now →",
    prominent: true,
  },
  {
    icon: Compass,
    title: "Explore Patterns",
    desc: "Browse hundreds of free community patterns by category, difficulty, and popularity",
    to: "/explore",
    color: "bg-bead-sky",
  },
  {
    icon: Calculator,
    title: "Bead Counter",
    desc: "Estimate the colors and quantities you need before you start",
    to: "/counter",
    color: "bg-bead-lemon",
  },
];

const steps = [
  { icon: Camera, label: "Upload any photo", detail: "PNG, JPG, or WebP" },
  { icon: Wand2, label: "Auto-converts to pixel art", detail: "Matched to official Perler colors" },
  { icon: Download, label: "Download your bead pattern", detail: "Free PNG with grid overlay" },
];

export default function Index() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        navigate("/designer", { state: { file } });
      }
    },
    [navigate]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) navigate("/designer", { state: { file } });
    },
    [navigate]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <PageMeta
        title="Perlerly – Upload Any Photo → Perler Bead Pattern | Free Online Converter"
        description="Upload any photo and instantly convert it into a pixel art Perler bead pattern. Free online tool with official color matching, grid sizes, and bead counts. Join the Perlerly community."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="container relative py-16 md:py-28 flex flex-col items-center text-center gap-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {[
              "", "", "bg-bead-pink", "bg-bead-pink", "bg-bead-pink", "", "",
              "", "bg-bead-pink", "bg-bead-coral", "bg-bead-coral", "bg-bead-coral", "bg-bead-pink", "",
              "bg-bead-sky", "bg-bead-coral", "bg-bead-lemon", "bg-bead-coral", "bg-bead-lemon", "bg-bead-coral", "bg-bead-sky",
              "bg-bead-sky", "bg-bead-coral", "bg-bead-coral", "bg-bead-coral", "bg-bead-coral", "bg-bead-coral", "bg-bead-sky",
              "", "bg-bead-mint", "bg-bead-coral", "bg-bead-coral", "bg-bead-coral", "bg-bead-mint", "",
              "", "", "bg-bead-mint", "bg-bead-coral", "bg-bead-mint", "", "",
              "", "", "", "bg-bead-sage", "", "", "",
            ].map((c, i) => (
              <span
                key={i}
                className={`w-5 h-5 md:w-7 md:h-7 rounded-sm ${c || "bg-transparent"} ${c ? "bead-dot animate-bead-pop" : ""}`}
                style={c ? { animationDelay: `${i * 30}ms` } : undefined}
              />
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Turn Any Photo Into a
            <br />
            <span className="text-primary">Perler Bead Pattern</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            Upload a photo and Perlerly instantly converts it into a pixel art bead pattern with exact color matching to the official Perler palette. Free, fast, and no signup required.
          </p>

          {/* Upload drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="w-full max-w-md mt-2 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-bead-pink/50 bg-bead-pink/5 rounded-2xl p-8 cursor-pointer hover:bg-bead-pink/10 hover:border-bead-pink transition-colors"
          >
            <Upload size={36} className="text-bead-pink" />
            <span className="font-bold text-foreground">Drop any image here to convert it into a bead pattern</span>
            <span className="text-xs text-muted-foreground">Supports PNG, JPG, WebP</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Link
            to="/explore"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            or browse the pattern library →
          </Link>

          <BeadDecoration count={12} className="mt-2 justify-center" />
        </div>
      </section>

      {/* 3-step flow */}
      <section className="container py-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-center mb-10">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-bead-pink/10 flex items-center justify-center">
                  <step.icon size={28} className="text-bead-pink" />
                </div>
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-base">{step.label}</h3>
              <p className="text-muted-foreground text-sm">{step.detail}</p>
              {i < steps.length - 1 && (
                <ArrowRight size={20} className="hidden sm:block absolute text-muted-foreground/30" style={{ right: "-1.5rem", top: "2rem" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="container py-16 border-t">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className={`group relative bg-card rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                f.prominent ? "sm:col-span-2 lg:col-span-1 ring-2 ring-bead-pink/30" : ""
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={22} className="text-foreground/80" />
              </div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
              {f.cta && (
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-bead-pink">
                  {f.cta}
                </span>
              )}
              <ArrowRight
                size={16}
                className="absolute top-6 right-6 text-muted-foreground/0 group-hover:text-muted-foreground transition-all"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* What is Perlerly? */}
      <section className="container py-16 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">What is Perlerly?</h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Perlerly is a free online Perler bead pattern maker and community. Upload any PNG image and our designer automatically converts it into a pixel art Perler bead pattern with exact bead counts by color. Browse hundreds of free patterns organized by difficulty and category, or create your own.
          </p>
        </div>
      </section>

      {/* Free Tools */}
      <section className="container py-16 border-t">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10">Free Tools for Perler Bead Artists</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-2">Photo to Bead Pattern Converter</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Upload any image and convert it into a pixel art Perler bead pattern instantly. Choose your grid size (16×16, 29×29, 32×32) and get an automatic bead count by color.</p>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-2">Explore Free Patterns</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Browse our library of free Perler bead patterns sorted by category: Animals, Food, Games, Nature, Sports, Holidays, Letters and Abstract. Filter by difficulty and sort by newest or most popular.</p>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-2">Bead Counter</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Count your Perler beads by color before starting a project. Never run short mid-pattern again.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-8">Frequently Asked Questions</h2>
          <div className="bg-card rounded-2xl border px-6">
            <div className="border-b border-border/60">
              <h3 className="font-semibold text-foreground py-5">Is Perlerly free?</h3>
              <p className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">Yes, Perlerly is completely free to use. Create an account to save and share your patterns with the community.</p>
            </div>
            <div className="border-b border-border/60">
              <h3 className="font-semibold text-foreground py-5">What image formats does the pattern designer support?</h3>
              <p className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">The designer supports PNG, JPG, and WebP image uploads. Upload any photo and it will be automatically converted into a Perler bead pattern.</p>
            </div>
            <div className="border-b border-border/60">
              <h3 className="font-semibold text-foreground py-5">What grid sizes are available?</h3>
              <p className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">The designer supports 16×16, 29×29 (standard pegboard size), 32×32, and larger custom grid sizes.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground py-5">Can I share my patterns with others?</h3>
              <p className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">Yes. Once you create a pattern you can publish it to the Explore page where other Perler bead enthusiasts can discover and use it.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">perlerly.com</span>
          <span>© 2026 Perlerly. Made for bead lovers.</span>
        </div>
      </footer>
    </div>
  );
}
