"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Send,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface ProposalWizardProps {
  opportunityId: string;
  teamingPartners?: string[];
}

interface ProjectScope {
  summary: string;
  requirements: string[];
  deliverables: string[];
  timeline: string;
  budget: string;
  riskFactors: string[];
  aiGenerated: boolean;
}

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  enhanced: boolean;
  qualityScore: number;
  recommendations: string[];
}

interface QualityRecommendation {
  type: 'content' | 'structure' | 'completeness';
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

export function ProposalWizard({ opportunityId, teamingPartners }: ProposalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [projectScope, setProjectScope] = useState<ProjectScope | null>(null);
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([]);
  const [qualityCheck, setQualityCheck] = useState<QualityRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const steps = [
    { title: 'Document Upload', description: 'Upload opportunity document' },
    { title: 'AI Scoping', description: 'Extract project requirements' },
    { title: 'Content Creation', description: 'Write proposal sections' },
    { title: 'AI Enhancement', description: 'Enhance with AI' },
    { title: 'Quality Check', description: 'Review and finalize' }
  ];

  useEffect(() => {
    fetchOpportunity();
  }, [opportunityId]);

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      if (!response.ok) throw new Error('Failed to fetch opportunity');
      const data = await response.json();
      setOpportunity(data);
    } catch (error) {
      toast.error('Failed to load opportunity details');
    }
  };

  const handleDocumentUpload = async (file: File) => {
    setUploadedDocument(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('opportunityId', opportunityId);

      const response = await fetch('/api/opportunities/upload-document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload document');

      toast.success('Document uploaded successfully');
      setCurrentStep(1);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIScoping = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/opportunities/ai-scope/${opportunityId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to generate scope');

      const scope = await response.json();
      setProjectScope(scope);
      setCurrentStep(2);
      toast.success('Project scope generated successfully');
    } catch (error) {
      toast.error('Failed to generate project scope');
    } finally {
      setIsGenerating(false);
    }
  };

  const initializeProposalSections = () => {
    const sections: ProposalSection[] = [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        content: '',
        enhanced: false,
        qualityScore: 0,
        recommendations: []
      },
      {
        id: 'technical-approach',
        title: 'Technical Approach',
        content: '',
        enhanced: false,
        qualityScore: 0,
        recommendations: []
      },
      {
        id: 'management-plan',
        title: 'Management Plan',
        content: '',
        enhanced: false,
        qualityScore: 0,
        recommendations: []
      },
      {
        id: 'past-performance',
        title: 'Past Performance',
        content: '',
        enhanced: false,
        qualityScore: 0,
        recommendations: []
      }
    ];

    setProposalSections(sections);
  };

  const handleContentGeneration = () => {
    initializeProposalSections();
    setCurrentStep(3);
  };

  const handleAIEnhancement = async (sectionId: string) => {
    const section = proposalSections.find(s => s.id === sectionId);
    if (!section) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/opportunities/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: section.content,
          sectionType: section.title,
          projectScope
        })
      });

      if (!response.ok) throw new Error('Failed to enhance text');

      const enhanced = await response.json();
      
      setProposalSections(prev => 
        prev.map(s => 
          s.id === sectionId 
            ? { ...s, content: enhanced.enhancedText, enhanced: true }
            : s
        )
      );

      toast.success('Text enhanced successfully');
    } catch (error) {
      toast.error('Failed to enhance text');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQualityCheck = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/proposals/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: proposalSections,
          opportunityId,
          teamingPartners
        })
      });

      if (!response.ok) throw new Error('Failed to perform quality check');

      const check = await response.json();
      setQualityCheck(check.recommendations);
      setCurrentStep(4);
      toast.success('Quality check completed');
    } catch (error) {
      toast.error('Failed to perform quality check');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProposalGeneration = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          teamingPartners,
          sections: proposalSections,
          projectScope
        })
      });

      if (!response.ok) throw new Error('Failed to generate proposal');

      const proposal = await response.json();
      
      // Download proposal
      const blob = new Blob([proposal.content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${opportunity?.title || 'opportunity'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Proposal generated and downloaded');
    } catch (error) {
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setProposalSections(prev => 
      prev.map(s => 
        s.id === sectionId ? { ...s, content } : s
      )
    );
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DocumentUploadStep onUpload={handleDocumentUpload} isProcessing={isProcessing} />;
      case 1:
        return <AIScopingStep scope={projectScope} onGenerate={handleAIScoping} isGenerating={isGenerating} />;
      case 2:
        return <ContentCreationStep 
          sections={proposalSections} 
          onUpdate={updateSectionContent}
          onGenerate={handleContentGeneration}
          projectScope={projectScope}
        />;
      case 3:
        return <AIEnhancementStep 
          sections={proposalSections} 
          onUpdate={updateSectionContent}
          onEnhance={handleAIEnhancement}
          isGenerating={isGenerating}
        />;
      case 4:
        return <QualityCheckStep 
          recommendations={qualityCheck}
          onGenerate={handleQualityCheck}
          onFinalize={handleProposalGeneration}
          isGenerating={isGenerating}
        />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return uploadedDocument !== null;
      case 1: return projectScope !== null;
      case 2: return proposalSections.every(s => s.content.length > 0);
      case 3: return proposalSections.some(s => s.enhanced);
      case 4: return qualityCheck.filter(r => r.severity === 'high').length === 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Proposal Response Wizard
          </h1>
          <p className="text-slate-600">
            {opportunity?.title || 'Loading opportunity...'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <p className="text-xs mt-1 max-w-20">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={() => {
              if (currentStep === 4) {
                handleProposalGeneration();
              } else {
                setCurrentStep(Math.min(totalSteps - 1, currentStep + 1));
              }
            }}
            disabled={!canProceed() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === 4 ? (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Proposal
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function DocumentUploadStep({ onUpload, isProcessing }: { onUpload: Function, isProcessing: boolean }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword')) {
      onUpload(file);
    } else {
      toast.error('Please upload a PDF or Word document');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Opportunity Document</h3>
        <p className="text-slate-600">
          Upload the RFP, solicitation, or opportunity document to extract requirements
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-slate-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <h4 className="text-lg font-semibold mb-2">Drop document here</h4>
        <p className="text-slate-600 mb-4">or click to browse</p>
        
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
          className="hidden"
          id="document-upload"
        />
        
        <Button variant="outline" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </>
          )}
        </Button>
        
        <p className="text-xs text-slate-500 mt-4">
          Supported formats: PDF, DOC, DOCX (Max 10MB)
        </p>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          AI will automatically extract requirements, deliverables, timeline, and evaluation criteria from your document.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function AIScopingStep({ scope, onGenerate, isGenerating }: { 
  scope: ProjectScope | null, 
  onGenerate: Function, 
  isGenerating: boolean 
}) {
  if (!scope) {
    return (
      <div className="text-center py-8">
        <Button onClick={() => onGenerate()} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Generate Project Scope
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h4 className="font-semibold text-green-900">Project Scope Generated</h4>
        </div>
        <p className="text-green-800 text-sm">AI successfully extracted key information from your document</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Summary
          </h4>
          <p className="text-slate-600 text-sm">{scope.summary}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </h4>
          <p className="text-slate-600 text-sm">{scope.timeline}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget
          </h4>
          <p className="text-slate-600 text-sm">{scope.budget}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Risk Factors</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            {scope.riskFactors.map((risk, index) => (
              <li key={index} className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Key Requirements</h4>
        <div className="space-y-1">
          {scope.requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {req}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Expected Deliverables</h4>
        <div className="space-y-1">
          {scope.deliverables.map((del, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-3 w-3 text-blue-500" />
              {del}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentCreationStep({ 
  sections, 
  onUpdate, 
  onGenerate,
  projectScope 
}: { 
  sections: ProposalSection[], 
  onUpdate: Function,
  onGenerate: Function,
  projectScope: ProjectScope | null
}) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-8">
        <Button onClick={onGenerate}>
          <FileText className="h-4 w-4 mr-2" />
          Initialize Proposal Sections
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Enter content for ${section.title}...`}
                value={section.content}
                onChange={(e) => onUpdate(section.id, e.target.value)}
                rows={8}
                className="mb-4"
              />
              
              {projectScope && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>AI Suggestion:</strong> Focus on {section.title.toLowerCase()} requirements from the scope
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AIEnhancementStep({ 
  sections, 
  onUpdate, 
  onEnhance,
  isGenerating 
}: { 
  sections: ProposalSection[], 
  onUpdate: Function,
  onEnhance: Function,
  isGenerating: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">AI Enhancement Available</h4>
        </div>
        <p className="text-blue-800 text-sm">
          Transform bullet points into professional paragraphs and improve clarity and impact
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {section.enhanced && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Enhanced
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEnhance(section.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Wand2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={section.content}
                onChange={(e) => onUpdate(section.id, e.target.value)}
                rows={6}
                placeholder={`Enter content for ${section.title}...`}
              />
              
              {section.enhanced && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Content enhanced with AI
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QualityCheckStep({ 
  recommendations, 
  onGenerate, 
  onFinalize,
  isGenerating 
}: { 
  recommendations: QualityRecommendation[],
  onGenerate: Function,
  onFinalize: Function,
  isGenerating: boolean
}) {
  const [hasRunCheck, setHasRunCheck] = useState(false);

  if (!hasRunCheck) {
    return (
      <div className="text-center py-8">
        <Button onClick={() => {
          onGenerate();
          setHasRunCheck(true);
        }} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Quality Check...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Run Quality Check
            </>
          )}
        </Button>
      </div>
    );
  }

  const highPriorityIssues = recommendations.filter(r => r.severity === 'high');
  const mediumPriorityIssues = recommendations.filter(r => r.severity === 'medium');
  const lowPriorityIssues = recommendations.filter(r => r.severity === 'low');

  const canProceed = highPriorityIssues.length === 0;

  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-4 ${
        canProceed 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {canProceed ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Ready to Generate</h4>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Issues Need Attention</h4>
            </>
          )}
        </div>
        <p className={`text-sm ${
          canProceed ? 'text-green-800' : 'text-red-800'
        }`}>
          {canProceed 
            ? 'Your proposal is ready for generation. No critical issues found.'
            : `${highPriorityIssues.length} critical issue${highPriorityIssues.length > 1 ? 's' : ''} must be resolved before generation.`
          }
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          {highPriorityIssues.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Critical Issues</h4>
              <div className="space-y-2">
                {highPriorityIssues.map((rec, index) => (
                  <Alert key={index} variant="destructive">
                    <div className="flex items-start gap-2">
                      {getRecommendationIcon(rec.severity)}
                      <div className="flex-1">
                        <p className="font-medium">{rec.message}</p>
                        <p className="text-sm mt-1">{rec.suggestion}</p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {mediumPriorityIssues.length > 0 && (
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Recommendations</h4>
              <div className="space-y-2">
                {mediumPriorityIssues.map((rec, index) => (
                  <Alert key={index}>
                    <div className="flex items-start gap-2">
                      {getRecommendationIcon(rec.severity)}
                      <div className="flex-1">
                        <p className="font-medium">{rec.message}</p>
                        <p className="text-sm mt-1">{rec.suggestion}</p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {lowPriorityIssues.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Minor Suggestions</h4>
              <div className="space-y-2">
                {lowPriorityIssues.map((rec, index) => (
                  <Alert key={index}>
                    <div className="flex items-start gap-2">
                      {getRecommendationIcon(rec.severity)}
                      <div className="flex-1">
                        <p className="font-medium">{rec.message}</p>
                        <p className="text-sm mt-1">{rec.suggestion}</p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <Button 
          size="lg" 
          onClick={onFinalize}
          disabled={!canProceed || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Proposal...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate & Download Proposal
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function getRecommendationIcon(severity: string) {
  switch (severity) {
    case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />;
    default: return <AlertCircle className="h-4 w-4 text-slate-500" />;
  }
}
