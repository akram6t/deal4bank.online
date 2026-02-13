
"use client"

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Save, 
  Database,
  Mail,
  Lock,
  Eye,
  Settings2
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState({
    siteName: 'Deal4Bank',
    siteDescription: 'Premium Banking & Financial Services Portal',
    maintenanceMode: false,
    allowNewRegistrations: true,
    emailNotifications: true,
    autoApproveReviews: false,
    securityLevel: 'standard',
    contactEmail: 'support@deal4bank.com',
    analyticsId: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          setConfig(snap.data() as any);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), config);
      toast({ title: "Settings Updated", description: "Global configuration has been successfully saved." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Save Failed", description: "Failed to persist settings to Firestore." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your portal's behavior and environment.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="shadow-lg">
          <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-8">
          <TabsTrigger value="general" className="gap-2 px-6"><Globe className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-6"><ShieldCheck className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 px-6"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="api" className="gap-2 px-6"><Database className="h-4 w-4" /> API & Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Identity</CardTitle>
              <CardDescription>Primary site branding and SEO basics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Title</Label>
                  <Input 
                    id="siteName" 
                    value={config.siteName} 
                    onChange={e => setConfig(p => ({...p, siteName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Support Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={config.contactEmail} 
                    onChange={e => setConfig(p => ({...p, contactEmail: e.target.value}))}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="siteDesc">Site Description (SEO)</Label>
                  <Input 
                    id="siteDesc" 
                    value={config.siteDescription} 
                    onChange={e => setConfig(p => ({...p, siteDescription: e.target.value}))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Settings2 className="h-5 w-5" /> Maintenance Mode
              </CardTitle>
              <CardDescription>Take the portal offline for maintenance. Only admins can access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="space-y-1">
                  <p className="font-semibold">Enable Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Redirects all public traffic to a holding page.</p>
                </div>
                <Switch 
                  checked={config.maintenanceMode} 
                  onCheckedChange={val => setConfig(p => ({...p, maintenanceMode: val}))} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage how users interact with sensitive features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow New User Sign-ups</Label>
                  <p className="text-xs text-muted-foreground">Toggle if public registration is open.</p>
                </div>
                <Switch 
                  checked={config.allowNewRegistrations} 
                  onCheckedChange={val => setConfig(p => ({...p, allowNewRegistrations: val}))} 
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base">Enforce HTTPS Redirects</Label>
                  <p className="text-xs text-muted-foreground">Force all traffic through secure SSL connections.</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Credentials</CardTitle>
              <CardDescription>Current administrative session details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                 <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Lock className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-sm font-bold">Two-Factor Authentication</p>
                   <p className="text-xs text-muted-foreground">Add an extra layer of security to admin login.</p>
                 </div>
                 <Button variant="outline" size="sm" className="ml-auto">Configure</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Email Alerts</CardTitle>
              <CardDescription>System events that trigger administrative emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'New Inquiry Notifications', desc: 'Alert when a customer submits a contact form.' },
                { label: 'Login Alerts', desc: 'Notify when a new admin login occurs.' },
                { label: 'System Health Alerts', desc: 'Weekly summary of site activity and performance.' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>External Services</CardTitle>
              <CardDescription>Manage connections to 3rd party providers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 border rounded-xl flex items-center gap-4">
                  <div className="bg-orange-500/10 p-3 rounded-lg"><Mail className="h-6 w-6 text-orange-500" /></div>
                  <div className="flex-1">
                    <p className="font-bold">Resend Email API</p>
                    <p className="text-xs text-muted-foreground">Connected & Healthy</p>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="p-4 border rounded-xl flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg"><Eye className="h-6 w-6 text-blue-500" /></div>
                  <div className="flex-1">
                    <p className="font-bold">Google Analytics</p>
                    <Input 
                      className="mt-2 h-8 text-xs font-mono" 
                      placeholder="G-XXXXXXXXXX" 
                      value={config.analyticsId}
                      onChange={e => setConfig(p => ({...p, analyticsId: e.target.value}))}
                    />
                  </div>
                  <Button variant="ghost" size="sm">Verify</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
