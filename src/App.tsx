import React, { useState, useEffect } from 'react';
import { Booking, BookingPayload, CabinCategoryCard } from './types';
import { fetchBookings, listenToFirestoreBookings } from './api/client';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CabinCatalog } from './components/CabinCatalog';
import { CabinDetailModal } from './components/CabinDetailModal';
import { BookingModal } from './components/BookingModal';
import { TerritorySection } from './components/TerritorySection';
import { ServicesSection } from './components/ServicesSection';
import { RulesAndContacts } from './components/RulesAndContacts';
import { Footer } from './components/Footer';
import { BottomNav, TabType } from './components/BottomNav';

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('cabins');

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedCabinTypeForBooking, setSelectedCabinTypeForBooking] = useState<'two_seat' | 'three_seat'>('two_seat');
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<CabinCategoryCard | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupFirestoreListener = async () => {
      try {
        // Try to set up real-time Firestore listener
        unsubscribe = await listenToFirestoreBookings((bookingsData) => {
          console.log('📡 Real-time bookings from Firestore:', bookingsData);
          setBookings(bookingsData);
        });
        console.log('✅ Firestore listener established');
      } catch (err) {
        console.warn('⚠️ Firestore listener failed, falling back to fetch:', err);
        // Fallback to regular fetch
        try {
          const bookingsData = await fetchBookings();
          setBookings(bookingsData);
        } catch (fetchErr) {
          console.error('❌ Failed loading bookings:', fetchErr);
        }
      }
    };

    setupFirestoreListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenBookingModal = (cabinType?: 'two_seat' | 'three_seat') => {
    setSelectedCabinTypeForBooking(cabinType || 'two_seat');
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (newBooking: BookingPayload) => {
    setBookings((prev) => [newBooking as Booking, ...prev]);
    setToastMessage(`Заявка #${newBooking.id} принята! Персонал уведомлен.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3525] font-sans antialiased selection:bg-[#2D5A27] selection:text-white pb-20 sm:pb-24">
      
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1E3A8A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenBookingModal={handleOpenBookingModal}
        onBrandClick={() => handleTabChange('cabins')}
      />

      {/* Main Tab View Area */}
      <main className="transition-all duration-300">
        {activeTab === 'cabins' && (
          <div className="animate-fade-in space-y-4">
            <Hero
              onSearch={() => handleOpenBookingModal()}
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
            <CabinCatalog
              bookings={bookings}
              onOpenBooking={handleOpenBookingModal}
              onOpenCategoryDetail={(categoryCard) => setSelectedCategoryForDetail(categoryCard)}
            />
          </div>
        )}

        {activeTab === 'territory' && (
          <div className="animate-fade-in">
            <TerritorySection
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="animate-fade-in">
            <ServicesSection
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="animate-fade-in">
            <RulesAndContacts />
          </div>
        )}

        {/* Footer */}
        <Footer
          onTabChange={handleTabChange}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Modals */}
      {bookingModalOpen && (
        <BookingModal
          initialCabinType={selectedCabinTypeForBooking}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
          allBookings={bookings}
        />
      )}

      {selectedCategoryForDetail && (
        <CabinDetailModal
          categoryCard={selectedCategoryForDetail}
          onClose={() => setSelectedCategoryForDetail(null)}
          onOpenBooking={handleOpenBookingModal}
        />
      )}

    </div>
  );
}
