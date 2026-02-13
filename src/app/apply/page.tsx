
"use client"

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [services, setServices] = useState<{ id: string, title: string }[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    service: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    async function fetchServices() {
      // Fetch all service items across all categories to populate the dropdown
      const tabsSnap = await getDocs(collection(db, 'services_tabs'));
      const allServices: { id: string, title: string }[] = [];
      
      for (const tabDoc of tabsSnap.docs) {
        const itemsSnap = await getDocs(collection(db, `services_tabs/${tabDoc.id}/items`));
        itemsSnap.forEach(itemDoc => {
          allServices.push({ 
            id: itemDoc.id, 
            title: `${itemDoc.data().title} (${tabDoc.data().name})` 
          });
        });
      }
      setServices(allServices);
    }
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.service) {
      toast({ variant: 'destructive', title: "Missing fields", description: "Please fill in all required information." });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      toast({ title: "Application Submitted", description: "We will contact you shortly." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Submission failed", description: "Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 animate-in zoom-in duration-300">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-headline">Thank You!</CardTitle>
            <p className="text-muted-foreground">Your application has been received. Our executive will reach out to you within 24 hours.</p>
          </div>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">Submit Another Application</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 font-body">
      <Card className="max-w-2xl w-full shadow-xl border-none">
        <CardHeader className="text-center space-y-2 pb-8">
          <CardTitle className="text-3xl font-headline font-bold">Apply for Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Full Name *</Label>
                <Input 
                  placeholder="Enter your full name" 
                  className="bg-muted/50 border-muted focus:bg-background"
                  value={formData.fullName}
                  onChange={e => setFormData(p => ({...p, fullName: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email Address *</Label>
                <Input 
                  type="email"
                  placeholder="Enter your email address" 
                  className="bg-muted/50 border-muted focus:bg-background"
                  value={formData.email}
                  onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Phone Number *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                  <Input 
                    type="tel"
                    placeholder="Enter your phone number" 
                    className="pl-12 bg-muted/50 border-muted focus:bg-background"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">City *</Label>
                  <Input 
                    placeholder="Enter your city" 
                    className="bg-muted/50 border-muted focus:bg-background"
                    value={formData.city}
                    onChange={e => setFormData(p => ({...p, city: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">State *</Label>
                  <Select onValueChange={val => setFormData(p => ({...p, state: val}))}>
                    <SelectTrigger className="bg-muted/50 border-muted focus:bg-background">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Pincode *</Label>
                  <Input 
                    placeholder="Enter pincode" 
                    className="bg-muted/50 border-muted focus:bg-background"
                    value={formData.pincode}
                    onChange={e => setFormData(p => ({...p, pincode: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Service *</Label>
                <Select onValueChange={val => setFormData(p => ({...p, service: val}))}>
                  <SelectTrigger className="bg-muted/50 border-muted focus:bg-background py-6">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.title}>{service.title}</SelectItem>
                    ))}
                    {services.length === 0 && <p className="p-2 text-xs text-muted-foreground">Loading services...</p>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={loading}>
              {loading ? "Processing..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
