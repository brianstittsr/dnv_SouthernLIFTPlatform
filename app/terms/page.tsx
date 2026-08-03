import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | KDM & Associates",
  description: "Terms of Service for KDM & Associates platform and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: December 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the KDM & Associates (&quot;KDM&quot;) platform and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p>
              KDM provides manufacturing transformation services, consulting, and a digital platform designed to help U.S. manufacturers modernize operations, achieve certifications, and connect with OEM opportunities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the platform&apos;s operation</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the KDM platform are owned by KDM & Associates and are protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>
              KDM shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Handling &amp; Prohibited Uploads</h2>
            <p className="mb-4">
              The KDM platform is not authorized to store, process, or transmit classified information, Controlled Unclassified Information (CUI), export-controlled technical data, source-selection information, or procurement-sensitive information. By using the platform, you agree that you will not upload any of the following:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Classified information of any kind</li>
              <li>Controlled Unclassified Information (CUI)</li>
              <li>Export-controlled technical data subject to ITAR or EAR</li>
              <li>Source-selection information or non-public procurement-sensitive information</li>
              <li>Proprietary proposal information belonging to other companies</li>
              <li>Any data requiring handling controls beyond the platform&apos;s security posture</li>
            </ul>
            <p className="mt-4">
              Users are solely responsible for ensuring all uploaded information is appropriately cleared for commercial-platform use. KDM reserves the right to remove any content that appears to violate these restrictions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              <strong>KDM & Associates</strong><br />
              Email: legal@kdm-assoc.com<br />
              Website: <Link href="https://www.kdm-assoc.com" className="text-primary hover:underline">kdm-assoc.com</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
