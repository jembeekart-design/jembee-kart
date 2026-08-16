import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  updateDoc,
  setDoc,
  deleteDoc,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

// Utility to recursively extract all string values from the nested FIRESTORE_PATHS object
type NestedPaths<T> = T extends string
  ? T
  : T extends object
  ? { [K in keyof T]: NestedPaths<T[K]> }[keyof T]
  : never;

// This type ensures the constructor only accepts paths defined in FIRESTORE_PATHS
type ValidFirestorePath = NestedPaths<typeof FIRESTORE_PATHS>;

/**
 * BaseFirestoreService
 * Shared foundation for standardized Firestore CRUD operations.
 * Modules should extend this class, passing a path validated against FIRESTORE_PATHS.
 */
export abstract class BaseFirestoreService<T extends DocumentData> {
  constructor(protected readonly collectionPath: ValidFirestorePath) {}

  protected getCollectionRef() {
    return collection(db, this.collectionPath);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionPath, id);
  }

  async getById(id: string): Promise<(T & { id: string }) | null> {
    const snap = await getDoc(this.getDocRef(id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T & { id: string }) : null;
  }

  async query(constraints: QueryConstraint[]): Promise<(T & { id: string })[]> {
    const q = query(this.getCollectionRef(), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }));
  }

  async create(id: string, data: T): Promise<void> {
    await setDoc(this.getDocRef(id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await updateDoc(this.getDocRef(id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }
}
