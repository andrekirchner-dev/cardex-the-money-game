import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  setDoc, query, orderBy, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan: "free" | "pro";
  memberSince: string;
  createdAt?: Timestamp;
}

export interface CollectionCard {
  id?: string;
  cardId: string;
  name: string;
  game: "pokemon" | "magic" | "yugioh" | "onepiece" | "lorcana" | "other";
  setName: string;
  rarity?: string;
  imageUrl?: string;
  purchasePrice?: number;
  currentPrice?: number;
  currency?: "USD" | "BRL" | "EUR";
  isGraded?: boolean;
  gradeCompany?: string;
  gradeScore?: number;
  addedAt?: Timestamp;
}

export interface WishlistItem {
  id?: string;
  cardId: string;
  name: string;
  game: string;
  setName: string;
  rarity?: string;
  imageUrl?: string;
  targetPrice?: number;
  currency?: "USD" | "BRL" | "EUR";
  addedAt?: Timestamp;
}

export interface Trade {
  id?: string;
  type: "buy" | "sell" | "trade";
  cardName: string;
  cardId?: string;
  game: string;
  price: number;
  currency: "USD" | "BRL" | "EUR";
  counterparty?: string;
  platform?: string;
  notes?: string;
  tradedAt?: Timestamp;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, "users", uid), { ...data, uid }, { merge: true });
}

function colRef(uid: string) {
  return collection(db, "users", uid, "collection");
}

export async function getCollection(uid: string): Promise<CollectionCard[]> {
  const q = query(colRef(uid), orderBy("addedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CollectionCard));
}

export async function addCardToCollection(uid: string, card: Omit<CollectionCard, "id" | "addedAt">): Promise<string> {
  const ref = await addDoc(colRef(uid), { ...card, addedAt: serverTimestamp() });
  return ref.id;
}

export async function updateCardInCollection(uid: string, docId: string, data: Partial<CollectionCard>): Promise<void> {
  await updateDoc(doc(db, "users", uid, "collection", docId), data);
}

export async function removeCardFromCollection(uid: string, docId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "collection", docId));
}

function wishRef(uid: string) {
  return collection(db, "users", uid, "wishlist");
}

export async function getWishlist(uid: string): Promise<WishlistItem[]> {
  const q = query(wishRef(uid), orderBy("addedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WishlistItem));
}

export async function addToWishlist(uid: string, item: Omit<WishlistItem, "id" | "addedAt">): Promise<string> {
  const ref = await addDoc(wishRef(uid), { ...item, addedAt: serverTimestamp() });
  return ref.id;
}

export async function removeFromWishlist(uid: string, docId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "wishlist", docId));
}

function tradeRef(uid: string) {
  return collection(db, "users", uid, "trades");
}

export async function getTrades(uid: string): Promise<Trade[]> {
  const q = query(tradeRef(uid), orderBy("tradedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Trade));
}

export async function addTrade(uid: string, trade: Omit<Trade, "id" | "tradedAt">): Promise<string> {
  const ref = await addDoc(tradeRef(uid), { ...trade, tradedAt: serverTimestamp() });
  return ref.id;
}

export async function deleteTrade(uid: string, docId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "trades", docId));
}

export function calcCollectionStats(cards: CollectionCard[]) {
  const total = cards.length;
  const graded = cards.filter(c => c.isGraded).length;
  const sets = new Set(cards.map(c => c.setName)).size;
  const totalValue = cards.reduce((acc, c) => acc + (c.currentPrice ?? c.purchasePrice ?? 0), 0);
  return { total, graded, sets, totalValue };
}
