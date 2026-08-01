import React, { useState } from 'react';
import { CabinCategoryCard } from '../types';
import { AMENITIES_DICTIONARY } from '../data/mockCabins';
import { getImageUrl } from '../utils/imageUtils';
import { Users, BedDouble, ChevronLeft, ChevronRight, Bath, ShowerHead, Calendar, Sparkles } from 'lucide-react';

interface CabinCategoryCardComponentProps {
  categoryCard: CabinCategoryCard;
  availableCount: number;
  onOpenBooking: (cabinType: 'two_seat' | 'three_seat') => void;
  onOpenDetailModal: (categoryCard: CabinCategoryCard) => void;
}

export const CabinCategoryCardComponent: React.FC<CabinCategoryCardComponentProps> = ({
  categoryCard,
  availableCount,
  onOpenBooking,
  onOpenDetailModal
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % categoryCard.photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + categoryCard.photos.length) % categoryCard.photos.length);
  };

  return (
    <div className="bg-white rounded-[32px] overflow-hidden border border-[#4A3525]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      
      {/* Carousel Header */}
      <div className="h-64 sm:h-72 relative overflow-hidden bg-[#4A3525]/10 cursor-pointer" onClick={() => onOpenDetailModal(categoryCard)}>
        <img
          src={getImageUrl(categoryCard.photos[currentPhotoIndex])}
          alt={categoryCard.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Category Badge & Stock availability */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          {categoryCard.badge && (
            <span className="bg-[#2D5A27] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {categoryCard.badge}
            </span>
          )}

          {/* Dynamic Availability Tracker Badge */}
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full shadow-md ${
            availableCount > 0
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}>
            {availableCount > 0
              ? `Доступно ${availableCount} из ${categoryCard.totalStock}`
              : `Занято на эти даты`}
          </span>
        </div>

        {/* Carousel controls */}
        {categoryCard.photos.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextPhoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Photo Counter */}
            <div className="absolute bottom-3 right-4 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
              {currentPhotoIndex + 1} / {categoryCard.photos.length} фото
            </div>
          </>
        )}
      </div>

      {/* Body Content */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
        
        <div className="space-y-4">
          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-2xl font-bold text-[#4A3525]">
                {categoryCard.title}
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#2D5A27] mt-0.5">
              {categoryCard.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#4A3525]/80 leading-relaxed">
            {categoryCard.shortDescription}
          </p>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#4A3525]/10">
            <div className="flex items-center gap-2 text-[#4A3525]">
              <Users className="w-4 h-4 text-[#2D5A27]" />
              <span><strong>Вместимость:</strong> {categoryCard.capacity} чел.</span>
            </div>
            <div className="flex items-center gap-2 text-[#4A3525]">
              {categoryCard.bathroomType === 'bathtub' ? (
                <Bath className="w-4 h-4 text-[#2D5A27]" />
              ) : (
                <ShowerHead className="w-4 h-4 text-[#2D5A27]" />
              )}
              <span>
                <strong>Удобства:</strong> {categoryCard.bathroomType === 'bathtub' ? 'С ванной' : 'С душем'}
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-[#4A3525] pt-1">
              <BedDouble className="w-4 h-4 text-[#2D5A27] shrink-0" />
              <span className="truncate">{categoryCard.sleepingPlaces}</span>
            </div>
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categoryCard.amenities.slice(0, 5).map((amenityId) => {
              const amenity = AMENITIES_DICTIONARY[amenityId];
              if (!amenity) return null;
              return (
                <span
                  key={amenityId}
                  className="bg-[#2D5A27]/5 text-[#2D5A27] text-[11px] font-medium px-2.5 py-1 rounded-lg"
                >
                  {amenity.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Pricing & Booking Footer */}
        <div className="pt-4 border-t border-[#4A3525]/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#4A3525]/60 font-semibold block uppercase tracking-wider">Фиксированная цена:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-[#2D5A27]">
                  7 000 ₽ <span className="text-xs text-[#4A3525]/60 font-normal">/пн-чт</span>
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  9 000 ₽ пт-вс
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenDetailModal(categoryCard)}
              className="w-full bg-[#FDFBF7] hover:bg-[#2D5A27]/10 text-[#4A3525] font-bold text-xs py-3 px-3 rounded-2xl border border-[#4A3525]/15 transition-colors cursor-pointer text-center"
            >
              Подробнее и фото
            </button>

            <button
              onClick={() => onOpenBooking(categoryCard.cabinType)}
              className="w-full bg-[#2D5A27] hover:bg-[#1E3A1A] text-white font-bold text-xs py-3 px-3 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Забронировать</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
