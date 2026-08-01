# Компоненты приложения Романтик

## AvailabilityCounter
Компонент для отображения доступности домиков в реальном времени.

```tsx
<AvailabilityCounter
  bookings={bookings}
  checkIn="2026-08-01"
  checkOut="2026-08-03"
  cabinType="two_seat"
/>
```

**Props:**
- `bookings: Booking[]` — список всех бронирований из Firestore
- `checkIn: string` — дата заезда (YYYY-MM-DD)
- `checkOut: string` — дата выезда (YYYY-MM-DD)
- `cabinType: 'two_seat' | 'three_seat'` — тип выбранного домика

**Показывает:**
- Количество свободных домиков (5/10)
- Progress bar с процентом доступности
- Status: "Доступны" или "Нет свободных домиков"
- Real-time индикатор загрузки

## CabinAvailabilityBadge
Компактный badge доступности для использования в каталоге.

```tsx
<CabinAvailabilityBadge
  bookings={bookings}
  cabinType="three_seat"
/>
```

**Props:**
- `bookings: Booking[]` — список бронирований
- `cabinType: 'two_seat' | 'three_seat'` — тип домика

**Показывает:**
- "✓ 7/10 доступны" (зелёный) или "⚠ Нет доступных" (красный)

## BookingModal
Модальное окно для оформления бронирования.

```tsx
<BookingModal
  initialCabinType="two_seat"
  onClose={() => {}}
  onBookingSuccess={(booking) => {}}
  allBookings={bookings}
/>
```

**Props:**
- `initialCabinType?` — начальный выбранный тип домика
- `onClose` — callback при закрытии модалки
- `onBookingSuccess` — callback при успешном бронировании
- `allBookings?` — список бронирований для AvailabilityCounter

**Функциональность:**
1. Выбор типа домика (двухместный/трёхместный)
2. Выбор дат заезда/выезда
3. Real-time счётчик доступности
4. Выбор количества домиков
5. Опция "третий взрослый" для трёхместных
6. Дополнительные услуги (баня, чан)
7. Контактные данные гостя
8. Расчет стоимости и предоплаты
9. Отправка в Firestore

## Real-time синхронизация

Все компоненты получают обновления из Firestore через:

```ts
useEffect(() => {
  listenToFirestoreBookings((bookings) => {
    setBookings(bookings);
  });
}, []);
```

Когда в приложение персонала добавляется новая бронь → она автоматически видна в клиентском приложении через Firestore listener.

## Структура папок

```
src/
├── components/
│   ├── AvailabilityCounter.tsx         ← Счётчик доступности
│   ├── CabinAvailabilityBadge.tsx      ← Badge для каталога
│   ├── BookingModal.tsx                ← Форма бронирования
│   ├── CabinCatalog.tsx                ← Каталог домиков
│   ├── CabinCategoryCardComponent.tsx  ← Карточка домика
│   ├── Header.tsx                      ← Верхняя панель
│   └── ...
└── README.md
```
