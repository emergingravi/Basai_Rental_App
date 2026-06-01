import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Phone,
  MessageCircle,
  AlertTriangle,
  MapPin,
  Share2,
  Star,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Listing } from "../../data/appSchema";

interface PropertyDetailScreenProps {
  listing: Listing;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
}

export const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({
  listing,
  isSaved,
  onToggleSave,
  onBack,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reported, setReported] = useState(false);

  const mapBounds = useMemo(() => {
    const offset = 0.0085;
    const left = listing.longitude - offset;
    const right = listing.longitude + offset;
    const top = listing.latitude + offset;
    const bottom = listing.latitude - offset;
    return `${left}%2C${bottom}%2C${right}%2C${top}`;
  }, [listing.latitude, listing.longitude]);

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${listing.latitude}%2C${listing.longitude}`;
  const mapOpenUrl = `https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=16/${listing.latitude}/${listing.longitude}`;

  const handleCall = () => {
    window.location.href = `tel:+977${listing.ownerPhone}`;
  };

  const handleInquiry = () => {
    const message = `Namaste ${listing.ownerName}, I found your listing "${listing.title}" and would like to schedule a room tour.`;
    window.location.href = `sms:+977${listing.ownerPhone}?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col justify-between animate-slide-up">
      <div className="pb-24">
        <div className="relative w-full bg-gray-900 overflow-hidden">
          {/* Collage Image Grid Layout */}
          <div className="grid grid-cols-2 gap-2 p-2 h-64 sm:h-80">
            {listing.images.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 relative ${
                  index === 0 ? "col-span-2 h-full" : "h-full"
                }`}
              >
                <img
                  src={image}
                  alt={`Basai room ${index + 1}`}
                  className="h-full w-full object-cover transition-all duration-300 cursor-zoom-in"
                  loading="lazy"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                />
                {/* Subtle shadow overlay just for the images to make text pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>
            ))}
          </div>

          {/* Absolute Top Header Actions */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 text-gray-900 dark:text-white flex items-center justify-center backdrop-blur-xs hover:scale-105 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  window.open(mapOpenUrl, "_blank", "noopener,noreferrer")
                }
                className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 text-gray-900 dark:text-white flex items-center justify-center backdrop-blur-xs hover:scale-105 transition-transform"
                title="Open map"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => onToggleSave(listing.id, e)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xs transition-all ${
                  isSaved
                    ? "bg-rose-50 text-rose-500 dark:bg-rose-500/20"
                    : "bg-white/90 dark:bg-black/70 text-gray-900 dark:text-white"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Absolute Bottom Information Badges */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white rounded-md">
              {listing.images.length} Photos
            </span>
            <span className="rounded-full bg-[#1D9E75] px-2.5 py-1 text-[11px] font-bold text-white">
              {listing.type}
            </span>
          </div>
        </div>
        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button (Only show if not the first image) */}
            {currentImageIndex > 0 && (
              <button
                onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                className="absolute left-4 z-50 p-3 text-white bg-black/40 hover:bg-black/60 rounded-full transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Image Container (stop propagation so clicks inside don't close) */}
            <div
              className="max-w-4xl max-h-[85vh] p-2 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={listing.images[currentImageIndex]}
                alt={`Basai room expanded view ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-scale-in"
              />

              {/* Image Counter Indicator */}
              <span className="text-white/60 text-sm mt-4 font-medium tracking-wide">
                {currentImageIndex + 1} / {listing.images.length}
              </span>
            </div>

            {/* Next Button (Only show if not the last image) */}
            {currentImageIndex < listing.images.length - 1 && (
              <button
                onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                className="absolute right-4 z-50 p-3 text-white bg-black/40 hover:bg-black/60 rounded-full transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {lightboxOpen && (
          <LightboxKeyHandler
            onClose={() => setLightboxOpen(false)}
            onPrev={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentImageIndex((i) => Math.min(listing.images.length - 1, i + 1))}
          />
        )}

        <div className="px-4 pt-4 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  listing.status === "Available"
                    ? "bg-emerald-100 text-[#1D9E75] dark:bg-emerald-950/50"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/50"
                }`}
              >
                {listing.status}
              </span>

              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{listing.rating}</span>
                <span className="text-gray-400 font-normal">
                  ({listing.rating > 4.5 ? "24 reviews" : "8 reviews"})
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                NPR {listing.price.toLocaleString()}
                <span className="ml-1 text-xs font-medium opacity-80">
                  / month
                </span>
              </div>
              <div className="rounded-full bg-[#1D9E75]/10 px-3 py-1.5 text-xs font-bold text-[#1D9E75]">
                {listing.type}
              </div>
            </div>

            <h1 className="text-lg font-bold font-display text-gray-900 dark:text-white mt-2 leading-snug">
              {listing.title}
            </h1>

            <p className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#1D9E75] mr-1 shrink-0" />
              <span>{listing.location}</span>
              <span className="mx-1.5">•</span>
              <span className="text-[11px] text-gray-400 font-medium">
                {listing.distance}
              </span>
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Core amenities
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="surface-card bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 flex items-center space-x-3">
                <span className="text-lg">🛏️</span>
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium uppercase">
                    Bedrooms
                  </span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white">
                    {listing.amenities.beds}{" "}
                    {listing.amenities.beds > 1 ? "Rooms" : "Room"}
                  </span>
                </div>
              </div>

              <div className="surface-card bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 flex items-center space-x-3">
                <span className="text-lg">🛁</span>
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium uppercase">
                    Bathrooms
                  </span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white">
                    {listing.amenities.baths}{" "}
                    {listing.amenities.baths > 1 ? "Baths" : "Bath"}
                  </span>
                </div>
              </div>

              <div className="surface-card bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 flex items-center space-x-3">
                <span className="text-lg">🛋️</span>
                <div className="overflow-hidden">
                  <span className="block text-[10px] text-gray-400 font-medium uppercase">
                    Furnishing
                  </span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">
                    {listing.amenities.furnishing}
                  </span>
                </div>
              </div>

              <div className="surface-card bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 flex items-center space-x-3">
                <span className="text-lg">🚗</span>
                <div className="overflow-hidden">
                  <span className="block text-[10px] text-gray-400 font-medium uppercase">
                    Parking
                  </span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">
                    {listing.amenities.parking}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Highlights & facilities
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#1D9E75] rounded-lg border border-teal-100 dark:border-teal-900/60"
                >
                  {tag}
                </span>
              ))}
              <span className="text-xs font-medium px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
                Separate Meter
              </span>
              <span className="text-xs font-medium px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
                No Brokerage Fee
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              About this property
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="surface-card bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] font-bold font-display text-base flex items-center justify-center relative">
                  {listing.ownerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  {listing.isOwnerVerified && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[9px] text-white ring-2 ring-white dark:ring-gray-800 font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    {listing.ownerName}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Property owner • 100% response rate
                  </p>
                </div>
              </div>

              <span className="bg-emerald-50 dark:bg-emerald-950/50 text-[#1D9E75] text-[10px] font-bold px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Direct contact phone</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                +977 {listing.ownerPhone}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Location map
              </h2>
              <a
                href={mapOpenUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
              >
                Open in maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
              <iframe
                title={`Map for ${listing.title}`}
                src={mapEmbedUrl}
                className="h-56 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              The map is centered on {listing.location.split(",")[0]} using the
              listing coordinates.
            </p>
          </div>

          <div className="pt-2">
            {!reported ? (
              <button
                onClick={() => setReported(true)}
                className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-gray-100 dark:border-gray-800 text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    Something wrong? Report this listing
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 underline">
                  Flag post
                </span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl text-center text-xs text-[#1D9E75]">
                Thank you. This listing has been flagged for manual review.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 flex space-x-3 z-40 shadow-lg backdrop-blur-md">
        <button
          onClick={handleCall}
          className="w-1/2 py-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-[#1D9E75] hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border border-emerald-200 dark:border-emerald-800/80"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>Call owner</span>
        </button>

        <button
          onClick={handleInquiry}
          className="w-1/2 py-3.5 bg-[#1D9E75] hover:bg-[#147B5A] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs active:scale-[0.99]"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Send inquiry</span>
        </button>
      </div>

      
    </div>
  );
};

function LightboxKeyHandler({ onClose, onPrev, onNext }: { onClose: () => void; onPrev: () => void; onNext: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);
  return null;
}
