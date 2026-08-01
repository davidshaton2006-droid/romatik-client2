import React from 'react';
import { Flame, Bath, UtensilsCrossed, Waves, Smile, Coffee, Trees, Check, Calendar } from 'lucide-react';
import { FALLBACK_IMAGES } from '../utils/imageUtils';
import { SmartImage } from './SmartImage';

interface TerritorySectionProps {
  onOpenBookingModal: () => void;
}

export const TerritorySection: React.FC<TerritorySectionProps> = ({ onOpenBookingModal }) => {
  const items = [
    {
      id: 'pool',
      title: 'Подогреваемый бассейн (взрослый + детский)',
      tag: 'Включено в проживание',
      description: 'Большой открытый бассейн с подогревом. Включает комфортную взрослую зону и неглубокую безопасную детскую секцию. Работает ежедневно с 09:00 до 22:00.',
      icon: Waves,
      price: 'Бесплатно для гостей',
      image: 'https://disk.yandex.ru/i/4AWcmVhye1ZUnQ',
      fallback: FALLBACK_IMAGES.pool,
      features: ['Отдельная неглубокая детская зона', 'Работает ежедневно 09:00 - 22:00', 'Комфортная температура воды', 'Шезлонги для отдыха']
    },
    {
      id: 'raccoons',
      title: 'Настоящие еноты на территории 🦝',
      tag: 'Уникальная фишка USP',
      description: 'Наша главная любовь и гордость! На территории базы отдыха в лесу живут настоящий пушистые еноты, которые иногда выходят к гостям и создают непередаваемые радостные эмоции.',
      icon: Smile,
      price: 'Бесплатные эмоции',
      image: 'https://disk.yandex.ru/i/gvjU5RMeWFHv5A',
      fallback: FALLBACK_IMAGES.raccoons,
      features: ['Естественная среда в лесу', 'Восторг для детей и взрослых', 'Уникальные фото на память', 'Доброжелательные еноты']
    },
    {
      id: 'campfire',
      title: 'Атмосферная костровая зона',
      tag: 'Включено в проживание',
      description: 'Уютная локация под кронами сосен для вечерних посиделок у открытого огня. Удобные шезлонги и бесплатные дрова для всех гостей.',
      icon: Trees,
      price: 'Дрова бесплатно',
      image: 'https://disk.yandex.ru/i/sTLb7X06M3Hw2w',
      fallback: FALLBACK_IMAGES.campfire,
      features: ['Удобные глубокие шезлонги', 'Дрова предоставляются бесплатно', 'Вечерняя душевная атмосфера', 'Теплые пледы']
    },
    {
      id: 'bbq',
      title: 'Мангальная зона (3 мангала + 1 гриль)',
      tag: 'Своя еда без ограничений',
      description: '3 классических мангала и 1 большой гриль. Разрешено привозить свои продукты и любые напитки без ограничений и сборов! (Рекомендуем взять свои шампуры и решётки).',
      icon: UtensilsCrossed,
      price: 'Бесплатно для гостей',
      image: 'https://disk.yandex.ru/i/Sg8CYcymNq0bhw',
      fallback: FALLBACK_IMAGES.bbq,
      features: ['3 мангала + 1 гриль', 'Разрешено привозить свои продукты', 'Без пробкового сбора', 'Подсветка в вечернее время']
    },
    {
      id: 'cafe',
      title: 'Кафе и Бар на территории',
      tag: 'Вкусное питание',
      description: 'Кафе с обновляемым Меню Дня и бар с напитками. В кафе гости могут бесплатно пользоваться холодильником, микроволновкой, чайником и посудой для хранения и разогрева своей еды.',
      icon: Coffee,
      price: 'Питание по меню дня',
      image: 'https://disk.yandex.ru/i/uRheTuXizIMkTQ',
      fallback: FALLBACK_IMAGES.cafe,
      features: ['Ежедневное Меню Дня', 'Бесплатный холодильник & СВЧ', 'Чайник и посуда для своей еды', 'Заботливый персонал 24/7']
    },
    {
      id: 'chan',
      title: 'Горячий Сибирский чан / купель',
      tag: 'Дополнительная услуга',
      description: 'Горячий чан на дровах под соснами с добавлением пихтовых веток, алтайских трав и цитрусов. Вода разогревается до комфортных +40°C.',
      icon: Bath,
      price: '5 000 ₽ / 2 часа',
      image: 'https://disk.yandex.ru/i/OauMGPHtsUYXPg',
      fallback: FALLBACK_IMAGES.chan,
      features: ['Запарка из алтайских трав', 'Пихтовые ветки и цитрусы', 'Индивидуальная терраса', 'Вечерняя подсветка']
    },
    {
      id: 'sauna',
      title: 'Настоящая Русская баня на дровах',
      tag: 'Дополнительная услуга',
      description: 'Просторная парная из сруба на дровах, ароматы березовых и дубовых веников, травяной чай и уютная комната отдыха.',
      icon: Flame,
      price: '3 000 ₽ / 2 часа',
      image: 'https://disk.yandex.ru/i/VVHC-GZ8cfZ21Q',
      fallback: FALLBACK_IMAGES.sauna,
      features: ['Дубовые и берёзовые веники', 'Парная на дровах', 'Чай из самовара с мёдом', 'Комната отдыха']
    }
  ];

  return (
    <section id="territory" className="py-12 sm:py-20 bg-[#FDFBF7] border-t border-[#4A3525]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D5A27] bg-[#2D5A27]/10 px-3.5 py-1 rounded-full">
            Инфраструктура и Услуги
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3525] tracking-tight">
            Всё для идеального отдыха в лесу
          </h2>
          <p className="text-[#4A3525]/80 text-sm sm:text-base leading-relaxed">
            Краснодарский край, Северский район, станица Ставропольская — лесная тишина, еноты, подогреваемый бассейн и камины.
          </p>
        </div>

        {/* Grid of Facilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-[32px] overflow-hidden border border-[#4A3525]/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-52 overflow-hidden bg-[#4A3525]/10">
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      decoding="async"
                      onError={(e) => {
                        if (item.fallback && e.currentTarget.src !== item.fallback) {
                          e.currentTarget.src = item.fallback;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 bg-[#2D5A27] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase">
                      {item.tag}
                    </span>
                    <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-[#2D5A27] text-xs font-bold px-3.5 py-1.5 rounded-2xl shadow-sm">
                      {item.price}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#4A3525] leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-[#4A3525]/80 text-xs leading-relaxed">
                      {item.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1 pt-2">
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-[#4A3525]">
                          <Check className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-[#4A3525]/10 mt-2">
                  <button
                    onClick={onOpenBookingModal}
                    className="w-full bg-[#FDFBF7] border border-[#2D5A27]/20 hover:bg-[#2D5A27] text-[#2D5A27] hover:text-white py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    ЗАБРОНИРОВАТЬ
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Bar */}
        <div className="bg-[#2D5A27]/5 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#2D5A27]/15">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦝</span>
            <div>
              <h4 className="font-serif font-bold text-[#4A3525]">Уникальная атмосфера дикой природы</h4>
              <p className="text-xs text-[#4A3525]/70">Персонал на территории находится 24/7 для помощи гостям</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <div className="px-4 py-2 bg-white rounded-2xl text-xs font-semibold shadow-xs border border-[#4A3525]/10 text-[#4A3525]">
              🏊 Подогреваемый бассейн
            </div>
            <div className="px-4 py-2 bg-white rounded-2xl text-xs font-semibold shadow-xs border border-[#4A3525]/10 text-[#4A3525]">
              🦝 Настоящие еноты
            </div>
            <div className="px-4 py-2 bg-white rounded-2xl text-xs font-semibold shadow-xs border border-[#4A3525]/10 text-[#4A3525]">
              🔥 Бесплатные дрова
            </div>
            <div className="px-4 py-2 bg-white rounded-2xl text-xs font-semibold shadow-xs border border-[#4A3525]/10 text-[#4A3525]">
              🥗 Свои продукты разрешены
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
