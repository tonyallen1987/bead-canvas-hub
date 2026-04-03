import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, ArrowRight, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="grid grid-cols-2 gap-0.5 w-fit mx-auto mb-3">
            <span className="w-4 h-4 rounded-sm bg-bead-pink" />
            <span className="w-4 h-4 rounded-sm bg-bead-sky" />
            <span className="w-4 h-4 rounded-sm bg-bead-lemon" />
            <span className="w-4 h-4 rounded-sm bg-bead-mint" />
          </div>
          <h1 className="text-2xl font-extrabold">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login"
              ? "Sign in to save and share your creations"
              : "Join the Perlerly community"}
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border font-semibold text-sm hover:bg-muted transition-colors mb-4"
        >
          <Chrome size={18} />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Sign Up"}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
