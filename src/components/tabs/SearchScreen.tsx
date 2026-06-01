import React, { useState } from 'react';
import { Search, ArrowUpDown, Sparkles } from 'lucide-react';
import { FILTERS, Listing } from '../../data/appSchema';
import { ListingCard } from '../listings/ListingCard';
import { SkeletonCard } from '../listings/SkeletonCard';

interface SearchScreenProps {
  listings: Listing[];
  savedIds: string[];
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectProperty: (listing: Listing) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  listings,
  savedIds,
  onToggleSave,
  onSelectProperty
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating'>('rating');
  // preview skeleton removed — always show real results

  let results = listings.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (activeFilter === 'All') return true;
    return item.type === activeFilter;
  });

  results = [...results].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return b.rating - a.rating;
  });

  return (
    <div className="pb-24 page-shell">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 pt-4 pb-3 pr-18 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <h1 className="text-lg font-bold font-display text-gray-900 dark:text-white mb-3">
          Explore rentals
        </h1>

        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4 text-[#1D9E75]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Kathmandu, Lalitpur, Baneshwor..."
            className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {FILTERS.map((pill) => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={`interactive-chip text-xs font-medium px-3.5 py-1.5 rounded-full shrink-0 transition-all ${
                activeFilter === pill
                  ? 'bg-[#1D9E75] text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#1D9E75]'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Preview loading removed */}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Showing <strong className="text-gray-900 dark:text-white">{results.length}</strong> properties
          </span>

          <div className="flex items-center space-x-1">
            <ArrowUpDown className="w-3 h-3 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'rating')}
              className="text-xs font-semibold bg-transparent text-[#1D9E75] pr-1 cursor-pointer focus:outline-none"
            >
              <option value="rating" className="text-gray-900">Top Rated</option>
              <option value="price_asc" className="text-gray-900">Price: Low to High</option>
              <option value="price_desc" className="text-gray-900">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.length > 0 ? (
            results.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                layout="vertical"
                isSaved={savedIds.includes(listing.id)}
                onToggleSave={onToggleSave}
                onClick={onSelectProperty}
              />
            ))
          ) : (
            <div className="surface-card bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No properties match your current search terms.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('All');
                }}
                className="mt-3 inline-block text-xs font-bold bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-1.5 rounded-lg"
              >
                Reset filters and search
              </button>
            </div>
          )}
        </div>

        <div className="surface-card bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl text-center text-[10px] text-gray-400 border border-gray-100 dark:border-gray-800">
          Compare categories and highlighted prices while the map-ready listings stay one tap away.
        </div>
      </div>
    </div>
  );
};
