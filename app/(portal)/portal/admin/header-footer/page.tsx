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
      navigation: [],
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
        enabled: true,
        type: "fade",
        duration: 300,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  function getDefaultFooterConfig(): FooterConfig {
    return {
      name: "Main Footer",
      isActive: true,
      columns: [],
      bottomBar: {
        copyright: "© 2026 Strategic Value Plus. All rights reserved.",
        links: [],
      },
      style: {
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        linkColor: "#60a5fa",
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  async function saveHeaderConfig() {
    if (!headerConfig) return;

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
    if (!footerConfig) return;

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
                    value={footerConfig.bottomBar?.copyright || ""}
                    onChange={(e) =>
                      setFooterConfig({
                        ...footerConfig,
                        bottomBar: {
                          ...footerConfig.bottomBar,
                          copyright: e.target.value,
                          links: footerConfig.bottomBar?.links || [],
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
