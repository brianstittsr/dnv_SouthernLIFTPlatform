import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    let contentToProcess = '';

    if (file) {
      // Handle file upload
      const fileType = file.type;
      const fileBuffer = await file.arrayBuffer();
      const fileContent = Buffer.from(fileBuffer);

      // For text files, read directly
      if (fileType === 'text/plain') {
        contentToProcess = fileContent.toString('utf-8');
      } 
      // For images, use GPT-4 Vision
      else if (fileType.startsWith('image/')) {
        const base64Image = fileContent.toString('base64');
        const imageUrl = `data:${fileType};base64,${base64Image}`;

        const visionResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all text and relevant information from this image. Provide a detailed description of what you see.',
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          max_tokens: 1000,
        });

        contentToProcess = visionResponse.choices[0].message.content || '';
      }
      // For PDF and Word documents, extract text (simplified - in production use proper libraries)
      else if (fileType === 'application/pdf' || fileType.includes('word')) {
        // Note: For production, you'd want to use libraries like pdf-parse or mammoth
        // For now, we'll return an error message
        return NextResponse.json(
          { error: 'PDF and Word document processing requires additional setup. Please paste the text directly or use an image.' },
          { status: 400 }
        );
      }
    } else if (text) {
      contentToProcess = text;
    } else {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Generate press release using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional press release writer for KDM & Associates, a leading consulting firm specializing in government contracting, manufacturing, critical minerals, opportunity zones, and access to capital. 

Write a professional, compelling press release based on the provided content. Follow these guidelines:

1. Use proper press release format with MARKDOWN FORMATTING:
   - Compelling headline using **bold** (e.g., **Headline Here**)
   - Dateline in italics (e.g., *City, State - Date*)
   - Strong opening paragraph with the 5 W's (Who, What, When, Where, Why)
   - Supporting paragraphs with details and quotes
   - Use **bold** for emphasis on key points and company names
   - Use *italics* for quotes and emphasis
   - Use bullet points (- item) for lists when appropriate
   - Use ## for section headings if needed
   - Boilerplate about KDM & Associates
   - Contact information section

2. Style:
   - Professional and authoritative tone
   - Third-person perspective
   - Active voice
   - Clear, concise language
   - Include relevant quotes from executives or stakeholders (use *italics* for quotes)
   - Use industry-specific terminology appropriately
   - Format key statistics or numbers with **bold** for emphasis

3. Structure:
   - Keep it to 400-600 words
   - Use short paragraphs (2-3 sentences each)
   - Include subheadings with ## if appropriate
   - Use markdown formatting throughout for better readability
   - End with "---" to indicate end of release

4. Boilerplate (use this at the end):
   "## About KDM & Associates
   **KDM & Associates** is a premier consulting firm dedicated to helping organizations navigate complex government contracting, manufacturing modernization, critical minerals supply chains, opportunity zone investments, and capital access strategies. With a proven track record of success, KDM provides strategic guidance and practical solutions that drive growth and impact."

IMPORTANT: Use markdown syntax throughout the press release for formatting. This will make the content more visually appealing and easier to read.`,
        },
        {
          role: 'user',
          content: `Generate a professional press release based on this content:\n\n${contentToProcess}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const pressRelease = completion.choices[0].message.content;

    return NextResponse.json({ pressRelease });
  } catch (error: any) {
    console.error('Error generating press release:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate press release' },
      { status: 500 }
    );
  }
}
