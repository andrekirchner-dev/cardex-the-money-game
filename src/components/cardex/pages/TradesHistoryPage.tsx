import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useFirestore";
import type { Trade } from "@/lib/firestore";

function formatDate(trade: Trade): string {
  if (!trade.tradedAt) return "—";
  try {
    const d = trade.tradedAt.toDate ? trade.tradedAt.toDate() : new Date((trade.tradedAt as any).seconds * 1000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function formatPrice(trade: Trade): string {
  const sym = trade.currency === "BRL" ? "R$" : trade.currency === "EUR" ? "€" : "$";
  return `${sym}${trade.price.toFixed(2)}`;
}

const TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  buy:   { bg: "rgba(89,172,153,0.15)",  color: "#59AC99", border: "rgba(89,172,153,0.3)"  },
  sell:  { bg: "rgba(231,54,60,0.15)",   color: "#E7363C", border: "rgba(231,54,60,0.3)"   },
  trade: { bg: "rgba(252,171,32,0.15)",  color: "#FCAB20", border: "rgba(252,171,32,0.3)"  },
};

const GAME_EMOJI: Record<string, string> = {
  pokemon:  "⚡",
  magic:    "🔮",
  yugioh:   "🐉",
  onepiece: "🏴‍☠️",
  lorcana:  "✨",
  other:    "🃏",
};

function TradeCard({ trade, isLast }: { trade: Trade; isLast: boolean }) {
  const tc = TYPE_COLORS[trade.type] ?? TYPE_COLORS.buy;
  const emoji = GAME_EMOJI[trade.game] ?? "🃏";

  return (
    <div style={{ padding: "13px 0", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>{formatDate(trade)}</span>
          {trade.platform && (
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em" }}>· {trade.platform}</span>
          )}
        </div>
        <span
          className="inline-flex items-center rounded-[4px]"
          style={{ padding: "2px 8px", fontFamily: "var(--font-tech)", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", ...tc }}>
          {trade.type.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 22 }}>{emoji}</span>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#fff" }}>{trade.cardName}</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", marginTop: 1 }}>
              {trade.game.charAt(0).toUpperCase() + trade.game.slice(1)}
              {trade.counterparty ? ` · ${trade.counterparty}` : ""}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#fff", letterSpacing: "0.02em" }}>
          {formatPrice(trade)}
        </div>
      </div>

      {trade.notes && (
        <div style={{ marginTop: 6, fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.03em", fontStyle: "italic" }}>
          {trade.notes}
        </div>
      )}
    </div>
  );
}

const TradesHistoryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();
  const { trades, loading } = useTrades(user?.uid ?? null);

  // Summary stats
  const totalBought = trades.filter(t => t.type === "buy").reduce((s, t) => s + t.price, 0);
  const totalSold   = trades.filter(t => t.type === "sell").reduce((s, t) => s + t.price, 0);
  const netFlow     = totalSold - totalBought;

  return (
    <div>
      <button onClick={() => onNavigate("trade")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> LOG TRADE
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>History</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>TRADES</h1>

      {/* Summary bar */}
      {trades.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Bought", val: `$${totalBought.toFixed(0)}`, color: "#59AC99" },
            { label: "Sold",   val: `$${totalSold.toFixed(0)}`,   color: "#E7363C" },
            { label: "Net",    val: `${netFlow >= 0 ? "+" : ""}$${netFlow.toFixed(0)}`, color: netFlow >= 0 ? "#B8E10D" : "#E7363C" },
          ].map(s => (
            <div key={s.label} className="rounded-[12px] p-3 text-center" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: s.color, letterSpacing: "0.02em" }}>{s.val}</div>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ height: 64, borderRadius: 8, marginBottom: 10, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))
        ) : trades.length === 0 ? (
          <div className="text-center py-10">
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No trades yet</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 16 }}>
              Log your first buy, sell, or trade
            </div>
            <button onClick={() => onNavigate("trade")}
              style={{ background: "linear-gradient(135deg,#E7363C,#F56438)", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.04em" }}>
              + Log Trade
            </button>
          </div>
        ) : (
          trades.map((trade, i) => (
            <TradeCard key={trade.id ?? i} trade={trade} isLast={i === trades.length - 1} />
          ))
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default TradesHistoryPage;
