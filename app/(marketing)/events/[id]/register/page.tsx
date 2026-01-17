'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Ticket,
  CreditCard,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

interface Event {
  id: string;
  title: string;
  startDate: Timestamp;
  startTime: string;
  endDate: Timestamp;
  endTime: string;
  locationType: string;
  location: string;
  isTicketed: boolean;
  ticketTypes?: {
    name: string;
    price: number;
    description?: string;
  }[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventRegisterPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketParam = searchParams.get('ticket');

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    dietaryRestrictions: '',
    specialNeeds: '',
  });

  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<number>(0);

  async function fetchEvent() {
    if (!db || !id) return;

    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, id);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        setEvent({
          id: eventSnap.id,
          ...eventSnap.data()
        } as Event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const selectedTicket = event?.ticketTypes?.find(t => t.name === ticketParam);
  const ticketPrice = selectedTicket?.price || 0;
  const finalPrice = Math.max(0, ticketPrice - discount);

  useEffect(() => {
    if (event?.isTicketed && ticketPrice > 0) {
      // Set default partial amount to 50% or a minimum deposit
      setPartialAmount(Math.round(finalPrice / 2));
    }
  }, [finalPrice, event, ticketPrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const response = await fetch(`/api/promo-codes/validate?code=${promoCode}&eventId=${id}`);
      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discount);
        setPromoApplied(true);
      } else {
        alert(data.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      alert('Failed to validate promo code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          userName: formData.name,
          userEmail: formData.email,
          ticketType: ticketParam || 'General Admission',
          price: ticketPrice,
          promoCode: promoApplied ? promoCode : undefined,
          isPartial: isPartialPayment,
          paymentAmount: isPartialPayment ? partialAmount : finalPrice,
          eventDate: event?.startDate ? format(event.startDate.toDate(), "yyyy-MM-dd") : undefined,
          attendeeInfo: {
            company: formData.company,
            title: formData.title,
            phone: formData.phone,
            dietaryRestrictions: formData.dietaryRestrictions,
            specialNeeds: formData.specialNeeds,
          },
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else if (data.ticketId) {
        // Free registration - redirect to confirmation
        router.push(`/events/${id}/confirmation?ticket_id=${data.ticketId}`);
      } else {
        throw new Error(data.error || 'Failed to create ticket');
      }
    } catch (error: unknown) {
      console.error('Error registering:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete registration';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Link href="/events">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link href={`/events/${id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Event Registration
                </CardTitle>
                <CardDescription>
                  Complete the form below to register for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Personal Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="CEO, Manager, etc."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {event.isTicketed && ticketPrice > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base font-medium">Partial Payment</Label>
                            <p className="text-sm text-muted-foreground">
                              Pay a deposit now and the rest later
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant={isPartialPayment ? "default" : "outline"}
                            onClick={() => setIsPartialPayment(!isPartialPayment)}
                          >
                            {isPartialPayment ? "Enabled" : "Enable"}
                          </Button>
                        </div>

                        {isPartialPayment && (
                          <div className="space-y-2">
                            <Label htmlFor="partialAmount">Payment Amount ($)</Label>
                            <Input
                              id="partialAmount"
                              type="number"
                              min={1}
                              max={finalPrice / 100}
                              value={partialAmount / 100}
                              onChange={(e) => setPartialAmount(Math.round(parseFloat(e.target.value) * 100))}
                            />
                            <p className="text-xs text-muted-foreground">
                              Minimum payment: $1.00. Remaining balance will be tracked in your portal.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Additional Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                      <Input
                        id="dietaryRestrictions"
                        name="dietaryRestrictions"
                        value={formData.dietaryRestrictions}
                        onChange={handleInputChange}
                        placeholder="Vegetarian, Gluten-free, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialNeeds">Special Accommodations</Label>
                      <Input
                        id="specialNeeds"
                        name="specialNeeds"
                        value={formData.specialNeeds}
                        onChange={handleInputChange}
                        placeholder="Wheelchair access, etc."
                      />
                    </div>
                  </div>

                  {/* Promo Code */}
                  {event.isTicketed && ticketPrice > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-medium">Promo Code</h3>
                        <div className="flex gap-2">
                          <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Enter promo code"
                            disabled={promoApplied}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyPromo}
                            disabled={promoApplied || !promoCode.trim()}
                          >
                            {promoApplied ? 'Applied' : 'Apply'}
                          </Button>
                        </div>
                        {promoApplied && (
                          <p className="text-sm text-green-600">
                            Promo code applied! You save ${(discount / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : finalPrice > 0 ? (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ${(finalPrice / 100).toFixed(2)} & Register
                      </>
                    ) : (
                      'Complete Registration'
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
                {/* Event Info */}
                <div>
                  <h4 className="font-medium mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(event.startDate.toDate(), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.startTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ticket Details */}
                {selectedTicket && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{selectedTicket.name}</span>
                      <span>${(ticketPrice / 100).toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${(discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(finalPrice / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {!event.isTicketed && (
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-green-600">FREE</p>
                    <p className="text-sm text-muted-foreground">No payment required</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
