"use client";

import { 
  Check, 
  Search, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  Shield, 
  Globe, 
  Zap, 
  Award, 
  Rocket, 
  BarChart, 
  Clock, 
  MessageCircle, 
  Video, 
  Calendar,
  DollarSign,
  Briefcase,
  BookOpen,
  PieChart
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ICONS = [
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Target", icon: Target },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Users", icon: Users },
  { name: "Shield", icon: Shield },
  { name: "Globe", icon: Globe },
  { name: "Zap", icon: Zap },
  { name: "Award", icon: Award },
  { name: "Rocket", icon: Rocket },
  { name: "BarChart", icon: BarChart },
  { name: "Clock", icon: Clock },
  { name: "MessageCircle", icon: MessageCircle },
  { name: "Video", icon: Video },
  { name: "Calendar", icon: Calendar },
  { name: "DollarSign", icon: DollarSign },
  { name: "Briefcase", icon: Briefcase },
  { name: "BookOpen", icon: BookOpen },
  { name: "PieChart", icon: PieChart },
];

interface IconSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredIcons = ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = ICONS.find((i) => i.name === value)?.icon || Lightbulb;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 h-10 px-3"
        >
          <SelectedIcon className="h-4 w-4 text-primary" />
          <span className="truncate">{value || "Select Icon"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 p-2 max-h-[240px] overflow-y-auto">
          {filteredIcons.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "h-12 w-full p-0 flex flex-col items-center justify-center gap-1",
                value === item.name ? "bg-primary/10 text-primary" : ""
              )}
              onClick={() => {
                onChange(item.name);
                setOpen(false);
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[8px] uppercase font-medium">{item.name}</span>
              {value === item.name && (
                <div className="absolute top-1 right-1">
                  <Check className="h-2 w-2" />
                </div>
              )}
            </Button>
          ))}
          {filteredIcons.length === 0 && (
            <div className="col-span-4 py-4 text-center text-xs text-muted-foreground">
              No icons found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
