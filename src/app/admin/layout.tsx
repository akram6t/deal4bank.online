
"use client"

import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex flex-1 items-center justify-between">
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Admin</span>
                  <span>/</span>
                  <span className="capitalize">{typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : 'Dashboard'}</span>
                </nav>
              </div>
            </header>
            <main className="p-6 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
