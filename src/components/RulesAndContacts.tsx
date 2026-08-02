import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, MessageSquare, Clock, AlertTriangle, Navigation, ExternalLink, Trees, CreditCard, Ban } from 'lucide-react';

export const RulesAndContacts: React.FC = () => {
  return (
    <section id="rules" className="py-12 sm:py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Rules Header & Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D5A27] bg-[#2D5A27]/10 px-3.5 py-1 rounded-full">
              Актуальные правила и условия
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3525] tracking-tight">
              Условия бронирования и правила отдыха
            </h2>
            <p className="text-[#4A3525]/80 text-sm sm:text-base">
              Прозрачная ценовая политика и простые правила для вашего комфорта.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Pricing & Booking */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#4A3525]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#4A3525]">Ценовая политика и бронь</h3>
              <ul className="space-y-2 text-xs text-[#4A3525]/80">
                <li className="flex justify-between border-b border-[#4A3525]/10 pb-1">
                  <span>Будние дни (Пн – Чт):</span>
                  <strong className="text-[#2D5A27]">7 000 ₽ / ночь</strong>
                </li>
                <li className="flex justify-between border-b border-[#4A3525]/10 pb-1">
                  <span>Выходные (Пт – Вс):</span>
                  <strong className="text-amber-800">9 000 ₽ / ночь</strong>
                </li>
                <li>• <strong>Доплата за 3-го взрослого:</strong> +1 000 ₽ / сутки в трёхместных домиках (дети до 10 лет проживают <strong>бесплатно</strong>).</li>
                <li>• <strong>Предоплата:</strong> Для фиксации бронирования вносится <strong>100%</strong> от общей стоимости.</li>
              </ul>
            </div>

            {/* Card 2: Cancellation Policy */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-200/60 bg-rose-50/20 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-rose-900">Условия отмены брони</h3>
              <ul className="space-y-2 text-xs text-[#4A3525]/90">
                <li className="bg-white p-3 rounded-xl border border-rose-200 text-rose-950 font-semibold">
                  ⚠️ При отмене бронирования со стороны гостя предоплата <strong>НЕ возвращается</strong>.
                </li>
                <li>• Пожалуйста, планируйте даты поездки заранее во избежание финансовых потерь.</li>
                <li>• Время заезда — с <strong>15:00</strong>, время выезда — до <strong>12:00</strong>.</li>
              </ul>
            </div>

            {/* Card 3: Food & Quiet Hours */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#4A3525]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#4A3525]">Продукты & Сервис</h3>
              <ul className="space-y-2 text-xs text-[#4A3525]/80">
                <li>• Разрешено привозить свои продукты и любые напитки без ограничений и пробкового сбора.</li>
                <li>• В нашем кафе можно бесплатно хранить и разогревать свою еду.</li>
                <li>• Тихий час на территории с 22:00 до 08:00.</li>
                <li>• Персонал находится на территории <strong>24/7</strong> для помощи гостям.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Contacts & Interactive Map Section */}
        <div id="contacts" className="bg-[#2D5A27] text-white rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Contact Details */}
            <div className="space-y-6">
              <div>
                <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Настоящий лес • Абсолютная тишина
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3">
                  Контакты и локация
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-2">
                  База отдыха «Романтик» — уютный загородный отдых в лесу Краснодарского края.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Адрес базы отдыха:</strong>
                    <a
                      href="https://yandex.ru/maps/org/romantik/126160966311/?ll=38.876485%2C44.702748&z=12.3"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-100 hover:underline hover:text-emerald-300"
                    >
                      Краснодарский край, Северский район, станица Ставропольская
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Отдел бронирования (24/7):</strong>
                    <a href="tel:+79184440406" className="text-amber-300 font-bold hover:underline text-base">
                      8 (918) 444-04-06
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Электронная почта:</strong>
                    <a href="mailto:romantik-baza@mail.ru" className="text-emerald-100 hover:underline hover:text-emerald-300">
                      romantik-baza@mail.ru
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Мессенджеры и быстрая связь:</strong>
                    <div className="flex flex-wrap gap-2.5 pt-1.5">
                      <a
                        href="https://api.whatsapp.com/send?phone=79184440406&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5.%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%B1%D1%80%D0%BE%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%B4%D0%BE%D0%BC%D0%B8%D0%BA%21"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-400/30 shadow-xs"
                      >
                        WhatsApp
                      </a>
                      <a
                        href="tg://resolve?domain=romantik_base&text=Здравствуйте.%20Хочу%20забронировать%20домик%21"
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-sky-400/30 shadow-xs"
                      >
                        Telegram
                      </a>
                      <a
                        href="https://max.ru/u/f9LHodD0cOIeGxXmIVw7bqQ7hqCUZM9gGdaZRPoaE0tcO56NWn6cKZpuboc"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-indigo-400/30 shadow-xs"
                      >
                        ⚡ MAX
                      </a>
                      <a
                        href="https://www.instagram.com/romantik_base/"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-fuchsia-400/30 shadow-xs"
                      >
                        Instagram
                      </a>
                      <a
                        href="tel:+79184440406"
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-amber-400/30 shadow-xs"
                      >
                        📞 Позвонить
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://yandex.ru/maps/org/romantik/126160966311/?ll=38.876485%2C44.702748&z=12.3"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FDFBF7] hover:bg-white text-[#2D5A27] px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  Открыть на Яндекс Картах
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Interactive Map Visual */}
            <div className="bg-[#1A1A1A] rounded-[24px] overflow-hidden border border-white/10 h-72 sm:h-96 relative shadow-inner">
              <iframe
                title="Интерактивная карта проезда к базе Романтик"
                src="https://www.openstreetmap.org/export/embed.html?bbox=38.800000%2C44.700000%2C38.950000%2C44.850000&amp;layer=mapnik"
                className="w-full h-full border-0 filter brightness-90 contrast-110"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl text-slate-900 text-xs shadow-lg space-y-1 max-w-xs">
                <strong className="text-[#2D5A27] font-bold block flex items-center gap-1">
                  <Trees className="w-4 h-4 text-[#2D5A27]" />
                  База отдыха «Романтик»
                </strong>
                <p className="text-[11px] text-slate-600">
                  Краснодарский край, Северский район, станица Ставропольская. Настоящий лес, абсолютная тишина и уединение.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
