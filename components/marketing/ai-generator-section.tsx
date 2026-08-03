'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, BookOpen, Upload, File, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export function AIGeneratorSection() {
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedRelease, setGeneratedRelease] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [markdownGuideOpen, setMarkdownGuideOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, Word, Image, or Text files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setUploadedFile(file);
    setInputText('');
  };

  const handleGenerate = async () => {
    if (!inputText && !uploadedFile) {
      toast.error('Please enter text or upload a file');
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      if (inputText) formData.append('text', inputText);
      if (uploadedFile) formData.append('file', uploadedFile);

      const response = await fetch('/api/generate-press-release', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate press release');
        return;
      }

      const data = await response.json();
      setGeneratedRelease(data.content);
      toast.success('Press release generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate press release');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRelease);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setUploadedFile(null);
    setGeneratedRelease('');
  };

  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                AI Press Release Generator
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Generate professional press releases instantly using AI. Simply paste your content or upload a document.
            </p>
          </div>

          <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full md:w-auto mx-auto block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Generating
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  AI Press Release Generator
                </DialogTitle>
                <DialogDescription>
                  Paste text or upload a document (Word, PDF, Image) to generate a professional press release.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        Paste Your Content
                      </label>
                      <Dialog open={markdownGuideOpen} onOpenChange={setMarkdownGuideOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Markdown Guide
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Markdown Quick Reference
                            </DialogTitle>
                            <DialogDescription>
                              Common markdown syntax to format your press release content
                            </DialogDescription>
                          </DialogHeader>
                          <MarkdownGuideContent />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Textarea
                      placeholder="Paste your text here... (e.g., announcement details, event information, company news)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={8}
                      className="w-full"
                      disabled={!!uploadedFile}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload a Document
                    </label>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 mb-2">
                      <strong>Data Security Notice:</strong> Do NOT upload classified information, CUI, export-controlled technical data, or procurement-sensitive information. Only upload publicly releasable documents.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                        className="hidden"
                        id="file-upload"
                        disabled={!!inputText}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, Word, Image, or Text (max 10MB)
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!inputText && !uploadedFile)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Press Release
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    disabled={isGenerating}
                  >
                    Clear
                  </Button>
                </div>

                {/* Generated Release */}
                {generatedRelease && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">
                        Generated Press Release
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                          {generatedRelease}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

function MarkdownGuideContent() {
  return (
    <div className="space-y-6">
      {/* Basic Syntax */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Basic Syntax</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Headings</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                # H1<br />
                ## H2<br />
                ### H3
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Bold</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                **bold text**
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Italic</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                *italicized text*
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Blockquote</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                &gt; blockquote
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Ordered List</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                1. First item<br />
                2. Second item<br />
                3. Third item
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Unordered List</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                - First item<br />
                - Second item<br />
                - Third item
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Inline Code</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                `code`
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Horizontal Rule</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ---
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Link</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                [title](https://www.example.com)
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Image</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ![alt text](image.jpg)
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Syntax */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Extended Syntax</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Table</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block whitespace-pre">
{`| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |`}
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Fenced Code Block</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ```<br />
                {`{`}<br />
                &nbsp;&nbsp;"key": "value"<br />
                {`}`}<br />
                ```
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Strikethrough</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ~~The world is flat.~~
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Task List</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                - [x] Write the press release<br />
                - [ ] Update the website<br />
                - [ ] Contact the media
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Press Releases</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use <strong>**bold**</strong> for company names and key announcements</li>
          <li>• Use <em>*italics*</em> for quotes from executives</li>
          <li>• Use <strong>## headings</strong> to organize sections</li>
          <li>• Use bullet points (-) for listing key highlights or benefits</li>
          <li>• Use horizontal rules (---) to separate major sections</li>
        </ul>
      </div>
    </div>
  );
}
