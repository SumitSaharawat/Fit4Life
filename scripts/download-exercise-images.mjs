#!/usr/bin/env node
/**
 * Downloads exercise images from demoGif URLs into public/exercise-images/
 * Run from project root: node scripts/download-exercise-images.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "exercise-images");

mkdirSync(outDir, { recursive: true });

// Dynamic import of exercises (path relative to project root)
const exercisesModule = await import("../src/data/exercises.js");
const exercises = exercisesModule.exercises;

let ok = 0;
let fail = 0;

for (const ex of exercises) {
  const url = ex.demoGif;
  if (!url) {
    console.warn("Skip (no URL):", ex.id);
    fail++;
    continue;
  }
  const safeId = ex.id.replace(/[^a-z0-9-]/gi, "-");
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.warn("HTTP", res.status, ex.id);
      fail++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = "png";
    const filePath = join(outDir, `${safeId}.${ext}`);
    writeFileSync(filePath, buf);
    console.log("OK", safeId + "." + ext);
    ok++;
  } catch (err) {
    console.warn("Fail", ex.id, err.message);
    fail++;
  }
}

// Download or create fallback placeholder
const placeholderPath = join(outDir, "placeholder.png");
try {
  const phRes = await fetch("https://placehold.co/400x300/2d2d2d/ff8c00?text=Exercise");
  if (phRes.ok) {
    const buf = Buffer.from(await phRes.arrayBuffer());
    writeFileSync(placeholderPath, buf);
    console.log("OK placeholder.png");
  } else throw new Error("HTTP " + phRes.status);
} catch (_) {
  const minimalPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  writeFileSync(placeholderPath, minimalPng);
  console.log("Created placeholder.png (minimal)");
}

console.log("\nDone. Downloaded:", ok, "Failed:", fail);
console.log("Images saved to public/exercise-images/");
