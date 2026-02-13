
'use client';

import { ApplyServiceForm } from './ServiceForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Banknote, 
  Shield, 
  TrendingUp, 
  Building2, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const CATEGORIES = [
  { id: 'Loan', label: 'Loans', icon: Banknote, color: 'text-blue-600' },
  { id: 'Insurance', label: 'Insurance', icon: Shield, color: 'text-green-600' },
  { id: 'Investment', label: 'Investment', icon: TrendingUp, color: 'text-purple-600' },
  { id: 'Property', label: 'Property', icon: Building2, color: 'text-orange-600' },
];

export default function HeroSection({ activeTab, onTabChange }: HeroSectionProps) {
  return (
    <section id="services" className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground leading-tight">
            Tailored Financial Solutions for <span className="text-blue-600">Your Dreams</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            From home ownership to life security, we partner with India's top banks to bring you the most competitive rates and hassle-free processing.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="bg-muted/50 p-1 mb-8 flex flex-wrap h-auto gap-2">
            {CATEGORIES.map((cat) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id} 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
              >
                <cat.icon className="h-4 w-4" />
                <span className="font-bold">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid gap-4">
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Why Choose {CATEGORIES.find(c => c.id === activeTab)?.label}?</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Competitive interest rates starting at 8.5%",
                  "Zero hidden charges or processing fees",
                  "Quick online verification and approval",
                  "Dedicated relationship manager for guidance"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="h-3 w-3 text-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Tabs>

        <div className="flex items-center gap-8 pt-4">
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-headline">24h</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Processing</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-headline">100+</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Bank Partners</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-headline">0%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Consulting Fee</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 sticky top-24">
        <ApplyServiceForm onSubmit={async (data) => {
          const res = await fetch('/api/inquiries', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Failed to submit');
        }} />
      </div>
    </section>
  );
}
