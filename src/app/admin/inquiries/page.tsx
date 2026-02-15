
"use client"

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ClipboardList, 
  Trash2, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock,
  Briefcase,
  Filter,
  Download,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, subDays, startOfDay, isBefore, isValid } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  service: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: any;
  followUpDate?: any;
  isDummy?: boolean;
}

const DUMMY_INQUIRIES: Inquiry[] = [
  {
    id: 'dummy-1',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.k@example.com',
    phone: '9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    service: 'Home Loan (Loans)',
    status: 'pending',
    createdAt: { seconds: Date.now() / 1000 - 3600 },
    isDummy: true
  },
  {
    id: 'dummy-2',
    fullName: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '9123456789',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    service: 'Health Insurance (Insurance)',
    status: 'contacted',
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    followUpDate: { seconds: Date.now() / 1000 - 172800 },
    isDummy: true
  }
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Inquiry[];
      
      if (list.length === 0) {
        setInquiries(DUMMY_INQUIRIES);
      } else {
        setInquiries(list);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setInquiries(DUMMY_INQUIRIES);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredInquiries = useMemo(() => {
    const now = new Date();
    return inquiries.filter(item => {
      if (dateFilter === 'all') return true;
      
      const date = item.createdAt?.seconds 
        ? new Date(item.createdAt.seconds * 1000) 
        : new Date();

      switch (dateFilter) {
        case 'today':
          return isAfter(date, startOfDay(now));
        case 'yesterday':
          return isAfter(date, startOfDay(subDays(now, 1))) && isBefore(date, startOfDay(now));
        case 'last7days':
          return isAfter(date, subDays(now, 7));
        case 'pending_followup':
          if (!item.followUpDate) return false;
          const followUp = new Date(item.followUpDate.seconds * 1000);
          return isBefore(followUp, now) && item.status !== 'closed';
        default:
          return true;
      }
    });
  }, [inquiries, dateFilter]);

  const updateStatus = async (id: string, status: Inquiry['status'], isDummy?: boolean) => {
    if (isDummy) {
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      toast({ title: "Status updated (Demo Mode)" });
      return;
    }
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
      toast({ title: "Status updated" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Update failed" });
    }
  };

  const updateFollowUpDate = async (id: string, date: Date | undefined, isDummy?: boolean) => {
    if (isDummy) {
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, followUpDate: date ? { seconds: date.getTime() / 1000 } : null } : item));
      toast({ title: "Follow-up date updated (Demo Mode)" });
      return;
    }
    try {
      await updateDoc(doc(db, 'inquiries', id), { 
        followUpDate: date ? Timestamp.fromDate(date) : null 
      });
      toast({ title: "Follow-up date updated" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Update failed" });
    }
  };

  const deleteInquiry = async (id: string, isDummy?: boolean) => {
    if (isDummy) {
      setInquiries(prev => prev.filter(item => item.id !== id));
      toast({ title: "Inquiry deleted (Demo Mode)" });
      return;
    }
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      toast({ title: "Inquiry deleted" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Delete failed" });
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredInquiries.map(item => ({
      'Full Name': item.fullName,
      'Email': item.email,
      'Phone': item.phone,
      'Service': item.service,
      'City': item.city,
      'State': item.state,
      'Pincode': item.pincode,
      'Status': item.status.toUpperCase(),
      'Applied On': item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), 'yyyy-MM-dd HH:mm') : 'N/A',
      'Follow-up Date': item.followUpDate?.seconds ? format(new Date(item.followUpDate.seconds * 1000), 'yyyy-MM-dd') : 'None'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");
    
    // Generate filename based on date filter
    const filename = `Deal4Bank_Inquiries_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast({ title: "Excel Downloaded", description: `${dataToExport.length} inquiries exported.` });
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'contacted': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Contacted</Badge>;
      case 'closed': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Closed</Badge>;
      default: return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Service Inquiries</h1>
          <p className="text-muted-foreground mt-1">Manage applications and schedule follow-ups.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={exportToExcel} className="h-10 bg-background hover:bg-muted">
            <Download className="h-4 w-4 mr-2" /> Export to Excel
          </Button>

          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[200px] border-none bg-transparent shadow-none focus:ring-0">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries</SelectItem>
                <SelectItem value="today">Today's New</SelectItem>
                <SelectItem value="yesterday">Yesterday's New</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="pending_followup">Overdue Follow-ups</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Badge variant="outline" className="px-4 py-1.5 h-10 border-dashed">
            {filteredInquiries.length} Result{filteredInquiries.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-xl" />
          ))
        ) : filteredInquiries.length === 0 ? (
          <Card className="p-20 text-center bg-muted/10 border-dashed">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No inquiries found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Try adjusting your filters or wait for new applications.</p>
          </Card>
        ) : (
          filteredInquiries.map((item) => {
            const followUpDateObj = item.followUpDate?.seconds ? new Date(item.followUpDate.seconds * 1000) : null;
            const isOverdue = followUpDateObj && isBefore(followUpDateObj, startOfDay(new Date())) && item.status !== 'closed';

            return (
              <Card key={item.id} className="hover:shadow-md transition-all group overflow-hidden border-border bg-card">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={cn(
                      "w-2 shrink-0",
                      item.status === 'pending' ? "bg-orange-500" : 
                      item.status === 'contacted' ? "bg-blue-500" : "bg-green-500"
                    )} />
                    <div className="flex-1 p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold truncate text-foreground">{item.fullName}</h3>
                          {getStatusBadge(item.status)}
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Recent'}
                          </span>
                          {isOverdue && (
                            <Badge variant="destructive" className="animate-pulse flex items-center gap-1 text-[10px]">
                              <AlertCircle className="h-3 w-3" /> Overdue Follow-up
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                            <span className="truncate">{item.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                            <span>+91 {item.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                            <span className="truncate">{item.city}, {item.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 shrink-0 text-primary/60" />
                            <span className="font-semibold text-foreground">{item.service}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 lg:shrink-0">
                        {/* Follow-up Date Picker */}
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Follow-up</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn(
                                  "h-9 px-3 rounded-full text-xs font-medium gap-2",
                                  !followUpDateObj && "text-muted-foreground border-dashed",
                                  isOverdue && "border-destructive text-destructive bg-destructive/5"
                                )}
                              >
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {followUpDateObj ? format(followUpDateObj, 'MMM d, yyyy') : 'Set Date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                mode="single"
                                selected={followUpDateObj || undefined}
                                onSelect={(date) => updateFollowUpDate(item.id, date, item.isDummy)}
                                initialFocus
                              />
                              {followUpDateObj && (
                                <div className="p-2 border-t text-center">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full text-destructive text-[10px] h-7"
                                    onClick={() => updateFollowUpDate(item.id, undefined, item.isDummy)}
                                  >
                                    Clear Follow-up
                                  </Button>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex items-center gap-2 h-fit lg:mt-5">
                          <Button variant="outline" size="sm" asChild className="rounded-full">
                            <a href={`mailto:${item.email}`}><Mail className="h-4 w-4 mr-2" /> Reply</a>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateStatus(item.id, 'contacted', item.isDummy)}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" /> Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(item.id, 'closed', item.isDummy)}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Mark Closed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(item.id, 'pending', item.isDummy)}>
                                <Clock className="h-4 w-4 mr-2 text-orange-500" /> Mark Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteInquiry(item.id, item.isDummy)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Inquiry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
