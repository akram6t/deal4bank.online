
"use client"

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Mail, 
  Trash2, 
  Star, 
  Search, 
  Inbox, 
  Send, 
  AlertCircle, 
  Archive,
  MoreVertical,
  Reply,
  Minimize2,
  Sparkles,
  Plus,
  ArrowRight,
  FileText,
  Paperclip,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { refineEmailTone } from '@/ai/flows/refine-email-tone-flow';
import { summarizeLongEmail } from '@/ai/flows/summarize-long-email-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendEmailAction } from '@/app/actions/email-actions';
import ReactMarkdown from 'react-markdown';
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
  attachments?: any[];
  isDummy?: boolean;
}

const DUMMY_EMAILS: Email[] = [
  {
    id: 'dummy-1',
    from: 'firebase-noreply',
    to: 'admin@deal4bank.com',
    subject: '[Firebase] Your project "deal4bank" was upgraded to the pay-as-you-go Blaze pricing plan',
    body: "Hello Team,\n\nYour Firebase project has been successfully upgraded. You can now enjoy the full benefits of our Blaze plan including higher usage limits and additional features.\n\nBest,\nFirebase Team",
    status: 'inbox',
    read: false,
    starred: false,
    createdAt: { seconds: Date.now() / 1000 - 600 },
    isDummy: true
  },
  {
    id: 'dummy-2',
    from: 'Google Cloud Platform',
    to: 'admin@deal4bank.com',
    subject: 'Your Project: deal4bank is at risk of suspension',
    body: "Action required: Please review your billing account 01DB91-2A940E-904299 as it is past due or has invalid payment information. Go to my console to resolve this immediately.",
    status: 'inbox',
    read: false,
    starred: true,
    createdAt: { seconds: Date.now() / 1000 - 3600 },
    isDummy: true
  },
  {
    id: 'dummy-3',
    from: 'Zeabur',
    to: 'admin@deal4bank.com',
    subject: 'Build with Zeabur #1',
    body: "Dear Builder, Past week has marked one of the most exhilarating periods for us at Zeabur. We've launched our new dashboard and improved the deployment speeds by 40%. Check it out!",
    status: 'inbox',
    read: true,
    starred: true,
    createdAt: { seconds: Date.now() / 1000 - 7200 },
    isDummy: true
  },
  {
    id: 'dummy-4',
    from: 'Hostinger',
    to: 'admin@deal4bank.com',
    subject: 'Your authentication code',
    body: "Please use the code 882910 to verify your identity. If you didn't request this, please secure your account immediately.",
    status: 'inbox',
    read: true,
    starred: false,
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    isDummy: true
  }
];

export default function EmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'trash' | 'spam'>('inbox');
  const [search, setSearch] = useState('');
  
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [refining, setRefining] = useState(false);
  
  const [replyOpen, setReplyOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
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
      
      if (emailList.length === 0) {
        setEmails(DUMMY_EMAILS);
      } else {
        setEmails(emailList);
      }
    }, (error) => {
      setEmails(DUMMY_EMAILS);
    });
    return () => unsubscribe();
  }, []);

  const filteredEmails = emails.filter(e => 
    e.status === activeTab && 
    (e.subject.toLowerCase().includes(search.toLowerCase()) || 
     e.from.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStar = async (email: Email) => {
    if (email.isDummy) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, starred: !e.starred } : e));
      return;
    }
    await updateDoc(doc(db, 'emails', email.id), { starred: !email.starred });
  };

  const markRead = async (email: Email) => {
    if (email.read) return;
    if (email.isDummy) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
      return;
    }
    await updateDoc(doc(db, 'emails', email.id), { read: true });
  };

  const moveToTrash = async (email: Email) => {
    if (email.isDummy) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'trash' } : e));
    } else {
      await updateDoc(doc(db, 'emails', email.id), { status: 'trash' });
    }
    if (selectedEmail?.id === email.id) setSelectedEmail(null);
    toast({ title: "Moved to trash" });
  };

  const deletePermanently = async (email: Email) => {
    if (email.isDummy) {
      setEmails(prev => prev.filter(e => e.id !== email.id));
    } else {
      await deleteDoc(doc(db, 'emails', email.id));
    }
    if (selectedEmail?.id === email.id) setSelectedEmail(null);
    toast({ title: "Email deleted permanently" });
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
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Communications</h1>
          <p className="text-muted-foreground text-sm">Manage your inbox and communications efficiently.</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md rounded-full px-6"><Plus className="mr-2 h-4 w-4" /> Compose</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input placeholder="recipient@example.com" value={composeData.to} onChange={e => setComposeData(prev => ({ ...prev, to: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Subject" value={composeData.subject} onChange={e => setComposeData(prev => ({ ...prev, subject: e.target.value }))} />
                </div>
              </div>
              <Tabs defaultValue="edit">
                <TabsList className="grid grid-cols-2 mb-2">
                  <TabsTrigger value="edit">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <Textarea className="min-h-[300px] font-mono" value={composeData.body} onChange={e => setComposeData(prev => ({ ...prev, body: e.target.value }))} />
                </TabsContent>
                <TabsContent value="preview" className="min-h-[300px] p-4 border rounded-md bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{composeData.body || "*No content to preview*"}</ReactMarkdown>
                </TabsContent>
              </Tabs>
              <Button variant="outline" size="sm" onClick={() => handleRefineTone(composeData.body, (v) => setComposeData(p => ({...p, body: v})))} disabled={refining || !composeData.body}>
                <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Refine with AI'}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => handleSend(composeData.to, composeData.subject, composeData.body)} disabled={sendingEmail || !composeData.to}>
                {sendingEmail ? 'Sending...' : 'Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full flex-1 flex flex-col">
        <TabsList className="flex w-full justify-start bg-transparent border-b rounded-none px-0 mb-4 h-12 gap-6">
          <TabsTrigger value="inbox" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 h-full gap-2 transition-all">
            <Inbox className="h-4 w-4" /> Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 h-full gap-2 transition-all">
            <Send className="h-4 w-4" /> Sent
          </TabsTrigger>
          <TabsTrigger value="spam" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 h-full gap-2 transition-all">
            <AlertCircle className="h-4 w-4" /> Spam
          </TabsTrigger>
          <TabsTrigger value="trash" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 h-full gap-2 transition-all">
            <Trash2 className="h-4 w-4" /> Trash
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 overflow-hidden bg-card border rounded-xl shadow-sm">
          {/* Email List Sidebar */}
          <div className="w-[450px] border-r flex flex-col">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search mail" className="pl-9 h-9 border-none bg-muted/40" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredEmails.map((email) => (
                <div 
                  key={email.id}
                  onClick={() => { setSelectedEmail(email); markRead(email); setSummary(null); }}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:shadow-inner transition-colors border-l-4",
                    selectedEmail?.id === email.id ? "bg-primary/10 border-l-primary" : "border-l-transparent",
                    !email.read ? "bg-muted/30" : "opacity-80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div onClick={(e) => { e.stopPropagation(); toggleStar(email); }} className="hover:scale-110 transition-transform">
                      <Star className={cn("h-4 w-4", email.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-30")} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <span className={cn("text-sm truncate", !email.read ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                        {email.from}
                      </span>
                      <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                        {email.createdAt?.seconds ? format(new Date(email.createdAt.seconds * 1000), 'MMM d') : 'Now'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <span className={cn("text-sm truncate", !email.read ? "font-bold" : "font-normal")}>
                        {email.subject}
                      </span>
                      <span className="text-sm text-muted-foreground truncate opacity-60">
                        - {email.body.replace(/\n/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEmails.length === 0 && (
                <div className="p-12 text-center text-muted-foreground opacity-30">
                  <Mail className="h-12 w-12 mx-auto mb-4" />
                  <p>No messages found</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Email Content Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedEmail ? (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-3 border-b bg-muted/5">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => moveToTrash(selectedEmail)} className="h-9 w-9">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Archive className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)} className="h-9 w-9">
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase">{selectedEmail.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-8 max-w-5xl mx-auto">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-6 text-foreground leading-tight">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border">
                          {selectedEmail.from.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{selectedEmail.from}</span>
                            <span className="text-xs text-muted-foreground">&lt;{selectedEmail.from.includes('@') ? selectedEmail.from : 'system@deal4bank.com'}&gt;</span>
                          </div>
                          <div className="text-xs text-muted-foreground">to {selectedEmail.to}</div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {selectedEmail.createdAt?.seconds ? format(new Date(selectedEmail.createdAt.seconds * 1000), 'MMM d, yyyy, h:mm a') : ''}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {selectedEmail.body.length > 250 && (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center">
                              <Sparkles className="h-3 w-3 mr-1" /> AI Summary
                            </span>
                            {!summary && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold" onClick={handleSummarize} disabled={summarizing}>
                                {summarizing ? 'Analyzing...' : 'Generate Summary'}
                              </Button>
                            )}
                          </div>
                          {summary && <p className="text-sm italic text-muted-foreground border-l-2 border-primary/20 pl-4 py-1">"{summary}"</p>}
                        </div>
                      )}

                      <div className="prose prose-sm dark:prose-invert max-w-none pt-4 text-foreground/90 leading-relaxed text-base">
                        <ReactMarkdown>{selectedEmail.body}</ReactMarkdown>
                      </div>

                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="mt-12 border-t pt-6">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-4 tracking-widest flex items-center">
                            <Paperclip className="h-3 w-3 mr-2" /> {selectedEmail.attachments.length} Attachments
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {selectedEmail.attachments.map((file, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group w-64">
                                <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-primary"><FileText className="h-4 w-4" /></div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">{file.filename}</p>
                                  <p className="text-[9px] text-muted-foreground uppercase">{file.content_type}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/5 flex items-center gap-3">
                  <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 rounded-full py-6"><Reply className="mr-2 h-4 w-4" /> Reply</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader><DialogTitle>Reply to {selectedEmail.from}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <Tabs defaultValue="edit">
                          <TabsList className="grid grid-cols-2 mb-2">
                            <TabsTrigger value="edit">Write</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                          </TabsList>
                          <TabsContent value="edit">
                            <Textarea className="min-h-[250px] font-mono" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
                          </TabsContent>
                          <TabsContent value="preview" className="min-h-[250px] p-4 border rounded-md prose prose-sm dark:prose-invert max-w-none bg-muted/5">
                            <ReactMarkdown>{replyBody || "*No content to preview*"}</ReactMarkdown>
                          </TabsContent>
                        </Tabs>
                        <Button variant="outline" size="sm" onClick={() => handleRefineTone(replyBody, setReplyBody)} disabled={refining || !replyBody}>
                          <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Refine Tone'}
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => handleSend(selectedEmail.from, `Re: ${selectedEmail.subject}`, replyBody, true)} disabled={sendingEmail || !replyBody}>
                          {sendingEmail ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="flex-1 rounded-full py-6">Forward <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                <div className="p-8 bg-muted rounded-full mb-6"><Mail className="h-20 w-20" /></div>
                <h3 className="text-xl font-bold">Select an email to read</h3>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
