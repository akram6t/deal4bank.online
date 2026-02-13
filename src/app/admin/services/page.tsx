
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  LayoutGrid,
  CreditCard,
  Shield,
  Briefcase,
  Home,
  User,
  Car,
  Building,
  Landmark,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";

interface ServiceAttribute {
  label: string;
  value: string;
}

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
  iconName: string;
  attributes: ServiceAttribute[];
}

const CATEGORY_ICONS = [
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Shield', icon: Shield },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Home', icon: Home },
  { name: 'Landmark', icon: Landmark },
];

const ITEM_ICONS = [
  { name: 'User', icon: User },
  { name: 'Home', icon: Home },
  { name: 'Building', icon: Building },
  { name: 'Car', icon: Car },
  { name: 'Landmark', icon: Landmark },
  { name: 'CreditCard', icon: CreditCard },
];

export default function ServicesPage() {
  const [tabs, setTabs] = useState<ServiceTab[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<Partial<ServiceTab> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const qTabs = query(collection(db, 'services_tabs'), orderBy('order', 'asc'));
    const unsubTabs = onSnapshot(qTabs, (snapshot) => {
      const tabList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceTab[];
      setTabs(tabList);
      if (tabList.length > 0 && !activeTab) setActiveTab(tabList[0].id);
    });
    return () => unsubTabs();
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab) return;
    const qItems = query(collection(db, `services_tabs/${activeTab}/items`), orderBy('order', 'asc'));
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceItem[];
      setItems(itemList);
    });
    return () => unsubItems();
  }, [activeTab]);

  const getIcon = (name: string, list: {name: string, icon: any}[]) => {
    const found = list.find(i => i.name === name);
    return found ? found.icon : LayoutGrid;
  };

  const handleSaveTab = async () => {
    if (!editingTab?.name) return;
    setLoading(true);
    try {
      if (editingTab.id) {
        await updateDoc(doc(db, 'services_tabs', editingTab.id), editingTab);
      } else {
        await addDoc(collection(db, 'services_tabs'), { ...editingTab, order: tabs.length, visible: true });
      }
      setTabModalOpen(false);
      toast({ title: "Category saved" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Error saving category" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem?.title || !activeTab) return;
    setLoading(true);
    try {
      if (editingItem.id) {
        await updateDoc(doc(db, `services_tabs/${activeTab}/items`, editingItem.id), editingItem);
      } else {
        await addDoc(collection(db, `services_tabs/${activeTab}/items`), { 
          ...editingItem, 
          order: items.length, 
          visible: true,
          attributes: editingItem.attributes || []
        });
      }
      setItemModalOpen(false);
      toast({ title: "Service item saved" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Error saving item" });
    } finally {
      setLoading(false);
    }
  };

  const addAttribute = () => {
    setEditingItem(prev => ({
      ...prev!,
      attributes: [...(prev?.attributes || []), { label: '', value: '' }]
    }));
  };

  const removeAttribute = (index: number) => {
    setEditingItem(prev => ({
      ...prev!,
      attributes: prev?.attributes?.filter((_, i) => i !== index)
    }));
  };

  const updateAttribute = (index: number, field: 'label' | 'value', val: string) => {
    setEditingItem(prev => {
      const newAttrs = [...(prev?.attributes || [])];
      newAttrs[index] = { ...newAttrs[index], [field]: val };
      return { ...prev!, attributes: newAttrs };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Services Management</h1>
          <p className="text-muted-foreground mt-1">Configure interest rates, terms, and bank products.</p>
        </div>
        <Button onClick={() => { setEditingTab({ name: '', icon: 'Landmark' }); setTabModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <TabsList className="bg-muted p-1 h-auto flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = getIcon(tab.icon, CATEGORY_ICONS);
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="px-6 py-2.5 flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {activeTab && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingTab(tabs.find(t => t.id === activeTab)); setTabModalOpen(true); }}>
                <Edit className="h-4 w-4 mr-2" /> Edit Category
              </Button>
              <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteDoc(doc(db, 'services_tabs', activeTab))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid gap-4">
              {items.map((item) => {
                const ItemIcon = getIcon(item.iconName, ITEM_ICONS);
                return (
                  <Card key={item.id} className="hover:border-primary/50 transition-colors group">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5 flex-1">
                        <div className="bg-primary/10 p-4 rounded-2xl">
                          <ItemIcon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                            {item.attributes.map((attr, idx) => (
                              <div key={idx} className="flex items-center">
                                <span className="font-medium">{attr.label}:</span>
                                <span className="text-primary font-bold ml-1.5">{attr.value}</span>
                                {idx < item.attributes.length - 1 && <div className="ml-4 h-3 w-px bg-border hidden sm:block" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setItemModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteDoc(doc(db, `services_tabs/${activeTab}/items`, item.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <Button 
                variant="outline" 
                className="w-full h-32 border-dashed border-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => { setEditingItem({ title: '', iconName: 'User', attributes: [] }); setItemModalOpen(true); }}
              >
                <Plus className="mr-2 h-5 w-5" /> Add New Service to {tab.name}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tab Modal */}
      <Dialog open={tabModalOpen} onOpenChange={setTabModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTab?.id ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                placeholder="e.g. Loans"
                value={editingTab?.name || ''} 
                onChange={e => setEditingTab(p => ({...p!, name: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={editingTab?.icon} onValueChange={v => setEditingTab(p => ({...p!, icon: v}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ICONS.map(i => (
                    <SelectItem key={i.name} value={i.name}>
                      <div className="flex items-center gap-2">
                        <i.icon className="h-4 w-4" /> {i.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTabModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTab} disabled={loading}>{loading ? 'Saving...' : 'Save Category'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit Service' : 'New Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Title</Label>
                <Input 
                  placeholder="e.g. Home Loan"
                  value={editingItem?.title || ''} 
                  onChange={e => setEditingItem(p => ({...p!, title: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Service Icon</Label>
                <Select value={editingItem?.iconName} onValueChange={v => setEditingItem(p => ({...p!, iconName: v}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_ICONS.map(i => (
                      <SelectItem key={i.name} value={i.name}>
                        <div className="flex items-center gap-2">
                          <i.icon className="h-4 w-4" /> {i.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Service Details</Label>
                <Button variant="outline" size="sm" onClick={addAttribute} className="h-8">
                  <Plus className="mr-1 h-3 w-3" /> Add Detail
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {editingItem?.attributes?.map((attr, idx) => (
                  <div key={idx} className="flex gap-2 items-center group/row">
                    <Input 
                      placeholder="Label (e.g. Interest)"
                      className="flex-1"
                      value={attr.label}
                      onChange={e => updateAttribute(idx, 'label', e.target.value)}
                    />
                    <Input 
                      placeholder="Value (e.g. 10.5%)"
                      className="flex-1"
                      value={attr.value}
                      onChange={e => updateAttribute(idx, 'value', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeAttribute(idx)} className="text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {editingItem?.attributes?.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                    No details added. Click "Add Detail" to include rates, terms, etc.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={loading}>{loading ? 'Saving...' : 'Save Service'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

