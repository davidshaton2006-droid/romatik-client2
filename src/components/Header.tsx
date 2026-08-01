import React from 'react';
import { Trees, Calendar, Phone } from 'lucide-react';

interface HeaderProps {
  onOpenBookingModal: (cabinType?: 'two_seat' | 'three_seat') => void;
  onBrandClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBookingModal,
  onBrandClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#4A3525]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={onBrandClick}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#2D5A27] leading-tight">
              РОМАНТИК
            </h1>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#4A3525]/60 font-semibold">
              Эко-база отдыха
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Phone Link */}
          <a
            href="tel:+79184440406"
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#2D5A27] bg-[#2D5A27]/10 hover:bg-[#2D5A27]/20 px-3.5 py-2 rounded-2xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>8 (918) 444-04-06</span>
          </a>

          {/* Accent Booking Button */}
          <button
            onClick={() => onOpenBookingModal()}
            className="flex items-center gap-1.5 bg-[#2D5A27] hover:bg-[#1E3A1A] text-white px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
          >
            <Calendar className="w-4 h-4 text-emerald-200" />
            <span>Забронировать</span>
          </button>
        </div>

      </div>
    </header>
  );
};

