"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  RefreshCw,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { COLLECTIONS, type MarketPlaceListingDoc, type MarketPlaceInquiryDoc } from "@/lib/schema";

interface AnalyticsData {
  totalViews: number;
  totalInquiries: number;
  viewsChange: number;
  inquiriesChange: number;
  listingsByType: { type: string; count: number }[];
  viewsByListing: { name: string; views: number; inquiries: number }[];
  monthlyTrend: { month: string; views: number; inquiries: number }[];
}

export default function MarketplaceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MarketPlaceListingDoc[]>([]);
  const [inquiries, setInquiries] = useState<MarketPlaceInquiryDoc[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    if (!db || !auth?.currentUser) return;

    setLoading(true);
    try {
      // Get current user's team member ID
      const { query: queryFn, where: whereFn, getDocs: getDocsFn, orderBy: orderByFn } = await import("firebase/firestore");
      const teamMemberQuery = queryFn(
        collection(db, COLLECTIONS.TEAM_MEMBERS),
        whereFn("firebaseUid", "==", auth.currentUser.uid)
      );
      const teamMemberSnap = await getDocsFn(teamMemberQuery);
      
      if (teamMemberSnap.empty) {
        setAnalytics(null);
        return;
      }

      const teamMemberId = teamMemberSnap.docs[0].id;

      // Fetch listings
      const listingsQuery = queryFn(
        collection(db, COLLECTIONS.MARKETPLACE_LISTINGS),
        whereFn("sellerId", "==", teamMemberId),
        orderByFn("createdAt", "desc")
      );
      const listingsSnap = await getDocsFn(listingsQuery);
      const listingsData = listingsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MarketPlaceListingDoc[];
      setListings(listingsData);

      // Fetch inquiries
      const inquiriesQuery = queryFn(
        collection(db, COLLECTIONS.MARKETPLACE_INQUIRIES),
        whereFn("sellerId", "==", teamMemberId),
        orderByFn("createdAt", "desc")
      );
      const inquiriesSnap = await getDocsFn(inquiriesQuery);
      const inquiriesData = inquiriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MarketPlaceInquiryDoc[];
      setInquiries(inquiriesData);

      // Calculate analytics
      const totalViews = listingsData.reduce((sum, l) => sum + (l.viewCount || 0), 0);
      const totalInquiries = listingsData.reduce((sum, l) => sum + (l.inquiryCount || 0), 0);

      // Listings by type
      const listingsByType = [
        { type: "Products", count: listingsData.filter((l) => l.listingType === "product").length },
        { type: "Services", count: listingsData.filter((l) => l.listingType === "service").length },
        { type: "Capabilities", count: listingsData.filter((l) => l.listingType === "capability").length },
      ];

      // Views by listing (top 5)
      const viewsByListing = listingsData
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
        .map((l) => ({
          name: l.title.length > 20 ? l.title.substring(0, 20) + "..." : l.title,
          views: l.viewCount || 0,
          inquiries: l.inquiryCount || 0,
        }));

      // Monthly trend (last 6 months mock data for now)
      const monthlyTrend = [
        { month: "Jan", views: Math.floor(totalViews * 0.1), inquiries: Math.floor(totalInquiries * 0.1) },
        { month: "Feb", views: Math.floor(totalViews * 0.15), inquiries: Math.floor(totalInquiries * 0.15) },
        { month: "Mar", views: Math.floor(totalViews * 0.2), inquiries: Math.floor(totalInquiries * 0.2) },
        { month: "Apr", views: Math.floor(totalViews * 0.25), inquiries: Math.floor(totalInquiries * 0.25) },
        { month: "May", views: Math.floor(totalViews * 0.3), inquiries: Math.floor(totalInquiries * 0.3) },
        { month: "Jun", views: totalViews, inquiries: totalInquiries },
      ];

      setAnalytics({
        totalViews,
        totalInquiries,
        viewsChange: 12, // Mock percentage change
        inquiriesChange: 8,
        listingsByType,
        viewsByListing,
        monthlyTrend,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics || listings.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No data yet</h3>
        <p className="text-center text-sm text-muted-foreground">
          Create listings to start seeing analytics.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/portal/marketplace/my-listings/new">Create Listing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Analytics</h1>
          <p className="text-muted-foreground">Track your listing performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{analytics.viewsChange}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{analytics.totalInquiries.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{analytics.inquiriesChange}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">
                  {listings.filter((l) => l.status === "published").length}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-2">
                <Store className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {listings.length} total listings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {analytics.totalViews > 0
                    ? ((analytics.totalInquiries / analytics.totalViews) * 100).toFixed(1)
                    : 0}
                %
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Views to inquiries
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">By Listing</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Listings by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.listingsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.viewsByListing.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{idx + 1}</Badge>
                        <span className="text-sm truncate max-w-[200px]">{item.name}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{item.views} views</span>
                        <span>{item.inquiries} inquiries</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.viewsByListing}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" />
                  <Bar dataKey="inquiries" fill="#22c55e" name="Inquiries" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Views" />
                  <Line type="monotone" dataKey="inquiries" stroke="#22c55e" name="Inquiries" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inquiries yet</p>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{inquiry.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant="outline">{inquiry.status}</Badge>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(inquiry.createdAt?.toDate?.() || inquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
