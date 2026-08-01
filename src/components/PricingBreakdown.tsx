import React from 'react';
import { PricingBreakdown, formatPrice } from '../lib/pricing';
import { Calculator, AlertCircle, Check } from 'lucide-react';

interface PricingBreakdownProps {
  pricing: PricingBreakdown;
  cabinType: 'two_seat' | 'three_seat';
  cabinsCount: number;
  hasThirdAdult: boolean;
}

export default function PricingBreakdownComponent({
  pricing,
  cabinType,
  cabinsCount,
  hasThirdAdult
}: PricingBreakdownProps) {
  const cabinLabel = cabinType === 'two_seat' ? 'Двухместный домик' : 'Трёхместный домик';

  return (
    <div className="bg-[#2D5A27]/5 border border-[#2D5A27]/15 p-5 rounded-2xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-[#4A3525] font-bold text-sm border-b border-[#2D5A27]/10 pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#2D5A27]" />
          <span>Расчет стоимости</span>
        </div>
        <span className="text-xs text-[#2D5A27]">{pricing.nights} ночей</span>
      </div>

      {/* Pricing details */}
      <div className="space-y-1.5 text-xs text-[#4A3525]">
        {/* Cabin type and count */}
        <div className="flex justify-between">
          <span>{cabinLabel} ({cabinsCount} шт.):</span>
          <span className="font-semibold">{formatPrice(pricing.allCabinsTotal)} ₽</span>
        </div>

        {/* Breakdown by weekday/weekend */}
        {pricing.weeknights > 0 && (
          <div className="flex justify-between text-[#4A3525]/80 text-[10px] ml-4">
            <span>Будни ({pricing.weeknights} ночей):</span>
            <span>{formatPrice(pricing.pricePerNightWeekday * pricing.weeknights * cabinsCount)} ₽</span>
          </div>
        )}
        {pricing.weekendnights > 0 && (
          <div className="flex justify-between text-[#4A3525]/80 text-[10px] ml-4">
            <span>Выходные ({pricing.weekendnights} ночей):</span>
            <span>{formatPrice(pricing.pricePerNightWeekend * pricing.weekendnights * cabinsCount)} ₽</span>
          </div>
        )}

        {/* Third adult fee */}
        {hasThirdAdult && cabinType === 'three_seat' && (
          <div className="flex justify-between text-amber-800 font-semibold">
            <span>Доп. третий взрослый ({pricing.nights} ночей):</span>
            <span>+{formatPrice(pricing.thirdAdultFeeTotal * cabinsCount)} ₽</span>
          </div>
        )}

        {/* Services */}
        {pricing.servicesTotal > 0 && (
          <div className="flex justify-between">
            <span>Дополнительные услуги:</span>
            <span className="font-semibold">+{formatPrice(pricing.servicesTotal)} ₽</span>
          </div>
        )}

        {/* Divider */}
        {(pricing.thirdAdultFeeTotal > 0 || pricing.servicesTotal > 0) && (
          <div className="border-t border-[#2D5A27]/10 pt-1.5 mt-1.5" />
        )}

        {/* Total */}
        <div className="flex justify-between border-t border-[#2D5A27]/10 pt-2">
          <span className="font-bold">Итоговая стоимость:</span>
          <span className="font-bold text-[#2D5A27] text-sm">{formatPrice(pricing.totalPrice)} ₽</span>
        </div>

        {/* Prepayment info */}
        <div className="flex justify-between bg-emerald-50 p-2.5 rounded-xl text-[#2D5A27] font-bold">
          <span>Предоплата 50% прямо сейчас:</span>
          <span>{formatPrice(pricing.prepaymentAmount)} ₽</span>
        </div>

        {/* Remaining balance info */}
        <div className="flex justify-between bg-blue-50 p-2.5 rounded-xl text-blue-900 text-[11px] font-semibold">
          <span>Оставшаяся сумма при заезде:</span>
          <span>{formatPrice(pricing.remainingBalance)} ₽</span>
        </div>
      </div>

      {/* Warning about prepayment */}
      <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex gap-2">
        <AlertCircle className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
        <span className="text-[10px] text-orange-800 leading-tight">
          <strong>Важно:</strong> Предоплата не возвращается при отмене бронирования по инициативе гостя.
        </span>
      </div>

      {/* Success indicator */}
      <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex gap-2">
        <Check className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
        <span className="text-[10px] text-green-800 leading-tight">
          Детали платежа будут отправлены вам на почту и в выбранный мессенджер.
        </span>
      </div>
    </div>
  );
}
