import { usePokemonCards } from "@/hooks/useCardSearch";
import { getPokemonPrice, formatUSD, type PokemonCard } from "@/lib/api";

const wishlistQueries = ["mewtwo", "rayquaza", "gengar"];

function WishlistCard({ card }: { card: PokemonCard }) {
  const price = getPokemonPrice(card);
  return (
    <div className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex-shrink-0 overflow-hidden" style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {card.images?.small && <img src={card.images.small} alt={card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{card.set?.name ?? "Pokémon TCG"}</div>
      </div>
      <div className="text-right flex-shrink-0">
        {price.usd != null && <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff" }}>{formatUSD(price.usd)}</div>}
      </div>
    </div>
  );
}

const WishlistPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const q1 = usePokemonCards(wishlistQueries[0]);
  const q2 = usePokemonCards(wishlistQueries[1]);
  const q3 = usePokemonCards(wishlistQueries[2]);

  const isLoading = q1.isLoading || q2.isLoading || q3.isLoading;
  const cards = [...(q1.data?.slice(0, 2) ?? []), ...(q2.data?.slice(0, 2) ?? []), ...(q3.data?.slice(0, 2) ?? [])];

  return (
    <div>
      <button onClick={() => onNavigate("home")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> HOME
      </button>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Want List</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>WISHLIST</h1>

      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {isLoading ? Array.from({ length: 4 }, (_, i) => (
          <div key={i} style={{ height: 64, borderRadius: 8, marginBottom: 8, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        )) : cards.length === 0 ? (
          <div className="text-center py-8" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Your wishlist is empty</div>
        ) : cards.map(card => <WishlistCard key={card.id} card={card} />)}
      </div>

      <button className="w-full mt-[14px] inline-flex items-center justify-center gap-[7px] rounded-[10px] border-none cursor-pointer" style={{
        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
        background: "linear-gradient(135deg, #E7363C, #F56438)", color: "#fff",
        padding: "12px 20px", boxShadow: "0 4px 20px rgba(231,54,60,0.35)",
      }}>+ Add to Wishlist</button>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default WishlistPage;
