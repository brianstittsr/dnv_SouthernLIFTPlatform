import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import type { Timestamp } from "firebase-admin/firestore";

interface UserData {
  email?: string;
  company?: string;
  companyId?: string;
  avatarUrl?: string;
  onboardingStatus?: string;
  createdAt?: Timestamp | Date;
}

interface ConsortiumProfileData {
  id?: string;
  userId?: string;
  companyId?: string;
  companyIdentity?: {
    legalCompanyName?: string;
  };
  membershipTier?: {
    tier?: string;
  };
  engagementMetrics?: {
    marketplaceListingsCount?: number;
    activeEngagementScore?: number;
    profileCompleteness?: number;
  };
  onboardingTracking?: {
    status?: string;
    currentStage?: string;
    stageProgress?: Record<
      string,
      { status?: string; startedAt?: Timestamp; completedAt?: Timestamp }
    >;
  };
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

const STAGE_ORDER = [
  "discovery_intake",
  "account_creation",
  "profile_build",
  "readiness_validation",
  "matching_activation",
  "engagement_tracking",
] as const;

const STAGE_LABELS: Record<string, string> = {
  discovery_intake: "Discovery & Intake",
  account_creation: "Account Creation",
  profile_build: "Profile Build",
  readiness_validation: "Readiness Validation",
  matching_activation: "AI Matching Activation",
  engagement_tracking: "Active Engagement",
};

const LEVEL_LABELS: Record<number, string> = {
  0: "Not Started",
  1: "Discovery / Intake",
  2: "Account Created",
  3: "Profile Build",
  4: "Readiness Validation",
  5: "AI Matching Activation",
  6: "Active Engagement",
  7: "Fully Onboarded",
};

interface MemberData {
  firstName?: string;
  lastName?: string;
  emailPrimary?: string;
  company?: string;
  avatar?: string;
  membershipTier?: string;
  membershipStatus?: string;
  firebaseUid?: string;
  onboardingStatus?: string;
  onboardingStage?: string;
  consortiumOnboardingComplete?: boolean;
  onboardingComplete?: boolean;
  readinessValidationStatus?: string;
  aiMatchingActivated?: boolean;
  engagementScore?: number;
  updatedAt?: Timestamp | Date;
  createdAt?: Timestamp | Date;
}

interface MemberOnboardingData {
  id: string;
  userId?: string;
  companyId?: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  membershipTier?: string;
  membershipStatus?: string;
  avatar?: string;
  onboardedLevel: number;
  onboardedLevelLabel: string;
  currentStage?: string;
  currentStageLabel?: string;
  stageProgress: {
    stage: string;
    label: string;
    status: "not_started" | "in_progress" | "completed" | "skipped";
    startedAt?: string;
    completedAt?: string;
  }[];
  onboardingComplete: boolean;
  readinessValidationStatus?: string;
  aiMatchingActivated?: boolean;
  engagementScore?: number;
  profileCompleteness?: number;
  updatedAt?: string;
  createdAt?: string;
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "object" && "toDate" in value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

function getStageStatus(
  stageProgress: Record<string, { status?: string; startedAt?: Timestamp; completedAt?: Timestamp }> | undefined,
  stage: string
): { status: "not_started" | "in_progress" | "completed" | "skipped"; startedAt?: string; completedAt?: string } {
  const entry = stageProgress?.[stage];
  const rawStatus = entry?.status || "not_started";
  const status = ["not_started", "in_progress", "completed", "skipped"].includes(rawStatus)
    ? (rawStatus as "not_started" | "in_progress" | "completed" | "skipped")
    : "not_started";
  return {
    status,
    startedAt: timestampToIso(entry?.startedAt),
    completedAt: timestampToIso(entry?.completedAt),
  };
}

function deriveLevel(
  memberData: MemberData,
  stageProgress: Record<string, { status?: string }> | undefined,
  profileStatus?: string
): number {
  if (
    profileStatus === "fully_onboarded" ||
    memberData.onboardingStage === "complete" ||
    memberData.consortiumOnboardingComplete === true ||
    memberData.onboardingComplete === true
  ) {
    return 7;
  }

  const completedStages = STAGE_ORDER.filter(
    (stage) => stageProgress?.[stage]?.status === "completed"
  ).length;

  if (completedStages === STAGE_ORDER.length) return 7;
  if (completedStages > 0) return completedStages + 1;

  switch (memberData.onboardingStage) {
    case "complete":
      return 7;
    case "active":
      return 6;
    case "categorization":
      return 5;
    case "readiness":
      return 4;
    case "profile":
      return 3;
    default:
      if (memberData.membershipStatus === "active") return 2;
      return 0;
  }
}

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number }> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  const idToken = authorization.split("Bearer ")[1];
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { success: false, error: "Invalid token", status: 401 };
  }

  if (!decoded.admin && !decoded.email?.endsWith("@kdm-assoc.com")) {
    return { success: false, error: "Forbidden", status: 403 };
  }

  return { success: true };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Fetch consortium members
    const membersSnapshot = await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).get();
    const profilesSnapshot = await db.collection("consortium_profiles").get();
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();

    const profilesByUserId = new Map<string, ConsortiumProfileData>();
    profilesSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as ConsortiumProfileData;
      const userId = data.userId || docSnap.id;
      profilesByUserId.set(userId, { id: docSnap.id, ...data });
    });

    const usersById = new Map<string, UserData>();
    usersSnapshot.docs.forEach((docSnap) => {
      usersById.set(docSnap.id, { ...docSnap.data() } as UserData);
    });

    const results: MemberOnboardingData[] = [];

    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data() as MemberData;

      if (!includeInactive && memberData.membershipStatus === "inactive") {
        continue;
      }

      const userId = memberData.firebaseUid || memberDoc.id;
      const profile = profilesByUserId.get(userId);
      const user = usersById.get(userId);

      const onboardingTracking = profile?.onboardingTracking as
        | Record<string, unknown>
        | undefined;
      const stageProgress = onboardingTracking?.stageProgress as
        | Record<string, { status?: string; startedAt?: Timestamp; completedAt?: Timestamp }>
        | undefined;

      const profileStatus = (onboardingTracking?.status as string) ||
        (user?.onboardingStatus as string) ||
        (memberData.onboardingStatus as string);

      const onboardedLevel = deriveLevel(memberData, stageProgress, profileStatus);

      const stageProgressList = STAGE_ORDER.map((stage) => {
        const { status, startedAt, completedAt } = getStageStatus(stageProgress, stage);
        return {
          stage,
          label: STAGE_LABELS[stage],
          status,
          startedAt,
          completedAt,
        };
      });

      results.push({
        id: memberDoc.id,
        userId,
        companyId: user?.companyId || profile?.companyId || undefined,
        firstName: memberData.firstName || "",
        lastName: memberData.lastName || "",
        email: memberData.emailPrimary || user?.email || "",
        company: memberData.company || user?.company || profile?.companyIdentity?.legalCompanyName || "",
        membershipTier: memberData.membershipTier || profile?.membershipTier?.tier || "—",
        membershipStatus: memberData.membershipStatus || "pending",
        avatar: memberData.avatar || user?.avatarUrl || "",
        onboardedLevel,
        onboardedLevelLabel: LEVEL_LABELS[onboardedLevel],
        currentStage: onboardingTracking?.currentStage as string | undefined,
        currentStageLabel: onboardingTracking?.currentStage
          ? STAGE_LABELS[onboardingTracking.currentStage as string]
          : undefined,
        stageProgress: stageProgressList,
        onboardingComplete: onboardedLevel === 7,
        readinessValidationStatus: memberData.readinessValidationStatus,
        aiMatchingActivated:
          memberData.aiMatchingActivated ||
          (profile?.engagementMetrics?.marketplaceListingsCount ?? 0) > 0,
        engagementScore: profile?.engagementMetrics?.activeEngagementScore ?? memberData.engagementScore,
        profileCompleteness: profile?.engagementMetrics?.profileCompleteness,
        updatedAt: timestampToIso(memberData.updatedAt || profile?.updatedAt),
        createdAt: timestampToIso(memberData.createdAt || profile?.createdAt || user?.createdAt),
      });
    }

    // Sort by onboarded level descending, then by createdAt descending
    results.sort((a, b) => {
      if (b.onboardedLevel !== a.onboardedLevel) {
        return b.onboardedLevel - a.onboardedLevel;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error fetching consortium onboarding data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}
