import React, { useState, useMemo } from 'react';
import { BookingPayload, Booking } from '../types';
import { CABIN_CATEGORIES } from '../data/mockCabins';
import { EXTRA_SERVICES } from '../data/extraServices';
import { sendBookingToStaffApp } from '../api/client';
import { X, User, Phone, Send, CheckCircle, Calculator, Trees, Plus, Minus, AlertCircle, Info } from 'lucide-react';
import AvailabilityCounter from './AvailabilityCounter';
import PricingBreakdownComponent from './PricingBreakdown';
import { validateBooking, ValidationError, getFirstErrorForField } from '../lib/validation';
import { calculatePricing, formatPrice } from '../lib/pricing';

interface BookingModalProps {
  initialCabinType?: 'two_seat' | 'three_seat';
  initialCheckIn?: string;
  initialCheckOut?: string;
  onClose: () => void;
  onBookingSuccess: (booking: BookingPayload) => void;
  allBookings?: Booking[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  initialCabinType = 'two_seat',
  initialCheckIn = '2026-08-01',
  initialCheckOut = '2026-08-03',
  onClose,
  onBookingSuccess,
  allBookings = []
}) => {
  const [cabinType, setCabinType] = useState<'two_seat' | 'three_seat'>(initialCabinType);
  const [cabinsCount, setCabinsCount] = useState<number>(1);
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [hasThirdAdult, setHasThirdAdult] = useState<boolean>(false);
  
  const [guestName, setGuestName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [messenger, setMessenger] = useState<'telegram' | 'whatsapp' | 'phone'>('telegram');
  const [messengerHandle, setMessengerHandle] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['siberian_tub_session']);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<BookingPayload | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const activeCategory = useMemo(() => {
    return CABIN_CATEGORIES.find((c) => c.cabinType === cabinType) || CABIN_CATEGORIES[0];
  }, [cabinType]);

  // Pricing calculations
  const calculations = useMemo(() => {
    // Calculate services total
    let servicesTotal = 0;
    selectedServices.forEach((serviceId) => {
      const service = EXTRA_SERVICES.find((s) => s.id === serviceId);
      if (service) {
        const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));
        if (service.unit === 'per_night') {
          servicesTotal += service.price * nights;
        } else {
          servicesTotal += service.price;
        }
      }
    });

    // Use pricing utility
    return calculatePricing(
      checkIn,
      checkOut,
      cabinsCount,
      cabinType === 'three_seat' && hasThirdAdult,
      servicesTotal
    );
  }, [checkIn, checkOut, cabinType, hasThirdAdult, cabinsCount, selectedServices]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const bookingPayload: BookingPayload = {
      id: `book-${Date.now()}`,
      cabinType,
      cabinsCount,
      checkIn,
      checkOut,
      guestName,
      guestPhone: phone,
      hasThirdAdult: cabinType === 'three_seat' ? hasThirdAdult : false,
      totalPrice: calculations.totalPrice,
      prepaymentAmount: calculations.prepaymentAmount,
      status: 'pending_staff_approval',
      createdAt: new Date().toISOString(),
      messenger,
      messengerHandle,
      specialRequests,
      selectedExtraServices: selectedServices
    };

    // Validate booking data
    const errors = validateBooking(bookingPayload, allBookings);
    if (errors.length > 0) {
      setValidationErrors(errors);
      console.warn('Validation errors:', errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call staff app integration method
      const result = await sendBookingToStaffApp(bookingPayload);
      setCreatedBooking(result);
      setIsSuccess(true);
      onBookingSuccess(result);
    } catch (err) {
      console.error('Error submitting booking:', err);
      setValidationErrors([
        { field: 'submit', message: 'Ошибка при отправке заявки. Проверьте интернет и попробуйте снова.' }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FDFBF7] rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl border border-[#4A3525]/10 relative my-6">
        
        {/* Modal Header */}
        <div className="bg-[#2D5A27] text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold mb-1">
            <Trees className="w-4 h-4 text-emerald-300" />
            <span>Эко-база отдыха «Романтик»</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Оформление бронирования
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Мгновенная передача данных в PWA персонала и отдел бронирования
          </p>
        </div>

        {/* Success View */}
        {isSuccess && createdBooking ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#2D5A27]/10 text-[#2D5A27] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Заявка #{createdBooking.id} принята!
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3525]">
                Спасибо, {createdBooking.guestName}!
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3525]/80 max-w-md mx-auto">
                ✨ Заявка успешно отправлена в Firestore и мгновенно видна в приложении персонала!
              </p>
              <p className="text-[10px] text-[#4A3525]/60">
                Администратор базы вскоре свяжется с вами для подтверждения.
              </p>
            </div>

            {/* Summary Details */}
            <div className="bg-white p-5 rounded-2xl text-left text-xs space-y-3 max-w-md mx-auto border border-[#4A3525]/10 shadow-xs">
              <div className="flex justify-between">
                <span className="text-[#4A3525]/60">ID бронирования:</span>
                <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{createdBooking.id}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A3525]/60">Категория:</span>
                <strong className="text-[#4A3525]">
                  {createdBooking.cabinType === 'two_seat' ? '🛏️ Двухместный' : '🛏️ Трёхместный'} ({createdBooking.cabinsCount} шт.)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A3525]/60">Даты:</span>
                <strong className="text-[#4A3525]">
                  {createdBooking.checkIn} — {createdBooking.checkOut}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A3525]/60">Ночей:</span>
                <strong className="text-[#4A3525]">{calculations.nights}</strong>
              </div>
              {createdBooking.hasThirdAdult && (
                <div className="flex justify-between text-amber-800 font-semibold text-[10px]">
                  <span>+ 3-й взрослый:</span>
                  <span>+1000 ₽/ночь</span>
                </div>
              )}
              <div className="border-t border-[#4A3525]/10 pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#4A3525]/60">Стоимость:</span>
                  <strong className="text-[#2D5A27]">{createdBooking.totalPrice.toLocaleString('ru-RU')} ₽</strong>
                </div>
                <div className="flex justify-between bg-emerald-50 p-2.5 rounded-xl text-[#2D5A27] font-bold text-[11px]">
                  <span>Оплата 100% сейчас:</span>
                  <span>{createdBooking.prepaymentAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={onClose}
                className="bg-[#2D5A27] text-white px-8 py-3 rounded-2xl font-bold text-xs cursor-pointer shadow-md hover:bg-[#1E3A1A] transition-colors"
              >
                Вернуться к сайту
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">

            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Исправьте ошибки перед отправкой:</span>
                </div>
                <ul className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-xs text-red-700 flex gap-2">
                      <span>•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Step 1: Cabin Type Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#4A3525] uppercase tracking-wider">
                1. Выберите категорию домика
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Double Option */}
                <div
                  onClick={() => {
                    setCabinType('two_seat');
                    setHasThirdAdult(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    cabinType === 'two_seat'
                      ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-2 ring-[#2D5A27]'
                      : 'bg-white border-[#4A3525]/10 hover:border-[#2D5A27]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#4A3525]">🛏️ Двухместный домик</span>
                    <span className="text-[10px] font-bold bg-[#2D5A27] text-white px-2 py-0.5 rounded-full">С ванной</span>
                  </div>
                  <p className="text-[11px] text-[#4A3525]/70">Вместимость: 2 гостя • Всего 7 шт.</p>
                  <span className="text-xs font-extrabold text-[#2D5A27] block pt-1">
                    7 000 ₽ / 9 000 ₽
                  </span>
                </div>

                {/* Triple Option */}
                <div
                  onClick={() => setCabinType('three_seat')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    cabinType === 'three_seat'
                      ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-2 ring-[#2D5A27]'
                      : 'bg-white border-[#4A3525]/10 hover:border-[#2D5A27]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#4A3525]">🛏️ Трёхместный домик</span>
                    <span className="text-[10px] font-bold bg-amber-800 text-white px-2 py-0.5 rounded-full">С душем</span>
                  </div>
                  <p className="text-[11px] text-[#4A3525]/70">Вместимость: 2–3 гостя • Всего 11 шт.</p>
                  <span className="text-xs font-extrabold text-[#2D5A27] block pt-1">
                    7 000 ₽ / 9 000 ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Dates, Cabins Count & 3rd Adult option */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#4A3525] uppercase tracking-wider">
                2. Даты и количество домиков
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#4A3525]/70 block mb-1">Дата заезда (с 15:00)</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-semibold text-[#4A3525] transition-colors ${
                      getFirstErrorForField(validationErrors, 'checkIn')
                        ? 'border-red-500/50 bg-red-50/30'
                        : 'border-[#4A3525]/15'
                    }`}
                  />
                  {getFirstErrorForField(validationErrors, 'checkIn') && (
                    <span className="text-[10px] text-red-600 mt-1 block">{getFirstErrorForField(validationErrors, 'checkIn')}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-[#4A3525]/70 block mb-1">Дата выезда (до 12:00)</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-semibold text-[#4A3525] transition-colors ${
                      getFirstErrorForField(validationErrors, 'checkOut')
                        ? 'border-red-500/50 bg-red-50/30'
                        : 'border-[#4A3525]/15'
                    }`}
                  />
                  {getFirstErrorForField(validationErrors, 'checkOut') && (
                    <span className="text-[10px] text-red-600 mt-1 block">{getFirstErrorForField(validationErrors, 'checkOut')}</span>
                  )}
                </div>
              </div>
              {getFirstErrorForField(validationErrors, 'dates') && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-red-700 font-semibold">{getFirstErrorForField(validationErrors, 'dates')}</span>
                </div>
              )}

              {/* Real-time Availability Counter */}
              {checkIn && checkOut && (
                <AvailabilityCounter
                  bookings={allBookings}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  cabinType={cabinType}
                />
              )}

              {/* Number of Cabins counter for large companies */}
              <div className={`bg-white p-4 rounded-2xl border transition-colors ${
                getFirstErrorForField(validationErrors, 'cabinsCount')
                  ? 'border-red-500/50 bg-red-50/30'
                  : 'border-[#4A3525]/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-[#4A3525] block">
                      Количество домиков:
                    </span>
                    <span className="text-[11px] text-[#4A3525]/60">
                      Для больших компаний и групп
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-[#FDFBF7] p-1.5 rounded-xl border border-[#4A3525]/10">
                    <button
                      type="button"
                      onClick={() => setCabinsCount((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 bg-white rounded-lg border border-[#4A3525]/15 flex items-center justify-center text-[#4A3525] font-bold hover:bg-[#2D5A27]/10"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-extrabold text-sm text-[#2D5A27] px-1">{cabinsCount}</span>

                    <button
                      type="button"
                      onClick={() => setCabinsCount((prev) => Math.min(10, prev + 1))}
                      className="w-7 h-7 bg-white rounded-lg border border-[#4A3525]/15 flex items-center justify-center text-[#4A3525] font-bold hover:bg-[#2D5A27]/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {getFirstErrorForField(validationErrors, 'cabinsCount') && (
                  <span className="text-[10px] text-red-600 block">{getFirstErrorForField(validationErrors, 'cabinsCount')}</span>
                )}
              </div>

              {/* 3rd Adult Option for Triple Cabin */}
              {cabinType === 'three_seat' && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-1.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasThirdAdult}
                      onChange={(e) => setHasThirdAdult(e.target.checked)}
                      className="mt-0.5 rounded text-[#2D5A27] focus:ring-[#2D5A27] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#4A3525] block">
                        Третий взрослый гость (+1000 ₽/сутки)
                      </span>
                      <p className="text-[11px] text-[#4A3525]/70 flex items-center gap-1 mt-0.5">
                        <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>Дети до 10 лет проживают бесплатно</span>
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Step 3: Additional Services */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#4A3525] uppercase tracking-wider flex items-center justify-between">
                <span>3. Дополнительные услуги</span>
                <span className="text-[11px] text-[#2D5A27] font-semibold">Баня • Чан • Завтраки</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXTRA_SERVICES.map((service) => {
                  const isChecked = selectedServices.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-1 ring-[#2D5A27]'
                          : 'bg-white border-[#4A3525]/10 hover:border-[#2D5A27]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#4A3525] block">{service.name}</span>
                        <p className="text-[11px] text-[#4A3525]/70 leading-tight">
                          {service.description}
                        </p>
                        <span className="text-xs font-extrabold text-[#2D5A27] block pt-1">
                          +{service.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Contact Info */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#4A3525] uppercase tracking-wider">
                4. Контактные данные гостя
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#4A3525]/70 block mb-1">Имя и Фамилия *</span>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3525]/50" />
                    <input
                      type="text"
                      placeholder="Александр Иванов"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#4A3525] transition-colors ${
                        getFirstErrorForField(validationErrors, 'guestName')
                          ? 'border-red-500/50 bg-red-50/30'
                          : 'border-[#4A3525]/15'
                      }`}
                    />
                  </div>
                  {getFirstErrorForField(validationErrors, 'guestName') && (
                    <span className="text-[10px] text-red-600 mt-1 block">{getFirstErrorForField(validationErrors, 'guestName')}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-[#4A3525]/70 block mb-1">Номер телефона *</span>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3525]/50" />
                    <input
                      type="tel"
                      placeholder="+7 (999) 000-00-00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#4A3525] transition-colors ${
                        getFirstErrorForField(validationErrors, 'guestPhone')
                          ? 'border-red-500/50 bg-red-50/30'
                          : 'border-[#4A3525]/15'
                      }`}
                    />
                  </div>
                  {getFirstErrorForField(validationErrors, 'guestPhone') && (
                    <span className="text-[10px] text-red-600 mt-1 block">{getFirstErrorForField(validationErrors, 'guestPhone')}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#4A3525]/70 block mb-1">Мессенджер для связи</span>
                  <select
                    value={messenger}
                    onChange={(e) => setMessenger(e.target.value as any)}
                    className="w-full bg-white border border-[#4A3525]/15 rounded-xl p-2.5 text-xs font-medium text-[#4A3525]"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Телефонный звонок</option>
                  </select>
                </div>

                {messenger !== 'phone' && (
                  <div>
                    <span className="text-[11px] text-[#4A3525]/70 block mb-1">Ник или номер</span>
                    <input
                      type="text"
                      placeholder="@username или номер"
                      value={messengerHandle}
                      onChange={(e) => setMessengerHandle(e.target.value)}
                      className="w-full bg-white border border-[#4A3525]/15 rounded-xl p-2.5 text-xs font-medium text-[#4A3525]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price & Prepayment Calculator Box */}
            <PricingBreakdownComponent
              pricing={calculations}
              cabinType={cabinType}
              cabinsCount={cabinsCount}
              hasThirdAdult={cabinType === 'three_seat' && hasThirdAdult}
            />

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2D5A27] hover:bg-[#1E3A1A] text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-[#2D5A27]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Отправка данных в Firestore...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ОТПРАВИТЬ ЗАЯВКУ НА БРОНЬ</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
