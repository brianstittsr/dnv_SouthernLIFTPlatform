import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Privacy Policy | KDM & Associates",
  description:
    "Read KDM & Associates' privacy policy to understand how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
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
              Privacy <span className="text-primary">Policy</span>
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
            <h2>1. Introduction</h2>
            <p>
              KDM & Associates ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the site includes:</p>
            
            <h3>Personal Data</h3>
            <ul>
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Company name and title</li>
              <li>Business address</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Any other information you voluntarily provide</li>
            </ul>

            <h3>Automatic Data Collection</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
              <li>Device identifiers</li>
            </ul>

            <h2>3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:</p>
            <ul>
              <li>Generate invoices and send billing information</li>
              <li>Fulfill and manage your requests for our services</li>
              <li>Email regarding your account or order</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to our services</li>
              <li>Improve our website and services</li>
              <li>Monitor and analyze usage and trends to improve your experience with the site</li>
              <li>Notify you of updates to our services</li>
              <li>Offer new products, services, and/or recommendations to you</li>
            </ul>

            <h2>4. Disclosure of Your Information</h2>
            <p>We may share your information in the following situations:</p>
            <ul>
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information is necessary to comply with the law</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with vendors, consultants, and service providers who assist us in operating our website and conducting our business</li>
              <li><strong>Business Transfers:</strong> Your information may be transferred as part of a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> We may disclose your information with your explicit consent for any purpose</li>
            </ul>

            <h2>5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>

            <h2>6. Contact Information</h2>
            <p>
              If you have privacy-related questions, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@kdm-assoc.com</li>
              <li>Phone: (202) 469-3423</li>
              <li>Address: 300 New Jersey Avenue NW, Washington, DC 20001</li>
            </ul>

            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              Our website may use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser. However, disabling cookies may affect the functionality of our website.
            </p>

            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete such information and terminate the child's account.
            </p>

            <h2>10. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>The right to opt-out of marketing communications</li>
              <li>The right to data portability</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided below.
            </p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by updating the "Last updated" date of this Privacy Policy. Your continued use of our website following the posting of revised Privacy Policy means that you accept and agree to the changes.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@kdm-assoc.com</li>
              <li>Phone: (202) 469-3423</li>
              <li>Address: 300 New Jersey Avenue NW, Washington, DC 20001</li>
            </ul>

            <h2>13. California Privacy Rights</h2>
            <p>
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA). You have the right to know what personal information is collected, used, shared, or sold. You also have the right to delete personal information collected from you and to opt-out of the sale or sharing of your personal information. To exercise these rights, please contact us using the information provided above.
            </p>

            <h2>14. GDPR Compliance</h2>
            <p>
              If you are located in the European Union, we comply with the General Data Protection Regulation (GDPR). We only process your personal data with your consent or as necessary to fulfill our contractual obligations. You have the right to access, rectify, erase, or restrict the processing of your personal data. To exercise these rights, please contact us.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
