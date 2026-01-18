import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(__dirname, '..', 'app', '(portal)', 'portal');

// Define all SVP pages that need to be created
const svpPages = [
  // SME Pages
  { path: 'sme/dashboard', title: 'SME Dashboard', collection: 'smeProfiles' },
  { path: 'sme/subscription', title: 'Subscription', collection: 'smeSubscriptions' },
  { path: 'sme/introductions', title: 'My Introductions', collection: 'introductions' },
  { path: 'sme/cohorts', title: 'My Cohorts', collection: 'cohortEnrollments' },
  { path: 'sme/certificates', title: 'Certificates', collection: 'certificates' },
  
  // Partner Pages
  { path: 'partner/dashboard', title: 'Partner Dashboard', collection: 'partnerProfiles' },
  { path: 'partner/leads', title: 'Lead Management', collection: 'partnerLeads' },
  { path: 'partner/introductions', title: 'Introductions', collection: 'partnerIntroductions' },
  { path: 'partner/revenue', title: 'Revenue Dashboard', collection: 'partnerRevenue' },
  { path: 'partner/overlaps', title: 'Service Overlaps', collection: 'serviceOverlaps' },
  { path: 'partner/clients', title: 'My SME Clients', collection: 'partnerClients' },
  { path: 'partner/conversions', title: 'Conversion Tracking', collection: 'conversionTracking' },
  
  // Buyer Pages
  { path: 'buyer/dashboard', title: 'Buyer Dashboard', collection: 'buyerProfiles' },
  { path: 'buyer/directory', title: 'SME Directory', collection: 'smeProfiles' },
  { path: 'buyer/introductions', title: 'My Introductions', collection: 'buyerRequests' },
  { path: 'buyer/favorites', title: 'Saved SMEs', collection: 'buyerFavorites' },
  { path: 'buyer/shared-packs', title: 'Shared Proof Packs', collection: 'proofPacks' },
  
  // QA Pages
  { path: 'qa/dashboard', title: 'QA Dashboard', collection: 'qaReviews' },
  { path: 'qa/queue', title: 'Review Queue', collection: 'qaReviews' },
  { path: 'qa/my-reviews', title: 'My Reviews', collection: 'qaReviews' },
  { path: 'qa/history', title: 'Review History', collection: 'qaReviews' },
  
  // Instructor Pages
  { path: 'instructor/dashboard', title: 'Instructor Dashboard', collection: 'instructorProfiles' },
  { path: 'instructor/cohorts', title: 'My Cohorts', collection: 'cmmcCohorts' },
  { path: 'instructor/cohorts/new', title: 'Create Cohort', collection: 'cmmcCohorts' },
  { path: 'instructor/assessments', title: 'Assessments', collection: 'assessments' },
  { path: 'instructor/certificates', title: 'Certificates', collection: 'certificates' },
  
  // Admin Pages
  { path: 'admin/svp-settings', title: 'SVP Settings', collection: 'platformSettings' },
  { path: 'admin/user-management', title: 'User Management', collection: 'users' },
  { path: 'admin/analytics', title: 'Platform Analytics', collection: 'platformAuditLogs' },
];

const pageTemplate = (title: string, collection: string) => `"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ${title.replace(/\s+/g, '')}Page() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(collection(db, "${collection}"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">${title}</h1>
          <p className="text-muted-foreground">Manage your ${title.toLowerCase()}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
          <CardDescription>View and manage your ${title.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No items found. Click "Add New" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;

// Create all pages
svpPages.forEach(({ path: pagePath, title, collection }) => {
  const fullPath = path.join(baseDir, pagePath);
  const pageFile = path.join(fullPath, 'page.tsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  
  // Create page file if it doesn't exist
  if (!fs.existsSync(pageFile)) {
    fs.writeFileSync(pageFile, pageTemplate(title, collection));
    console.log(`Created: ${pageFile}`);
  } else {
    console.log(`Skipped (exists): ${pageFile}`);
  }
});

console.log('Done creating SVP pages!');
