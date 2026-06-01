import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Plus,
  Clock3,
  ChevronRight,
  X,
  Moon,
  Sun,
  House,
} from "lucide-react";

import {
  FILTERS,
  Listing,
  UserRole,
} from "../../data/appSchema";

import { ListingCard } from "../listings/ListingCard";
import { SkeletonCard } from "../listings/SkeletonCard";

/* =========================================================
   TYPES & CONSTANTS
========================================================= */

export enum Tabs {
  HOME = "Home",
  SEARCH = "Search",
  ADD = "Add",
  SAVED = "Saved",
  PROFILE = "Profile",
}

interface HomeScreenProps {
  listings: Listing[];
  userName: string;
  role: UserRole;
  savedIds: string[];
  isDarkMode: boolean;
  isLoading?: boolean;

  onToggleDarkMode: () => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectProperty: (listing: Listing) => void;
  onOpenMapTab?: (listing?: Listing) => void;
  onChangeTab: (tab: Tabs) => void;
}

// Fixed timeframe window computation helper
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

const IconButton = React.memo(({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        relative
        p-2.5
        rounded-full
        bg-gray-50
        dark:bg-gray-800
        text-gray-600
        dark:text-gray-300
        hover:text-[#1D9E75]
        transition-all
        duration-200
        hover:-translate-y-0.5
        focus:outline-none
        focus:ring-2
        focus:ring-[#1D9E75]
      "
    >
      {children}
    </button>
  );
});
IconButton.displayName = "IconButton";

const SectionTitle = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export const HomeScreen: React.FC<HomeScreenProps> = ({
  listings,
  userName,
  role,
  savedIds,
  isDarkMode,
  isLoading = false,

  onToggleDarkMode,
  onToggleSave,
  onSelectProperty,
  onChangeTab,
}) => {
  /* =========================================================
     STATE
  ========================================================= */

  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  /* =========================================================
     DEFERRED SEARCH
  ========================================================= */

  const deferredSearch = useDeferredValue(searchQuery);

  /* =========================================================
     ESC KEY SUPPORT & FOCUS MANAGEMENT
  ========================================================= */

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isNotificationsOpen]);

  /* =========================================================
     MEMOIZED VALUES
  ========================================================= */

  const initials = useMemo(() => {
    if (!userName.trim()) return "BS";
    return userName
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [userName]);

  // Performance Enhancement: Stability fallback logic for runtime dynamic metrics
  const recentListings = useMemo(() => {
    const nowBarrier = Date.now(); 
    return listings.filter(
      (item) => nowBarrier - new Date(item.createdAt).getTime() <= TWENTY_FOUR_HOURS_MS,
    ).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [listings]);

  const filteredListings = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    
    return listings.filter((item) => {
      const matchesQuery =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);

      if (!matchesQuery) return false;
      if (activeFilter === "All") return true;
      return item.type === activeFilter;
    });
  }, [deferredSearch, activeFilter, listings]);

  const featuredListings = useMemo(() => {
    const featured = filteredListings.filter((item) => item.isFeatured);
    return featured.length > 0 ? featured : filteredListings.slice(0, 3);
  }, [filteredListings]);

  const ownerStats = useMemo(() => {
    const listed = listings.length;
    const rented = listings.filter((item) => item.status === "Rented").length;
    const inquiries = recentListings.length;

    return { listed, rented, inquiries };
  }, [listings, recentListings]);

  const collageImages = useMemo(() => {
    // Curated web images (house/home/map/college themes).
    // These are stable Unsplash images used as collage sources.
    const webImages = [
      'https://nepalhomesearch.com/wp-content/uploads/2023/09/nepalese-dream-home-budhanilkantha-1066.jpg',
      'https://tse3.mm.bing.net/th/id/OIP.b-znqtSgP7FyHBqtBowYhAHaFv?r=0&cb=thfc1falcon&rs=1&pid=ImgDetMain&o=7&rm=3',
      'https://i.pinimg.com/originals/d2/ad/ce/d2adce3ed5bb8adc46376565140e0fc8.jpg',
      'https://th.bing.com/th/id/R.7da535779abca8661a944a3dec0ebafe?rik=oEM%2f9f2Ff0q6uw&pid=ImgRaw&r=0',
    ];

    return webImages.slice(0, 4);
  }, [listings]);

  /* =========================================================
     STABLE ACTION HANDLERS
  ========================================================= */

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeTab(Tabs.SEARCH);
  };

  const openListing = useCallback(
    (listing: Listing) => {
      setIsNotificationsOpen(false);
      onSelectProperty(listing);
    },
    [onSelectProperty],
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <main className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* LEFT */}
              <div>
                <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-5 py-2 mb-3">
                  <House className="w-5 h-5 text-[#1D9E75]" aria-hidden="true" />
                  <span className="font-bold text-[#1D9E75]">Basai.com</span>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Welcome back
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Namaste, {userName.split(" ")[0]}
                </h1>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={onToggleDarkMode}
                  ariaLabel="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </IconButton>

                <div className="relative">
                  <IconButton
                    onClick={() => setIsNotificationsOpen(true)}
                    ariaLabel={`Open notifications. ${recentListings.length} new items`}
                  >
                    <Bell className="w-4 h-4" />
                  </IconButton>

                  {recentListings.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
                      {recentListings.length > 9 ? "9+" : recentListings.length}
                    </span>
                  )}
                </div>

                {role === "Owner" && (
                  <button
                    type="button"
                    onClick={() => onChangeTab(Tabs.PROFILE)}
                    aria-label="View Profile"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1D9E75]/15 text-[#1D9E75] font-bold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  >
                    {initials}
                  </button>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT CONTAINER
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          
          {/* HERO */}
          <section aria-labelledby="hero-heading" className="rounded-3xl overflow-hidden border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20 p-5 lg:p-7">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D9E75] font-semibold">
                  Verified room discovery
                </p>
                <h2 id="hero-heading" className="mt-2 text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  Find rooms faster with smarter browsing
                </h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                  Explore verified listings, compare prices, and discover nearby rentals with a modern visual experience.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-800 px-4 py-3 shadow-sm">
                  <span className="text-xs uppercase text-gray-400">Active role</span>
                  <span className="font-bold text-gray-900 dark:text-white">{role}</span>
                </div>
              </div>

              {/* COLLAGE */}
              <div className="grid grid-cols-2 gap-3" aria-hidden="true">
                {collageImages.map((image, index) => (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 ${
                      index === 0 ? "col-span-2 h-44" : "h-32"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEARCH SYSTEM */}
          <section aria-label="Search listings">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D9E75]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, flats or locations..."
                className="w-full h-14 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
              <button
                type="submit"
                aria-label="Advanced Search options"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75] rounded"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </form>
          </section>

          {/* CATEGORIES FILTERS */}
          <section aria-label="Categories filtering">
            <SectionTitle title="Categories" subtitle="Tap to filter listings instantly" />
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {FILTERS.map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    aria-pressed={isSelected}
                    className={`shrink-0 px-4 py-2.5 rounded-full text-sm transition-all border ${
                      isSelected
                        ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </section>

          {/* OWNER DASHBOARD PANEL */}
          {role === "Owner" && (
            <section aria-label="Owner Dashboard Metrics" className="rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <p className="uppercase text-xs tracking-[0.2em] text-emerald-300 font-semibold">
                    Owner Dashboard
                  </p>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-[10px]">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onChangeTab(Tabs.ADD)}
                  className="inline-flex items-center gap-2 bg-white text-teal-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Listing
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <span className="block text-2xl font-bold">{ownerStats.listed}</span>
                  <p className="text-xs text-gray-300 mt-1">Listed</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <span className="block text-2xl font-bold text-emerald-300">{ownerStats.rented}</span>
                  <p className="text-xs text-gray-300 mt-1">Rented</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <span className="block text-2xl font-bold text-amber-300">{ownerStats.inquiries}</span>
                  <p className="text-xs text-gray-300 mt-1">Inquiries</p>
                </div>
              </div>
            </section>
          )}

          {/* FEATURED LISTINGS SPLIT SCROLLER */}
         {/* REARRANGED RESPONSIVE FEATURED LISTINGS CONTAINER */}
          <section aria-label="Featured listings showcase">
            <SectionTitle
              title="Featured Listings"
              subtitle="Fresh picks for you"
              action={
                <button
                  type="button"
                  onClick={() => onChangeTab(Tabs.SEARCH)}
                  className="text-sm text-[#1D9E75] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#1D9E75] rounded"
                >
                  See All
                </button>
              }
            />

            {/* Fixed track alignment: gap-4 for tighter layout, max-w limits card stretching */}
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-start">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="w-[80vw] sm:w-[340px] md:w-full md:max-w-[360px] shrink-0 snap-start">
                      <SkeletonCard layout="vertical" />
                    </div>
                  ))
                : featuredListings.length > 0 ? featuredListings.map((listing) => (
                    <div key={listing.id} className="w-[80vw] sm:w-[340px] md:w-full md:max-w-[360px] shrink-0 snap-start">
                      <ListingCard
                        listing={listing}
                        layout="vertical"
                        isSaved={savedIds.includes(listing.id)}
                        onToggleSave={onToggleSave}
                        onClick={onSelectProperty}
                      />
                    </div>
                  )) : (
                    <div className="w-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      No featured listings available yet.
                    </div>
                  )}
            </div>
          </section>

          {/* MAIN VERTICAL FEED SECTION */}
          <section aria-label="Nearby Rooms and Flats Feed">
            <SectionTitle
              title="Nearby Rooms & Flats"
              subtitle={`${filteredListings.length} ${filteredListings.length === 1 ? 'listing' : 'listings'} found`}
            />

            {filteredListings.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-10 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No listings found for "{activeFilter}"
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter("All")}
                  className="mt-4 text-[#1D9E75] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#1D9E75] rounded"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <SkeletonCard key={index} layout="vertical" />
                    ))
                  : filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        layout="vertical"
                        isSaved={savedIds.includes(listing.id)}
                        onToggleSave={onToggleSave}
                        onClick={onSelectProperty}
                      />
                    ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* =====================================================
          NOTIFICATIONS SIDEBAR (MODAL ACCESSIBILITY DIALOG)
      ===================================================== */}
      {isNotificationsOpen && (
        <div
          onClick={() => setIsNotificationsOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Recent Notifications Panel"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
          >
            {/* PANEL HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D9E75] font-semibold">
                  Last 24 hours
                </p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  Recent Notifications
                </h2>
              </div>
              <IconButton
                onClick={() => setIsNotificationsOpen(false)}
                ariaLabel="Close notifications drawer"
              >
                <X className="w-4 h-4" />
              </IconButton>
            </div>

            {/* PANEL FEED */}
            <div className="h-[calc(100%-90px)] overflow-y-auto p-5 space-y-4">
              {recentListings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500">
                  No recent listings available.
                </div>
              ) : (
                recentListings.map((listing) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => openListing(listing)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4 text-left hover:border-[#1D9E75]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-[10px] font-bold uppercase">
                          <Clock3 className="w-3 h-3" />
                          New Listing
                        </div>

                        <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {listing.location}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="rounded-full bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-1 text-[11px] font-bold">
                            {listing.type}
                          </span>
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-3 py-1 text-[11px] font-bold">
                            NPR {listing.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" aria-hidden="true" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
