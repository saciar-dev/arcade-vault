"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { SavedScore, User } from "@/app/data/types";

type SessionContextValue = {
  user: User | null;
  scores: SavedScore[];
  login: (user: User | null) => void;
  logout: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<SavedScore[]>([]);

  const login = useCallback((u: User | null) => {
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => {
    setScores((prev) => [...prev, { ...entry, at: Date.now() }]);
  }, []);

  return (
    <SessionContext.Provider value={{ user, scores, login, logout, saveScore }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de un SessionProvider");
  }
  return ctx;
}
