import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getExerciseById, getPrimaryMuscles, getSecondaryMuscles } from "../data/exercises";
import { getExerciseImageUrl, EXERCISE_IMAGE_PLACEHOLDER } from "../lib/exerciseImages";
import {
  fetchExerciseDb,
  getApiExerciseImageUrl,
  getApiImageUrlFromPath,
} from "../lib/exerciseDbApi";
import "../Styles/Exercises.css";

/** True if exercise is from free-exercise-db API (has instructions array). */
function isApiExercise(ex) {
  return ex && Array.isArray(ex.instructions);
}

export default function ExerciseDetail() {
  const { id: rawId } = useParams();
  const id = rawId ? decodeURIComponent(rawId) : "";
  const localExercise = getExerciseById(id);
  const [apiExercise, setApiExercise] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (localExercise || !id) return;
    setApiLoading(true);
    fetchExerciseDb()
      .then((list) => {
        const found = list.find((ex) => (ex.id || "").toString() === id);
        setApiExercise(found || null);
      })
      .catch(() => setApiExercise(null))
      .finally(() => setApiLoading(false));
  }, [id, localExercise]);

  const exercise = localExercise || apiExercise;
  const fromApi = exercise && isApiExercise(exercise);

  if (!exercise && !apiLoading) {
    return (
      <div className="exercises-page">
        <p className="exercise-not-found">Exercise not found.</p>
        <Link to="/exercises" className="exercise-back-link">
          ← Back to Exercise Library
        </Link>
      </div>
    );
  }

  if (apiLoading) {
    return (
      <div className="exercises-page">
        <p className="exercises-placeholder-text">Loading…</p>
        <Link to="/exercises" className="exercise-back-link">
          ← Back to Exercise Library
        </Link>
      </div>
    );
  }

  const steps = fromApi
    ? exercise.instructions.filter(Boolean)
    : (exercise.instruction || "").split("\n").filter(Boolean);
  const primary = fromApi
    ? (exercise.primaryMuscles || [])
    : getPrimaryMuscles(exercise);
  const secondary = fromApi
    ? (exercise.secondaryMuscles || [])
    : getSecondaryMuscles(exercise);
  const imgUrl = fromApi
    ? (getApiExerciseImageUrl(exercise) || EXERCISE_IMAGE_PLACEHOLDER)
    : getExerciseImageUrl(exercise);
  const equipmentList = fromApi
    ? (exercise.equipment ? [exercise.equipment] : [])
    : (exercise.equipment || []);

  return (
    <div className="exercises-page exercise-detail-page">
      <Link to="/exercises" className="exercise-back-link">
        ← Back to Exercise Library
      </Link>

      <div className="exercise-detail-card">
        <h1 className="exercise-detail-name">{exercise.name}</h1>

        <div className="exercise-detail-demo">
          <img
            src={imgUrl}
            alt={`Demo: ${exercise.name}`}
            className="exercise-detail-image"
            onError={(e) => {
              if (e.target.src !== EXERCISE_IMAGE_PLACEHOLDER)
                e.target.src = EXERCISE_IMAGE_PLACEHOLDER;
            }}
          />
        </div>

        {fromApi && exercise.images && exercise.images.length > 1 && (
          <div className="exercise-detail-gallery">
            {exercise.images.slice(0, 4).map((path, i) => (
              <img
                key={i}
                src={getApiImageUrlFromPath(path) || EXERCISE_IMAGE_PLACEHOLDER}
                alt={`Step ${i + 1}`}
                className="exercise-detail-gallery-img"
                onError={(e) => {
                  if (e.target.src !== EXERCISE_IMAGE_PLACEHOLDER)
                    e.target.src = EXERCISE_IMAGE_PLACEHOLDER;
                }}
              />
            ))}
          </div>
        )}

        <section className="exercise-detail-section">
          <h2>How to do it</h2>
          <ol className="exercise-detail-steps">
            {steps.map((step, i) => (
              <li key={i}>{typeof step === "string" ? step.replace(/^\d+\.\s*/, "") : step}</li>
            ))}
          </ol>
        </section>

        {(primary.length > 0 || secondary.length > 0) && (
          <section className="exercise-detail-section">
            <h2>Muscles</h2>
            {primary.length > 0 && (
              <div className="exercise-detail-muscle-group">
                <h3 className="muscle-group-label">Primary</h3>
                <div className="exercise-detail-muscles">
                  {primary.map((m) => (
                    <span key={m} className="muscle-tag muscle-tag-large muscle-tag-primary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {secondary.length > 0 && (
              <div className="exercise-detail-muscle-group">
                <h3 className="muscle-group-label">Secondary</h3>
                <div className="exercise-detail-muscles">
                  {secondary.map((m) => (
                    <span key={m} className="muscle-tag muscle-tag-large muscle-tag-secondary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {equipmentList.length > 0 && (
          <section className="exercise-detail-section">
            <h2>Equipment used</h2>
            <div className="exercise-detail-equipment">
              {equipmentList.map((eq) => (
                <span key={eq} className="equipment-tag">
                  {eq}
                </span>
              ))}
            </div>
          </section>
        )}

        {fromApi && (exercise.level || exercise.category) && (
          <section className="exercise-detail-section">
            <h2>Details</h2>
            <div className="exercise-detail-meta">
              {exercise.level && (
                <span className="equipment-tag">Level: {exercise.level}</span>
              )}
              {exercise.category && (
                <span className="equipment-tag">{exercise.category}</span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
