import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        clearUser: () => set({ user: null }),
      }),
      {
        name: "auth-storage",
        // Only persist user, not loading state
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "AuthStore" }
  )
);
