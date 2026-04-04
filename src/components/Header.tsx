import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, PenTool, Grid3X3, Calculator, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Designer", to: "/designer", icon: PenTool },
  { label: "Patterns", to: "/patterns", icon: Grid3X3 },
  { label: "Counter", to: "/counter", icon: Calculator },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Perlerly – Perler Bead Pattern Designer and Community">
          <div className="grid grid-cols-2 gap-0.5" role="img" aria-label="Perlerly – Perler Bead Pattern Designer and Community">
            <span className="w-3 h-3 rounded-sm bg-bead-pink" />
            <span className="w-3 h-3 rounded-sm bg-bead-sky" />
            <span className="w-3 h-3 rounded-sm bg-bead-lemon" />
            <span className="w-3 h-3 rounded-sm bg-bead-mint" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Perlerly</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="w-8 h-8 rounded-full bg-bead-lavender flex items-center justify-center">
                <User size={14} className="text-foreground" />
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-2 ml-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </nav>

        <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t bg-card pb-4 px-4">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all mt-1",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {user ? (
            <button
              onClick={() => { handleSignOut(); setOpen(false); }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted mt-1 w-full"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold mt-1"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
