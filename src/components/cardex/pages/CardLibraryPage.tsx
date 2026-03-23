import { usePokemonCards } from "@/hooks/useCardSearch";
import { getPokemonPrice, formatUSD, formatEUR, type PokemonCard } from "@/lib/api";

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3" style={{ padding: "11px 0" }}>
      <div style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", animation: "shimmer 1.5s infinite" }} />
      <div className="flex-1">
        <div style={{ height: 10, width: "70%", borderRadius: 4, background: "rgba(255,255,255,0.07)", marginBottom: 6 }} />
        <div style={{ height: 8, width: "50%", borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
      </div>
      <div style={{ height: 14, width: 50, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function CardRow({ card, isLast }: { card: PokemonCard; isLast: boolean }) {
  const price = getPokemonPrice(card);
  return (
    <div className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex-shrink-0 overflow-hidden" style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {card.images?.small && <img src={card.images.small} alt={card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{card.set?.name ?? "Pokémon TCG"}</div>
      </div>
      <div className="text-right flex-shrink-0">
        {price.usd != null && <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff", letterSpacing: "0.02em" }}>{formatUSD(price.usd)}</div>}
        {price.eur != null && <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{formatEUR(price.eur)}</div>}
      </div>
    </div>
  );
}

const CardLibraryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { data, isLoading, isError } = usePokemonCards("charizard");
  const cards = data?.slice(0, 12) ?? [];

  return (
    <div>
      <button onClick={() => onNavigate("profile")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> PROFILE
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Collection</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>CARD LIBRARY</h1>

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {isLoading ? Array.from({ length: 6 }, (_, i) => <div key={i} style={{ borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.07)" : "none" }}><RowSkeleton /></div>) :
          isError ? <div className="text-center py-6" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⚠️ Could not load cards.</div> :
          cards.map((card, i) => <CardRow key={card.id} card={card} isLast={i === cards.length - 1} />)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default CardLibraryPage;
