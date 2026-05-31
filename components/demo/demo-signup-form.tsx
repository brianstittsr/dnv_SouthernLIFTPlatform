"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Users,
  Building2,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export function DemoSignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          planId: 'demo-consortium'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create demo account');
      }

      const data = await response.json();
      
      toast.success('Demo account created successfully! Check your email for login instructions.');
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push('/login?demo=true');
      }, 2000);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create demo account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            KDM Consortium Demo Registration
          </h1>
          <p className="text-xl text-slate-600">
            Experience the complete government contracting platform - No credit card required
          </p>
          <Badge className="mt-2 bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            Demo Mode - Free Trial
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Full Platform Access</h4>
                    <p className="text-sm text-slate-600">
                      Complete access to all KDM Consortium features and tools
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">AI-Powered Matching</h4>
                    <p className="text-sm text-slate-600">
                      Get matched with real government opportunities based on your profile
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Teaming Partner Recommendations</h4>
                    <p className="text-sm text-slate-600">
                      Find complementary partners for complex government contracts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">AI Proposal Generation</h4>
                    <p className="text-sm text-slate-600">
                      Transform RFP documents into professional proposals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Demo Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Opportunity Matching</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Business Profile Builder</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Teaming Recommendations</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Document Processing</span>
                  <Badge variant="secondary">Simulated</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Proposal Generation</span>
                  <Badge variant="secondary">Simulated</Badge>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Demo accounts are valid for 30 days with full access to platform features. 
                No actual charges will be made.
              </AlertDescription>
            </Alert>
          </div>

          {/* Signup Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Create Demo Account
                </CardTitle>
                <CardDescription>
                  Join the KDM Consortium demo to explore the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your-email@company.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Minimum 8 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                    />
                  </div>

                  <Separator />

                  {/* Demo Payment Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-slate-600" />
                      <h4 className="font-semibold text-sm">Demo Payment Information</h4>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>KDM Consortium Membership</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>$0.00</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Demo Mode
                      </Badge>
                      <span className="text-xs text-slate-500">
                        No actual charges - fake payment processing
                      </span>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is a demo account. You'll receive a temporary password via email 
                      to complete your registration.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !formData.email || !formData.password}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Demo Account...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2" />
                        Create Demo Account
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Demo Benefits */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">After Registration:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Check email for temporary password</li>
                  <li>• Complete business profile wizard</li>
                  <li>• Receive AI-matched opportunities</li>
                  <li>• Explore teaming recommendations</li>
                  <li>• Test proposal generation workflow</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
