import { Link } from "react-router-dom";
import { Compass, PenTool, Calculator, ArrowRight } from "lucide-react";
import BeadDecoration from "@/components/BeadDecoration";
import PageMeta from "@/components/PageMeta";

const features = [
  {
    icon: Compass,
    title: "Explore Patterns",
    desc: "Browse hundreds of free community patterns by category, difficulty, and popularity",
    to: "/explore",
    color: "bg-bead-sky",
  },
  {
    icon: PenTool,
    title: "Pattern Designer",
    desc: "Upload an image or draw pixel-by-pixel to create your own bead pattern",
    to: "/designer",
    color: "bg-bead-pink",
  },
  {
    icon: Calculator,
    title: "Bead Counter",
    desc: "Estimate the colors and quantities you need before you start",
    to: "/counter",
    color: "bg-bead-lemon",
  },
];

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            Perlerly is a free online Perler bead pattern maker and community. Upload any PNG image and our designer automatically converts it into a pixel art Perler bead pattern with exact bead counts by color. Browse hundreds of free patterns organized by difficulty and category, or create your own.
          </p>
        </div>
      </section>

      {/* Free Tools */}
      <section className="container py-16 border-t">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10">Free Tools for Perler Bead Artists</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-2">Perler Bead Pattern Designer</h3>
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
              <p className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">The designer currently supports PNG image uploads. Upload any PNG and it will be automatically converted into a Perler bead pattern.</p>
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
