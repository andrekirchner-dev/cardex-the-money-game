import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/firestore";

export const ADMIN_EMAILS = ["kirchner.andre@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export interface AdminUserData extends UserProfile {
  cardCount: number;
  wishlistCount: number;
  tradeCount: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalCards: number;
  totalWishlist: number;
  totalTrades: number;
  proUsers: number;
  freeUsers: number;
}

export function useAdminData() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, totalCards: 0, totalWishlist: 0, totalTrades: 0, proUsers: 0, freeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData: AdminUserData[] = [];

      await Promise.all(
        usersSnap.docs.map(async (userDoc) => {
          const profile = userDoc.data() as UserProfile;
          const [colSnap, wishSnap, tradeSnap] = await Promise.all([
            getDocs(collection(db, "users", userDoc.id, "collection")),
            getDocs(collection(db, "users", userDoc.id, "wishlist")),
            getDocs(collection(db, "users", userDoc.id, "trades")),
          ]);
          usersData.push({
            ...profile,
            uid: userDoc.id,
            cardCount: colSnap.size,
            wishlistCount: wishSnap.size,
            tradeCount: tradeSnap.size,
          });
        })
      );

      // sort by memberSince desc
      usersData.sort((a, b) => (b.memberSince ?? "").localeCompare(a.memberSince ?? ""));

      const totalCards    = usersData.reduce((s, u) => s + u.cardCount, 0);
      const totalWishlist = usersData.reduce((s, u) => s + u.wishlistCount, 0);
      const totalTrades   = usersData.reduce((s, u) => s + u.tradeCount, 0);
      const proUsers      = usersData.filter(u => u.plan === "pro").length;

      setUsers(usersData);
      setStats({
        totalUsers: usersData.length,
        totalCards,
        totalWishlist,
        totalTrades,
        proUsers,
        freeUsers: usersData.length - proUsers,
      });
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar dados admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateUserPlan = async (uid: string, plan: "free" | "pro") => {
    await updateDoc(doc(db, "users", uid), { plan });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, plan } : u));
    setStats(prev => {
      const user = users.find(u => u.uid === uid);
      if (!user || user.plan === plan) return prev;
      return {
        ...prev,
        proUsers:  plan === "pro" ? prev.proUsers + 1 : prev.proUsers - 1,
        freeUsers: plan === "free" ? prev.freeUsers + 1 : prev.freeUsers - 1,
      };
    });
  };

  return { users, stats, loading, error, refresh: load, updateUserPlan };
}
