"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Calendar, Download, ExternalLink } from "lucide-react";
import {
  CalendarEvent,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateOffice365CalendarUrl,
  downloadICSFile,
} from "@/lib/calendar-integration";

interface AddToCalendarProps {
  event: CalendarEvent;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCalendar({
  event,
  variant = "outline",
  size = "sm",
  className,
}: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), "_blank");
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    window.open(generateOutlookCalendarUrl(event), "_blank");
    setIsOpen(false);
  };

  const handleOffice365Calendar = () => {
    window.open(generateOffice365CalendarUrl(event), "_blank");
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICSFile(event);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Calendar</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Outlook.com
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOffice365Calendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Office 365
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDownloadICS}>
          <Download className="h-4 w-4 mr-2" />
          Download .ics File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Convenience components for specific Traction events
import {
  createLevel10MeetingEvent,
  createRockMilestoneEvent,
  createTodoReminderEvent,
  createQuarterlyPlanningEvent,
} from "@/lib/calendar-integration";

interface Level10MeetingCalendarProps {
  date: Date;
  startTime: string;
  endTime: string;
  attendees?: string[];
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Level10MeetingCalendar({
  date,
  startTime,
  endTime,
  attendees,
  variant = "outline",
  size = "sm",
}: Level10MeetingCalendarProps) {
  const event = createLevel10MeetingEvent(date, startTime, endTime, attendees);
  return <AddToCalendar event={event} variant={variant} size={size} />;
}

interface RockReminderCalendarProps {
  description: string;
  owner: string;
  dueDate: Date;
  progress: number;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function RockReminderCalendar({
  description,
  owner,
  dueDate,
  progress,
  variant = "outline",
  size = "sm",
}: RockReminderCalendarProps) {
  const event = createRockMilestoneEvent(description, owner, dueDate, progress);
  return <AddToCalendar event={event} variant={variant} size={size} />;
}

interface TodoReminderCalendarProps {
  description: string;
  owner: string;
  dueDate: Date;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TodoReminderCalendar({
  description,
  owner,
  dueDate,
  variant = "outline",
  size = "sm",
}: TodoReminderCalendarProps) {
  const event = createTodoReminderEvent(description, owner, dueDate);
  return <AddToCalendar event={event} variant={variant} size={size} />;
}

interface QuarterlyPlanningCalendarProps {
  quarter: string;
  date: Date;
  attendees?: string[];
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function QuarterlyPlanningCalendar({
  quarter,
  date,
  attendees,
  variant = "outline",
  size = "sm",
}: QuarterlyPlanningCalendarProps) {
  const event = createQuarterlyPlanningEvent(quarter, date, attendees);
  return <AddToCalendar event={event} variant={variant} size={size} />;
}
