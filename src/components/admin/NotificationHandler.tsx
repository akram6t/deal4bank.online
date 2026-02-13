"use client"

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { BellRing } from 'lucide-react';

export function NotificationHandler() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Request Browser Notification Permission
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().catch(() => {});
      }
    }

    // Listen for new notifications in Firestore
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const q = query(
      collection(db, 'notifications'),
      where('createdAt', '>', Timestamp.fromDate(oneMinuteAgo)),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          
          // Show Toast
          toast({
            title: data.title || "New Notification",
            description: data.message,
            action: (
              <div className="bg-primary/10 p-2 rounded-full">
                <BellRing className="h-4 w-4 text-primary" />
              </div>
            ),
          });

          // Browser Notification
          if (typeof window !== 'undefined' && Notification.permission === "granted") {
            try {
              new Notification(data.title, {
                body: data.message,
              });
              
              // Play Sound with safety check
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
              audio.play().catch(e => console.log("Audio play blocked or unreachable"));
            } catch (err) {
              console.warn("Notification display failed", err);
            }
          }
        }
      });
    }, (error) => {
      console.warn("Firestore notification listener error:", error);
    });

    return () => unsubscribe();
  }, [toast]);

  if (!mounted) return null;
  return null;
}
