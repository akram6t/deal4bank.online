
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HomeClient from '@/components/landing/HomeClient';
import { getMergedSiteData } from '@/lib/site-data';

/**
 * @fileOverview The main landing page for Deal4Bank.
 * Now a Server Component that fetches initial site data (settings and services)
 * directly from Firestore for SEO and performance.
 */

export default async function Home() {
  const siteData = await getMergedSiteData();

  return (
    <main className="min-h-screen bg-blue-50 dark:bg-neutral-950 transition-colors duration-200 relative">
      <Navbar settings={siteData?.settings} />

      <div className="max-w-7xl mx-auto py-4">
        {/* Client-side interactive parts */}
        <HomeClient services={siteData?.services} />
      </div>

      <Footer settings={siteData?.settings} />
    </main>
  );
}
