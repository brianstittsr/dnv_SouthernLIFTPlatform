"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Zap,
  Video,
  Brain,
  Server,
  Webhook,
  Key,
  RefreshCw,
  Send,
  User,
  Loader2,
  FileSignature,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Monitor,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Instagram,
  Globe,
  Navigation,
  LayoutDashboard,
} from "lucide-react";
import { ALL_NAV_ITEMS } from "@/components/portal/portal-sidebar";
import { cn } from "@/lib/utils";
import { WEBHOOK_EVENTS, testWebhookConnection, sendToBrianStitt, type WebhookEventType } from "@/lib/mattermost";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type PlatformSettingsDoc } from "@/lib/schema";
import { logSettingsUpdated } from "@/lib/activity-logger";
import { 
  showInAppNotification, 
  requestNotificationPermission, 
  getBrowserNotificationStatus 
} from "@/lib/notifications";

interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  keyField: string;
  webhookField?: string;
  additionalFields?: { name: string; label: string; placeholder: string }[];
  status: "connected" | "disconnected" | "error";
  lastTested?: string;
}

const apiConfigs: ApiKeyConfig[] = [
  {
    id: "mattermost",
    name: "Mattermost",
    description: "Team communication and collaboration platform",
    icon: MessageSquare,
    keyField: "Personal Access Token",
    webhookField: "Incoming Webhook URL",
    additionalFields: [
      { name: "serverUrl", label: "Server URL", placeholder: "https://your-mattermost-server.com" },
      { name: "teamId", label: "Team ID", placeholder: "team-id" },
    ],
    status: "disconnected",
  },
  {
    id: "apollo",
    name: "Apollo.AI",
    description: "Sales intelligence and engagement platform",
    icon: Zap,
    keyField: "API Key",
    additionalFields: [
      { name: "accountId", label: "Account ID", placeholder: "your-account-id" },
    ],
    status: "disconnected",
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "All-in-one marketing and CRM platform",
    icon: Zap,
    keyField: "Private API Key",
    additionalFields: [
      { name: "locationId", label: "Location ID", placeholder: "location-id" },
      { name: "agencyId", label: "Agency ID", placeholder: "agency-id" },
    ],
    status: "disconnected",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing and meetings",
    icon: Video,
    keyField: "API Key",
    additionalFields: [
      { name: "apiSecret", label: "API Secret", placeholder: "your-api-secret" },
      { name: "accountId", label: "Account ID", placeholder: "account-id" },
    ],
    status: "disconnected",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional networking and content publishing",
    icon: Zap,
    keyField: "Access Token",
    additionalFields: [
      { name: "clientId", label: "Client ID", placeholder: "your-client-id" },
      { name: "clientSecret", label: "Client Secret", placeholder: "your-client-secret" },
      { name: "organizationId", label: "Organization ID (optional)", placeholder: "organization-urn" },
    ],
    status: "disconnected",
  },
  {
    id: "mercury",
    name: "Mercury Bank",
    description: "Business banking with API access for accounts and transactions",
    icon: Server,
    keyField: "API Token",
    additionalFields: [],
    status: "disconnected",
  },
];

const llmProviders = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
  { id: "google", name: "Google AI", models: ["gemini-pro", "gemini-ultra"] },
  { id: "mistral", name: "Mistral AI", models: ["mistral-large", "mistral-medium", "mistral-small"] },
  { id: "ollama", name: "Ollama (Local)", models: ["llama2", "codellama", "mistral", "mixtral"] },
];

const SETTINGS_DOC_ID = "global";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "integrations";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, "testing" | "success" | "error" | null>>({});
  const [webhookEvents, setWebhookEvents] = useState<Record<WebhookEventType, boolean>>(
    WEBHOOK_EVENTS.reduce((acc, event) => ({ ...acc, [event.type]: event.enabled }), {} as Record<WebhookEventType, boolean>)
  );
  const [brianStittMessage, setBrianStittMessage] = useState("");
  const [brianStittDialogOpen, setBrianStittDialogOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [llmConfig, setLlmConfig] = useState({
    provider: "openai",
    model: "gpt-4o",
    apiKey: "",
    ollamaUrl: "http://localhost:11434",
    useOllama: false,
  });
  
  // Social links settings
  const [socialLinks, setSocialLinks] = useState({
    linkedin: { url: "", visible: true },
    twitter: { url: "", visible: true },
    youtube: { url: "", visible: true },
    facebook: { url: "", visible: false },
    instagram: { url: "", visible: false },
  });
  
  // Notification sync settings
  const [notificationSettings, setNotificationSettings] = useState({
    syncWithMattermost: true,
    inAppEnabled: true,
    browserEnabled: false,
    soundEnabled: false,
  });
  const [browserPermission, setBrowserPermission] = useState<string>("default");
  
  // UI Preferences
  const [uiPreferences, setUiPreferences] = useState({
    showAskAI: false, // Hidden by default
  });
  
  // Navigation settings - role-based visibility
  const [navigationSettings, setNavigationSettings] = useState<{
    hiddenItems: string[];
    roleVisibility: Record<string, string[]>; // role -> array of hidden item hrefs
  }>({
    hiddenItems: [],
    roleVisibility: {
      admin: [],
      "team-member": [],
      affiliate: [],
      client: [],
      viewer: [],
    },
  });
  
  // Available roles for visibility settings
  const VISIBILITY_ROLES = [
    { value: "admin", label: "Admin" },
    { value: "team-member", label: "Team Member" },
    { value: "affiliate", label: "Affiliate" },
    { value: "client", label: "Client" },
    { value: "viewer", label: "Viewer" },
  ];

  // Load settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!db) {
        console.error("Firebase not initialized");
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as PlatformSettingsDoc;
          
          // Load integrations into apiKeys state
          if (data.integrations) {
            const loadedApiKeys: Record<string, Record<string, string>> = {};
            
            if (data.integrations.mattermost) {
              loadedApiKeys.mattermost = {
                apiKey: data.integrations.mattermost.apiKey || "",
                webhook: data.integrations.mattermost.webhookUrl || "",
                serverUrl: data.integrations.mattermost.serverUrl || "",
                teamId: data.integrations.mattermost.teamId || "",
              };
            }
            if (data.integrations.apollo) {
              loadedApiKeys.apollo = {
                apiKey: data.integrations.apollo.apiKey || "",
                accountId: data.integrations.apollo.accountId || "",
              };
            }
            if (data.integrations.gohighlevel) {
              loadedApiKeys.gohighlevel = {
                apiKey: data.integrations.gohighlevel.apiKey || "",
                locationId: data.integrations.gohighlevel.locationId || "",
                agencyId: data.integrations.gohighlevel.agencyId || "",
              };
            }
            if (data.integrations.zoom) {
              loadedApiKeys.zoom = {
                apiKey: data.integrations.zoom.apiKey || "",
                apiSecret: data.integrations.zoom.apiSecret || "",
                accountId: data.integrations.zoom.accountId || "",
              };
            }
            setApiKeys(loadedApiKeys);
          }
          
          // Load LLM config
          if (data.llmConfig) {
            setLlmConfig({
              provider: data.llmConfig.provider || "openai",
              model: data.llmConfig.model || "gpt-4o",
              apiKey: data.llmConfig.apiKey || "",
              ollamaUrl: data.llmConfig.ollamaUrl || "http://localhost:11434",
              useOllama: data.llmConfig.useOllama || false,
            });
          }
          
          // Load webhook events
          if (data.webhookEvents) {
            setWebhookEvents(prev => ({ ...prev, ...data.webhookEvents }));
          }
          
          // Load notification settings
          if (data.notificationSettings) {
            setNotificationSettings(prev => ({ ...prev, ...data.notificationSettings }));
          }
          
          // Load social links
          if (data.socialLinks) {
            setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
          }
          
          // Load navigation settings
          if (data.navigationSettings) {
            setNavigationSettings({
              hiddenItems: data.navigationSettings.hiddenItems || [],
              roleVisibility: data.navigationSettings.roleVisibility || {
                admin: [],
                "team-member": [],
                affiliate: [],
                client: [],
                viewer: [],
              },
            });
          }
          
          // Load UI preferences
          if (data.uiPreferences) {
            setUiPreferences({
              showAskAI: data.uiPreferences.showAskAI ?? false,
            });
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
    
    // Check browser notification permission
    setBrowserPermission(getBrowserNotificationStatus());
  }, []);

  // Save settings to Firebase
  const saveSettings = async () => {
    if (!db) {
      alert("Firebase not initialized. Check your environment variables.");
      return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
      
      // Build settings data, using empty strings instead of undefined
      const settingsData = {
        id: SETTINGS_DOC_ID,
        integrations: {
          mattermost: {
            apiKey: apiKeys.mattermost?.apiKey || "",
            webhookUrl: apiKeys.mattermost?.webhook || "",
            serverUrl: apiKeys.mattermost?.serverUrl || "",
            teamId: apiKeys.mattermost?.teamId || "",
            status: testingStatus.mattermost === "success" ? "connected" : "disconnected",
          },
          apollo: {
            apiKey: apiKeys.apollo?.apiKey || "",
            accountId: apiKeys.apollo?.accountId || "",
            status: testingStatus.apollo === "success" ? "connected" : "disconnected",
          },
          gohighlevel: {
            apiKey: apiKeys.gohighlevel?.apiKey || "",
            locationId: apiKeys.gohighlevel?.locationId || "",
            agencyId: apiKeys.gohighlevel?.agencyId || "",
            status: testingStatus.gohighlevel === "success" ? "connected" : "disconnected",
          },
          zoom: {
            apiKey: apiKeys.zoom?.apiKey || "",
            apiSecret: apiKeys.zoom?.apiSecret || "",
            accountId: apiKeys.zoom?.accountId || "",
            status: testingStatus.zoom === "success" ? "connected" : "disconnected",
          },
        },
        llmConfig: {
          provider: llmConfig.provider,
          model: llmConfig.model,
          apiKey: llmConfig.apiKey || "",
          ollamaUrl: llmConfig.ollamaUrl,
          useOllama: llmConfig.useOllama,
        },
        webhookEvents: webhookEvents as Record<string, boolean>,
        notificationSettings: notificationSettings,
        socialLinks: socialLinks,
        navigationSettings: navigationSettings,
        uiPreferences: uiPreferences,
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(docRef, settingsData, { merge: true });
      setHasChanges(false);
      // Log activity
      await logSettingsUpdated("Platform Settings");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateApiKey = (configId: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [configId]: { ...prev[configId], [field]: value },
    }));
    setHasChanges(true);
  };

  const testConnection = async (configId: string) => {
    setTestingStatus(prev => ({ ...prev, [configId]: "testing" }));
    
    if (configId === "webhook" || configId === "mattermost") {
      // Test actual Mattermost webhook
      const webhookUrl = apiKeys["mattermost"]?.webhook || apiKeys["webhook"]?.url;
      if (webhookUrl) {
        const result = await testWebhookConnection(webhookUrl);
        setTestingStatus(prev => ({ 
          ...prev, 
          [configId]: result.success ? "success" : "error" 
        }));
        if (!result.success) {
          alert(`Webhook test failed: ${result.error}`);
        }
        return;
      }
    }
    
    // Simulate API test for other integrations
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingStatus(prev => ({ 
      ...prev, 
      [configId]: Math.random() > 0.3 ? "success" : "error" 
    }));
  };

  const handleSendToBrianStitt = async () => {
    const webhookUrl = apiKeys["mattermost"]?.webhook;
    if (!webhookUrl) {
      alert("Please configure the Mattermost webhook URL first in the Integrations tab.");
      return;
    }
    if (!brianStittMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    setSendingMessage(true);
    const result = await sendToBrianStitt(webhookUrl, brianStittMessage, {
      "Sent By": "SVP Platform User",
      "Timestamp": new Date().toLocaleString(),
    });
    setSendingMessage(false);

    if (result.success) {
      alert("Message sent to Brian Stitt successfully!");
      setBrianStittMessage("");
      setBrianStittDialogOpen(false);
    } else {
      alert(`Failed to send message: ${result.error}`);
    }
  };

  const toggleWebhookEvent = (eventType: WebhookEventType) => {
    setWebhookEvents(prev => ({ ...prev, [eventType]: !prev[eventType] }));
    setHasChanges(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage API keys, webhooks, and integrations
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : hasChanges ? "Save Changes" : "Save All Settings"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="llm">LLM Configuration</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="ui">UI Preferences</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {apiConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <config.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {config.name}
                          <Badge
                            variant={
                              testingStatus[config.id] === "success"
                                ? "default"
                                : testingStatus[config.id] === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {testingStatus[config.id] === "success"
                              ? "Connected"
                              : testingStatus[config.id] === "error"
                              ? "Error"
                              : "Not Connected"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(config.id)}
                      disabled={testingStatus[config.id] === "testing"}
                    >
                      {testingStatus[config.id] === "testing" ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${config.id}-key`}>{config.keyField}</Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}-key`}
                          type={showKeys[config.id] ? "text" : "password"}
                          placeholder={`Enter your ${config.keyField.toLowerCase()}`}
                          value={apiKeys[config.id]?.apiKey || ""}
                          onChange={(e) => updateApiKey(config.id, "apiKey", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => toggleShowKey(config.id)}
                        >
                          {showKeys[config.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {config.webhookField && (
                      <div className="space-y-2">
                        <Label htmlFor={`${config.id}-webhook`}>{config.webhookField}</Label>
                        <Input
                          id={`${config.id}-webhook`}
                          placeholder={`Enter your ${config.webhookField.toLowerCase()}`}
                          value={apiKeys[config.id]?.webhook || ""}
                          onChange={(e) => updateApiKey(config.id, "webhook", e.target.value)}
                        />
                      </div>
                    )}

                    {config.additionalFields?.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={`${config.id}-${field.name}`}>{field.label}</Label>
                        <Input
                          id={`${config.id}-${field.name}`}
                          placeholder={field.placeholder}
                          value={apiKeys[config.id]?.[field.name] || ""}
                          onChange={(e) => updateApiKey(config.id, field.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LLM Configuration Tab */}
        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>LLM Provider Configuration</CardTitle>
                  <CardDescription>
                    Configure your preferred Large Language Model provider
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Use Ollama (Local LLM)</Label>
                    <p className="text-sm text-muted-foreground">
                      Run models locally without API costs
                    </p>
                  </div>
                </div>
                <Switch
                  checked={llmConfig.useOllama}
                  onCheckedChange={(checked) =>
                    setLlmConfig({ ...llmConfig, useOllama: checked, provider: checked ? "ollama" : "openai" })
                  }
                />
              </div>

              {llmConfig.useOllama ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ollamaUrl">Ollama Server URL</Label>
                    <Input
                      id="ollamaUrl"
                      placeholder="http://localhost:11434"
                      value={llmConfig.ollamaUrl}
                      onChange={(e) => setLlmConfig({ ...llmConfig, ollamaUrl: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Default: http://localhost:11434
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ollamaModel">Model</Label>
                    <Select
                      value={llmConfig.model}
                      onValueChange={(value) => setLlmConfig({ ...llmConfig, model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.find(p => p.id === "ollama")?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Ollama Setup Instructions</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Install Ollama from <a href="https://ollama.ai" className="text-primary underline" target="_blank">ollama.ai</a></li>
                      <li>Run: <code className="bg-background px-1 rounded">ollama pull llama2</code></li>
                      <li>Start Ollama: <code className="bg-background px-1 rounded">ollama serve</code></li>
                      <li>Test connection above</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="llmProvider">Provider</Label>
                    <Select
                      value={llmConfig.provider}
                      onValueChange={(value) => {
                        const provider = llmProviders.find(p => p.id === value);
                        setLlmConfig({
                          ...llmConfig,
                          provider: value,
                          model: provider?.models[0] || "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.filter(p => p.id !== "ollama").map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="llmModel">Model</Label>
                    <Select
                      value={llmConfig.model}
                      onValueChange={(value) => setLlmConfig({ ...llmConfig, model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.find(p => p.id === llmConfig.provider)?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="llmApiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="llmApiKey"
                        type={showKeys["llm"] ? "text" : "password"}
                        placeholder="Enter your API key"
                        value={llmConfig.apiKey}
                        onChange={(e) => setLlmConfig({ ...llmConfig, apiKey: e.target.value })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => toggleShowKey("llm")}
                      >
                        {showKeys["llm"] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => testConnection("llm")}
                disabled={testingStatus["llm"] === "testing"}
              >
                {testingStatus["llm"] === "testing" ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : testingStatus["llm"] === "success" ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : testingStatus["llm"] === "error" ? (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                ) : (
                  <TestTube className="mr-2 h-4 w-4" />
                )}
                Test LLM Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          {/* Send to Brian Stitt - Featured Card */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Send to Brian Stitt
                      <Badge variant="default">Quick Action</Badge>
                    </CardTitle>
                    <CardDescription>
                      Send a direct message to Brian Stitt&apos;s Mattermost channel
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={brianStittDialogOpen} onOpenChange={setBrianStittDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Send Message to Brian Stitt</DialogTitle>
                      <DialogDescription>
                        This message will be sent directly to Brian Stitt&apos;s Mattermost channel via webhook.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="brianMessage">Message</Label>
                        <Textarea
                          id="brianMessage"
                          placeholder="Enter your message here..."
                          value={brianStittMessage}
                          onChange={(e) => setBrianStittMessage(e.target.value)}
                          rows={5}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>The message will include:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Your message content</li>
                          <li>Timestamp</li>
                          <li>Sender information</li>
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBrianStittDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendToBrianStitt} disabled={sendingMessage}>
                        {sendingMessage ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Send Message
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Webhook className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Webhook Configuration</CardTitle>
                  <CardDescription>
                    Configure webhooks for real-time event notifications to Mattermost
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to Mattermost → Main Menu → Integrations → Incoming Webhooks</li>
                  <li>Click &quot;Add Incoming Webhook&quot;</li>
                  <li>Select the channel (e.g., &quot;SVP Notifications&quot;)</li>
                  <li>Copy the webhook URL and paste it below</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mattermostWebhook">Mattermost Webhook URL</Label>
                <Input
                  id="mattermostWebhook"
                  placeholder="https://your-mattermost.com/hooks/xxx-xxx-xxx"
                  value={apiKeys["mattermost"]?.webhook || ""}
                  onChange={(e) => updateApiKey("mattermost", "webhook", e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => testConnection("webhook")}
                  disabled={testingStatus["webhook"] === "testing" || !apiKeys["mattermost"]?.webhook}
                >
                  {testingStatus["webhook"] === "testing" ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : testingStatus["webhook"] === "success" ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : testingStatus["webhook"] === "error" ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  ) : (
                    <TestTube className="mr-2 h-4 w-4" />
                  )}
                  Test Webhook
                </Button>
                {testingStatus["webhook"] === "success" && (
                  <Badge variant="default" className="self-center">Connected</Badge>
                )}
                {testingStatus["webhook"] === "error" && (
                  <Badge variant="destructive" className="self-center">Failed</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Choose which events trigger webhook notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <div 
                    key={event.type} 
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg transition-colors",
                      event.type === "send_to_brian_stitt" && "border-primary/50 bg-primary/5",
                      webhookEvents[event.type] && "border-green-500/50 bg-green-500/5"
                    )}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{event.label}</span>
                        {event.type === "send_to_brian_stitt" && (
                          <Badge variant="outline" className="text-xs">Featured</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <Switch 
                      checked={webhookEvents[event.type]} 
                      onCheckedChange={() => toggleWebhookEvent(event.type)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Webhook Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Payload Examples</CardTitle>
              <CardDescription>
                Reference examples based on Mattermost incoming webhook documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Text Message */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge variant="outline">Basic</Badge>
                  Simple Text Message
                </h4>
                <p className="text-sm text-muted-foreground">
                  The simplest webhook payload - just send text content.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "text": "Hello, this is some text\\nThis is more text. 🎉"
}`}
                </pre>
              </div>

              {/* With Username and Icon */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge variant="outline">Customized</Badge>
                  Custom Username & Icon
                </h4>
                <p className="text-sm text-muted-foreground">
                  Override the bot username and avatar icon.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "channel": "town-square",
  "username": "SVP-Bot",
  "icon_url": "https://your-site.com/logo.png",
  "icon_emoji": ":rocket:",
  "text": "#### New notification from SVP Platform"
}`}
                </pre>
              </div>

              {/* Markdown Table */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge variant="outline">Advanced</Badge>
                  Markdown with Tables
                </h4>
                <p className="text-sm text-muted-foreground">
                  Rich formatting with markdown tables and @mentions.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "channel": "svp-notifications",
  "username": "test-automation",
  "icon_url": "https://mattermost.com/wp-content/uploads/2022/02/icon.png",
  "text": "#### Test results for July 27th, 2024\\n@channel please review.\\n\\n| Component | Tests Run | Tests Failed |\\n|:-----------|:-----------:|:--------------|\\n| Server | 948 | ✅ 0 |\\n| Web Client | 123 | ⚠️ 2 |\\n| iOS Client | 78 | ⚠️ 3 |"
}`}
                </pre>
              </div>

              {/* With Attachments */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge variant="outline">Rich</Badge>
                  Message Attachments
                </h4>
                <p className="text-sm text-muted-foreground">
                  Structured attachments with colors, fields, and formatting.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "channel": "deals",
  "username": "SVP Platform",
  "text": "### 🎯 New Lead Created",
  "attachments": [{
    "fallback": "New lead from Precision Parts",
    "color": "#36a64f",
    "pretext": "A new lead has been added to the pipeline",
    "author_name": "Sarah Mitchell",
    "author_icon": "https://example.com/avatar.png",
    "title": "Precision Parts Manufacturing",
    "title_link": "https://svp-platform.com/leads/123",
    "fields": [
      { "title": "Contact", "value": "John Harrison", "short": true },
      { "title": "Value", "value": "$150,000", "short": true },
      { "title": "Source", "value": "Referral", "short": true },
      { "title": "Stage", "value": "Discovery", "short": true }
    ],
    "footer": "SVP Platform",
    "footer_icon": "https://svp-platform.com/icon.png"
  }]
}`}
                </pre>
              </div>

              {/* With Props Card (Side Panel) */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge variant="outline">Extended</Badge>
                  Side Panel Card
                </h4>
                <p className="text-sm text-muted-foreground">
                  Display additional details in the right-hand side panel using the card property.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "channel": "deals",
  "username": "Winning-bot",
  "text": "#### 🎉 We won a new deal!",
  "props": {
    "card": "**Deal Information:**\\n\\n[View in CRM](https://crm.example.com/deal/123)\\n\\n- **Salesperson:** Bob McKnight\\n- **Amount:** $300,020.00\\n- **Close Date:** Dec 15, 2024\\n- **Product:** V-Edge Assessment"
  }
}`}
                </pre>
              </div>

              {/* Direct Message */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge variant="outline">DM</Badge>
                  Direct Message to User
                </h4>
                <p className="text-sm text-muted-foreground">
                  Send a direct message to a specific user using @username.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "channel": "@brian.stitt",
  "username": "SVP Platform",
  "text": "### 📬 Direct Message\\n\\nHey Brian, you have a new referral waiting for review!\\n\\n[View Referral](https://svp-platform.com/referrals/456)"
}`}
                </pre>
              </div>

              {/* SVP Platform Event Example */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>SVP</Badge>
                  One-to-One Meeting Scheduled
                </h4>
                <p className="text-sm text-muted-foreground">
                  Example of an SVP Platform event notification.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "username": "SVP Platform",
  "icon_emoji": ":handshake:",
  "text": "### 🤝 One-to-One Meeting Scheduled",
  "attachments": [{
    "color": "#0066cc",
    "fields": [
      { "title": "Initiator", "value": "Sarah Mitchell", "short": true },
      { "title": "Partner", "value": "Marcus Chen", "short": true },
      { "title": "Date", "value": "Dec 15, 2024 at 10:00 AM", "short": true },
      { "title": "Location", "value": "Starbucks, South Blvd", "short": true }
    ],
    "footer": "SVP Platform • Affiliate Networking"
  }]
}`}
                </pre>
              </div>

              {/* Referral Submitted Example */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>SVP</Badge>
                  Referral Submitted
                </h4>
                <p className="text-sm text-muted-foreground">
                  Notification when an affiliate submits a referral.
                </p>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`{
  "username": "SVP Platform",
  "icon_emoji": ":link:",
  "text": "### 🔗 New Referral Submitted",
  "attachments": [{
    "color": "#e74c3c",
    "fields": [
      { "title": "From", "value": "Jennifer Rodriguez", "short": true },
      { "title": "To", "value": "David Thompson", "short": true },
      { "title": "Prospect", "value": "Maria Gonzalez", "short": true },
      { "title": "Company", "value": "Lean Machine Shop", "short": true },
      { "title": "SVP Referral", "value": "Yes ⭐", "short": true },
      { "title": "Est. Value", "value": "$75,000", "short": true }
    ],
    "footer": "SVP Platform • Referral Network"
  }],
  "props": {
    "card": "**Referral Details:**\\n\\n- **Type:** Short-term\\n- **Service Interest:** V-Edge Assessment\\n- **Description:** Completed lean transformation, now ready for automation assessment.\\n\\n[View Full Referral](https://svp-platform.com/referrals/ref-002)"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Sync with Mattermost */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary">
                  <BellRing className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Sync with Mattermost
                    <Badge variant="default">Playbooks</Badge>
                  </CardTitle>
                  <CardDescription>
                    Mirror Mattermost notifications in the browser when the site is open
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Sync Mattermost Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, webhook events sent to Mattermost will also appear as in-browser notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.syncWithMattermost}
                  onCheckedChange={(checked) => {
                    setNotificationSettings(prev => ({ ...prev, syncWithMattermost: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This allows you to see real-time notifications for Rocks, Issues, To-Dos, Meetings, and other Traction/EOS events 
                directly in your browser, mirroring what gets sent to your Mattermost channels.
              </p>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>
                    Configure how notifications appear within the SVP Platform
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Toast Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show popup notifications in the corner of the screen
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.inAppEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationSettings(prev => ({ ...prev, inAppEnabled: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {notificationSettings.soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-primary" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when notifications arrive
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Browser Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BellRing className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Browser Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications even when the browser tab is in the background
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Browser Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show system notifications from your browser
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {browserPermission === "granted" ? (
                    <Badge variant="default" className="mr-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : browserPermission === "denied" ? (
                    <Badge variant="destructive" className="mr-2">
                      <XCircle className="h-3 w-3 mr-1" />
                      Blocked
                    </Badge>
                  ) : browserPermission === "unsupported" ? (
                    <Badge variant="secondary" className="mr-2">
                      Not Supported
                    </Badge>
                  ) : null}
                  <Switch
                    checked={notificationSettings.browserEnabled}
                    disabled={browserPermission === "denied" || browserPermission === "unsupported"}
                    onCheckedChange={async (checked) => {
                      if (checked && browserPermission !== "granted") {
                        const permission = await requestNotificationPermission();
                        setBrowserPermission(permission);
                        if (permission !== "granted") {
                          return;
                        }
                      }
                      setNotificationSettings(prev => ({ ...prev, browserEnabled: checked }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {browserPermission === "denied" && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Browser notifications blocked</p>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ve blocked notifications for this site. To enable them, click the lock icon in your browser&apos;s address bar and change the notification setting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {browserPermission === "default" && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    When you enable browser notifications, you&apos;ll be prompted to allow notifications from this site.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Notification */}
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>
                Send a test notification to verify your settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    showInAppNotification("rock_completed", {
                      title: "Test Rock",
                      name: "Q4 Revenue Target",
                    });
                  }}
                  disabled={!notificationSettings.inAppEnabled}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Test Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    showInAppNotification("rock_at_risk", {
                      title: "Test Warning",
                      name: "Customer Onboarding Process",
                    });
                  }}
                  disabled={!notificationSettings.inAppEnabled}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Test Warning
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    showInAppNotification("new_lead", {
                      name: "Precision Manufacturing Co.",
                      company: "Precision Manufacturing Co.",
                    });
                  }}
                  disabled={!notificationSettings.inAppEnabled}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Test Success
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                These test notifications demonstrate how different event types will appear in your browser.
              </p>
            </CardContent>
          </Card>

          {/* Notification Events */}
          <Card>
            <CardHeader>
              <CardTitle>Synced Event Types</CardTitle>
              <CardDescription>
                These events will trigger in-browser notifications when synced with Mattermost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {WEBHOOK_EVENTS.filter(e => e.type !== "send_to_brian_stitt").map((event) => (
                  <div 
                    key={event.type}
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg text-sm",
                      webhookEvents[event.type] ? "border-green-500/30 bg-green-500/5" : "opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      webhookEvents[event.type] ? "bg-green-500" : "bg-muted-foreground"
                    )} />
                    <div>
                      <span className="font-medium">{event.label}</span>
                      {event.category === "traction" && (
                        <Badge variant="outline" className="ml-2 text-xs">EOS</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Enable or disable specific events in the <strong>Webhooks</strong> tab. Events that are enabled there will also trigger in-browser notifications when sync is active.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>
                    Configure social media links displayed in the footer. Links are only visible when a URL is provided and visibility is enabled.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LinkedIn */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#0077B5]/10">
                  <Linkedin className="h-5 w-5 text-[#0077B5]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="linkedin-url">LinkedIn</Label>
                  <Input
                    id="linkedin-url"
                    placeholder="https://linkedin.com/company/your-company"
                    value={socialLinks.linkedin.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="linkedin-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="linkedin-visible"
                    checked={socialLinks.linkedin.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Twitter/X */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-black/10">
                  <Twitter className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="twitter-url">Twitter / X</Label>
                  <Input
                    id="twitter-url"
                    placeholder="https://twitter.com/your-company"
                    value={socialLinks.twitter.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="twitter-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="twitter-visible"
                    checked={socialLinks.twitter.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#FF0000]/10">
                  <Youtube className="h-5 w-5 text-[#FF0000]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="youtube-url">YouTube</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://youtube.com/@your-channel"
                    value={socialLinks.youtube.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="youtube-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="youtube-visible"
                    checked={socialLinks.youtube.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#1877F2]/10">
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="facebook-url">Facebook</Label>
                  <Input
                    id="facebook-url"
                    placeholder="https://facebook.com/your-page"
                    value={socialLinks.facebook.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="facebook-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="facebook-visible"
                    checked={socialLinks.facebook.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10">
                  <Instagram className="h-5 w-5 text-[#E4405F]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="instagram-url">Instagram</Label>
                  <Input
                    id="instagram-url"
                    placeholder="https://instagram.com/your-account"
                    value={socialLinks.instagram.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="instagram-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="instagram-visible"
                    checked={socialLinks.instagram.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Social links appear in the website footer</li>
                  <li>Links are only shown when both a URL is provided AND visibility is enabled</li>
                  <li>Empty URLs will hide the icon regardless of visibility setting</li>
                  <li>Changes take effect after saving</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Preferences Tab */}
        <TabsContent value="ui" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>UI Preferences</CardTitle>
                  <CardDescription>
                    Control the visibility of UI elements across the platform
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ask AI Button Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="show-ask-ai" className="text-base font-medium">Show Ask AI Button</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Display the "Ask AI" button on the Command Center page
                    </p>
                  </div>
                </div>
                <Switch
                  id="show-ask-ai"
                  checked={uiPreferences.showAskAI}
                  onCheckedChange={(checked) => {
                    setUiPreferences({ ...uiPreferences, showAskAI: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  About UI Preferences
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>UI preferences control the visibility of optional interface elements</li>
                  <li>Changes apply platform-wide for all users</li>
                  <li>Hidden elements can be re-enabled at any time</li>
                  <li>Changes take effect immediately after saving</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Navigation Visibility by Role</CardTitle>
                  <CardDescription>
                    Control which navigation items are visible to each user role. Toggle visibility per role.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Legend */}
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground mr-2">Roles:</span>
                {VISIBILITY_ROLES.map((role) => (
                  <Badge key={role.value} variant="outline" className="text-xs">
                    {role.label}
                  </Badge>
                ))}
              </div>

              {/* Group nav items by section */}
              {["Navigation", "Work", "Intelligence", "Admin", "Initiatives"].map((section) => {
                const sectionItems = ALL_NAV_ITEMS.filter(item => item.section === section);
                if (sectionItems.length === 0) return null;
                
                return (
                  <div key={section} className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      {section}
                    </h3>
                    <div className="grid gap-3">
                      {sectionItems.map((item) => {
                        const Icon = item.icon;
                        // Count how many roles have this item hidden
                        const hiddenForRoles = VISIBILITY_ROLES.filter(
                          role => navigationSettings.roleVisibility[role.value]?.includes(item.href)
                        );
                        const visibleForAll = hiddenForRoles.length === 0;
                        const hiddenForAll = hiddenForRoles.length === VISIBILITY_ROLES.length;
                        
                        return (
                          <div
                            key={item.href}
                            className={cn(
                              "p-4 border rounded-lg transition-colors",
                              hiddenForAll ? "bg-muted/50 border-dashed" : "bg-background"
                            )}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-1.5 rounded",
                                  hiddenForAll ? "bg-muted" : "bg-primary/10"
                                )}>
                                  <Icon className={cn(
                                    "h-4 w-4",
                                    hiddenForAll ? "text-muted-foreground" : "text-primary"
                                  )} />
                                </div>
                                <div>
                                  <p className={cn(
                                    "font-medium text-sm",
                                    hiddenForAll && "text-muted-foreground"
                                  )}>
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{item.href}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {visibleForAll ? (
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">All Roles</Badge>
                                ) : hiddenForAll ? (
                                  <Badge variant="secondary" className="text-xs">Hidden for All</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
                                    {VISIBILITY_ROLES.length - hiddenForRoles.length} of {VISIBILITY_ROLES.length} roles
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Role toggles */}
                            <div className="grid grid-cols-5 gap-2">
                              {VISIBILITY_ROLES.map((role) => {
                                const isHiddenForRole = navigationSettings.roleVisibility[role.value]?.includes(item.href);
                                return (
                                  <div
                                    key={role.value}
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded border text-xs",
                                      isHiddenForRole ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                                    )}
                                  >
                                    <span className={cn(
                                      "font-medium truncate",
                                      isHiddenForRole ? "text-red-700" : "text-green-700"
                                    )}>
                                      {role.label}
                                    </span>
                                    <Switch
                                      className="scale-75"
                                      checked={!isHiddenForRole}
                                      onCheckedChange={(checked) => {
                                        setNavigationSettings(prev => {
                                          const currentHidden = prev.roleVisibility[role.value] || [];
                                          const newHidden = checked
                                            ? currentHidden.filter(h => h !== item.href)
                                            : [...currentHidden, item.href];
                                          return {
                                            ...prev,
                                            roleVisibility: {
                                              ...prev.roleVisibility,
                                              [role.value]: newHidden,
                                            },
                                          };
                                        });
                                        setHasChanges(true);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Toggle visibility for each navigation item per user role</li>
                  <li>Green = visible to that role, Red = hidden from that role</li>
                  <li>Admins can always see all items (hidden items appear faded with an eye icon)</li>
                  <li>Use the &quot;Preview as Role&quot; feature in the sidebar to see what each role sees</li>
                  <li>Changes take effect after saving</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
