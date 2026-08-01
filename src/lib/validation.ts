import { BookingPayload, Booking } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate phone number (Russian format)
 */
export function validatePhoneNumber(phone: string): ValidationError | null {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    return { field: 'phone', message: 'Номер телефона должен содержать минимум 10 цифр' };
  }

  if (!cleanPhone.startsWith('7') && !cleanPhone.startsWith('8')) {
    return { field: 'phone', message: 'Номер должен начинаться с 7 или 8' };
  }

  return null;
}

/**
 * Validate guest name
 */
export function validateGuestName(name: string): ValidationError | null {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { field: 'guestName', message: 'Имя должно содержать минимум 2 символа' };
  }

  if (trimmed.length > 100) {
    return { field: 'guestName', message: 'Имя должно быть не более 100 символов' };
  }

  // Check for valid Cyrillic or Latin characters
  if (!/^[а-яА-ЯёЁa-zA-Z\s'-]+$/.test(trimmed)) {
    return { field: 'guestName', message: 'Имя должно содержать только буквы, пробелы, апострофы и дефисы' };
  }

  return null;
}

/**
 * Validate dates
 */
export function validateDates(checkIn: string, checkOut: string): ValidationError | null {
  if (!checkIn || !checkOut) {
    return { field: 'dates', message: 'Укажите даты заезда и выезда' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Check if dates are valid
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { field: 'dates', message: 'Некорректный формат дат' };
  }

  // Check if check-in is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return { field: 'checkIn', message: 'Дата заезда не может быть в прошлом' };
  }

  // Check if check-out is after check-in
  if (checkOutDate <= checkInDate) {
    return { field: 'checkOut', message: 'Дата выезда должна быть позже даты заезда' };
  }

  // Check if stay duration is reasonable (max 30 nights)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
  if (nights > 30) {
    return { field: 'dates', message: 'Максимальная длительность проживания: 30 ночей' };
  }

  return null;
}

/**
 * Validate cabin count
 */
export function validateCabinCount(count: number): ValidationError | null {
  if (count < 1 || count > 10) {
    return { field: 'cabinsCount', message: 'Количество домиков должно быть от 1 до 10' };
  }

  return null;
}

/**
 * Validate price amount
 */
export function validatePrice(price: number): ValidationError | null {
  if (price < 0) {
    return { field: 'price', message: 'Цена не может быть отрицательной' };
  }

  if (price > 1000000) {
    return { field: 'price', message: 'Цена слишком велика' };
  }

  if (!Number.isFinite(price)) {
    return { field: 'price', message: 'Некорректная цена' };
  }

  return null;
}

/**
 * Check for double booking (already booked cabins)
 */
export function checkDoubleBooking(
  bookings: Booking[],
  cabinType: 'two_seat' | 'three_seat',
  cabinsCount: number,
  checkIn: string,
  checkOut: string
): ValidationError | null {
  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();

  // Count occupied cabins of this type
  let occupiedCount = 0;

  bookings.forEach(booking => {
    if (booking.status === 'cancelled') return;
    if (booking.cabinType !== cabinType) return;

    const bookingCheckIn = new Date(booking.checkIn).getTime();
    const bookingCheckOut = new Date(booking.checkOut).getTime();

    // Check overlap
    if (bookingCheckIn < checkOutTime && bookingCheckOut > checkInTime) {
      occupiedCount += booking.cabinsCount || 1;
    }
  });

  const totalCabins = cabinType === 'two_seat' ? 7 : 10; // 7 двухместных и 10 трёхместных
  const availableCabins = totalCabins - occupiedCount;

  if (cabinsCount > availableCabins) {
    return {
      field: 'cabinsCount',
      message: `Недостаточно свободных домиков. Доступно: ${availableCabins} из ${cabinsCount} запрошенных`
    };
  }

  return null;
}

/**
 * Validate entire booking payload
 */
export function validateBooking(
  bookingData: Partial<BookingPayload>,
  existingBookings: Booking[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate guest name
  if (bookingData.guestName) {
    const nameError = validateGuestName(bookingData.guestName);
    if (nameError) errors.push(nameError);
  } else {
    errors.push({ field: 'guestName', message: 'Укажите имя гостя' });
  }

  // Validate phone
  if (bookingData.guestPhone) {
    const phoneError = validatePhoneNumber(bookingData.guestPhone);
    if (phoneError) errors.push(phoneError);
  } else {
    errors.push({ field: 'guestPhone', message: 'Укажите номер телефона' });
  }

  // Validate dates
  if (bookingData.checkIn && bookingData.checkOut) {
    const dateError = validateDates(bookingData.checkIn, bookingData.checkOut);
    if (dateError) errors.push(dateError);
  } else {
    errors.push({ field: 'dates', message: 'Укажите даты заезда и выезда' });
  }

  // Validate cabin count
  if (bookingData.cabinsCount) {
    const countError = validateCabinCount(bookingData.cabinsCount);
    if (countError) errors.push(countError);
  } else {
    errors.push({ field: 'cabinsCount', message: 'Укажите количество домиков' });
  }

  // Validate prices
  if (bookingData.totalPrice) {
    const priceError = validatePrice(bookingData.totalPrice);
    if (priceError) errors.push(priceError);
  }

  if (bookingData.prepaymentAmount) {
    const prepaymentError = validatePrice(bookingData.prepaymentAmount);
    if (prepaymentError) {
      errors.push({ ...prepaymentError, field: 'prepaymentAmount' });
    }
  }

  // Check for double booking
  if (
    bookingData.cabinType &&
    bookingData.cabinsCount &&
    bookingData.checkIn &&
    bookingData.checkOut
  ) {
    const doubleBookingError = checkDoubleBooking(
      existingBookings,
      bookingData.cabinType,
      bookingData.cabinsCount,
      bookingData.checkIn,
      bookingData.checkOut
    );
    if (doubleBookingError) errors.push(doubleBookingError);
  }

  return errors;
}

/**
 * Get first error message for field
 */
export function getFirstErrorForField(errors: ValidationError[], field: string): string | null {
  const error = errors.find(e => e.field === field);
  return error?.message || null;
}
