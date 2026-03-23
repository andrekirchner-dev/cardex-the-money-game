import { useState, useMemo } from "react";
import { usePokemonCards, useScryfallCards, useMercadoLivrePrice, useYuGiOhCards, useOnePieceCards, useLorcanaCards } from "@/hooks/useCardSearch";
import { getPokemonPrice, getScryfallImage, getCardMarketPriceSummary, formatUSD, formatEUR, formatBRL, generatePriceHistory, type PokemonCard, type ScryfallCard, type MercadoLivreItem, type YuGiOhCard, type CardMarketTCGCard } from "@/lib/api";
import CardDetailModal, { type UnifiedCard } from "@/components/cardex/CardDetailModal";

type Category = "Pokémon" | "MTG" | "One Piece" | "Lorcana" | "Yu-Gi-Oh" | "Sports";
const categories: Category[] = ["Pokémon", "MTG", "One Piece", "Lorcana", "Yu-Gi-Oh", "Sports"];

const SPORTS_CARDS = [
  { id: "s1", name: "Mike Trout 2009 Bowman Chrome RC", set: "Bowman Chrome", image: "https://images.pokemontcg.io/base1/4_hires.png", priceUsd: 9800, priceEur: 9100, rarity: "PSA 10" },
  { id: "s2", name: "LeBron James 2003 Topps Chrome RC", set: "Topps Chrome", image: "https://images.pokemontcg.io/base1/5_hires.png", priceUsd: 7200, priceEur: 6700, rarity: "BGS 9.5" },
  { id: "s3", name: "Patrick Mahomes 2017 Panini Prizm RC", set: "Panini Prizm", image: "https://images.pokemontcg.io/base1/6_hires.png", priceUsd: 3400, priceEur: 3100, rarity: "PSA 10" },
  { id: "s4", name: "Michael Jordan 1986 Fleer RC", set: "Fleer", image: "https://images.pokemontcg.io/base1/7_hires.png", priceUsd: 18500, priceEur: 17200, rarity: "PSA 9" },
  { id: "s5", name: "Tom Brady 2000 Playoff Contenders RC", set: "Playoff Contenders", image: "https://images.pokemontcg.io/base1/8_hires.png", priceUsd: 4100, priceEur: 3800, rarity: "PSA 10" },
  { id: "s6", name: "Shohei Ohtani 2018 Topps Chrome RC", set: "Topps Chrome", image: "https://images.pokemontcg.io/base1/9_hires.png", priceUsd: 1200, priceEur: 1100, rarity: "PSA 10" },
  { id: "s7", name: "Luka Doncic 2018 Prizm Silver RC", set: "Panini Prizm", image: "https://images.pokemontcg.io/base1/10_hires.png", priceUsd: 2800, priceEur: 2600, rarity: "PSA 10" },
  { id: "s8", name: "Connor McDavid 2015 Upper Deck Young Guns", set: "Upper Deck", image: "https://images.pokemontcg.io/base1/11_hires.png", priceUsd: 950, priceEur: 880, rarity: "PSA 10" },
];

const tileBase: React.CSSProperties = { background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", transition: "transform 0.15s, box-shadow 0.15s" };
const hover = {
  onMouseEnter: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; },
  onMouseLeave: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; },
};

function CardSkeleton() { return (<div className="rounded-[14px] overflow-hidden" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}><div style={{ height: 90, background: "linear-gradient(90deg,#1C1C28 25%,#252535 50%,#1C1C28 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} /><div className="p-3"><div style={{ height: 10, width: "80%", borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 6 }} /><div style={{ height: 8, width: "50%", borderRadius: 4, background: "rgba(255,255,255,0.04)", marginBottom: 8 }} /><div style={{ height: 14, width: "40%", borderRadius: 4, background: "rgba(255,255,255,0.06)" }} /></div></div>); }

// Normalizers
function pokemonToUnified(card: PokemonCard): UnifiedCard {
  const { usd, eur } = getPokemonPrice(card);
  return { id: card.id, name: card.name, imageSmall: card.images?.small ?? "", imageLarge: card.images?.large ?? card.images?.small ?? "", game: "pokemon", set: card.set?.name ?? "", rarity: card.rarity, prices: { usdMarket: usd ?? undefined, eurAvg: eur ?? undefined }, priceHistory: generatePriceHistory(usd ?? eur ?? 5) };
}
function scryfallToUnified(card: ScryfallCard): UnifiedCard {
  const img = getScryfallImage(card) ?? "";
  const usd = card.prices.usd ? parseFloat(card.prices.usd) : undefined;
  const eur = card.prices.eur ? parseFloat(card.prices.eur) : undefined;
  return { id: card.id, name: card.name, imageSmall: img, imageLarge: card.image_uris?.large ?? img, game: "mtg", set: card.set_name, rarity: card.rarity, prices: { usdMarket: usd, eurAvg: eur }, priceHistory: generatePriceHistory(usd ?? eur ?? 3) };
}
function yugiohToUnified(card: YuGiOhCard): UnifiedCard {
  const img = card.card_images?.[0]?.image_url_small ?? "";
  const imgL = card.card_images?.[0]?.image_url ?? img;
  const usd = card.card_prices?.[0]?.tcgplayer_price ? parseFloat(card.card_prices[0].tcgplayer_price) : undefined;
  const eur = card.card_prices?.[0]?.cardmarket_price ? parseFloat(card.card_prices[0].cardmarket_price) : undefined;
  const sets = card.card_sets?.map(s => s.set_name) ?? [];
  return { id: String(card.id), name: card.name, imageSmall: img, imageLarge: imgL, game: "yugioh", set: sets[0] ?? "Yu-Gi-Oh!", rarity: card.card_sets?.[0]?.set_rarity, description: card.desc, reprints: sets.slice(1, 6), prices: { usdMarket: usd, eurAvg: eur }, priceHistory: generatePriceHistory(usd ?? eur ?? 2) };
}
function cmToUnified(card: CardMarketTCGCard, game: "onepiece" | "lorcana"): UnifiedCard {
  const p = getCardMarketPriceSummary(card);
  return { id: String(card.id), name: card.name, imageSmall: card.image ?? "", imageLarge: card.image ?? "", game, set: card.episode?.name ?? "", number: card.card_number ?? undefined, rarity: card.rarity ?? undefined, artist: card.artist?.name, prices: { eurAvg: p.eur_avg ?? undefined, usdMarket: p.usd_market ?? undefined, psa10: p.psa10 ?? undefined, psa9: p.psa9 ?? undefined, cgc10: p.cgc10 ?? undefined }, priceHistory: generatePriceHistory(p.eur_avg ?? p.usd_market ?? 3) };
}
function sportsToUnified(card: typeof SPORTS_CARDS[0]): UnifiedCard {
  return { id: card.id, name: card.name, imageSmall: card.image, imageLarge: card.image, game: "sports", set: card.set, rarity: card.rarity, prices: { usdMarket: card.priceUsd, eurAvg: card.priceEur }, priceHistory: generatePriceHistory(card.priceUsd) };
}

// Tiles
function PokemonTile({ card, onClick }: { card: PokemonCard; onClick: () => void }) {
  const { usd, eur } = getPokemonPrice(card);
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover} onClick={onClick}>
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

function ScryfallTile({ card, onClick }: { card: ScryfallCard; onClick: () => void }) {
  const usd = card.prices.usd ? parseFloat(card.prices.usd) : null;
  const eur = card.prices.eur ? parseFloat(card.prices.eur) : null;
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover} onClick={onClick}>
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

function YuGiOhTile({ card, onClick }: { card: YuGiOhCard; onClick: () => void }) {
  const img = card.card_images?.[0]?.image_url_small;
  const usd = card.card_prices?.[0]?.tcgplayer_price ? parseFloat(card.card_prices[0].tcgplayer_price) : null;
  const eur = card.card_prices?.[0]?.cardmarket_price ? parseFloat(card.card_prices[0].cardmarket_price) : null;
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover} onClick={onClick}>
      <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 90, background: "rgba(255,255,255,0.03)" }}>
        {img ? <img src={img} alt={card.name} loading="lazy" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 34 }}>🃏</span>}
      </div>
      <div className="p-3">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{card.type}</div>
        <div className="flex flex-col gap-[2px]">
          {usd != null && usd > 0 && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇺🇸</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatUSD(usd)}</span></div>}
          {eur != null && eur > 0 && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇪🇺</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatEUR(eur)}</span></div>}
        </div>
      </div>
    </div>
  );
}

function CardMarketGameTile({ card, game, onClick }: { card: CardMarketTCGCard; game: "onepiece" | "lorcana"; onClick: () => void }) {
  const p = getCardMarketPriceSummary(card);
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover} onClick={onClick}>
      <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 90, background: "rgba(255,255,255,0.03)" }}>
        {card.image ? <img src={card.image} alt={card.name} loading="lazy" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 34 }}>🃏</span>}
        {card.rarity && <div className="absolute top-1 right-1 rounded px-1" style={{ fontFamily: "var(--font-tech)", fontSize: 7, background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.45)" }}>{card.rarity.toUpperCase().slice(0, 5)}</div>}
      </div>
      <div className="p-3">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{card.episode?.name ?? (game === "onepiece" ? "One Piece" : "Lorcana")}</div>
        <div className="flex flex-col gap-[2px]">
          {p.usd_market != null && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇺🇸</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatUSD(p.usd_market)}</span></div>}
          {p.eur_avg != null && <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇪🇺</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatEUR(p.eur_avg)}</span></div>}
        </div>
      </div>
    </div>
  );
}

function SportsTile({ card, onClick }: { card: typeof SPORTS_CARDS[0]; onClick: () => void }) {
  return (
    <div className="rounded-[14px] cursor-pointer overflow-hidden" style={tileBase} {...hover} onClick={onClick}>
      <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 90, background: "rgba(255,255,255,0.03)" }}>
        <img src={card.image} alt={card.name} loading="lazy" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
        <div className="absolute top-1 right-1 rounded px-1" style={{ fontFamily: "var(--font-tech)", fontSize: 7, background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.45)" }}>{card.rarity}</div>
      </div>
      <div className="p-3">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{card.name}</div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{card.set}</div>
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇺🇸</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatUSD(card.priceUsd)}</span></div>
          <div className="flex items-center gap-[3px]"><span style={{ fontSize: 9 }}>🇪🇺</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{formatEUR(card.priceEur)}</span></div>
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
  const [selectedCard, setSelectedCard] = useState<UnifiedCard | null>(null);

  const isPokemon = activeCat === "Pokémon";
  const isMTG = activeCat === "MTG";
  const isYuGiOh = activeCat === "Yu-Gi-Oh";
  const isOnePiece = activeCat === "One Piece";
  const isLorcana = activeCat === "Lorcana";
  const isSports = activeCat === "Sports";
  const activeQ = searchInput.trim().length >= 2 ? searchInput.trim() : "";

  const pokemonQ = usePokemonCards(isPokemon ? activeQ : "");
  const scryfallQ = useScryfallCards(isMTG ? activeQ : "");
  const yugiohQ = useYuGiOhCards(isYuGiOh ? activeQ : "");
  const onepieceQ = useOnePieceCards(isOnePiece ? activeQ : "");
  const lorcanaQ = useLorcanaCards(isLorcana ? activeQ : "");

  const isLoading = (isPokemon && pokemonQ.isLoading) || (isMTG && scryfallQ.isLoading) || (isYuGiOh && yugiohQ.isLoading) || (isOnePiece && onepieceQ.isLoading) || (isLorcana && lorcanaQ.isLoading);
  const mlQuery = activeQ && isPokemon ? `${activeQ} pokemon` : "";

  const gridContent = useMemo(() => {
    // Sports always shows
    if (isSports) {
      return SPORTS_CARDS.map(c => <SportsTile key={c.id} card={c} onClick={() => setSelectedCard(sportsToUnified(c))} />);
    }

    if (!activeQ) return null;

    const skeleton = Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />);
    const noResults = [<div key="e" className="col-span-2 text-center py-8"><div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div><div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "rgba(255,255,255,0.4)" }}>SEM RESULTADOS</div></div>];
    const errorEl = [<div key="e" className="col-span-2 text-center py-8"><div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div><div style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Erro ao buscar</div></div>];

    if (isPokemon) {
      if (pokemonQ.isLoading) return skeleton;
      if (pokemonQ.isError) return errorEl;
      if (!pokemonQ.data?.length) return noResults;
      return pokemonQ.data.map(c => <PokemonTile key={c.id} card={c} onClick={() => setSelectedCard(pokemonToUnified(c))} />);
    }
    if (isMTG) {
      if (scryfallQ.isLoading) return skeleton;
      if (scryfallQ.isError) return errorEl;
      if (!scryfallQ.data?.length) return noResults;
      return scryfallQ.data.map(c => <ScryfallTile key={c.id} card={c} onClick={() => setSelectedCard(scryfallToUnified(c))} />);
    }
    if (isYuGiOh) {
      if (yugiohQ.isLoading) return skeleton;
      if (yugiohQ.isError) return errorEl;
      if (!yugiohQ.data?.length) return noResults;
      return yugiohQ.data.map(c => <YuGiOhTile key={c.id} card={c} onClick={() => setSelectedCard(yugiohToUnified(c))} />);
    }
    if (isOnePiece) {
      if (onepieceQ.isLoading) return skeleton;
      if (onepieceQ.isError) return errorEl;
      if (!onepieceQ.data?.length) return noResults;
      return onepieceQ.data.map(c => <CardMarketGameTile key={c.id} card={c} game="onepiece" onClick={() => setSelectedCard(cmToUnified(c, "onepiece"))} />);
    }
    if (isLorcana) {
      if (lorcanaQ.isLoading) return skeleton;
      if (lorcanaQ.isError) return errorEl;
      if (!lorcanaQ.data?.length) return noResults;
      return lorcanaQ.data.map(c => <CardMarketGameTile key={c.id} card={c} game="lorcana" onClick={() => setSelectedCard(cmToUnified(c, "lorcana"))} />);
    }
    return null;
  }, [activeQ, activeCat, isPokemon, isMTG, isYuGiOh, isOnePiece, isLorcana, isSports, pokemonQ, scryfallQ, yugiohQ, onepieceQ, lorcanaQ]);

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

      {!activeQ && !isSports ? (
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

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default IndexPage;
