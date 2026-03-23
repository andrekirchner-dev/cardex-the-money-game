import { usePokemonCards } from "@/hooks/useCardSearch";
import { getPokemonPrice, formatUSD, type PokemonCard } from "@/lib/api";

const mockGrades: Record<string, { grade: string; service: "PSA" | "BGS" | "CGC" }> = {};

function getGrade(card: PokemonCard) {
  if (!mockGrades[card.id]) {
    const seed = card.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const g = 7 + (seed % 30) / 10;
    mockGrades[card.id] = { grade: g.toFixed(1), service: seed % 3 === 0 ? "BGS" : seed % 3 === 1 ? "CGC" : "PSA" };
  }
  return mockGrades[card.id];
}

const GradedLibraryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { data, isLoading, isError } = usePokemonCards("charizard");
  const cards = data?.slice(0, 8) ?? [];

  return (
    <div>
      <button onClick={() => onNavigate("profile")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> PROFILE
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Certified</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>GRADED CARDS</h1>

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {isLoading ? Array.from({ length: 4 }, (_, i) => (
          <div key={i} style={{ height: 64, borderRadius: 8, marginBottom: 8, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        )) : isError ? (
          <div className="text-center py-6" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⚠️ Could not load graded cards.</div>
        ) : cards.map((card, i) => {
          const g = getGrade(card);
          const price = getPokemonPrice(card);
          const gradeNum = parseFloat(g.grade);
          const gradeColor = gradeNum >= 9 ? "#B8E10D" : gradeNum >= 8 ? "#FCAB20" : "#F56438";
          return (
            <div key={card.id} className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: i < cards.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div className="flex-shrink-0 overflow-hidden" style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {card.images?.small && <img src={card.images.small} alt={card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</div>
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{card.set?.name}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="rounded-[6px] px-2 py-1 text-center" style={{ background: `${gradeColor}15`, border: `1px solid ${gradeColor}40` }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: gradeColor, lineHeight: 1 }}>{g.grade}</div>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: 7, color: gradeColor, letterSpacing: "0.1em", opacity: 0.7 }}>{g.service}</div>
                </div>
                {price.usd != null && <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "#fff" }}>{formatUSD(price.usd)}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default GradedLibraryPage;
