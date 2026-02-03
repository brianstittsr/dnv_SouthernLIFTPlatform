import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  topic: string;
  tone: string;
  length: string;
  prompt: string;
}

const LENGTH_TOKENS: Record<string, number> = {
  short: 800,
  medium: 1500,
  long: 2500,
  extended: 4000,
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Write in a formal, business-focused tone suitable for executives and industry leaders.",
  casual: "Write in a friendly, conversational tone that is approachable and engaging.",
  "thought-leader": "Write in an authoritative, insightful tone that establishes expertise and vision.",
  storytelling: "Write in a narrative, engaging tone that uses stories and examples to illustrate points.",
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, tone, length, prompt } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return mock data for development
      return NextResponse.json(generateMockContent(topic, tone, length));
    }

    const maxTokens = LENGTH_TOKENS[length] || 2500;
    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;

    const systemPrompt = `You are an expert LinkedIn content writer specializing in professional articles for business executives. ${toneInstruction}

Your task is to generate a complete LinkedIn article based on the user's prompt. The article should be well-structured with:
- An engaging title
- Clear sections with headings (use ## for headings)
- Bullet points where appropriate
- A strong conclusion with a call to action

After the main content, you MUST include:
1. A GLOSSARY section with key terms and their definitions (format: term: definition)
2. A REFERENCES section with relevant, real URLs to authoritative sources
3. HASHTAGS relevant to the topic

Format your response as JSON with the following structure:
{
  "title": "Article Title",
  "content": "Main article content with markdown formatting",
  "hashtags": ["Hashtag1", "Hashtag2", "Hashtag3"],
  "glossary": [
    {"term": "Term1", "definition": "Definition1"},
    {"term": "Term2", "definition": "Definition2"}
  ],
  "references": [
    {"title": "Reference Title", "url": "https://example.com"},
    {"title": "Reference Title 2", "url": "https://example2.com"}
  ]
}`;

    const userPrompt = prompt.replace(/\[TOPIC\]/g, topic);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const parsedContent = JSON.parse(responseContent);

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error generating article:", error);
    
    // If OpenAI fails, return mock content
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      generateMockContent(body.topic || "Topic", body.tone || "professional", body.length || "medium")
    );
  }
}

function generateMockContent(topic: string, tone: string, length: string) {
  const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  const shortContent = `In today's rapidly evolving business landscape, ${topic} has emerged as one of the most critical factors determining organizational success.

## Why ${topicTitle} Matters

As we navigate through unprecedented changes in technology, market dynamics, and customer expectations, understanding and mastering ${topic} has never been more important.

Recent industry research indicates that companies who prioritize ${topic} see an average of 23% higher revenue growth compared to their peers.

## Key Takeaways

- **Strategic Focus**: Prioritize initiatives that align with your core business objectives
- **Innovation Mindset**: Don't be afraid to experiment and learn from failures
- **Collaboration**: The best results come from diverse teams working together

What's your experience with ${topic}? I'd love to hear your thoughts in the comments.`;

  const mediumContent = shortContent + `

## The Path Forward

The journey toward excellence in ${topic} is ongoing. It requires commitment, investment, and a willingness to continuously learn and adapt.

### Implementation Steps

1. **Assess Current State**: Understand where you are today
2. **Define Goals**: Set clear, measurable objectives
3. **Build Your Team**: Assemble the right people and skills
4. **Execute and Iterate**: Start small, learn fast, scale what works

For those who embrace this challenge, the rewards—in terms of business performance, employee engagement, and customer satisfaction—are substantial.`;

  const longContent = mediumContent + `

## Real-World Success Stories

Let me share some examples of organizations that have excelled in ${topic}:

### Case Study: Manufacturing Transformation

A mid-sized manufacturing company was struggling with declining market share. By reimagining their approach to ${topic}, they reduced costs by 30% while improving quality. The key was investing in employee training and implementing lean principles.

### Case Study: Digital Innovation

A professional services firm recognized that their traditional approach was no longer sustainable. Within two years of their transformation, they doubled client satisfaction scores and increased revenue by 45%.

## Looking Ahead

As we look to the future, several trends will shape the evolution of ${topic}:

- **AI Integration**: Enabling more sophisticated and personalized approaches
- **Sustainability Focus**: Stakeholders demanding commitment to broader societal goals
- **Industry Convergence**: Boundaries between industries continuing to blur`;

  const content = length === "short" ? shortContent : 
                  length === "medium" ? mediumContent : longContent;

  return {
    title: `${topicTitle}: Key Insights for Industry Leaders`,
    content,
    hashtags: [
      topicTitle.replace(/\s+/g, ""),
      "BusinessStrategy",
      "Leadership",
      "Innovation",
      "DigitalTransformation",
      "ThoughtLeadership",
    ],
    glossary: [
      { term: "Digital Transformation", definition: "The integration of digital technology into all areas of a business, fundamentally changing how you operate and deliver value to customers." },
      { term: "Lean Principles", definition: "A systematic method for waste minimization within a manufacturing system without sacrificing productivity." },
      { term: "Stakeholder", definition: "A person or group with an interest or concern in a business or organization." },
    ],
    references: [
      { title: "Harvard Business Review", url: "https://hbr.org" },
      { title: "McKinsey Insights", url: "https://www.mckinsey.com/insights" },
      { title: "Industry Week", url: "https://www.industryweek.com" },
    ],
  };
}
