import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loadWorkouts, saveWorkouts } from "../lib/workoutsDb";
import ExercisePicker from "../components/ExercisePicker";
import "../Styles/CreatePlan.css";

const IMAGE_POOL = [
  "/CreatePlan1.jpg",
  "/CreatePlan2.jpg",
  "/CreatePlan3.jpg",
  "/CreatePlan4.jpg",
  "/CreatePlan5.jpg",
  "/CreatePlan6.jpg",
];

// optional: non-repeating random picker (refills when exhausted)
function makeImagePicker(pool) {
  let bag = [...pool];
  return () => {
    if (bag.length === 0) bag = [...pool];
    const idx = Math.floor(Math.random() * bag.length);
    const picked = bag[idx];
    bag.splice(idx, 1);
    return picked;
  };
}

export default function CreatePlan() {
  const { user, loading } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const loadedRef = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingExercises, setEditingExercises] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [howToModal, setHowToModal] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [supersetPickerForId, setSupersetPickerForId] = useState(null);

  // stable picker across renders
  const pickImageRef = useRef(makeImagePicker(IMAGE_POOL));

  // Load workouts from Firestore (when logged in) or localStorage on mount and when user changes
  useEffect(() => {
    if (loading) return;
    loadedRef.current = false;
    loadWorkouts(user?.uid ?? null).then((w) => {
      setWorkouts(w);
      loadedRef.current = true;
    });
  }, [user?.uid, loading]);

  // Save workouts to Firestore/localStorage whenever they change (after first load)
  useEffect(() => {
    if (loadedRef.current) saveWorkouts(workouts, user?.uid ?? null);
  }, [workouts, user?.uid]);

  const addWorkoutCard = () => {
    if (!newWorkoutName.trim()) return;
    const newWorkout = {
      id: Date.now(),
      name: newWorkoutName.trim(),
      exercises: [],
      image: pickImageRef.current(),
    };
    // Add workout to state and immediately open exercise editor (no form modal)
    setWorkouts((prev) => [...prev, newWorkout]);
    setNewWorkoutName("");
    setShowModal(false);
    // Open exercise editor directly where they can add exercises later
    setCurrentWorkoutId(newWorkout.id);
    setExercises([]);
    setEditingExercises(true);
    setShowExerciseForm(false);
  };

  const startEditing = (e, workout) => {
    e.stopPropagation();
    setEditingWorkoutId(workout.id);
    setEditingName(workout.name);
  };

  const saveEditing = () => {
    if (!editingWorkoutId) return;
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === editingWorkoutId ? { ...w, name: editingName.trim() || w.name } : w
      )
    );
    setEditingWorkoutId(null);
    setEditingName("");
  };

  const startEditingExercises = (e, workout) => {
    e.stopPropagation();
    setCurrentWorkoutId(workout.id);
    // Ensure all exercises have setsArray structure (only for planning - targetReps only)
    const formattedExercises = (workout.exercises || []).map((ex) => {
      if (ex.setsArray && Array.isArray(ex.setsArray) && ex.setsArray.length > 0) {
        // Clean up - only keep targetReps for planning
        return {
          ...ex,
          setsArray: ex.setsArray.map(set => ({
            id: set.id,
            setNumber: set.setNumber,
            targetReps: set.targetReps || 0
          }))
        };
      } else {
        // Convert old format to new format
        const numSets = parseInt(ex.sets) || 0;
        const targetReps = parseInt(ex.reps) || 0;
        return {
          ...ex,
          setsArray: numSets > 0 ? Array.from({ length: numSets }, (_, i) => ({
            id: Date.now() + i,
            setNumber: i + 1,
            targetReps: targetReps
          })) : []
        };
      }
    });
    setExercises(formattedExercises);
    setEditingExercises(true);
    setShowExerciseForm(false);
  };

  const saveExercises = () => {
    if (!currentWorkoutId) return;
    // Ensure all exercises have setsArray with only targetReps (for planning only)
    const exercisesWithSets = exercises.map((ex) => {
      if (ex.setsArray && Array.isArray(ex.setsArray)) {
        // Clean up - only keep targetReps for planning (no progress tracking)
        return {
          ...ex,
          setsArray: ex.setsArray.map(set => ({
            id: set.id,
            setNumber: set.setNumber,
            targetReps: set.targetReps || 0
          }))
        };
      } else {
        // Convert old format to new format (for backwards compatibility)
        const numSets = parseInt(ex.sets) || 0;
        const targetReps = parseInt(ex.reps) || 0;
        return {
          ...ex,
          setsArray: numSets > 0 ? Array.from({ length: numSets }, (_, i) => ({
            id: Date.now() + i,
            setNumber: i + 1,
            targetReps: targetReps
          })) : []
        };
      }
    });
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === currentWorkoutId ? { ...w, exercises: exercisesWithSets } : w
      )
    );
    setEditingExercises(false);
    setCurrentWorkoutId(null);
    setExercises([]);
    setShowExerciseForm(false);
  };

  const cancelExerciseEditing = () => {
    setEditingExercises(false);
    setCurrentWorkoutId(null);
    setExercises([]);
    setShowExerciseForm(false);
  };


  const onPickExercise = (exercise) => {
    setExercises((prev) => [...prev, { ...exercise, setsArray: exercise.setsArray || [] }]);
    setShowExerciseForm(false);
  };

  const deleteExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  // Get the other exercise in the same superset pair (if any)
  const getSupersetPartner = (exs, exercise) => {
    if (!exercise?.supersetGroupId) return null;
    return exs.find((e) => e.id !== exercise.id && e.supersetGroupId === exercise.supersetGroupId) || null;
  };

  // Superset: pair this exercise with the selected one (same supersetGroupId, reorder so partner is right after current)
  const pairSupersetWith = (currentId, partnerId) => {
    const currentIdx = exercises.findIndex((e) => e.id === currentId);
    const partnerIdx = exercises.findIndex((e) => e.id === partnerId);
    if (currentIdx === -1 || partnerIdx === -1) return;
    setOpenMenuId(null);
    setSupersetPickerForId(null);
    const groupId = "ss-" + Date.now();
    setExercises((prev) => {
      const withGroup = prev.map((ex) =>
        ex.id === currentId || ex.id === partnerId ? { ...ex, supersetGroupId: groupId } : ex
      );
      const partnerEx = withGroup.find((e) => e.id === partnerId);
      const withoutPartner = withGroup.filter((e) => e.id !== partnerId);
      const insertAt = withoutPartner.findIndex((e) => e.id === currentId) + 1;
      return [...withoutPartner.slice(0, insertAt), partnerEx, ...withoutPartner.slice(insertAt)];
    });
  };

  // Remove superset for this exercise and its partner
  const removeSuperset = (exerciseId) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    const partner = getSupersetPartner(exercises, ex);
    if (!ex?.supersetGroupId && !partner) return;
    const idToClear = ex?.supersetGroupId ? ex.supersetGroupId : partner?.supersetGroupId;
    setExercises((prev) =>
      prev.map((e) => (e.supersetGroupId === idToClear ? { ...e, supersetGroupId: undefined } : e))
    );
    setOpenMenuId(null);
    setSupersetPickerForId(null);
  };

  // Set rest (sec) for this exercise (used in workout)
  const setExerciseRestSec = (exerciseId, value) => {
    const num = value === "" || value == null ? undefined : Math.min(600, Math.max(0, parseInt(String(value), 10) || 0));
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, restTimerSeconds: num } : ex))
    );
  };

  const deleteWorkout = (e, workoutId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this workout?")) {
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    }
  };


  const currentWorkout = workouts.find((w) => w.id === currentWorkoutId);

  return (
    <div className="create-plan">
      {!editingExercises ? (
        <>
          <h2>Create Your Workout Plan</h2>

          <div className="card-container">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="workout-card"
                style={{
                  backgroundImage: workout.image ? `url(${workout.image})` : undefined,
                }}
              >
                <div className="card-title">
                  {editingWorkoutId === workout.id ? (
                    <input
                      className="edit-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={(e) => e.key === "Enter" && saveEditing()}
                      autoFocus
                    />
                  ) : (
                    <>
                      <h3 className="workout-name">{workout.name}</h3>
                      {workout.exercises && workout.exercises.length > 0 && (
                        <span className="exercise-count">{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
                      )}

                      {/* Edit Workout button */}
                      <button
                        className="edit-workout-card-btn"
                        aria-label="Edit workout"
                        title="Edit workout"
                        onClick={(e) => startEditingExercises(e, workout)}
                      >
                        ✎ Edit
                      </button>

                      {/* Edit button at top-left */}
                      <button
                        className="edit-btn top-left"
                        aria-label="Edit workout name"
                        title="Edit name"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(e, workout);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.8" fill="currentColor"/>
                          <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                        </svg>
                      </button>

                      {/* Delete button at top-right */}
                      <button
                        className="delete-btn top-right"
                        aria-label="Delete workout"
                        title="Delete workout"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkout(e, workout.id);
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            <button onClick={() => setShowModal(true)} className="add-btn">+</button>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Create New Workout</h3>
                <input
                  type="text"
                  placeholder="Enter workout name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWorkoutCard()}
                />
                <div className="modal-actions">
                  <button onClick={addWorkoutCard}>Add</button>
                  <button onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="exercise-editor">
          <div className="editor-header">
            <h2>{currentWorkout?.name || "Workout"}</h2>
            <button className="close-editor-btn" onClick={cancelExerciseEditing}>
              ✕
            </button>
          </div>
          
          <div className="exercises-list">
            {exercises.length > 0 ? (
              <div className="exercises-container">
                {exercises.map((exercise) => {
                  const partner = getSupersetPartner(exercises, exercise);
                  const isSupersetPair = !!partner;
                  const menuOpen = openMenuId === exercise.id;
                  return (
                    <div key={exercise.id} className="unified-exercise-card">
                      <div className="exercise-header-row">
                        <h3 className="exercise-name-header">{exercise.name}</h3>
                        <div className="exercise-card-actions">
                          <div className="exercise-card-menu-wrap">
                            <button
                              type="button"
                              className="exercise-card-menu-btn"
                              onClick={() => setOpenMenuId(menuOpen ? null : exercise.id)}
                              aria-label="Options"
                              title="Timer & Superset"
                            >
                              ⋮
                            </button>
                            {menuOpen && (
                              <>
                                <div className="exercise-card-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                                <div className="exercise-card-menu-dropdown">
                                  <div className="exercise-card-menu-item exercise-card-menu-timer">
                                    <label>Rest (sec)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="600"
                                      placeholder="Default"
                                      value={exercise.restTimerSeconds ?? ""}
                                      onChange={(e) => setExerciseRestSec(exercise.id, e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="exercise-card-menu-item"
                                    onClick={() => {
                                      setSupersetPickerForId(exercise.id);
                                    }}
                                  >
                                    Superset
                                  </button>
                                  {isSupersetPair && (
                                    <button
                                      type="button"
                                      className="exercise-card-menu-item"
                                      onClick={() => removeSuperset(exercise.id)}
                                    >
                                      Remove superset
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="exercise-card-menu-item exercise-card-menu-delete"
                                    onClick={() => { deleteExercise(exercise.id); setOpenMenuId(null); }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSupersetPair && (
                        <div className="exercise-superset-badge">
                          <span className="superset-label">Superset with {partner.name}</span>
                        </div>
                      )}
                      <p className="exercise-info-text">Sets can be added during workout session</p>
                      <div className="exercise-how-to-row">
                        {exercise.libraryId ? (
                          <Link
                            to={`/exercise/${encodeURIComponent(exercise.libraryId)}`}
                            className="how-to-do-it-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            How to do it
                          </Link>
                        ) : exercise.instruction ? (
                          <button
                            type="button"
                            className="how-to-do-it-btn"
                            onClick={() =>
                              setHowToModal({
                                title: exercise.name,
                                instruction: exercise.instruction,
                              })
                            }
                          >
                            How to do it
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-exercises">No exercises added yet. Click "Add Exercise" to get started.</p>
            )}
          </div>

          {showExerciseForm && (
            <ExercisePicker
              onSelect={onPickExercise}
              onCancel={() => setShowExerciseForm(false)}
            />
          )}

          <div className="exercise-editor-actions">
            <button
              className="add-exercise-btn"
              onClick={() => setShowExerciseForm(true)}
            >
              {exercises.length > 0 ? "Add More Exercise" : "Add Exercise"}
            </button>
            <button className="save-exercises-btn" onClick={saveExercises}>
              Save Workout & Progress
            </button>
          </div>

          {howToModal && (
            <div className="modal-overlay" onClick={() => setHowToModal(null)}>
              <div className="modal how-to-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{howToModal.title}</h3>
                <h4 className="how-to-modal-subtitle">How to do it</h4>
                <div className="how-to-modal-content">
                  {howToModal.instruction.split("\n").map((line, i) => (
                    <p key={i}>{line.trim() || "\u00A0"}</p>
                  ))}
                </div>
                <div className="modal-actions">
                  <button onClick={() => setHowToModal(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {supersetPickerForId != null && (
            <div className="modal-overlay" onClick={() => setSupersetPickerForId(null)}>
              <div className="modal superset-picker-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Pair with exercise (superset)</h3>
                <p className="superset-picker-hint">Select an exercise to pair with. They will be done back-to-back with minimal rest.</p>
                <ul className="superset-picker-list">
                  {exercises
                    .filter((ex) => ex.id !== supersetPickerForId)
                    .map((ex) => (
                      <li key={ex.id}>
                        <button
                          type="button"
                          className="superset-picker-item"
                          onClick={() => pairSupersetWith(supersetPickerForId, ex.id)}
                        >
                          {ex.name}
                        </button>
                      </li>
                    ))}
                </ul>
                <div className="modal-actions">
                  <button onClick={() => setSupersetPickerForId(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
