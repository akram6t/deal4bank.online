
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

  const iconComponents: Record<string, React.ComponentType<any>> = {
    User, Home, Building2, Car, Banknote, Heart, Shield, Headphones,
    BarChart3, TrendingDown, ShoppingCart, Eye
  };

  // Normalizes dynamic attribute arrays into keys used in your logic
  const normalizeItem = (item: any) => {
    if (!item.attributes || !Array.isArray(item.attributes)) return item;
    const normalized = { ...item };
    item.attributes.forEach((attr: any) => {
      const label = attr.label.toLowerCase();
      if (label.includes('interest')) normalized.rate = attr.value;
      if (label.includes('tenure')) normalized.tenure = attr.value;
      if (label.includes('amount')) normalized.amount = attr.value;
      if (label.includes('coverage')) normalized.coverage = attr.value;
      if (label.includes('premium')) normalized.premium = attr.value;
      if (label.includes('features')) normalized.features = attr.value;
      if (label.includes('returns')) normalized.returns = attr.value;
      if (label.includes('risk')) normalized.risk = attr.value;
      if (label.includes('service')) normalized.service = attr.value;
      if (label.includes('commision') || label.includes('commission')) normalized.commission = attr.value;
      if (label.includes('fee')) normalized.fee = attr.value;
    });
    return normalized;
  };

  return (
    <section className="py-2 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="order-1 lg:order-2">
            <ApplyServiceForm onSubmit={handleFormSubmit} />
          </div>

          <div className="order-2 lg:order-1">
            <h2 className="text-sm font-semibold uppercase text-blue-700 dark:text-blue-400 mb-4">{services.heading}</h2>

            <div id="services" className="z-10 bg-white dark:bg-neutral-900 pt-2 pb-3 flex items-center gap-2 mb-2 overflow-x-scroll scrollbar-hide border-b border-gray-200 dark:border-neutral-700">
              {serviceTabs.map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`${serviceTabs[0].id === tab.id ? 'ms-2' : ''} ${serviceTabs[serviceTabs.length - 1].id === tab.id ? 'me-6' : ''} px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${openedTab === tab.id || (openedTab.toLowerCase() === tab.title.toLowerCase().replace(/[^a-z]/g, ''))
                    ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-gray-700'
                    }`}
                >
                  <span className="font-medium">{tab.title}</span>
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200 min-h-[400px]">
              {serviceTabs.map((tab: any) => (
                (openedTab === tab.id || openedTab.toLowerCase() === tab.title.toLowerCase().replace(/[^a-z]/g, '')) && (
                  <div key={tab.id} className="space-y-4 animate-in fade-in duration-300">
                    {tab.data.map((rawItem: any, index: number) => {
                      const item = normalizeItem(rawItem);
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
                            {(tab.id === 'Loan' || tab.title.toLowerCase().includes('loan')) && (
                              <span>Interest: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).rate || 'N/A'}</span> | Tenure: <span className="text-blue-600 font-semibold dark:text-blue-300 font-semibold">{(item as any).tenure || 'N/A'}</span> | Amount: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).amount || 'N/A'}</span></span>
                            )}
                            {(tab.id === 'Insurance' || tab.title.toLowerCase().includes('insurance')) && (
                              <span>Coverage: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).coverage || 'N/A'}</span> | Premium: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).premium || 'N/A'}</span> | Features: <span className="text-blue-600 dark:text-blue-300">{(item as any).features || 'N/A'}</span></span>
                            )}
                            {(tab.id === 'Investment' || tab.title.toLowerCase().includes('investment')) && (
                              <span>Returns: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).returns || 'N/A'}</span> | Risk: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).risk || 'N/A'}</span> | Features: <span className="text-blue-600 dark:text-blue-300">{(item as any).features || 'N/A'}</span></span>
                            )}
                            {(tab.id === 'Property' || tab.title.toLowerCase().includes('property')) && (
                              <span>Service: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).service || 'N/A'}</span> | {(item as any).commission ? 'Commission' : 'Fee'}: <span className="text-blue-600 dark:text-blue-300 font-semibold">{(item as any).commission || (item as any).fee || 'N/A'}</span> | Features: <span className="text-blue-600 dark:text-blue-300">{(item as any).features || 'N/A'}</span></span>
                            )}
                          </div>
                        </div>
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
