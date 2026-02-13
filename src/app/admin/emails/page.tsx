
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
  Minimize2,
  Sparkles,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { refineEmailTone } from '@/ai/flows/refine-email-tone-flow';
import { summarizeLongEmail } from '@/ai/flows/summarize-long-email-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  
  // AI States
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [refining, setRefining] = useState(false);
  
  // Dialog States
  const [replyOpen, setReplyOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Form States
  const [replyBody, setReplyBody] = useState('');
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'emails'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emailList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Email[];
      setEmails(emailList);
    });
    return () => unsubscribe();
  }, []);

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

  const handleRefineTone = async (text: string, setter: (val: string) => void) => {
    if (!text) return;
    setRefining(true);
    try {
      const result = await refineEmailTone({ 
        emailContent: text, 
        desiredTone: 'professional, empathetic and clear' 
      });
      setter(result.refinedContent);
    } catch (err) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to refine tone.' });
    } finally {
      setRefining(false);
    }
  };

  const handleSend = async (to: string, subject: string, body: string, isReply: boolean = false) => {
    setSendingEmail(true);
    try {
      await sendEmailAction({ to, subject, text: body });
      await addDoc(collection(db, 'emails'), {
        from: 'admin@deal4bank.com',
        to,
        subject,
        body,
        status: 'sent',
        read: true,
        starred: false,
        createdAt: serverTimestamp()
      });

      if (isReply) {
        setReplyOpen(false);
        setReplyBody('');
      } else {
        setComposeOpen(false);
        setComposeData({ to: '', subject: '', body: '' });
      }
      toast({ title: "Email Sent", description: `Message delivered to ${to}` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: "Send Failed", description: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Communications</h1>
          <p className="text-muted-foreground text-sm">Manage customer inquiries and outreach.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
            {emails.filter(e => e.status === 'inbox' && !e.read).length} New Inquiries
          </Badge>
          
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg"><Plus className="mr-2 h-4 w-4" /> New Email</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>To</Label>
                  <Input 
                    placeholder="recipient@example.com" 
                    value={composeData.to}
                    onChange={e => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Input 
                    placeholder="Enter subject..." 
                    value={composeData.subject}
                    onChange={e => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Message</Label>
                  <Textarea 
                    placeholder="Write your message here..." 
                    className="min-h-[200px]"
                    value={composeData.body}
                    onChange={e => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRefineTone(composeData.body, (val) => setComposeData(p => ({...p, body: val})))}
                  disabled={refining || !composeData.body}
                  className="w-fit"
                >
                  <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Optimize with AI'}
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setComposeOpen(false)}>Discard</Button>
                <Button 
                  onClick={() => handleSend(composeData.to, composeData.subject, composeData.body)} 
                  disabled={sendingEmail || !composeData.to || !composeData.body}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-card rounded-xl border shadow-sm">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-muted/20 p-4 flex flex-col">
          <div className="space-y-1">
            <Button 
              variant={activeTab === 'inbox' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start", activeTab === 'inbox' && "bg-primary/10 text-primary")}
              onClick={() => setActiveTab('inbox')}
            >
              <Inbox className="mr-2 h-4 w-4" /> Inbox
              <span className="ml-auto text-[10px] bg-muted px-1.5 rounded-full">
                {emails.filter(e => e.status === 'inbox').length}
              </span>
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
        </div>

        {/* Email List */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b flex items-center gap-4 bg-muted/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9 bg-background border-muted" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-primary/5"><RotateCcw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
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
                  "p-4 border-b cursor-pointer transition-all flex items-start gap-4 hover:bg-muted/30 border-l-2 border-l-transparent",
                  selectedEmail?.id === email.id ? "bg-primary/5 border-l-primary" : "",
                  !email.read ? "bg-muted/20 border-l-primary/40 font-semibold" : "opacity-80"
                )}
              >
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id, email.starred);
                  }}
                  className="mt-1"
                >
                  <Star className={cn("h-4 w-4", email.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-40")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm truncate font-medium text-foreground">{email.from}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {email.createdAt?.seconds ? format(new Date(email.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Recent'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold truncate mb-1">{email.subject}</h4>
                  <p className="text-xs text-muted-foreground truncate">{email.body}</p>
                </div>
              </div>
            ))}
            {filteredEmails.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground opacity-30">
                <Mail className="h-16 w-16 mb-4" />
                <p>No messages in {activeTab}</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Preview Panel */}
        {selectedEmail && (
          <div className="w-[500px] border-l flex flex-col bg-card animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-muted/10">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => moveToTrash(selectedEmail.id)}><Trash2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}><Minimize2 className="h-4 w-4" /></Button>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">{selectedEmail.status}</Badge>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-headline font-bold text-foreground mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">{selectedEmail.from}</div>
                    <div className="text-[10px] text-muted-foreground">to {selectedEmail.to}</div>
                  </div>
                  <div className="ml-auto text-[10px] text-muted-foreground">
                    {selectedEmail.createdAt?.seconds ? format(new Date(selectedEmail.createdAt.seconds * 1000), 'PPPP p') : ''}
                  </div>
                </div>
              </div>

              {selectedEmail.body.length > 200 && (
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" /> AI Insights
                    </span>
                    {!summary && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={handleSummarize} disabled={summarizing}>
                        {summarizing ? 'Analyzing...' : 'Generate Summary'}
                      </Button>
                    )}
                  </div>
                  {summary ? (
                    <div className="text-sm italic text-muted-foreground animate-in fade-in leading-relaxed">
                      "{summary}"
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">Lengthy message detected. Click to summarize.</p>
                  )}
                </div>
              )}

              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 border-t pt-6">
                {selectedEmail.body}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-muted/5 flex gap-2">
              <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 shadow-md"><Reply className="mr-2 h-4 w-4" /> Send Reply</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Reply to {selectedEmail.from}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea 
                      placeholder="Write your response..." 
                      className="min-h-[200px]"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      disabled={sendingEmail}
                    />
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRefineTone(replyBody, setReplyBody)} 
                        disabled={refining || !replyBody || sendingEmail}
                      >
                        <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Refine Tone'}
                      </Button>
                      <span className="text-[10px] text-muted-foreground">AI can help you sound more professional</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReplyOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={() => handleSend(selectedEmail.from, `Re: ${selectedEmail.subject}`, replyBody, true)} 
                      disabled={sendingEmail || !replyBody}
                    >
                      {sendingEmail ? 'Sending...' : 'Send Message'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="flex-1">Forward <ArrowRight className="ml-2 h-3 w-3" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
