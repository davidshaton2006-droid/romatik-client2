import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface BookingPayload {
  id: string;
  cabinType: 'two_seat' | 'three_seat';
  cabinsCount: number;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  hasThirdAdult: boolean;
  totalPrice: number;
  prepaymentAmount: number;
  status: 'pending_staff_approval';
  createdAt: string;
  messenger?: 'telegram' | 'whatsapp' | 'phone';
  messengerHandle?: string;
  specialRequests?: string;
  selectedExtraServices?: string[];
}

interface SyncLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  payload?: any;
}

// In-memory backend store
let bookingsState: BookingPayload[] = [
  {
    id: 'book-101',
    cabinType: 'two_seat',
    cabinsCount: 1,
    guestName: 'Михаил Соколов',
    guestPhone: '+7 (913) 456-78-90',
    hasThirdAdult: false,
    checkIn: '2026-08-01',
    checkOut: '2026-08-03',
    totalPrice: 18000,
    prepaymentAmount: 9000,
    status: 'pending_staff_approval',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    messenger: 'telegram'
  },
  {
    id: 'book-102',
    cabinType: 'three_seat',
    cabinsCount: 2,
    guestName: 'Елена Воронова',
    guestPhone: '+7 (923) 789-12-34',
    hasThirdAdult: true,
    checkIn: '2026-08-05',
    checkOut: '2026-08-07',
    totalPrice: 38000,
    prepaymentAmount: 19000,
    status: 'pending_staff_approval',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    messenger: 'whatsapp'
  }
];

let syncLogsState: SyncLog[] = [
  {
    id: 'log-init',
    timestamp: new Date().toISOString(),
    type: 'WEBHOOK_DISPATCHED',
    message: 'Сервер эко-базы отдыха «Романтик» запущен и готов к обработке бронирований клиентов.'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get bookings
  app.get('/api/bookings', (req, res) => {
    res.json(bookingsState);
  });

  // Create booking from client website
  app.post('/api/bookings', (req, res) => {
    const payload = req.body;
    
    const newBooking: BookingPayload = {
      ...payload,
      id: payload.id || `book-${Date.now()}`,
      status: payload.status || 'pending_staff_approval',
      createdAt: payload.createdAt || new Date().toISOString()
    };

    bookingsState.unshift(newBooking);

    // Create sync log
    const log: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'CLIENT_BOOKING_POSTED',
      message: `Новая бронь #${newBooking.id} от ${newBooking.guestName} (${newBooking.cabinType === 'two_seat' ? 'Двухместный' : 'Трёхместный'}, ${newBooking.cabinsCount} шт.). Передано персоналу.`,
      payload: newBooking
    };
    syncLogsState.unshift(log);

    res.status(201).json(newBooking);
  });

  // Update booking status
  app.patch('/api/bookings/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const index = bookingsState.findIndex(b => b.id === id);
    if (index !== -1) {
      bookingsState[index].status = status;

      const log: SyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'STAFF_STATUS_UPDATED',
        message: `Бронирование #${id} обновлено со статусом «${status}»`,
        payload: { bookingId: id, status }
      };
      syncLogsState.unshift(log);

      res.json(bookingsState);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  });

  // Get sync logs
  app.get('/api/sync/logs', (req, res) => {
    res.json(syncLogsState);
  });

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server for Eco-Resort Romantic running on http://localhost:${PORT}`);
  });
}

startServer();
