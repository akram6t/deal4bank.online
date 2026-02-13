
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
  LayoutGrid,
  CreditCard,
  Shield,
  Briefcase,
  Home,
  Settings2,
  User,
  Car,
  Building,
  Landmark,
  X,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
      attributes: [...(prev?.attributes || []), { label: 'New Key', value: 'Value' }]
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
      newAttrs[index][field] = val;
      return { ...prev!, attributes: newAttrs };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-foreground">OUR SERVICES AND RATES:-</h1>
        <Button onClick={() => { setEditingTab({ name: '', icon: 'Landmark' }); setTabModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = getIcon(tab.icon, CATEGORY_ICONS);
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white bg-muted/40 border-2 border-transparent px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {activeTab && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setEditingTab(tabs.find(t => t.id === activeTab)); setTabModalOpen(true); }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDoc(doc(db, 'services_tabs', activeTab))}>
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
                  <Card key={item.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl">
                          <ItemIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{item.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-2 text-sm text-zinc-400 mt-1">
                            {item.attributes.map((attr, idx) => (
                              <div key={idx} className="flex items-center">
                                {idx > 0 && <span className="mx-2 text-zinc-600">|</span>}
                                {attr.label}: <span className="text-primary font-semibold ml-1">{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setItemModalOpen(true); }}>
                          <Edit className="h-4 w-4 text-zinc-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive" onClick={() => deleteDoc(doc(db, `services_tabs/${activeTab}/items`, item.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <Button 
                variant="outline" 
                className="w-full h-24 border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300"
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                className="bg-zinc-800 border-zinc-700"
                value={editingTab?.name || ''} 
                onChange={e => setEditingTab(p => ({...p!, name: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={editingTab?.icon} onValueChange={v => setEditingTab(p => ({...p!, icon: v}))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
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
            <Button variant="outline" onClick={() => setTabModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTab} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Item Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Title</Label>
                <Input 
                  className="bg-zinc-800 border-zinc-700"
                  value={editingItem?.title || ''} 
                  onChange={e => setEditingItem(p => ({...p!, title: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Service Icon</Label>
                <Select value={editingItem?.iconName} onValueChange={v => setEditingItem(p => ({...p!, iconName: v}))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
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
                <Label className="text-zinc-400">Custom Attributes (Interest, Tenure, etc.)</Label>
                <Button variant="ghost" size="sm" onClick={addAttribute} className="h-8 text-primary">
                  <Plus className="mr-1 h-3 w-3" /> Add Row
                </Button>
              </div>
              <div className="space-y-2">
                {editingItem?.attributes?.map((attr, idx) => (
                  <div key={idx} className="flex gap-2 items-center group/row">
                    <Input 
                      placeholder="Label (e.g. Interest)"
                      className="bg-zinc-800 border-zinc-700 flex-1"
                      value={attr.label}
                      onChange={e => updateAttribute(idx, 'label', e.target.value)}
                    />
                    <Input 
                      placeholder="Value (e.g. 10.5%)"
                      className="bg-zinc-800 border-zinc-700 flex-1"
                      value={attr.value}
                      onChange={e => updateAttribute(idx, 'value', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeAttribute(idx)} className="text-destructive opacity-0 group-hover/row:opacity-100">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={loading}>{loading ? 'Saving...' : 'Save Service'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
