'use client';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import Image from 'next/image';
import { getCompanyData, getContactData, getMailUri, getWhatsappUri } from '@/lib/data-parser';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();
  const company = getCompanyData();
  const contacts = getContactData();

  return (
    <footer className="mt-10 bg-blue-800 dark:bg-neutral-900 text-gray-100 dark:text-white backdrop-blur-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-50 dark:text-blue-400 mb-2">{company.name}</h3>
            <p className="text-gray-50 dark:text-gray-300 text-sm">{company.tagline}</p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-50 dark:text-gray-300">
            <div className="flex items-center">
              <Image src="/whatsapp.png" alt='wa' width={16} height={16} className="h-4 w-4 mr-2 text-green-500" />
              <a href={getWhatsappUri()} target='_blank'>{contacts.phone}</a>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-blue-400" />
              <a href={getMailUri()}>{contacts.email.address}</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 text-center text-gray-50 dark:text-gray-400 text-sm transition-colors duration-200">
          <p>{company.copyright}</p>
        </div>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute right-3 bottom-3 p-1 rounded-lg bg-blue-950 text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-2 w-2" />
          ) : (
            <Moon className="h-2 w-2" />
          )}
        </button>
      </div>
    </footer>
  );
}