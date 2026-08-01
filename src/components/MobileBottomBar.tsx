import React from 'react';
import { Calendar, Home, Trees, Smartphone, Phone } from 'lucide-react';

interface MobileBottomBarProps {
  currentView: 'guest' | 'staff';
  onViewChange: (view: 'guest' | 'staff') => void;
  onOpenBookingModal: () => void;
  onScrollToSection: (id: string) => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentView,
  onViewChange,
  onOpenBookingModal,
  onScrollToSection
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#2D5A27]/20 p-2 sm:hidden shadow-2xl">
      <div className="grid grid-cols-5 gap-1 text-center items-center">
        
        {/* Home / Catalog */}
        <button
          onClick={() => {
            if (currentView === 'staff') onViewChange('guest');
            onScrollToSection('catalog');
          }}
          className="flex flex-col items-center justify-center p-1.5 text-[#4A3525] hover:text-[#2D5A27]"
        >
          <Home className="w-5 h-5 text-[#2D5A27]" />
          <span className="text-[10px] font-medium mt-0.5">Домики</span>
        </button>

        {/* Territory */}
        <button
          onClick={() => {
            if (currentView === 'staff') onViewChange('guest');
            onScrollToSection('territory');
          }}
          className="flex flex-col items-center justify-center p-1.5 text-[#4A3525] hover:text-[#2D5A27]"
        >
          <Trees className="w-5 h-5 text-[#2D5A27]" />
          <span className="text-[10px] font-medium mt-0.5">Баня & Чан</span>
        </button>

        {/* Primary Booking CTA */}
        <button
          onClick={onOpenBookingModal}
          className="flex flex-col items-center justify-center bg-[#2D5A27] text-white p-2 rounded-2xl shadow-md active:scale-95"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Бронь</span>
        </button>

        {/* Staff PWA */}
        <button
          onClick={() => onViewChange(currentView === 'guest' ? 'staff' : 'guest')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
            currentView === 'staff' ? 'text-amber-600 bg-amber-50 font-bold' : 'text-[#4A3525]'
          }`}
        >
          <Smartphone className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] font-medium mt-0.5">PWA</span>
        </button>

        {/* Call */}
        <a
          href="tel:+79130000000"
          className="flex flex-col items-center justify-center p-1.5 text-[#4A3525] hover:text-[#2D5A27]"
        >
          <Phone className="w-5 h-5 text-[#2D5A27]" />
          <span className="text-[10px] font-medium mt-0.5">Звонок</span>
        </a>

      </div>
    </div>
  );
};
