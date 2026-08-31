// ID категорий номеров в системе TravelLine.
// Используются в атрибуте data-tl-room для кнопок "Забронировать" —
// TravelLine открывает модальное окно бронирования с предвыбранной
// категорией номера.
//
// Взято из LINK/links_room.html, присланного TravelLine:
//   Двухместный домик с видом на лес → 412497
//   Трёхместный домик                → 412498
export const TRAVELLINE_ROOM_ID: Record<'two_seat' | 'three_seat', string> = {
  two_seat: '412497',
  three_seat: '412498',
};
