
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const stats = [
  { title: 'Total Inquiries', value: '2,845', icon: Mail, trend: '+12%', color: 'text-primary' },
  { title: 'Active Services', value: '18', icon: ShieldCheck, trend: 'Stable', color: 'text-secondary' },
  { title: 'Response Rate', value: '94%', icon: TrendingUp, trend: '+4%', color: 'text-green-600' },
  { title: 'Pending Tasks', value: '7', icon: Clock, trend: '-2', color: 'text-orange-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.trend.startsWith('+') ? 'text-green-500' : ''}>{stat.trend}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Inquiry Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{
              value: { label: "Inquiries", color: "hsl(var(--primary))" }
            }}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { user: 'John Doe', action: 'Inquiry about Home Loan', time: '2 mins ago' },
                { user: 'Sarah Smith', action: 'Requested Insurance quote', time: '15 mins ago' },
                { user: 'System', action: 'Updated Service visibility', time: '1 hour ago' },
                { user: 'Mike Brown', action: 'New message received', time: '3 hours ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {item.user.charAt(0)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.user}</p>
                    <p className="text-sm text-muted-foreground">{item.action}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
