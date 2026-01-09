'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Send, 
  RefreshCw, 
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Tag,
  Settings,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { 
  MailChimpList, 
  MailChimpMember, 
  MailChimpCampaign 
} from '@/lib/mailchimp';

interface AccountInfo {
  account_id: string;
  account_name: string;
  email: string;
  total_subscribers: number;
}

export default function MailChimpAdminPage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [lists, setLists] = useState<MailChimpList[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [members, setMembers] = useState<MailChimpMember[]>([]);
  const [campaigns, setCampaigns] = useState<MailChimpCampaign[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addSubscriberOpen, setAddSubscriberOpen] = useState(false);
  const [addingSubscriber, setAddingSubscriber] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
  });

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetchMembers(selectedList);
    }
  }, [selectedList]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mailchimp?action=account');
      if (response.ok) {
        const data = await response.json();
        setAccountInfo(data);
        setConnected(true);
        await fetchLists();
        await fetchCampaigns();
      } else {
        setConnected(false);
      }
    } catch (error) {
      console.error('Failed to connect to MailChimp:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/mailchimp?action=lists');
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists || []);
        if (data.lists?.length > 0 && !selectedList) {
          setSelectedList(data.lists[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    }
  };

  const fetchMembers = async (listId: string) => {
    setMembersLoading(true);
    try {
      const response = await fetch(`/api/mailchimp?action=members&listId=${listId}&count=100`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const response = await fetch('/api/mailchimp?action=campaigns&count=50');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!selectedList || !newSubscriber.email) {
      toast.error('Please select a list and enter an email');
      return;
    }

    setAddingSubscriber(true);
    try {
      const response = await fetch('/api/mailchimp?action=subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: selectedList,
          ...newSubscriber,
        }),
      });

      if (response.ok) {
        toast.success('Subscriber added successfully');
        setAddSubscriberOpen(false);
        setNewSubscriber({ email: '', firstName: '', lastName: '', company: '', phone: '' });
        fetchMembers(selectedList);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add subscriber');
      }
    } catch (error) {
      toast.error('Failed to add subscriber');
    } finally {
      setAddingSubscriber(false);
    }
  };

  const handleUnsubscribe = async (email: string) => {
    if (!selectedList) return;

    try {
      const response = await fetch('/api/mailchimp?action=unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: selectedList, email }),
      });

      if (response.ok) {
        toast.success('Subscriber unsubscribed');
        fetchMembers(selectedList);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'subscribed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Subscribed</Badge>;
      case 'unsubscribed':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Unsubscribed</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cleaned':
        return <Badge variant="destructive">Cleaned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'sending':
        return <Badge className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending</Badge>;
      case 'schedule':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'save':
        return <Badge variant="secondary">Draft</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMembers = members.filter(member => 
    member.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.merge_fields.FNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.merge_fields.LNAME?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedListData = lists.find(l => l.id === selectedList);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">MailChimp Integration</h1>
          <p className="text-muted-foreground">Connect your MailChimp account to manage email marketing</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Connected</AlertTitle>
          <AlertDescription>
            MailChimp API credentials are not configured. Please add the following environment variables:
            <ul className="list-disc list-inside mt-2">
              <li><code className="bg-muted px-1 rounded">MAILCHIMP_API_KEY</code> - Your MailChimp API key</li>
              <li><code className="bg-muted px-1 rounded">MAILCHIMP_SERVER_PREFIX</code> - Your server prefix (e.g., us1, us2)</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>How to Get Your API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Log in to your MailChimp account</li>
              <li>Click on your profile icon and select <strong>Account & billing</strong></li>
              <li>Navigate to <strong>Extras → API keys</strong></li>
              <li>Click <strong>Create A Key</strong> and copy the generated key</li>
              <li>Your server prefix is the last part of your API key (e.g., if your key ends in <code>-us1</code>, your prefix is <code>us1</code>)</li>
            </ol>
            <Button variant="outline" asChild>
              <a href="https://mailchimp.com/help/about-api-keys/" target="_blank" rel="noopener noreferrer">
                MailChimp API Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MailChimp Integration</h1>
          <p className="text-muted-foreground">Manage your email marketing campaigns and subscribers</p>
        </div>
        <Button variant="outline" onClick={checkConnection}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Account Info */}
      {accountInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{accountInfo.account_name}</CardTitle>
                  <CardDescription>{accountInfo.email}</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-500">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{lists.length}</div>
                <div className="text-sm text-muted-foreground">Audiences</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{accountInfo.total_subscribers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Subscribers</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">
            <Users className="h-4 w-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Send className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="audiences">
            <Tag className="h-4 w-4 mr-2" />
            Audiences
          </TabsTrigger>
        </TabsList>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscribers</CardTitle>
                  <CardDescription>
                    {selectedListData ? `${selectedListData.name} - ${selectedListData.stats.member_count} subscribers` : 'Select an audience'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedList} onValueChange={setSelectedList}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map(list => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={addSubscriberOpen} onOpenChange={setAddSubscriberOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subscriber
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Subscriber</DialogTitle>
                        <DialogDescription>
                          Add a new subscriber to {selectedListData?.name || 'the selected audience'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={newSubscriber.email}
                            onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={newSubscriber.firstName}
                              onChange={(e) => setNewSubscriber({ ...newSubscriber, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={newSubscriber.lastName}
                              onChange={(e) => setNewSubscriber({ ...newSubscriber, lastName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            placeholder="Company Name"
                            value={newSubscriber.company}
                            onChange={(e) => setNewSubscriber({ ...newSubscriber, company: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            placeholder="(555) 123-4567"
                            value={newSubscriber.phone}
                            onChange={(e) => setNewSubscriber({ ...newSubscriber, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSubscriberOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddSubscriber} disabled={addingSubscriber}>
                          {addingSubscriber ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add Subscriber'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.email_address}</TableCell>
                          <TableCell>
                            {member.merge_fields.FNAME || member.merge_fields.LNAME
                              ? `${member.merge_fields.FNAME || ''} ${member.merge_fields.LNAME || ''}`.trim()
                              : '-'}
                          </TableCell>
                          <TableCell>{member.merge_fields.COMPANY || '-'}</TableCell>
                          <TableCell>{getStatusBadge(member.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(member.timestamp_signup).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.status === 'subscribed' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUnsubscribe(member.email_address)}
                                    className="text-destructive"
                                  >
                                    Unsubscribe
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaigns</CardTitle>
                  <CardDescription>View and manage your email campaigns</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <a href="https://mailchimp.com/campaigns/" target="_blank" rel="noopener noreferrer">
                    Create in MailChimp
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No campaigns found
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.settings.title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {campaign.settings.subject_line}
                          </TableCell>
                          <TableCell>{getCampaignStatusBadge(campaign.status)}</TableCell>
                          <TableCell>
                            {campaign.send_time 
                              ? new Date(campaign.send_time).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {campaign.report_summary ? (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {(campaign.report_summary.open_rate * 100).toFixed(1)}%
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {campaign.report_summary ? (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {(campaign.report_summary.click_rate * 100).toFixed(1)}%
                              </span>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audiences Tab */}
        <TabsContent value="audiences" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(list.date_created).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {list.stats.member_count.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Subscribers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {list.stats.campaign_count}
                      </div>
                      <div className="text-muted-foreground">Campaigns</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {(list.stats.open_rate * 100).toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground">Open Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {(list.stats.click_rate * 100).toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground">Click Rate</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedList(list.id);
                      const tabsTrigger = document.querySelector('[value="subscribers"]') as HTMLElement;
                      tabsTrigger?.click();
                    }}
                  >
                    View Subscribers
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
