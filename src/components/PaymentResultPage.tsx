import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getDb } from '../lib/firebase/config';
import { Trees, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

type Status = 'checking' | 'success' | 'pending' | 'canceled' | 'not_found';

export const PaymentResultPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const bookingId = new URLSearchParams(window.location.search).get('bookingId');
    if (!bookingId) {
      setStatus('not_found');
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        const db = await getDb();
        const q = query(collection(db, 'bookings'), where('payment_id', '==', bookingId));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (cancelled) return;
          if (snapshot.empty) {
            setStatus('not_found');
            return;
          }
          const data = snapshot.docs[0].data() as { payment_status?: string };
          if (data.payment_status === 'success') setStatus('success');
          else if (data.payment_status === 'canceled') setStatus('canceled');
          else setStatus('pending');
        });
      } catch {
        if (!cancelled) setStatus('not_found');
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const content = {
    checking: {
      icon: <Clock className="w-12 h-12 text-[#2D5A27] animate-pulse" />,
      title: 'Проверяем статус оплаты…',
      text: 'Это займёт несколько секунд.'
    },
    pending: {
      icon: <Clock className="w-12 h-12 text-amber-600" />,
      title: 'Ожидаем подтверждения от банка',
      text: 'Как только банк подтвердит платёж, бронирование автоматически станет оплаченным. Обновите страницу через минуту, если статус не изменился.'
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-[#2D5A27]" />,
      title: 'Оплата прошла успешно!',
      text: 'Бронирование подтверждено. Администратор базы свяжется с вами для уточнения деталей.'
    },
    canceled: {
      icon: <XCircle className="w-12 h-12 text-rose-600" />,
      title: 'Оплата не прошла',
      text: 'Платёж был отменён или отклонён банком. Попробуйте забронировать снова.'
    },
    not_found: {
      icon: <XCircle className="w-12 h-12 text-rose-600" />,
      title: 'Бронирование не найдено',
      text: 'Не удалось найти информацию об этом платеже. Если деньги списались, свяжитесь с нами.'
    }
  }[status];

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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[32px] border border-[#4A3525]/10 shadow-sm p-8 text-center space-y-4">
          <div className="mx-auto w-fit">{content.icon}</div>
          <h1 className="font-serif text-2xl font-bold">{content.title}</h1>
          <p className="text-sm text-[#4A3525]/70">{content.text}</p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D5A27] hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на сайт
          </a>
        </div>
      </main>
    </div>
  );
};
