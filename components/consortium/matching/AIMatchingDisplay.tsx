"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Users,
  Handshake,
  Target,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Star,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapabilityMatch, TeamingMatch } from "@/lib/consortium-schema";

interface AIMatchingDisplayProps {
  opportunityMatches?: CapabilityMatch[];
  teamingMatches?: TeamingMatch[];
  onContactPartner?: (partnerId: string) => void;
  onViewProfile?: (partnerId: string) => void;
  loading?: boolean;
}

export function AIMatchingDisplay({
  opportunityMatches = [],
  teamingMatches = [],
  onContactPartner,
  onViewProfile,
  loading = false,
}: AIMatchingDisplayProps) {
  const [selectedTab, setSelectedTab] = useState("opportunities");
  const [filterThreshold, setFilterThreshold] = useState(50);

  const filteredOpportunityMatches = opportunityMatches.filter(
    (m) => m.matchScore >= filterThreshold
  );
  const filteredTeamingMatches = teamingMatches.filter(
    (m) => m.matchScore >= filterThreshold
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI-Powered Matching</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              <span>Min Score:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="font-medium">{filterThreshold}%</span>
            </div>
          </div>
        </div>
        <CardDescription>
          AI-generated recommendations for opportunities and teaming partners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Opportunity Matches
              <Badge variant="secondary">{filteredOpportunityMatches.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="teaming" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teaming Partners
              <Badge variant="secondary">{filteredTeamingMatches.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading opportunity matches...
              </div>
            ) : filteredOpportunityMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No opportunity matches found</p>
                <p className="text-sm">Try lowering the minimum score threshold</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredOpportunityMatches.map((match, index) => (
                    <OpportunityMatchCard
                      key={index}
                      match={match}
                      onContact={onContactPartner}
                      onViewProfile={onViewProfile}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="teaming" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading teaming matches...
              </div>
            ) : filteredTeamingMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No teaming partners found</p>
                <p className="text-sm">Try lowering the minimum score threshold</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredTeamingMatches.map((match, index) => (
                    <TeamingMatchCard
                      key={index}
                      match={match}
                      onContact={onContactPartner}
                      onViewProfile={onViewProfile}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface OpportunityMatchCardProps {
  match: CapabilityMatch;
  onContact?: (partnerId: string) => void;
  onViewProfile?: (partnerId: string) => void;
}

function OpportunityMatchCard({ match, onContact, onViewProfile }: OpportunityMatchCardProps) {
  const scoreColor = getScoreColor(match.matchScore);
  const confidenceColor = getScoreColor(match.confidence);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: scoreColor }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn(scoreColor, "text-white")}>
                {match.matchScore}% Match
              </Badge>
              <Badge variant="outline" className={cn(confidenceColor, "text-white")}>
                {match.confidence}% Confidence
              </Badge>
            </div>
            <h4 className="font-semibold">{match.opportunityId || "Opportunity"}</h4>
          </div>
          <div className="flex gap-2">
            {onViewProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(match.partnerId)}
              >
                View Profile
              </Button>
            )}
            {onContact && (
              <Button
                size="sm"
                onClick={() => onContact(match.partnerId)}
              >
                Contact
              </Button>
            )}
          </div>
        </div>

        {match.matchReasons.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Match Reasons
            </h5>
            <div className="flex flex-wrap gap-1">
              {match.matchReasons.map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.gaps.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Potential Gaps
            </h5>
            <div className="flex flex-wrap gap-1">
              {match.gaps.map((gap, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {gap}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.recommendedActions.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Recommended Actions
            </h5>
            <ul className="text-sm space-y-1">
              {match.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TeamingMatchCardProps {
  match: TeamingMatch;
  onContact?: (partnerId: string) => void;
  onViewProfile?: (partnerId: string) => void;
}

function TeamingMatchCard({ match, onContact, onViewProfile }: TeamingMatchCardProps) {
  const scoreColor = getScoreColor(match.matchScore);
  const confidenceColor = getScoreColor(match.confidence);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: scoreColor }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn(scoreColor, "text-white")}>
                {match.matchScore}% Match
              </Badge>
              <Badge variant="outline" className={cn(confidenceColor, "text-white")}>
                {match.confidence}% Confidence
              </Badge>
            </div>
            <h4 className="font-semibold">
              {match.partner1Id} ↔ {match.partner2Id}
            </h4>
          </div>
          <div className="flex gap-2">
            {onViewProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(match.partner2Id)}
              >
                View Profile
              </Button>
            )}
            {onContact && (
              <Button
                size="sm"
                onClick={() => onContact(match.partner2Id)}
              >
                Contact
              </Button>
            )}
          </div>
        </div>

        {match.complementaryStrengths.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Complementary Strengths
            </h5>
            <div className="flex flex-wrap gap-1">
              {match.complementaryStrengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.potentialSynergies.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Potential Synergies
            </h5>
            <div className="flex flex-wrap gap-1">
              {match.potentialSynergies.map((synergy, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {synergy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.recommendedRoles && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-blue-500" />
              Recommended Roles
            </h5>
            <div className="flex gap-2">
              <Badge variant="outline">{match.recommendedRoles.partner1Role}</Badge>
              <span className="text-muted-foreground">↔</span>
              <Badge variant="outline">{match.recommendedRoles.partner2Role}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}
