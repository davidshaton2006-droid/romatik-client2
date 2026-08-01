import React, { useState } from 'react';
import { Calendar, Users, Sparkles, Search, Trees, ShieldCheck, Heart, Bath } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

interface HeroProps {
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  onOpenBookingModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onOpenBookingModal }) => {
  const [checkIn, setCheckIn] = useState('2026-08-01');
  const [checkOut, setCheckOut] = useState('2026-08-03');
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(checkIn, checkOut, guests);
  };

  return (
    <section id="hero" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Hero Banner with Forest Card (Natural Tones) */}
        <div className="lg:col-span-7 relative rounded-[40px] bg-[#2D5A27] p-8 sm:p-12 text-white flex flex-col justify-between overflow-hidden shadow-2xl shadow-[#2D5A27]/20 min-h-[440px]">
          
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={getImageUrl('https://disk.yandex.ru/i/jyaRH0rQHxp9xA')}
              alt="База отдыха Романтик"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover mix-blend-overlay opacity-80 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#2D5A27]/60 via-[#2D5A27]/75 to-[#1A1A1A]/85"></div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/30 text-emerald-100">
              <Trees className="w-4 h-4 text-emerald-300" />
              <span>Краснодарский край • ст. Ставропольская</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight drop-shadow-sm">
              База отдыха «Романтик» <br className="hidden sm:inline" />в настоящем лесу
            </h2>

            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
              Абсолютная тишина, сосны и дубы, 20 уютных домиков с проекторами Smart TV, подогреваемый бассейн, костровая зона и настоящие лесные еноты 🦝.
            </p>
          </div>

          {/* Badges strip */}
          <div className="relative z-10 pt-6 flex flex-wrap gap-2.5">
            <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/30 flex items-center gap-1.5">
              <span>🦝 Живые еноты</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/30 flex items-center gap-1.5">
              <span>🏊 Подогреваемый бассейн</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/30 flex items-center gap-1.5">
              <span>📽️ Проекторы Smart TV</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5">
              <span>💳 Единая цена: 7 000 ₽ / 9 000 ₽</span>
            </div>
          </div>

        </div>

        {/* Right Side: Quick Booking & Search Panel (Natural Tones) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-[#4A3525]/10 space-y-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-bold text-[#4A3525]">
                  Поиск и выбор дат
                </h3>
                <span className="text-[10px] uppercase font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-3 py-1 rounded-full">
                  Онлайн Бронь
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#4A3525]/60 ml-1 block mb-1">
                      Заезд
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full p-3 bg-[#FDFBF7] rounded-2xl border border-[#4A3525]/10 text-sm font-semibold text-[#4A3525] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#4A3525]/60 ml-1 block mb-1">
                      Выезд
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full p-3 bg-[#FDFBF7] rounded-2xl border border-[#4A3525]/10 text-sm font-semibold text-[#4A3525] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#4A3525]/60 ml-1 block mb-1">
                    Гости
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-3 bg-[#FDFBF7] rounded-2xl border border-[#4A3525]/10 text-sm font-semibold text-[#4A3525] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
                  >
                    <option value={1}>1 гость (Отдых соло)</option>
                    <option value={2}>2 взрослых (Пара)</option>
                    <option value={4}>3-4 гостей (Семья)</option>
                    <option value={6}>5-6 гостей (Компания)</option>
                    <option value={8}>7+ гостей (Свадьба / Группа)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3A1A] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#2D5A27]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  НАЙТИ СВОБОДНЫЕ ДОМИКИ
                </button>
              </form>
            </div>

            {/* Quick feature indicators */}
            <div className="pt-4 border-t border-[#4A3525]/10 flex items-center justify-between text-xs text-[#4A3525]/70">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" /> Без комиссии
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Sparkles className="w-4 h-4 text-[#2D5A27]" /> Мгновенное подтверждение
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
