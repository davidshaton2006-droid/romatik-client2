import React, { useState } from 'react';
import { AlertCircle, Check, Loader } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  bookingId: string;
  guestName: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({
  amount,
  bookingId,
  guestName,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In production, this should call your backend API
      // that securely handles Yookassa integration

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          bookingId,
          guestName,
          paymentMethod: selectedMethod,
          returnUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();

      // Redirect to Yookassa payment page
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(
        error instanceof Error ? error.message : 'Ошибка при создании платежа'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^\d]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl">
      <h3 className="font-bold text-lg text-[#4A3525] mb-4">Оплата предоплаты</h3>

      {/* Amount summary */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
        <p className="text-sm text-blue-900/60 mb-1">К оплате</p>
        <p className="text-2xl font-extrabold text-blue-900">
          {amount.toLocaleString('ru-RU')} ₽
        </p>
        <p className="text-xs text-blue-900/60 mt-1">50% от суммы бронирования</p>
      </div>

      {/* Payment method selection */}
      <div className="mb-6 space-y-2">
        <label className="block text-xs font-bold text-[#4A3525] mb-3">
          Способ оплаты
        </label>
        <div className="space-y-2">
          <label className="flex items-center p-3 border border-[#4A3525]/15 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment-method"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={() => setSelectedMethod('card')}
              className="mr-3"
            />
            <span className="text-sm font-medium text-[#4A3525]">💳 Карта Visa/Mastercard</span>
          </label>
          <label className="flex items-center p-3 border border-[#4A3525]/15 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment-method"
              value="bank"
              checked={selectedMethod === 'bank'}
              onChange={() => setSelectedMethod('bank')}
              className="mr-3"
            />
            <span className="text-sm font-medium text-[#4A3525]">🏦 Банковский перевод</span>
          </label>
        </div>
      </div>

      {/* Card form (shown for card payment) */}
      {selectedMethod === 'card' && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-[#4A3525] mb-1">
              Номер карты
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength="19"
              className="w-full px-3 py-2 border border-[#4A3525]/15 rounded-xl text-sm font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1">Месяц</label>
              <input
                type="text"
                placeholder="MM"
                value={cardMonth}
                onChange={(e) => setCardMonth(e.target.value.slice(0, 2))}
                maxLength="2"
                className="w-full px-3 py-2 border border-[#4A3525]/15 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1">Год</label>
              <input
                type="text"
                placeholder="YY"
                value={cardYear}
                onChange={(e) => setCardYear(e.target.value.slice(0, 2))}
                maxLength="2"
                className="w-full px-3 py-2 border border-[#4A3525]/15 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1">CVC</label>
              <input
                type="text"
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.slice(0, 3))}
                maxLength="3"
                className="w-full px-3 py-2 border border-[#4A3525]/15 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex gap-2">
            <AlertCircle className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
            <span className="text-xs text-orange-800">
              Платежные данные передаются напрямую в Yookassa и не сохраняются на сервере.
            </span>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-[#4A3525]/15 text-[#4A3525] rounded-xl font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !cardNumber || !cardMonth || !cardYear || !cardCvc}
              className="flex-1 px-4 py-3 bg-[#2D5A27] text-white rounded-xl font-bold text-sm hover:bg-[#1E3A1A] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Оплатить {amount.toLocaleString('ru-RU')} ₽
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Bank transfer info */}
      {selectedMethod === 'bank' && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 space-y-2">
          <p className="text-xs font-bold text-blue-900">Реквизиты для перевода:</p>
          <div className="text-xs text-blue-900/80 space-y-1">
            <p>ООО "Романтик" — база отдыха</p>
            <p>Расчетный счет: 40702810000000000000</p>
            <p>БИК: 000000000</p>
            <p className="font-mono bg-white p-2 rounded mt-2">
              Назначение: Оплата бронирования #{bookingId}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-full mt-4 px-4 py-3 bg-[#2D5A27] text-white rounded-xl font-bold text-sm hover:bg-[#1E3A1A]"
          >
            Я выполнил перевод
          </button>
        </div>
      )}
    </div>
  );
}
