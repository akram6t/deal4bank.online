"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Mail, 
  Trash2, 
  Star, 
  Search, 
  Inbox, 
  Send, 
  AlertCircle, 
  RotateCcw,
  Archive,
  MoreVertical,
  Reply,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { refineEmailTone } from '@/ai/flows/refine-email-tone-flow';
import { summarizeLongEmail } from '@/ai/flows/summarize-long-email-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { sendEmailAction } from '@/app/actions/email-actions';
import { cn } from "@/lib/utils";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: 'inbox' | 'sent' | 'trash' | 'spam';
  read: boolean;
  starred: boolean;
  createdAt: any;
}

export default function EmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'trash' | 'spam'>('inbox');
  const [search, setSearch] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [refining, setRefining] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'emails'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emailList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Email[];
      setEmails(emailList);
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && change.doc.data().status === 'inbox') {
          playNotificationSound();
        }
      });
    });
    return () => unsubscribe();
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio blocked by browser'));
  };

  const filteredEmails = emails.filter(e => 
    e.status === activeTab && 
    (e.subject.toLowerCase().includes(search.toLowerCase()) || 
     e.from.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStar = async (id: string, starred: boolean) => {
    await updateDoc(doc(db, 'emails', id), { starred: !starred });
  };

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'emails', id), { read: true });
  };

  const moveToTrash = async (id: string) => {
    await updateDoc(doc(db, 'emails', id), { status: 'trash' });
    if (selectedEmail?.id === id) setSelectedEmail(null);
    toast({ title: "Moved to trash" });
  };

  const handleSummarize = async () => {
    if (!selectedEmail) return;
    setSummarizing(true);
    try {
      const result = await summarizeLongEmail({ emailContent: selectedEmail.body });
      setSummary(result.summary);
    } catch (err) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to summarize.' });
    } finally {
      setSummarizing(false);
    }
  };

  const handleRefineTone = async () => {
    if (!replyBody) return;
    setRefining(true);
    try {
      const result = await refineEmailTone({ 
        emailContent: replyBody, 
        desiredTone: 'professional and persuasive' 
      });
      setReplyBody(result.refinedContent);
    } catch (err) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to refine tone.' });
    } finally {
      setRefining(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyBody) return;
    
    setSendingEmail(true);
    try {
      // 1. Send via Resend
      await sendEmailAction({
        to: selectedEmail.from,
        subject: `Re: ${selectedEmail.subject}`,
        text: replyBody
      });

      // 2. Log in Firestore
      await addDoc(collection(db, 'emails'), {
        from: 'admin@deal4bank.com',
        to: selectedEmail.from,
        subject: `Re: ${selectedEmail.subject}`,
        body: replyBody,
        status: 'sent',
        read: true,
        starred: false,
        createdAt: serverTimestamp()
      });

      setReplyOpen(false);
      setReplyBody('');
      toast({ title: "Reply Sent", description: "The email has been delivered via Resend." });
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: "Send Failed", 
        description: err.message || "Failed to deliver email. Check Resend config." 
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Inquiries</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {emails.filter(e => e.status === 'inbox' && !e.read).length} Unread
          </Badge>
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            <Mail className="mr-2 h-4 w-4" /> Compose
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-card rounded-xl border shadow-sm">
        {/* Left Nav */}
        <div className="w-64 border-r bg-muted/30 p-4 space-y-2">
          <Button 
            variant={activeTab === 'inbox' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('inbox')}
          >
            <Inbox className="mr-2 h-4 w-4" /> Inbox
          </Button>
          <Button 
            variant={activeTab === 'sent' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('sent')}
          >
            <Send className="mr-2 h-4 w-4" /> Sent
          </Button>
          <Button 
            variant={activeTab === 'spam' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('spam')}
          >
            <AlertCircle className="mr-2 h-4 w-4" /> Spam
          </Button>
          <Button 
            variant={activeTab === 'trash' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('trash')}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Trash
          </Button>
        </div>

        {/* Email List */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search mail..." 
                className="pl-9 bg-muted/50 border-none" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon"><RotateCcw className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredEmails.map((email) => (
              <div 
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  markRead(email.id);
                  setSummary(null);
                }}
                className={cn(
                  "p-4 border-b cursor-pointer transition-colors flex items-start gap-4 hover:bg-muted/50",
                  selectedEmail?.id === email.id ? "bg-primary/5" : "",
                  !email.read ? "bg-primary/10 font-bold" : ""
                )}
              >
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id, email.starred);
                  }}
                  className="mt-1"
                >
                  <Star className={cn("h-4 w-4", email.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm truncate max-w-[150px]">{email.from}</span>
                    <span className="text-xs text-muted-foreground">
                      {email.createdAt?.seconds ? format(new Date(email.createdAt.seconds * 1000), 'MMM d, p') : 'Just now'}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium truncate">{email.subject}</h4>
                  <p className="text-xs text-muted-foreground truncate">{email.body.substring(0, 100)}...</p>
                </div>
              </div>
            ))}
            {filteredEmails.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No emails found in {activeTab}.</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Preview Panel */}
        {selectedEmail && (
          <div className="w-[500px] border-l flex flex-col bg-card animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => moveToTrash(selectedEmail.id)}><Trash2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Mail className="h-4 w-4" /></Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}><Minimize2 className="h-4 w-4" /></Button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-bold">{selectedEmail.subject}</h2>
                <Badge variant="secondary">{selectedEmail.status}</Badge>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {selectedEmail.from.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{selectedEmail.from}</div>
                  <div className="text-xs text-muted-foreground">to {selectedEmail.to}</div>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {selectedEmail.createdAt?.seconds ? format(new Date(selectedEmail.createdAt.seconds * 1000), 'PPPP p') : ''}
                </div>
              </div>

              {/* AI Summary Block */}
              {selectedEmail.body.length > 300 && (
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center text-primary">
                      <Sparkles className="h-3 w-3 mr-1" /> AI Assistant
                    </span>
                    {!summary && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleSummarize} disabled={summarizing}>
                        {summarizing ? 'Summarizing...' : 'Summarize email'}
                      </Button>
                    )}
                  </div>
                  {summary ? (
                    <div className="text-sm italic text-muted-foreground animate-in fade-in">
                      {summary}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">This email is quite long. Would you like a quick summary?</p>
                  )}
                </div>
              )}

              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedEmail.body}
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex gap-2">
              <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1"><Reply className="mr-2 h-4 w-4" /> Reply</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Reply to {selectedEmail.from}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Write your response..." 
                        className="min-h-[200px]"
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        disabled={sendingEmail}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefineTone} 
                        disabled={refining || !replyBody || sendingEmail}
                        className="text-primary border-primary/20"
                      >
                        <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Refine Tone'}
                      </Button>
                      <span className="text-xs text-muted-foreground italic">AI can help you sound more professional</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReplyOpen(false)} disabled={sendingEmail}>Cancel</Button>
                    <Button onClick={handleSendReply} disabled={sendingEmail || !replyBody}>
                      {sendingEmail ? 'Sending...' : 'Send Response'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="flex-1">Forward</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
