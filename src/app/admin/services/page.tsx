
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
  X,
  Settings2
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
  attributeKeys: string[]; // Predefined keys for this category
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
  const [activeTabId, setActiveTabId] = useState<string>('');
  
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<Partial<ServiceTab> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const qTabs = query(collection(db, 'services_tabs'), orderBy('order', 'asc'));
    const unsubTabs = onSnapshot(qTabs, (snapshot) => {
      const tabList = snapshot.docs.map(doc => ({ id: doc.id, attributeKeys: [], ...doc.data() })) as ServiceTab[];
      setTabs(tabList);
      if (tabList.length > 0 && !activeTabId) setActiveTabId(tabList[0].id);
    });
    return () => unsubTabs();
  }, [activeTabId]);

  useEffect(() => {
    if (!activeTabId) return;
    const qItems = query(collection(db, `services_tabs/${activeTabId}/items`), orderBy('order', 'asc'));
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceItem[];
      setItems(itemList);
    });
    return () => unsubItems();
  }, [activeTabId]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const getIcon = (name: string, list: {name: string, icon: any}[]) => {
    const found = list.find(i => i.name === name);
    return found ? found.icon : LayoutGrid;
  };

  const handleSaveTab = async () => {
    if (!editingTab?.name) return;
    setLoading(true);
    try {
      const data = {
        name: editingTab.name,
        icon: editingTab.icon || 'Landmark',
        attributeKeys: editingTab.attributeKeys || [],
        order: editingTab.order ?? tabs.length,
        visible: editingTab.visible ?? true
      };

      if (editingTab.id) {
        await updateDoc(doc(db, 'services_tabs', editingTab.id), data);
      } else {
        await addDoc(collection(db, 'services_tabs'), data);
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
    if (!editingItem?.title || !activeTabId) return;
    setLoading(true);
    try {
      const data = {
        title: editingItem.title,
        iconName: editingItem.iconName || 'User',
        attributes: editingItem.attributes || [],
        order: editingItem.order ?? items.length,
        visible: editingItem.visible ?? true,
        tabId: activeTabId
      };

      if (editingItem.id) {
        await updateDoc(doc(db, `services_tabs/${activeTabId}/items`, editingItem.id), data);
      } else {
        await addDoc(collection(db, `services_tabs/${activeTabId}/items`), data);
      }
      setItemModalOpen(false);
      toast({ title: "Service item saved" });
    } catch (err) {
      toast({ variant: 'destructive', title: "Error saving item" });
    } finally {
      setLoading(false);
    }
  };

  // Tab Key Management
  const addTabKey = () => {
    setEditingTab(prev => ({
      ...prev!,
      attributeKeys: [...(prev?.attributeKeys || []), '']
    }));
  };

  const removeTabKey = (index: number) => {
    setEditingTab(prev => ({
      ...prev!,
      attributeKeys: prev?.attributeKeys?.filter((_, i) => i !== index)
    }));
  };

  const updateTabKey = (index: number, val: string) => {
    setEditingTab(prev => {
      const newKeys = [...(prev?.attributeKeys || [])];
      newKeys[index] = val;
      return { ...prev!, attributeKeys: newKeys };
    });
  };

  // Item Attribute Management (based on active tab keys)
  const updateItemAttributeValue = (label: string, value: string) => {
    setEditingItem(prev => {
      const currentAttrs = prev?.attributes || [];
      const index = currentAttrs.findIndex(a => a.label === label);
      const newAttrs = [...currentAttrs];
      
      if (index > -1) {
        newAttrs[index] = { ...newAttrs[index], value };
      } else {
        newAttrs.push({ label, value });
      }
      
      return { ...prev!, attributes: newAttrs };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Services Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Define category fields and manage bank products.</p>
        </div>
        <Button onClick={() => { setEditingTab({ name: '', icon: 'Landmark', attributeKeys: ['Interest', 'Tenure', 'Amount'] }); setTabModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
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
          
          {activeTabId && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingTab(activeTab); setTabModalOpen(true); }}>
                <Settings2 className="h-4 w-4 mr-2" /> Configure Category
              </Button>
              <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteDoc(doc(db, 'services_tabs', activeTabId))}>
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
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm mt-3">
                            {tab.attributeKeys.map((key, idx) => {
                              const attr = item.attributes.find(a => a.label === key);
                              return (
                                <div key={idx} className="flex items-center bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                                  <span className="text-muted-foreground font-medium text-xs mr-2 uppercase tracking-wider">{key}:</span>
                                  <span className="text-foreground font-bold">{attr?.value || '—'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setItemModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteDoc(doc(db, `services_tabs/${activeTabId}/items`, item.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <Button 
                variant="outline" 
                className="w-full h-32 border-dashed border-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-xl"
                onClick={() => { 
                  setEditingItem({ 
                    title: '', 
                    iconName: 'User', 
                    attributes: tab.attributeKeys.map(k => ({ label: k, value: '' })) 
                  }); 
                  setItemModalOpen(true); 
                }}
              >
                <div className="flex flex-col items-center gap-2">
                   <div className="p-3 bg-muted rounded-full"><Plus className="h-6 w-6" /></div>
                   <span className="font-semibold">Add New {tab.name} Product</span>
                </div>
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tab Modal: Define Category Schema */}
      <Dialog open={tabModalOpen} onOpenChange={setTabModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTab?.id ? 'Configure Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input 
                  placeholder="e.g. Home Loans"
                  value={editingTab?.name || ''} 
                  onChange={e => setEditingTab(p => ({...p!, name: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category Icon</Label>
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

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Required Fields</Label>
                <Button variant="ghost" size="sm" onClick={addTabKey} className="h-7 text-[10px] bg-primary/5 text-primary">
                  <Plus className="mr-1 h-3 w-3" /> Add Field
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">Define keys like "Interest" or "Tenure" that every item in this category will display.</p>
              
              <div className="space-y-2">
                {editingTab?.attributeKeys?.map((key, idx) => (
                  <div key={idx} className="flex gap-2 items-center group/key">
                    <Input 
                      placeholder="e.g. Processing Fee"
                      className="flex-1 h-9 text-sm"
                      value={key}
                      onChange={e => updateTabKey(idx, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeTabKey(idx)} className="h-9 w-9 text-destructive opacity-40 hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {editingTab?.attributeKeys?.length === 0 && (
                   <p className="text-center text-xs italic text-muted-foreground py-4 border rounded-lg">No fields defined. Add some fields like 'Rate' or 'Limit'.</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTabModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTab} disabled={loading}>{loading ? 'Saving...' : 'Save Category'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Modal: Fill in Values */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit Service Details' : 'New Service Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Title</Label>
                <Input 
                  placeholder="e.g. Premium Savings Account"
                  value={editingItem?.title || ''} 
                  onChange={e => setEditingItem(p => ({...p!, title: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Icon</Label>
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

            <div className="space-y-4 pt-4 border-t">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Specifications ({activeTab?.name})</Label>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {activeTab?.attributeKeys.map((key, idx) => {
                  const currentVal = editingItem?.attributes?.find(a => a.label === key)?.value || '';
                  return (
                    <div key={idx} className="space-y-2">
                      <Label className="text-sm font-medium">{key}</Label>
                      <Input 
                        placeholder={`Enter ${key}...`}
                        value={currentVal}
                        onChange={e => updateItemAttributeValue(key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
              {activeTab?.attributeKeys.length === 0 && (
                <p className="text-xs text-center py-6 text-muted-foreground bg-muted/20 rounded-xl">
                  No specifications defined for this category. Edit the category to add fields.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
