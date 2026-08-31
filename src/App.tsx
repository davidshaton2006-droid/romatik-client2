import React, { useState, useEffect } from 'react';
import { Booking, CabinCategoryCard } from './types';
import { fetchBookings, listenToFirestoreBookings } from './api/client';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CabinCatalog } from './components/CabinCatalog';
import { CabinDetailModal } from './components/CabinDetailModal';
import { TerritorySection } from './components/TerritorySection';
import { ServicesSection } from './components/ServicesSection';
import { RulesAndContacts } from './components/RulesAndContacts';
import { Footer } from './components/Footer';
import { BottomNav, TabType } from './components/BottomNav';

export default function App() {
  // bookings/Firestore-listener оставлены для счётчика доступности
  // ("Доступно X из Y") на карточках домиков — это отдельная, чисто
  // информационная функция, не связанная с оформлением брони.
  //
  // ВАЖНО: с переходом на TravelLine как единственный источник бронирований
  // новые заявки больше не попадают в этот Firestore, поэтому со временем
  // счётчик может показывать неактуальные цифры (он не будет "видеть"
  // брони, сделанные через TravelLine/Авито/другие каналы). Если нужно —
  // отдельно обсудим, как синхронизировать этот счётчик с TravelLine.
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('cabins');
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<CabinCategoryCard | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupFirestoreListener = async () => {
      try {
        unsubscribe = await listenToFirestoreBookings((bookingsData) => {
          console.log('📡 Real-time bookings from Firestore:', bookingsData);
          setBookings(bookingsData);
        });
        console.log('✅ Firestore listener established');
      } catch (err) {
        console.warn('⚠️ Firestore listener failed, falling back to fetch:', err);
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3525] font-sans antialiased selection:bg-[#2D5A27] selection:text-white pb-20 sm:pb-24">

      {/* Top Header */}
      <Header
        onBrandClick={() => handleTabChange('cabins')}
      />

      {/* Main Tab View Area */}
      <main className="transition-all duration-300">
        {activeTab === 'cabins' && (
          <div className="animate-fade-in space-y-4">
            <Hero />
            <CabinCatalog
              bookings={bookings}
              onOpenCategoryDetail={(categoryCard) => setSelectedCategoryForDetail(categoryCard)}
            />
          </div>
        )}

        {activeTab === 'territory' && (
          <div className="animate-fade-in">
            <TerritorySection />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="animate-fade-in">
            <ServicesSection />
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
        />
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Modals */}
      {selectedCategoryForDetail && (
        <CabinDetailModal
          categoryCard={selectedCategoryForDetail}
          onClose={() => setSelectedCategoryForDetail(null)}
        />
      )}

    </div>
  );
}
