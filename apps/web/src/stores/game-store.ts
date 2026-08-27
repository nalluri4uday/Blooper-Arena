import { create } from 'zustand';

interface GameState {
  // Current active character
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;

  // Season tracking
  activeSeasonId: string | null;
  setActiveSeasonId: (id: string | null) => void;

  // Sidebar state (mobile)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  activeCharacterId: null,
  setActiveCharacterId: (id) => set({ activeCharacterId: id }),

  activeSeasonId: null,
  setActiveSeasonId: (id) => set({ activeSeasonId: id }),

  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
