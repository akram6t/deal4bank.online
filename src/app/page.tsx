
'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import Footer from '@/components/landing/Footer';
import { States } from '@/components/landing/States';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Loan');

  return (
    <main className="min-h-screen bg-blue-50 dark:bg-neutral-950 transition-colors duration-200 relative">
      <Navbar />

      <div className="max-w-7xl mx-auto py-4">
        <States onLinkClick={(tabId) => setActiveTab(tabId)} />
        
        <HeroSection 
          openedTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      <Footer />
    </main>
  );
}
