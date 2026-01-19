"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  FileText, 
  Search,
  Eye,
  Copy,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSurveyTemplates } from "@/lib/mock-data/survey-mock-data";
import { SurveyTemplate } from "@/lib/types/survey";
import Link from "next/link";

export default function SurveyTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (useMockData) {
      setTemplates(mockSurveyTemplates as SurveyTemplate[]);
      setLoading(false);
    } else {
      loadTemplates();
    }
  }, [useMockData]);

  const loadTemplates = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "surveyTemplates"),
        orderBy("usageCount", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SurveyTemplate[];
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (templateId: string) => {
    toast.success("Template selected! Redirecting to survey builder...");
    // Redirect to create survey with template
    window.location.href = `/portal/admin/surveys/create?template=${templateId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Survey Templates</h1>
          <p className="text-muted-foreground">Choose from pre-built templates to create surveys quickly</p>
        </div>
        <div className="flex items-center gap-3">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <Link href="/portal/admin/surveys">
            <Button variant="outline">Back to Surveys</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                size="sm"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Used {template.usageCount} times</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Includes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{template.sections.length} sections</li>
                      <li>
                        {template.sections.reduce((sum, s) => sum + s.questions.length, 0)} questions
                      </li>
                      {template.settings.allowSaveProgress && <li>Save & resume progress</li>}
                      {template.settings.showProgressBar && <li>Progress indicator</li>}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                    <Link href={`/portal/admin/surveys/templates/${template.id}/preview`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
