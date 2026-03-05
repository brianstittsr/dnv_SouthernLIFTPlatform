"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Video, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Calendar,
  Globe
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Webinar } from "@/lib/types/webinar";
import { format } from "date-fns";

export default function WebinarCreatorPage() {
  const router = useRouter();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const response = await fetch("/api/admin/webinars");
      const result = await response.json();
      if (result.data) {
        setWebinars(result.data);
      }
    } catch (error) {
      console.error("Error fetching webinars:", error);
      toast.error("Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webinar?")) return;

    try {
      const response = await fetch(`/api/admin/webinars/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Webinar deleted successfully");
        setWebinars(webinars.filter((w) => w.id !== id));
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting webinar:", error);
      toast.error("Failed to delete webinar");
    }
  };

  const filteredWebinars = webinars.filter((w) =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webinar Creator</h1>
          <p className="text-muted-foreground">
            Manage your webinars, landing pages, and registrations.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/portal/admin/webinar-creator/new")}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> New Webinar
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search webinars..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredWebinars.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-xl mb-2">No webinars found</CardTitle>
          <CardDescription className="max-w-sm">
            {searchQuery 
              ? "We couldn't find any webinars matching your search." 
              : "You haven't created any webinars yet. Click 'New Webinar' to get started."}
          </CardDescription>
          {!searchQuery && (
            <Button 
              className="mt-6" 
              onClick={() => router.push("/portal/admin/webinar-creator/new")}
            >
              Create Your First Webinar
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebinars.map((webinar) => (
            <Card key={webinar.id} className="group overflow-hidden flex flex-col">
              <div 
                className="h-48 bg-cover bg-center relative"
                style={{ 
                  backgroundImage: `url(${webinar.hero.backgroundImage || "/images/webinar-placeholder.jpg"})`,
                  backgroundColor: "#1a1a1a"
                }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-4 left-4">
                  <Badge variant={webinar.status === "published" ? "default" : "secondary"}>
                    {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold line-clamp-2">{webinar.title}</h3>
                </div>
              </div>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {webinar.startTime ? format(new Date(webinar.startTime), "PPP p") : "Not scheduled"}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4" />
                    {webinar.slug}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/portal/admin/webinar-creator/${webinar.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <div className="flex items-center gap-2">
                    {webinar.status === "published" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.open(`/webinars/${webinar.slug}`, "_blank")}
                        title="View Live Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => router.push(`/portal/admin/webinar-creator/${webinar.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Webinar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(webinar.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
