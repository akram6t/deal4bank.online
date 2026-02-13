
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import Footer from '@/components/landing/Footer';
import { States } from '@/components/landing/States';
import { getServiceData } from '@/lib/data-parser';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Loan');
  const [dynamicServices, setDynamicServices] = useState<any>(null);

  // Fetch dynamic services from the new API route
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          setDynamicServices(data);
        }
      } catch (err) {
        console.error("Failed to load dynamic services:", err);
      }
    }
    loadServices();
  }, []);

  return (
    <main className="min-h-screen bg-blue-50 dark:bg-neutral-950 transition-colors duration-200 relative">
      <Navbar />

      <div className="max-w-7xl mx-auto py-4">
        <States onLinkClick={(tabId) => setActiveTab(tabId)} />
        
        <HeroSection 
          openedTab={activeTab} 
          onTabChange={setActiveTab} 
          servicesData={dynamicServices}
        />
      </div>

      <Footer />
    </main>
  );
}
