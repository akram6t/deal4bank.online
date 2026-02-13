
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  Briefcase, 
  Mail, 
  Settings, 
  LogOut
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Building2, label: 'Company', href: '/admin/company' },
  { icon: ClipboardList, label: 'Inquiries', href: '/admin/inquiries' },
  { icon: Briefcase, label: 'Services', href: '/admin/services' },
  { icon: Mail, label: 'Emails', href: '/admin/emails' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <div className="bg-primary p-2 rounded-lg text-primary-foreground">
          <Building2 className="h-6 w-6" />
        </div>
        {state === "expanded" && (
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg leading-none">Deal4Bank</span>
            <span className="text-xs text-muted-foreground">Admin Center</span>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton 
               className="text-destructive hover:bg-destructive/10 hover:text-destructive"
               onClick={logout}
               tooltip="Logout"
             >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {state === "expanded" && user && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {user.email?.charAt(0).toUpperCase()}
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-sm font-medium truncate">{user.email}</span>
               <span className="text-xs text-muted-foreground">Administrator</span>
             </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
