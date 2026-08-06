import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms of Service | KDM & Associates",
  description:
    "Read the terms of service for KDM & Associates. Learn about our policies and conditions for using our services.",
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Legal
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Last updated: March 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using the KDM & Associates website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on KDM & Associates' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Using the materials for any unlawful purpose or in violation of any applicable laws or regulations</li>
            </ul>

            <h2>3. Disclaimer</h2>
            <p>
              The materials on KDM & Associates' website are provided on an 'as is' basis. KDM & Associates makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2>4. Limitations</h2>
            <p>
              In no event shall KDM & Associates or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on KDM & Associates' website, even if KDM & Associates or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on KDM & Associates' website could include technical, typographical, or photographic errors. KDM & Associates does not warrant that any of the materials on its website are accurate, complete, or current. KDM & Associates may make changes to the materials contained on its website at any time without notice.
            </p>

            <h2>6. Materials and Links</h2>
            <p>
              KDM & Associates has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by KDM & Associates of the site. Use of any such linked website is at the user's own risk.
            </p>

            <h2>7. Modifications</h2>
            <p>
              KDM & Associates may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2>8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the District of Columbia, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2>9. Service Engagement Terms</h2>
            <p>
              When engaging KDM & Associates for consulting services, the following additional terms apply:
            </p>
            <ul>
              <li>Services are provided on a time and materials or fixed-fee basis as agreed in writing</li>
              <li>Payment terms are net 30 days unless otherwise specified in the engagement letter</li>
              <li>Clients are responsible for providing accurate information and timely feedback</li>
              <li>KDM & Associates retains all intellectual property rights to methodologies and frameworks developed</li>
              <li>Client-specific deliverables are owned by the client upon full payment</li>
            </ul>

            <h2>10. Confidentiality</h2>
            <p>
              Both parties agree to maintain the confidentiality of proprietary information shared during the engagement. This includes business strategies, financial information, and other sensitive data. Confidentiality obligations survive the termination of the engagement for a period of three (3) years.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              Except as otherwise provided in this agreement, neither party shall be liable to the other for any indirect, incidental, special, consequential, or punitive damages, including lost profits, even if advised of the possibility of such damages.
            </p>

            <h2>12. Termination</h2>
            <p>
              Either party may terminate an engagement with thirty (30) days written notice. Upon termination, the client shall pay for all services rendered through the termination date.
            </p>

            <h2>13. SMS Text Messaging Program</h2>
            <p>
              KDM & Associates operates an SMS text messaging program designed to ensure optimal customer support and respond to service-related inquiries. By opting into our SMS program, you agree to receive the following types of messages:
            </p>
            <ul>
              <li>Service updates and appointment confirmations</li>
              <li>Appointment reminders</li>
              <li>Responses to your service inquiries</li>
              <li>Marketing promotions (only if you provide secondary consent via a separate opt-in)</li>
            </ul>

            <h3>Opt-Out</h3>
            <p>
              You can cancel the SMS service at any time. Just text &quot;STOP&quot; to (202) 469-3423. After you send the SMS message &quot;STOP&quot; to us, we will send you an SMS message to confirm that you have been unsubscribed.
            </p>

            <h3>Support</h3>
            <p>
              If you are experiencing issues with the messaging program, you can reply with the keyword HELP for more assistance.
            </p>

            <h3>Cost & Frequency</h3>
            <p>
              Message and data rates may apply. Message frequency varies based on your interactions with our service.
            </p>

            <h3>Carrier Liability</h3>
            <p>
              Carriers are not liable for delayed or undelivered messages.
            </p>

            <h3>Age Restriction</h3>
            <p>
              By using this service, you represent and warrant that you are at least 18 years of age. If you are under 18 years old, you may not use or access our services or opt into our messaging program.
            </p>

            <h2>14. Privacy Policy</h2>
            <p>
              Our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> describes how we collect, use, and protect your personal information. By using our services, you consent to the data practices described in our Privacy Policy.
            </p>

            <h2>15. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@kdm-assoc.com</li>
              <li>Phone: (202) 469-3423</li>
              <li>Address: 300 New Jersey Avenue NW, Washington, DC 20001</li>
            </ul>

            {/* Triple-Match Contact Footer */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <h2>Business Information</h2>
              <ul>
                <li><strong>Legal Business Name:</strong> KDM &amp; Associates</li>
                <li><strong>EIN:</strong> [INSERT EIN]</li>
                <li><strong>Registered Address:</strong> 300 New Jersey Avenue NW, Washington, DC 20001</li>
                <li><strong>Business Phone (SMS Campaign Number):</strong> (202) 469-3423</li>
                <li><strong>Support Email:</strong> legal@kdm-assoc.com</li>
                <li><strong>Website URL:</strong> https://www.kdm-assoc.com</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
