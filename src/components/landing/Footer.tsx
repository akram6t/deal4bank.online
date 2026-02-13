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
              <svg 
                className="h-4 w-4 mr-2 fill-green-500" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
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