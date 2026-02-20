import { db, auth } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  bio: string;
  imageUrl?: string;
  imageName?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateTeamMemberInput {
  name: string;
  title: string;
  initials: string;
  bio: string;
  imageUrl?: string;
  imageName?: string;
  order?: number;
  createdBy?: string;
}

export interface UpdateTeamMemberInput {
  name?: string;
  title?: string;
  initials?: string;
  bio?: string;
  imageUrl?: string;
  imageName?: string;
  order?: number;
  updatedBy?: string;
}

const COLLECTION_NAME = "teamMembers";

function docToTeamMember(docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData): TeamMember {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data?.name || "",
    title: data?.title || "",
    initials: data?.initials || "",
    bio: data?.bio || "",
    imageUrl: data?.imageUrl,
    imageName: data?.imageName,
    order: data?.order || 0,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
    createdBy: data?.createdBy,
    updatedBy: data?.updatedBy,
  };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!db) throw new Error("Firestore not initialized");
  
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("order", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToTeamMember);
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  return docToTeamMember(snapshot);
}

export async function createTeamMember(input: CreateTeamMemberInput): Promise<TeamMember> {
  if (!db) throw new Error("Firestore not initialized");
  
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...input,
    order: input.order || 0,
    createdAt: now,
    updatedAt: now,
  });
  
  const newDoc = await getDoc(docRef);
  if (!newDoc.exists()) throw new Error("Failed to create team member");
  
  return {
    id: newDoc.id,
    name: input.name,
    title: input.title,
    initials: input.initials,
    bio: input.bio,
    imageUrl: input.imageUrl,
    imageName: input.imageName,
    order: input.order || 0,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
    createdBy: input.createdBy,
  };
}

export async function updateTeamMember(
  id: string,
  input: UpdateTeamMemberInput
): Promise<TeamMember> {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  const now = Timestamp.now();
  
  await updateDoc(docRef, {
    ...input,
    updatedAt: now,
  });
  
  const updatedDoc = await getDoc(docRef);
  if (!updatedDoc.exists()) throw new Error("Team member not found");
  
  const data = updatedDoc.data();
  return {
    id: updatedDoc.id,
    name: data?.name || "",
    title: data?.title || "",
    initials: data?.initials || "",
    bio: data?.bio || "",
    imageUrl: data?.imageUrl,
    imageName: data?.imageName,
    order: data?.order || 0,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: now.toDate(),
    createdBy: data?.createdBy,
    updatedBy: input.updatedBy || data?.updatedBy,
  };
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function reorderTeamMembers(orderedIds: string[]): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  
  const now = Timestamp.now();
  const updates = orderedIds.map((id: string, index: number) => 
    updateDoc(doc(db as NonNullable<typeof db>, COLLECTION_NAME, id), {
      order: index,
      updatedAt: now,
    })
  );
  
  await Promise.all(updates);
}
