"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { GlossaryItem } from "../types";

interface GlossaryEditorProps {
  glossary: GlossaryItem[];
  onGlossaryChange: (glossary: GlossaryItem[]) => void;
}

export function GlossaryEditor({ glossary, onGlossaryChange }: GlossaryEditorProps) {
  const addGlossaryItem = () => {
    const newItem: GlossaryItem = {
      id: `glossary-${Date.now()}`,
      term: "",
      definition: "",
    };
    onGlossaryChange([...glossary, newItem]);
  };

  const updateGlossaryItem = (id: string, field: "term" | "definition", value: string) => {
    onGlossaryChange(
      glossary.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeGlossaryItem = (id: string) => {
    onGlossaryChange(glossary.filter((item) => item.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Glossary
            </CardTitle>
            <CardDescription>
              Define key terms and acronyms used in your article
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addGlossaryItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Term
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {glossary.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No glossary terms yet</p>
            <p className="text-sm">Click "Add Term" to define key terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            {glossary.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_2fr_auto] gap-3 items-start"
              >
                <div className="space-y-1">
                  <Label htmlFor={`term-${item.id}`} className="text-xs">
                    Term {index + 1}
                  </Label>
                  <Input
                    id={`term-${item.id}`}
                    placeholder="e.g., CMMC"
                    value={item.term}
                    onChange={(e) =>
                      updateGlossaryItem(item.id, "term", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`def-${item.id}`} className="text-xs">
                    Definition
                  </Label>
                  <Input
                    id={`def-${item.id}`}
                    placeholder="e.g., Cybersecurity Maturity Model Certification"
                    value={item.definition}
                    onChange={(e) =>
                      updateGlossaryItem(item.id, "definition", e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6 text-destructive hover:text-destructive"
                  onClick={() => removeGlossaryItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
