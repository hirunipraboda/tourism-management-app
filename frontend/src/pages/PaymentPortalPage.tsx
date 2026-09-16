import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { PickMePaymentModal } from '../components/payment/PickMePaymentModal';

export const PaymentPortalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <LandingNavbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <PickMePaymentModal
          isOpen={true}
          onClose={() => navigate('/tours')}
          onSuccess={() => {}}
        />
      </main>

      <Footer />
    </div>
  );
};
