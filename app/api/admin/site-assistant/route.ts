import { NextRequest, NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface SiteChangeRequest {
  id?: string;
  sessionId: string;
  status: "drafting" | "plan_ready" | "approved" | "executing" | "completed" | "failed";
  userRequest: string;
  attachedLinks?: string[];
  attachedFiles?: { name: string; type: string; url: string }[];
  conversationHistory: { role: "user" | "assistant"; content: string; timestamp: string }[];
  plan?: SiteImplementationPlan;
  executionLog?: { step: string; status: "pending" | "done" | "error"; message?: string; timestamp: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteImplementationPlan {
  summary: string;
  requestedChange: string;
  affectedPages: { path: string; name: string; change: string }[];
  contentAssets: { type: string; description: string; status: "available" | "needed" }[];
  firestoreUpdates: { collection: string; documentId?: string; action: "create" | "update" | "delete"; fields: Record<string, string> }[];
  implementationSteps: { order: number; title: string; description: string; automated: boolean }[];
  risks: string[];
  nextActions: string[];
  estimatedComplexity: "low" | "medium" | "high";
  mode: "plan_only" | "execute";
}

const SITE_ASSISTANT_SYSTEM_PROMPT = `You are an internal website implementation assistant for KDM & Associates / Strategic Value Plus (SVP) platform staff. 

Your job is to help logged-in admins describe website changes in natural language and turn those requests into a clear, structured implementation plan.

Platform context:
- Next.js 14+ App Router with Firebase Firestore backend
- Admin portal at /portal/admin/*
- Marketing pages at /(marketing)/*
- Key Firestore collections: users, leads, opportunities, events, consortium_members, proof_packs, cohorts, press_releases, testimonials, pricing_tiers, platform_settings
- Key admin tools: hero management, page designer, home-settings, header-footer, events, press-releases, team-members, pricing, images

Behavior rules:
1. Be concise, professional, and implementation-focused.
2. If the request is incomplete, ask the MINIMUM number of clarifying questions needed.
3. DO NOT propose changes — only produce the structured plan. Never say you made a change.
4. Reference exact site sections, pages, components, or Firestore collections/documents.
5. If multiple options exist, recommend the best one and explain why briefly.
6. Flag missing assets, dependencies, or risks clearly.

When you have enough context to produce a plan, respond with a JSON block wrapped in <PLAN> tags followed by a human-readable summary.

The JSON must match this exact structure:
{
  "summary": "one sentence summary",
  "requestedChange": "full description",
  "affectedPages": [{ "path": "/path", "name": "Page Name", "change": "what changes" }],
  "contentAssets": [{ "type": "image|text|video|document", "description": "...", "status": "available|needed" }],
  "firestoreUpdates": [{ "collection": "collectionName", "documentId": "optional", "action": "create|update|delete", "fields": { "fieldName": "description of value" } }],
  "implementationSteps": [{ "order": 1, "title": "Step title", "description": "What happens", "automated": true }],
  "risks": ["risk 1", "risk 2"],
  "nextActions": ["action 1"],
  "estimatedComplexity": "low|medium|high",
  "mode": "plan_only"
}

If you need more information before producing a plan, respond conversationally and ask your question.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, conversationHistory = [], attachedLinks = [], mode = "chat", userId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const messages = [
      { role: "system", content: SITE_ASSISTANT_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: attachedLinks.length > 0
          ? `${message}\n\nReference links provided:\n${attachedLinks.map((l: string) => `- ${l}`).join("\n")}`
          : message,
      },
    ];

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseContent: string = aiData.choices[0]?.message?.content || "";

    let plan: SiteImplementationPlan | null = null;
    let displayContent = responseContent;

    const planMatch = responseContent.match(/<PLAN>([\s\S]*?)<\/PLAN>/);
    if (planMatch) {
      try {
        plan = JSON.parse(planMatch[1].trim()) as SiteImplementationPlan;
        displayContent = responseContent.replace(/<PLAN>[\s\S]*?<\/PLAN>/, "").trim();
      } catch {
        displayContent = responseContent;
      }
    }

    const db = adminDb;
    if (db && sessionId && userId) {
      try {
        const ref = db.collection("site_change_requests").doc(sessionId);
        const existing = await ref.get();
        const now = new Date().toISOString();

        const newEntry = { role: "user" as const, content: message, timestamp: now };
        const aiEntry = { role: "assistant" as const, content: displayContent, timestamp: now };

        if (existing.exists) {
          await ref.update({
            conversationHistory: FieldValue.arrayUnion(newEntry, aiEntry),
            ...(plan ? { plan, status: "plan_ready" } : {}),
            updatedAt: now,
          });
        } else {
          await ref.set({
            sessionId,
            status: plan ? "plan_ready" : "drafting",
            userRequest: message,
            attachedLinks,
            conversationHistory: [newEntry, aiEntry],
            ...(plan ? { plan } : {}),
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch {
        // Non-fatal: continue without saving
      }
    }

    return NextResponse.json({
      response: displayContent,
      plan,
      hasPlan: !!plan,
      sessionId,
    });
  } catch (error) {
    console.error("Site assistant error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ sessions: [] });
    }

    if (sessionId) {
      const doc = await db.collection("site_change_requests").doc(sessionId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json({ session: { id: doc.id, ...doc.data() } });
    }

    const query = userId
      ? db.collection("site_change_requests").where("createdBy", "==", userId).orderBy("updatedAt", "desc").limit(20)
      : db.collection("site_change_requests").orderBy("updatedAt", "desc").limit(50);

    const snapshot = await query.get();
    const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Site assistant GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
