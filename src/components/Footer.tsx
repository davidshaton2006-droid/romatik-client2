import React from 'react';
import { Trees, Phone, MapPin, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onTabChange?: (tab: 'cabins' | 'territory' | 'services' | 'contacts') => void;
  onOpenBookingModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenBookingModal }) => {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-12 pb-28 sm:pb-16 border-t border-[#4A3525]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-white">
                <Trees className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">РОМАНТИК</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Эко-база отдыха в дубово-сосновом лесу. 17 уютных домиков, бассейн, банный чан, русская баня и еноты на территории.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-[#2D5A27]/30 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-semibold border border-[#2D5A27]/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Эко-отдых в лесу 2026</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Разделы</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onTabChange?.('cabins')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  🏡 Домики и бронирование
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange?.('territory')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  🌲 Бассейн и Территория
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange?.('services')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  ♨️ Баня, Чан и Кафе
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange?.('contacts')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  📞 Контакты и Правила
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Контакты</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:+79184440406" className="hover:underline font-bold text-emerald-300">8 (918) 444-04-06</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <a
                  href="https://yandex.ru/maps/org/romantik/126160966311/?ll=38.876485%2C44.702748&z=12.3"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-emerald-300"
                >
                  Краснодарский край, Северский район, ст. Ставропольская
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>info@romantic-resort.ru</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://api.whatsapp.com/send?phone=79184440406&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5.%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%B1%D1%80%D0%BE%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%B4%D0%BE%D0%BC%D0%B8%D0%BA%21"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                WhatsApp
              </a>
              <a
                href="tg://resolve?domain=romantik_base&text=Здравствуйте.%20Хочу%20забронировать%20домик%21"
                className="bg-white/10 hover:bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Telegram
              </a>
              <a
                href="https://max.ru/u/f9LHodD0cOIeGxXmIVw7bqQ7hqCUZM9gGdaZRPoaE0tcO56NWn6cKZpuboc"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                MAX
              </a>
              <a
                href="https://www.instagram.com/romantik_base/"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-fuchsia-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Col 4: Action */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Быстрое бронирование</h4>
            <p className="text-xs text-white/70">
              Выбирайте удобные даты и бронируйте домик напрямую.
            </p>
            <button
              onClick={onOpenBookingModal}
              className="w-full bg-[#2D5A27] hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-colors shadow-md cursor-pointer"
            >
              Забронировать домик
            </button>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 text-center text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 База отдыха «Романтик». Все права защищены.</p>
          <p className="flex items-center gap-1">
            Сделано с любовью к природе <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </p>
        </div>

      </div>
    </footer>
  );
};
