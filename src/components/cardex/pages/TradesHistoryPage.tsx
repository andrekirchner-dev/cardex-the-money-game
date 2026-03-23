const trades = [
  { id: 1, date: "Mar 15, 2026", yours: "Charizard VMAX", theirs: "Blue-Eyes White Dragon", yourVal: 485, theirVal: 320, emoji1: "🔥", emoji2: "🐉" },
  { id: 2, date: "Mar 8, 2026", yours: "Pikachu V", theirs: "Dark Magician", yourVal: 45, theirVal: 180, emoji1: "⚡", emoji2: "🧙" },
  { id: 3, date: "Feb 28, 2026", yours: "Mewtwo GX", theirs: "Luffy Leader", yourVal: 120, theirVal: 180, emoji1: "🔮", emoji2: "🏴‍☠️" },
  { id: 4, date: "Feb 14, 2026", yours: "Blastoise EX", theirs: "Shanks SR", yourVal: 280, theirVal: 420, emoji1: "🐢", emoji2: "⚔️" },
  { id: 5, date: "Jan 30, 2026", yours: "Rayquaza VMAX", theirs: "Exodia Head", yourVal: 350, theirVal: 300, emoji1: "🐲", emoji2: "💀" },
];

const TradesHistoryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div>
      <button onClick={() => onNavigate("profile")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> PROFILE
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>History</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>TRADES</h1>

      {trades.map((t) => {
        const diff = t.yourVal - t.theirVal;
        const favorable = diff >= 0;
        return (
          <div key={t.id} className="rounded-[14px] p-[14px] mb-[10px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>{t.date}</span>
              <span className="inline-flex items-center rounded-[4px]" style={{
                padding: "2px 8px", fontFamily: "var(--font-tech)", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em",
                background: favorable ? "rgba(89,172,153,0.15)" : "rgba(231,54,60,0.15)",
                color: favorable ? "#59AC99" : "#E7363C",
                border: `1px solid ${favorable ? "rgba(89,172,153,0.25)" : "rgba(231,54,60,0.25)"}`,
              }}>{favorable ? "FAVORABLE" : "UNFAVORABLE"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span style={{ fontSize: 20 }}>{t.emoji1}</span>
                <div className="min-w-0">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.yours}</div>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>${t.yourVal}</div>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#FCAB20", letterSpacing: "0.1em" }}>→</div>
              <div className="flex items-center gap-2 flex-1">
                <span style={{ fontSize: 20 }}>{t.emoji2}</span>
                <div className="min-w-0">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.theirs}</div>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>${t.theirVal}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-right" style={{ fontFamily: "var(--font-display)", fontSize: 18, color: favorable ? "#59AC99" : "#E7363C", letterSpacing: "0.02em" }}>
              {diff >= 0 ? "+" : ""}${Math.abs(diff).toFixed(0)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TradesHistoryPage;
