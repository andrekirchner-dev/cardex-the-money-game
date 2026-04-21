import { useState, useEffect, useCallback } from "react";
import {
  getCollection, addCardToCollection, removeCardFromCollection, updateCardInCollection,
  getWishlist, addToWishlist, removeFromWishlist,
  getTrades, addTrade, deleteTrade,
  calcCollectionStats,
  type CollectionCard, type WishlistItem, type Trade,
} from "@/lib/firestore";

export function useCollection(uid: string | null) {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!uid) { setCards([]); setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getCollection(uid);
      setCards(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const addCard = async (card: Omit<CollectionCard, "id" | "addedAt">) => {
    if (!uid) return;
    await addCardToCollection(uid, card);
    await load();
  };

  const updateCard = async (docId: string, data: Partial<CollectionCard>) => {
    if (!uid) return;
    await updateCardInCollection(uid, docId, data);
    await load();
  };

  const removeCard = async (docId: string) => {
    if (!uid) return;
    await removeCardFromCollection(uid, docId);
    await load();
  };

  const stats = calcCollectionStats(cards);
  return { cards, loading, error, stats, addCard, updateCard, removeCard, refresh: load };
}

export function useWishlist(uid: string | null) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const data = await getWishlist(uid);
    setItems(data);
    setLoading(false);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const addItem = async (item: Omit<WishlistItem, "id" | "addedAt">) => {
    if (!uid) return;
    await addToWishlist(uid, item);
    await load();
  };

  const removeItem = async (docId: string) => {
    if (!uid) return;
    await removeFromWishlist(uid, docId);
    await load();
  };

  return { items, loading, addItem, removeItem, refresh: load };
}

export function useTrades(uid: string | null) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) { setTrades([]); setLoading(false); return; }
    setLoading(true);
    const data = await getTrades(uid);
    setTrades(data);
    setLoading(false);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const addTradeFn = async (trade: Omit<Trade, "id" | "tradedAt">) => {
    if (!uid) return;
    await addTrade(uid, trade);
    await load();
  };

  const removeTrade = async (docId: string) => {
    if (!uid) return;
    await deleteTrade(uid, docId);
    await load();
  };

  return { trades, loading, addTrade: addTradeFn, removeTrade, refresh: load };
}
