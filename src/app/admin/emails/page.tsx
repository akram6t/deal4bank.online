
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
  RotateCcw,
  Archive,
  MoreVertical,
  Reply,
  Minimize2,
  Sparkles,
  Plus,
  ArrowRight,
  Eye as EyeIcon,
  FileText,
  Paperclip,
  CheckCircle
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
    from: 'customer.support@bankpartner.com',
    to: 'admin@deal4bank.com',
    subject: 'New Loan Partnership Inquiry',
    body: "Hello Team,\n\nWe are interested in listing our new **Home Loan** products on your platform. We offer competitive rates starting from **8.5%**. \n\nPlease let us know the onboarding process.\n\nBest,\nPartnership Team",
    status: 'inbox',
    read: false,
    starred: true,
    createdAt: { seconds: Date.now() / 1000 - 3600 },
    isDummy: true
  },
  {
    id: 'dummy-2',
    from: 'marketing@fintech-solutions.io',
    to: 'admin@deal4bank.com',
    subject: 'Monthly Newsletter: Financial Trends 2024',
    body: "# Financial Trends 2024\n\nStay ahead of the curve with our latest insights into the Indian lending market.\n\n*   Digital signatures are becoming mandatory.\n*   AI-driven credit scoring is on the rise.\n*   Personal loans are seeing a 20% YoY growth.\n\n[Read more on our blog](https://example.com)",
    status: 'inbox',
    read: true,
    starred: false,
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    isDummy: true
  },
  {
    id: 'dummy-3',
    from: 'admin@deal4bank.com',
    to: 'rajesh.k@example.com',
    subject: 'Re: Home Loan Inquiry Update',
    body: "Dear Rajesh,\n\nYour application for the **SBI Home Loan** is currently under review. We expect an update within 2 working days.\n\nRegards,\nDeal4Bank Admin",
    status: 'sent',
    read: true,
    starred: false,
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    isDummy: true
  },
  {
    id: 'dummy-4',
    from: 'suspicious@phish-me.com',
    to: 'admin@deal4bank.com',
    subject: 'Urgent: Account Verification Required',
    body: "Please click the link below to verify your admin account or it will be suspended.\n\n[Verify Now](https://malicious-link.com)",
    status: 'spam',
    read: false,
    starred: false,
    createdAt: { seconds: Date.now() / 1000 - 43200 },
    isDummy: true
  }
];

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
      
      if (emailList.length === 0) {
        setEmails(DUMMY_EMAILS);
      } else {
        setEmails(emailList);
      }
    }, (error) => {
      console.error("Firestore error:", error);
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Communications</h1>
          <p className="text-muted-foreground text-sm">Manage your inbox and outgoing messages.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg"><Plus className="mr-2 h-4 w-4" /> New Email</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Compose Advanced Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input 
                      placeholder="recipient@example.com" 
                      value={composeData.to}
                      onChange={e => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input 
                      placeholder="Enter subject..." 
                      value={composeData.subject}
                      onChange={e => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                </div>

                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="edit">Write (Markdown)</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="space-y-2">
                    <Textarea 
                      placeholder="Write your message here using Markdown..." 
                      className="min-h-[300px] font-mono text-sm"
                      value={composeData.body}
                      onChange={e => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="min-h-[300px] p-4 border rounded-md bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{composeData.body || "*No content to preview*"}</ReactMarkdown>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRefineTone(composeData.body, (val) => setComposeData(p => ({...p, body: val})))}
                    disabled={refining || !composeData.body}
                  >
                    <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Optimize with AI'}
                  </Button>
                </div>
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

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/50 p-1 mb-4 h-12">
          <TabsTrigger value="inbox" className="gap-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Inbox className="h-4 w-4" /> Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Send className="h-4 w-4" /> Sent
          </TabsTrigger>
          <TabsTrigger value="spam" className="gap-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <AlertCircle className="h-4 w-4" /> Spam
          </TabsTrigger>
          <TabsTrigger value="trash" className="gap-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Trash2 className="h-4 w-4" /> Trash
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 overflow-hidden bg-card rounded-xl border shadow-sm">
          {/* Email Sidebar (List) */}
          <div className="w-[400px] border-r flex flex-col min-w-[300px]">
            <div className="p-4 border-b bg-muted/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search messages..." 
                  className="pl-9 bg-background border-muted" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {filteredEmails.map((email) => (
                <div 
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    markRead(email);
                    setSummary(null);
                  }}
                  className={cn(
                    "p-4 border-b cursor-pointer transition-all flex items-start gap-3 hover:bg-muted/30 border-l-2 border-l-transparent",
                    selectedEmail?.id === email.id ? "bg-primary/5 border-l-primary" : "",
                    !email.read ? "bg-muted/20 border-l-primary font-semibold" : "opacity-80"
                  )}
                >
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(email);
                    }}
                    className="mt-1"
                  >
                    <Star className={cn("h-4 w-4", email.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-40")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs truncate font-medium text-foreground">{email.from}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {email.createdAt?.seconds ? format(new Date(email.createdAt.seconds * 1000), 'MMM d') : 'Recent'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold truncate mb-1">{email.subject}</h4>
                    <p className="text-xs text-muted-foreground truncate leading-relaxed">{email.body}</p>
                  </div>
                </div>
              ))}
              {filteredEmails.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground opacity-30">
                  <Mail className="h-12 w-12 mb-4" />
                  <p className="text-sm">No messages in {activeTab}</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Email Preview Panel (Right Side) */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedEmail ? (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
                <div className="p-4 border-b flex items-center justify-between bg-muted/5">
                  <div className="flex gap-1">
                    {activeTab === 'trash' ? (
                      <Button variant="ghost" size="icon" onClick={() => deletePermanently(selectedEmail)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => moveToTrash(selectedEmail)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                    <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}><Minimize2 className="h-4 w-4" /></Button>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight px-3">{selectedEmail.status}</Badge>
                </div>
                
                <ScrollArea className="flex-1 p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                      <h2 className="text-3xl font-headline font-bold text-foreground mb-6 leading-tight">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm text-lg border border-primary/20">
                          {selectedEmail.from.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate flex items-center gap-2">
                            {selectedEmail.from}
                            <Badge variant="secondary" className="text-[10px] font-normal py-0">Sender</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">to {selectedEmail.to}</div>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground">
                          {selectedEmail.createdAt?.seconds ? format(new Date(selectedEmail.createdAt.seconds * 1000), 'PPPP p') : ''}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {selectedEmail.body.length > 300 && (
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center">
                              <Sparkles className="h-3 w-3 mr-2" /> AI Assistant
                            </span>
                            {!summary && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold" onClick={handleSummarize} disabled={summarizing}>
                                {summarizing ? 'Analyzing message...' : 'Summarize'}
                              </Button>
                            )}
                          </div>
                          {summary ? (
                            <div className="text-sm italic text-muted-foreground animate-in fade-in leading-relaxed border-l-2 border-primary/20 pl-4 py-1">
                              "{summary}"
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">This is a long message. Would you like an AI-generated summary?</p>
                          )}
                        </div>
                      )}

                      <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-8 text-foreground/90 leading-relaxed text-base">
                        <ReactMarkdown>{selectedEmail.body}</ReactMarkdown>
                      </div>

                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="mt-12 border-t pt-6">
                          <h5 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center">
                            <Paperclip className="h-3 w-3 mr-2" /> Attachments ({selectedEmail.attachments.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedEmail.attachments.map((file, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">{file.filename}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{file.content_type || 'Unknown'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/5 flex gap-3">
                  <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 shadow-lg py-6"><Reply className="mr-2 h-4 w-4" /> Reply to Sender</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Reply to {selectedEmail.from}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Tabs defaultValue="edit">
                          <TabsList className="grid w-full grid-cols-2 mb-2">
                            <TabsTrigger value="edit">Write</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                          </TabsList>
                          <TabsContent value="edit">
                            <Textarea 
                              placeholder="Write your response..." 
                              className="min-h-[250px] font-mono text-sm leading-relaxed"
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              disabled={sendingEmail}
                            />
                          </TabsContent>
                          <TabsContent value="preview" className="min-h-[250px] p-4 border rounded-md prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-muted/5">
                            <ReactMarkdown>{replyBody || "*No content to preview*"}</ReactMarkdown>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRefineTone(replyBody, setReplyBody)} 
                            disabled={refining || !replyBody || sendingEmail}
                          >
                            <Sparkles className="mr-2 h-3 w-3" /> {refining ? 'Refining...' : 'Refine Tone with AI'}
                          </Button>
                          <span className="text-[10px] text-muted-foreground italic">Markdown is supported</span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={() => handleSend(selectedEmail.from, `Re: ${selectedEmail.subject}`, replyBody, true)} 
                          disabled={sendingEmail || !replyBody}
                        >
                          {sendingEmail ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="flex-1 py-6">Forward <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground/30 animate-in fade-in duration-500">
                <div className="p-8 bg-muted/20 rounded-full mb-6">
                   <Mail className="h-20 w-20" />
                </div>
                <h3 className="text-xl font-headline font-bold text-muted-foreground/50">Select an email to read</h3>
                <p className="max-w-xs mx-auto mt-2 text-sm">Choose a conversation from the list on the left to view details and reply.</p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
