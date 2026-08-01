import { ExtraService } from '../types';

export const EXTRA_SERVICES: ExtraService[] = [
  {
    id: 'siberian_tub_session',
    name: 'Горячий сибирский чан / купель (2 часа)',
    description: 'Сибирский чан на дровах с ароматом пихты, алтайских трав и цитрусов прямо под кронами деревьев.',
    price: 5000,
    unit: 'per_booking',
    icon: 'Bath'
  },
  {
    id: 'russian_sauna_2h',
    name: 'Русская баня на дровах (2 часа)',
    description: 'Традиционная парная на дровах с дубовыми вениками, травяным чаем из самовара и алтайским мёдом.',
    price: 3000,
    unit: 'per_booking',
    icon: 'Flame'
  },
  {
    id: 'cafe_daily_lunch',
    name: 'Блюда по Меню Дня из нашего Кафе',
    description: 'Заказ свежих домашних блюд и напитков из нашего лесного кафе и бара (оплата по факту заказа).',
    price: 0,
    unit: 'per_person',
    icon: 'UtensilsCrossed'
  }
];
