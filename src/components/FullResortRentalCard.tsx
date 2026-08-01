import React from 'react';
import { PartyPopper, Phone, MessageSquare, Check, Trees, Sparkles, Waves, Flame } from 'lucide-react';

interface FullResortRentalCardProps {
  onContactClick: (channel: 'max' | 'telegram' | 'phone') => void;
}

export const FullResortRentalCard: React.FC<FullResortRentalCardProps> = ({ onContactClick }) => {
  return (
    <div className="bg-gradient-to-br from-[#2D5A27] via-[#1E3A1A] to-[#142611] text-white rounded-[32px] overflow-hidden shadow-xl border border-emerald-500/20 flex flex-col justify-between p-6 sm:p-8 relative group">
      
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
            <PartyPopper className="w-4 h-4 text-amber-300" />
            Спец-предложение
          </span>
          <span className="text-xs text-emerald-200/80 font-semibold bg-white/10 px-3 py-1 rounded-full">
            17 домиков + Вся территория
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            🎉 Аренда всей базы под ключ
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Закрытие всей территории базы отдыха «Романтик» под ваше закрытое мероприятие, свадьбу, день рождения или корпоратив.
          </p>
        </div>

        {/* What's included */}
        <div className="space-y-2 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs">
          <span className="text-emerald-200 font-bold uppercase text-[10px] tracking-wider block mb-1">
            В стоимость включено:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-50">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Все 17 домиков (до 44 гостей)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Подогреваемый бассейн без посторонних</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Костровая и 4 мангальные зоны</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Баня, Сибирский чан и Кафе-бар</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Pricing & Inquiry Actions */}
      <div className="pt-6 border-t border-white/15 space-y-4 relative z-10 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-200 uppercase tracking-widest block font-bold">Стоимость аренды:</span>
            <span className="font-serif text-2xl font-extrabold text-amber-300">
              Расчет по запросу
            </span>
          </div>
          <span className="text-[11px] text-emerald-100/80 bg-white/10 px-3 py-1 rounded-xl">
            Индивидуальные условия
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onContactClick('max')}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <MessageSquare className="w-4 h-4 text-indigo-100" />
            <span>УЗНАТЬ СТОИМОСТЬ В MAX</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onContactClick('telegram')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3 rounded-2xl transition-colors cursor-pointer text-center"
            >
              Написать в Telegram
            </button>
            <button
              onClick={() => onContactClick('phone')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3 rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Позвонить</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
