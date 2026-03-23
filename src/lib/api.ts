// ============================================================
// CarDex – API Service Layer
// ============================================================
// APIs integradas:
//   🟡 Pokémon TCG    – pokemontcg.io        (grátis, key opcional)
//   🟣 Scryfall       – scryfall.com/docs/api (grátis, sem key – MTG)
//   🟢 TCGDex         – tcgdex.net            (grátis, sem key)
//   🇧🇷 Mercado Livre  – mercadolibre.com      (grátis, sem key)
//   🔵 PokeTrace      – poketrace.com         (grátis 250/dia, key opcional)
// ============================================================

// ──────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────

export interface PokemonCard {
  id: string;
  name: string;
  images: { small: string; large: string };
  set: { name: string; series: string };
  rarity?: string;
  cardmarket?: {
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
    };
  };
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      normal?: { market?: number };
      reverseHolofoil?: { market?: number };
    };
  };
}

export interface ScryfallCard {
  id: string;
  name: string;
  set_name: string;
  set: string;
  rarity: string;
  image_uris?: { small: string; normal: string; large: string };
  card_faces?: Array<{ image_uris?: { small: string; normal: string } }>;
  prices: {
    usd?: string | null;
    usd_foil?: string | null;
    eur?: string | null;
    eur_foil?: string | null;
  };
  purchase_uris?: { tcgplayer?: string; cardmarket?: string };
}

export interface TCGDexCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  set?: { name: string; id: string };
  rarity?: string;
}

export interface MercadoLivreItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  condition: string;
  thumbnail: string;
  permalink: string;
  seller: { id: number; nickname?: string };
}

export interface MercadoLivreResponse {
  results: MercadoLivreItem[];
  paging: { total: number };
}

export interface PokeTraceCard {
  id: string;
  name: string;
  set: string;
  number: string;
  image?: string;
  tcgplayer?: { market?: number; low?: number };
  ebay?: { sold?: number; recent?: number };
  cardmarket?: { trend?: number; low?: number };
}

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, label: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`[${label}] HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function getPokemonPrice(card: PokemonCard): { usd: number | null; eur: number | null } {
  const usd =
    card.tcgplayer?.prices?.holofoil?.market ??
    card.tcgplayer?.prices?.normal?.market ??
    card.tcgplayer?.prices?.reverseHolofoil?.market ??
    null;
  const eur =
    card.cardmarket?.prices?.averageSellPrice ??
    card.cardmarket?.prices?.trendPrice ??
    null;
  return { usd, eur };
}

export function getScryfallImage(card: ScryfallCard): string | undefined {
  return (
    card.image_uris?.small ??
    card.card_faces?.[0]?.image_uris?.small
  );
}

export function formatUSD(v: number | null | undefined) {
  return v != null ? `$${v.toFixed(2)}` : null;
}
export function formatEUR(v: number | null | undefined) {
  return v != null ? `€${v.toFixed(2)}` : null;
}
export function formatBRL(v: number | null | undefined) {
  return v != null ? `R$${v.toFixed(2)}` : null;
}

// ──────────────────────────────────────────────────────────────
// POKÉMON TCG  (https://api.pokemontcg.io/v2)
// Preços: USD via TCGPlayer · EUR via CardMarket
// ──────────────────────────────────────────────────────────────

const POKEMON_BASE   = "https://api.pokemontcg.io/v2";
const POKEMON_FIELDS = "id,name,images,set,rarity,cardmarket,tcgplayer";

export async function searchPokemonCards(query: string, pageSize = 20): Promise<PokemonCard[]> {
  const apiKey = import.meta.env.VITE_POKEMON_TCG_API_KEY;
  const headers: Record<string, string> = apiKey ? { "X-Api-Key": apiKey } : {};
  const url = `${POKEMON_BASE}/cards?q=name:*${encodeURIComponent(query)}*&pageSize=${pageSize}&select=${POKEMON_FIELDS}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`[PokémonTCG] HTTP ${res.status}`);
  const data = await res.json();
  return (data.data ?? []) as PokemonCard[];
}

export async function getFeaturedPokemonCards(): Promise<PokemonCard[]> {
  return searchPokemonCards("charizard", 6);
}

// ──────────────────────────────────────────────────────────────
// SCRYFALL  (https://scryfall.com/docs/api)
// Substitui magicthegathering.io — grátis, sem key
// Preços: USD via TCGPlayer · EUR via CardMarket (1x/dia)
// ──────────────────────────────────────────────────────────────

const SCRYFALL_BASE = "https://api.scryfall.com";

export async function searchScryfallCards(query: string, pageSize = 20): Promise<ScryfallCard[]> {
  const q = encodeURIComponent(query);
  const data = await safeFetch<{ data: ScryfallCard[]; has_more: boolean }>(
    `${SCRYFALL_BASE}/cards/search?q=${q}&unique=cards&order=usd&page=1`,
    "Scryfall"
  );
  return (data.data ?? []).slice(0, pageSize);
}

export async function getScryfallCardByName(name: string): Promise<ScryfallCard | null> {
  try {
    return await safeFetch<ScryfallCard>(
      `${SCRYFALL_BASE}/cards/named?fuzzy=${encodeURIComponent(name)}`,
      "Scryfall"
    );
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────
// TCGDEX  (https://api.tcgdex.net/v2)
// ──────────────────────────────────────────────────────────────

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en";

export async function searchTCGDexCards(query: string): Promise<TCGDexCard[]> {
  const data = await safeFetch<TCGDexCard[]>(
    `${TCGDEX_BASE}/cards?name=${encodeURIComponent(query)}`,
    "TCGDex"
  );
  return Array.isArray(data) ? data.slice(0, 20) : [];
}

// ──────────────────────────────────────────────────────────────
// MERCADO LIVRE  (https://developers.mercadolivre.com.br)
// 🇧🇷  Preços em BRL — endpoint público, sem autenticação
// Site MLB = Brasil · MLA = Argentina · MLM = México
// ──────────────────────────────────────────────────────────────

const ML_BASE = "https://api.mercadolibre.com";

export async function searchMercadoLivre(
  query: string,
  limit = 10
): Promise<MercadoLivreItem[]> {
  const data = await safeFetch<MercadoLivreResponse>(
    `${ML_BASE}/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`,
    "MercadoLivre"
  );
  return data.results ?? [];
}

/**
 * Calcula estatísticas de preço BRL a partir dos resultados do ML.
 * Remove outliers grosseiros (itens 10x acima ou abaixo da mediana).
 */
export function calcMLStats(
  items: MercadoLivreItem[]
): { avg: number; low: number; count: number } | null {
  if (!items.length) return null;
  const prices = items.map((i) => i.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  const filtered = prices.filter((p) => p <= median * 10 && p >= median * 0.1);
  if (!filtered.length) return null;
  const avg = filtered.reduce((s, v) => s + v, 0) / filtered.length;
  return { avg, low: filtered[0], count: filtered.length };
}

// ──────────────────────────────────────────────────────────────
// POKETRACE  (https://poketrace.com/docs)
// 🔵  Grátis 250 calls/dia · Key → VITE_POKETRACE_API_KEY
// Agrega: TCGPlayer (🇺🇸) + eBay + CardMarket (🇪🇺)
// ──────────────────────────────────────────────────────────────

const POKETRACE_KEY  = import.meta.env.VITE_POKETRACE_API_KEY ?? "";
const POKETRACE_BASE = "https://api.poketrace.com/v1";

export async function searchPokeTrace(query: string): Promise<PokeTraceCard[] | null> {
  if (!POKETRACE_KEY) return null;
  return safeFetch<PokeTraceCard[]>(
    `${POKETRACE_BASE}/cards?name=${encodeURIComponent(query)}&limit=20`,
    "PokeTrace",
    { headers: { "X-API-Key": POKETRACE_KEY } }
  );
}

// ──────────────────────────────────────────────────────────────
// CARDMARKET API TCG (via RapidAPI)
// 🇪🇺  Preços reais do CardMarket em EUR por país (ES, DE, FR, IT)
//      + TCGPlayer USD + PSA/CGC graded
// Docs: https://rapidapi.com/tcggopro/api/cardmarket-api-tcg
// Key:  VITE_CARDMARKET_RAPIDAPI_KEY
// Free: 100 req/dia · 30 req/min
// ──────────────────────────────────────────────────────────────

const CM_BASE = "https://cardmarket-api-tcg.p.rapidapi.com";
const CM_KEY  = import.meta.env.VITE_CARDMARKET_RAPIDAPI_KEY ?? "";

const CM_HEADERS = {
  "x-rapidapi-host": "cardmarket-api-tcg.p.rapidapi.com",
  "x-rapidapi-key": CM_KEY,
  "Content-Type": "application/json",
};

// Tipo completo de uma carta retornada pelo CardMarket API TCG
export interface CardMarketTCGCard {
  id: string | number;
  name: string;
  name_numbered?: string;
  card_number?: string;
  rarity?: string;
  image?: string;
  episode?: { id: number; name: string; code?: string };
  artist?: { id: number; name: string };
  prices?: {
    cardmarket?: {
      currency: "EUR";
      avg?: number;
      low?: number;
      trend?: number;
      /** Preços por país europeu */
      de?: number;
      fr?: number;
      es?: number;    // 🇪🇸 Espanha
      it?: number;
      /** Foil / reverse */
      avg_foil?: number;
      low_foil?: number;
    };
    tcgplayer?: {
      currency: "USD";
      market?: number;
      low?: number;
      avg?: number;
      high?: number;
      market_foil?: number;
    };
    graded?: {
      psa_10?: number;
      psa_9?: number;
      psa_8?: number;
      cgc_10?: number;
      cgc_9?: number;
    };
  };
}

interface CMResponse {
  data: CardMarketTCGCard[];
  meta?: { total: number; page: number };
}

/**
 * Busca cartas Pokémon com preços do CardMarket (EUR) + TCGPlayer (USD).
 * game: "pokemon" | "magic" | "lorcana" | "star-wars"
 */
export async function searchCardMarketCards(
  query: string,
  game: "pokemon" | "magic" | "lorcana" | "star-wars" = "pokemon",
  limit = 20
): Promise<CardMarketTCGCard[]> {
  if (!CM_KEY) {
    console.warn("[CardMarket] API key não configurada → VITE_CARDMARKET_RAPIDAPI_KEY");
    return [];
  }
  const data = await safeFetch<CMResponse>(
    `${CM_BASE}/${game}/cards/search?name=${encodeURIComponent(query)}&limit=${limit}&sort=price_highest`,
    "CardMarket",
    { headers: CM_HEADERS }
  );
  return data.data ?? [];
}

/**
 * Busca cartas de um set/episódio específico no CardMarket.
 * Útil para mostrar todo o conjunto de um set ordenado por preço.
 */
export async function getCardMarketEpisodeCards(
  episodeId: number,
  game: "pokemon" | "magic" | "lorcana" | "star-wars" = "pokemon",
  sort: "price_highest" | "price_lowest" | "name" = "price_highest"
): Promise<CardMarketTCGCard[]> {
  if (!CM_KEY) return [];
  const data = await safeFetch<CMResponse>(
    `${CM_BASE}/${game}/episodes/${episodeId}/cards?sort=${sort}`,
    "CardMarket",
    { headers: CM_HEADERS }
  );
  return data.data ?? [];
}

/**
 * Extrai o melhor resumo de preços de uma carta do CardMarket.
 * Retorna valores formatados prontos para exibição.
 */
export function getCardMarketPriceSummary(card: CardMarketTCGCard) {
  const cm = card.prices?.cardmarket;
  const tcp = card.prices?.tcgplayer;
  const g = card.prices?.graded;
  return {
    // CardMarket EUR
    eur_avg:   cm?.avg    ?? cm?.trend ?? null,
    eur_low:   cm?.low    ?? null,
    eur_es:    cm?.es     ?? null,   // Espanha 🇪🇸
    eur_de:    cm?.de     ?? null,   // Alemanha 🇩🇪
    eur_fr:    cm?.fr     ?? null,   // França 🇫🇷
    eur_foil:  cm?.avg_foil ?? null,
    // TCGPlayer USD
    usd_market: tcp?.market ?? tcp?.avg ?? null,
    usd_low:    tcp?.low    ?? null,
    usd_foil:   tcp?.market_foil ?? null,
    // Graded
    psa10: g?.psa_10 ?? null,
    psa9:  g?.psa_9  ?? null,
    cgc10: g?.cgc_10 ?? null,
  };
}
