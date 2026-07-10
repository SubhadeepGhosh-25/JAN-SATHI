import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch 
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { Scheme, UserProfile, FamilyMember, DocumentFile, Application, Reminder, NotificationItem, ChatMessage, SEED_SCHEMES } from "../types";

// Helper to check and seed government schemes
export async function seedSchemesIfEmpty() {
  try {
    const schemesRef = collection(db, "schemes");
    const snapshot = await getDocs(query(schemesRef, limit(1)));
    if (snapshot.empty) {
      console.log("Seeding initial government schemes...");
      const batch = writeBatch(db);
      SEED_SCHEMES.forEach((scheme) => {
        const docRef = doc(schemesRef, scheme.id);
        batch.set(docRef, scheme);
      });
      await batch.commit();
      console.log("Government schemes seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding schemes:", error);
  }
}

// ---------------- USER PROFILE SERVICES ----------------
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

// ---------------- SCHEMES SERVICES ----------------
export async function getSchemes(): Promise<Scheme[]> {
  try {
    const schemesRef = collection(db, "schemes");
    const snapshot = await getDocs(schemesRef);
    const list: Scheme[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Scheme);
    });
    return list;
  } catch (error) {
    console.error("Error fetching schemes:", error);
    return SEED_SCHEMES; // Fallback
  }
}

// ---------------- SAVED SCHEMES SERVICES ----------------
export async function getSavedSchemeIds(userId: string): Promise<string[]> {
  try {
    const savedRef = collection(db, "savedSchemes");
    const q = query(savedRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const ids: string[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.schemeId) {
        ids.push(data.schemeId);
      }
    });
    return ids;
  } catch (error) {
    console.error("Error getting saved schemes:", error);
    return [];
  }
}

export async function saveScheme(userId: string, schemeId: string): Promise<void> {
  try {
    const docId = `${userId}_${schemeId}`;
    const docRef = doc(db, "savedSchemes", docId);
    await setDoc(docRef, {
      userId,
      schemeId,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving scheme:", error);
    throw error;
  }
}

export async function unsaveScheme(userId: string, schemeId: string): Promise<void> {
  try {
    const docId = `${userId}_${schemeId}`;
    const docRef = doc(db, "savedSchemes", docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error removing saved scheme:", error);
    throw error;
  }
}

// ---------------- APPLICATIONS SERVICES ----------------
export async function getApplications(userId: string): Promise<Application[]> {
  try {
    const appsRef = collection(db, "applications");
    const q = query(appsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const list: Application[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Application);
    });
    return list;
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export async function submitApplication(userId: string, app: Application): Promise<void> {
  try {
    const docRef = doc(db, "applications", app.id);
    await setDoc(docRef, {
      ...app,
      userId,
      submittedAt: app.submittedAt || new Date().toISOString()
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
}

// ---------------- DOCUMENTS SERVICES (STORAGE & FIRESTORE) ----------------
export async function getUserDocuments(userId: string): Promise<DocumentFile[]> {
  try {
    const docsRef = collection(db, "documents");
    const q = query(docsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const list: DocumentFile[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as DocumentFile);
    });
    return list;
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
}

export async function uploadDocumentFile(
  userId: string, 
  documentType: string, 
  documentId: string, 
  holderName: string, 
  base64Data: string, 
  mimeType: string,
  extra: Partial<DocumentFile> = {}
): Promise<DocumentFile> {
  try {
    let fileUrl = "";
    // Only upload to Storage if base64Data is a proper data URL/base64 payload
    if (base64Data && base64Data.includes("base64,")) {
      const storageRef = ref(storage, `documents/${userId}/${Date.now()}_${documentType.replace(/\s+/g, "_")}`);
      // Upload string as data_url
      await uploadString(storageRef, base64Data, "data_url");
      fileUrl = await getDownloadURL(storageRef);
    } else {
      fileUrl = base64Data; // Use direct base64/placeholder as is
    }

    const docId = `doc-${Date.now()}`;
    const docRef = doc(db, "documents", docId);
    
    const newDoc: DocumentFile = {
      id: docId,
      documentType,
      documentId,
      holderName,
      fileUrl,
      verified: true,
      uploadedAt: new Date().toISOString().split("T")[0],
      ...extra
    };

    await setDoc(docRef, {
      ...newDoc,
      userId
    });

    return newDoc;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export async function deleteDocument(docId: string): Promise<void> {
  try {
    const docRef = doc(db, "documents", docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// ---------------- FAMILY MEMBERS SERVICES ----------------
export async function getFamilyMembers(userId: string): Promise<FamilyMember[]> {
  try {
    const famRef = collection(db, "familyMembers");
    const q = query(famRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const list: FamilyMember[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as FamilyMember);
    });
    return list;
  } catch (error) {
    console.error("Error fetching family members:", error);
    return [];
  }
}

export async function saveFamilyMember(userId: string, member: FamilyMember): Promise<void> {
  try {
    const docRef = doc(db, "familyMembers", member.id);
    await setDoc(docRef, {
      ...member,
      userId
    });
  } catch (error) {
    console.error("Error saving family member:", error);
    throw error;
  }
}

export async function deleteFamilyMember(memberId: string): Promise<void> {
  try {
    const docRef = doc(db, "familyMembers", memberId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting family member:", error);
    throw error;
  }
}

// ---------------- REMINDERS SERVICES ----------------
export async function getReminders(userId: string): Promise<Reminder[]> {
  try {
    const remRef = collection(db, "reminders");
    const q = query(remRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const list: Reminder[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Reminder);
    });
    return list;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }
}

export async function saveReminder(userId: string, reminder: Reminder): Promise<void> {
  try {
    const docRef = doc(db, "reminders", reminder.id);
    await setDoc(docRef, {
      ...reminder,
      userId
    });
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw error;
  }
}

export async function toggleReminderCompleted(reminderId: string, completed: boolean): Promise<void> {
  try {
    const docRef = doc(db, "reminders", reminderId);
    await updateDoc(docRef, { completed });
  } catch (error) {
    console.error("Error toggling reminder completion:", error);
    throw error;
  }
}

export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    const docRef = doc(db, "reminders", reminderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
}

// ---------------- NOTIFICATIONS SERVICES ----------------
export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const notRef = collection(db, "notifications");
    const q = query(notRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const list: NotificationItem[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as NotificationItem);
    });
    // Sort by time/id desc (simplistic fallback)
    return list.sort((a, b) => b.id.localeCompare(a.id));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function saveNotification(userId: string, item: NotificationItem): Promise<void> {
  try {
    const docRef = doc(db, "notifications", item.id);
    await setDoc(docRef, {
      ...item,
      userId
    });
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
}

export async function markNotificationRead(itemId: string, unread: boolean): Promise<void> {
  try {
    const docRef = doc(db, "notifications", itemId);
    await updateDoc(docRef, { unread });
  } catch (error) {
    console.error("Error updating notification status:", error);
    throw error;
  }
}

export async function deleteNotification(itemId: string): Promise<void> {
  try {
    const docRef = doc(db, "notifications", itemId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

// ---------------- CHAT ASSISTANT HISTORY SERVICES ----------------
export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const chatRef = collection(db, "chat_history");
    const q = query(chatRef, where("userId", "==", userId), orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);
    const list: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        role: data.role,
        parts: [{ text: data.text }]
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function saveChatMessage(userId: string, role: 'user' | 'model', text: string): Promise<void> {
  try {
    const chatRef = collection(db, "chat_history");
    await addDoc(chatRef, {
      userId,
      role,
      text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
}
