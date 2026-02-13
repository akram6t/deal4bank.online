
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

export function getWhatsappUri() {
  const { number, text } = SITE_CONFIG.contacts.whatsapp;
  return `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
}

export function getMailUri() {
  const { address, subject, body } = SITE_CONFIG.contacts.email;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
