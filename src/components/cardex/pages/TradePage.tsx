import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useFirestore";

type TradeType = "buy" | "sell" | "trade";
type GameType = "pokemon" | "magic" | "yugioh" | "onepiece" | "lorcana" | "other";
type Currency = "USD" | "BRL" | "EUR";

const games: { id: GameType; label: string; emoji: string }[] = [
  { id: "pokemon",  label: "Pokémon",   emoji: "⚡" },
  { id: "magic",    label: "Magic",     emoji: "🔮" },
  { id: "yugioh",   label: "Yu-Gi-Oh",  emoji: "🐉" },
  { id: "onepiece", label: "One Piece", emoji: "🏴‍☠️" },
  { id: "lorcana",  label: "Lorcana",   emoji: "✨" },
  { id: "other",    label: "Other",     emoji: "🃏" },
];

const TRADE_TYPES: { id: TradeType; label: string; color: string }[] = [
  { id: "buy",   label: "BUY",   color: "#59AC99" },
  { id: "sell",  label: "SELL",  color: "#E7363C" },
  { id: "trade", label: "TRADE", color: "#FCAB20" },
];

const TradePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();
  const { addTrade } = useTrades(user?.uid ?? null);

  const [tradeType, setTradeType] = useState<TradeType>("buy");
  const [cardName, setCardName] = useState("");
  const [game, setGame] = useState<GameType>("pokemon");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [counterparty, setCounterparty] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeType = TRADE_TYPES.find(t => t.id === tradeType)!;

  const handleSubmit = async () => {
    if (!cardName.trim()) { setError("Card name is required."); return; }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum < 0) { setError("Enter a valid price (0 or more)."); return; }

    setError(null);
    setSaving(true);
    try {
      await addTrade({
        type: tradeType,
        cardName: cardName.trim(),
        game,
        price: priceNum,
        currency,
        counterparty: counterparty.trim() || undefined,
        platform: platform.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      setCardName(""); setPrice(""); setCounterparty(""); setPlatform(""); setNotes("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Failed to save trade.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "#1C1C28",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    fontFamily: "var(--font-tech)",
    fontSize: 12,
    color: "#fff",
    letterSpacing: "0.04em",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-tech)",
    fontSize: 9,
    letterSpacing: "0.18em",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Log Transaction</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 18 }}>TRADE CENTER</h1>

      {/* Trade type tabs */}
      <div className="flex gap-2 mb-5">
        {TRADE_TYPES.map(t => (
          <button key={t.id} onClick={() => setTradeType(t.id)}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em",
              background: tradeType === t.id ? t.color : "rgba(255,255,255,0.05)",
              color: tradeType === t.id ? (t.id === "trade" ? "#000" : "#fff") : "rgba(255,255,255,0.4)",
              transition: "all 0.18s",
            }}>{t.label}</button>
        ))}
      </div>

      <div className="rounded-[16px] p-[18px]" style={{ background: "#1C1C28", border: `1px solid ${activeType.color}22` }}>

        {/* Card Name */}
        <div className="mb-4">
          <label style={labelStyle}>Card Name *</label>
          <input
            value={cardName}
            onChange={e => setCardName(e.target.value)}
            placeholder="e.g. Charizard VMAX, Black Lotus..."
            style={inputStyle}
          />
        </div>

        {/* Game selector */}
        <div className="mb-4">
          <label style={labelStyle}>Game</label>
          <div className="flex flex-wrap gap-2">
            {games.map(g => (
              <button key={g.id} onClick={() => setGame(g.id)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.05em",
                  background: game === g.id ? "rgba(252,171,32,0.18)" : "rgba(255,255,255,0.05)",
                  color: game === g.id ? "#FCAB20" : "rgba(255,255,255,0.4)",
                  border: game === g.id ? "1px solid rgba(252,171,32,0.3)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price + Currency */}
        <div className="flex gap-3 mb-4">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Price *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </div>
          <div style={{ width: 100 }}>
            <label style={labelStyle}>Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
            >
              <option value="USD">USD $</option>
              <option value="BRL">BRL R$</option>
              <option value="EUR">EUR €</option>
            </select>
          </div>
        </div>

        {/* Counterparty + Platform */}
        <div className="flex gap-3 mb-4">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{tradeType === "buy" ? "Seller" : tradeType === "sell" ? "Buyer" : "Counterparty"}</label>
            <input
              value={counterparty}
              onChange={e => setCounterparty(e.target.value)}
              placeholder="Optional"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Platform</label>
            <input
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              placeholder="eBay, TCGPlayer, Local..."
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Condition, grade, extra details..."
            rows={2}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-[8px] px-3 py-2" style={{ background: "rgba(231,54,60,0.12)", border: "1px solid rgba(231,54,60,0.25)", fontFamily: "var(--font-tech)", fontSize: 10, color: "#E7363C" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase",
            background: saving ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${activeType.color}, ${activeType.color}cc)`,
            color: tradeType === "trade" && !saving ? "#000" : "#fff",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.18s",
          }}>
          {saving ? "Saving..." : `Log ${tradeType.toUpperCase()}`}
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mt-3 rounded-[14px] p-4 text-center" style={{ background: "rgba(89,172,153,0.12)", border: "2px solid rgba(89,172,153,0.35)" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>✅</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#59AC99", letterSpacing: "0.04em" }}>TRADE LOGGED!</div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(89,172,153,0.7)", marginTop: 4, letterSpacing: "0.06em" }}>Saved to your history</div>
        </div>
      )}

      {/* Quick link to history */}
      <button
        onClick={() => onNavigate("trades-history")}
        style={{
          width: "100%", marginTop: 12, padding: "11px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11,
          letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", cursor: "pointer",
        }}>
        View Trade History →
      </button>
    </div>
  );
};

export default TradePage;
