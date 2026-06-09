"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Handshake,
  Building2,
  MapPin,
  Award,
  Users,
  Plus,
} from "lucide-react";
import { CreateTeamingRequestModal } from "@/components/teaming/create-teaming-request-modal";

// Mock teaming partners data
const MOCK_PARTNERS = [
  {
    id: "1",
    name: "Acme Manufacturing",
    company: "Acme Manufacturing Inc.",
    location: "Dayton, OH",
    capabilities: ["CNC Machining", "Titanium Processing"],
    certifications: ["CMMC", "SDVOSB"],
    naicsCodes: ["332710", "336411"],
    avatar: "",
  },
  {
    id: "2",
    name: "Tech Solutions LLC",
    company: "Tech Solutions LLC",
    location: "Arlington, VA",
    capabilities: ["Software Development", "AI/ML"],
    certifications: ["8(a)", "HUBZone"],
    naicsCodes: ["541511", "541512"],
    avatar: "",
  },
  {
    id: "3",
    name: "Prime Defense Systems",
    company: "Prime Defense Systems",
    location: "San Diego, CA",
    capabilities: ["Aerospace", "Electronics"],
    certifications: ["CMMC", "WOSB"],
    naicsCodes: ["336411", "336413"],
    avatar: "",
  },
];

export default function TeamingPage() {
  const { profile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertification, setSelectedCertification] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPartners = MOCK_PARTNERS.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.capabilities.some((cap) =>
        cap.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCertification =
      selectedCertification === "all" ||
      partner.certifications.includes(selectedCertification);

    const matchesLocation =
      selectedLocation === "all" ||
      partner.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCertification && matchesLocation;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teaming Partners</h1>
          <p className="text-muted-foreground mt-1">
            Find and connect with qualified partners for government contracts
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Teaming Request
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners by name, company, or capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCertification} onValueChange={setSelectedCertification}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Certifications</SelectItem>
                <SelectItem value="CMMC">CMMC</SelectItem>
                <SelectItem value="8(a)">8(a)</SelectItem>
                <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                <SelectItem value="WOSB">WOSB</SelectItem>
                <SelectItem value="HUBZone">HUBZone</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="dayton">Dayton, OH</SelectItem>
                <SelectItem value="arlington">Arlington, VA</SelectItem>
                <SelectItem value="san diego">San Diego, CA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partners Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={partner.avatar} />
                  <AvatarFallback>
                    {partner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3" />
                    {partner.company}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {partner.location}
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Capabilities</div>
                <div className="flex flex-wrap gap-1">
                  {partner.capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Certifications</div>
                <div className="flex flex-wrap gap-1">
                  {partner.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">NAICS Codes</div>
                <div className="flex flex-wrap gap-1">
                  {partner.naicsCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Handshake className="h-4 w-4 mr-2" />
                Request Partnership
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No partners found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more teaming partners.
            </p>
          </CardContent>
        </Card>
      )}

      <CreateTeamingRequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        opportunity={{
          id: "mock-opp-1",
          title: "Defense Manufacturing Contract",
          agency: "Department of Defense",
          description: "Manufacturing of precision components for defense applications",
          naicsCodes: ["332710", "336411"],
          estimatedValue: 2500000,
          dueDate: new Date("2024-12-31"),
          requiredCapabilities: ["CNC Machining", "Quality Control", "ISO 9001"],
          requiredCompliance: ["CMMC Level 2", "ITAR"],
        }}
        targetCompany={{
          id: "1",
          name: "Acme Manufacturing",
          capabilities: ["CNC Machining", "Titanium Processing"],
          certifications: ["CMMC", "SDVOSB"],
        }}
        currentUserCompany={{
          id: "my-company",
          name: "My Company",
          capabilities: ["Quality Control", "ISO 9001"],
          certifications: ["CMMC Level 2"],
        }}
      />
    </div>
  );
}
