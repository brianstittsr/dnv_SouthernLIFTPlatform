'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Target, 
  Building2, 
  DollarSign, 
  Calendar,
  Users,
  ArrowLeft,
  Star,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ExternalLink,
  FileText,
  Shield,
  MapPin,
  Clock,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';
import { useUserProfile } from '@/contexts/user-profile-context';

interface PursuitBrief {
  id: string;
  title: string;
  description: string;
  agency: string;
  naicsCode: string;
  setAside?: string;
  estimatedValue: number;
  dueDate: Timestamp;
  requiredCapabilities: string[];
  requiredCompliance: string[];
  geographicPreference?: string;
  status: string;
  teamMembers: string[];
  interestedMembers: string[];
  publishedAt: Timestamp;
  publishedBy: string;
  solicitation?: {
    number: string;
    url: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  'published': { label: 'Open', color: 'bg-green-100 text-green-800', icon: Target },
  'team-forming': { label: 'Team Forming', color: 'bg-blue-100 text-blue-800', icon: Users },
  'proposal-phase': { label: 'Proposal Phase', color: 'bg-yellow-100 text-yellow-800', icon: Briefcase },
  'submitted': { label: 'Submitted', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  'won': { label: 'Won', color: 'bg-emerald-100 text-emerald-800', icon: Star },
  'lost': { label: 'Lost', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PursuitDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const [pursuit, setPursuit] = useState<PursuitBrief | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [interestedMembers, setInterestedMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPursuit();
  }, [id]);

  const fetchPursuit = async () => {
    if (!db || !id) return;

    try {
      const pursuitRef = doc(db, COLLECTIONS.PURSUIT_BRIEFS, id);
      const pursuitSnap = await getDoc(pursuitRef);

      if (pursuitSnap.exists()) {
        const pursuitData = {
          id: pursuitSnap.id,
          ...pursuitSnap.data()
        } as PursuitBrief;
        setPursuit(pursuitData);

        // Fetch team member details
        if (pursuitData.teamMembers?.length > 0) {
          const members = await fetchMemberDetails(pursuitData.teamMembers);
          setTeamMembers(members);
        }

        // Fetch interested member details
        if (pursuitData.interestedMembers?.length > 0) {
          const interested = await fetchMemberDetails(pursuitData.interestedMembers);
          setInterestedMembers(interested);
        }
      }
    } catch (error) {
      console.error('Error fetching pursuit:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetails = async (memberIds: string[]): Promise<TeamMember[]> => {
    if (!db) return [];

    const members: TeamMember[] = [];
    for (const memberId of memberIds) {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, memberId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          members.push({
            id: memberId,
            name: userData.name || 'Unknown',
            email: userData.email || '',
            company: userData.company,
            role: userData.role,
            avatarUrl: userData.avatarUrl,
          });
        }
      } catch (error) {
        console.error('Error fetching member:', memberId, error);
      }
    }
    return members;
  };

  const handleExpressInterest = async () => {
    if (!pursuit) return;
    setActionLoading(true);

    try {
      const response = await fetch('/api/pursuits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pursuitId: pursuit.id,
          action: 'express-interest',
          userId: profile.id,
        }),
      });

      if (response.ok) {
        fetchPursuit();
      }
    } catch (error) {
      console.error('Error expressing interest:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawInterest = async () => {
    if (!pursuit) return;
    setActionLoading(true);

    try {
      const response = await fetch('/api/pursuits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pursuitId: pursuit.id,
          action: 'withdraw-interest',
          userId: profile.id,
        }),
      });

      if (response.ok) {
        fetchPursuit();
      }
    } catch (error) {
      console.error('Error withdrawing interest:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntilDue = (dueDate: Timestamp) => {
    const now = new Date();
    const due = dueDate.toDate();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pursuit) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Pursuit Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This pursuit brief doesn't exist or has been removed.
        </p>
        <Link href="/portal/pursuits">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pursuit Board
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[pursuit.status] || STATUS_CONFIG['published'];
  const StatusIcon = statusConfig.icon;
  const daysUntilDue = getDaysUntilDue(pursuit.dueDate);
  const isInterested = pursuit.interestedMembers?.includes(profile.id || '');
  const isOnTeam = pursuit.teamMembers?.includes(profile.id || '');
  const canJoin = pursuit.status === 'published' || pursuit.status === 'team-forming';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/portal/pursuits" className="inline-flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Pursuit Board
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            {pursuit.setAside && (
              <Badge variant="outline">{pursuit.setAside}</Badge>
            )}
            {isOnTeam && (
              <Badge className="bg-primary">You're on the Team</Badge>
            )}
            {isInterested && !isOnTeam && (
              <Badge variant="secondary">You've Expressed Interest</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{pursuit.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {pursuit.agency}
            </span>
            {pursuit.naicsCode && (
              <span>NAICS: {pursuit.naicsCode}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(pursuit.estimatedValue)}
          </div>
          <div className="text-sm text-muted-foreground">Estimated Contract Value</div>
          {canJoin && !isOnTeam && (
            <div className="flex gap-2 mt-2">
              {!isInterested ? (
                <Button onClick={handleExpressInterest} disabled={actionLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Express Interest
                </Button>
              ) : (
                <Button variant="outline" onClick={handleWithdrawInterest} disabled={actionLoading}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Withdraw Interest
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {pursuit.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Capabilities */}
          {pursuit.requiredCapabilities && pursuit.requiredCapabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Required Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pursuit.requiredCapabilities.map(cap => (
                    <Badge key={cap} variant="secondary" className="text-sm py-1 px-3">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Requirements */}
          {pursuit.requiredCompliance && pursuit.requiredCompliance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pursuit.requiredCompliance.map(comp => (
                    <Badge key={comp} variant="outline" className="text-sm py-1 px-3">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pursuit Team ({teamMembers.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No team members yet. Be the first to join!
                </p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.company && (
                          <p className="text-sm text-muted-foreground">{member.company}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interested Members */}
          {interestedMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Interested Members ({interestedMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interestedMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle>Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(pursuit.dueDate.toDate(), 'MMMM d, yyyy')}
                  </p>
                  <p className={`text-sm ${daysUntilDue <= 7 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    {daysUntilDue > 0 ? `${daysUntilDue} days remaining` : 'Past due'}
                  </p>
                </div>
              </div>

              {pursuit.geographicPreference && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Geographic Preference</p>
                    <p className="text-sm text-muted-foreground">{pursuit.geographicPreference}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-sm text-muted-foreground">
                    {format(pursuit.publishedAt.toDate(), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {pursuit.solicitation && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Solicitation</p>
                    <p className="text-sm text-muted-foreground">{pursuit.solicitation.number}</p>
                    {pursuit.solicitation.url && (
                      <a 
                        href={pursuit.solicitation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View on SAM.gov <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Team Size</span>
                <span className="font-medium">{teamMembers.length} members</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Interested</span>
                <span className="font-medium">{interestedMembers.length} members</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Capabilities Needed</span>
                <span className="font-medium">{pursuit.requiredCapabilities?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isOnTeam && (
            <Card>
              <CardHeader>
                <CardTitle>Team Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">
                  <FileText className="mr-2 h-4 w-4" />
                  Open Team Workspace
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Schedule Team Meeting
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
