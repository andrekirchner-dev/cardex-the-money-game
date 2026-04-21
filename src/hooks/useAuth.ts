import { useState, useEffect } from "react";
import {
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile, type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { setUserProfile, getUserProfile, type UserProfile } from "@/lib/firestore";

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    const existing = await getUserProfile(u.uid);
    if (!existing) {
      await setUserProfile(u.uid, {
        uid: u.uid,
        displayName: u.displayName ?? "Collector",
        email: u.email ?? "",
        photoURL: u.photoURL ?? undefined,
        plan: "free",
        memberSince: new Date().getFullYear().toString(),
      });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await setUserProfile(result.user.uid, {
      uid: result.user.uid,
      displayName,
      email,
      plan: "free",
      memberSince: new Date().getFullYear().toString(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout };
}
