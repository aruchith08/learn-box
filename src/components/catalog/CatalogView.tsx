import React, { useState, useMemo } from 'react';
import { Search, X, ExternalLink, LayoutGrid, ArrowUpRight } from '../common/focusIcons';
import { CATALOG_ITEMS, CatalogItem } from '../../data/catalogData';

export const CatalogView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return CATALOG_ITEMS;
    return CATALOG_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="px-3.5 sm:px-6 py-4 max-w-[1600px] mx-auto font-sans w-full box-border">
      {/* 1. Page Header Banner */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#111111] sm:shadow-[5px_5px_0px_#111111] mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#FFE600] text-black text-[10px] font-black px-2 py-0.5 rounded border border-[#111111] uppercase tracking-wider shadow-[1px_1px_0px_#111111]">
                LAUNCHPAD
              </span>
              <span className="text-xs font-mono font-bold text-gray-500">
                {CATALOG_ITEMS.length} Launchable Resources
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-[#111111] uppercase tracking-tight leading-none">
              CATALOG
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1.5">
              Your practice playground.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, topics, sites..."
                className="w-full pl-9 pr-8 py-2 bg-[#F4F1EB] border-2 border-[#111111] rounded-xl text-xs font-bold text-[#111111] placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-[2px_2px_0px_#111111] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. OS-Style App Launcher Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-8 sm:p-12 text-center shadow-[4px_4px_0px_#111111] max-w-lg mx-auto my-8">
          <div className="w-12 h-12 bg-[#FEF08A] border-2 border-[#111111] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_#111111]">
            <Search className="w-6 h-6 text-[#111111]" />
          </div>
          <h3 className="font-display font-black text-base uppercase text-[#111111]">
            No matching tools found
          </h3>
          <p className="text-xs text-gray-500 font-semibold mt-1 mb-4">
            Try searching for "Python", "SQL", "DSA", or clear the filter.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="bg-[#FFE600] border-2 border-[#111111] px-4 py-2 rounded-xl text-xs font-display font-black uppercase shadow-[2px_2px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer transition-all"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="bg-white/60 border-2 sm:border-3 border-[#111111] rounded-2xl p-5 sm:p-8 shadow-[3px_3px_0px_#111111] sm:shadow-[5px_5px_0px_#111111]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-y-7 sm:gap-y-9 gap-x-3 sm:gap-x-6 justify-items-center">
            {filteredItems.map((item) => {
              const isImageFailed = failedImages[item.id];
              const imgSrc = isImageFailed && item.fallbackIcon ? item.fallbackIcon : item.icon;

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center w-full max-w-[110px] text-center select-none cursor-pointer focus:outline-none"
                  title={`${item.title} (${item.platform}) - Opens in new tab`}
                >
                  {/* Square App Icon with Neo-brutalist shadow & lift */}
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl sm:rounded-[22px] border-2 sm:border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111] flex items-center justify-center p-3 sm:p-3.5 transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[5px_5px_0px_#111111] active:translate-y-0 active:shadow-[2px_2px_0px_#111111]"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    {/* Small open indicator in top-right on hover */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-0.5 rounded-md">
                      <ArrowUpRight className="w-2.5 h-2.5 stroke-[3]" />
                    </div>

                    {/* Logo / Favicon */}
                    {!isImageFailed || item.fallbackIcon ? (
                      <img
                        src={imgSrc}
                        alt={item.title}
                        onError={() => handleImageError(item.id)}
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      /* Fallback Monogram if both image and fallback fail */
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black text-white flex items-center justify-center font-display font-black text-xs sm:text-sm">
                        {item.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Resource Name displayed below the icon */}
                  <span className="font-display font-black text-xs sm:text-[13px] text-[#111111] leading-snug line-clamp-2 mt-2 sm:mt-2.5 px-0.5 group-hover:text-[#B45309] transition-colors">
                    {item.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
