"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Webinar } from "@/lib/types/webinar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface BasicInfoStepProps {
  data: Partial<Webinar>;
  updateData: (updates: Partial<Webinar>) => void;
}

export function BasicInfoStep({ data, updateData }: BasicInfoStepProps) {
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const updates: Partial<Webinar> = { title };
    
    // Auto-generate slug if title changes and slug is empty or matches previous title
    if (!data.slug || data.slug === generateSlug(data.title || "")) {
      updates.slug = generateSlug(title);
    }
    
    updateData(updates);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Webinar Title</Label>
        <Input
          id="title"
          placeholder="e.g., How to Win Your First Federal Contract"
          value={data.title || ""}
          onChange={handleTitleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug</Label>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">/webinars/</span>
          <Input
            id="slug"
            placeholder="win-first-federal-contract"
            value={data.slug || ""}
            onChange={(e) => updateData({ slug: e.target.value })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This will be the URL where users can access your webinar landing page.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          placeholder="A brief overview of what this webinar is about..."
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startTime">Date & Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={data.startTime ? data.startTime.substring(0, 16) : ""}
            onChange={(e) => updateData({ startTime: new Date(e.target.value).toISOString() })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="60"
            value={data.duration || ""}
            onChange={(e) => updateData({ duration: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select 
          value={data.timezone || "America/New_York"} 
          onValueChange={(value) => updateData({ timezone: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
            <SelectItem value="UTC">UTC</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
