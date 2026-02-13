
'use client';

import { useState } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import { States } from '@/components/landing/States';

/**
 * @fileOverview Client Component to manage tab state and rendering of interactive landing sections.
 */

interface HomeClientProps {
  services: any;
}

export default function HomeClient({ services }: HomeClientProps) {
  // Default to the first tab ID from the fetched services
  const defaultTab = services?.tabs?.[0]?.id || 'Loan';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Extract states/services list for the States component
  const statesServices = services?.tabs?.map((t: any) => ({
    id: t.id,
    title: t.title
  })) || [];

  return (
    <>
      <States 
        onLinkClick={(tabId) => setActiveTab(tabId)} 
        servicesList={statesServices}
      />
      
      <HeroSection 
        openedTab={activeTab} 
        onTabChange={setActiveTab} 
        servicesData={services}
      />
    </>
  );
}
