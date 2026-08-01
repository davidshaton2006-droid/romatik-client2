import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { calculateAvailability } from '../api/client';
import { AlertCircle, Check } from 'lucide-react';

interface CabinAvailabilityBadgeProps {
  bookings: Booking[];
  cabinType: 'two_seat' | 'three_seat';
}

export default function CabinAvailabilityBadge({
  bookings,
  cabinType
}: CabinAvailabilityBadgeProps) {
  const [availability, setAvailability] = useState({ availableDouble: 10, availableTriple: 10 });

  useEffect(() => {
    // Calculate availability for today
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const result = calculateAvailability(bookings, today, tomorrow);
    setAvailability(result);
  }, [bookings]);

  const isDouble = cabinType === 'two_seat';
  const availableCount = isDouble ? availability.availableDouble : availability.availableTriple;
  const totalCount = 10;

  const hasAvailability = availableCount > 0;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
      hasAvailability
        ? 'bg-green-500/20 text-green-700 border border-green-500/30'
        : 'bg-red-500/20 text-red-700 border border-red-500/30'
    }`}>
      {hasAvailability ? (
        <>
          <Check size={14} />
          <span>{availableCount}/{totalCount} доступны</span>
        </>
      ) : (
        <>
          <AlertCircle size={14} />
          <span>Нет доступных</span>
        </>
      )}
    </div>
  );
}
