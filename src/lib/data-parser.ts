
/**
 * @fileOverview Data parsing utilities for Deal4Bank landing page.
 */

export const SITE_CONFIG = {
  company: {
    name: "Deal4Bank",
    tagline: "Your trusted financial partner",
    logo: "https://picsum.photos/seed/deal-logo/100/100",
    copyright: "© 2024 deal4bank.com. All rights reserved."
  },
  contacts: {
    phone: "+91-9243956990",
    whatsapp: {
      number: "9243956990",
      text: "from deal4bank.com \n I am Interested in your service."
    },
    email: {
      address: "info@deal4bank.online",
      subject: "Enquiry for your service",
      body: "Hello, I am interested in your service. Please contact me!"
    }
  },
  states: {
    heading: "Get <b>best deals</b> across <b>India</b> with <b>zero charges</b> — 100% hassle-free services!",
    services: [
      { id: "Loan", title: "Loan" },
      { id: "Property", title: "Buy/sell property" },
      { id: "Insurance", title: "Insurance" },
      { id: "Investment", title: "Investment idea" }
    ]
  },
  services: {
    heading: "Explore Our Financial Products",
    tabs: [
      {
        id: "Loan",
        title: "Loans",
        icon: "Banknote",
        data: [
          { type: "Personal Loan", icon: "User", rate: "10.5%", tenure: "1-5 Years", amount: "Up to 40 Lakhs" },
          { type: "Home Loan", icon: "Home", rate: "8.5%", tenure: "Up to 30 Years", amount: "Flexible" },
          { type: "Business Loan", icon: "Building2", rate: "12%", tenure: "1-7 Years", amount: "Up to 1 Crore" }
        ]
      },
      {
        id: "Insurance",
        title: "Insurance",
        icon: "Shield",
        data: [
          { type: "Life Insurance", icon: "Heart", coverage: "Term/Whole Life", premium: "Affordable", features: "Family Security" },
          { type: "Health Insurance", icon: "Shield", coverage: "Cashless", premium: "Tax Benefit", features: "Wide Network" }
        ]
      },
      {
        id: "Investment",
        title: "Investment",
        icon: "BarChart3",
        data: [
          { type: "Mutual Funds", icon: "BarChart3", returns: "Market Linked", risk: "Diversified", features: "SIP/Lumpsum" },
          { type: "Fixed Deposits", icon: "Banknote", returns: "Fixed", risk: "Low", features: "Guaranteed Returns" }
        ]
      },
      {
        id: "Property",
        title: "Property",
        icon: "Home",
        data: [
          { type: "Buy Property", icon: "ShoppingCart", service: "Assisted Buying", fee: "Minimal", features: "Legal Assistance" },
          { type: "Sell Property", icon: "Eye", service: "Direct Listing", commission: "0%", features: "Fast Closing" }
        ]
      }
    ]
  }
};

export function getCompanyData() {
  return SITE_CONFIG.company;
}

export function getContactData() {
  return SITE_CONFIG.contacts;
}

export function getStatesData() {
  return SITE_CONFIG.states;
}

export function getServiceData() {
  return SITE_CONFIG.services;
}

export function getWhatsappUri() {
  const { number, text } = SITE_CONFIG.contacts.whatsapp;
  return `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
}

export function getMailUri() {
  const { address, subject, body } = SITE_CONFIG.contacts.email;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
