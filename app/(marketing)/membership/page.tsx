'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Calendar,
  FileText,
  Target,
  Building2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MEMBERSHIP_TIERS = [
  {
    id: 'core-capture',
    name: 'Core Capture Member',
    description: 'Full access to the KDM Consortium platform and all member benefits',
    monthlyPrice: 1750,
    annualPrice: 18900, // ~10% discount
    popular: true,
    features: [
      'Curated opportunity intelligence',
      'Best-fit team assembly access',
      'Proposal orchestration support',
      'Monthly buyer briefings',
      'Resource library access',
      'Member directory listing',
      'Compliance badge display',
      '2 hours concierge support/month',
      'Priority pursuit notifications',
      'Team workspace access',
    ],
    icon: Star,
  },
  {
    id: 'pursuit-pack',
    name: 'Pursuit Pack',
    description: 'Pay-per-pursuit option for occasional teaming opportunities',
    monthlyPrice: 500,
    annualPrice: null, // One-time per pursuit
    popular: false,
    features: [
      'Single pursuit access',
      'Team assembly for one opportunity',
      'Proposal workspace access',
      'Basic resource library',
      'Pursuit-specific briefings',
      'Valid for 90 days',
    ],
    icon: Target,
    isOneTime: true,
  },
  {
    id: 'custom',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations with specific needs',
    monthlyPrice: null,
    annualPrice: null,
    popular: false,
    features: [
      'Everything in Core Capture',
      'Unlimited concierge hours',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Priority support SLA',
      'Custom reporting',
      'Multi-user accounts',
    ],
    icon: Building2,
    isCustom: true,
  },
];

const BENEFITS = [
  {
    icon: Target,
    title: 'Curated Opportunities',
    description: 'Access pre-vetted government contracting opportunities matched to your capabilities.',
  },
  {
    icon: Users,
    title: 'Team Assembly',
    description: 'Connect with complementary contractors to form winning pursuit teams.',
  },
  {
    icon: FileText,
    title: 'Proposal Support',
    description: 'Leverage shared resources and templates to accelerate proposal development.',
  },
  {
    icon: Calendar,
    title: 'Buyer Briefings',
    description: 'Exclusive access to monthly briefings with government decision-makers.',
  },
  {
    icon: Shield,
    title: 'Compliance Support',
    description: 'Maintain and display your certifications and compliance credentials.',
  },
  {
    icon: Zap,
    title: 'Fast Track',
    description: 'Priority notifications and early access to high-value opportunities.',
  },
];

export default function MembershipPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tierId: string) => {
    if (tierId === 'custom') {
      router.push('/contact?subject=Enterprise%20Membership');
      return;
    }

    setLoading(tierId);

    try {
      // In production, this would check auth and redirect to checkout
      // For now, redirect to a signup flow
      router.push(`/membership/signup?tier=${tierId}&billing=${isAnnual ? 'annual' : 'monthly'}`);
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
            KDM Consortium
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Join the Consortium
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Access curated government contracting opportunities, connect with teaming partners, 
            and accelerate your path to winning federal contracts.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-semibold' : 'text-blue-200'}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={isAnnual ? 'font-semibold' : 'text-blue-200'}>
              Annual
              <Badge className="ml-2 bg-green-500 text-white">Save 10%</Badge>
            </Label>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {MEMBERSHIP_TIERS.map((tier) => {
              const TierIcon = tier.icon;
              const price = isAnnual && tier.annualPrice ? tier.annualPrice : tier.monthlyPrice;
              
              return (
                <Card 
                  key={tier.id} 
                  className={`relative flex flex-col ${
                    tier.popular 
                      ? 'border-2 border-primary shadow-xl scale-105' 
                      : 'border border-gray-200'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                      <TierIcon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="min-h-[48px]">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="text-center mb-6">
                      {tier.isCustom ? (
                        <div className="text-3xl font-bold">Custom Pricing</div>
                      ) : tier.isOneTime ? (
                        <>
                          <div className="text-4xl font-bold">{formatPrice(tier.monthlyPrice!)}</div>
                          <div className="text-muted-foreground">per pursuit</div>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold">
                            {formatPrice(price!)}
                          </div>
                          <div className="text-muted-foreground">
                            {isAnnual ? '/year' : '/month'}
                          </div>
                          {isAnnual && tier.annualPrice && (
                            <div className="text-sm text-green-600 mt-1">
                              Save {formatPrice((tier.monthlyPrice! * 12) - tier.annualPrice)} annually
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(tier.id)}
                      disabled={loading === tier.id}
                    >
                      {loading === tier.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : tier.isCustom ? (
                        'Contact Sales'
                      ) : (
                        <>
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join the Consortium?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The KDM Consortium provides everything you need to compete and win in the government contracting space.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                    <BenefitIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">What is included in the Core Capture membership?</h3>
              <p className="text-muted-foreground">
                Core Capture members get full access to our opportunity intelligence platform, 
                team assembly tools, proposal support resources, monthly buyer briefings, 
                and 2 hours of concierge support per month.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Can I cancel my membership anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your membership at any time. Monthly memberships will remain 
                active until the end of the current billing period. Annual memberships are 
                non-refundable but will remain active until the end of the year.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">What is a Pursuit Pack?</h3>
              <p className="text-muted-foreground">
                A Pursuit Pack is a one-time purchase that gives you access to team assembly 
                and proposal support for a single government contracting opportunity. 
                It's perfect for contractors who want to try the platform or only pursue 
                occasional opportunities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">How do buyer briefings work?</h3>
              <p className="text-muted-foreground">
                Each month, we host exclusive briefings with government buyers and decision-makers. 
                These sessions provide insights into upcoming opportunities, procurement priorities, 
                and direct networking with agency representatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Win More Contracts?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the KDM Consortium today and start accessing curated opportunities, 
            building winning teams, and growing your government contracting business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => handleSelectPlan('core-capture')}
            >
              Start Your Membership
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
