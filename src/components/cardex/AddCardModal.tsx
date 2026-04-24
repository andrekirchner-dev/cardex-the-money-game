import { useState, useRef } from "react";
import { searchPokemonCards, getPokemonPrice, type PokemonCard } from "@/lib/api";
import { useCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";

type GameType = "pokemon" | "magic" | "yugioh" | "onepiece" | "lorcana" | "other";
type Currency = "USD" | "BRL" | "EUR";

interface Props {
  onClose: () => void;
}

function SearchResultRow({ card, onSelect }: { card: PokemonCard; onSelect: (card: PokemonCard) => void }) {
  const price = getPokemonPrice(card);
  return (
    <button
      onClick={() => onSelect(card)}
      className="flex items-center gap-3 w-full text-left rounded-[10px] p-2"
      style={{ background: "transparent", border: "none", cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 36, height: 50, borderRadius: 5, background: "rgba(255,255,255,0.06)" }}>
        {card.images?.small
          ? <img src={card.images.small} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span>🃏</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{card.set?.name} · {card.rarity ?? "—"}</div>
      </div>
      {price.usd != null && (
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "#fff", flexShrink: 0 }}>${price.usd.toFixed(2)}</div>
      )}
    </button>
  );
}

export default function AddCardModal({ onClose }: Props) {
  const { user } = useAuth();
  const { addCard } = useCollection(user?.uid ?? null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const [name, setName] = useState("");
  const [game, setGame] = useState<GameType>("pokemon");
  const [setName, setSetName] = useState("");
  const [rarity, setRarity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isGraded, setIsGraded] = useState(false);
  const [gradeCompany, setGradeCompany] = useState("PSA");
  const [gradeScore, setGradeScore] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchPokemonCards(q, 10);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelect = (card: PokemonCard) => {
    const price = getPokemonPrice(card);
    setSelectedCard(card);
    setName(card.name);
    setGame("pokemon");
    setSetName(card.set?.name ?? "");
    setRarity(card.rarity ?? "");
    setImageUrl(card.images?.small ?? "");
    if (price.usd != null) setCurrentPrice(price.usd.toFixed(2));
    setResults([]);
    setQuery("");
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Card name is required."); return; }
    setError(null);
    setSaving(true);
    try {
      await addCard({
        cardId: selectedCard?.id ?? `manual-${Date.now()}`,
        name: name.trim(),
        game,
        setName: setName.trim() || "Unknown",
        rarity: rarity.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        currentPrice: currentPrice ? parseFloat(currentPrice) : undefined,
        currency,
        isGraded,
        gradeCompany: isGraded ? gradeCompany : undefined,
        gradeScore: isGraded && gradeScore ? parseFloat(gradeScore) : undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to save card.");
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 8, fontFamily: "var(--font-tech)", fontSize: 11, color: "#fff",
    letterSpacing: "0.04em", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.16em",
    color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 5, display: "block",
  };

  const gameOptions: { id: GameType; emoji: string }[] = [
    { id: "pokemon",  emoji: "⚡" },
    { id: "magic",    emoji: "🔮" },
    { id: "yugioh",   emoji: "🐉" },
    { id: "onepiece", emoji: "🏴‍☠️" },
    { id: "lorcana",  emoji: "✨" },
    { id: "other",    emoji: "🃏" },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
          background: "linear-gradient(160deg,#1a1a2e 0%,#12121A 100%)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px 20px 0 0",
          padding: "20px 20px 36px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.18em", color: "#F56438", textTransform: "uppercase", marginBottom: 3 }}>Add to Collection</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "#fff", letterSpacing: "0.02em" }}>NEW CARD</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          {[false, true].map(isManual => (
            <button key={String(isManual)} onClick={() => setManualMode(isManual)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em",
                background: manualMode === isManual ? "rgba(252,171,32,0.18)" : "rgba(255,255,255,0.05)",
                color: manualMode === isManual ? "#FCAB20" : "rgba(255,255,255,0.4)",
                border: manualMode === isManual ? "1px solid rgba(252,171,32,0.3)" : "1px solid transparent",
                transition: "all 0.15s",
              }}>
              {isManual ? "Manual Entry" : "Search Pokémon"}
            </button>
          ))}
        </div>

        {/* Search section (Pokémon API) */}
        {!manualMode && (
          <div className="mb-5">
            <label style={labelStyle}>Search Card</label>
            <div className="relative">
              <input
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder="e.g. Charizard, Pikachu..."
                style={inputStyle}
              />
              {searching && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>searching…</div>}
            </div>

            {results.length > 0 && (
              <div className="mt-2 rounded-[10px] p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", maxHeight: 220, overflowY: "auto" }}>
                {results.map(card => (
                  <SearchResultRow key={card.id} card={card} onSelect={handleSelect} />
                ))}
              </div>
            )}

            {selectedCard && (
              <div className="flex items-center gap-3 mt-3 rounded-[10px] p-3" style={{ background: "rgba(184,225,13,0.06)", border: "1px solid rgba(184,225,13,0.2)" }}>
                <img src={selectedCard.images?.small} alt={selectedCard.name} style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 4 }} />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#B8E10D" }}>✓ {selectedCard.name} selected</div>
              </div>
            )}
          </div>
        )}

        {/* Card Name */}
        <div className="mb-3">
          <label style={labelStyle}>Card Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Card name..." style={inputStyle} />
        </div>

        {/* Game (only in manual mode) */}
        {manualMode && (
          <div className="mb-3">
            <label style={labelStyle}>Game</label>
            <div className="flex gap-2 flex-wrap">
              {gameOptions.map(g => (
                <button key={g.id} onClick={() => setGame(g.id)}
                  style={{
                    padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontFamily: "var(--font-tech)", fontSize: 10,
                    background: game === g.id ? "rgba(252,171,32,0.18)" : "rgba(255,255,255,0.05)",
                    color: game === g.id ? "#FCAB20" : "rgba(255,255,255,0.4)",
                    border: game === g.id ? "1px solid rgba(252,171,32,0.3)" : "1px solid transparent",
                  }}>
                  {g.emoji} {g.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Set + Rarity */}
        <div className="flex gap-3 mb-3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Set</label>
            <input value={setName} onChange={e => setSetName(e.target.value)} placeholder="Set name..." style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rarity</label>
            <input value={rarity} onChange={e => setRarity(e.target.value)} placeholder="Rare, Holo..." style={inputStyle} />
          </div>
        </div>

        {/* Prices + Currency */}
        <div className="flex gap-3 mb-3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Purchase Price</label>
            <input type="number" min="0" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Current Price</label>
            <input type="number" min="0" step="0.01" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
          <div style={{ width: 72 }}>
            <label style={labelStyle}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingLeft: 8 }}>
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Image URL (manual) */}
        {manualMode && (
          <div className="mb-3">
            <label style={labelStyle}>Image URL (optional)</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
        )}

        {/* Graded toggle */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setIsGraded(!isGraded)}
            style={{
              width: 42, height: 22, borderRadius: 11, border: "none", cursor: "pointer", position: "relative",
              background: isGraded ? "#FCAB20" : "rgba(255,255,255,0.1)", transition: "background 0.2s",
            }}>
            <div style={{ position: "absolute", top: 2, left: isGraded ? 22 : 2, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left 0.2s" }} />
          </button>
          <span style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: isGraded ? "#FCAB20" : "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
            Graded Card
          </span>
        </div>

        {isGraded && (
          <div className="flex gap-3 mb-3">
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Grade Company</label>
              <select value={gradeCompany} onChange={e => setGradeCompany(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                <option>PSA</option><option>BGS</option><option>CGC</option><option>TAG</option><option>SGC</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Grade Score</label>
              <input type="number" min="1" max="10" step="0.5" value={gradeScore} onChange={e => setGradeScore(e.target.value)} placeholder="9.5" style={inputStyle} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-[8px] px-3 py-2" style={{ background: "rgba(231,54,60,0.12)", border: "1px solid rgba(231,54,60,0.25)", fontFamily: "var(--font-tech)", fontSize: 10, color: "#E7363C" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em",
            background: saving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#E7363C,#F56438)",
            color: "#fff", opacity: saving ? 0.7 : 1, transition: "all 0.18s",
            boxShadow: saving ? "none" : "0 4px 20px rgba(231,54,60,0.35)",
          }}>
          {saving ? "Saving..." : "Add to Collection"}
        </button>
      </div>
    </div>
  );
}
