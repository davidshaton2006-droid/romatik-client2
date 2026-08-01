export type CabinCategory = 'all' | 'double' | 'triple';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'per_booking' | 'per_night' | 'per_hour' | 'per_person';
  icon: string;
}

export interface CabinCategoryCard {
  id: 'double' | 'triple';
  cabinType: 'two_seat' | 'three_seat';
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  totalStock: number; // 7 for double, 11 for triple
  capacity: number; // 2 for double, 2-3 for triple
  sleepingPlaces: string;
  pricePerNight: number; // 7000 RUB (Mon-Thu)
  weekendPricePerNight: number; // 9000 RUB (Fri-Sun)
  bathroomType: 'bathtub' | 'shower';
  photos: string[];
  amenities: string[];
  badge?: string;
}

export type BookingStatus = 'pending_staff_approval' | 'confirmed' | 'cancelled' | 'completed';

export interface BookingPayload {
  id: string;
  cabinType: 'two_seat' | 'three_seat';
  cabinsCount: number;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  hasThirdAdult: boolean;
  adultsCount?: number;
  childrenCount?: number;
  totalPrice: number;
  prepaymentAmount: number;
  status: BookingStatus;
  createdAt: string;
  messenger?: 'telegram' | 'whatsapp' | 'phone';
  messengerHandle?: string;
  specialRequests?: string;
  selectedExtraServices?: string[];
}

export interface Booking extends BookingPayload {
  cabinTitle?: string;
  guestsCount?: number;
  source?: 'website' | 'pwa_staff' | 'offline';
}

export interface FilterState {
  category: CabinCategory;
  guests: number;
  checkIn: string;
  checkOut: string;
  searchQuery: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'CLIENT_BOOKING_POSTED' | 'STAFF_STATUS_UPDATED' | 'CALENDAR_LOCKED' | 'WEBHOOK_DISPATCHED';
  message: string;
  payload?: any;
}
