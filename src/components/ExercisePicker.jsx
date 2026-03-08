import React, { useState, useEffect } from "react";
import {
  fetchExerciseDb,
  searchExerciseDb,
  getUniquePrimaryMuscles,
  getApiExerciseImageUrl,
} from "../lib/exerciseDbApi";
import { EXERCISE_IMAGE_PLACEHOLDER } from "../lib/exerciseImages";
import "../Styles/ExercisePicker.css";

const COMMON_EQUIPMENT = [
  "Body only",
  "Mat",
  "Dumbbells",
  "Barbell",
  "Kettlebell",
  "Resistance band",
  "Bench",
  "Chair",
  "Pull-up bar",
  "Step",
  "Medicine ball",
  "Other",
];

/**
 * Called with a workout exercise object: { id, name, setsArray, libraryId?, equipment?, instruction? }
 * libraryId = API exercise id (for "How to do it" link to detail page).
 */
export default function ExercisePicker({ onSelect, onCancel }) {
  const [mode, setMode] = useState("library");
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");

  useEffect(() => {
    if (mode !== "library") return;
    setLoading(true);
    fetchExerciseDb()
      .then((data) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [mode]);

  const muscles = getUniquePrimaryMuscles(list);
  const filteredLibrary = searchExerciseDb(list, search, muscleFilter);

  const addFromLibrary = (ex) => {
    onSelect({
      id: Date.now(),
      name: ex.name,
      libraryId: ex.id,
      equipment: ex.equipment ? (Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment]) : [],
      setsArray: [],
    });
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const equipmentList = customEquipment
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSelect({
      id: Date.now(),
      name,
      fromLibrary: false,
      instruction: customInstruction.trim() || undefined,
      equipment: equipmentList,
      setsArray: [],
    });
  };

  return (
    <div className="exercise-picker-overlay" onClick={onCancel}>
      <div className="exercise-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exercise-picker-header">
          <h3>Add Exercise</h3>
          <button type="button" className="exercise-picker-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="exercise-picker-tabs">
          <button
            type="button"
            className={mode === "library" ? "active" : ""}
            onClick={() => setMode("library")}
          >
            From library
          </button>
          <button
            type="button"
            className={mode === "custom" ? "active" : ""}
            onClick={() => setMode("custom")}
          >
            Create custom
          </button>
        </div>

        {mode === "library" ? (
          <>
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="exercise-picker-search"
            />
            <select
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              className="exercise-picker-muscle-select"
            >
              <option value="">All muscles</option>
              {muscles.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="exercise-picker-list">
              {loading ? (
                <p className="exercise-picker-empty">Loading exercises…</p>
              ) : filteredLibrary.length === 0 ? (
                <p className="exercise-picker-empty">No exercises match. Try "Create custom".</p>
              ) : (
                filteredLibrary.map((ex) => {
                  const imgUrl = getApiExerciseImageUrl(ex) || EXERCISE_IMAGE_PLACEHOLDER;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      className="exercise-picker-item"
                      onClick={() => addFromLibrary(ex)}
                    >
                      <span className="exercise-picker-item-img-wrap">
                        <img
                          src={imgUrl}
                          alt=""
                          className="exercise-picker-item-img"
                          onError={(e) => {
                            if (e.target.src !== EXERCISE_IMAGE_PLACEHOLDER)
                              e.target.src = EXERCISE_IMAGE_PLACEHOLDER;
                          }}
                        />
                      </span>
                      <span className="exercise-picker-item-info">
                        <span className="exercise-picker-item-name">{ex.name}</span>
                        {ex.equipment && (
                          <span className="exercise-picker-item-equipment">
                            {typeof ex.equipment === "string" ? ex.equipment : (ex.equipment || []).join(", ")}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="exercise-picker-custom">
            <label>
              Exercise name <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Custom movement"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="exercise-picker-input"
            />
            <label>Instruction (optional)</label>
            <textarea
              placeholder="How to do it..."
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              className="exercise-picker-textarea"
              rows={3}
            />
            <label>Equipment (optional, comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Dumbbells, Bench"
              value={customEquipment}
              onChange={(e) => setCustomEquipment(e.target.value)}
              className="exercise-picker-input"
            />
            <p className="exercise-picker-hint">Suggestions: {COMMON_EQUIPMENT.join(", ")}</p>
            <div className="exercise-picker-actions">
              <button
                type="button"
                className="exercise-picker-add-btn"
                onClick={addCustom}
                disabled={!customName.trim()}
              >
                Add exercise
              </button>
              <button type="button" className="exercise-picker-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
