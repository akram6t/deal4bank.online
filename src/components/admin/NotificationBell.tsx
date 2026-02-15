
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'NEW_EMAIL' | 'NEW_INQUIRY';
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Explicitly limit the Firestore query to the top 20 notifications
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(list);
      // Calculate unread count from the latest 20 items
      setUnreadCount(list.filter(n => !n.read).length);
    }, (error) => {
      console.warn("Firestore notification listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_EMAIL': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'NEW_INQUIRY': return <MessageSquare className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-bold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-primary hover:bg-transparent"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground opacity-50">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id}
                  className={cn(
                    "flex gap-3 p-4 border-b hover:bg-muted/50 transition-colors relative cursor-pointer",
                    !n.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="mt-1 bg-muted rounded-full p-2 h-fit">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={cn("text-xs font-bold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60">
                      {n.createdAt?.seconds ? format(new Date(n.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Now'}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" className="w-full h-8 text-xs font-medium text-muted-foreground">
            View recent activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
