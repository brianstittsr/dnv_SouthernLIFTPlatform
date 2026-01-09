'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Check, 
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const TIER_INFO = {
  'core-capture': {
    name: 'Core Capture Member',
    monthlyPrice: 175000,
    annualPrice: 1890000,
    features: [
      'Curated opportunity intelligence',
      'Best-fit team assembly access',
      'Proposal orchestration support',
      'Monthly buyer briefings',
      'Resource library access',
    ],
  },
  'pursuit-pack': {
    name: 'Pursuit Pack',
    monthlyPrice: 50000,
    annualPrice: null,
    features: [
      'Single pursuit access',
      'Team assembly for one opportunity',
      'Proposal workspace access',
      'Basic resource library',
    ],
  },
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier') || 'core-capture';
  const billing = searchParams.get('billing') || 'monthly';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    title: '',
    agreeToTerms: false,
  });

  const tierInfo = TIER_INFO[tier as keyof typeof TIER_INFO] || TIER_INFO['core-capture'];
  const price = billing === 'annual' && tierInfo.annualPrice 
    ? tierInfo.annualPrice 
    : tierInfo.monthlyPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '', // Will be created or linked
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          tier,
          billingCycle: billing,
          trialDays: 14, // 14-day trial
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create membership');
      }
    } catch (error: any) {
      console.error('Error creating membership:', error);
      alert(error.message || 'Failed to process signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link href="/membership" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Membership Options
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Signup Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Signup</CardTitle>
                <CardDescription>
                  Enter your information to start your membership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="john@company.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 123-4567"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Information
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder="Acme Corporation"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Your Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="CEO, President, etc."
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Terms */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the terms and conditions
                      </label>
                      <p className="text-sm text-muted-foreground">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{tierInfo.name}</h4>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {billing} billing
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  {tierInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>14-day free trial</span>
                    <span>-{formatPrice(price)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Due today</span>
                    <span>$0.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You won't be charged until your trial ends. Cancel anytime.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                Secure payment via Stripe
              </p>
              <p className="mt-2">
                256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembershipSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
