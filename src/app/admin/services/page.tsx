
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  LayoutGrid,
  CreditCard,
  Shield,
  Briefcase,
  Home,
  ArrowUp,
  ArrowDown,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";

interface ServiceTab {
  id: string;
  name: string;
  icon: string;
  order: number;
  visible: boolean;
}

interface ServiceItem {
  id: string;
  tabId: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
  ctaText?: string;
}

const ICON_OPTIONS = [
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Shield', icon: Shield },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Home', icon: Home },
  { name: 'LayoutGrid', icon: LayoutGrid },
];

export default function ServicesPage() {
  const [tabs, setTabs] = useState<ServiceTab[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  
  // Modals state
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<Partial<ServiceTab> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const qTabs = query(collection(db, 'services/tabs/list'), orderBy('order', 'asc'));
    const unsubTabs = onSnapshot(qTabs, (snapshot) => {
      const tabList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceTab[];
      setTabs(tabList);
      if (tabList.length > 0 && !activeTab) setActiveTab(tabList[0].id);
    });

    return () => unsubTabs();
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab) return;
    const qItems = query(collection(db, `services/tabs/list/${activeTab}/items`), orderBy('order', 'asc'));
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceItem[];
      setItems(itemList);
    });
    return () => unsubItems();
  }, [activeTab]);

  const handleToggleTabVisibility = async (tab: ServiceTab) => {
    await updateDoc(doc(db, 'services/tabs/list', tab.id), { visible: !tab.visible });
    toast({ title: `Tab ${tab.visible ? 'hidden' : 'visible'}` });
  };

  const handleToggleItemVisibility = async (item: ServiceItem) => {
    await updateDoc(doc(db, `services/tabs/list/${activeTab}/items`, item.id), { visible: !item.visible });
    toast({ title: `Item ${item.visible ? 'hidden' : 'visible'}` });
  };

  // Tab CRUD
  const openTabModal = (tab?: ServiceTab) => {
    setEditingTab(tab || { name: '', icon: 'LayoutGrid', order: tabs.length, visible: true });
    setTabModalOpen(true);
  };

  const saveTab = async () => {
    if (!editingTab?.name) return;
    setLoading(true);
    try {
      if (editingTab.id) {
        await updateDoc(doc(db, 'services/tabs/list', editingTab.id), editingTab);
        toast({ title: "Tab updated" });
      } else {
        await addDoc(collection(db, 'services/tabs/list'), editingTab);
        toast({ title: "Tab created" });
      }
      setTabModalOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: "Error saving tab" });
    } finally {
      setLoading(false);
    }
  };

  const deleteTab = async (id: string) => {
    if (!confirm("Are you sure? This will delete the category and items cannot be accessed easily.")) return;
    await deleteDoc(doc(db, 'services/tabs/list', id));
    if (activeTab === id) setActiveTab(tabs[0]?.id || '');
    toast({ title: "Tab deleted" });
  };

  // Item CRUD
  const openItemModal = (item?: ServiceItem) => {
    setEditingItem(item || { 
      title: '', 
      description: '', 
      order: items.length, 
      visible: true, 
      tabId: activeTab,
      ctaText: 'Learn More'
    });
    setItemModalOpen(true);
  };

  const saveItem = async () => {
    if (!editingItem?.title || !activeTab) return;
    setLoading(true);
    try {
      if (editingItem.id) {
        await updateDoc(doc(db, `services/tabs/list/${activeTab}/items`, editingItem.id), editingItem);
        toast({ title: "Item updated" });
      } else {
        await addDoc(collection(db, `services/tabs/list/${activeTab}/items`), editingItem);
        toast({ title: "Item created" });
      }
      setItemModalOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: "Error saving item" });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this service item?")) return;
    await deleteDoc(doc(db, `services/tabs/list/${activeTab}/items`, id));
    toast({ title: "Item deleted" });
  };

  const getIconComponent = (name: string) => {
    const option = ICON_OPTIONS.find(o => o.name === name);
    return option ? option.icon : LayoutGrid;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline font-bold">Services Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage dynamic service categories and detailed offerings for your customers.</p>
        </div>
        <Button onClick={() => openTabModal()} className="shadow-lg"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
              {tabs.map((tab) => {
                const Icon = getIconComponent(tab.name === 'Investment' ? 'Briefcase' : (tab.name === 'Insurance' ? 'Shield' : (tab.name === 'Loans' ? 'CreditCard' : (tab.name === 'Property' ? 'Home' : tab.icon))));
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:shadow-md transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                    {!tab.visible && <EyeOff className="h-3 w-3 text-destructive ml-1" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {activeTab && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openTabModal(tabs.find(t => t.id === activeTab))}>
                  <Settings2 className="mr-2 h-4 w-4" /> Category Settings
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteTab(activeTab)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-0">
              <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-dashed border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {(() => {
                        const Icon = getIconComponent(tab.icon);
                        return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-headline font-semibold text-lg">{tab.name}</h3>
                    <p className="text-xs text-muted-foreground">Category Items ({items.length})</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => openItemModal()}><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Card key={item.id} className={cn(
                    "relative group flex flex-col h-full hover:border-primary/50 transition-all hover:shadow-lg", 
                    !item.visible && "opacity-60 grayscale-[0.5]"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl leading-tight font-headline">{item.title}</CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleItemVisibility(item)}>
                            {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3 text-sm min-h-[4.5rem]">{item.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto pt-0">
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={() => openItemModal(item)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {items.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <LayoutGrid className="h-8 w-8 text-muted-foreground opacity-30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">No services found in this category.</p>
                      <p className="text-xs text-muted-foreground">Start by adding your first service item.</p>
                    </div>
                    <Button variant="secondary" onClick={() => openItemModal()}>Add First Service</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Tab Modal */}
      <Dialog open={tabModalOpen} onOpenChange={setTabModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTab?.id ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogDescription>Configure how this category appears in the main navigation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tab-name">Name</Label>
              <Input 
                id="tab-name" 
                value={editingTab?.name || ''} 
                onChange={(e) => setEditingTab(prev => ({ ...prev!, name: e.target.value }))}
                placeholder="e.g. Mortgages, Savings..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tab-icon">Icon</Label>
              <Select 
                value={editingTab?.icon || 'LayoutGrid'} 
                onValueChange={(val) => setEditingTab(prev => ({ ...prev!, icon: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(opt => (
                    <SelectItem key={opt.name} value={opt.name}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        <span>{opt.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label>Visibility</Label>
                <p className="text-[10px] text-muted-foreground">Toggle visibility on the website</p>
              </div>
              <Switch 
                checked={editingTab?.visible || false} 
                onCheckedChange={(val) => setEditingTab(prev => ({ ...prev!, visible: val }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTabModalOpen(false)}>Cancel</Button>
            <Button onClick={saveTab} disabled={loading || !editingTab?.name}>
              {loading ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>Fill in the details for this specific service offering.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-title">Service Title</Label>
              <Input 
                id="item-title" 
                value={editingItem?.title || ''} 
                onChange={(e) => setEditingItem(prev => ({ ...prev!, title: e.target.value }))}
                placeholder="e.g. First-Time Buyer Loan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-desc">Description</Label>
              <Textarea 
                id="item-desc" 
                className="min-h-[120px]"
                value={editingItem?.description || ''} 
                onChange={(e) => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
                placeholder="Describe the service, its benefits, and key features..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="item-cta">Button Text</Label>
                <Input 
                  id="item-cta" 
                  value={editingItem?.ctaText || 'Learn More'} 
                  onChange={(e) => setEditingItem(prev => ({ ...prev!, ctaText: e.target.value }))}
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="item-order">Display Order</Label>
                <Input 
                  id="item-order" 
                  type="number"
                  value={editingItem?.order ?? 0} 
                  onChange={(e) => setEditingItem(prev => ({ ...prev!, order: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
              <div className="space-y-0.5">
                <Label>Service Visibility</Label>
                <p className="text-xs text-muted-foreground">Make this service visible to the public</p>
              </div>
              <Switch 
                checked={editingItem?.visible || false} 
                onCheckedChange={(val) => setEditingItem(prev => ({ ...prev!, visible: val }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemModalOpen(false)}>Cancel</Button>
            <Button onClick={saveItem} disabled={loading || !editingItem?.title}>
              {loading ? 'Saving...' : 'Save Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
