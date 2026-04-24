import { useState, useCallback, lazy, Suspense, useEffect } from "react";
import SplashScreen from "@/components/cardex/SplashScreen";
import DrawerNav from "@/components/cardex/DrawerNav";
import BottomNav from "@/components/cardex/BottomNav";
import LoginPage from "@/components/cardex/LoginPage";
import { useAuth } from "@/hooks/useAuth";

const HomePage          = lazy(() => import("@/components/cardex/pages/HomePage"));
const IndexPage         = lazy(() => import("@/components/cardex/pages/IndexPage"));
const ScannerPage       = lazy(() => import("@/components/cardex/pages/ScannerPage"));
const TradePage         = lazy(() => import("@/components/cardex/pages/TradePage"));
const ProfilePage       = lazy(() => import("@/components/cardex/pages/ProfilePage"));
const SettingsPage      = lazy(() => import("@/components/cardex/pages/SettingsPage"));
const CardLibraryPage   = lazy(() => import("@/components/cardex/pages/CardLibraryPage"));
const GradedLibraryPage = lazy(() => import("@/components/cardex/pages/GradedLibraryPage"));
const TradesHistoryPage = lazy(() => import("@/components/cardex/pages/TradesHistoryPage"));
const WishlistPage      = lazy(() => import("@/components/cardex/pages/WishlistPage"));
const AdminPage         = lazy(() => import("@/components/cardex/pages/AdminPage"));

const pages = ["home","index","scanner","trade","profile","settings","card-library","graded-library","trades-history","wishlist","admin"] as const;
type Page = (typeof pages)[number];
const SPLASH_DURATION_MS = 3200;

function PageSkeleton() {
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ height: 10, width: 80, borderRadius: 4, background: "rgba(245,100,56,0.3)", marginBottom: 8 }} />
      <div style={{ height: 40, width: "60%", borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} style={{ height: 64, borderRadius: 12, marginBottom: 10, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

function getNavTab(page: Page): "home" | "index" | "scanner" | "trade" | "profile" {
  switch (page) {
    case "settings": case "card-library": case "graded-library": case "trades-history": case "admin": return "profile";
    case "wishlist": return "home";
    default: return page as "home" | "index" | "scanner" | "trade" | "profile";
  }
}

const Index = () => {
  const [activePage, setActivePage] = useState<Page>("home");
  const [splashVisible, setSplashVisible] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setSplashVisible(false), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div style={{ background: "radial-gradient(ellipse at 30% 0%,#1a1025 0%,#0A0A0F 60%)", minHeight: "100vh" }}>
        {splashVisible && <SplashScreen />}
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (activePage) {
      case "home":           return <HomePage onNavigate={handleNavigate} />;
      case "index":          return <IndexPage onNavigate={handleNavigate} />;
      case "scanner":        return <ScannerPage onNavigate={handleNavigate} />;
      case "trade":          return <TradePage onNavigate={handleNavigate} />;
      case "profile":        return <ProfilePage onNavigate={handleNavigate} />;
      case "settings":       return <SettingsPage onNavigate={handleNavigate} />;
      case "card-library":   return <CardLibraryPage onNavigate={handleNavigate} />;
      case "graded-library": return <GradedLibraryPage onNavigate={handleNavigate} />;
      case "trades-history": return <TradesHistoryPage onNavigate={handleNavigate} />;
      case "wishlist":       return <WishlistPage onNavigate={handleNavigate} />;
      case "admin":          return <AdminPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ background: "radial-gradient(ellipse at 30% 0%,#1a1025 0%,#0A0A0F 60%)", minHeight: "100vh", display: "flex" }}>
      {splashVisible && <SplashScreen />}

      {/* Sidebar / Drawer */}
      <DrawerNav active={activePage} onNavigate={handleNavigate} />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
        className="lg:ml-[240px]">

        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}>

          {/* Content area — responsive padding */}
          <div
            className="mx-auto"
            style={{
              maxWidth: 680,
              padding: "72px 20px 100px", // top: space for mobile hamburger
            }}
            // Desktop: less top padding (no hamburger button)
          >
            <style>{`
              @media (min-width: 1024px) {
                .main-content-inner { padding-top: 40px !important; padding-bottom: 48px !important; }
              }
            `}</style>
            <div className="main-content-inner" style={{ paddingTop: 72, paddingBottom: 100 }}>
              <Suspense fallback={<PageSkeleton />}>
                {renderPage()}
              </Suspense>
            </div>
          </div>
        </div>

        {/* Bottom nav — mobile only */}
        <div className="lg:hidden">
          <BottomNav active={getNavTab(activePage)} onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
};

export default Index;
