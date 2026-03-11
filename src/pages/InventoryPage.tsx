import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mail, 
  User, 
  Briefcase, 
  Globe, 
  Phone,
  Plus,
  Trash2,
  Star,
  Loader2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { 
  InventoryEmail, 
  InventoryUsername, 
  InventoryAccount, 
  InventoryDomain, 
  InventoryPhone,
  calculateInventoryCompleteness,
  buildIdentifierCoverage,
  calculateIdentifierCoverage,
  IDENTIFIER_META,
  RecoveryMethod,
  RECOVERY_METHOD_OPTIONS,
} from '@/lib/types';

type InventoryTab = 'emails' | 'usernames' | 'accounts' | 'domains' | 'phones';

export default function InventoryPage() {
  const { user } = useAuth();
  const { logEvent } = useAuditLog();
  const { toast } = useToast();

  const [emails, setEmails] = useState<InventoryEmail[]>([]);
  const [usernames, setUsernames] = useState<InventoryUsername[]>([]);
  const [accounts, setAccounts] = useState<InventoryAccount[]>([]);
  const [domains, setDomains] = useState<InventoryDomain[]>([]);
  const [phones, setPhones] = useState<InventoryPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);

  // Governance coverage inputs
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod | ''>('');
  const [covInputExists, setCovInputExists] = useState(false);
  const [savingCov, setSavingCov] = useState(false);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newEmailPrimary, setNewEmailPrimary] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUsernamePlatform, setNewUsernamePlatform] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newAccountCategory, setNewAccountCategory] = useState('other');
  const [newDomain, setNewDomain] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (user) loadInventory();
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;
    setLoading(true);
    
    const [emailsRes, usernamesRes, accountsRes, domainsRes, phonesRes, covRes] = await Promise.all([
      supabase.from('inventory_emails').select('*').eq('user_id', user.id),
      supabase.from('inventory_usernames').select('*').eq('user_id', user.id),
      supabase.from('inventory_accounts').select('*').eq('user_id', user.id),
      supabase.from('inventory_domains').select('*').eq('user_id', user.id),
      supabase.from('inventory_phones').select('*').eq('user_id', user.id),
      supabase.from('governance_coverage_inputs').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    if (emailsRes.data) setEmails(emailsRes.data as InventoryEmail[]);
    if (usernamesRes.data) setUsernames(usernamesRes.data as InventoryUsername[]);
    if (accountsRes.data) setAccounts(accountsRes.data as InventoryAccount[]);
    if (domainsRes.data) setDomains(domainsRes.data as InventoryDomain[]);
    if (phonesRes.data) setPhones(phonesRes.data as InventoryPhone[]);

    if (covRes.data) {
      setCovInputExists(true);
      setRecoveryPhone(covRes.data.recovery_phone || '');
      setRecoveryMethod((covRes.data.recovery_method as RecoveryMethod) || '');
    } else {
      setCovInputExists(false);
    }
    
    setLoading(false);
  };

  const identifierCoverage = buildIdentifierCoverage({
    emails: emails.map(e => ({ is_primary: e.is_primary })),
    phones: phones.length,
    usernames: usernames.length,
    domains: domains.length,
    recoveryPhone: recoveryPhone || null,
    recoveryMethod: recoveryMethod || null,
  });
  const { level: coverageLevel, total: coverageTotal } = calculateIdentifierCoverage(identifierCoverage);

  const addEmail = async () => {
    if (!user || !newEmail) return;
    setAddingItem(true);
    
    const { error } = await supabase.from('inventory_emails').insert([{
      user_id: user.id,
      email: newEmail,
      is_primary: newEmailPrimary
    }]);

    if (!error) {
      await logEvent('inventory_email_added', { email: newEmail });
      toast({ title: 'Email added', description: 'Email has been added to your inventory.' });
      setNewEmail('');
      setNewEmailPrimary(false);
      loadInventory();
    }
    setAddingItem(false);
  };

  const addUsername = async () => {
    if (!user || !newUsername) return;
    setAddingItem(true);
    
    const { error } = await supabase.from('inventory_usernames').insert([{
      user_id: user.id,
      username: newUsername,
      platform: newUsernamePlatform || null
    }]);

    if (!error) {
      await logEvent('inventory_username_added', { username: newUsername });
      toast({ title: 'Username added' });
      setNewUsername('');
      setNewUsernamePlatform('');
      loadInventory();
    }
    setAddingItem(false);
  };

  const addAccount = async () => {
    if (!user || !newAccount) return;
    setAddingItem(true);
    
    const { error } = await supabase.from('inventory_accounts').insert([{
      user_id: user.id,
      account_name: newAccount,
      category: newAccountCategory
    }]);

    if (!error) {
      await logEvent('inventory_account_added', { account: newAccount });
      toast({ title: 'Account added' });
      setNewAccount('');
      setNewAccountCategory('other');
      loadInventory();
    }
    setAddingItem(false);
  };

  const addDomain = async () => {
    if (!user || !newDomain) return;
    setAddingItem(true);
    
    const { error } = await supabase.from('inventory_domains').insert([{
      user_id: user.id,
      domain: newDomain
    }]);

    if (!error) {
      await logEvent('inventory_domain_added', { domain: newDomain });
      toast({ title: 'Domain added' });
      setNewDomain('');
      loadInventory();
    }
    setAddingItem(false);
  };

  const addPhone = async () => {
    if (!user || !newPhone) return;
    setAddingItem(true);
    
    const { error } = await supabase.from('inventory_phones').insert([{
      user_id: user.id,
      phone: newPhone
    }]);

    if (!error) {
      await logEvent('inventory_phone_added', { phone: newPhone });
      toast({ title: 'Phone added' });
      setNewPhone('');
      loadInventory();
    }
    setAddingItem(false);
  };

  const deleteItem = async (table: 'inventory_emails' | 'inventory_usernames' | 'inventory_accounts' | 'inventory_domains' | 'inventory_phones', id: string, itemType: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      await logEvent(`inventory_${itemType}_deleted`, { id });
      toast({ title: 'Item deleted' });
      loadInventory();
    }
  };

  const saveGovernanceCoverage = async () => {
    if (!user) return;
    setSavingCov(true);
    const payload = {
      user_id: user.id,
      recovery_phone: recoveryPhone.trim() || null,
      recovery_method: recoveryMethod || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (covInputExists) {
      ({ error } = await supabase.from('governance_coverage_inputs').update(payload).eq('user_id', user.id));
    } else {
      ({ error } = await supabase.from('governance_coverage_inputs').insert([payload]));
    }

    if (!error) {
      setCovInputExists(true);
      await logEvent('governance_coverage_updated', { recovery_phone: !!payload.recovery_phone, recovery_method: payload.recovery_method });
      toast({ title: 'Coverage inputs saved' });
      loadInventory();
    }
    setSavingCov(false);
  };

  const clearRecoveryPhone = async () => {
    setRecoveryPhone('');
    if (!user || !covInputExists) return;
    await supabase.from('governance_coverage_inputs').update({ recovery_phone: null, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    await logEvent('governance_recovery_phone_cleared', {});
    toast({ title: 'Recovery number cleared' });
    loadInventory();
  };

  const clearRecoveryMethod = async () => {
    setRecoveryMethod('');
    if (!user || !covInputExists) return;
    await supabase.from('governance_coverage_inputs').update({ recovery_method: null, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    await logEvent('governance_recovery_method_cleared', {});
    toast({ title: 'Recovery method cleared' });
    loadInventory();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Identity Inventory</h1>
          <p className="text-muted-foreground">
            The foundation of your digital footprint protection
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identifier Coverage</CardTitle>
            <CardDescription>
              Adding identifiers increases exposure detection and cleanup guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{coverageLevel}</span>
              <span className="text-sm text-muted-foreground">/ {coverageTotal} identifiers</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: coverageTotal }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i < coverageLevel ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            <div className="space-y-1.5 text-sm">
              {IDENTIFIER_META.map(({ key, label, description }) => {
                const present = identifierCoverage[key];
                return (
                  <div key={key} className="flex items-start gap-2">
                    {present ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 mt-0.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={present ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="emails" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
              <Badge variant="secondary" className="ml-1">{emails.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="usernames" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Usernames</span>
              <Badge variant="secondary" className="ml-1">{usernames.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Accounts</span>
              <Badge variant="secondary" className="ml-1">{accounts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="domains" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Domains</span>
              <Badge variant="secondary" className="ml-1">{domains.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="phones" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Phones</span>
              <Badge variant="secondary" className="ml-1">{phones.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Addresses</CardTitle>
                    <CardDescription>Add all email addresses you use or have used</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Email</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Email Address</DialogTitle>
                        <DialogDescription>
                          Add an email address to check for breaches
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Email Address</Label>
                          <Input 
                            type="email" 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="primary"
                            checked={newEmailPrimary}
                            onChange={(e) => setNewEmailPrimary(e.target.checked)}
                          />
                          <Label htmlFor="primary">This is my primary email</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addEmail} disabled={addingItem}>
                          {addingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Email
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {emails.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No emails added yet. Add your first email to begin tracking.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {emails.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{email.email}</span>
                          {email.is_primary && (
                            <Badge variant="secondary">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteItem('inventory_emails', email.id, 'email')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usernames">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usernames & Handles</CardTitle>
                    <CardDescription>Track your social media and online identities</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Username</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Username</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Username</Label>
                          <Input 
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label>Platform (optional)</Label>
                          <Input 
                            value={newUsernamePlatform}
                            onChange={(e) => setNewUsernamePlatform(e.target.value)}
                            placeholder="Twitter, Instagram, etc."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addUsername} disabled={addingItem}>
                          {addingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Username
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {usernames.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No usernames added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {usernames.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{u.username}</span>
                          {u.platform && <Badge variant="outline">{u.platform}</Badge>}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteItem('inventory_usernames', u.id, 'username')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Key Accounts</CardTitle>
                    <CardDescription>Important accounts like Google, Apple, banking</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Key Account</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Account Name</Label>
                          <Input 
                            value={newAccount}
                            onChange={(e) => setNewAccount(e.target.value)}
                            placeholder="Google, Apple, Bank of America..."
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={newAccountCategory}
                            onChange={(e) => setNewAccountCategory(e.target.value)}
                          >
                            <option value="email">Email Provider</option>
                            <option value="social">Social Media</option>
                            <option value="banking">Banking/Financial</option>
                            <option value="shopping">Shopping</option>
                            <option value="work">Work/Professional</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addAccount} disabled={addingItem}>
                          {addingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No accounts added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {accounts.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{a.account_name}</span>
                          <Badge variant="outline">{a.category}</Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteItem('inventory_accounts', a.id, 'account')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Domains</CardTitle>
                    <CardDescription>Domain names you own (for business owners)</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Domain</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Domain</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Domain Name</Label>
                          <Input 
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="example.com"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addDomain} disabled={addingItem}>
                          {addingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Domain
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {domains.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No domains added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {domains.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{d.domain}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteItem('inventory_domains', d.id, 'domain')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phones">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Phone Numbers</CardTitle>
                    <CardDescription>Optional: for comprehensive review coverage</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Phone</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Phone Number</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Phone Number</Label>
                          <Input 
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="+1 555-123-4567"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addPhone} disabled={addingItem}>
                          {addingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Phone
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {phones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No phone numbers added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {phones.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{p.phone}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteItem('inventory_phones', p.id, 'phone')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Governance Coverage Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Governance Coverage Inputs
            </CardTitle>
            <CardDescription>
              These optional inputs improve the precision of your risk assessment and recovery posture review. They are stored separately from your general inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recovery Number */}
            <div className="space-y-2">
              <Label htmlFor="recovery-phone" className="font-medium">Recovery Number</Label>
              <p className="text-xs text-muted-foreground">
                Assesses account recovery exposure and SMS dependency across linked services.
              </p>
              <div className="flex gap-2">
                <Input
                  id="recovery-phone"
                  type="tel"
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  placeholder="+1 555-000-0000"
                  className="max-w-xs"
                />
                {recoveryPhone && (
                  <Button variant="ghost" size="icon" onClick={clearRecoveryPhone}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Primary Recovery Method */}
            <div className="space-y-2">
              <Label className="font-medium">Primary Recovery Method</Label>
              <p className="text-xs text-muted-foreground">
                Evaluates the strength of your account recovery and MFA fallback posture.
              </p>
              <div className="flex gap-2 items-center">
                <Select value={recoveryMethod} onValueChange={(v) => setRecoveryMethod(v as RecoveryMethod)}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select method…" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOVERY_METHOD_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {recoveryMethod && (
                  <Button variant="ghost" size="icon" onClick={clearRecoveryMethod}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Button onClick={saveGovernanceCoverage} disabled={savingCov} size="sm">
              {savingCov ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Coverage Inputs
            </Button>
          </CardContent>
        </Card>

        {/* Guided Discovery Section */}
        <Card>
          <CardHeader>
            <CardTitle>Forgotten Email / Account Discovery</CardTitle>
            <CardDescription>
              Guided steps to help you find accounts you may have forgotten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium">📋 Check Your Password Manager</h4>
              <p className="text-sm text-muted-foreground">
                Review your saved logins in browsers (Chrome, Safari, Firefox) and password managers (1Password, LastPass, etc.)
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium">📬 Search Your Inbox</h4>
              <p className="text-sm text-muted-foreground">
                Search for: "welcome to", "verify your email", "confirm your account", "receipt", "unsubscribe"
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium">🔐 Check Social Sign-ins</h4>
              <p className="text-sm text-muted-foreground">
                Review apps connected to your Google, Apple, Facebook, and Twitter accounts in their security settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}