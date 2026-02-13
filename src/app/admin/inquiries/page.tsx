
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from "@/lib/utils";

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
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Inquiry[];
      setInquiries(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
      toast({ title: "Status updated" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Update failed" });
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      toast({ title: "Inquiry deleted" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Delete failed" });
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'contacted': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Contacted</Badge>;
      case 'closed': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Closed</Badge>;
      default: return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Service Inquiries</h1>
          <p className="text-muted-foreground mt-1">Manage applications received from the public form.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1">
          {inquiries.length} Total Applications
        </Badge>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-xl" />
          ))
        ) : inquiries.length === 0 ? (
          <Card className="p-12 text-center bg-muted/20">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No inquiries found yet.</p>
          </Card>
        ) : (
          inquiries.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={cn(
                    "w-2 shrink-0",
                    item.status === 'pending' ? "bg-orange-500" : 
                    item.status === 'contacted' ? "bg-blue-500" : "bg-green-500"
                  )} />
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold truncate">{item.fullName}</h3>
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Recent'}
                        </span>
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
                          <span className="truncate">{item.city}, {item.state} ({item.pincode})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 shrink-0 text-primary/60" />
                          <span className="font-semibold text-foreground">{item.service}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${item.email}`}><Mail className="h-4 w-4 mr-2" /> Reply</a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateStatus(item.id, 'contacted')}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" /> Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(item.id, 'closed')}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Mark Closed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(item.id, 'pending')}>
                            <Clock className="h-4 w-4 mr-2 text-orange-500" /> Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteInquiry(item.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Inquiry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
