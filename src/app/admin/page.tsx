import { redirect } from 'next/navigation';

/**
 * @fileOverview Root admin page that redirects to the dashboard.
 * This prevents 404 errors when a user navigates directly to /admin.
 */

export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
