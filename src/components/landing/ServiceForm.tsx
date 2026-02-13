
'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Home, Building2, Car, Banknote, Heart, Shield, BarChart3, CheckCircle2 } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/constants';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Zod schema for form validation
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

// Infer the type from the schema
export type HeroFormData = z.infer<typeof formSchema>;

// Service types for dropdown - categorized
const serviceCategories = {
    'Loans': [
        { value: 'Personal Loan', icon: <User className="h-4 w-4" /> },
        { value: 'Business Loan', icon: <Building2 className="h-4 w-4" /> },
        { value: 'Home Loan', icon: <Home className="h-4 w-4" /> },
        { value: 'Mortgage Loan', icon: <Banknote className="h-4 w-4" /> },
        { value: 'Gadi Loan', icon: <Car className="h-4 w-4" /> }
    ],
    'Insurance': [
        { value: 'General Insurance', icon: <Shield className="h-4 w-4" /> },
        { value: 'Life Insurance', icon: <Heart className="h-4 w-4" /> },
        { value: 'Health Insurance', icon: <Shield className="h-4 w-4" /> }
    ],
    'Investments': [
        { value: 'Mutual Fund', icon: <BarChart3 className="h-4 w-4" /> },
        { value: 'Fixed Deposit', icon: <Banknote className="h-4 w-4" /> }
    ],
    'Property': [
        { value: 'Property (Buy/Sale)', icon: <Home className="h-4 w-4" /> }
    ]
};

interface ApplyServiceFormProps {
    onSubmit: (formData: HeroFormData) => Promise<void>;
}

export function ApplyServiceForm({ onSubmit }: ApplyServiceFormProps) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

    // Scroll to the first error field
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const errorElement = errorRefs.current[firstErrorKey as keyof HeroFormData];

            if (errorElement) {
                errorElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [errors]);

    // Handle form submission
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
            <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 backdrop-blur-sm transition-colors duration-200">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl text-gray-900 dark:text-white">Apply for Service</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
                        {/* Full Name */}
                        <div ref={(el) => (errorRefs.current['fullName'] = el)}>
                            <Label htmlFor="fullName" className="text-gray-900 dark:text-white mb-2 block">Full Name *</Label>
                            <Input
                                id="fullName"
                                type="text"
                                {...register('fullName')}
                                className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-colors duration-200 ${errors.fullName ? 'border-red-500' : ''}`}
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                        </div>

                        {/* Email */}
                        <div ref={(el) => (errorRefs.current['email'] = el)}>
                            <Label htmlFor="email" className="text-gray-900 dark:text-white mb-2 block">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-colors duration-200 ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="Enter your email address"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Phone Number */}
                        <div ref={(el) => (errorRefs.current['phone'] = el)}>
                            <Label htmlFor="phone" className="text-gray-900 dark:text-white mb-2 block">Phone Number *</Label>
                            <div className='relative'>
                                <Input
                                    id="phone"
                                    type="tel"
                                    {...register('phone')}
                                    className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white ps-9 pe-4 py-3 placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-colors duration-200 ${errors.phone ? 'border-red-500' : ''}`}
                                    placeholder="Enter your phone number"
                                />
                                <span className='text-sm opacity-70 absolute left-2 top-2 translate-y-[2px]'>
                                    +91
                                </span>
                            </div>
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>

                        {/* City, State, Pincode in one row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div ref={(el) => (errorRefs.current['city'] = el)}>
                                <Label htmlFor="city" className="text-gray-900 dark:text-white mb-2 block">City *</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    {...register('city')}
                                    className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-colors duration-200 ${errors.city ? 'border-red-500' : ''}`}
                                    placeholder="Enter your city"
                                />
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                            </div>

                            <div ref={(el) => (errorRefs.current['state'] = el)}>
                                <Label htmlFor="state" className="text-gray-900 dark:text-white mb-2 block">State *</Label>
                                <Select
                                    value={watch('state')}
                                    onValueChange={(value) => {
                                        setValue('state', value);
                                        trigger('state');
                                    }}
                                >
                                    <SelectTrigger className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 transition-colors duration-200 ${errors.state ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select state" className="text-gray-600 dark:text-gray-400" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-gray-600">
                                        {INDIAN_STATES.map((state) => (
                                            <SelectItem key={state} value={state} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700">
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                            </div>

                            <div ref={(el) => (errorRefs.current['pincode'] = el)}>
                                <Label htmlFor="pincode" className="text-gray-900 dark:text-white mb-2 block">Pincode *</Label>
                                <Input
                                    id="pincode"
                                    type="text"
                                    {...register('pincode')}
                                    className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-colors duration-200 ${errors.pincode ? 'border-red-500' : ''}`}
                                    placeholder="Enter pincode"
                                />
                                {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>}
                            </div>
                        </div>

                        {/* Service Type */}
                        <div ref={(el) => (errorRefs.current['serviceType'] = el)}>
                            <Label htmlFor="serviceType" className="text-gray-900 dark:text-white mb-2 block">Service *</Label>
                            <Select
                                value={watch('serviceType')}
                                onValueChange={(value) => {
                                    setValue('serviceType', value);
                                    trigger('serviceType');
                                }}
                            >
                                <SelectTrigger className={`bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 transition-colors duration-200 ${errors.serviceType ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select service type" className="text-gray-600 dark:text-gray-400" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                                    {Object.entries(serviceCategories).map(([category, services]) => (
                                        <div key={category}>
                                            <div className="px-2 py-1.5 text-[10px] font-bold opacity-50 text-gray-900 dark:text-white uppercase tracking-wider">
                                                {category}
                                            </div>
                                            {services.map((service) => (
                                                <SelectItem key={service.value} value={service.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 pl-4">
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{service.icon}</span>
                                                        {service.value}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white py-3 transition-colors duration-200"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Application Submitted!
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center">
                        <p className="text-gray-700 dark:text-gray-300">
                            Thank you for your application. We will contact you soon.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
