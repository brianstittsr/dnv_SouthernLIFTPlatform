import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about KDM & Associates services, government contracting, and how we help MBEs win federal contracts.",
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "What is KDM & Associates?",
        answer: "KDM & Associates, LLC is a business development, government affairs, and public relations firm focused on helping clients navigate the government procurement process and win government contracts. We are renowned for providing strategic teaming and building capacity for small and mid-sized businesses."
      },
      {
        question: "Who can benefit from KDM services?",
        answer: "Our services are designed for small, emerging, and Minority Business Enterprises (MBEs) looking to enter or expand in the federal contracting space. This includes 8(a) certified businesses, WOSBs, SDVOSBs, HUBZone firms, and other small businesses seeking government contracts."
      },
      {
        question: "How do I become a KDM & Associates client?",
        answer: "Getting started is easy. Simply schedule an MBE introductory session through our contact page. During this session, we'll discuss your business goals, current capabilities, and how our services can help you succeed in government contracting."
      }
    ]
  },
  {
    category: "Services & Programs",
    questions: [
      {
        question: "What services does KDM offer?",
        answer: "We offer a comprehensive range of services including: Digital Solutions (websites, digital ecosystems, e-commerce), Technology Solutions (blockchain, CRM & AI, cybersecurity), Grants & RFPs (proposal management, grant writing), Marketing Solutions, Operations/Performance consulting, and Contracting Vehicles guidance (certifications, mentor-protégé programs, SBA programs)."
      },
      {
        question: "What is the MBDA Federal Procurement Center?",
        answer: "The MBDA Federal Procurement Center (FPC) has transitioned its operations to KDM & Associates. This center provides Government contracting support services with a focus on empowering MBEs through intense capacity building, mentorship, and defined support services to achieve sustainable success."
      },
      {
        question: "How can KDM help with certifications?",
        answer: "We provide guidance on obtaining various certifications including 8(a), WOSB (Women-Owned Small Business), SDVOSB (Service-Disabled Veteran-Owned Small Business), HUBZone, and other relevant certifications. We help you understand the requirements and navigate the application process."
      }
    ]
  },
  {
    category: "Government Contracting",
    questions: [
      {
        question: "How does KDM help with federal contract opportunities?",
        answer: "We help identify federal contract opportunities that match your capabilities, provide advice on bidding set-aside contracts, facilitate introductions to Government & Military contracting officers, and help put together strategic teaming partnerships with larger Prime contractors and other MBE clients."
      },
      {
        question: "What is strategic teaming and why is it important?",
        answer: "Strategic teaming involves partnering with other businesses to pursue government contracts together. This can include mentor-protégé relationships, joint ventures, and subcontracting arrangements. Teaming allows smaller businesses to compete for larger contracts by combining capabilities and past performance."
      },
      {
        question: "Can KDM help with proposal writing?",
        answer: "Yes, we offer comprehensive proposal support including Quick Bid/No Bid assessments, end-to-end proposal management, and professional proposal and grant writing services. Our team helps you develop competitive proposals that meet all requirements and highlight your strengths."
      }
    ]
  },
  {
    category: "QmeLocal Platform",
    questions: [
      {
        question: "How do I get QmeLocal for my community?",
        answer: "Engage us by reaching out through our contact information and we will work with your community stakeholders to create a community portal that is customized for your target community."
      },
      {
        question: "Why do community stakeholders need a community portal?",
        answer: "Our desire is to work with community stakeholders that are prepared to make a commitment to support their community through the community portal and the programs that Qme incorporates. Community stakeholders will be responsible for advising content, providing relevant information, and working with Qme to bring in individuals and organizations that are part of the community."
      },
      {
        question: "What is the difference between QmeLocal and a community portal?",
        answer: "Community portals are powered by QmeLocal. Think of QmeLocal as the foundation or central hub that connects all community portals to itself and to each other. When you access a community portal, you are accessing a specifically curated community environment that is powered by QmeLocal."
      },
      {
        question: "What support does Qme provide for community portals?",
        answer: "When you hire us, we work with your community to develop the entire solution. Qme handles all behind-the-scenes work including build design, management, implementation, connection of resources, and deployment. We also provide marketing, launch communications, content production, and year-one member onboarding, system maintenance, and hosting."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              FAQ
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Frequently Asked{" "}
              <span className="text-primary">Questions</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about KDM & Associates, our services, 
              and how we help MBEs succeed in government contracting.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={category.category} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${categoryIndex}-${index}`}
                      className="border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our team is here to help. Schedule an MBE introductory session to discuss 
            your specific needs and how we can support your government contracting goals.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/contact">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
