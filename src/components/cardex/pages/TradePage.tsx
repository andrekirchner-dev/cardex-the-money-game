import { useState } from "react";

const TradePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    setTradeSuccess(true);
    setTimeout(() => setTradeSuccess(false), 3000);
  };

  return (
    <div className="relative">
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Compare</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>TRADE CENTER</h1>

      {/* Your Card section */}
      <div className="flex items-center gap-2 mb-[10px]" style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Your Card<div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} /></div>
      <select className="w-full rounded-[10px] outline-none cursor-pointer mb-[10px]" style={{ padding: "11px 14px", background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em", appearance: "none" }}>
        <option>Select your card...</option><option>Charizard VMAX - PSA 10</option><option>Pikachu Illustrator - BGS 9.5</option>
      </select>

      <div className="rounded-[14px] p-[14px] mb-[10px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ fontSize: 36, width: 52, height: 52, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>🔥</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 3 }}>Charizard VMAX</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pokémon · PSA 10 · 2020</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", marginTop: 8, letterSpacing: "0.02em" }}>$485.00</div>
      </div>

      {/* VS Bar */}
      <div className="flex items-center gap-[10px] my-1 mb-3">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div style={{ background: "#3E446E", color: "#FCAB20", fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.1em", padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(252,171,32,0.2)" }}>VS</div>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Their Card */}
      <div className="flex items-center gap-2 mb-[10px]" style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Their Card<div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} /></div>
      <select className="w-full rounded-[10px] outline-none cursor-pointer mb-[10px]" style={{ padding: "11px 14px", background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em", appearance: "none" }}>
        <option>Select their card...</option><option>Blue-Eyes White Dragon - PSA 9</option><option>Black Lotus - BGS 8.5</option>
      </select>

      <div className="rounded-[14px] p-[14px] mb-[10px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ fontSize: 36, width: 52, height: 52, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>🐉</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 3 }}>Blue-Eyes White Dragon</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Yu-Gi-Oh · PSA 9 · 2002</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", marginTop: 8, letterSpacing: "0.02em" }}>$320.00</div>
      </div>

      {/* Verdict */}
      <div className="rounded-[14px] p-4 mt-1" style={{ background: "rgba(89,172,153,0.08)", border: "2px solid rgba(89,172,153,0.3)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: "0.04em", color: "#59AC99", marginBottom: 4 }}>FAVORABLE TRADE</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "0.02em", color: "#59AC99" }}>+$165.00</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.08em", color: "#59AC99", marginTop: 6, opacity: 0.7 }}>Your card holds 34% more value in current market</div>
      </div>

      {/* Success message */}
      {tradeSuccess && (
        <div className="rounded-[14px] p-4 mt-3 text-center" style={{ background: "rgba(89,172,153,0.15)", border: "2px solid rgba(89,172,153,0.4)" }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#59AC99", letterSpacing: "0.04em" }}>TRADE PROPOSED!</div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(89,172,153,0.7)", marginTop: 4, letterSpacing: "0.06em" }}>Waiting for response...</div>
        </div>
      )}

      <div className="flex gap-2 mt-[14px]">
        <button onClick={() => setShowModal(true)} className="flex-1 inline-flex items-center justify-center gap-[7px] rounded-[10px] border-none cursor-pointer" style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
          background: "linear-gradient(135deg, #E7363C, #F56438)", color: "#fff", padding: "12px 20px", boxShadow: "0 4px 20px rgba(231,54,60,0.35)",
        }}>Propose Trade</button>
        <button className="inline-flex items-center justify-center gap-[7px] rounded-[10px] cursor-pointer" style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
          background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", padding: "11px 16px", border: "1px solid rgba(255,255,255,0.07)",
        }}>Reset</button>
      </div>

      {/* Trade Confirmation Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-[20px] p-5 mx-4 w-full" style={{ background: "linear-gradient(160deg, #1e1e2e 0%, #12121A 100%)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="text-center mb-4" style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#FCAB20", letterSpacing: "0.04em" }}>CONFIRM TRADE</div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <div style={{ fontSize: 28, marginBottom: 4 }}>🔥</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>Charizard VMAX</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff", marginTop: 2 }}>$485</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#FCAB20", letterSpacing: "0.1em" }}>→</div>
              <div className="text-center flex-1">
                <div style={{ fontSize: 28, marginBottom: 4 }}>🐉</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>Blue-Eyes W.D.</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff", marginTop: 2 }}>$320</div>
              </div>
            </div>

            <div className="rounded-[10px] p-3 mb-4 text-center" style={{ background: "rgba(89,172,153,0.1)", border: "1px solid rgba(89,172,153,0.2)" }}>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 2 }}>VALUE DIFFERENCE</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#59AC99" }}>+$165.00</div>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "#59AC99", opacity: 0.7, marginTop: 2 }}>FAVORABLE FOR YOU</div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleConfirm} className="flex-1 rounded-[10px] border-none cursor-pointer" style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
                background: "linear-gradient(135deg, #59AC99, #B8E10D)", color: "#000", padding: "12px 16px",
              }}>Confirm</button>
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-[10px] cursor-pointer" style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.07)",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradePage;
