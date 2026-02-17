import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modal
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Global loading
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Modal
      activeModal: null,
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Global loading
      isPageLoading: false,
      setPageLoading: (loading) => set({ isPageLoading: loading }),
    }),
    { name: "AppStore" }
  )
);
