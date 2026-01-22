"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Menu,
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  Layout,
  Settings,
  Palette,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import type { HeaderConfig, FooterConfig, NavigationItem } from "@/lib/navigation-schema";

export default function HeaderFooterManager() {
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  async function loadConfigurations() {
    setIsLoading(true);
    try {
      if (!db) {
        toast.error("Database connection not available");
        setIsLoading(false);
        return;
      }
      
      const headerSnap = await getDocs(collection(db, "header_configs"));
      const footerSnap = await getDocs(collection(db, "footer_configs"));

      if (!headerSnap.empty) {
        const headerDoc = headerSnap.docs[0];
        setHeaderConfig({ id: headerDoc.id, ...headerDoc.data() } as HeaderConfig);
      } else {
        setHeaderConfig(getDefaultHeaderConfig());
      }

      if (!footerSnap.empty) {
        const footerDoc = footerSnap.docs[0];
        setFooterConfig({ id: footerDoc.id, ...footerDoc.data() } as FooterConfig);
      } else {
        setFooterConfig(getDefaultFooterConfig());
      }
    } catch (error) {
      console.error("Error loading configurations:", error);
      toast.error("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  }

  function getDefaultHeaderConfig(): HeaderConfig {
    return {
      name: "Main Header",
      isActive: true,
      logo: {
        text: "Strategic Value Plus",
        height: 40,
      },
      navigation: [
        {
          id: "services",
          label: "Services",
          url: "/services",
          type: "dropdown",
          order: 1,
          isEnabled: true,
          children: [
            {
              id: "cmmc-consulting",
              label: "CMMC Consulting",
              url: "/services/cmmc-consulting",
              description: "Expert guidance for CMMC compliance",
              order: 1,
              isEnabled: true,
            },
            {
              id: "cybersecurity-assessment",
              label: "Cybersecurity Assessment",
              url: "/services/cybersecurity-assessment",
              description: "Comprehensive security evaluations",
              order: 2,
              isEnabled: true,
            },
            {
              id: "training",
              label: "Training & Certification",
              url: "/services/training",
              description: "Professional development programs",
              order: 3,
              isEnabled: true,
            },
          ],
        },
        {
          id: "company",
          label: "Company",
          url: "/company",
          type: "dropdown",
          order: 2,
          isEnabled: true,
          children: [
            {
              id: "about",
              label: "About Us",
              url: "/company/about",
              description: "Learn about our mission and team",
              order: 1,
              isEnabled: true,
            },
            {
              id: "team",
              label: "Our Team",
              url: "/company/team",
              description: "Meet our expert consultants",
              order: 2,
              isEnabled: true,
            },
            {
              id: "careers",
              label: "Careers",
              url: "/company/careers",
              description: "Join our growing team",
              order: 3,
              isEnabled: true,
            },
          ],
        },
        {
          id: "resources",
          label: "Resources",
          url: "/resources",
          type: "dropdown",
          order: 3,
          isEnabled: true,
          children: [
            {
              id: "blog",
              label: "Blog",
              url: "/resources/blog",
              description: "Latest insights and articles",
              order: 1,
              isEnabled: true,
            },
            {
              id: "library",
              label: "Resource Library",
              url: "/portal/resources",
              description: "Downloadable guides and templates",
              order: 2,
              isEnabled: true,
            },
            {
              id: "case-studies",
              label: "Case Studies",
              url: "/resources/case-studies",
              description: "Success stories from our clients",
              order: 3,
              isEnabled: true,
            },
          ],
        },
        {
          id: "contact",
          label: "Contact",
          url: "/contact",
          type: "link",
          order: 4,
          isEnabled: true,
        },
      ],
      style: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        hoverColor: "#3b82f6",
        position: "sticky",
        transparent: false,
        blur: false,
        shadow: true,
      },
      animation: {
        type: "fade",
        duration: 300,
        easing: "ease",
        dropdownAnimation: "fade",
        hoverEffect: "underline",
      },
      mobileMenu: {
        breakpoint: 768,
        animation: "slide-left",
        overlayColor: "rgba(0, 0, 0, 0.5)",
      },
      createdBy: "system",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  function getDefaultFooterConfig(): FooterConfig {
    return {
      name: "Main Footer",
      isActive: true,
      columns: [],
      style: {
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        linkColor: "#60a5fa",
        linkHoverColor: "#93c5fd",
      },
      social: {
        enabled: false,
        platforms: [],
        animation: "scale",
      },
      copyright: {
        text: "© 2026 Strategic Value Plus. All rights reserved.",
        year: "auto",
      },
      newsletter: {
        enabled: false,
        title: "Subscribe to our newsletter",
        description: "Get the latest updates",
        placeholder: "Enter your email",
        buttonText: "Subscribe",
      },
      createdBy: "system",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  async function saveHeaderConfig() {
    if (!headerConfig || !db) return;

    setIsSaving(true);
    try {
      const docRef = headerConfig.id
        ? doc(db, "header_configs", headerConfig.id)
        : doc(collection(db, "header_configs"));

      await setDoc(docRef, {
        ...headerConfig,
        updatedAt: Timestamp.now(),
      });

      toast.success("Header configuration saved successfully");
      if (!headerConfig.id) {
        setHeaderConfig({ ...headerConfig, id: docRef.id });
      }
    } catch (error) {
      console.error("Error saving header config:", error);
      toast.error("Failed to save header configuration");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveFooterConfig() {
    if (!footerConfig || !db) return;

    setIsSaving(true);
    try {
      const docRef = footerConfig.id
        ? doc(db, "footer_configs", footerConfig.id)
        : doc(collection(db, "footer_configs"));

      await setDoc(docRef, {
        ...footerConfig,
        updatedAt: Timestamp.now(),
      });

      toast.success("Footer configuration saved successfully");
      if (!footerConfig.id) {
        setFooterConfig({ ...footerConfig, id: docRef.id });
      }
    } catch (error) {
      console.error("Error saving footer config:", error);
      toast.error("Failed to save footer configuration");
    } finally {
      setIsSaving(false);
    }
  }

  function addNavigationItem() {
    if (!headerConfig) return;

    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: "New Link",
      url: "/",
      type: "link",
      order: headerConfig.navigation.length,
      isEnabled: true,
    };

    setHeaderConfig({
      ...headerConfig,
      navigation: [...headerConfig.navigation, newItem],
    });
  }

  function updateNavigationItem(index: number, updates: Partial<NavigationItem>) {
    if (!headerConfig) return;

    const updatedNav = [...headerConfig.navigation];
    updatedNav[index] = { ...updatedNav[index], ...updates };

    setHeaderConfig({
      ...headerConfig,
      navigation: updatedNav,
    });
  }

  function deleteNavigationItem(index: number) {
    if (!headerConfig) return;

    setHeaderConfig({
      ...headerConfig,
      navigation: headerConfig.navigation.filter((_, i) => i !== index),
    });
  }

  function moveNavigationItem(index: number, direction: "up" | "down") {
    if (!headerConfig) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= headerConfig.navigation.length) return;

    const updatedNav = [...headerConfig.navigation];
    [updatedNav[index], updatedNav[newIndex]] = [updatedNav[newIndex], updatedNav[index]];

    updatedNav.forEach((item, i) => {
      item.order = i;
    });

    setHeaderConfig({
      ...headerConfig,
      navigation: updatedNav,
    });
  }

  // Sub-item management functions
  function addSubItem(navIndex: number) {
    if (!headerConfig) return;

    const updatedNav = [...headerConfig.navigation];
    const navItem = updatedNav[navIndex];

    if (!navItem.children) {
      navItem.children = [];
    }

    const newSubItem = {
      id: `sub-${Date.now()}`,
      label: "New Sub-item",
      url: "/",
      order: navItem.children.length,
      isEnabled: true,
    };

    navItem.children.push(newSubItem);

    setHeaderConfig({
      ...headerConfig,
      navigation: updatedNav,
    });
  }

  function updateSubItem(navIndex: number, subIndex: number, updates: any) {
    if (!headerConfig) return;

    const updatedNav = [...headerConfig.navigation];
    const navItem = updatedNav[navIndex];

    if (navItem.children && navItem.children[subIndex]) {
      navItem.children[subIndex] = { ...navItem.children[subIndex], ...updates };
    }

    setHeaderConfig({
      ...headerConfig,
      navigation: updatedNav,
    });
  }

  function deleteSubItem(navIndex: number, subIndex: number) {
    if (!headerConfig) return;

    const updatedNav = [...headerConfig.navigation];
    const navItem = updatedNav[navIndex];

    if (navItem.children) {
      navItem.children = navItem.children.filter((_, i) => i !== subIndex);
    }

    setHeaderConfig({
      ...headerConfig,
      navigation: updatedNav,
    });
  }

  function moveSubItem(navIndex: number, subIndex: number, direction: "up" | "down") {
    if (!headerConfig) return;

    const updatedNav = [...headerConfig.navigation];
    const navItem = updatedNav[navIndex];

    if (!navItem.children) return;

    const newIndex = direction === "up" ? subIndex - 1 : subIndex + 1;
    if (newIndex < 0 || newIndex >= navItem.children.length) return;

    [navItem.children[subIndex], navItem.children[newIndex]] = [
      navItem.children[newIndex],
      navItem.children[subIndex],
    ];

    navItem.children.forEach((item, i) => {
      item.order = i;
    });

    setHeaderConfig({
      ...headerConfig,
      navigation: updatedNav,
    });
  }

  // Footer column management functions
  function addFooterColumn() {
    if (!footerConfig) return;

    const newColumn = {
      id: `col-${Date.now()}`,
      title: "New Column",
      order: footerConfig.columns.length,
      isEnabled: true,
      links: [],
    };

    setFooterConfig({
      ...footerConfig,
      columns: [...footerConfig.columns, newColumn],
    });
  }

  function updateFooterColumn(index: number, updates: any) {
    if (!footerConfig) return;

    const updatedColumns = [...footerConfig.columns];
    updatedColumns[index] = { ...updatedColumns[index], ...updates };

    setFooterConfig({
      ...footerConfig,
      columns: updatedColumns,
    });
  }

  function deleteFooterColumn(index: number) {
    if (!footerConfig) return;

    setFooterConfig({
      ...footerConfig,
      columns: footerConfig.columns.filter((_, i) => i !== index),
    });
  }

  function moveFooterColumn(index: number, direction: "up" | "down") {
    if (!footerConfig) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= footerConfig.columns.length) return;

    const updatedColumns = [...footerConfig.columns];
    [updatedColumns[index], updatedColumns[newIndex]] = [
      updatedColumns[newIndex],
      updatedColumns[index],
    ];

    updatedColumns.forEach((col, i) => {
      col.order = i;
    });

    setFooterConfig({
      ...footerConfig,
      columns: updatedColumns,
    });
  }

  // Footer link management functions
  function addFooterLink(columnIndex: number) {
    if (!footerConfig) return;

    const updatedColumns = [...footerConfig.columns];
    const column = updatedColumns[columnIndex];

    const newLink = {
      id: `link-${Date.now()}`,
      label: "New Link",
      url: "/",
      order: column.links.length,
      isEnabled: true,
    };

    column.links.push(newLink);

    setFooterConfig({
      ...footerConfig,
      columns: updatedColumns,
    });
  }

  function updateFooterLink(columnIndex: number, linkIndex: number, updates: any) {
    if (!footerConfig) return;

    const updatedColumns = [...footerConfig.columns];
    const column = updatedColumns[columnIndex];

    if (column.links[linkIndex]) {
      column.links[linkIndex] = { ...column.links[linkIndex], ...updates };
    }

    setFooterConfig({
      ...footerConfig,
      columns: updatedColumns,
    });
  }

  function deleteFooterLink(columnIndex: number, linkIndex: number) {
    if (!footerConfig) return;

    const updatedColumns = [...footerConfig.columns];
    const column = updatedColumns[columnIndex];

    column.links = column.links.filter((_, i) => i !== linkIndex);

    setFooterConfig({
      ...footerConfig,
      columns: updatedColumns,
    });
  }

  function moveFooterLink(columnIndex: number, linkIndex: number, direction: "up" | "down") {
    if (!footerConfig) return;

    const updatedColumns = [...footerConfig.columns];
    const column = updatedColumns[columnIndex];

    const newIndex = direction === "up" ? linkIndex - 1 : linkIndex + 1;
    if (newIndex < 0 || newIndex >= column.links.length) return;

    [column.links[linkIndex], column.links[newIndex]] = [
      column.links[newIndex],
      column.links[linkIndex],
    ];

    column.links.forEach((link, i) => {
      link.order = i;
    });

    setFooterConfig({
      ...footerConfig,
      columns: updatedColumns,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Menu className="h-8 w-8" />
            Header & Footer Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage site navigation, header, and footer configurations
          </p>
        </div>
        <Button onClick={activeTab === "header" ? saveHeaderConfig : saveFooterConfig} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "header" | "footer")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="header">
            <Layout className="h-4 w-4 mr-2" />
            Header Configuration
          </TabsTrigger>
          <TabsTrigger value="footer">
            <Settings className="h-4 w-4 mr-2" />
            Footer Configuration
          </TabsTrigger>
        </TabsList>

        {/* Header Configuration */}
        <TabsContent value="header" className="space-y-6">
          {headerConfig && (
            <>
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Settings</CardTitle>
                  <CardDescription>Configure header appearance and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Configuration Name</Label>
                      <Input
                        value={headerConfig.name}
                        onChange={(e) => setHeaderConfig({ ...headerConfig, name: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={headerConfig.isActive}
                        onCheckedChange={(checked) =>
                          setHeaderConfig({ ...headerConfig, isActive: checked })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Logo Configuration</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Logo Text</Label>
                        <Input
                          value={headerConfig.logo.text || ""}
                          onChange={(e) =>
                            setHeaderConfig({
                              ...headerConfig,
                              logo: { ...headerConfig.logo, text: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Logo Image URL</Label>
                        <Input
                          value={headerConfig.logo.imageUrl || ""}
                          onChange={(e) =>
                            setHeaderConfig({
                              ...headerConfig,
                              logo: { ...headerConfig.logo, imageUrl: e.target.value },
                            })
                          }
                          placeholder="/logo.png"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Style Settings</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <Input
                          type="color"
                          value={headerConfig.style?.backgroundColor || "#ffffff"}
                          onChange={(e) =>
                            setHeaderConfig({
                              ...headerConfig,
                              style: { ...headerConfig.style, backgroundColor: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={headerConfig.style?.textColor || "#000000"}
                          onChange={(e) =>
                            setHeaderConfig({
                              ...headerConfig,
                              style: { ...headerConfig.style, textColor: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hover Color</Label>
                        <Input
                          type="color"
                          value={headerConfig.style?.hoverColor || "#3b82f6"}
                          onChange={(e) =>
                            setHeaderConfig({
                              ...headerConfig,
                              style: { ...headerConfig.style, hoverColor: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Navigation Items</CardTitle>
                      <CardDescription>Manage header navigation links</CardDescription>
                    </div>
                    <Button onClick={addNavigationItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {headerConfig.navigation.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No navigation items yet. Click "Add Item" to create one.
                    </div>
                  ) : (
                    headerConfig.navigation.map((item, index) => (
                      <Card key={item.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={item.isEnabled ? "default" : "secondary"}>
                                {item.isEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </Badge>
                              <span className="font-semibold">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveNavigationItem(index, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveNavigationItem(index, "down")}
                                disabled={index === headerConfig.navigation.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNavigationItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Input
                                value={item.label}
                                onChange={(e) =>
                                  updateNavigationItem(index, { label: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL</Label>
                              <Input
                                value={item.url}
                                onChange={(e) =>
                                  updateNavigationItem(index, { url: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={item.type}
                                onValueChange={(value) =>
                                  updateNavigationItem(index, { type: value as any })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="dropdown">Dropdown</SelectItem>
                                  <SelectItem value="button">Button</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={item.isEnabled}
                                onCheckedChange={(checked) =>
                                  updateNavigationItem(index, { isEnabled: checked })
                                }
                              />
                              <Label>Enabled</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={item.openInNewTab || false}
                                onCheckedChange={(checked) =>
                                  updateNavigationItem(index, { openInNewTab: checked })
                                }
                              />
                              <Label>Open in New Tab</Label>
                            </div>
                          </div>

                          {/* Sub-items section */}
                          {(item.type === "dropdown" || item.type === "megamenu") && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-sm">Sub-items</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSubItem(index)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Sub-item
                                </Button>
                              </div>

                              {item.children && item.children.length > 0 ? (
                                <div className="space-y-2">
                                  {item.children.map((subItem, subIndex) => (
                                    <div
                                      key={subItem.id}
                                      className="p-3 bg-muted rounded-md space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{subItem.label}</span>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveSubItem(index, subIndex, "up")}
                                            disabled={subIndex === 0}
                                          >
                                            <ChevronUp className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveSubItem(index, subIndex, "down")}
                                            disabled={subIndex === item.children!.length - 1}
                                          >
                                            <ChevronDown className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteSubItem(index, subIndex)}
                                          >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs">Label</Label>
                                          <Input
                                            value={subItem.label}
                                            onChange={(e) =>
                                              updateSubItem(index, subIndex, {
                                                label: e.target.value,
                                              })
                                            }
                                            className="h-8 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">URL</Label>
                                          <Input
                                            value={subItem.url}
                                            onChange={(e) =>
                                              updateSubItem(index, subIndex, {
                                                url: e.target.value,
                                              })
                                            }
                                            className="h-8 text-sm"
                                          />
                                        </div>
                                      </div>
                                      {subItem.description !== undefined && (
                                        <div className="space-y-1">
                                          <Label className="text-xs">Description</Label>
                                          <Input
                                            value={subItem.description || ""}
                                            onChange={(e) =>
                                              updateSubItem(index, subIndex, {
                                                description: e.target.value,
                                              })
                                            }
                                            className="h-8 text-sm"
                                            placeholder="Optional description"
                                          />
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={subItem.isEnabled}
                                          onCheckedChange={(checked) =>
                                            updateSubItem(index, subIndex, {
                                              isEnabled: checked,
                                            })
                                          }
                                        />
                                        <Label className="text-xs">Enabled</Label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No sub-items yet. Click "Add Sub-item" to create one.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Footer Configuration */}
        <TabsContent value="footer" className="space-y-6">
          {footerConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure footer appearance and content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Configuration Name</Label>
                    <Input
                      value={footerConfig.name}
                      onChange={(e) => setFooterConfig({ ...footerConfig, name: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={footerConfig.isActive}
                      onCheckedChange={(checked) =>
                        setFooterConfig({ ...footerConfig, isActive: checked })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input
                    value={footerConfig.copyright?.text || ""}
                    onChange={(e) =>
                      setFooterConfig({
                        ...footerConfig,
                        copyright: {
                          ...footerConfig.copyright,
                          text: e.target.value,
                          year: footerConfig.copyright?.year || "auto",
                        },
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Style Settings</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={footerConfig.style?.backgroundColor || "#1f2937"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            style: { ...footerConfig.style, backgroundColor: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={footerConfig.style?.textColor || "#ffffff"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            style: { ...footerConfig.style, textColor: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link Color</Label>
                      <Input
                        type="color"
                        value={footerConfig.style?.linkColor || "#60a5fa"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            style: { ...footerConfig.style, linkColor: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Columns */}
          {footerConfig && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Footer Columns</CardTitle>
                    <CardDescription>Manage footer link columns</CardDescription>
                  </div>
                  <Button onClick={addFooterColumn}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {footerConfig.columns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No footer columns yet. Click "Add Column" to create one.
                  </div>
                ) : (
                  footerConfig.columns.map((column, colIndex) => (
                    <Card key={column.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={column.isEnabled ? "default" : "secondary"}>
                              {column.isEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </Badge>
                            <span className="font-semibold">{column.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFooterColumn(colIndex, "up")}
                              disabled={colIndex === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFooterColumn(colIndex, "down")}
                              disabled={colIndex === footerConfig.columns.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFooterColumn(colIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Column Title</Label>
                            <Input
                              value={column.title}
                              onChange={(e) =>
                                updateFooterColumn(colIndex, { title: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={column.isEnabled}
                              onCheckedChange={(checked) =>
                                updateFooterColumn(colIndex, { isEnabled: checked })
                              }
                            />
                            <Label>Enabled</Label>
                          </div>
                        </div>

                        {/* Links section */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-sm">Links</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addFooterLink(colIndex)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Link
                            </Button>
                          </div>

                          {column.links && column.links.length > 0 ? (
                            <div className="space-y-2">
                              {column.links.map((link, linkIndex) => (
                                <div
                                  key={link.id}
                                  className="p-3 bg-muted rounded-md space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{link.label}</span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveFooterLink(colIndex, linkIndex, "up")}
                                        disabled={linkIndex === 0}
                                      >
                                        <ChevronUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveFooterLink(colIndex, linkIndex, "down")}
                                        disabled={linkIndex === column.links.length - 1}
                                      >
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteFooterLink(colIndex, linkIndex)}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Label</Label>
                                      <Input
                                        value={link.label}
                                        onChange={(e) =>
                                          updateFooterLink(colIndex, linkIndex, {
                                            label: e.target.value,
                                          })
                                        }
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">URL</Label>
                                      <Input
                                        value={link.url}
                                        onChange={(e) =>
                                          updateFooterLink(colIndex, linkIndex, {
                                            url: e.target.value,
                                          })
                                        }
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={link.isEnabled}
                                        onCheckedChange={(checked) =>
                                          updateFooterLink(colIndex, linkIndex, {
                                            isEnabled: checked,
                                          })
                                        }
                                      />
                                      <Label className="text-xs">Enabled</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={link.openInNewTab || false}
                                        onCheckedChange={(checked) =>
                                          updateFooterLink(colIndex, linkIndex, {
                                            openInNewTab: checked,
                                          })
                                        }
                                      />
                                      <Label className="text-xs">Open in New Tab</Label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No links yet. Click "Add Link" to create one.
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
