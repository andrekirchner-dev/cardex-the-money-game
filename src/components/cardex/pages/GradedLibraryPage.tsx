import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCollection } from "@/hooks/useFirestore";
import type { CollectionCard } from "@/lib/firestore";

type SortKey = "grade" | "value" | "name";

function gradeColor(score: number | undefined): string {
  if (!score) return "rgba(255,255,255,0.3)";
  if (score >= 9) return "#B8E10D";
  if (score >= 8) return "#FCAB20";
  if (score >= 7) return "#F56438";
  return "#E7363C";
}

function GradedCard({ card, isLast }: { card: CollectionCard; isLast: boolean }) {
  const price = card.currentPrice ?? card.purchasePrice;
  const gc = gradeColor(card.gradeScore);

  return (
    <div className="flex items-center gap-3" style={{ padding: "13px 0", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 46, height: 64, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {card.imageUrl
          ? <img src={card.imageUrl} alt={card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 20 }}>🃏</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {card.name}
        </div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
          {card.game} · {card.setName || "—"}
        </div>
        {price != null && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2, letterSpacing: "0.02em" }}>
            {card.currency === "BRL" ? "R$" : card.currency === "EUR" ? "€" : "$"}{price.toFixed(2)}
          </div>
        )}
      </div>

      {/* Grade badge */}
      <div className="flex-shrink-0 text-center" style={{ width: 56 }}>
        <div className="rounded-[8px] px-2 py-2" style={{ background: `${gc}15`, border: `1px solid ${gc}40` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: gc, lineHeight: 1, letterSpacing: "0.02em" }}>
            {card.gradeScore ?? "—"}
          </div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 7, color: gc, letterSpacing: "0.1em", opacity: 0.75, marginTop: 2 }}>
            {card.gradeCompany ?? "PSA"}
          </div>
        </div>
      </div>
    </div>
  );
}

const GradedLibraryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();
  const { cards, loading } = useCollection(user?.uid ?? null);
  const [sortKey, setSortKey] = useState<SortKey>("grade");

  const graded = useMemo(() => {
    const g = cards.filter(c => c.isGraded);
    return [...g].sort((a, b) => {
      if (sortKey === "grade") return (b.gradeScore ?? 0) - (a.gradeScore ?? 0);
      if (sortKey === "value") return ((b.currentPrice ?? b.purchasePrice ?? 0) - (a.currentPrice ?? a.purchasePrice ?? 0));
      return a.name.localeCompare(b.name);
    });
  }, [cards, sortKey]);

  const totalGradedValue = graded.reduce((s, c) => s + (c.currentPrice ?? c.purchasePrice ?? 0), 0);
  const avgGrade = graded.length > 0
    ? graded.reduce((s, c) => s + (c.gradeScore ?? 0), 0) / graded.length
    : 0;

  const SORTS: { id: SortKey; label: string }[] = [
    { id: "grade", label: "Grade" },
    { id: "value", label: "Value" },
    { id: "name",  label: "A–Z"  },
  ];

  return (
    <div>
      <button onClick={() => onNavigate("home")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> HOME
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Certified</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>GRADED CARDS</h1>

      {/* Stats row */}
      {!loading && graded.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Slabs",   val: String(graded.length) },
            { label: "Avg Grade", val: avgGrade.toFixed(1)  },
            { label: "Value",   val: `$${totalGradedValue.toFixed(0)}` },
          ].map(s => (
            <div key={s.label} className="rounded-[12px] p-3 text-center" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#FCAB20", letterSpacing: "0.02em" }}>{s.val}</div>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sort chips */}
      {graded.length > 0 && (
        <div className="flex gap-2 mb-3">
          {SORTS.map(s => (
            <button key={s.id} onClick={() => setSortKey(s.id)}
              style={{
                padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.06em",
                background: sortKey === s.id ? "rgba(252,171,32,0.18)" : "rgba(255,255,255,0.05)",
                color: sortKey === s.id ? "#FCAB20" : "rgba(255,255,255,0.4)",
                border: sortKey === s.id ? "1px solid rgba(252,171,32,0.3)" : "1px solid transparent",
                transition: "all 0.15s",
              }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} style={{ height: 72, borderRadius: 8, marginBottom: 8, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))
        ) : graded.length === 0 ? (
          <div className="text-center py-10">
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No graded cards yet</div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 16 }}>
              Mark cards as graded when adding to your collection
            </div>
            <button onClick={() => onNavigate("scanner")}
              style={{ background: "linear-gradient(135deg,#B8E10D,#59AC99)", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#000", cursor: "pointer", letterSpacing: "0.04em" }}>
              📷 Scan &amp; Grade
            </button>
          </div>
        ) : (
          graded.map((card, i) => (
            <GradedCard key={card.id ?? i} card={card} isLast={i === graded.length - 1} />
          ))
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default GradedLibraryPage;
