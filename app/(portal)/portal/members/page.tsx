'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Building2, 
  MapPin,
  Shield,
  Star,
  CheckCircle,
  Mail,
  Phone,
  ExternalLink,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

interface Member {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  tier: 'core-capture' | 'pursuit-pack' | 'custom';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  capabilities: string[];
  certifications: string[];
  naicsCodes: string[];
  location?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
}

const TIER_CONFIG = {
  'core-capture': { 
    label: 'Core Capture', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Star 
  },
  'pursuit-pack': { 
    label: 'Pursuit Pack', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle 
  },
  'custom': { 
    label: 'Custom', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Shield 
  },
};

const CAPABILITY_OPTIONS = [
  'Engineering',
  'Manufacturing',
  'IT Services',
  'Cybersecurity',
  'Logistics',
  'Construction',
  'Professional Services',
  'Research & Development',
  'Training',
  'Healthcare',
];

const CERTIFICATION_OPTIONS = [
  '8(a)',
  'HUBZone',
  'SDVOSB',
  'WOSB',
  'EDWOSB',
  'MBE',
  'DBE',
  'ISO 9001',
  'ISO 27001',
  'CMMC Level 2',
  'CMMC Level 3',
  'GSA Schedule',
];

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [capabilityFilter, setCapabilityFilter] = useState('all');
  const [certificationFilter, setCertificationFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, tierFilter, capabilityFilter, certificationFilter]);

  const fetchMembers = async () => {
    if (!db) return;

    try {
      // Fetch active memberships
      const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
      const q = query(
        membershipsRef,
        where('status', 'in', ['active', 'trialing']),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      // For demo purposes, create sample member data
      // In production, this would join with user/organization data
      const membersData: Member[] = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          companyName: `Member Company ${index + 1}`,
          contactName: `Contact Person ${index + 1}`,
          contactEmail: `contact${index + 1}@example.com`,
          tier: data.tier || 'core-capture',
          status: data.status,
          capabilities: CAPABILITY_OPTIONS.slice(0, Math.floor(Math.random() * 4) + 2),
          certifications: CERTIFICATION_OPTIONS.slice(0, Math.floor(Math.random() * 3) + 1),
          naicsCodes: ['541330', '541511', '541512'].slice(0, Math.floor(Math.random() * 2) + 1),
          location: ['Washington, DC', 'Virginia', 'Maryland', 'Texas', 'California'][Math.floor(Math.random() * 5)],
          description: 'A leading provider of government contracting services with expertise in multiple domains.',
        };
      });

      // If no real members, add sample data for demo
      if (membersData.length === 0) {
        const sampleMembers: Member[] = [
          {
            id: '1',
            userId: 'user1',
            companyName: 'TechForward Solutions',
            contactName: 'Sarah Johnson',
            contactEmail: 'sarah@techforward.com',
            contactPhone: '(202) 555-0101',
            tier: 'core-capture',
            status: 'active',
            capabilities: ['IT Services', 'Cybersecurity', 'Engineering'],
            certifications: ['8(a)', 'SDVOSB', 'ISO 27001'],
            naicsCodes: ['541511', '541512'],
            location: 'Washington, DC',
            website: 'https://techforward.com',
            description: 'Award-winning IT solutions provider specializing in federal cybersecurity and cloud migration.',
          },
          {
            id: '2',
            userId: 'user2',
            companyName: 'Precision Manufacturing Inc',
            contactName: 'Michael Chen',
            contactEmail: 'mchen@precisionmfg.com',
            contactPhone: '(703) 555-0202',
            tier: 'core-capture',
            status: 'active',
            capabilities: ['Manufacturing', 'Engineering', 'Logistics'],
            certifications: ['HUBZone', 'ISO 9001', 'MBE'],
            naicsCodes: ['332710', '332999'],
            location: 'Virginia',
            website: 'https://precisionmfg.com',
            description: 'Precision machining and manufacturing for defense and aerospace applications.',
          },
          {
            id: '3',
            userId: 'user3',
            companyName: 'Strategic Consulting Group',
            contactName: 'Amanda Williams',
            contactEmail: 'awilliams@strategiccg.com',
            tier: 'pursuit-pack',
            status: 'active',
            capabilities: ['Professional Services', 'Training', 'Research & Development'],
            certifications: ['WOSB', 'EDWOSB', 'GSA Schedule'],
            naicsCodes: ['541611', '541618'],
            location: 'Maryland',
            description: 'Management consulting and training services for federal agencies.',
          },
          {
            id: '4',
            userId: 'user4',
            companyName: 'BuildRight Construction',
            contactName: 'James Rodriguez',
            contactEmail: 'jrodriguez@buildright.com',
            contactPhone: '(512) 555-0404',
            tier: 'core-capture',
            status: 'active',
            capabilities: ['Construction', 'Engineering'],
            certifications: ['SDVOSB', 'DBE'],
            naicsCodes: ['236220', '237310'],
            location: 'Texas',
            website: 'https://buildright.com',
            description: 'Commercial and federal construction with a focus on sustainable building practices.',
          },
          {
            id: '5',
            userId: 'user5',
            companyName: 'HealthTech Innovations',
            contactName: 'Dr. Lisa Park',
            contactEmail: 'lpark@healthtechinno.com',
            tier: 'custom',
            status: 'active',
            capabilities: ['Healthcare', 'IT Services', 'Research & Development'],
            certifications: ['WOSB', 'MBE', 'ISO 9001'],
            naicsCodes: ['541714', '621999'],
            location: 'California',
            description: 'Healthcare technology solutions and medical device development for VA and DoD.',
          },
        ];
        setMembers(sampleMembers);
      } else {
        setMembers(membersData);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.companyName.toLowerCase().includes(query) ||
        m.contactName.toLowerCase().includes(query) ||
        m.capabilities.some(c => c.toLowerCase().includes(query)) ||
        m.certifications.some(c => c.toLowerCase().includes(query)) ||
        m.naicsCodes.some(n => n.includes(query))
      );
    }

    // Filter by tier
    if (tierFilter !== 'all') {
      filtered = filtered.filter(m => m.tier === tierFilter);
    }

    // Filter by capability
    if (capabilityFilter !== 'all') {
      filtered = filtered.filter(m => m.capabilities.includes(capabilityFilter));
    }

    // Filter by certification
    if (certificationFilter !== 'all') {
      filtered = filtered.filter(m => m.certifications.includes(certificationFilter));
    }

    setFilteredMembers(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Member Directory</h1>
          <p className="text-muted-foreground">
            Connect with consortium members and find teaming partners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {members.length} Active Members
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, name, capability, certification, or NAICS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {Object.entries(TIER_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Capability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Capabilities</SelectItem>
              {CAPABILITY_OPTIONS.map(cap => (
                <SelectItem key={cap} value={cap}>{cap}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={certificationFilter} onValueChange={setCertificationFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Certification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Certifications</SelectItem>
              {CERTIFICATION_OPTIONS.map(cert => (
                <SelectItem key={cert} value={cert}>{cert}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredMembers.length} of {members.length} members
      </div>

      {/* Member Cards */}
      {filteredMembers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No members found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => {
            const tierConfig = TIER_CONFIG[member.tier];
            const TierIcon = tierConfig.icon;

            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.logoUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className={tierConfig.color}>
                      <TierIcon className="h-3 w-3 mr-1" />
                      {tierConfig.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{member.companyName}</CardTitle>
                  <CardDescription>{member.contactName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {member.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {member.location}
                    </div>
                  )}

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1">
                    {member.certifications.slice(0, 3).map(cert => (
                      <Badge key={cert} variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                    {member.certifications.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.certifications.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {member.capabilities.slice(0, 2).map(cap => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {member.capabilities.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{member.capabilities.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Contact Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`mailto:${member.contactEmail}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </a>
                    </Button>
                    <Link href={`/portal/members/${member.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMembers.map(member => {
            const tierConfig = TIER_CONFIG[member.tier];
            const TierIcon = tierConfig.icon;

            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={member.logoUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {member.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{member.companyName}</h3>
                        <Badge className={tierConfig.color}>
                          <TierIcon className="h-3 w-3 mr-1" />
                          {tierConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.contactName}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {member.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {member.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {member.certifications.length} certifications
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                      {member.capabilities.slice(0, 3).map(cap => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${member.contactEmail}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      <Link href={`/portal/members/${member.id}`}>
                        <Button variant="default" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
