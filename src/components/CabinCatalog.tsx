import React, { useState, useMemo } from 'react';
import { Booking, CabinCategoryCard } from '../types';
import { CABIN_CATEGORIES } from '../data/mockCabins';
import { calculateAvailability } from '../api/client';
import { CabinCategoryCardComponent } from './CabinCategoryCardComponent';
import { FullResortRentalCard } from './FullResortRentalCard';
import { Calendar, Search, ArrowRight, ShieldCheck, Users } from 'lucide-react';

interface CabinCatalogProps {
  bookings: Booking[];
  onOpenCategoryDetail: (categoryCard: CabinCategoryCard) => void;
}

export const CabinCatalog: React.FC<CabinCatalogProps> = ({
  bookings,
  onOpenCategoryDetail
}) => {
  const [checkIn, setCheckIn] = useState<string>('2026-08-01');
  const [checkOut, setCheckOut] = useState<string>('2026-08-03');
  const [guestsCount, setGuestsCount] = useState<number>(2);

  // Dynamic Availability Tracker
  const availability = useMemo(() => {
    return calculateAvailability(bookings, checkIn, checkOut);
  }, [bookings, checkIn, checkOut]);

  const handleContactBuyout = (channel: 'max' | 'telegram' | 'phone') => {
    if (channel === 'max') {
      window.open('https://max.ru/u/f9LHodD0cOIeGxXmIVw7bqQ7hqCUZM9gGdaZRPoaE0tcO56NWn6cKZpuboc', '_blank');
    } else if (channel === 'telegram') {
      window.open('tg://resolve?domain=romantik_base&text=Здравствуйте!%20Хочу%20узнать%20стоимость%20аренды%20всей%20базы%20«Романтик»%20под%20ключ.', '_blank');
    } else {
      window.location.href = 'tel:+79184440406';
    }
  };

  return (
    <section id="cabins" className="py-12 sm:py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#4A3525]/10 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-3 py-1 rounded-full">
              Каталог категорий проживания
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3525] mt-2">
              Варианты размещения
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-[#4A3525]/80 max-w-lg space-y-1">
            <p className="font-medium">
              17 эко-домиков в сосновом бору с ванной или душем, проекторами Smart TV и панорамными окнами.
            </p>
            <p className="text-xs text-[#2D5A27] font-semibold">
              💡 Фиксированная цена: 7 000 ₽ (пн-чт) / 9 000 ₽ (пт-вс)
            </p>
          </div>
        </div>

        {/* Dynamic Availability Tracker Bar */}
        <div className="bg-white p-6 rounded-[32px] border border-[#4A3525]/10 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4A3525]/10 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2D5A27]" />
              <h3 className="font-serif text-lg font-bold text-[#4A3525]">
                Проверить свободные места на ваши даты
              </h3>
            </div>
            <span className="text-xs text-[#2D5A27] font-bold bg-[#2D5A27]/10 px-3 py-1 rounded-full w-fit">
              Авто-подсчёт остатков в реальном времени
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-[#4A3525]/70 mb-1">Дата заезда (с 15:00)</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#4A3525]/15 rounded-2xl p-3 text-xs font-bold text-[#4A3525] focus:ring-2 focus:ring-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3525]/70 mb-1">Дата выезда (до 12:00)</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#4A3525]/15 rounded-2xl p-3 text-xs font-bold text-[#4A3525] focus:ring-2 focus:ring-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3525]/70 mb-1">Количество гостей</label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3525]/50" />
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-3 bg-[#FDFBF7] border border-[#4A3525]/15 rounded-2xl text-xs font-bold text-[#4A3525]"
                >
                  <option value={2}>2 гостей (Пара)</option>
                  <option value={3}>3 гостей (Семья)</option>
                  <option value={4}>4+ гостей (Большая компания)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Availability Status Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold bg-[#2D5A27]/5 p-4 rounded-2xl border border-[#2D5A27]/10">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#4A3525]">Результат расчета на {checkIn} — {checkOut}:</span>
              <span className="bg-emerald-100 text-[#2D5A27] px-3 py-1 rounded-full font-bold">
                🛏️ Двухместные: Доступно {availability.availableDouble} из 7
              </span>
              <span className="bg-emerald-100 text-[#2D5A27] px-3 py-1 rounded-full font-bold">
                🛏️ Трёхместные: Доступно {availability.availableTriple} из 10
              </span>
            </div>
            
            {guestsCount > 3 && (
              <span className="text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                💡 Для {guestsCount} гостей советуем выбрать 2 домика
              </span>
            )}
          </div>
        </div>

        {/* Categories Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Double Cabin Category Card */}
          <CabinCategoryCardComponent
            categoryCard={CABIN_CATEGORIES[0]}
            availableCount={availability.availableDouble}
            onOpenDetailModal={onOpenCategoryDetail}
          />

          {/* Triple Cabin Category Card */}
          <CabinCategoryCardComponent
            categoryCard={CABIN_CATEGORIES[1]}
            availableCount={availability.availableTriple}
            onOpenDetailModal={onOpenCategoryDetail}
          />

          {/* Special Full Resort Buyout Card */}
          <FullResortRentalCard
            onContactClick={handleContactBuyout}
          />

        </div>

      </div>
    </section>
  );
};
