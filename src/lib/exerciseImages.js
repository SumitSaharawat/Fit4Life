/**
 * Exercise images from src/assets/exercise-images/ (bundled by Vite).
 * Uses .svg files so they open correctly on Mac and in the app.
 */
const glob = import.meta.glob("../assets/exercise-images/*.svg", { eager: true });

const byId = {};
for (const path of Object.keys(glob)) {
  const filename = path.split("/").pop() || "";
  const id = filename.replace(/\.svg$/i, "").toLowerCase();
  if (!id) continue;
  const mod = glob[path];
  const url = mod?.default ?? mod;
  if (url && typeof url === "string") byId[id] = url;
  else if (url && url?.default) byId[id] = url.default;
}

export function getExerciseImageUrl(ex) {
  if (!ex) return EXERCISE_IMAGE_PLACEHOLDER;
  const safeId = (ex.id || "").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const bundled = byId[safeId] || byId["placeholder"];
  if (bundled) return bundled;
  // Never return a URL that 404s — use gray placeholder so you never see red/broken image
  return EXERCISE_IMAGE_PLACEHOLDER;
}

/** Inline SVG fallback when image fails to load (neutral gray, no red) */
export const EXERCISE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#2d2d2d"/>' +
    '<text x="200" y="155" font-family="sans-serif" font-size="18" fill="#888" text-anchor="middle">Exercise</text>' +
    '</svg>'
  );
