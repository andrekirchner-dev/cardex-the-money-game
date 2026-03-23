import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatUSD, formatEUR } from "@/lib/api";

export interface UnifiedCard {
  id: string;
  name: string;
  imageSmall: string;
  imageLarge: string;
  game: "pokemon" | "mtg" | "yugioh" | "onepiece" | "lorcana" | "sports";
  set: string;
  number?: string;
  rarity?: string;
  artist?: string;
  releaseDate?: string;
  description?: string;
  reprints?: string[];
  prices: { eurAvg?: number; usdMarket?: number; psa10?: number; psa9?: number; cgc10?: number; allTimeHigh?: number };
  priceHistory: Array<{ month: string; price: number }>;
}

function estimatePop(psa10Price?: number): string {
  if (!psa10Price) return "~5,000+";
  if (psa10Price > 5000) return "~100–500";
  if (psa10Price > 500) return "~500–2,000";
  if (psa10Price > 100) return "~2,000–5,000";
  return "~5,000–20,000";
}

const CardDetailModal = ({ card, onClose }: { card: UnifiedCard | null; onClose: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (card) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [card]);

  if (!card) return null;

  const isUsd = card.game === "yugioh" || card.game === "sports";
  const primaryPrice = card.prices.usdMarket ?? card.prices.eurAvg ?? 0;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl pb-24"
        style={{
          background: "#1a1a2e",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="rounded-full flex items-center justify-center cursor-pointer" style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Card image */}
        <div className="flex justify-center px-6 mb-4">
          <img
            src={card.imageLarge || card.imageSmall}
            alt={card.name}
            style={{ maxHeight: 288, objectFit: "contain", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
          />
        </div>

        <div className="px-4 pb-8 space-y-3">
          {/* Info */}
          <div className="rounded-xl p-4" style={{ background: "#18181B" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{card.name}</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>
              {[card.set, card.number, card.rarity].filter(Boolean).join(" · ")}
            </div>
            {card.artist && <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Artist: {card.artist}</div>}
            {card.releaseDate && <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Released: {card.releaseDate}</div>}
            {card.description && <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6, lineHeight: 1.5 }}>{card.description.slice(0, 200)}{card.description.length > 200 ? "…" : ""}</div>}
            {card.reprints && card.reprints.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Also in:</span>
                {card.reprints.slice(0, 5).map((r, i) => (
                  <span key={i} className="rounded px-[6px] py-[2px]" style={{ fontFamily: "var(--font-tech)", fontSize: 8, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{r}</span>
                ))}
              </div>
            )}
          </div>

          {/* Prices */}
          <div className="rounded-xl p-4" style={{ background: "#18181B" }}>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Market Prices</div>
            <div className="grid grid-cols-2 gap-3">
              {card.prices.eurAvg != null && (
                <div>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>🇪🇺 EUR Avg</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff" }}>{formatEUR(card.prices.eurAvg)}</div>
                </div>
              )}
              {card.prices.usdMarket != null && (
                <div>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>🇺🇸 USD Market</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff" }}>{formatUSD(card.prices.usdMarket)}</div>
                </div>
              )}
            </div>
            {card.prices.allTimeHigh != null && (
              <div className="mt-3 rounded-lg px-3 py-2" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <span style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "#F59E0B" }}>🏆 All-Time High: {isUsd ? formatUSD(card.prices.allTimeHigh) : formatEUR(card.prices.allTimeHigh)}</span>
              </div>
            )}
          </div>

          {/* Chart */}
          {card.priceHistory.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "#18181B" }}>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>12-Month Price Trend</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={card.priceHistory}>
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} width={40} tickFormatter={v => isUsd ? `$${v}` : `€${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 11 }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                    formatter={(v: number) => [isUsd ? formatUSD(v) : formatEUR(v), "Price"]}
                  />
                  <Line type="monotone" dataKey="price" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grading */}
          <div className="rounded-xl p-4" style={{ background: "#18181B" }}>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Grading Estimates</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {card.prices.psa10 != null && (
                <div className="rounded-lg px-3 py-2" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(34,197,94,0.7)" }}>PSA 10</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#22C55E" }}>{isUsd ? formatUSD(card.prices.psa10) : formatEUR(card.prices.psa10)}</div>
                </div>
              )}
              {card.prices.psa9 != null && (
                <div className="rounded-lg px-3 py-2" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(59,130,246,0.7)" }}>PSA 9</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#3B82F6" }}>{isUsd ? formatUSD(card.prices.psa9) : formatEUR(card.prices.psa9)}</div>
                </div>
              )}
              {card.prices.cgc10 != null && (
                <div className="rounded-lg px-3 py-2" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(168,85,247,0.7)" }}>CGC 10</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#A855F7" }}>{isUsd ? formatUSD(card.prices.cgc10) : formatEUR(card.prices.cgc10)}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>PSA Population Est.</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{estimatePop(card.prices.psa10)}</div>
              </div>
              <a href="https://www.psacard.com/cert/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "#FCAB20", textDecoration: "none", letterSpacing: "0.05em" }}>
                Search PSA Registry →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
