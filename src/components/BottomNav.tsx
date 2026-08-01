import React from 'react';
import { Home, Trees, Flame, Phone } from 'lucide-react';

export type TabType = 'cabins' | 'territory' | 'services' | 'contacts';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'cabins' as TabType,
      label: 'Домики',
      icon: Home
    },
    {
      id: 'territory' as TabType,
      label: 'Территория',
      icon: Trees
    },
    {
      id: 'services' as TabType,
      label: 'Услуги',
      icon: Flame
    },
    {
      id: 'contacts' as TabType,
      label: 'Контакты',
      icon: Phone
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#4A3525]/10 shadow-2xl px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#2D5A27] bg-[#2D5A27]/10 font-bold scale-102'
                  : 'text-[#4A3525]/60 hover:text-[#4A3525] font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#2D5A27]' : ''}`} />
              <span className="text-[11px] leading-tight mt-1 truncate">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
