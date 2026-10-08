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
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import { EventItem } from "../types";

const CLUB_DOC_PATH = "clubs/default";
const EVENTS_COLLECTION = "events";

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
