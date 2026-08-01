import React from 'react';
import { Trees, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';

export const RequisitesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3525] font-sans antialiased flex flex-col">
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#4A3525]/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A27] flex items-center justify-center text-white">
              <Trees className="w-4.5 h-4.5" />
            </div>
            <span className="font-serif text-lg font-bold text-[#4A3525]">РОМАНТИК</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#2D5A27] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            На сайт
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3525] mb-2">
          Реквизиты
        </h1>
        <p className="text-sm text-[#4A3525]/70 mb-8">
          База отдыха «Романтик» — эко-база отдыха в Краснодарском крае.
        </p>

        <div className="bg-white rounded-[32px] border border-[#4A3525]/10 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex justify-between items-center border-b border-[#4A3525]/10 pb-4">
            <span className="text-xs font-bold text-[#4A3525]/60 uppercase tracking-wider">
              Индивидуальный предприниматель
            </span>
            <strong className="text-sm text-[#4A3525]">Шатон Денис Васильевич</strong>
          </div>

          <div className="flex justify-between items-center border-b border-[#4A3525]/10 pb-4">
            <span className="text-xs font-bold text-[#4A3525]/60 uppercase tracking-wider">ИНН</span>
            <strong className="text-sm text-[#2D5A27] font-mono">231302921445</strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#4A3525]/60 uppercase tracking-wider">ОГРНИП</span>
            <strong className="text-sm text-[#2D5A27] font-mono">324237500182930</strong>
          </div>
        </div>

        <div className="bg-[#2D5A27]/5 rounded-[32px] border border-[#2D5A27]/10 p-6 sm:p-8 mt-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#4A3525]">Контактная информация</h2>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-[#2D5A27] shrink-0" />
            <a href="tel:+79184440406" className="hover:underline font-semibold">
              8 (918) 444-04-06
            </a>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-[#2D5A27] shrink-0" />
            <span>info@romantic-resort.ru</span>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
            <a
              href="https://yandex.ru/maps/org/romantik/126160966311/?ll=38.876485%2C44.702748&z=12.3"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Краснодарский край, Северский район, станица Ставропольская
            </a>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#4A3525]/50 py-6">
        © 2026 База отдыха «Романтик». Все права защищены.
      </footer>
    </div>
  );
};
