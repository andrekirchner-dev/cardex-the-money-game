// ============================================================
// CarDex – Hooks de Busca de Cartas
// ============================================================
// TanStack Query gerencia:
//   ✅ Cache (5 min stale, 30 min memória)
//   ✅ Deduplicação de requests
//   ✅ Retry automático
//   ✅ Loading / error states
// ============================================================

import { useQuery } from "@tanstack/react-query";
import {
  searchPokemonCards,
  getFeaturedPokemonCards,
  searchScryfallCards,
  searchTCGDexCards,
  searchMercadoLivre,
  searchPokeTrace,
  searchCardMarketCards,
  getCardMarketEpisodeCards,
  calcMLStats,
  type PokemonCard,
  type ScryfallCard,
  type TCGDexCard,
  type CardMarketTCGCard,
} from "@/lib/api";
import { useDebounce } from "./useDebounce";

const STALE = 5  * 60 * 1_000;
const GC    = 30 * 60 * 1_000;

const HAS_CM_KEY = !!import.meta.env.VITE_CARDMARKET_RAPIDAPI_KEY;

// ──────────────────────────────────────────────────────────────
// POKÉMON TCG
// ──────────────────────────────────────────────────────────────

export function usePokemonCards(query: string) {
  const q = useDebounce(query.trim(), 400);
  return useQuery<PokemonCard[]>({
    queryKey: ["pokemon", "search", q],
    queryFn: () => searchPokemonCards(q),
    enabled: q.length >= 2,
    staleTime: STALE,
    gcTime: GC,
    retry: 2,
  });
}

export function useFeaturedPokemonCards() {
  return useQuery<PokemonCard[]>({
    queryKey: ["pokemon", "featured"],
    queryFn: getFeaturedPokemonCards,
    staleTime: 15 * 60 * 1_000,
    gcTime: 60 * 60 * 1_000,
    retry: 2,
  });
}

// ──────────────────────────────────────────────────────────────
// SCRYFALL (MTG) — preços USD + EUR nativos
// ──────────────────────────────────────────────────────────────

export function useScryfallCards(query: string) {
  const q = useDebounce(query.trim(), 400);
  return useQuery<ScryfallCard[]>({
    queryKey: ["scryfall", "search", q],
    queryFn: () => searchScryfallCards(q),
    enabled: q.length >= 2,
    staleTime: STALE,
    gcTime: GC,
    retry: 2,
  });
}

// ──────────────────────────────────────────────────────────────
// TCGDEX
// ──────────────────────────────────────────────────────────────

export function useTCGDexCards(query: string) {
  const q = useDebounce(query.trim(), 400);
  return useQuery<TCGDexCard[]>({
    queryKey: ["tcgdex", "search", q],
    queryFn: () => searchTCGDexCards(q),
    enabled: q.length >= 2,
    staleTime: STALE,
    gcTime: GC,
    retry: 2,
  });
}

// ──────────────────────────────────────────────────────────────
// MERCADO LIVRE 🇧🇷 — preços em BRL sem autenticação
// ──────────────────────────────────────────────────────────────

export function useMercadoLivrePrice(query: string) {
  const q = useDebounce(query.trim(), 600);
  return useQuery({
    queryKey: ["mercadolivre", q],
    queryFn: async () => {
      const items = await searchMercadoLivre(q, 12);
      return { items, stats: calcMLStats(items) };
    },
    enabled: q.length >= 3,
    staleTime: 10 * 60 * 1_000,
    gcTime: GC,
    retry: 1,
  });
}

// ──────────────────────────────────────────────────────────────
// POKETRACE 🔵 (opcional — precisa de key)
// ──────────────────────────────────────────────────────────────

export function usePokeTrace(query: string) {
  const q = useDebounce(query.trim(), 500);
  return useQuery({
    queryKey: ["poketrace", q],
    queryFn: () => searchPokeTrace(q),
    enabled: q.length >= 2,
    staleTime: STALE,
    gcTime: GC,
    retry: 1,
  });
}

// ──────────────────────────────────────────────────────────────
// CARDMARKET TCG (via RapidAPI) 🇪🇺
// Preços EUR por país (ES, DE, FR, IT) + USD + PSA/CGC graded
// Requer: VITE_CARDMARKET_RAPIDAPI_KEY
// ──────────────────────────────────────────────────────────────

export function useCardMarketSearch(
  query: string,
  game: "pokemon" | "magic" | "lorcana" | "star-wars" = "pokemon"
) {
  const q = useDebounce(query.trim(), 400);
  return useQuery<CardMarketTCGCard[]>({
    queryKey: ["cardmarket", game, "search", q],
    queryFn: () => searchCardMarketCards(q, game),
    enabled: q.length >= 2 && HAS_CM_KEY,
    staleTime: STALE,
    gcTime: GC,
    retry: 1,
  });
}

export function useCardMarketEpisode(
  episodeId: number | null,
  game: "pokemon" | "magic" | "lorcana" | "star-wars" = "pokemon"
) {
  return useQuery<CardMarketTCGCard[]>({
    queryKey: ["cardmarket", game, "episode", episodeId],
    queryFn: () => getCardMarketEpisodeCards(episodeId!, game),
    enabled: episodeId != null && HAS_CM_KEY,
    staleTime: 15 * 60 * 1_000,
    gcTime: GC,
    retry: 1,
  });
}

// ──────────────────────────────────────────────────────────────
// HOOK PRINCIPAL DO MARKET — agrega todas as fontes
// ──────────────────────────────────────────────────────────────

export type MarketCategory =
  | "All" | "Pokémon" | "Yu-Gi-Oh" | "MTG" | "Sports" | "One Piece";

export function useMarketSearch(query: string, category: MarketCategory) {
  const q = query.trim();
  const activeQ = q.length >= 2 ? q : "";

  const isPokemon = category === "All" || category === "Pokémon";
  const isMTG     = category === "MTG";

  const pokemonResult  = usePokemonCards(isPokemon ? (activeQ || "charizard") : "");
  const scryfallResult = useScryfallCards(isMTG ? (activeQ || "black lotus") : "");

  // CardMarket: pokémon ou magic dependendo da categoria
  const cmGame = isMTG ? "magic" : "pokemon";
  const cmResult = useCardMarketSearch(
    activeQ || (isPokemon ? "charizard" : isMTG ? "black lotus" : ""),
    cmGame
  );

  // Mercado Livre roda para todas as categorias com busca ativa
  const mlQuery =
    activeQ
      ? activeQ + (isPokemon ? " pokemon" : isMTG ? " magic" : " carta")
      : isPokemon ? "charizard pokemon" : isMTG ? "magic the gathering black lotus" : "";
  const mlResult = useMercadoLivrePrice(mlQuery);

  return { pokemonResult, scryfallResult, cmResult, mlResult };
}
