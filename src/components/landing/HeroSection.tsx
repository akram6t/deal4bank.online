
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Clock, TrendingDown, Headphones, Eye, Home, User, Building2, Car, Heart, BarChart3, Banknote, ShoppingCart } from 'lucide-react';
import { ApplyServiceForm, HeroFormData } from './ServiceForm';
import { getServiceData } from '@/lib/data-parser';

interface HeroSectionProps {
  openedTab: string,
  onTabChange: (tabId: string) => void,
  servicesData?: any
}

export default function HeroSection({ openedTab, onTabChange, servicesData }: HeroSectionProps) {
  // Use dynamic data if provided, otherwise fallback to static SITE_CONFIG
  const services = servicesData || getServiceData();
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
          {/* Form Section - Left Side (Shown first on mobile) */}
          <div className="order-1 lg:order-2">
            <ApplyServiceForm onSubmit={handleFormSubmit} />
          </div>

          {/* Service Tabs Section - Right Side (Hidden on mobile, shown after form) */}
          <div className="order-2 lg:order-1">
            {/* Heading */}
            <h2 className="text-sm font-semibold uppercase text-blue-700 dark:text-blue-400 mb-4">{services.heading}</h2>

            {/* Tab Navigation */}
            <div id="services" className="z-10 bg-white dark:bg-neutral-900 pt-2 pb-3 flex items-center gap-2 mb-2 overflow-x-scroll scrollbar-hide border-b border-gray-200 dark:border-neutral-700">
              {serviceTabs.map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`${serviceTabs[0].id === tab.id ? 'ms-2' : ''} ${serviceTabs[serviceTabs.length - 1].id === tab.id ? 'me-6' : ''} px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 whitespace-nowrap ${openedTab === tab.id
                    ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-gray-700'
                    }`}
                >
                  <span className="font-medium">{tab.title}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200 min-h-[400px]">
              {serviceTabs.map((tab: any) => (
                openedTab === tab.id && (
                  <div key={tab.id} className="space-y-4 animate-in fade-in duration-300">
                    {tab.data.map((item: any, index: number) => {
                      const IconComponent = iconComponents[item.icon] || Shield;
                      return (
                        <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-200 hover:shadow-sm">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-600/20">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.type}</h3>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {tab.id.toLowerCase().includes('loan') && (
                              <span>Interest: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.rate || 'N/A'}</span> | Tenure: <span className="text-blue-600 font-semibold dark:text-blue-300">{item.tenure || 'N/A'}</span> | Amount: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.amount || 'N/A'}</span></span>
                            )}
                            {tab.id.toLowerCase().includes('insurance') && (
                              <span>Coverage: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.coverage || 'N/A'}</span> | Premium: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.premium || 'N/A'}</span> | Features: <span className="text-blue-600 dark:text-blue-300">{item.features || 'N/A'}</span></span>
                            )}
                            {tab.id.toLowerCase().includes('investment') && (
                              <span>Returns: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.returns || 'N/A'}</span> | Risk: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.risk || 'N/A'}</span> | Features: <span className="text-blue-600 dark:text-blue-300">{item.features || 'N/A'}</span></span>
                            )}
                            {tab.id.toLowerCase().includes('property') && (
                              <span>Service: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.service || 'N/A'}</span> | {item.commission ? 'Commission' : 'Fee'}: <span className="text-blue-600 dark:text-blue-300 font-semibold">{item.commission || item.fee || 'N/A'}</span> | Features: <span className="text-blue-600 dark:text-blue-300">{item.features || 'N/A'}</span></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {tab.data.length === 0 && (
                      <div className="py-20 text-center text-muted-foreground opacity-50">
                        <p>No products found in this category.</p>
                      </div>
                    )}
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
