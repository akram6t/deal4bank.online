
"use client"

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  BellRing
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, startOfMonth, subMonths, isAfter, startOfDay } from 'date-fns';
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalInquiries: number;
  todayInquiries: number;
  pendingTasks: number;
  activeProducts: number;
  recentActivity: any[];
  chartData: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInquiries: 0,
    todayInquiries: 0,
    pendingTasks: 0,
    activeProducts: 0,
    recentActivity: [],
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Inquiries and Notifications
    const inquiriesQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(5));

    const unsubInquiries = onSnapshot(inquiriesQuery, async (snapshot) => {
      const docs = snapshot.docs.map(d => d.data());
      const now = new Date();
      const today = startOfDay(now);
      
      const total = snapshot.size;
      const todayCount = docs.filter(d => d.createdAt?.seconds && isAfter(new Date(d.createdAt.seconds * 1000), today)).length;
      const pending = docs.filter(d => d.status === 'pending').length;

      // Calculate Chart Data (Last 6 Months)
      const months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(now, 5 - i);
        return {
          name: format(d, 'MMM'),
          start: startOfMonth(d),
          value: 0
        };
      });

      docs.forEach(d => {
        if (!d.createdAt) return;
        const date = new Date(d.createdAt.seconds * 1000);
        const monthName = format(date, 'MMM');
        const monthIndex = months.findIndex(m => m.name === monthName);
        if (monthIndex > -1) {
          months[monthIndex].value += 1;
        }
      });

      // 2. Fetch Active Products (nested items)
      let productCount = 0;
      try {
        const tabsSnap = await getDocs(collection(db, 'services_tabs'));
        for (const tab of tabsSnap.docs) {
          const itemsSnap = await getDocs(collection(db, `services_tabs/${tab.id}/items`));
          productCount += itemsSnap.size;
        }
      } catch (e) {
        console.warn("Product count error", e);
      }

      setStats(prev => ({
        ...prev,
        totalInquiries: total,
        todayInquiries: todayCount,
        pendingTasks: pending,
        activeProducts: productCount,
        chartData: months
      }));
      setLoading(false);
    });

    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStats(prev => ({ ...prev, recentActivity: activities }));
    });

    return () => {
      unsubInquiries();
      unsubNotifications();
    };
  }, []);

  const kpis = [
    { 
      title: 'Total Inquiries', 
      value: stats.totalInquiries.toLocaleString(), 
      icon: Mail, 
      desc: `${stats.todayInquiries} received today`, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Pending Leads', 
      value: stats.pendingTasks.toLocaleString(), 
      icon: Clock, 
      desc: 'Requires immediate action', 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    { 
      title: 'Active Products', 
      value: stats.activeProducts.toLocaleString(), 
      icon: ShieldCheck, 
      desc: 'Live financial services', 
      color: 'text-green-600',
      bg: 'bg-green-600/10'
    },
    { 
      title: 'Conversion Rate', 
      value: stats.totalInquiries > 0 ? `${Math.round(((stats.totalInquiries - stats.pendingTasks) / stats.totalInquiries) * 100)}%` : '0%', 
      icon: TrendingUp, 
      desc: 'Based on closed inquiries', 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Real-time performance metrics and recent application activity.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-all border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Trend Chart */}
        <Card className="col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Application Volume</CardTitle>
            <CardDescription>Monthly inquiry trends for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
            <ChartContainer config={{
              value: { label: "Inquiries", color: "hsl(var(--primary))" }
            }}>
              <BarChart data={stats.chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === stats.chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.3)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Notifications / Activity */}
        <Card className="col-span-3 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Live Activity</CardTitle>
              <CardDescription>Latest system events and leads</CardDescription>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
               <BellRing className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentActivity.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground opacity-50 flex flex-col items-center">
                  <Mail className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-xs">No recent activity detected</p>
                </div>
              ) : (
                stats.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start group">
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors",
                      item.type === 'NEW_INQUIRY' ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
                    )}>
                      {item.type === 'NEW_INQUIRY' ? <Users className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </div>
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-bold leading-none truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-medium">
                        {item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), 'h:mm a, MMM d') : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
