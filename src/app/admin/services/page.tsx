
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plus, 
  GripVertical, 
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
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

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
}

export default function ServicesPage() {
  const [tabs, setTabs] = useState<ServiceTab[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [editingTab, setEditingTab] = useState<ServiceTab | null>(null);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
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

  const handleAddTab = async () => {
    const newTab = {
      name: 'New Tab',
      icon: 'Briefcase',
      order: tabs.length,
      visible: true
    };
    await addDoc(collection(db, 'services/tabs/list'), newTab);
    toast({ title: "Tab added" });
  };

  const handleAddItem = async () => {
    if (!activeTab) return;
    const newItem = {
      title: 'New Service Item',
      description: 'Short description for the service.',
      order: items.length,
      visible: true,
      tabId: activeTab
    };
    await addDoc(collection(db, `services/tabs/list/${activeTab}/items`), newItem);
    toast({ title: "Item added" });
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteDoc(doc(db, `services/tabs/list/${activeTab}/items`, itemId));
    toast({ title: "Item deleted" });
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Loans': return CreditCard;
      case 'Insurance': return Shield;
      case 'Investment': return Briefcase;
      case 'Property': return Home;
      default: return LayoutGrid;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Services Management</h1>
          <p className="text-muted-foreground mt-1">Manage dynamic service categories and items.</p>
        </div>
        <Button onClick={handleAddTab}><Plus className="mr-2 h-4 w-4" /> Add Tab</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center gap-4 mb-6">
              <TabsList className="bg-muted p-1">
                {tabs.map((tab) => {
                  const Icon = getIcon(tab.name);
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.name}
                      {!tab.visible && <EyeOff className="h-3 w-3 text-destructive" />}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-headline font-semibold">{tab.name} Content</h3>
                    <Switch checked={tab.visible} onCheckedChange={() => handleToggleTabVisibility(tab)} />
                    <span className="text-sm text-muted-foreground">{tab.visible ? 'Publicly Visible' : 'Hidden'}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className={cn("relative group transition-all", !item.visible && "opacity-60")}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleItemVisibility(item)}>
                              {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button variant="secondary" size="sm" className="w-full mt-4">Edit Details</Button>
                      </CardContent>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-muted/20 rounded-lg border-2 border-dashed">
                      <p className="text-muted-foreground">No items in this category yet.</p>
                      <Button variant="link" onClick={handleAddItem}>Add your first item</Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
