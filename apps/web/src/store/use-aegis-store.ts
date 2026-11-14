import { create } from "zustand";
import type { SearchMode } from "@aegis/shared";

interface AegisState {
  searchMode: SearchMode;
  query: string;
  commandOpen: boolean;
  signInOpen: boolean;
  addTileOpen: boolean;
  setSearchMode: (mode: SearchMode) => void;
  setQuery: (query: string) => void;
  setCommandOpen: (open: boolean) => void;
  setSignInOpen: (open: boolean) => void;
  setAddTileOpen: (open: boolean) => void;
}

export const useAegisStore = create<AegisState>((set) => ({
  searchMode: "web",
  query: "",
  commandOpen: false,
  signInOpen: false,
  addTileOpen: false,
  setSearchMode: (searchMode) => set({ searchMode }),
  setQuery: (query) => set({ query }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSignInOpen: (signInOpen) => set({ signInOpen }),
  setAddTileOpen: (addTileOpen) => set({ addTileOpen }),
}));
