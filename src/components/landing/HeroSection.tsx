
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Shield, 
  Clock, 
  TrendingDown, 
  Headphones, 
  Eye, 
  Home, 
  User, 
  Building2, 
  Car, 
  Heart, 
  BarChart3, 
  Banknote, 
  ShoppingCart,
  ChevronRight
} from 'lucide-react';
import { ApplyServiceForm, HeroFormData } from './ServiceForm';
import { getServiceData } from '@/lib/data-parser';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  activeTab: string; // Changed to match parent prop name in page.tsx if needed, but keeping openedTab logic from snippet
  onTabChange: (tabId: string) => void;
}

export default function HeroSection({ activeTab: openedTab, onTabChange }: HeroSectionProps) {
  const services = getServiceData();
  const serviceTabs = services.tabs;

  const handleFormSubmit = async (formData: HeroFormData) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      return data;
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  };

  // Map icon strings to actual components
  const iconComponents: Record<string, React.ComponentType<any>> = {
    User, Home, Building2, Car, Banknote, Heart, Shield, Headphones,
    BarChart3, TrendingDown, ShoppingCart, Eye
  };

  return (
    <section className="py-2 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section - Shown first on mobile via order classes */}
          <div className="order-1 lg:order-2">
            <ApplyServiceForm onSubmit={handleFormSubmit} />
          </div>

          {/* Service Tabs Section */}
          <div className="order-2 lg:order-1">
            {/* Mobile Only/Top Heading */}
            <h2 className="text-sm font-bold uppercase text-blue-700 dark:text-blue-400 mb-4 tracking-widest">{services.heading}</h2>

            {/* Tab Navigation */}
            <div id="services" className="z-10 bg-transparent pt-2 pb-3 flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-neutral-800">
              {serviceTabs.map((tab) => {
                const TabIcon = iconComponents[tab.icon] || Banknote;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "whitespace-nowrap px-6 py-2.5 rounded-full flex items-center space-x-2 transition-all duration-300 border shadow-sm",
                      openedTab === tab.id
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 scale-105"
                        : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                    )}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span className="font-bold text-sm">{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left duration-500">
              {serviceTabs.map((tab) => (
                openedTab === tab.id && (
                  <div key={tab.id} className="space-y-4">
                    {tab.data.map((item, index) => {
                      const IconComponent = iconComponents[item.icon] || Shield;
                      return (
                        <Card key={index} className="group hover:border-blue-500/50 transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden border-border/50">
                          <div className="flex items-center p-5 gap-5">
                            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-foreground mb-1">{item.type}</h3>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                {tab.id === 'Loan' && (
                                  <div className="flex flex-wrap gap-x-4">
                                    <span>Interest: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).rate}</span></span>
                                    <span>Tenure: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).tenure}</span></span>
                                    <span>Amount: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).amount}</span></span>
                                  </div>
                                )}
                                {tab.id === 'Insurance' && (
                                  <div className="flex flex-wrap gap-x-4">
                                    <span>Coverage: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).coverage}</span></span>
                                    <span>Premium: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).premium}</span></span>
                                    <span className="italic opacity-80">{(item as any).features}</span>
                                  </div>
                                )}
                                {tab.id === 'Investment' && (
                                  <div className="flex flex-wrap gap-x-4">
                                    <span>Returns: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).returns}</span></span>
                                    <span>Risk: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).risk}</span></span>
                                    <span className="italic opacity-80">{(item as any).features}</span>
                                  </div>
                                )}
                                {tab.id === 'Property' && (
                                  <div className="flex flex-wrap gap-x-4">
                                    <span>Service: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).service}</span></span>
                                    <span>{(item as any).commission ? 'Commission' : 'Fee'}: <span className="text-blue-600 dark:text-blue-400 font-bold">{(item as any).commission || (item as any).fee}</span></span>
                                    <span className="italic opacity-80">{(item as any).features}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
