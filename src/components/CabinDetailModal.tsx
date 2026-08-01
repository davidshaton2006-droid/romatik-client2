import React, { useState } from 'react';
import { CabinCategoryCard } from '../types';
import { AMENITIES_DICTIONARY } from '../data/mockCabins';
import { SmartImage } from './SmartImage';
import { X, Users, BedDouble, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Bath, ShowerHead, Trees, Sparkles } from 'lucide-react';

interface CabinDetailModalProps {
  categoryCard: CabinCategoryCard | null;
  onClose: () => void;
  onOpenBooking: (cabinType: 'two_seat' | 'three_seat') => void;
}

export const CabinDetailModal: React.FC<CabinDetailModalProps> = ({
  categoryCard,
  onClose,
  onOpenBooking
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!categoryCard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FDFBF7] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-[#4A3525]/10 relative my-6">
        
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Hero */}
        <div className="relative h-72 sm:h-96 bg-slate-900">
          <SmartImage
            src={categoryCard.photos[activePhotoIndex] || categoryCard.photos[0]}
            alt={categoryCard.title}
            referrerPolicy="no-referrer"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Photo Navigation Controls */}
          {categoryCard.photos.length > 1 && (
            <>
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev - 1 + categoryCard.photos.length) % categoryCard.photos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActivePhotoIndex((prev) => (prev + 1) % categoryCard.photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Badge & Photo Counter */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-[#2D5A27] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {categoryCard.title}
            </span>

            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xs">
              {activePhotoIndex + 1} / {categoryCard.photos.length} фото
            </span>
          </div>
        </div>

        {/* Thumbnails Row */}
        <div className="bg-[#4A3525]/10 p-3 flex gap-2 overflow-x-auto scrollbar-none">
          {categoryCard.photos.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhotoIndex(idx)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activePhotoIndex === idx ? 'border-[#2D5A27] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <SmartImage
                src={img}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </button>
          ))}
        </div>

        {/* Modal Details */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3525]">
              {categoryCard.title}
            </h2>
            <p className="text-xs font-semibold text-[#2D5A27] mt-1">
              {categoryCard.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#4A3525]/80 leading-relaxed">
            {categoryCard.fullDescription}
          </p>

          {/* Key Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-[#4A3525]/10">
            <div className="flex items-center gap-2 text-[#4A3525]">
              <Users className="w-4 h-4 text-[#2D5A27]" />
              <span><strong>Вместимость:</strong> {categoryCard.capacity} гостей</span>
            </div>
            <div className="flex items-center gap-2 text-[#4A3525]">
              {categoryCard.bathroomType === 'bathtub' ? (
                <Bath className="w-4 h-4 text-[#2D5A27]" />
              ) : (
                <ShowerHead className="w-4 h-4 text-[#2D5A27]" />
              )}
              <span><strong>Санузел:</strong> {categoryCard.bathroomType === 'bathtub' ? 'Ванная комната с ванной' : 'Душевая кабина'}</span>
            </div>
            <div className="col-span-1 sm:col-span-2 flex items-center gap-2 text-[#4A3525]">
              <BedDouble className="w-4 h-4 text-[#2D5A27]" />
              <span><strong>Спальные места:</strong> {categoryCard.sleepingPlaces}</span>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-[#4A3525] text-sm">В комплектацию домика входит:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {categoryCard.amenities.map((amenityId) => {
                const amenity = AMENITIES_DICTIONARY[amenityId];
                if (!amenity) return null;
                return (
                  <div key={amenityId} className="flex items-center gap-2 text-[#4A3525]">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#4A3525]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#4A3525]/60 uppercase tracking-widest font-bold block">Стоимость проживания:</span>
              <span className="text-xl font-extrabold text-[#2D5A27]">
                7 000 ₽ <span className="text-xs text-[#4A3525]/60 font-normal">будни / 9 000 ₽ выходные</span>
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenBooking(categoryCard.cabinType);
              }}
              className="w-full sm:w-auto bg-[#2D5A27] hover:bg-[#1E3A1A] text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>ЗАБРОНИРОВАТЬ ЭТОТ ДОМИК</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
