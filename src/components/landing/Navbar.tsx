
'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import Image from 'next/image';
import { getCompanyData, getContactData } from '@/lib/data-parser';

export default function Navbar() {
  const company = getCompanyData();
  const contacts = getContactData();

  return (
    <nav className="bg-blue-800 text-white border-b border-white/10 sticky top-0 z-50 transition-colors duration-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className='h-8 w-8 p-1 overflow-hidden mr-3 bg-white rounded-full flex items-center justify-center'>
              <Image 
                className="h-full w-full object-contain" 
                src={company.logo} 
                width={32} 
                height={32} 
                alt='logo' 
                data-ai-hint="company logo"
              />
            </div>
            <Link href="/" className="text-xl font-bold font-headline tracking-tight">
              {company.name}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm md:text-base font-medium">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:+91${contacts.whatsapp.number}`} className="hover:text-blue-200 transition-colors">
                {contacts.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
