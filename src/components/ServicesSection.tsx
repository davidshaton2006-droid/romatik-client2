import React from 'react';
import { Flame, Clock, Check, Calendar, UtensilsCrossed, Waves } from 'lucide-react';
import { FALLBACK_IMAGES } from '../utils/imageUtils';
import { SmartImage } from './SmartImage';

interface ServicesSectionProps {
  onOpenBookingModal: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBookingModal }) => {
  const services = [
    {
      id: 'sauna',
      title: '♨️ Русская баня на дровах',
      price: '3 000 ₽ / 2 часа',
      duration: '2 часа комфортного парения',
      description: 'Настоящая дровяная парная с гималайской солью, березовыми вениками и ароматным эфирным маслом. Освежающий обливной ушат после парения.',
      image: 'https://disk.yandex.ru/i/VVHC-GZ8cfZ21Q',
      fallback: FALLBACK_IMAGES.sauna,
      features: [
        'Печь на дубовых и березовых дровах',
        'Ароматные веники и травяной чай',
        'Просторная комната отдыха',
        'Банные шапочки и простыни включены'
      ]
    },
    {
      id: 'chan',
      title: '🪵 Горячий сибирский чан',
      price: '5 000 ₽ / 2 часа',
      duration: '2 часа расслабления на свежем воздухе',
      description: 'Горячий купель под открытым небом с панорамным видом на сосновый бор. Наполняется чистейшей водой с добавлением хвои, цитрусовых и лесных трав.',
      image: 'https://disk.yandex.ru/i/OauMGPHtsUYXPg',
      fallback: FALLBACK_IMAGES.chan,
      features: [
        'Парение под открытым звездным небом',
        'Добавление хвои, апельсинов и трав',
        'Температура воды поддерживается +38...40°C',
        'Незабываемый релакс для всей семьи'
      ]
    },
    {
      id: 'cafe',
      title: '☕ Кафе & Лесной бар',
      price: 'Питание по меню',
      duration: 'Работает ежедневно с 08:00 до 22:00',
      description: 'Уютное эко-кафе на территории базы. Комплексные завтраки, натуральный свежесваренный кофе, травяные чаи, прохладительные напитки и снеки.',
      image: 'https://disk.yandex.ru/i/uRheTuXizIMkTQ',
      fallback: FALLBACK_IMAGES.cafe,
      features: [
        'Фермерские комплексные завтраки',
        'Бесплатный холодильник и СВЧ в кафе',
        'Свежесваренный кофе и десерты',
        'Разрешено привозить свою еду'
      ]
    }
  ];

  return (
    <section className="py-8 sm:py-12 bg-[#FDFBF7] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Title */}
        <div className="border-b border-[#4A3525]/10 pb-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-3 py-1 rounded-full">
            Банный комплекс и гастрономия
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3525] mt-2">
            Дополнительные услуги
          </h2>
          <p className="text-xs sm:text-sm text-[#4A3525]/80 mt-1 font-medium">
            Русская баня на дровах, горячий Сибирский чан и лесное кафе для полноценного восстановления сил.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-[32px] overflow-hidden border border-[#4A3525]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Header */}
                <div className="h-52 relative overflow-hidden bg-[#4A3525]/10">
                  <SmartImage
                    src={service.image}
                    alt={service.title}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    onError={(e) => {
                      if (service.fallback && e.currentTarget.src !== service.fallback) {
                        e.currentTarget.src = service.fallback;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <span className="absolute top-4 right-4 bg-[#2D5A27] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                    {service.price}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A3525]">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#2D5A27] font-semibold mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A3525]/80 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#4A3525]/10">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#4A3525]">
                        <Check className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={onOpenBookingModal}
                  className="w-full bg-[#2D5A27] hover:bg-[#1E3A1A] text-white font-bold text-xs py-3.5 px-4 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Заказать услугу</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
