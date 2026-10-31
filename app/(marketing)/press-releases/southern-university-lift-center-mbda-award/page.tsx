"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  ArrowLeft,
  Share2,
  FileText,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const pressRelease = {
  title:
    "Southern University awarded $1.275 million to launch rural business center",
  subtitle:
    "MBDA cooperative agreement establishes the Louisiana Innovation for Thriving Rural Business (LIFT) Center",
  location: "BATON ROUGE, La.",
  releaseDate: new Date("2026-10-05"),
  category: "Award" as const,
  tags: [
    "LIFT Center",
    "MBDA",
    "Rural Business",
    "Federal Funding",
    "Advanced Manufacturing",
    "Louisiana",
  ],
  contactInfo: {
    name: "LIFT Center Communications",
    title: "Southern University College of Business",
    email: "liftcenter@sus.edu",
    phone: undefined as string | undefined,
  },
};

const bodyParagraphs = [
  "Southern University and A&M College has received a $1.275 million, three-year cooperative agreement from the Minority Business Development Agency (MBDA) to establish the Louisiana Innovation for Thriving Rural Business (LIFT) Center, an initiative designed to strengthen rural businesses, expand access to financing and government contracting opportunities, and increase advanced manufacturing capabilities across Louisiana.",
  "Housed in the College of Business, the LIFT Center will provide eligible rural Louisiana businesses with coordinated access to business assessments, consulting, training and specialized assistance. Southern is one of only three historically Black colleges and universities in the country selected by MBDA to lead a Rural Business Center focused on advancing rural and manufacturing-based small businesses.",
  "The center will bring together expertise from the Southern University Law Center, the College of Sciences and Engineering, and Southern's Advanced Metal Additive Manufacturing Laboratory. Through this collaboration, business owners will have access to resources designed to strengthen their operations, prepare for financing, pursue government contracting opportunities and expand their capacity to compete in advanced manufacturing industries.",
  "A signature hands-on manufacturing program will give entrepreneurs opportunities to explore businesses focused on making, repairing and testing metal parts for agriculture, energy and defense supply chains. Participants will pair advanced manufacturing expertise with business training to help transform technical skills into viable and sustainable enterprises.",
  "KDM & Associates LLC will lead program management and provide consulting in cybersecurity certification readiness, federal contracting, supplier development and manufacturing. Through the LIFT Center, Southern and its partners will work to expand the pool of contract-ready small and emerging businesses positioned to pursue opportunities with federal agencies, including the Small Business Administration, Department of War, Department of Energy, Department of Commerce, NASA, U.S. Department of Agriculture, U.S. Department of Education, Department of Housing and Urban Development, Department of the Interior and Department of Transportation.",
  "KDM's digital platform also will provide virtual training, connect businesses with prospective partners and help monitor participant progress.",
  "Over the three-year award period, the LIFT Center aims to serve 500 clients, help 50 new businesses enter the federal supply chain, assist clients in securing $2.125 million in capital and support the creation of 600 jobs.",
  "The center will serve eligible rural Louisiana businesses through business assistance, entrepreneurial development and workforce training. These services are designed to expand access to markets, strengthen business capacity and support the long-term growth of Louisiana's rural economy beyond the award period.",
  "Patrick Mensah, Formosa Endowed Professor of Mechanical Engineering and senior associate vice chancellor for academic affairs, will serve as principal investigator. Donald Andrews, professor and dean of the College of Business, will serve as co-principal investigator. Aloyce R. Kaliba, of the College of Business, will serve as project director, and Keith Moore of KDM & Associates will serve as collaborating program manager.",
];

const goalStats = [
  { value: "500", label: "clients served" },
  { value: "50", label: "new businesses entering the federal supply chain" },
  { value: "$2.125M", label: "in capital secured by clients" },
  { value: "600", label: "jobs created" },
];

export default function LiftAwardPressReleasePage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `${pressRelease.title}

${pressRelease.location}, ${format(
      pressRelease.releaseDate,
      "MMMM d, yyyy"
    )} — ${bodyParagraphs.join("\n\n")}

Media Contact:

${pressRelease.contactInfo.name}
${pressRelease.contactInfo.title}
${pressRelease.contactInfo.email}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(pressRelease.title);
    const body = encodeURIComponent(
      `I thought you might be interested in this press release from the Southern University LIFT Center:\n\n${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <Link
              href="/press-releases"
              className="flex items-center text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Press Releases
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="secondary" size="sm" onClick={shareViaEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Information */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span>{pressRelease.location}</span>
            <span>•</span>
            <Calendar className="h-4 w-4" />
            <span>{format(pressRelease.releaseDate, "MMMM d, yyyy")}</span>
          </div>

          <Badge variant="secondary" className="mb-4">
            {pressRelease.category}
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {pressRelease.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {pressRelease.subtitle}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {pressRelease.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Press Release Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <p className="lead text-lg font-medium mb-6">
                {bodyParagraphs[0]}
              </p>

              {bodyParagraphs.slice(1, 4).map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-6">
                  {paragraph}
                </p>
              ))}

              {/* Program goals */}
              <div className="my-8 grid grid-cols-2 gap-6 rounded-lg border bg-muted/40 p-6 sm:grid-cols-4">
                {goalStats.map((goal) => (
                  <div key={goal.label}>
                    <div className="text-2xl font-bold text-primary">
                      {goal.value}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {goal.label}
                    </p>
                  </div>
                ))}
              </div>

              {bodyParagraphs.slice(4).map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-6">
                  {paragraph}
                </p>
              ))}

              <Separator className="my-8" />

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    About the Southern University LIFT Center
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The Louisiana Innovation for Thriving Rural Business (LIFT)
                    Center at Southern University and A&amp;M College is an
                    MBDA-funded Rural Business Center serving eligible rural
                    Louisiana businesses with business assistance,
                    entrepreneurial development, and workforce training.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    About the Minority Business Development Agency
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The U.S. Department of Commerce&apos;s Minority Business
                    Development Agency (MBDA) is the only federal agency solely
                    dedicated to the growth and global competitiveness of
                    minority business enterprises.
                  </p>
                </div>
              </div>

              <Separator className="my-8" />

              <div>
                <h3 className="text-xl font-bold mb-4">Media Contact</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold">{pressRelease.contactInfo.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pressRelease.contactInfo.title}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    <a
                      href={`mailto:${pressRelease.contactInfo.email}`}
                      className="flex items-center text-primary hover:underline"
                    >
                      <Mail className="mr-1 h-3 w-3" />
                      {pressRelease.contactInfo.email}
                    </a>
                    {pressRelease.contactInfo.phone && (
                      <a
                        href={`tel:${pressRelease.contactInfo.phone}`}
                        className="flex items-center text-primary hover:underline"
                      >
                        <Phone className="mr-1 h-3 w-3" />
                        {pressRelease.contactInfo.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={copyToClipboard} className="flex-1 sm:flex-none">
            {copied ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Copy Press Release
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={shareViaEmail}
            className="flex-1 sm:flex-none"
          >
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </Button>
        </div>
      </div>
    </div>
  );
}
