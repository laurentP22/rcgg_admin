import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  Unsubscribe,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import { EventItem, UserProfile, UserRole, UserStatus, BOOTSTRAP_ADMIN_EMAIL, DEFAULT_SAMPLE_USERS } from "../types";

const CLUB_DOC_PATH = "clubs/default";
const EVENTS_COLLECTION = "events";
const USERS_COLLECTION = "users";

export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(userRef);

  const isBootstrap = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    // Ensure bootstrap admin is always Admin and approved
    if (isBootstrap && (data.role !== "Admin" || data.status !== "approved")) {
      const updatedProfile: UserProfile = {
        ...data,
        role: "Admin",
        status: "approved",
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      return updatedProfile;
    }
    return data;
  }

  // Create new profile
  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "Membre du club",
    photoURL: user.photoURL || "",
    role: isBootstrap ? "Admin" : "Benevole",
    status: isBootstrap ? "approved" : "pending",
    createdAt: new Date().toISOString(),
    ...(isBootstrap ? { approvedAt: new Date().toISOString(), approvedBy: "system" } : {}),
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const userRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserProfile);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.warn("Erreur écoute profil utilisateur:", error);
      onError?.(error);
    }
  );
}

export function subscribeToAllUsers(
  onData: (users: UserProfile[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      // Sort: pending first, then by name
      list.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return (a.displayName || "").localeCompare(b.displayName || "");
      });
      onData(list);
    },
    (error) => {
      console.warn("Erreur écoute liste des membres:", error);
      onError?.(error);
    }
  );
}

export async function adminUpdateUser(
  targetUid: string,
  updates: {
    role?: UserRole;
    status?: UserStatus;
    displayName?: string;
  },
  adminUid: string
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, targetUid);
  const dataToUpdate: Record<string, any> = {};
  if (updates.role) dataToUpdate.role = updates.role;
  if (updates.status) {
    dataToUpdate.status = updates.status;
    if (updates.status === "approved") {
      dataToUpdate.approvedAt = new Date().toISOString();
      dataToUpdate.approvedBy = adminUid;
    }
  }
  if (updates.displayName !== undefined) {
    dataToUpdate.displayName = updates.displayName.trim();
  }
  await setDoc(userRef, dataToUpdate, { merge: true });
}

export async function adminDeleteUser(targetUid: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, targetUid);
  await deleteDoc(userRef);
}

export async function adminCreateUser(userData: {
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  adminUid: string;
}): Promise<UserProfile> {
  const cleanId = "user-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const newUser: UserProfile = {
    uid: cleanId,
    displayName: userData.displayName.trim() || "Nouveau Membre",
    email: userData.email.trim().toLowerCase(),
    role: userData.role,
    status: userData.status,
    createdAt: now,
    approvedAt: userData.status === "approved" ? now : undefined,
    approvedBy: userData.status === "approved" ? userData.adminUid : undefined,
  };
  const userRef = doc(db, USERS_COLLECTION, cleanId);
  await setDoc(userRef, newUser);
  return newUser;
}

export async function ensureInitialTwoFakeUsers(adminEmail: string = BOOTSTRAP_ADMIN_EMAIL): Promise<void> {
  const initKey = "rugby_fake_users_init_v3";
  if (localStorage.getItem(initKey) === "done") {
    return;
  }

  // Clean up legacy deleted/old sample users from Firestore once
  const legacyUids = ["fake-benevole-2", "fake-joueur-2", "fake-pending-1"];
  for (const uid of legacyUids) {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, uid));
    } catch (_) {}
  }

  // Ensure Benevol1 and Joueur1 are set once
  for (const sampleUser of DEFAULT_SAMPLE_USERS) {
    try {
      const userRef = doc(db, USERS_COLLECTION, sampleUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          ...sampleUser,
          approvedBy: sampleUser.status === "approved" ? adminEmail : undefined,
        });
      } else {
        const existingData = snap.data();
        if (existingData?.displayName && (existingData.displayName.includes("Buvette") || existingData.displayName.includes("Marc"))) {
          await setDoc(userRef, {
            displayName: "Benevol1",
            email: "benevol1@rugby-club.fr",
          }, { merge: true });
        }
      }
    } catch (err) {
      console.warn("Erreur init demo user", err);
    }
  }

  localStorage.setItem(initKey, "done");
}

export async function seedSampleUsersToFirestore(adminEmail: string = BOOTSTRAP_ADMIN_EMAIL): Promise<void> {
  await ensureInitialTwoFakeUsers(adminEmail);
}

export function subscribeToClub(
  onData: (clubName: string) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const clubRef = doc(db, "clubs", "default");
  return onSnapshot(
    clubRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.name) {
          onData(data.name);
        }
      }
    },
    (error) => {
      console.warn("Erreur écoute club Firestore:", error);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.GET, CLUB_DOC_PATH);
      } catch (e) {
        // Handled
      }
    }
  );
}

export function subscribeToEvents(
  onData: (events: EventItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const eventsRef = collection(db, EVENTS_COLLECTION);
  return onSnapshot(
    eventsRef,
    (snapshot) => {
      const items: EventItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          nom: d.nom || "Sans titre",
          type: d.type || "senior_dom",
          cat: d.cat || "Seniors",
          date: d.date || "",
          lieu: d.lieu || "",
          horaire: d.horaire || "",
          adversaire: d.adversaire || "",
          notes: d.notes || "",
          materiel: Array.isArray(d.materiel) ? d.materiel : [],
          todo: Array.isArray(d.todo) ? d.todo : [],
          benevoles: Array.isArray(d.benevoles) ? d.benevoles : [],
          com: Array.isArray(d.com) ? d.com : [],
        });
      });
      onData(items);
    },
    (error) => {
      console.warn("Erreur écoute événements Firestore:", error);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.GET, EVENTS_COLLECTION);
      } catch (e) {
        // Handled
      }
    }
  );
}

export async function saveClubToFirestore(clubName: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = "clubs/default";
  try {
    const clubRef = doc(db, "clubs", "default");
    await setDoc(
      clubRef,
      {
        name: clubName.slice(0, 100),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveEventToFirestore(event: EventItem): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `events/${event.id}`;
  try {
    const eventRef = doc(db, "events", event.id);
    await setDoc(
      eventRef,
      {
        id: event.id,
        nom: (event.nom || "Sans titre").slice(0, 200),
        type: event.type.slice(0, 50),
        cat: event.cat.slice(0, 100),
        date: event.date ? event.date.slice(0, 20) : "",
        lieu: event.lieu ? event.lieu.slice(0, 200) : "",
        horaire: event.horaire ? event.horaire.slice(0, 100) : "",
        adversaire: event.adversaire ? event.adversaire.slice(0, 200) : "",
        notes: event.notes ? event.notes.slice(0, 1000) : "",
        materiel: event.materiel || [],
        todo: event.todo || [],
        benevoles: event.benevoles || [],
        com: event.com || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `events/${eventId}`;
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedInitialFirestoreData(
  clubName: string,
  events: EventItem[]
): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  try {
    await saveClubToFirestore(clubName);
    for (const ev of events) {
      await saveEventToFirestore(ev);
    }
  } catch (error) {
    console.error("Erreur initialisation Firestore:", error);
  }
}
