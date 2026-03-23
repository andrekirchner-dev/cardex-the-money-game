import { useState, useMemo } from "react";
import { usePokemonCards, useScryfallCards, useMercadoLivrePrice } from "@/hooks/useCardSearch";
import { getPokemonPrice, getScryfallImage, formatUSD, formatEUR, formatBRL, type PokemonCard, type ScryfallCard, type MercadoLivreItem } from "@/lib/api";

type Category = "Pokémon" | "MTG" | "Yu-Gi-Oh" | "Sports" | "One Piece";
const categories: Category[] = ["Pokémon", "MTG", "Yu-Gi-Oh", "Sports", "One Piece"];

const tileBase: React.CSSProperties = { background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", transition: "transform 0.15s, box-shadow 0.15s" };
const hover = {
  onMouseEnter: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; },
  onMouseLeave: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; },
};

function CardSkeleton() { return (<div className="rounded-[14px] overflow-hidden" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}><div style={{ height: 90, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} /><div className="p-3"><div style={{ height: 10, width: "80%", borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 6 }} /><div style={{ height: 8, width: "50%", borderRadius: 4, background: "rgba(255,255,255,0.04)", marginBottom: 8 }} /><div style={{ height: 14, width: "40%", borderRadius: 4, background: "rgba(255,255,255,0.06)" }} /></div></div>); }

function PokemonTile({ card }: { card: PokemonCard }) {
  const { usd, eur } = getPokemonPrice(card);
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover}>
      <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 90, background: "rgba(255,255,255,0.03)" }}>
        {card.images?.small ? <img src={card.images.small} alt={card.name} loading="lazy" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 34 }}>🃏</span>}
        {card.rarity && <div className="absolute top-1 right-1 rounded px-1" style={{ fontFamily: "var(--font-tech)", fontSize: 7, background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.45)" }}>{card.rarity.toUpperCase().slice(0, 5)}</div>}
      </div>
      <div className="p-3">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{card.set?.name ?? "Pokémon TCG"}</div>
        <div className="flex flex-col gap-[2px]">
          {usd != null && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇺🇸</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatUSD(usd)}</span></div>}
          {eur != null && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇪🇺</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatEUR(eur)}</span></div>}
        </div>
      </div>
    </div>
  );
}

function ScryfallTile({ card }: { card: ScryfallCard }) {
  const usd = card.prices.usd ? parseFloat(card.prices.usd) : null;
  const eur = card.prices.eur ? parseFloat(card.prices.eur) : null;
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover}>
      <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 90, background: "rgba(255,255,255,0.03)" }}>
        {getScryfallImage(card) ? <img src={getScryfallImage(card)} alt={card.name} loading="lazy" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 34 }}>🃏</span>}
      </div>
      <div className="p-3">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{card.set_name}</div>
        <div className="flex flex-col gap-[2px]">
          {usd != null && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇺🇸</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatUSD(usd)}</span></div>}
          {eur != null && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇪🇺</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatEUR(eur)}</span></div>}
        </div>
      </div>
    </div>
  );
}

function MLSection({ query }: { query: string }) {
  const { data, isLoading, isError } = useMercadoLivrePrice(query);
  if (!query) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-[6px] rounded-[6px] px-3 py-[5px]" style={{ background: "rgba(0,156,59,0.08)", border: "1px solid rgba(0,156,59,0.2)" }}>
          <span style={{ fontSize: 12 }}>🇧🇷</span>
          <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "#00C853", letterSpacing: "0.1em" }}>MERCADO LIVRE · BRL</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
      {!isLoading && data?.stats && (
        <div className="rounded-[12px] p-3 mb-3 flex items-center justify-between" style={{ background: "rgba(0,156,59,0.07)", border: "1px solid rgba(0,156,59,0.15)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Preço médio</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#00C853", letterSpacing: "0.04em", lineHeight: 1 }}>{formatBRL(data.stats.avg)}</div>
          </div>
          <div className="text-right">
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>A partir de</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>{formatBRL(data.stats.low)}</div>
          </div>
        </div>
      )}
      <div className="rounded-[14px] overflow-hidden" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {isLoading ? <div className="p-3">{Array.from({ length: 3 }, (_, i) => <div key={i} style={{ height: 48, borderRadius: 8, marginBottom: 6, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}</div>
          : isError ? <div className="text-center py-5" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⚠️ Erro ao buscar</div>
          : !data?.items.length ? <div className="text-center py-5" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Nenhum anúncio</div>
          : data.items.slice(0, 5).map((item: MercadoLivreItem, i: number) => (
            <a key={item.id} href={item.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 no-underline" style={{ padding: "10px 14px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none", display: "flex" }}>
              <div className="flex-shrink-0 overflow-hidden rounded-[6px]" style={{ width: 36, height: 36, background: "rgba(255,255,255,0.05)" }}>
                {item.thumbnail && <img src={item.thumbnail.replace("I.jpg", "O.jpg")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#00C853", flexShrink: 0 }}>{formatBRL(item.price)}</div>
            </a>
          ))}
      </div>
    </div>
  );
}

const IndexPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [activeCat, setActiveCat] = useState<Category>("Pokémon");
  const [searchInput, setSearchInput] = useState("");
  const isPokemon = activeCat === "Pokémon";
  const isMTG = activeCat === "MTG";
  const activeQ = searchInput.trim().length >= 2 ? searchInput.trim() : "";
  const pokemonQ = usePokemonCards(isPokemon ? activeQ : "");
  const scryfallQ = useScryfallCards(isMTG ? activeQ : "");
  const isLoading = (isPokemon && pokemonQ.isLoading) || (isMTG && scryfallQ.isLoading);
  const mlQuery = activeQ && isPokemon ? `${activeQ} pokemon` : "";

  const gridContent = useMemo(() => {
    if (!activeQ) return null;
    if (isPokemon) {
      if (pokemonQ.isLoading) return Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />);
      if (pokemonQ.isError) return [<div key="e" className="col-span-2 text-center py-8"><div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div><div style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Erro ao buscar</div></div>];
      if (!pokemonQ.data?.length) return [<div key="e" className="col-span-2 text-center py-8"><div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div><div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "rgba(255,255,255,0.4)" }}>SEM RESULTADOS</div></div>];
      return pokemonQ.data.map(c => <PokemonTile key={c.id} card={c} />);
    }
    if (isMTG) {
      if (scryfallQ.isLoading) return Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />);
      if (scryfallQ.isError) return [<div key="e" className="col-span-2 text-center py-8"><div style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⚠️ Erro</div></div>];
      if (!scryfallQ.data?.length) return [<div key="e" className="col-span-2 text-center py-8"><div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "rgba(255,255,255,0.4)" }}>SEM RESULTADOS</div></div>];
      return scryfallQ.data.map(c => <ScryfallTile key={c.id} card={c} />);
    }
    return [<div key="e" className="col-span-2 text-center py-8" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Busca para {activeCat} em breve</div>];
  }, [activeQ, activeCat, isPokemon, isMTG, pokemonQ, scryfallQ]);

  return (
    <div>
      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Card Search</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>INDEX</h1>

      <div className="relative mb-[14px]">
        <svg className="absolute left-[13px] top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        {isLoading && <div className="absolute right-[13px] top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(252,171,32,0.3)", borderTopColor: "#FCAB20", animation: "spin 0.7s linear infinite" }} />}
        <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="Search any card..."
          className="w-full rounded-[10px] outline-none"
          style={{ padding: "11px 14px 11px 40px", background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-tech)", fontSize: 12, color: "#fff", letterSpacing: "0.05em", transition: "border-color 0.2s" }} />
      </div>

      <div className="flex gap-[6px] overflow-x-auto mb-4 pb-[2px]" style={{ scrollbarWidth: "none" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => { setActiveCat(cat); setSearchInput(""); }} className="flex-shrink-0 cursor-pointer" style={{
            padding: "5px 14px", borderRadius: 6, fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
            background: activeCat === cat ? "#FCAB20" : "rgba(255,255,255,0.04)",
            color: activeCat === cat ? "#000" : "rgba(255,255,255,0.4)",
            border: `1px solid ${activeCat === cat ? "#FCAB20" : "rgba(255,255,255,0.07)"}`, transition: "all 0.15s",
          }}>{cat}</button>
        ))}
      </div>

      {!activeQ ? (
        <div className="text-center py-12">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>SEARCH ANY CARD</div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 6, letterSpacing: "0.08em" }}>Type at least 2 characters</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-[10px] mb-1">{gridContent}</div>
          {isPokemon && <MLSection query={mlQuery} />}
        </>
      )}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default IndexPage;
