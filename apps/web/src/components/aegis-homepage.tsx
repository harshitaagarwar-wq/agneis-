"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookmarkPlus,
  Compass,
  ExternalLink,
  Globe,
  History,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { createTileInputSchema, type SearchMode, type TileDTO } from "@aegis/shared";
import { useAegisStore } from "@/store/use-aegis-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const DEFAULT_PUBLIC_TILES: TileDTO[] = [
  { id: "default-1", title: "GitHub", url: "https://github.com", position: 0, pinned: true },
  { id: "default-2", title: "Hacker News", url: "https://news.ycombinator.com", position: 1, pinned: true },
  { id: "default-3", title: "arXiv", url: "https://arxiv.org", position: 2, pinned: true },
  { id: "default-4", title: "MDN Docs", url: "https://developer.mozilla.org", position: 3, pinned: true },
];

const SEARCH_MODES: { id: SearchMode; label: string; placeholder: string }[] = [
  { id: "web", label: "Web Search", placeholder: "Search the web or enter a URL..." },
  { id: "assistant", label: "Assistant", placeholder: "Ask Aegis Assistant anything..." },
  { id: "vault", label: "Captured Vault", placeholder: "Search your captured pages and notes..." },
];

export function AegisHomepage() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    searchMode,
    query,
    commandOpen,
    signInOpen,
    addTileOpen,
    setSearchMode,
    setQuery,
    setCommandOpen,
    setSignInOpen,
    setAddTileOpen,
  } = useAegisStore();

  const [newTileTitle, setNewTileTitle] = useState("");
  const [newTileUrl, setNewTileUrl] = useState("");
  const [tileFormError, setTileFormError] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(!commandOpen);
      } else if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, setCommandOpen]);

  const tilesQuery = useQuery<{ tiles: TileDTO[] }>({
    queryKey: ["tiles", session?.user?.id ?? "guest"],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { tiles: DEFAULT_PUBLIC_TILES };
      }
      const res = await fetch("/api/tiles");
      if (!res.ok) throw new Error("Failed to load quick-access tiles");
      return res.json();
    },
  });

  const historyQuery = useQuery<{ history: { id: string; query: string; mode: SearchMode }[] }>({
    queryKey: ["history", session?.user?.id ?? "guest"],
    queryFn: async () => {
      if (!session?.user?.id) return { history: [] };
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to load search history");
      return res.json();
    },
  });

  const createTileMutation = useMutation({
    mutationFn: async (payload: { title: string; url: string }) => {
      const res = await fetch("/api/tiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to save tile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiles"] });
      setNewTileTitle("");
      setNewTileUrl("");
      setTileFormError(null);
      setAddTileOpen(false);
    },
    onError: (err: Error) => {
      setTileFormError(err.message);
    },
  });

  const deleteTileMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tiles?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove tile");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiles"] });
    },
  });

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (session?.user?.id) {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, mode: searchMode }),
      })
        .then(() => queryClient.invalidateQueries({ queryKey: ["history"] }))
        .catch(() => {});
    }

    if (searchMode === "web") {
      const looksLikeUrl = /^https?:\/\//i.test(trimmed) || /^[^\s]+\.[a-z]{2,}$/i.test(trimmed);
      const target = looksLikeUrl
        ? /^https?:\/\//i.test(trimmed)
          ? trimmed
          : `https://${trimmed}`
        : `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      window.location.assign(target);
      return;
    }

    setSearchNotice(
      searchMode === "assistant"
        ? `Assistant streaming workspace is scheduled for Phase 2. Query "${trimmed}" queued.`
        : `Captured Vault hybrid search is scheduled for Phase 2. Query "${trimmed}" queued.`,
    );
  };

  const handleCreateTile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createTileInputSchema.safeParse({
      title: newTileTitle,
      url: newTileUrl,
    });
    if (!parsed.success) {
      setTileFormError(parsed.error.issues[0]?.message ?? "Check tile fields");
      return;
    }
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    createTileMutation.mutate({ title: parsed.data.title, url: parsed.data.url });
  };

  const activeMode = SEARCH_MODES.find((m) => m.id === searchMode) ?? SEARCH_MODES[0];
  const tiles = tilesQuery.data?.tiles ?? [];

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-[#E8E8E8]">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-8 px-6 py-5">
        <a
          href="/"
          className="font-display text-lg font-extrabold tracking-tight text-[#E8E8E8] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E8E8]/60 rounded-lg"
        >
          Aegis
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#8A8D91]" aria-label="Primary">
          <button
            type="button"
            onClick={() => setSearchMode("web")}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8E8E8] cursor-pointer ${
              searchMode === "web" ? "text-[#E8E8E8] font-medium" : ""
            }`}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("assistant")}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8E8E8] cursor-pointer ${
              searchMode === "assistant" ? "text-[#E8E8E8] font-medium" : ""
            }`}
          >
            Assistant
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("vault")}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8E8E8] cursor-pointer ${
              searchMode === "vault" ? "text-[#E8E8E8] font-medium" : ""
            }`}
          >
            Vault
          </button>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#E8E8E8] cursor-pointer"
          >
            Command Palette
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {sessionStatus === "loading" ? (
            <Skeleton className="h-10 w-24 rounded-2xl" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="gunmetal" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4 text-[#C0C0C0]" />
                  <span className="max-w-[120px] truncate">
                    {session.user.name ?? session.user.email ?? "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-xs text-[#8A8D91]">
                  {session.user.email ?? "Signed in"}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAddTileOpen(true)}>
                  <BookmarkPlus className="h-4 w-4" />
                  Add quick tile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCommandOpen(true)}>
                  <Search className="h-4 w-4" />
                  Command palette
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="gunmetal" size="sm" onClick={() => setSignInOpen(true)}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[920px] flex-1 flex-col items-center justify-center px-6 pb-20 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col items-center"
        >
          <h1
            className="aegis-wordmark select-none text-center font-display text-5xl font-black tracking-[-0.04em] sm:text-7xl md:text-8xl"
            style={{ textWrap: "balance" }}
          >
            AEGIS
          </h1>
          <p className="mt-3 text-center text-sm text-[#8A8D91] sm:text-base">
            Focused web discovery, personal memory, and verifiable synthesis.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-10 w-full max-w-[680px]">
            <div className="aegis-search-shell rounded-2xl p-2">
              <div className="flex items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-[#8A8D91]" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (searchNotice) setSearchNotice(null);
                  }}
                  placeholder={activeMode.placeholder}
                  aria-label="Search query"
                  className="h-12 w-full bg-transparent text-base text-[#E8E8E8] placeholder:text-[#8A8D91] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  aria-label="Open command palette"
                  className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-[#E8E8E8]/15 bg-[#2B2D30]/80 px-2.5 py-1 font-mono text-xs text-[#C0C0C0] transition-colors hover:border-[#E8E8E8]/35 hover:text-[#E8E8E8] cursor-pointer shrink-0"
                >
                  ⌘K
                </button>
                <Button type="submit" size="icon" aria-label="Submit search" className="shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-1 flex items-center justify-between border-t border-[#E8E8E8]/10 px-2 pt-2 pb-0.5">
                <div className="flex items-center gap-1" role="tablist" aria-label="Search mode">
                  {SEARCH_MODES.map((mode) => {
                    const active = mode.id === searchMode;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSearchMode(mode.id)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          active
                            ? "bg-[#2B2D30] text-[#E8E8E8] border border-[#E8E8E8]/20"
                            : "text-[#8A8D91] hover:text-[#C0C0C0]"
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
                <span className="hidden sm:inline text-xs text-[#8A8D91] pr-2">
                  Press / to focus
                </span>
              </div>
            </div>
          </form>

          {searchNotice && (
            <div
              role="status"
              className="mt-4 w-full max-w-[680px] rounded-2xl border border-[#E8E8E8]/15 bg-[#141517] px-4 py-3 text-sm text-[#C0C0C0]"
            >
              {searchNotice}
            </div>
          )}

          <section aria-labelledby="quick-access-heading" className="mt-12 w-full max-w-[680px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="quick-access-heading" className="text-sm font-medium text-[#C0C0C0]">
                Quick access
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!session?.user?.id) {
                    setSignInOpen(true);
                  } else {
                    setAddTileOpen(true);
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add tile
              </Button>
            </div>

            {tilesQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[88px] w-full" />
                ))}
              </div>
            ) : tilesQuery.isError ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-red-400/25 bg-[#141517] px-6 py-8 text-center">
                <p className="text-sm text-[#E8E8E8]">Unable to load your quick-access tiles.</p>
                <p className="mt-1 text-xs text-[#8A8D91]">
                  Check your connection and retry loading saved shortcuts.
                </p>
                <Button
                  variant="gunmetal"
                  size="sm"
                  className="mt-4"
                  onClick={() => tilesQuery.refetch()}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            ) : tiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E8E8]/14 bg-[#141517] px-6 py-10 text-center">
                <Compass className="h-6 w-6 text-[#8A8D91]" />
                <p className="mt-3 text-sm font-medium text-[#E8E8E8]">No quick-access tiles yet</p>
                <p className="mt-1 text-xs text-[#8A8D91]">
                  Pin the sites and research portals you visit daily.
                </p>
                <Button
                  variant="gunmetal"
                  size="sm"
                  className="mt-4"
                  onClick={() => setAddTileOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add first tile
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {tiles.map((tile) => {
                  const hostname = (() => {
                    try {
                      return new URL(tile.url).hostname.replace(/^www\./, "");
                    } catch {
                      return tile.url;
                    }
                  })();
                  return (
                    <div
                      key={tile.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[#E8E8E8]/14 bg-[#2B2D30]/80 p-4 transition-all duration-150 hover:border-[#E8E8E8]/35 hover:bg-[#2B2D30]"
                    >
                      <a
                        href={tile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E8E8]/60 rounded-lg"
                      >
                        <span className="truncate text-sm font-medium text-[#E8E8E8]">
                          {tile.title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#8A8D91] opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-xs text-[#8A8D91]">
                          {hostname}
                        </span>
                        {session?.user?.id && (
                          <button
                            type="button"
                            onClick={() => deleteTileMutation.mutate(tile.id)}
                            aria-label={`Remove ${tile.title}`}
                            className="rounded-lg p-1 text-[#8A8D91] opacity-0 transition-all hover:bg-black/40 hover:text-[#E8E8E8] group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </motion.div>
      </main>

      <footer className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-5 text-xs text-[#8A8D91]">
        <span>Aegis</span>
        <span>Press ⌘K for command palette</span>
      </footer>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to Aegis</DialogTitle>
            <DialogDescription>
              Sync your quick-access tiles, search history, and captured knowledge vault across
              devices.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex flex-col gap-3">
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => signIn("google")}
            >
              <Globe className="h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              variant="gunmetal"
              size="lg"
              className="w-full"
              onClick={() => signIn("github")}
            >
              <Sparkles className="h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addTileOpen} onOpenChange={setAddTileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add quick-access tile</DialogTitle>
            <DialogDescription>
              Pin a frequent destination to your Aegis homepage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTile} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="tile-title" className="text-xs font-medium text-[#C0C0C0]">
                Title
              </label>
              <Input
                id="tile-title"
                value={newTileTitle}
                onChange={(e) => setNewTileTitle(e.target.value)}
                placeholder="e.g. Linear"
                maxLength={48}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tile-url" className="text-xs font-medium text-[#C0C0C0]">
                URL
              </label>
              <Input
                id="tile-url"
                value={newTileUrl}
                onChange={(e) => setNewTileUrl(e.target.value)}
                placeholder="https://linear.app"
              />
            </div>
            {tileFormError && <p className="text-xs text-red-400">{tileFormError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddTileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTileMutation.isPending}>
                {createTileMutation.isPending ? "Saving..." : "Save tile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No matching commands or tiles.</CommandEmpty>
          <CommandGroup heading="Search Modes">
            {SEARCH_MODES.map((mode) => (
              <CommandItem
                key={mode.id}
                onSelect={() => {
                  setSearchMode(mode.id);
                  setCommandOpen(false);
                  searchInputRef.current?.focus();
                }}
              >
                <span>Switch to {mode.label}</span>
                <span className="font-mono text-xs text-[#8A8D91]">Mode</span>
              </CommandItem>
            ))}
          </CommandGroup>
          {tiles.length > 0 && (
            <CommandGroup heading="Quick Access Tiles">
              {tiles.map((tile) => (
                <CommandItem
                  key={tile.id}
                  onSelect={() => {
                    window.location.assign(tile.url);
                    setCommandOpen(false);
                  }}
                >
                  <span>{tile.title}</span>
                  <span className="font-mono text-xs text-[#8A8D91]">{tile.url}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(historyQuery.data?.history.length ?? 0) > 0 && (
            <CommandGroup heading="Recent Searches">
              {historyQuery.data?.history.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    setQuery(item.query);
                    setSearchMode(item.mode);
                    setCommandOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-[#8A8D91]" />
                    {item.query}
                  </span>
                  <span className="font-mono text-xs text-[#8A8D91]">{item.mode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
