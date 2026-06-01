import React from 'react';
import { Heart, Search } from 'lucide-react';
import { Listing } from '../../data/appSchema';
import { ListingCard } from '../listings/ListingCard';

interface SavedScreenProps {
  listings: Listing[];
  savedIds: string[];
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectProperty: (listing: Listing) => void;
  onChangeTab: (tab: 'Home' | 'Search') => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  listings,
  savedIds,
  onToggleSave,
  onSelectProperty,
  onChangeTab
}) => {
  const savedListings = listings.filter((item) => savedIds.includes(item.id));

  return (
    <div className="pb-24 page-shell">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 pt-4 pb-3 pr-18 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <h1 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center space-x-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span>Saved Favorites</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {savedListings.length} properties stored offline
        </p>
      </header>

      {/* Main List */}
      <div className="px-4 pt-4 space-y-3">
        {savedListings.length > 0 ? (
          savedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              layout="vertical"
              isSaved={true}
              onToggleSave={onToggleSave}
              onClick={onSelectProperty}
            />
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 mt-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              No saved flats yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              Tap the heart icon on any listing card while browsing to save rooms for immediate access.
            </p>

            <button
              onClick={() => onChangeTab('Home')}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1D9E75] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#147B5A]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Marketplace Feed</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
