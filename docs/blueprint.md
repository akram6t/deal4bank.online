# **App Name**: Deal4Bank Admin Center

## Core Features:

- Firebase Authentication: Secure admin access using Firebase Authentication with email/password login, logout, and persistent sessions. Role-based structure for admin and editor.
- Firestore Content Management: Manage website content (settings, contacts, states, services, emails) via Firestore with CRUD operations, reordering, visibility toggling, and logo uploads to Firebase Storage.
- Next.js App Router Structure: Admin panel built with Next.js App Router, organized into dedicated pages for dashboard, company, contacts, states, services, emails, and settings.
- Tab-Based Service Management: Dynamic service management system allowing admins to add/edit/delete tabs and service items within tabs, change icons, reorder items, and toggle visibility for Loans, Insurance, Investment, and Property services.
- Email Management System: Gmail-like UI for email management with real-time updates (Firestore onSnapshot), mark as read/unread, delete/move to trash, star email, search emails, filter by status, pagination, and email detail modal.
- Web Notifications: Display browser notifications and play notification sounds for new emails, update unread counters, and show toast alerts via Firebase Cloud Messaging (FCM).
- AI Content Suggestions: Suggest improvements to the tone of communications. The AI acts as a tool for rephrasing and refining communication tone.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to convey professionalism and trust.
- Background color: Very light gray (#F5F5F5) to create a clean and neutral backdrop.
- Accent color: Teal (#009688) to highlight key actions and elements.
- Body font: 'Inter', a sans-serif font for a modern and readable interface.
- Headline font: 'Space Grotesk', a sans-serif font, for a computerized, techy, scientific feel. Note: currently only Google Fonts are supported.
- Use Material Design Icons for a consistent and recognizable visual language.
- Modern dashboard layout with sidebar navigation and data tables. Ensure responsiveness across mobile and desktop devices.
- Subtle animations for loading states and transitions to improve user experience.