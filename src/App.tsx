import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { initGA, trackPageView } from "@/lib/analytics";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Designer from "./pages/Designer";
import Patterns from "./pages/Patterns";
import Counter from "./pages/Counter";
import Auth from "./pages/Auth";
import PatternDetail from "./pages/PatternDetail";
import NotFound from "./pages/NotFound";
import AdminImport from "./pages/AdminImport";

const queryClient = new QueryClient();

initGA();

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageViewTracker />
          <AuthProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/designer" element={<Designer />} />
              <Route path="/patterns" element={<Patterns />} />
              <Route path="/counter" element={<Counter />} />
              <Route path="/pattern/:slug" element={<PatternDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-import" element={<AdminImport />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
