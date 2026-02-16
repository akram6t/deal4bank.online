import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/contexts/theme-context';
import { Inter, Space_Grotesk } from 'next/font/google';
import { getMergedSiteData } from '@/lib/site-data';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export async function generateMetadata(): Promise<Metadata> {
  const siteData = await getMergedSiteData();
  const logo = siteData?.settings?.logoUrl || 'https://picsum.photos/seed/deal-logo/100/100';
  const name = siteData?.settings?.name || 'Deal4Bank';
  const description = siteData?.settings?.siteDescription || 'Leading financial services platform offering competitive loan rates and comprehensive insurance solutions.';

  return {
    title: `${name} - Professional Financial Services | Loans, Insurance, Investment & Property`,
    description: description,
    keywords: 'financial services, loans, insurance, personal loans, home loans, car loans, life insurance, health insurance, India',
    authors: [{ name: 'Deal4Bank.com' }],
    creator: 'Deal4Bank.com',
    publisher: 'Deal4Bank.com',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://deal4bank.com'),
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
    openGraph: {
      title: `${name} - Professional Financial Services`,
      description: description,
      url: 'https://deal4bank.com',
      siteName: name,
      images: [
        {
          url: logo,
          width: 1200,
          height: 630,
          alt: `${name} - Financial Services`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - Professional Financial Services`,
      description: description,
      images: [logo],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FinancialService',
              name: 'deal4bank.com',
              description: 'Professional financial services platform offering loans and insurance solutions',
              url: 'https://deal4bank.com',
              telephone: '+91-924395699',
              email: 'info@deal4bank.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Indore',
                addressCountry: 'IN',
                streetAddress: 'Khirkiya, Madhya pradesh'
              },
              sameAs: [
                'https://facebook.com/deal4bank',
                'https://twitter.com/deal4bank',
                'https://linkedin.com/company/deal4bank'
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Financial Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'LoanOrCredit',
                      name: 'Personal Loans'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'InsurancePolicy',
                      name: 'Insurance Services'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'InvestmentIdeas',
                      name: 'Investment Services'
                    }
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'PropertyBuySale',
                      name: 'Property Services'
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}