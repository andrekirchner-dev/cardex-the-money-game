import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCollection } from "@/hooks/useFirestore";
import type { CollectionCard } from "@/lib/firestore";

type GameFilter = "all" | "pokemon" | "magic" | "yugioh" | "onepiece" | "lorcana" | "other";

const GAME_FILTERS: { id: GameFilter; label: string; emoji: string }[] = [
  { id: "all",      label: "All",       emoji: "" },
  { id: "pokemon",  label: "Pokémon",   emoji: "⚡" },
  { id: "magic",    label: "Magic",     emoji: "🔮" },
  { id: "yugioh",   label: "Yu-Gi-Oh",  emoji: "🐉" },
  { id: "onepiece", label: "One Piece", emoji: "🏴‍☠️" },
  { id: "lorcana",  label: "Lorcana",   emoji: "✨" },
];

function CardRow({ card, isLast }: { card: CollectionCard; isLast: boolean }) {
  const price = card.currentPrice ?? card.purchasePrice;
  return (
    <div className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {card.imageUrl
          ? <img src={card.imageUrl} alt={card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 18 }}>🃏</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
          {card.game} · {card.setName || "—"}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {price != null && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff", letterSpacing: "0.02em" }}>
            {card.currency === "BRL" ? "R$" : card.currency === "EUR" ? "€" : "$"}{price.toFixed(2)}
          </div>
        )}
        {card.isGraded && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: "#FCAB20", background: "rgba(252,171,32,0.1)", border: "1px solid rgba(252,171,32,0.2)", borderRadius: 4, padding: "1px 5px" }}>
            {card.gradeCompany ?? "PSA"} {card.gradeScore}
          </span>
        )}
      </div>
    </div>
  );
}

const CardLibraryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();
  const { cards, loading } = useCollection(user?.uid ?? null);

  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");

  const filtered = useMemo(() => {
    let result = cards;
    if (gameFilter !== "all") {
      result = result.filter(c => c.game === gameFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.setName?.toLowerCase().includes(q) ||
        c.rarity?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cards, search, gameFilter]);

  const totalValue = filtered.reduce((s, c) => s + (c.currentPrice ?? c.purchasePrice ?? 0), 0);

  return (
    <div>
      <button onClick={() => onNavigate("home")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> HOME
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Collection</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>CARD LIBRARY</h1>

      {/* Search */}
      <div className="relative mb-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, set, rarity..."
          style={{
            width: "100%", padding: "10px 14px 10px 36px", background: "#1C1C28",
            border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
            fontFamily: "var(--font-tech)", fontSize: 11, color: "#fff",
            letterSpacing: "0.04em", outline: "none", boxSizing: "border-box",
          }}
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      {/* Game filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ paddingBottom: 4 }}>
        {GAME_FILTERS.map(g => (
          <button key={g.id} onClick={() => setGameFilter(g.id)}
            style={{
              flexShrink: 0, padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.06em",
              background: gameFilter === g.id ? "rgba(252,171,32,0.18)" : "rgba(255,255,255,0.05)",
              color: gameFilter === g.id ? "#FCAB20" : "rgba(255,255,255,0.4)",
              border: gameFilter === g.id ? "1px solid rgba(252,171,32,0.3)" : "1px solid transparent",
              transition: "all 0.15s",
            }}>
            {g.emoji ? `${g.emoji} ` : ""}{g.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      {!loading && cards.length > 0 && (
        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
          <span>{filtered.length} cards</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          {totalValue > 0 && <span style={{ color: "rgba(255,255,255,0.4)" }}>${totalValue.toFixed(2)} total</span>}
        </div>
      )}

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", animation: "shimmer 1.5s infinite" }} />
              <div className="flex-1">
                <div style={{ height: 10, width: "65%", borderRadius: 4, background: "rgba(255,255,255,0.07)", marginBottom: 6 }} />
                <div style={{ height: 8, width: "45%", borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
              </div>
              <div style={{ height: 14, width: 50, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))
        ) : cards.length === 0 ? (
          <div className="text-center py-10">
            <div style={{ fontSize: 36, marginBottom: 10 }}>🃏</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Collection is empty</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 16 }}>
              Scan or add cards to build your library
            </div>
            <button onClick={() => onNavigate("scanner")}
              style={{ background: "linear-gradient(135deg,#E7363C,#F56438)", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.04em" }}>
              📷 Scan a Card
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
            No cards match your search.
          </div>
        ) : (
          filtered.map((card, i) => (
            <CardRow key={card.id ?? i} card={card} isLast={i === filtered.length - 1} />
          ))
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default CardLibraryPage;
