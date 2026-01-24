import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseEnabled } from "./firebase";

const WORKOUTS_KEY = "workouts";

/**
 * @param {string | null | undefined} userId - Firebase Auth UID. If null/undefined, uses localStorage only.
 * @returns {Promise<Array>} workouts array
 */
export async function loadWorkouts(userId) {
  if (userId && isFirebaseEnabled()) {
    try {
      const snap = await getDoc(doc(db, WORKOUTS_KEY, userId));
      const data = snap.data();
      return (data && data.list) || [];
    } catch (e) {
      console.warn("Firestore loadWorkouts failed, using localStorage:", e.message);
    }
  }
  const raw = localStorage.getItem(WORKOUTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * @param {Array} workouts
 * @param {string | null | undefined} userId - Firebase Auth UID. If null/undefined, uses localStorage only.
 */
export async function saveWorkouts(workouts, userId) {
  if (userId && isFirebaseEnabled()) {
    try {
      await setDoc(doc(db, WORKOUTS_KEY, userId), { list: workouts });
      return;
    } catch (e) {
      console.warn("Firestore saveWorkouts failed, saving to localStorage:", e.message);
    }
  }
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}
