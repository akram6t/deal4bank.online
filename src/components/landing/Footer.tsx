
'use client';

import { Mail, Sun, Moon, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import Image from 'next/image';
import { getCompanyData, getContactData, getMailUri, getWhatsappUri } from '@/lib/data-parser';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();
  const company = getCompanyData();
  const contacts = getContactData();

  return (
    <footer className="mt-20 bg-blue-800 dark:bg-neutral-900 text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold font-headline">{company.name}</h3>
            <p className="text-gray-200 dark:text-gray-400 max-w-sm">
              {company.tagline}. We empower your financial future with expert guidance and transparent banking solutions.
            </p>
            <div className="flex gap-4">
              <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg uppercase tracking-widest text-blue-300">Quick Links</h4>
            <ul className="space-y-3 text-gray-200">
              <li><a href="#services" className="hover:text-blue-200">Loans</a></li>
              <li><a href="#services" className="hover:text-blue-200">Insurance</a></li>
              <li><a href="#services" className="hover:text-blue-200">Investments</a></li>
              <li><a href="/admin" className="hover:text-blue-200">Admin Login</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg uppercase tracking-widest text-blue-300">Contact Us</h4>
            <ul className="space-y-4 text-gray-200">
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 flex items-center justify-center">
                  <Image src="/whatsapp.png" alt="WA" width={20} height={20} className="invert" />
                </div>
                <a href={getWhatsappUri()} target="_blank" className="hover:text-blue-200">{contacts.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <a href={getMailUri()} className="hover:text-blue-200">{contacts.email.address}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-400">{company.copyright}</p>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </footer>
  );
}
