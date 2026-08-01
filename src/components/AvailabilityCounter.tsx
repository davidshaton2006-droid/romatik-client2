import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { calculateAvailability } from '../api/client';
import { Home, AlertCircle } from 'lucide-react';

interface AvailabilityCounterProps {
  bookings: Booking[];
  checkIn: string;
  checkOut: string;
  cabinType: 'two_seat' | 'three_seat';
}

export default function AvailabilityCounter({
  bookings,
  checkIn,
  checkOut,
  cabinType
}: AvailabilityCounterProps) {
  const [availability, setAvailability] = useState({ availableDouble: 7, availableTriple: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Small delay to simulate real-time calculation
    const timer = setTimeout(() => {
      const result = calculateAvailability(bookings, checkIn, checkOut);
      setAvailability(result);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [bookings, checkIn, checkOut]);

  const isSelected = cabinType === 'two_seat';
  const availableCount = isSelected ? availability.availableDouble : availability.availableTriple;
  const totalCount = isSelected ? 7 : 10;
  const occupiedCount = totalCount - availableCount;
  const percentage = Math.round((availableCount / totalCount) * 100);

  const cabinLabel = cabinType === 'two_seat' ? '🛏️ Двухместные домики' : '🛏️ Трёхместные домики';
  const isAvailable = availableCount > 0;

  return (
    <div className="w-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Home size={18} className="text-green-400" />
          <span className="font-semibold text-white text-sm">{cabinLabel}</span>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          isAvailable
            ? 'bg-green-500/20 text-green-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {availableCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-gray-300">
          {isAvailable ? (
            <>
              <span className="text-green-300 font-semibold">✓ Доступны</span>
              <span className="text-gray-400 ml-1">
                для бронирования {checkIn} - {checkOut}
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 text-red-300">
                <AlertCircle size={14} />
                <span className="font-semibold">Нет свободных домиков</span>
              </div>
              <span className="text-gray-400 ml-1 block mt-1">
                Занято: {occupiedCount}/{totalCount}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Real-time indicator */}
      {loading && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
          Загрузка...
        </div>
      )}
    </div>
  );
}
