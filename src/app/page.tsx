'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import Footer from '@/components/landing/Footer';
import { States } from '@/components/landing/States';

/**
 * @fileOverview The main landing page for Deal4Bank.
 * Orchestrates navigation, dynamic data fetching (settings and services), 
 * and the hero application section.
 */

export default function Home() {
  const [activeTab, setActiveTab] = useState('Loan');
  const [dynamicData, setDynamicData] = useState<{ settings: any, services: any } | null>(null);

  // Fetch unified site data (settings + services)
  useEffect(() => {
    async function loadSiteData() {
      try {
        const res = await fetch('/api/site-data');
        if (res.ok) {
          const data = await res.json();
          setDynamicData(data);
          
          // If we have dynamic services, ensure we select a valid tab
          if (data.services?.tabs && data.services.tabs.length > 0) {
            const firstTab = data.services.tabs[0];
            // Try to find if 'Loan' exists in dynamic titles
            const loanTab = data.services.tabs.find((t: any) => t.title.toLowerCase().includes('loan'));
            if (loanTab) {
              setActiveTab(loanTab.id);
            } else {
              setActiveTab(firstTab.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic site data:", err);
      }
    }
    loadSiteData();
  }, []);

  return (
    <main className="min-h-screen bg-blue-50 dark:bg-neutral-950 transition-colors duration-200 relative">
      <Navbar />

      <div className="max-w-7xl mx-auto py-4">
        {/* Title and States Description Section */}
        <States onLinkClick={(tabId) => setActiveTab(tabId)} />
        
        {/* Hero Section containing dynamic tabs and application form */}
        <HeroSection 
          openedTab={activeTab} 
          onTabChange={setActiveTab} 
          servicesData={dynamicData?.services}
        />
      </div>

      <Footer />
    </main>
  );
}
