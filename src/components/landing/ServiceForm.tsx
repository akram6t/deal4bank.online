
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Home, Building2, Car, Banknote, Heart, Shield, BarChart3, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", 
  "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", 
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const formSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    phone: z.string()
        .min(1, 'Phone number is required')
        .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string()
        .min(1, 'Pincode is required')
        .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
    serviceType: z.string().min(1, 'Service type is required'),
});

export type HeroFormData = z.infer<typeof formSchema>;

const serviceCategories = {
    'Loans': [
        { value: 'Personal Loan', icon: User },
        { value: 'Business Loan', icon: Building2 },
        { value: 'Home Loan', icon: Home },
        { value: 'Mortgage Loan', icon: Banknote },
        { value: 'Gadi Loan', icon: Car }
    ],
    'Insurance': [
        { value: 'General Insurance', icon: Shield },
        { value: 'Life Insurance', icon: Heart },
        { value: 'Health Insurance', icon: Shield }
    ],
    'Investments': [
        { value: 'Mutual Fund', icon: BarChart3 },
        { value: 'Fixed Deposit', icon: Banknote }
    ],
    'Property': [
        { value: 'Property (Buy/Sale)', icon: Home }
    ]
};

interface ApplyServiceFormProps {
    onSubmit: (formData: HeroFormData) => Promise<void>;
}

export function ApplyServiceForm({ onSubmit }: ApplyServiceFormProps) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        trigger,
        reset,
        watch,
    } = useForm<HeroFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            city: '',
            state: '',
            pincode: '',
            serviceType: ''
        }
    });

    const onSubmitHandler = async (data: HeroFormData) => {
        try {
            await onSubmit(data);
            setIsSuccessModalOpen(true);
            reset();
        } catch (error) {
            console.error('Submission error:', error);
        }
    };

    return (
        <>
            <Card className="shadow-2xl border-primary/10 bg-card/50 backdrop-blur-md overflow-hidden animate-in zoom-in duration-500">
                <CardHeader className="text-center bg-primary text-primary-foreground pb-8">
                    <CardTitle className="text-2xl font-headline font-bold">Quick Application</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Get a callback from our experts within 24 hours.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="font-bold">Full Name *</Label>
                            <Input
                                id="fullName"
                                {...register('fullName')}
                                className={errors.fullName ? 'border-destructive' : ''}
                                placeholder="John Doe"
                            />
                            {errors.fullName && <p className="text-destructive text-xs font-bold">{errors.fullName.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="email" className="font-bold">Email *</Label>
                              <Input
                                  id="email"
                                  type="email"
                                  {...register('email')}
                                  className={errors.email ? 'border-destructive' : ''}
                                  placeholder="john@example.com"
                              />
                              {errors.email && <p className="text-destructive text-xs font-bold">{errors.email.message}</p>}
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="phone" className="font-bold">Phone Number *</Label>
                              <div className='relative'>
                                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold'>+91</span>
                                  <Input
                                      id="phone"
                                      type="tel"
                                      {...register('phone')}
                                      className={`pl-12 ${errors.phone ? 'border-destructive' : ''}`}
                                      placeholder="9876543210"
                                  />
                              </div>
                              {errors.phone && <p className="text-destructive text-xs font-bold">{errors.phone.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="font-bold">City *</Label>
                                <Input id="city" {...register('city')} placeholder="Mumbai" />
                                {errors.city && <p className="text-destructive text-xs font-bold">{errors.city.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="font-bold">State *</Label>
                                <Select onValueChange={(v) => { setValue('state', v); trigger('state'); }}>
                                    <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDIAN_STATES.map((state) => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pincode" className="font-bold">Pincode *</Label>
                                <Input id="pincode" {...register('pincode')} placeholder="400001" maxLength={6} />
                                {errors.pincode && <p className="text-destructive text-xs font-bold">{errors.pincode.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceType" className="font-bold">Select Service *</Label>
                            <Select onValueChange={(v) => { setValue('serviceType', v); trigger('serviceType'); }}>
                                <SelectTrigger className={`h-12 ${errors.serviceType ? 'border-destructive' : ''}`}>
                                    <SelectValue placeholder="What are you looking for?" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {Object.entries(serviceCategories).map(([category, services]) => (
                                        <div key={category}>
                                            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30">
                                                {category}
                                            </div>
                                            {services.map((service) => (
                                                <SelectItem key={service.value} value={service.value}>
                                                    <div className="flex items-center gap-2">
                                                        <service.icon className="h-4 w-4 text-primary" />
                                                        {service.value}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Apply Now'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-2xl font-headline font-bold">Application Successful!</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-2">
                        <p className="text-muted-foreground">
                            Thank you for choosing <span className="text-foreground font-bold underline">Deal4Bank</span>. Your inquiry has been prioritized.
                        </p>
                        <p className="text-sm font-medium">An expert executive will call you within 24 business hours.</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsSuccessModalOpen(false)} className="w-full py-6 font-bold">
                            Got it, thanks!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
