# Архитектура приложения "Романтик"

## 📱 Клиентское приложение (Web)

**Стек:**
- React 19 + TypeScript
- Tailwind CSS (дизайн)
- Vite (сборка)
- Firebase SDK (Firestore)

**URL:** https://your-domain.com

### Структура компонентов

```
src/
├── components/
│   ├── BookingModal.tsx          # Главная форма бронирования
│   ├── AvailabilityCounter.tsx   # Real-time счётчик домиков
│   ├── PricingBreakdown.tsx      # Расчет цены
│   ├── PaymentForm.tsx           # Форма оплаты (Yookassa)
│   ├── CabinCatalog.tsx          # Каталог домиков
│   ├── Header.tsx                # Верхняя панель
│   ├── Footer.tsx                # Подвал
│   └── ...
├── lib/
│   ├── firebase/
│   │   ├── config.ts             # Инициализация Firebase
│   │   ├── bookings.ts           # CRUD для бронирований
│   │   └── init.ts               # Инициализация на старте
│   ├── validation.ts             # Валидация данных
│   ├── pricing.ts                # Расчет цены
│   ├── yookassa.ts               # Интеграция Yookassa
│   └── offlineSync.ts            # Offline режим
├── api/
│   └── client.ts                 # API клиент (Firestore + HTTP)
└── App.tsx                        # Главное приложение
```

## 🔥 Firestore (Shared Database)

**Проект:** nimble-cairn-ssx2c

**Коллекции:**

```
bookings/
  {bookingId}/
    house_type: string (Двухместный/Трехместный)
    check_in: string (YYYY-MM-DD)
    check_out: string (YYYY-MM-DD)
    guest_last_name: string
    guest_phone: string
    prepayment: number
    total_price: number
    payment_status: string (pending/success)
    created_at: Timestamp
    created_by_name: string
    ... (другие поля)

booking_history/
  (архив завершённых бронирований)

users/
  {userId}/
    name: string
    role: string (employee/marketing/management)
    ... (профиль персонала)

expenses/
  (расходы базы)

income/
  (доходы базы)
```

## 👥 Приложение персонала

**URL:** https://service-1021219209449.us-west2.run.app/

**Что видит персонал:**
- ✅ Real-time список всех бронирований
- ✅ Календарь занятости домиков
- ✅ Финансовые отчёты (доходы/расходы)
- ✅ Может обновить статус бронирования
- ✅ Push-уведомления о новых бронях (FCM)

**Синхронизация:**
- Слушает collection('bookings') через Firestore listener
- Мгновенно получает новые бронирования
- Обновляет календарь в real-time

## 💳 Платёжная система

**Провайдер:** Yookassa (https://yookassa.ru)

**Поток платежа:**

```
Клиент нажимает "Оплатить"
    ↓
PaymentForm открывает модальное окно
    ↓
POST /api/payments/create (backend)
    ↓
Backend → Yookassa API
    ↓
Yookassa создаёт платёж и возвращает URL
    ↓
Клиент перенаправляется на платёжную форму Yookassa
    ↓
Успешная оплата
    ↓
Yookassa webhook → Backend (/api/webhooks/yookassa)
    ↓
Backend обновляет в Firestore: payment_status = "success"
    ↓
Бронирование переходит в статус "confirmed"
    ↓
Email отправляется гостю
    ↓
Персонал видит "Платёж получен"
```

## 🔐 Безопасность (Firestore Rules)

**Правила доступа:**

| Пользователь | Действие | Разрешено |
|--------------|---------|----------|
| Клиент (не авторизованный) | CREATE booking | ✅ |
| Клиент | READ другие бронирования | ❌ |
| Персонал | READ bookings | ✅ |
| Персонал | UPDATE booking | ✅ |
| Персонал | DELETE booking | ❌ (только админ) |
| Администратор | Всё | ✅ |

**Валидация на уровне Firestore:**
- Обязательные поля
- Корректные типы данных
- Формат дат и номеров телефонов
- Логика цен (prepayment ≤ total_price)

## 🔄 Real-time синхронизация

**Механизм:** Firestore listeners (WebSocket)

```
Клиент создаёт бронирование в Firestore
    ↓
Firestore триггер срабатывает
    ↓
Firestore listener в приложении персонала получает обновление
    ↓
Персонал видит новую бронь мгновенно (< 1 сек)
    ↓
Если персонал обновит статус → клиент видит изменение
```

**Никаких webhook'ов, polling'а или REST API для этого!**

## 📧 Email уведомления (будущее)

**Когда отправляется:**
1. Новое бронирование → уведомление персоналу
2. Успешный платёж → уведомление гостю
3. Отмена бронирования → уведомление обеим сторонам

**Реализация:**
- Cloud Functions (Google Cloud)
- Триггер: onWrite к collection('bookings')
- Отправка через SendGrid или аналог

## 🏗️ Развертывание

### Клиентское приложение

```bash
# Локально
npm install
npm run dev

# Production (Firebase Hosting)
npm run build
firebase deploy --only hosting
```

### Firestore Rules

```bash
# Развернуть правила
firebase deploy --only firestore:rules
```

### Backend endpoints (требуются)

Нужно создать на своем backend сервере:

```
POST /api/payments/create          # Создание платежа
POST /api/payments/check           # Проверка статуса
POST /api/webhooks/yookassa        # Webhook от Yookassa
POST /api/emails/send              # Отправка писем
GET  /api/bookings/availability    # Проверка доступности
```

## 📊 Метрики и мониторинг

**Что отслеживается:**
- Количество новых бронирований
- Доход от платежей
- Процент успешных платежей
- Время отклика Firestore
- Ошибки в логах

**Мониторинг:**
- Firebase Console (аналитика)
- Google Cloud Logging
- Custom логирование на backend

## 🚀 Масштабируемость

**Текущие лимиты Firebase:**
- До 10K одновременных подключений
- До 1M документов в коллекции
- Достаточно для небольшой базы отдыха

**Если понадобится масштабировать:**
1. Добавить Cloud Functions для обработки
2. Кэширование через Redis
3. Архивирование старых бронирований
4. Партиционирование Firestore

## 📱 Мобильная поддержка

**Приложение полностью мобильное:**
- Mobile-first дизайн (Tailwind CSS)
- Touch-optimized интерфейс
- Offline режим (PWA)
- Service Worker для кэширования

## 🔄 Интеграции

### Текущие
- ✅ Firestore (БД)
- ✅ Firebase Auth (опционально для персонала)
- 🔄 Yookassa (платежи — документация готова)

### Будущие
- Google Calendar (синхронизация занятости)
- Telegram Bot (уведомления)
- WhatsApp API (СМС уведомления)
- Stripe (альтернатива Yookassa)

## 📝 TODO для полноты

- [ ] Развернуть firestore.rules в Firebase Console
- [ ] Настроить Yookassa аккаунт
- [ ] Реализовать backend endpoints
- [ ] Настроить Cloud Functions для email
- [ ] Добавить аналитику (Google Analytics)
- [ ] Настроить мониторинг ошибок (Sentry)
- [ ] Добавить A/B тестирование
- [ ] Документация для клиентов (как использовать приложение)

## 🎯 Основные метрики успеха

✅ Real-time синхронизация между клиентом и персоналом
✅ Безопасные платежи через Yookassa
✅ Полная валидация данных
✅ Offline режим для персонала
✅ Масштабируемая архитектура
✅ Прозрачность цены для гостей
✅ Удобный интерфейс (Mobile-first)
✅ Security Rules на уровне Firestore

---

**Версия:** 1.0  
**Дата:** 2026-08-01  
**Автор:** AI Assistant
