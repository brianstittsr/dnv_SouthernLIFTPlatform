import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, bulletPoints, location, category } = await request.json();

    if (!bulletPoints) {
      return NextResponse.json(
        { error: 'Bullet points are required' },
        { status: 400 }
      );
    }

    // In a production environment, this would call OpenAI or another AI service
    // For now, we'll create a structured press release from the bullet points
    const enhancedContent = generatePressReleaseFromBullets(
      title,
      bulletPoints,
      location,
      category
    );

    return NextResponse.json({ enhancedContent });
  } catch (error) {
    console.error('Error enhancing press release:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
}

function generatePressReleaseFromBullets(
  title: string,
  bulletPoints: string,
  location: string,
  category: string
): string {
  // Parse bullet points
  const points = bulletPoints
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[•\-*]\s*/, '').trim());

  if (points.length === 0) {
    return '';
  }

  // Generate lead paragraph (first 2-3 points)
  const leadPoints = points.slice(0, Math.min(3, points.length));
  const leadParagraph = leadPoints.join('. ') + '.';

  // Generate supporting paragraphs
  const supportingPoints = points.slice(3);
  const supportingParagraphs = supportingPoints.length > 0
    ? supportingPoints.map(point => point + '.').join('\n\n')
    : '';

  // Template for press release
  const template = `${leadParagraph}

${supportingParagraphs}

"This ${category.toLowerCase()} represents a significant milestone for our organization," said [Executive Name], [Title] at KDM & Associates. "We are committed to delivering exceptional value and driving positive outcomes for all stakeholders involved."

The initiative is expected to [add expected outcomes/timeline based on context].

For more information about this ${category.toLowerCase()}, please contact the media relations team.`;

  return template;
}
