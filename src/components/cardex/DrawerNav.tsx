import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdminEmail } from "@/hooks/useAdmin";

type NavPage = "home" | "index" | "scanner" | "trade" | "profile";
type AnyPage = string;

interface Props {
  active: AnyPage;
  onNavigate: (p: string) => void;
}

const navItems: { id: NavPage; label: string; sub: string }[] = [
  { id: "home",    label: "Collection", sub: "My Cards"  },
  { id: "index",   label: "Card Index", sub: "Browse"    },
  { id: "scanner", label: "Scanner",    sub: "AI Grading"},
  { id: "trade",   label: "Trades",     sub: "Buy & Sell"},
  { id: "profile", label: "Profile",    sub: "Account"   },
];

function NavIcon({ id }: { id: string }) {
  const s = { width: 18, height: 18 };
  const p = { fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (id === "home")    return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (id === "index")   return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if (id === "scanner") return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
  if (id === "trade")   return <svg viewBox="0 0 24 24" {...p} style={s}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
  if (id === "profile") return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (id === "admin")   return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
  return null;
}

const profilePages = ["settings", "card-library", "graded-library", "trades-history", "admin"];
const homePages    = ["wishlist"];

function getParentTab(active: AnyPage): NavPage {
  if (profilePages.includes(active)) return "profile";
  if (homePages.includes(active))    return "home";
  return active as NavPage;
}

function NavContent({ active, onNavigate, closeDrawer }: { active: AnyPage; onNavigate: (p: string) => void; closeDrawer: () => void }) {
  const { user, profile } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const parentTab = getParentTab(active);

  const go = (page: string) => { onNavigate(page); closeDrawer(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>
          CAR<span style={{ color: "#E7363C" }}>DEX</span>
        </div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginTop: 5 }}>
          TCG Collection Manager
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", padding: "8px 10px 6px" }}>
          Navigation
        </div>

        {navItems.map(item => {
          const isActive = parentTab === item.id;
          const isScanner = item.id === "scanner";

          return (
            <button key={item.id} onClick={() => go(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", marginBottom: 3, borderRadius: 12, cursor: "pointer",
                background: isActive
                  ? isScanner ? "linear-gradient(135deg,rgba(252,171,32,0.18),rgba(245,100,56,0.12))" : "rgba(255,255,255,0.07)"
                  : "transparent",
                border: isActive
                  ? isScanner ? "1px solid rgba(252,171,32,0.25)" : "1px solid rgba(255,255,255,0.08)"
                  : "1px solid transparent",
                transition: "all 0.18s", textAlign: "left",
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isActive
                  ? isScanner ? "linear-gradient(135deg,#FCAB20,#F56438)" : "rgba(252,171,32,0.12)"
                  : "rgba(255,255,255,0.05)",
                color: isActive ? (isScanner ? "#fff" : "#FCAB20") : "rgba(255,255,255,0.3)",
                transition: "all 0.18s",
              }}>
                <NavIcon id={item.id} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: isActive ? "#fff" : "rgba(255,255,255,0.45)", letterSpacing: "0.02em", lineHeight: 1 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.18)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>
                  {item.sub}
                </div>
              </div>
              {isActive && <div style={{ width: 3, height: 18, borderRadius: 2, background: "#FCAB20", flexShrink: 0 }} />}
            </button>
          );
        })}

        {/* Admin shortcut */}
        {isAdmin && (
          <>
            <div style={{ margin: "12px 10px 8px", height: 1, background: "rgba(231,54,60,0.1)" }} />
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(231,54,60,0.4)", textTransform: "uppercase", padding: "0 10px 6px" }}>
              Sistema
            </div>
            <button onClick={() => go("admin")}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                background: active === "admin" ? "rgba(231,54,60,0.1)" : "transparent",
                border: `1px solid ${active === "admin" ? "rgba(231,54,60,0.22)" : "transparent"}`,
                transition: "all 0.18s",
              }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(231,54,60,0.08)", color: "#E7363C", flexShrink: 0 }}>
                <NavIcon id="admin" />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#E7363C", letterSpacing: "0.02em" }}>Admin Panel</div>
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(231,54,60,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>Control Center</div>
              </div>
            </button>
          </>
        )}
      </nav>

      {/* User card at bottom */}
      <div onClick={() => go("profile")}
        style={{
          padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
          transition: "background 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#E7363C,#FCAB20)", padding: 2, flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#12121A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 14 }}>🃏</span>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.displayName ?? user?.displayName ?? "Collector"}
          </div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.plan === "pro" ? "✦ PRO" : "FREE"} · {user?.email?.split("@")[0]}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  );
}

export default function DrawerNav({ active, onNavigate }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sidebarStyle: React.CSSProperties = {
    background: "#0D0D14",
    borderRight: "1px solid rgba(255,255,255,0.07)",
  };

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden"
        style={{
          position: "fixed", top: 18, left: 14, zIndex: 200,
          width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10,10,15,0.92)", backdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/>
        </svg>
      </button>

      {/* ── Mobile overlay ── */}
      {open && (
        <div className="lg:hidden" onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} />
      )}

      {/* ── Mobile drawer ── */}
      <div className="lg:hidden"
        style={{
          ...sidebarStyle,
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 160,
          width: 260,
          transform: open ? "translateX(0)" : "translateX(-105%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>
        <button onClick={() => setOpen(false)}
          style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", lineHeight: 0, zIndex: 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <NavContent active={active} onNavigate={onNavigate} closeDrawer={() => setOpen(false)} />
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex lg:flex-col"
        style={{ ...sidebarStyle, position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, width: 240 }}>
        <NavContent active={active} onNavigate={onNavigate} closeDrawer={() => {}} />
      </div>
    </>
  );
}
