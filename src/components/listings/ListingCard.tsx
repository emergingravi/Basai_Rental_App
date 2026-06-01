import React from 'react';
import { Heart, CheckCircle2, MapPin } from 'lucide-react';
import { Listing } from '../../data/appSchema';

interface ListingCardProps {
  listing: Listing;
  layout: 'horizontal' | 'vertical';
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onClick: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  layout,
  isSaved,
  onToggleSave,
  onClick
}) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      onClick={() => onClick(listing)}
      className={`surface-card group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-200 border border-gray-100 dark:border-gray-700/60 shadow-2xs hover:shadow-sm flex ${
        isHorizontal ? 'w-full flex-col' : 'w-full flex-row items-center gap-3 p-3'
      }`}
    >
      <div
        className={`relative overflow-hidden bg-gray-100 dark:bg-gray-900 ${
          isHorizontal ? 'h-36 w-full rounded-t-2xl' : 'h-24 w-24 rounded-xl shrink-0'
        }`}
      >
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
          <span
            className={`text-[8px] font-bold tracking-tight uppercase px-2 py-1 rounded-full shadow-2xs backdrop-blur-xs ${
              listing.status === 'Available' ? 'bg-[#1D9E75] text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {listing.status}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => onToggleSave(listing.id, e)}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-xs ${
            isSaved
              ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/20'
              : 'bg-white/85 text-gray-700 hover:bg-white dark:bg-black/40 dark:text-white'
          }`}
          aria-label="Save property"
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Verified badge removed per UX request */}
      </div>

      <div className={`flex flex-col justify-between grow min-w-0 ${isHorizontal ? 'p-3' : 'py-0.5 pr-1'}`}>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#1D9E75]/12 px-2.5 py-1 text-[11px] font-bold text-[#1D9E75] dark:bg-[#1D9E75]/20">
              {listing.type}
            </span>
            <div className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              NPR {listing.price.toLocaleString()}
              <span className="ml-1 text-[9px] font-medium opacity-80">/mo</span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-[#1D9E75] transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">
            <MapPin className="w-3 h-3 text-[#1D9E75] mr-1 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{listing.amenities.beds} bed</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span>{listing.amenities.baths} bath</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span>{listing.amenities.furnishing}</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {listing.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-[8px] font-medium px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <span className="text-[9px] text-gray-400">Owner</span>
            {/* Owner verified indicator removed per UX request */}
          </div>
        </div>
      </div>
    </div>
  );
};
