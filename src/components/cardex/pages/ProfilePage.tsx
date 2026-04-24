import { useAuth } from "@/hooks/useAuth";
import { useCollection, useWishlist, useTrades } from "@/hooks/useFirestore";
import { isAdminEmail } from "@/hooks/useAdmin";

const ProfilePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user, profile, logout } = useAuth();
  const { cards } = useCollection(user?.uid ?? null);
  const { items: wishlistItems } = useWishlist(user?.uid ?? null);
  const { trades } = useTrades(user?.uid ?? null);

  const gradedCount = cards.filter(c => c.isGraded).length;
  const isAdmin = isAdminEmail(user?.email);
  const displayName = profile?.displayName ?? user?.displayName ?? "Collector";
  const memberSince = profile?.memberSince ?? new Date().getFullYear().toString();
  const plan = profile?.plan ?? "free";
  const photoURL = user?.photoURL;

  const stats = [
    { key: "Total Cards", val: String(cards.length), target: "card-library" },
    { key: "Graded Cards", val: String(gradedCount), target: "graded-library" },
    { key: "Wishlist", val: String(wishlistItems.length), target: "wishlist" },
    { key: "Trades Done", val: String(trades.length), target: "trades-history" },
  ];

  const settings = ["Notification Preferences", "Display & Theme", "Privacy & Security", "Data Export", "Help & Support"];

  return (
    <div>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Account</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>PROFILE</h1>

      {/* Avatar */}
      <div className="mx-auto mb-3" style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #E7363C, #FCAB20)", padding: 2 }}>
        <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ background: "#12121A", fontSize: 32 }}>
          {photoURL
            ? <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🃏"}
        </div>
      </div>

      <div className="text-center" style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase" }}>
        {displayName}
      </div>
      <div className="text-center mb-1" style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)" }}>
        {user?.email}
      </div>
      <div className="text-center mb-4" style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
        {plan === "pro" ? "Pro Collector" : "Free Collector"} · Since {memberSince}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-[6px] mb-[14px]">
        {stats.map(s => (
          <div key={s.key} onClick={() => onNavigate(s.target)}
            className="rounded-[8px] p-[9px] cursor-pointer flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "background 0.15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}>
            <div>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 3 }}>{s.key}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{s.val}</div>
            </div>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</span>
          </div>
        ))}
      </div>

      {/* Plan Banner */}
      <div className="relative overflow-hidden rounded-[14px] p-[18px] mb-[10px]"
        style={{
          background: plan === "pro" ? "linear-gradient(135deg, #3E446E 0%, #2a2050 100%)" : "linear-gradient(135deg, #1C1C28 0%, #12121A 100%)",
          border: `1px solid ${plan === "pro" ? "rgba(252,171,32,0.2)" : "rgba(255,255,255,0.07)"}`,
        }}>
        <div className="absolute -right-2 -top-3" style={{ fontFamily: "var(--font-display)", fontSize: 80, color: plan === "pro" ? "rgba(252,171,32,0.06)" : "rgba(255,255,255,0.03)", letterSpacing: "0.1em" }}>
          {plan === "pro" ? "PAID" : "FREE"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: plan === "pro" ? "#FCAB20" : "rgba(255,255,255,0.4)", letterSpacing: "0.04em", marginBottom: 4 }}>
          {plan === "pro" ? "PRO COLLECTOR" : "FREE PLAN"}
        </div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", marginBottom: plan === "pro" ? 14 : 10 }}>
          {plan === "pro" ? "Unlimited scans, priority grading, trade insights" : "Upgrade para acesso completo ao CarDex"}
        </div>
        {plan === "pro"
          ? [{key: "Plan", val: "Annual Pro"}, {key: "Scans Left", val: "Unlimited"}].map(r => (
              <div key={r.key} className="flex items-center justify-between" style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{r.key}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.val}</span>
              </div>
            ))
          : (
            <button className="rounded-[8px] px-4 py-2 border-none cursor-pointer"
              style={{ background: "linear-gradient(135deg, #E7363C, #F56438)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
              Upgrade to Pro →
            </button>
          )
        }
      </div>

      {/* Settings */}
      <div className="flex items-center gap-2 mb-[10px]" style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
        Settings<div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {settings.map((s, i) => (
          <div key={s} onClick={() => onNavigate("settings")}
            className="flex items-center justify-between cursor-pointer"
            style={{ padding: "11px 0", borderBottom: i < settings.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 11, letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>{s}</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>›</span>
          </div>
        ))}
      </div>

      {/* Admin Panel button — only for admin */}
      {isAdmin && (
        <button onClick={() => onNavigate("admin")}
          className="w-full mt-[14px] inline-flex items-center justify-center gap-2 rounded-[10px] cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase",
            background: "linear-gradient(135deg, #1a0a0a, #2a0a0a)",
            color: "#E7363C", padding: "11px 16px",
            border: "1px solid rgba(231,54,60,0.3)",
            boxShadow: "0 0 20px rgba(231,54,60,0.1)",
          }}>
          <span style={{ fontSize: 14 }}>⚙</span> Admin Panel
        </button>
      )}

      <button onClick={logout}
        className="w-full mt-3 inline-flex items-center justify-center gap-[7px] rounded-[10px] cursor-pointer"
        style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
          background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", padding: "11px 16px", border: "1px solid rgba(255,255,255,0.07)",
        }}>
        Sign Out
      </button>
    </div>
  );
};

export default ProfilePage;
