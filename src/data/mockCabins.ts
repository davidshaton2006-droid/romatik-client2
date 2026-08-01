import { CabinCategoryCard } from '../types';

export const DOUBLE_PHOTOS = [
  'https://disk.yandex.ru/i/XsgK4yz4oKX92Q',
  'https://disk.yandex.ru/i/zrVJ3RbolKXXTA',
  'https://disk.yandex.ru/i/d7jeTdIWXYfHTg',
  'https://disk.yandex.ru/i/trAJyNz99r0M8w',
  'https://disk.yandex.ru/i/Grk4kWb_erPE5g',
  'https://disk.yandex.ru/i/dKltMixNPBD1aQ',
  'https://disk.yandex.ru/i/GqFYZlXnV9k9Sw',
  'https://disk.yandex.ru/i/EBbqPKxmKWZZtQ',
  'https://disk.yandex.ru/i/WQsZoeRZBX2xwA',
  'https://disk.yandex.ru/i/jE1R9BRkdoBE-Q',
  'https://disk.yandex.ru/i/-bXKRIdVfPGrbA'
];

export const TRIPLE_PHOTOS = [
  'https://disk.yandex.ru/i/geCIZFi5_zdJ2A',
  'https://disk.yandex.ru/i/A7FJBRWk2_TSaA',
  'https://disk.yandex.ru/i/jwohhibGLcRUcA',
  'https://disk.yandex.ru/i/C_ig9EcFuYNABg',
  'https://disk.yandex.ru/i/5q2a8QxEGVFMKA',
  'https://disk.yandex.ru/i/mLQCLCZdB57nTw',
  'https://disk.yandex.ru/i/4NvJfY0D4RRRmQ'
];

export const CABIN_CATEGORIES: CabinCategoryCard[] = [
  {
    id: 'double',
    cabinType: 'two_seat',
    title: '🛏️ Двухместные домики',
    subtitle: 'Всего в фонде: 7 шт.',
    shortDescription: 'Уютный домик для пары с двуспальной кроватью, панорамным видом на лес и комфортабельной ванной комнатой.',
    fullDescription: 'Уединенный романтический деревянный домик для двоих в сосновом бору. Двуспальная кровать расположена напротив панорамного остекления. Ванная комната с ванной, раковиной и туалетом. Оснащен Smart TV проектором, Wi-Fi, халатами, феном и мягким бельем.',
    totalStock: 7,
    capacity: 2,
    sleepingPlaces: '1 двуспальная кровать у панорамного окна',
    pricePerNight: 7000,
    weekendPricePerNight: 9000,
    bathroomType: 'bathtub',
    photos: DOUBLE_PHOTOS,
    amenities: ['projector', 'wifi', 'bathtub', 'bathrobes', 'hairdryer', 'hygiene', 'linen', 'panoramic', 'pool_access'],
    badge: 'С ванной для двоих'
  },
  {
    id: 'triple',
    cabinType: 'three_seat',
    title: '🛏️ Трёхместные домики',
    subtitle: 'Всего в фонде: 11 шт.',
    shortDescription: 'Семейный домик с 1 двуспальной и 1 односпальной кроватью, панорамным остеклением и душевой кабиной.',
    fullDescription: 'Просторный домик для семьи или компании из 2–3 человек. Включает 1 двуспальную кровать и 1 односпальную кровать. Оснащен душевой кабиной, туалетом, раковиной, проектором со Smart TV, Wi-Fi, халатами и доступом к открытому подогреваемому бассейну.',
    totalStock: 11,
    capacity: 3,
    sleepingPlaces: '1 двуспальная кровать + 1 односпальная кровать',
    pricePerNight: 7000,
    weekendPricePerNight: 9000,
    bathroomType: 'shower',
    photos: TRIPLE_PHOTOS,
    amenities: ['projector', 'wifi', 'shower', 'bathrobes', 'hairdryer', 'hygiene', 'linen', 'panoramic', 'pool_access'],
    badge: 'Для семьи или 3 гостей'
  }
];

export const AMENITIES_DICTIONARY: Record<string, { name: string; iconName: string }> = {
  projector: { name: 'Проектор со Smart TV', iconName: 'Film' },
  wifi: { name: 'Быстрый Wi-Fi', iconName: 'Wifi' },
  bathtub: { name: 'Ванная комната с ванной', iconName: 'Bath' },
  shower: { name: 'Душевая кабина', iconName: 'ShowerHead' },
  bathrobes: { name: 'Уютные халаты', iconName: 'Sparkles' },
  hairdryer: { name: 'Фен для волос', iconName: 'Wind' },
  hygiene: { name: 'Средства гигиены', iconName: 'Sparkles' },
  linen: { name: 'Постельное белье', iconName: 'Bed' },
  curtains: { name: 'Шторки', iconName: 'Sun' },
  panoramic: { name: 'Панорамный вид на лес', iconName: 'Trees' },
  pool_access: { name: 'Подогреваемый бассейн включен', iconName: 'Waves' }
};
