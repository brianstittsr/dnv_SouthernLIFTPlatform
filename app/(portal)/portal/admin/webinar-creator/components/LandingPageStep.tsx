"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Webinar } from "@/lib/types/webinar";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Layout, Image as ImageIcon, Users, ListTree, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicListEditor } from "./DynamicListEditor";
import { IconSelector } from "./IconSelector";

interface LandingPageStepProps {
  data: Partial<Webinar>;
  updateData: (updates: Partial<Webinar>) => void;
}

export function LandingPageStep({ data, updateData }: LandingPageStepProps) {
  const updateHero = (updates: any) => {
    updateData({
      hero: { ...(data.hero || { headline: "", subheadline: "", ctaText: "Register Now" }), ...updates }
    });
  };

  const updateAbout = (updates: any) => {
    updateData({
      about: { ...(data.about || { title: "About This Webinar", content: "" }), ...updates }
    });
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
          <Layout className="h-5 w-5 text-primary" />
          Hero Section
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroHeadline">Main Headline</Label>
              <Input
                id="heroHeadline"
                placeholder="e.g., The Future of Government Contracting"
                value={data.hero?.headline || ""}
                onChange={(e) => updateHero({ headline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubheadline">Subheadline</Label>
              <Textarea
                id="heroSubheadline"
                placeholder="e.g., Join us for an exclusive masterclass on winning multi-million dollar contracts."
                value={data.hero?.subheadline || ""}
                onChange={(e) => updateHero({ subheadline: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaText">Button Text</Label>
                <Input
                  id="ctaText"
                  placeholder="Register Now"
                  value={data.hero?.ctaText || ""}
                  onChange={(e) => updateHero({ ctaText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroBg">Background Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="heroBg"
                    placeholder="https://..."
                    value={data.hero?.backgroundImage || ""}
                    onChange={(e) => updateHero({ backgroundImage: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
          <Layout className="h-5 w-5 text-primary" />
          About Section
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aboutTitle">Section Title</Label>
              <Input
                id="aboutTitle"
                value={data.about?.title || ""}
                onChange={(e) => updateAbout({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutContent">Main Content (Markdown supported)</Label>
              <Textarea
                id="aboutContent"
                placeholder="Detail what the webinar is about, who it's for, etc."
                value={data.about?.content || ""}
                onChange={(e) => updateAbout({ content: e.target.value })}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
          <ListTree className="h-5 w-5 text-primary" />
          Key Benefits
        </h3>
        <DynamicListEditor
          items={data.benefits || []}
          onItemsChange={(benefits) => updateData({ benefits })}
          newItemDefault={{ id: "", title: "", description: "", icon: "CheckCircle" }}
          addLabel="Add Benefit"
          renderItem={(benefit, index, updateItem) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-2">
                  <Label>Icon</Label>
                  <IconSelector 
                    value={benefit.icon} 
                    onChange={(icon) => updateItem({ icon })} 
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Benefit Title</Label>
                  <Input
                    placeholder="e.g., Expert Insights"
                    value={benefit.title}
                    onChange={(e) => updateItem({ title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what they will gain..."
                  value={benefit.description}
                  onChange={(e) => updateItem({ description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Speakers Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
          <Users className="h-5 w-5 text-primary" />
          Speakers
        </h3>
        <DynamicListEditor
          items={data.speakers || []}
          onItemsChange={(speakers) => updateData({ speakers })}
          newItemDefault={{ id: "", name: "", title: "", bio: "", imageUrl: "" }}
          addLabel="Add Speaker"
          renderItem={(speaker, index, updateItem) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Speaker Name"
                    value={speaker.name}
                    onChange={(e) => updateItem({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title / Role</Label>
                  <Input
                    placeholder="e.g., CEO at KDM"
                    value={speaker.title}
                    onChange={(e) => updateItem({ title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  placeholder="Short bio..."
                  value={speaker.bio}
                  onChange={(e) => updateItem({ bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={speaker.imageUrl}
                  onChange={(e) => updateItem({ imageUrl: e.target.value })}
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Agenda Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
          <ListTree className="h-5 w-5 text-primary" />
          Webinar Agenda
        </h3>
        <DynamicListEditor
          items={data.agenda || []}
          onItemsChange={(agenda) => updateData({ agenda })}
          newItemDefault={{ id: "", time: "", title: "", description: "" }}
          addLabel="Add Agenda Item"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-2">
                  <Label>Time</Label>
                  <Input
                    placeholder="e.g., 10:00 AM"
                    value={item.time}
                    onChange={(e) => updateItem({ time: e.target.value })}
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Session Title</Label>
                  <Input
                    placeholder="e.g., Opening Remarks"
                    value={item.title}
                    onChange={(e) => updateItem({ title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Short summary of this session..."
                  value={item.description}
                  onChange={(e) => updateItem({ description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          FAQs
        </h3>
        <DynamicListEditor
          items={data.faqs || []}
          onItemsChange={(faqs) => updateData({ faqs })}
          newItemDefault={{ id: "", question: "", answer: "" }}
          addLabel="Add FAQ"
          renderItem={(faq, index, updateItem) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="e.g., Will there be a recording?"
                  value={faq.question}
                  onChange={(e) => updateItem({ question: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  placeholder="Provide a clear answer..."
                  value={faq.answer}
                  onChange={(e) => updateItem({ answer: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
