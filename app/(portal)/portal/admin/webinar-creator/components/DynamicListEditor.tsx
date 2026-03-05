"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicListEditorProps<T> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  renderItem: (item: T, index: number, updateItem: (updates: Partial<T>) => void) => React.ReactNode;
  newItemDefault: T;
  title?: string;
  addLabel?: string;
}

export function DynamicListEditor<T extends { id: string }>({
  items,
  onItemsChange,
  renderItem,
  newItemDefault,
  title,
  addLabel = "Add Item"
}: DynamicListEditorProps<T>) {
  const addItem = () => {
    const newItem = { ...newItemDefault, id: Math.random().toString(36).substr(2, 9) };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<T>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  return (
    <div className="space-y-4">
      {title && <h4 className="font-medium text-sm">{title}</h4>}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="relative group border rounded-lg p-4 bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {renderItem(item, index, (updates) => updateItem(item.id, updates))}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
            No items added yet. Click "{addLabel}" to get started.
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addItem}
      >
        <Plus className="h-4 w-4 mr-2" /> {addLabel}
      </Button>
    </div>
  );
}
