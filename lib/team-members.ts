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

export interface TeamMeemerging businessr {
  id: string;
  name: string;
  title: string;
  initials: string;
  bio: string;
  imageUrl?: string;
  imageName?: string;
  order: nuemerging businessr;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateTeamMeemerging businessrInput {
  name: string;
  title: string;
  initials: string;
  bio: string;
  imageUrl?: string;
  imageName?: string;
  order?: nuemerging businessr;
  createdBy?: string;
}

export interface UpdateTeamMeemerging businessrInput {
  name?: string;
  title?: string;
  initials?: string;
  bio?: string;
  imageUrl?: string;
  imageName?: string;
  order?: nuemerging businessr;
  updatedBy?: string;
}

const COLLECTION_NAME = "teamMeemerging businessrs";

function docToTeamMeemerging businessr(docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData): TeamMeemerging businessr {
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

export async function getTeamMeemerging businessrs(): Promise<TeamMeemerging businessr[]> {
  if (!db) throw new Error("Firestore not initialized");
  
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("order", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToTeamMeemerging businessr);
}

export async function getTeamMeemerging businessrById(id: string): Promise<TeamMeemerging businessr | null> {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  return docToTeamMeemerging businessr(snapshot);
}

export async function createTeamMeemerging businessr(input: CreateTeamMeemerging businessrInput): Promise<TeamMeemerging businessr> {
  if (!db) throw new Error("Firestore not initialized");
  
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...input,
    order: input.order || 0,
    createdAt: now,
    updatedAt: now,
  });
  
  const newDoc = await getDoc(docRef);
  if (!newDoc.exists()) throw new Error("Failed to create team meemerging businessr");
  
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

export async function updateTeamMeemerging businessr(
  id: string,
  input: UpdateTeamMeemerging businessrInput
): Promise<TeamMeemerging businessr> {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  const now = Timestamp.now();
  
  await updateDoc(docRef, {
    ...input,
    updatedAt: now,
  });
  
  const updatedDoc = await getDoc(docRef);
  if (!updatedDoc.exists()) throw new Error("Team meemerging businessr not found");
  
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

export async function deleteTeamMeemerging businessr(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function reorderTeamMeemerging businessrs(orderedIds: string[]): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  
  const now = Timestamp.now();
  const updates = orderedIds.map((id: string, index: nuemerging businessr) => 
    updateDoc(doc(db as NonNullable<typeof db>, COLLECTION_NAME, id), {
      order: index,
      updatedAt: now,
    })
  );
  
  await Promise.all(updates);
}
