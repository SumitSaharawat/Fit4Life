/**
 * Free Exercise DB (yuhonas/free-exercise-db) – fetch and image URLs.
 * Data: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json
 * Images: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/
 */

const EXERCISES_JSON_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

let cachedList = null;

/** Fetch full exercise list (cached). Returns array of API-format exercises. */
export async function fetchExerciseDb() {
  if (cachedList) return cachedList;
  const res = await fetch(EXERCISES_JSON_URL);
  if (!res.ok) throw new Error("Failed to load exercise database");
  const json = await res.json();
  cachedList = Array.isArray(json) ? json : [];
  return cachedList;
}

/** Get image URL for an API-format exercise (uses first image in images array). */
export function getApiExerciseImageUrl(ex) {
  if (!ex || !ex.images || ex.images.length === 0) return null;
  const path = ex.images[0];
  return path ? `${IMAGE_BASE}${path}` : null;
}

/** Get full image URL from relative path (e.g. "3_4_Sit-Up/0.jpg"). */
export function getApiImageUrlFromPath(path) {
  return path ? `${IMAGE_BASE}${path}` : null;
}

/** Search API list by name (case-insensitive). Optionally filter by primaryMuscles. */
export function searchExerciseDb(list, query, muscleFilter) {
  if (!list || !list.length) return [];
  const q = (query || "").trim().toLowerCase();
  const muscle = (muscleFilter || "").trim().toLowerCase();
  return list.filter((ex) => {
    const matchName = !q || (ex.name || "").toLowerCase().includes(q);
    const matchMuscle =
      !muscle ||
      (ex.primaryMuscles || []).some((m) => (m || "").toLowerCase() === muscle);
    return matchName && matchMuscle;
  });
}

/** Get unique primary muscles from API list for filter dropdown. */
export function getUniquePrimaryMuscles(list) {
  if (!list || !list.length) return [];
  const set = new Set();
  list.forEach((ex) => (ex.primaryMuscles || []).forEach((m) => set.add(m)));
  return [...set].filter(Boolean).sort();
}

/** Fetch exercise by id from API (for popup/how-to). Returns null if not found. */
export async function getExerciseByIdFromApi(libraryId) {
  if (!libraryId) return null;
  const list = await fetchExerciseDb();
  return list.find((ex) => (ex.id || "").toString() === (libraryId || "").toString()) || null;
}
