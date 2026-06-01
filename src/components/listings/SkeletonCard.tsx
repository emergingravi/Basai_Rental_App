import React from 'react';

interface SkeletonCardProps {
  layout: 'horizontal' | 'vertical';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ layout }) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60 shadow-2xs flex ${
      isHorizontal ? 'w-52 flex-col shrink-0' : 'w-full flex-row items-center gap-2.5 p-2'
    }`}>
      {/* Image Block placeholder */}
      <div className={`skeleton-shimmer shrink-0 ${
        isHorizontal ? 'h-32 w-full rounded-t-xl' : 'h-24 w-24 rounded-lg'
      }`} />

      {/* Content skeleton lines */}
      <div className={`flex flex-col justify-between grow min-w-0 ${
        isHorizontal ? 'p-2.5' : 'py-0.5 pr-1'
      }`}>
        <div className="space-y-2">
          {/* Price header placeholder */}
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 rounded skeleton-shimmer" />
            <div className="h-2.5 w-8 rounded skeleton-shimmer" />
          </div>

          {/* Title placeholder */}
          <div className="h-3 w-full rounded skeleton-shimmer" />
          <div className="h-2 w-2/3 rounded skeleton-shimmer" />

          {/* Amenity placeholder */}
          <div className="flex space-x-1.5 pt-0.5">
            <div className="h-2 w-8 rounded skeleton-shimmer" />
            <div className="h-2 w-8 rounded skeleton-shimmer" />
            <div className="h-2 w-10 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Footer tags placeholder */}
        <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
          <div className="flex space-x-1">
            <div className="h-2 w-8 rounded skeleton-shimmer" />
            <div className="h-2 w-10 rounded skeleton-shimmer" />
          </div>
          <div className="h-2 w-6 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};
