# Yookassa Payment Integration

## Обзор

Интеграция с Yookassa для приёма платежей за предоплату (50%) при бронировании.

## Архитектура

```
Клиент заполняет форму
    ↓
Нажимает "Оплатить"
    ↓
Отправляет запрос на /api/payments/create
    ↓
Backend создаёт платёж в Yookassa
    ↓
Получает confirmation URL
    ↓
Клиент переходит на Yookassa платёжную форму
    ↓
После оплаты → redirect обратно на сайт
    ↓
Webhook от Yookassa → Backend обновляет бронирование
    ↓
Бронирование в статусе "confirmed"
```

## Шаг 1: Регистрация в Yookassa

1. Перейти на https://yookassa.ru
2. Зарегистрироваться/войти
3. В личном кабинете:
   - Получить **Shop ID** (ID магазина)
   - Получить **API Key** (ключ API)

## Шаг 2: Настройка переменных окружения

Добавить в `.env.local`:

```env
VITE_YOOKASSA_SHOP_ID=your_shop_id_here
VITE_YOOKASSA_API_KEY=your_api_key_here
```

## Шаг 3: Backend endpoints

Нужно создать три endpoint'а на вашем backend сервере:

### POST /api/payments/create
Создание платежа

**Запрос:**
```json
{
  "amount": 9000,
  "bookingId": "book-1234567890",
  "guestName": "Иван Иванов",
  "paymentMethod": "card",
  "returnUrl": "https://romantik.ru/booking/success"
}
```

**Ответ:**
```json
{
  "paymentId": "yoo-123456789",
  "confirmationUrl": "https://yookassa.ru/checkout/pay/..."
}
```

**Backend логика:**
```typescript
// 1. Создать платёж в Yookassa API
const payment = await yookassa.createPayment({
  amount: {
    value: (amount / 100).toFixed(2),
    currency: 'RUB'
  },
  confirmation: {
    type: 'redirect',
    return_url: returnUrl
  },
  description: `Бронирование #${bookingId} - ${guestName}`,
  metadata: {
    bookingId,
    guestName
  }
});

// 2. Сохранить paymentId в БД для отслеживания
await savePaymentRecord({
  paymentId: payment.id,
  bookingId,
  amount,
  status: 'pending'
});

// 3. Вернуть URL для переадресации
return {
  paymentId: payment.id,
  confirmationUrl: payment.confirmation.confirmation_url
};
```

### POST /api/payments/check
Проверка статуса платежа

**Запрос:**
```json
{
  "paymentId": "yoo-123456789"
}
```

**Ответ:**
```json
{
  "status": "succeeded",
  "amount": "9000.00",
  "bookingId": "book-1234567890"
}
```

### POST /api/webhooks/yookassa
Webhook от Yookassa

**Что происходит:**
1. Yookassa отправляет webhook при изменении статуса платежа
2. Backend проверяет подпись (security)
3. Обновляет статус бронирования в Firestore
4. Если успешно → статус → "confirmed"

**Логика:**
```typescript
// 1. Проверить подпись (важно для безопасности!)
const isValid = validateWebhookSignature(signature, body, apiKey);
if (!isValid) throw new Error('Invalid signature');

// 2. Получить данные платежа
const payment = JSON.parse(body);

// 3. Обновить статус бронирования
if (payment.status === 'succeeded') {
  await updateBookingInFirestore(payment.metadata.bookingId, {
    payment_status: 'success',
    payment_id: payment.id
  });
  
  // 4. Отправить email гостю
  await sendConfirmationEmail(guestName, bookingId);
}

// 5. Вернуть 200 OK
return { status: 'ok' };
```

## Шаг 4: Настройка Webhook в Yookassa

1. Перейти в https://yookassa.ru → Настройки → Webhook
2. Указать URL: `https://your-domain.com/api/webhooks/yookassa`
3. Выбрать события:
   - `payment.succeeded` ✓
   - `payment.canceled` ✓
4. Сохранить

## Шаг 5: Тестирование

### Тестовые карты Yookassa:
- **Успешный платеж:** 4111 1111 1111 1111
- **Отклонённый платеж:** 4000 0000 0000 0002
- CVV: любые 3 цифры
- Дата: любая будущая дата

### Тестирование webhook'ов локально:

Использовать ngrok для expose локального сервера:
```bash
ngrok http 3000
```

Затем указать webhook URL как: `https://YOUR_NGROK_URL/api/webhooks/yookassa`

## Frontend интеграция

### Компонент PaymentForm

Уже реализован в `src/components/PaymentForm.tsx`

**Использование:**
```tsx
import PaymentForm from './components/PaymentForm';

<PaymentForm
  amount={9000}
  bookingId="book-123"
  guestName="Иван Иванов"
  onPaymentSuccess={(paymentId) => {
    console.log('Payment successful:', paymentId);
    // Показать success экран
  }}
  onPaymentError={(error) => {
    console.error('Payment failed:', error);
    // Показать ошибку
  }}
  onCancel={() => {
    // Закрыть форму оплаты
  }}
/>
```

## Обработка результатов платежа

### После успешного платежа:
1. ✅ Бронирование переходит в статус "confirmed"
2. ✅ Email отправляется гостю
3. ✅ Персонал видит "Платёж получен" в приложении
4. ✅ Предоплата не возвращается (как указано в условиях)

### При отмене платежа:
1. ❌ Бронирование остаётся в "pending"
2. ❌ Гость может повторить попытку
3. ❌ Персонал уведомляется об отмене

## Статусы платежа

| Статус | Значение |
|--------|----------|
| `pending` | Платёж создан, ожидание оплаты |
| `waiting_for_capture` | Средства зарезервированы, нужно захватить |
| `succeeded` | Платёж успешен, средства получены |
| `canceled` | Платёж отменён или отклонён |

## Безопасность

### ✅ Защищено:
- Платёжные данные передаются напрямую в Yookassa (не хранятся на вашем сервере)
- Webhook подписан и проверяется на backend
- API Key хранится только на backend (не в клиенте)
- Сумма платежа проверяется на backend (не может быть изменена клиентом)

### ⚠️ НИКОГДА:
- ❌ Не передавайте API Key на клиент
- ❌ Не вызывайте Yookassa API напрямую из браузера
- ❌ Не доверяйте сумме платежа с клиента

## Рекомендации

1. **Изображения квитанций** — Yookassa автоматически отправляет чеки гостям
2. **Повторные платежи** — Реализуйте возможность повтора при ошибке
3. **Рефунды** — Используйте Yookassa API для возврата средств при отмене
4. **Аналитика** — Отслеживайте платежи в админ-панели Yookassa
5. **SLA** — Гарантия 99.9% доступности API

## Полезные ссылки

- 📖 Документация: https://yookassa.ru/developers/api
- 🔐 Security: https://yookassa.ru/developers/webhooks
- 💬 Support: support@yookassa.ru
- 🧪 Тестирование: https://yookassa.ru/developers/test-cases

## Troubleshooting

### "Invalid Shop ID"
→ Проверить значение в .env.local

### "Webhook not received"
→ Проверить URL в настройках Yookassa
→ Проверить логи backend сервера

### "Payment declined"
→ Использовать тестовую карту 4111 1111 1111 1111
→ Проверить параметры платежа

### "Invalid signature"
→ Проверить API Key
→ Убедиться, что webhook подпись вычисляется правильно
