import { NextRequest, NextResponse } from 'next/server';
import { getNewsletterBySlug } from '@/lib/newsletter-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Newsletter slug is required' },
        { status: 400 }
      );
    }

    const newsletter = getNewsletterBySlug(slug);

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // In production, this would use a PDF generation library like jsPDF or Puppeteer
    // For now, we'll return a simple HTML-to-PDF conversion endpoint
    
    // Generate HTML content for PDF
    const htmlContent = generateNewsletterHTML(newsletter);

    // In production, you would use a library like:
    // - puppeteer to render HTML to PDF
    // - jsPDF to create PDF from scratch
    // - pdfkit for Node.js PDF generation
    
    // For now, return the HTML that can be printed to PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${newsletter.slug}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateNewsletterHTML(newsletter: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${newsletter.title}</title>
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 10px;
    }
    .title {
      font-size: 32px;
      font-weight: bold;
      margin: 20px 0 10px 0;
      color: #1a1a1a;
    }
    .subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 10px;
    }
    .meta {
      font-size: 14px;
      color: #888;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #E0E7FF;
      color: #4F46E5;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin: 0 5px;
    }
    .description {
      font-size: 18px;
      color: #555;
      margin: 30px 0;
      font-style: italic;
    }
    .highlights {
      background: #F9FAFB;
      padding: 20px;
      border-left: 4px solid #4F46E5;
      margin: 30px 0;
    }
    .highlights h3 {
      margin-top: 0;
      color: #4F46E5;
    }
    .highlights ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .highlights li {
      margin: 8px 0;
    }
    .content-section {
      margin: 40px 0;
      page-break-inside: avoid;
    }
    .content-section h2 {
      font-size: 24px;
      color: #1a1a1a;
      margin-bottom: 15px;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 10px;
    }
    .content-section p {
      margin: 15px 0;
      text-align: justify;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .tags {
      margin: 30px 0;
    }
    .tag {
      display: inline-block;
      padding: 4px 10px;
      background: #F3F4F6;
      border: 1px solid #D1D5DB;
      border-radius: 4px;
      font-size: 12px;
      margin: 4px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">KDM & Associates</div>
    <div class="title">${newsletter.title}</div>
    ${newsletter.subtitle ? `<div class="subtitle">${newsletter.subtitle}</div>` : ''}
    <div class="meta">
      ${newsletter.category ? `<span class="badge">${newsletter.category}</span>` : ''}
      ${newsletter.volume ? `<span class="badge">${newsletter.volume}</span>` : ''}
      ${newsletter.issue ? `<span class="badge">${newsletter.issue}</span>` : ''}
      <br>
      Published: ${new Date(newsletter.publishedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>
  </div>

  <div class="description">
    ${newsletter.description}
  </div>

  ${newsletter.highlights && newsletter.highlights.length > 0 ? `
    <div class="highlights">
      <h3>In This Issue</h3>
      <ul>
        ${newsletter.highlights.map((h: string) => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  ` : ''}

  ${newsletter.content.sections.map((section: any) => `
    <div class="content-section">
      <h2>${section.title}</h2>
      <p>${section.content}</p>
    </div>
  `).join('')}

  ${newsletter.tags && newsletter.tags.length > 0 ? `
    <div class="tags">
      <strong>Topics:</strong>
      ${newsletter.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>KDM & Associates</strong></p>
    <p>Empowering Minority-Owned Businesses in Federal Contracting</p>
    <p>www.kdm-assoc.com | info@kdm-assoc.com</p>
    <p style="margin-top: 20px; font-size: 10px;">
      © ${new Date().getFullYear()} KDM & Associates. All rights reserved.
    </p>
  </div>

  <script>
    // Auto-print when opened
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();
}
