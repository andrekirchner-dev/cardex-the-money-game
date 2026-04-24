import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData, isAdminEmail, type AdminUserData } from "@/hooks/useAdmin";

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-[14px] p-4 flex flex-col justify-between"
      style={{ background: "#1C1C28", border: `1px solid ${accent ? accent + "33" : "rgba(255,255,255,0.07)"}`, minHeight: 90 }}>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.18em", color: accent ?? "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{label}</div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "#fff", letterSpacing: "0.02em", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: "free" | "pro" }) {
  const isPro = plan === "pro";
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
      padding: "2px 8px", borderRadius: 4,
      background: isPro ? "rgba(252,171,32,0.15)" : "rgba(255,255,255,0.06)",
      color: isPro ? "#FCAB20" : "rgba(255,255,255,0.35)",
      border: `1px solid ${isPro ? "rgba(252,171,32,0.25)" : "rgba(255,255,255,0.09)"}`,
    }}>
      {isPro ? "PRO" : "FREE"}
    </span>
  );
}

function UserRow({ user, onTogglePlan }: { user: AdminUserData; onTogglePlan: (uid: string, plan: "free" | "pro") => void }) {
  const [busy, setBusy] = useState(false);
  const initial = (user.displayName ?? "?")[0].toUpperCase();
  const isAdmin = user.email?.toLowerCase() === "kirchner.andre@gmail.com";

  const toggle = async () => {
    setBusy(true);
    await onTogglePlan(user.uid, user.plan === "pro" ? "free" : "pro");
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-3" style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Avatar */}
      <div className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{ width: 36, height: 36, background: isAdmin ? "linear-gradient(135deg,#E7363C,#FCAB20)" : "rgba(255,255,255,0.07)", fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff" }}>
        {user.photoURL
          ? <img src={user.photoURL} alt={initial} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          : initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.displayName ?? "—"}
          </span>
          {isAdmin && (
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 8, letterSpacing: "0.12em", color: "#E7363C", background: "rgba(231,54,60,0.1)", border: "1px solid rgba(231,54,60,0.2)", borderRadius: 3, padding: "1px 5px" }}>ADMIN</span>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.email ?? "—"}
        </div>
      </div>

      {/* Micro stats */}
      <div className="flex gap-3 flex-shrink-0" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
        <span title="Cards">🃏 {user.cardCount}</span>
        <span title="Wishlist">⭐ {user.wishlistCount}</span>
        <span title="Trades">🔄 {user.tradeCount}</span>
      </div>

      {/* Plan badge + toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <PlanBadge plan={user.plan ?? "free"} />
        {!isAdmin && (
          <button onClick={toggle} disabled={busy}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              padding: "3px 9px", borderRadius: 5, cursor: busy ? "default" : "pointer",
              background: user.plan === "pro" ? "rgba(255,255,255,0.05)" : "rgba(252,171,32,0.12)",
              color: user.plan === "pro" ? "rgba(255,255,255,0.4)" : "#FCAB20",
              border: `1px solid ${user.plan === "pro" ? "rgba(255,255,255,0.08)" : "rgba(252,171,32,0.2)"}`,
              opacity: busy ? 0.5 : 1, transition: "opacity 0.2s",
            }}>
            {busy ? "..." : user.plan === "pro" ? "Downgrade" : "→ PRO"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── System Info ──────────────────────────────────────────────────────────────
function SystemTab() {
  const rows = [
    { label: "Firebase Project", val: "cardex-the-money-game" },
    { label: "Auth Methods",     val: "Email/Password · Google" },
    { label: "Database",         val: "Firestore (production mode)" },
    { label: "Storage",          val: "Firebase Storage" },
    { label: "Hosting",          val: "Vercel · cardex-tcg.vercel.app" },
    { label: "Repo",             val: "andrekirchner-dev/cardex-the-money-game" },
    { label: "Framework",        val: "React 18 + Vite + TypeScript" },
    { label: "UI",               val: "Tailwind CSS + shadcn/ui" },
    { label: "App Version",      val: "0.0.0-alpha" },
    { label: "Last Deploy",      val: "main branch → auto-deploy" },
  ];

  const services = [
    { name: "Firebase Auth",      status: "online" },
    { name: "Firestore",          status: "online" },
    { name: "Pokémon TCG API",    status: "online" },
    { name: "Scryfall (Magic)",   status: "online" },
    { name: "YGOPRODeck",         status: "online" },
    { name: "Vercel CDN",         status: "online" },
  ];

  return (
    <div>
      {/* Service Health */}
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
        Service Health
      </div>
      <div className="rounded-[14px] p-4 mb-4" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {services.map((s, i) => (
          <div key={s.name} className="flex items-center justify-between"
            style={{ padding: "9px 0", borderBottom: i < services.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{s.name}</span>
            <div className="flex items-center gap-2">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#59AC99", boxShadow: "0 0 6px #59AC99" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#59AC99", fontWeight: 700 }}>ONLINE</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stack Info */}
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
        Stack &amp; Config
      </div>
      <div className="rounded-[14px] p-4" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-start justify-between gap-3"
            style={{ padding: "9px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", flexShrink: 0 }}>{r.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.7)", textAlign: "right" }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
type AdminTab = "dashboard" | "users" | "system";

const AdminPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const { users, stats, loading, error, refresh, updateUserPlan } = useAdminData();

  // Guard — should never reach here if Index.tsx checks correctly, but safety first
  if (!isAdminEmail(user?.email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "rgba(255,255,255,0.05)" }}>403</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>ACESSO NEGADO</div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users",     label: `Users (${stats.totalUsers})` },
    { id: "system",    label: "System" },
  ];

  return (
    <div>
      {/* Header */}
      <button onClick={() => onNavigate("profile")}
        className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer"
        style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> PROFILE
      </button>

      <div className="flex items-center gap-3 mb-1">
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#E7363C", textTransform: "uppercase" }}>
          Sistema
        </div>
        <span style={{ fontFamily: "var(--font-tech)", fontSize: 8, letterSpacing: "0.12em", color: "#E7363C", background: "rgba(231,54,60,0.12)", border: "1px solid rgba(231,54,60,0.25)", borderRadius: 4, padding: "2px 7px" }}>
          ADMIN
        </span>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 16 }}>
        CONTROL<br />PANEL
      </h1>

      {/* Tab bar */}
      <div className="flex rounded-[12px] mb-5 p-[3px] gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-1 rounded-[9px] py-2 border-none cursor-pointer"
            style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
              background: activeTab === t.id ? "linear-gradient(135deg,#E7363C,#F56438)" : "transparent",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.35)",
              transition: "all 0.2s",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === "dashboard" && (
        <div>
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-[8px] mb-4">
            <KpiCard label="Total Users"   value={loading ? "—" : stats.totalUsers}   sub={`${stats.proUsers} PRO · ${stats.freeUsers} FREE`} accent="#F56438" />
            <KpiCard label="Total Cards"   value={loading ? "—" : stats.totalCards}   sub="em todas as coleções" />
            <KpiCard label="Wishlists"     value={loading ? "—" : stats.totalWishlist} sub="itens registrados" />
            <KpiCard label="Trades"        value={loading ? "—" : stats.totalTrades}   sub="transações totais" />
          </div>

          {/* Platform health banner */}
          <div className="rounded-[14px] p-4 mb-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0f2a1a 0%,#0a1a0f 100%)", border: "1px solid rgba(89,172,153,0.2)" }}>
            <div className="absolute -right-4 -top-4" style={{ fontFamily: "var(--font-display)", fontSize: 90, color: "rgba(89,172,153,0.04)", letterSpacing: "0.1em" }}>LIVE</div>
            <div className="flex items-center gap-2 mb-3">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#59AC99", boxShadow: "0 0 8px #59AC99" }} />
              <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.18em", color: "#59AC99", textTransform: "uppercase" }}>Plataforma Operacional</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#59AC99", letterSpacing: "0.02em", marginBottom: 2 }}>ALL SYSTEMS GO</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>Firebase · Firestore · Vercel · APIs externas</div>
          </div>

          {/* Plan distribution */}
          {!loading && stats.totalUsers > 0 && (
            <div className="rounded-[14px] p-4" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>
                Distribuição de Planos
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${(stats.proUsers / stats.totalUsers) * 100}%`, background: "linear-gradient(90deg,#FCAB20,#F56438)", transition: "width 0.6s ease" }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#FCAB20", fontWeight: 700, flexShrink: 0 }}>
                  {Math.round((stats.proUsers / stats.totalUsers) * 100)}% PRO
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{stats.freeUsers} free users</span>
                <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "#FCAB20" }}>{stats.proUsers} pro users</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-[14px] p-6 text-center" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>Carregando dados...</div>
            </div>
          )}

          {error && (
            <div className="rounded-[14px] p-4" style={{ background: "rgba(231,54,60,0.08)", border: "1px solid rgba(231,54,60,0.2)" }}>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "#E7363C" }}>⚠️ {error}</div>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(231,54,60,0.6)", marginTop: 4 }}>
                Verifique as regras do Firestore (admin precisa de permissão de leitura global).
              </div>
              <button onClick={refresh} style={{ marginTop: 8, background: "rgba(231,54,60,0.15)", border: "1px solid rgba(231,54,60,0.2)", borderRadius: 6, padding: "4px 12px", fontFamily: "var(--font-mono)", fontSize: 10, color: "#E7363C", cursor: "pointer" }}>
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div>
          {/* Search */}
          <input
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            style={{
              width: "100%", boxSizing: "border-box", marginBottom: 12,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "10px 14px", color: "#fff",
              fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
            }}
          />

          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
              {filteredUsers.length} usuário{filteredUsers.length !== 1 ? "s" : ""}
            </span>
            <button onClick={refresh} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              ↻ Atualizar
            </button>
          </div>

          <div className="rounded-[14px] px-4" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
            {loading ? (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} style={{ height: 60, borderRadius: 8, margin: "10px 0", background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center" style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                Nenhum usuário encontrado
              </div>
            ) : (
              filteredUsers.map(u => (
                <UserRow key={u.uid} user={u} onTogglePlan={updateUserPlan} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── SYSTEM TAB ── */}
      {activeTab === "system" && <SystemTab />}

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default AdminPage;
