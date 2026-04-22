import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useFirestore";
import { usePokemonCards } from "@/hooks/useCardSearch";
import { getPokemonPrice, formatUSD, type PokemonCard } from "@/lib/api";
import type { WishlistItem } from "@/lib/firestore";

// ─── Card search result row (for adding to wishlist) ─────────────────────────
function SearchResultRow({ card, onAdd }: { card: PokemonCard; onAdd: (card: PokemonCard) => void }) {
  const price = getPokemonPrice(card);
  return (
    <div className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex-shrink-0 overflow-hidden" style={{ width: 38, height: 52, borderRadius: 5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {card.images?.small && <img src={card.images.small} alt={card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{card.set?.name ?? "Pokémon TCG"}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {price.usd != null && <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "#fff" }}>{formatUSD(price.usd)}</div>}
        <button onClick={() => onAdd(card)}
          style={{ background: "linear-gradient(135deg, #E7363C, #F56438)", border: "none", borderRadius: 6, padding: "4px 10px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
          + Add
        </button>
      </div>
    </div>
  );
}

// ─── Existing wishlist item row ──────────────────────────────────────────────
function WishlistItemRow({ item, onRemove }: { item: WishlistItem; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex-shrink-0 overflow-hidden" style={{ width: 42, height: 58, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 18 }}>🃏</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{item.setName} · {item.game}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-right">
        {item.targetPrice != null && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "#fff" }}>{formatUSD(item.targetPrice)}</div>
        )}
        <button onClick={() => item.id && onRemove(item.id)}
          style={{ background: "rgba(231,54,60,0.1)", border: "1px solid rgba(231,54,60,0.15)", borderRadius: 6, padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: 10, color: "#E7363C", cursor: "pointer" }}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
const WishlistPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();
  const { items, loading, addItem, removeItem } = useWishlist(user?.uid ?? null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: searchResults, isLoading: isSearching } = usePokemonCards(query);

  const handleSearch = () => {
    if (search.trim()) { setQuery(search.trim()); setShowSearch(true); }
  };

  const handleAdd = async (card: PokemonCard) => {
    const price = getPokemonPrice(card);
    await addItem({
      cardId: card.id,
      name: card.name,
      game: "pokemon",
      setName: card.set?.name ?? "Pokémon TCG",
      rarity: card.rarity,
      imageUrl: card.images?.small,
      targetPrice: price.usd ?? undefined,
      currency: "USD",
    });
    setShowSearch(false);
    setSearch("");
    setQuery("");
  };

  return (
    <div>
      <button onClick={() => onNavigate("home")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer"
        style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> HOME
      </button>

      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Want List</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>WISHLIST</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-[14px]">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Buscar carta (ex: Charizard)..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "10px 14px", color: "#fff",
            fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
          }}
        />
        <button onClick={handleSearch}
          style={{ background: "linear-gradient(135deg, #E7363C, #F56438)", border: "none", borderRadius: 10, padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.04em" }}>
          Buscar
        </button>
      </div>

      {/* Search results */}
      {showSearch && (
        <div className="rounded-[16px] p-[14px] mb-[14px]" style={{ background: "#12121A", border: "1px solid rgba(245,100,56,0.2)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "#F56438", textTransform: "uppercase" }}>Resultados</span>
            <button onClick={() => setShowSearch(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          {isSearching
            ? <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "12px 0" }}>Buscando...</div>
            : (searchResults?.slice(0, 5) ?? []).map(card => (
                <SearchResultRow key={card.id} card={card} onAdd={handleAdd} />
              ))
          }
        </div>
      )}

      {/* Wishlist items */}
      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <div key={i} style={{ height: 64, borderRadius: 8, marginBottom: 8, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            ))
          : items.length === 0
            ? <div className="text-center py-8" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                Sua wishlist está vazia.<br />
                <span style={{ fontSize: 10, opacity: 0.6 }}>Use a busca acima para adicionar cartas.</span>
              </div>
            : items.map(item => <WishlistItemRow key={item.id} item={item} onRemove={removeItem} />)
        }
      </div>

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default WishlistPage;
