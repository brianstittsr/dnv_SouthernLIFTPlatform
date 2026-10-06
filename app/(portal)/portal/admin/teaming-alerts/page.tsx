"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Handshake,
  RefreshCw,
  Building2,
  Mail,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TeamingAlert {
  id: string;
  requesterName: string;
  requesterCompany: string;
  requesterEmail: string;
  recipientName: string;
  recipientCompany: string;
  recipientEmail: string;
  opportunityTitle: string;
  agency?: string;
  solicitationNumber?: string;
  naicsCode?: string;
  setAside?: string;
  responseDeadline?: string;
  uiLink?: string;
  partnerMatchScore?: number;
  partnerReasons: string[];
  positioningAdvice: string[];
  status: string;
  emailsSent?: { recipient: boolean; requester: boolean };
  createdAt?: Date;
}

export default function AdminTeamingAlertsPage() {
  const [alerts, setAlerts] = useState<TeamingAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, COLLECTIONS.TEAMING_ALERTS), orderBy("createdAt", "desc"))
      );
      setAlerts(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            requesterName: x.requesterName || "",
            requesterCompany: x.requesterCompany || "",
            requesterEmail: x.requesterEmail || "",
            recipientName: x.recipientName || "",
            recipientCompany: x.recipientCompany || "",
            recipientEmail: x.recipientEmail || "",
            opportunityTitle: x.opportunityTitle || "Untitled",
            agency: x.agency || undefined,
            solicitationNumber: x.solicitationNumber || undefined,
            naicsCode: x.naicsCode || undefined,
            setAside: x.setAside || undefined,
            responseDeadline: x.responseDeadline || undefined,
            uiLink: x.uiLink || undefined,
            partnerMatchScore: x.partnerMatchScore ?? undefined,
            partnerReasons: Array.isArray(x.partnerReasons) ? x.partnerReasons : [],
            positioningAdvice: Array.isArray(x.positioningAdvice) ? x.positioningAdvice : [],
            status: x.status || "sent",
            emailsSent: x.emailsSent,
            createdAt: x.createdAt?.toDate?.(),
          };
        })
      );
    } catch (error) {
      console.error("Failed to load teaming alerts:", error);
      toast.error("Failed to load teaming alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teaming Alerts</h1>
          <p className="text-muted-foreground">
            Member-to-member teaming requests on SAM.gov opportunities
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAlerts} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{alerts.length}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {alerts.filter((a) => a.status === "accepted").length}
            </div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {alerts.filter((a) => a.emailsSent?.recipient).length}
            </div>
            <div className="text-sm text-muted-foreground">Emails Delivered</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Handshake className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No teaming alerts yet</h3>
            <p className="text-muted-foreground">
              When members submit teaming requests from the SAM.gov Opportunities page, they appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{alert.opportunityTitle}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {alert.agency || "Unknown agency"}
                      {alert.solicitationNumber && <span>• {alert.solicitationNumber}</span>}
                      {alert.responseDeadline && (
                        <span>• Due {new Date(alert.responseDeadline).toLocaleDateString()}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.status === "accepted" ? "default" : "secondary"}>
                      {alert.status}
                    </Badge>
                    {alert.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {alert.createdAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span>
                    <strong>{alert.requesterName}</strong> ({alert.requesterCompany})
                  </span>
                  <span className="text-muted-foreground">→ requested teaming with →</span>
                  <span>
                    <strong>{alert.recipientName}</strong> ({alert.recipientCompany})
                  </span>
                  {alert.partnerMatchScore != null && (
                    <Badge className="bg-green-600 hover:bg-green-600">
                      {alert.partnerMatchScore}% Partner Match
                    </Badge>
                  )}
                </div>

                {alert.partnerReasons.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground mb-1">Why this partner:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {alert.partnerReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {alert.positioningAdvice.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground mb-1">Positioning advice sent:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {alert.positioningAdvice.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {alert.emailsSent?.recipient ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    )}
                    <Mail className="h-3.5 w-3.5" /> Partner emailed ({alert.recipientEmail})
                  </span>
                  {alert.emailsSent?.requester && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      Requester confirmation sent
                    </span>
                  )}
                  {alert.uiLink && (
                    <a
                      href={alert.uiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> SAM.gov
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
