"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Users, Target, Handshake, TrendingUp } from "lucide-react";

export default function MemberGuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/consortium/onboarding">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Onboarding
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Consortium Member Guide</h1>
        <p className="text-muted-foreground mt-2">
          Your comprehensive guide to getting started with the KDM Consortium
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            What is the KDM Consortium?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The KDM Consortium is a curated network of businesses, primes, and government buyers
            working together to compete effectively for federal contracts. Members gain access to AI-powered matching,
            shared opportunities, teaming partnerships, and readiness support.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />
              1. Join
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete your membership registration and verify your business email. Once approved,
              you&apos;ll receive access to the member portal.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              2. Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add your company information, NAICS codes, certifications, capabilities, and contract
              preferences. The more complete your profile, the better your matches.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Handshake className="h-5 w-5 text-primary" />
              3. Get Matched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our AI matching engine recommends teaming partners, prime contractors, and relevant
              opportunities based on your profile and goals.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              4. Win Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Engage with opportunities, submit proposals, and collaborate with consortium members
              to pursue and compete effectively for federal contracts.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions or need support during onboarding, reach out to the KDM team.
          </p>
          <Button variant="outline" asChild>
            <Link href="/portal/support">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
