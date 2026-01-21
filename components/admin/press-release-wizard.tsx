'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Upload, 
  Download, 
  Save, 
  Eye, 
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  PRESS_RELEASE_BEST_PRACTICES, 
  DEFAULT_BOILERPLATE,
  PRESS_RELEASE_CATEGORIES,
  type PressReleaseFormData 
} from '@/lib/press-releases-schema';

interface PressReleaseWizardProps {
  initialData?: Partial<PressReleaseFormData>;
  onSave?: (data: PressReleaseFormData) => Promise<void>;
}

export function PressReleaseWizard({ initialData, onSave }: PressReleaseWizardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basics');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<PressReleaseFormData>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    location: initialData?.location || 'WASHINGTON, D.C.',
    releaseDate: initialData?.releaseDate || new Date(),
    bulletPoints: initialData?.bulletPoints || '',
    content: initialData?.content || '',
    boilerplate: initialData?.boilerplate || DEFAULT_BOILERPLATE,
    contactInfo: initialData?.contactInfo || {
      name: '',
      email: '',
      phone: '',
      title: 'Media Contact'
    },
    logos: initialData?.logos || [],
    tags: initialData?.tags || [],
    category: initialData?.category || 'Announcement',
    status: initialData?.status || 'draft'
  });

  const [newTag, setNewTag] = useState('');

  const handleEnhanceWithAI = async () => {
    if (!formData.bulletPoints?.trim()) {
      toast.error('Please enter bullet points to enhance');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/ai/enhance-press-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          bulletPoints: formData.bulletPoints,
          location: formData.location,
          category: formData.category
        })
      });

      if (!response.ok) throw new Error('Failed to enhance content');

      const { enhancedContent } = await response.json();
      setFormData(prev => ({ ...prev, content: enhancedContent }));
      toast.success('Content enhanced successfully!');
      setActiveTab('content');
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.error('Failed to enhance content. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      // Upload to Firebase Image Manager
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'logos');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const { imageId, imageUrl } = await response.json();

      setFormData(prev => ({
        ...prev,
        logos: [...prev.logos, {
          id: imageId,
          url: imageUrl,
          name: file.name,
          position: 'header'
        }]
      }));

      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleRemoveLogo = (logoId: string) => {
    setFormData(prev => ({
      ...prev,
      logos: prev.logos.filter(logo => logo.id !== logoId)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/press-release/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `press-release-${format(formData.releaseDate, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in title and content');
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        const response = await fetch('/api/press-releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save');
      }

      toast.success('Press release saved successfully');
      router.push('/portal/admin/press-releases');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save press release');
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'basics':
        return !!(formData.title && formData.location && formData.category);
      case 'content':
        return !!formData.content;
      case 'contact':
        return !!(formData.contactInfo.name && formData.contactInfo.email);
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Press Release Wizard</h2>
          <p className="text-muted-foreground">Create professional press releases with AI assistance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Press Release'}
          </Button>
        </div>
      </div>

      {/* Best Practices Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Best Practice:</strong> Keep your press release concise (400-600 words), 
          newsworthy, and written in third person. Include quotes from key stakeholders.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basics" className="relative">
                Basics
                {validateStep('basics') && (
                  <CheckCircle2 className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="ai-enhance">AI Enhance</TabsTrigger>
              <TabsTrigger value="content" className="relative">
                Content
                {validateStep('content') && (
                  <CheckCircle2 className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="logos">Logos</TabsTrigger>
              <TabsTrigger value="contact" className="relative">
                Contact
                {validateStep('contact') && (
                  <CheckCircle2 className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Basics Tab */}
            <TabsContent value="basics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential details for your press release</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Headline *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Company Announces Major Partnership with..."
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.title.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subheadline (Optional)</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Additional context or key detail"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="WASHINGTON, D.C."
                      />
                    </div>

                    <div>
                      <Label htmlFor="releaseDate">Release Date *</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        value={format(formData.releaseDate, 'yyyy-MM-dd')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          releaseDate: new Date(e.target.value) 
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESS_RELEASE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag..."
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Enhance Tab */}
            <TabsContent value="ai-enhance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Content Enhancement
                  </CardTitle>
                  <CardDescription>
                    Paste your bullet points and let AI transform them into a professional press release
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bulletPoints">Bullet Points</Label>
                    <Textarea
                      id="bulletPoints"
                      value={formData.bulletPoints}
                      onChange={(e) => setFormData(prev => ({ ...prev, bulletPoints: e.target.value }))}
                      placeholder="• Company XYZ announces partnership with ABC Corp&#10;• Partnership will focus on renewable energy solutions&#10;• Expected to create 500 new jobs&#10;• $50M investment over 3 years"
                      rows={10}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter key points as bullet points. AI will format them into a professional press release.
                    </p>
                  </div>

                  <Button 
                    onClick={handleEnhanceWithAI} 
                    disabled={isEnhancing || !formData.bulletPoints?.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      The AI will structure your content following AP Style and press release best practices.
                      You can edit the generated content in the next tab.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Press Release Content</CardTitle>
                  <CardDescription>Write or edit your press release content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content">Main Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Start with your lead paragraph answering who, what, when, where, and why..."
                      rows={15}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.content.split(' ').filter(w => w).length} words (ideal: 400-600)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="boilerplate">Company Boilerplate</Label>
                    <Textarea
                      id="boilerplate"
                      value={formData.boilerplate}
                      onChange={(e) => setFormData(prev => ({ ...prev, boilerplate: e.target.value }))}
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logos Tab */}
            <TabsContent value="logos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Logos</CardTitle>
                  <CardDescription>Add logos to appear in your press release</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo-upload">Upload Logo</Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>

                  {formData.logos.length > 0 && (
                    <div className="space-y-3">
                      {formData.logos.map(logo => (
                        <div key={logo.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <img src={logo.url} alt={logo.name} className="h-12 w-12 object-contain" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{logo.name}</p>
                            <Select
                              value={logo.position}
                              onValueChange={(value: any) => {
                                setFormData(prev => ({
                                  ...prev,
                                  logos: prev.logos.map(l => 
                                    l.id === logo.id ? { ...l, position: value } : l
                                  )
                                }));
                              }}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                                <SelectItem value="inline">Inline</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLogo(logo.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Media Contact Information</CardTitle>
                  <CardDescription>Contact details for media inquiries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactInfo.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, name: e.target.value }
                      }))}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactTitle">Title</Label>
                    <Input
                      id="contactTitle"
                      value={formData.contactInfo.title}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, title: e.target.value }
                      }))}
                      placeholder="Media Contact"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      placeholder="media@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      placeholder="(202) 555-0100"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Best Practices */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Title Guidelines</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {PRESS_RELEASE_BEST_PRACTICES.title.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Structure</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {PRESS_RELEASE_BEST_PRACTICES.structure.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Content Tips</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {PRESS_RELEASE_BEST_PRACTICES.content.slice(0, 4).map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Press Release Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {/* Preview content would go here */}
              <div className="text-center mb-6">
                {formData.logos.filter(l => l.position === 'header').map(logo => (
                  <img key={logo.id} src={logo.url} alt={logo.name} className="h-16 mx-auto mb-4" />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">FOR IMMEDIATE RELEASE</p>
              <h1 className="text-3xl font-bold mb-2">{formData.title || 'Untitled Press Release'}</h1>
              {formData.subtitle && <h2 className="text-xl text-muted-foreground mb-4">{formData.subtitle}</h2>}
              
              <p className="text-sm mb-4">
                {formData.location} - {format(formData.releaseDate, 'MMMM d, yyyy')}
              </p>
              
              <div className="whitespace-pre-wrap">{formData.content}</div>
              
              {formData.boilerplate && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-2">About KDM & Associates</h3>
                  <p className="whitespace-pre-wrap">{formData.boilerplate}</p>
                </>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2">Media Contact:</h4>
                <p>{formData.contactInfo.name}</p>
                {formData.contactInfo.title && <p>{formData.contactInfo.title}</p>}
                <p>{formData.contactInfo.email}</p>
                {formData.contactInfo.phone && <p>{formData.contactInfo.phone}</p>}
              </div>

              {formData.logos.filter(l => l.position === 'footer').length > 0 && (
                <div className="text-center mt-6 pt-6 border-t">
                  {formData.logos.filter(l => l.position === 'footer').map(logo => (
                    <img key={logo.id} src={logo.url} alt={logo.name} className="h-12 mx-auto" />
                  ))}
                </div>
              )}
              
              <p className="text-center mt-6">###</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
