import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  fetchExerciseDb,
  searchExerciseDb,
  getUniquePrimaryMuscles,
  getApiExerciseImageUrl,
  getApiImageUrlFromPath,
} from "../lib/exerciseDbApi";
import { EXERCISE_IMAGE_PLACEHOLDER } from "../lib/exerciseImages";
import "../Styles/Exercises.css";

const PAGE_SIZE = 60;
const POPUP_GIF_MS = 1500;

export default function Exercises() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const popupImageRef = useRef(null);
  const popupGifIntervalRef = useRef(null);

  const muscles = useMemo(() => getUniquePrimaryMuscles(list), [list]);
  const results = useMemo(
    () => searchExerciseDb(list, query, muscleFilter),
    [list, query, muscleFilter]
  );

  const visibleResults = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount]
  );

  const hasMore = results.length > visibleCount;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchExerciseDb()
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load exercises.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, muscleFilter]);

  // Run GIF only while popup is open; stop when modal closes
  useEffect(() => {
    if (!selectedExercise?.images?.length || selectedExercise.images.length <= 1 || !popupImageRef.current) {
      if (popupGifIntervalRef.current) {
        clearInterval(popupGifIntervalRef.current);
        popupGifIntervalRef.current = null;
      }
      return;
    }
    const urls = selectedExercise.images.map((p) => getApiImageUrlFromPath(p)).filter(Boolean);
    if (urls.length === 0) return;
    let idx = 0;
    popupImageRef.current.src = urls[0];
    popupGifIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % urls.length;
      if (popupImageRef.current) popupImageRef.current.src = urls[idx];
    }, POPUP_GIF_MS);
    return () => {
      if (popupGifIntervalRef.current) {
        clearInterval(popupGifIntervalRef.current);
        popupGifIntervalRef.current = null;
      }
    };
  }, [selectedExercise?.id, selectedExercise?.images?.length]);

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, results.length));
  };

  return (
    <div className="exercises-page">
      <div className="exercises-header">
        <h1>Exercise Library</h1>
        <p className="exercises-subtitle">
          Search by name or filter by muscle. Tap an exercise for instructions and images.
        </p>

        <div className="exercises-search-row">
          <div className="exercises-search-wrap">
            <label htmlFor="exercise-search" className="exercises-search-label">
              Search
            </label>
            <input
              id="exercise-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="exercises-search-input"
              autoComplete="off"
            />
          </div>
          <div className="exercises-muscle-menu">
            <label htmlFor="muscle-select" className="exercises-muscle-menu-label">
              Muscle
            </label>
            <select
              id="muscle-select"
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              className="exercises-muscle-select-main"
            >
              <option value="">All muscles</option>
              {muscles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="exercises-placeholder">
          <p className="exercises-placeholder-text">Loading exercise database…</p>
        </div>
      )}

      {error && (
        <div className="exercises-placeholder">
          <p className="exercises-placeholder-text exercises-error">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="exercises-result-count">
            {results.length} exercise{results.length !== 1 ? "s" : ""} found
            {hasMore && ` (showing ${visibleResults.length})`}
          </p>
          {visibleResults.length > 0 ? (
            <>
              <div className="exercises-grid">
                {visibleResults.map((ex) => {
                  const images = ex.images && ex.images.length > 0 ? ex.images : [];
                  const imgUrl = images.length
                    ? (getApiImageUrlFromPath(images[0]) || EXERCISE_IMAGE_PLACEHOLDER)
                    : (getApiExerciseImageUrl(ex) || EXERCISE_IMAGE_PLACEHOLDER);
                  const primary = (ex.primaryMuscles || []).slice(0, 3).join(", ");
                  return (
                    <div
                      key={ex.id}
                      role="button"
                      tabIndex={0}
                      className="exercise-card-link"
                      onClick={() => setSelectedExercise(ex)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedExercise(ex);
                        }
                      }}
                    >
                      <article className="exercise-card">
                        <div className="exercise-card-image-wrap">
                          <img
                            src={imgUrl}
                            alt=""
                            className="exercise-card-image"
                            loading="lazy"
                            onError={(e) => {
                              if (e.target.src !== EXERCISE_IMAGE_PLACEHOLDER)
                                e.target.src = EXERCISE_IMAGE_PLACEHOLDER;
                            }}
                          />
                        </div>
                        <div className="exercise-card-body">
                          <h2 className="exercise-card-name">{ex.name}</h2>
                          {primary && (
                            <p className="exercise-card-muscles">{primary}</p>
                          )}
                          <div className="exercise-card-meta">
                            {ex.equipment && (
                              <span className="exercise-card-equipment">{ex.equipment}</span>
                            )}
                            {ex.level && (
                              <span className="exercise-card-level">{ex.level}</span>
                            )}
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
              {hasMore && (
                <div className="exercises-load-more-wrap">
                  <button
                    type="button"
                    className="exercises-load-more-btn"
                    onClick={loadMore}
                  >
                    Load more ({results.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="exercises-placeholder">
              <p className="exercises-placeholder-text">
                No exercises match. Try a different search or muscle.
              </p>
            </div>
          )}
        </>
      )}

      {selectedExercise && (
        <div
          className="exercises-popup-overlay"
          onClick={() => setSelectedExercise(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercises-popup-title"
        >
          <div className="exercises-popup" onClick={(e) => e.stopPropagation()}>
            <div className="exercises-popup-header">
              <h2 id="exercises-popup-title" className="exercises-popup-title">
                {selectedExercise.name}
              </h2>
              <button
                type="button"
                className="exercises-popup-close"
                onClick={() => setSelectedExercise(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="exercises-popup-body">
              {selectedExercise.images && selectedExercise.images.length > 0 && (
                <div className="exercises-popup-image-wrap">
                  <img
                    ref={popupImageRef}
                    src={getApiImageUrlFromPath(selectedExercise.images[0]) || EXERCISE_IMAGE_PLACEHOLDER}
                    alt=""
                    className="exercises-popup-image"
                    loading="eager"
                    onError={(e) => {
                      if (e.target.src !== EXERCISE_IMAGE_PLACEHOLDER)
                        e.target.src = EXERCISE_IMAGE_PLACEHOLDER;
                    }}
                  />
                </div>
              )}
              <section className="exercises-popup-section">
                <h3 className="exercises-popup-section-title">How to do it</h3>
                <ol className="exercises-popup-steps">
                  {(selectedExercise.instructions || [])
                    .filter(Boolean)
                    .map((step, i) => (
                      <li key={i}>
                        {typeof step === "string" ? step.replace(/^\d+\.\s*/, "") : step}
                      </li>
                    ))}
                </ol>
              </section>
              {((selectedExercise.primaryMuscles || []).length > 0 ||
                (selectedExercise.secondaryMuscles || []).length > 0) && (
                <section className="exercises-popup-section">
                  <h3 className="exercises-popup-section-title">Muscles</h3>
                  <div className="exercises-popup-tags">
                    {(selectedExercise.primaryMuscles || []).map((m) => (
                      <span key={m} className="exercises-popup-tag exercises-popup-tag-primary">
                        {m}
                      </span>
                    ))}
                    {(selectedExercise.secondaryMuscles || []).map((m) => (
                      <span key={m} className="exercises-popup-tag exercises-popup-tag-secondary">
                        {m}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {selectedExercise.equipment && (
                <section className="exercises-popup-section">
                  <h3 className="exercises-popup-section-title">Equipment</h3>
                  <span className="exercises-popup-tag">{selectedExercise.equipment}</span>
                </section>
              )}
            </div>
            <div className="exercises-popup-footer">
              <button
                type="button"
                className="exercises-popup-close-btn"
                onClick={() => setSelectedExercise(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
