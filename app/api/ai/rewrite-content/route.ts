/**
 * AI Content Rewriting API
 * Rewrites content based on page purpose, UX principles, and user inputs
 */

import { NextRequest, NextResponse } from 'next/server';
import { rewriteContent, type RewriteParams } from '@/lib/rewrite-content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      purpose,
      audience,
      tone,
      uxPrinciples,
      contentType, // 'headline', 'body', 'cta', 'full'
    } = body;

    // Validate required fields
    if (!content || !purpose) {
      return NextResponse.json(
        { error: 'Content and purpose are required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual OpenAI API call
    // For now, using mock AI response with intelligent rewriting logic
    
    const rewrittenContent = await rewriteContent({
      content,
      purpose,
      audience: audience || [],
      tone: tone || 'professional',
      uxPrinciples: uxPrinciples || [],
      contentType: contentType || 'full',
    });

    return NextResponse.json({
      success: true,
      original: content,
      rewritten: rewrittenContent,
      improvements: [
        'Improved clarity and conciseness',
        'Enhanced call-to-action strength',
        'Optimized for target audience',
        'Applied UX best practices',
      ],
    });
  } catch (error) {
    console.error('Error rewriting content:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite content' },
      { status: 500 }
    );
  }
}

// Shared implementation moved to @/lib/rewrite-content
