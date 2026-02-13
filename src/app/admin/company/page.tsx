
"use client"

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Building2, Save } from 'lucide-react';

export default function CompanyPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    logoUrl: '',
    copyright: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    async function loadSettings() {
      const snap = await getDoc(doc(db, 'settings', 'company'));
      if (snap.exists()) {
        setFormData(snap.data() as any);
      }
    }
    loadSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const logoRef = ref(storage, `logos/company-logo-${Date.now()}`);
      await uploadBytes(logoRef, file);
      const url = await getDownloadURL(logoRef);
      setFormData(prev => ({ ...prev, logoUrl: url }));
      toast({ title: "Logo uploaded successfully" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'company'), formData);
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Save failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Company Profile</h1>
        <p className="text-muted-foreground mt-1">Configure your organization's core details.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Visual identity and primary naming.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Deal4Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input 
                      id="tagline" 
                      value={formData.tagline}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Your Trusted Financial Partner"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Company Logo</Label>
                  <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-muted/10">
                    {formData.logoUrl ? (
                      <div className="relative group">
                        <img src={formData.logoUrl} alt="Logo" className="max-h-24 object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                           <Label htmlFor="logo-upload" className="cursor-pointer text-white text-xs font-bold px-2 py-1 bg-primary rounded">Change</Label>
                        </div>
                      </div>
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground opacity-20" />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" /> Upload New Logo
                        </Label>
                      </Button>
                      <Input id="logo-upload" type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                      <p className="text-[10px] text-muted-foreground">PNG, SVG or WebP up to 2MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal & Meta</CardTitle>
              <CardDescription>Footers and compliance text.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input 
                  id="copyright" 
                  value={formData.copyright}
                  onChange={(e) => setFormData(prev => ({ ...prev, copyright: e.target.value }))}
                  placeholder="© 2024 Deal4Bank. All rights reserved."
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 px-6 py-4">
               <Button type="submit" disabled={loading} className="w-full md:w-auto">
                 <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : 'Save Changes'}
               </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
