import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | KDM & Associates",
  description: "Privacy Policy for KDM & Associates platform and services.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: December 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              KDM & Associates (&quot;KDM&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and job title</li>
              <li><strong>Account Information:</strong> Login credentials and account preferences</li>
              <li><strong>Usage Data:</strong> Information about how you use our platform</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your requests and transactions</li>
              <li>Send you important updates and communications</li>
              <li>Improve our platform and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All form submissions on our website are transmitted using SSL (Secure Sockets Layer) encryption. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. SMS Text Messaging & Non-Sharing Disclosure</h2>
            <p className="mb-4">
              No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. Information sharing to subcontractors in support services, such as customer service, is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
            </p>
            <p className="mb-4">
              We use SMS text messages for appointment confirmations, reminders, and responses to service inquiries. Message frequency varies. Message and data rates may apply. By opting into our SMS services, you represent that you are at least 18 years of age.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Governance &amp; Prohibited Uploads</h2>
            <p className="mb-4">
              The KDM platform is a private-sector commercial platform and is not authorized to store, process, or transmit classified information, Controlled Unclassified Information (CUI), export-controlled technical data, source-selection information, or procurement-sensitive information.
            </p>
            <p className="font-semibold mb-2">You must NOT upload any of the following to the platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Classified information of any kind (Confidential, Secret, Top Secret, or SAP/SAR)</li>
              <li>Controlled Unclassified Information (CUI) including but not limited to CUI Basic, CUI Specified, and CUI Limited Dissemination</li>
              <li>Export-controlled technical data or defense articles subject to ITAR or EAR</li>
              <li>Source-selection information, including non-public evaluation data, source-selection plans, or proprietary proposal information belonging to other companies</li>
              <li>Procurement-sensitive information not publicly available, including pre-solicitation acquisition plans or internal agency budget data not publicly disclosed</li>
              <li>Personally Identifiable Information (PII) of third parties without proper authorization</li>
              <li>Any other data that requires handling controls exceeding the platform&apos;s security posture</li>
            </ul>
            <p className="mt-4">
              KDM does not assume liability for improper uploads by users. Users are responsible for ensuring that all information they upload is appropriately cleared for public or commercial-platform use. If you are uncertain whether information may be uploaded, do not upload it and contact KDM for guidance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy & COPPA Compliance</h2>
            <p>
              Our website and services are not directed to or intended for children under the age of 13. We do not knowingly collect personal information from children under 13 years of age in compliance with the Children&apos;s Online Privacy Protection Act (COPPA). If we become aware that a child under 13 has provided us with personal information, we will promptly delete such information and take appropriate steps to prevent future collection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>KDM & Associates</strong><br />
              Email: privacy@kdm-assoc.com<br />
              Phone: (202) 469-3423<br />
              Address: 300 New Jersey Avenue NW, Washington, DC 20001<br />
              Website: <Link href="https://www.kdm-assoc.com" className="text-primary hover:underline">kdm-assoc.com</Link>
            </p>
          </section>

          {/* Triple-Match Contact Footer */}
          <div className="mt-12 pt-8 border-t border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Legal Business Name:</strong> KDM &amp; Associates</li>
              <li><strong>EIN:</strong> [INSERT EIN]</li>
              <li><strong>Registered Address:</strong> 300 New Jersey Avenue NW, Washington, DC 20001</li>
              <li><strong>Business Phone (SMS Campaign Number):</strong> (202) 469-3423</li>
              <li><strong>Support Email:</strong> privacy@kdm-assoc.com</li>
              <li><strong>Website URL:</strong> https://www.kdm-assoc.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
