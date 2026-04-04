import { Link } from "react-router-dom";
import { Compass, PenTool, Grid3X3, Calculator, ArrowRight, ChevronDown } from "lucide-react";
import BeadDecoration from "@/components/BeadDecoration";
import PageMeta from "@/components/PageMeta";
import { useState } from "react";

const features = [
  {
    icon: Compass,
    title: "Explore",
    desc: "Discover amazing Perler bead creations from the community",
    to: "/explore",
    color: "bg-bead-sky",
  },
  {
    icon: PenTool,
    title: "Pattern Designer",
    desc: "Draw your own bead patterns right in the browser",
    to: "/designer",
    color: "bg-bead-pink",
  },
  {
    icon: Grid3X3,
    title: "Pattern Library",
    desc: "Browse and download curated patterns by category",
    to: "/patterns",
    color: "bg-bead-mint",
  },
  {
    icon: Calculator,
    title: "Bead Counter",
    desc: "Estimate the colors and quantities you need",
    to: "/counter",
    color: "bg-bead-lemon",
  },
];

const featureDetails = [
  {
    title: "Pattern Designer",
    desc: "Upload an image and convert it into a pixel art Perler bead pattern instantly. Supports PNG format with automatic color mapping and grid sizing.",
  },
  {
    title: "Explore Community Patterns",
    desc: "Browse hundreds of free Perler bead patterns organized by difficulty (Easy, Medium, Hard), category, and bead count.",
  },
  {
    title: "Bead Counter",
    desc: "Count your beads by color before starting a project. Never run out mid-pattern again.",
  },
];

const faqs = [
  {
    q: "Is Perlerly free to use?",
    a: "Yes, Perlerly is completely free. Create an account to save and share your patterns.",
  },
  {
    q: "What image formats can I upload?",
    a: "Currently PNG images are supported. Upload any PNG and the designer will convert it into a Perler bead pattern automatically.",
  },
  {
    q: "What grid sizes are supported?",
    a: "The designer supports common grid sizes including 16×16, 32×32, and larger custom sizes.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-semibold text-foreground">{q}</span>
        <ChevronDown
          size={18}
          className={`text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">
          {a}
        </p>
      )}
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <PageMeta
        title="Perlerly – Perler Bead Pattern Designer & Community"
        description="Design, share, and explore Perler bead patterns. Upload any image and convert it into a pixel art bead pattern instantly. Join the Perlerly community."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="container relative py-20 md:py-32 flex flex-col items-center text-center gap-6">
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
            Your Perler Bead Journey
            <br />
            <span className="text-primary">Starts Here</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            The free Perler bead pattern maker and community. Convert any image into a pixel art bead pattern, browse free patterns by difficulty and category, and connect with fellow Perler bead artists.
          </p>

          <div className="flex gap-3 mt-2">
            <Link
              to="/designer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Start Creating <ArrowRight size={16} />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted transition-colors"
            >
              Browse Works
            </Link>
          </div>

          <BeadDecoration count={12} className="mt-4 justify-center" />
        </div>
      </section>

      {/* Feature cards */}
      <section className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group relative bg-card rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={22} className="text-foreground/80" />
              </div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
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
            Perlerly is a free online tool and community for Perler bead enthusiasts. Upload any image — photo, pixel art, or drawing — and our designer automatically converts it into a Perler bead pattern with exact bead counts by color. Browse patterns shared by the community, save your favorites, and use the bead counter to prepare your supplies before you start.
          </p>
        </div>
      </section>

      {/* Features detail */}
      <section className="container py-16 border-t">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10">Features</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {featureDetails.map((f) => (
            <div key={f.title} className="bg-card rounded-2xl border p-6">
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-8">Frequently Asked Questions</h2>
          <div className="bg-card rounded-2xl border px-6">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
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
