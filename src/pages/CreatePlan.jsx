import React, { useRef, useState, useEffect } from "react";
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
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem("workouts");
    return saved ? JSON.parse(saved) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingExercises, setEditingExercises] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseFormData, setExerciseFormData] = useState({
    name: "",
  });

  // stable picker across renders
  const pickImageRef = useRef(makeImagePicker(IMAGE_POOL));

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

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
    setShowExerciseForm(false); // Don't show the form, just the editor page
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
    setExerciseFormData({ name: "" });
  };

  const cancelExerciseEditing = () => {
    setEditingExercises(false);
    setCurrentWorkoutId(null);
    setExercises([]);
    setShowExerciseForm(false);
    setExerciseFormData({ name: "" });
  };


  const addExercise = () => {
    if (!exerciseFormData.name.trim()) return;
    
    // Create exercise with empty sets array - sets will be added during workout
    const newExercise = {
      id: Date.now(),
      name: exerciseFormData.name.trim(),
      setsArray: [] // Sets will be added during workout session
    };
    setExercises((prev) => [...prev, newExercise]);
    setExerciseFormData({ name: "" });
    setShowExerciseForm(false);
  };

  const deleteExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
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
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="unified-exercise-card">
                    <div className="exercise-header-row">
                      <h3 className="exercise-name-header">{exercise.name}</h3>
                      <button
                        className="delete-exercise-btn"
                        onClick={() => deleteExercise(exercise.id)}
                        aria-label="Delete exercise"
                        title="Delete exercise"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="exercise-info-text">Sets can be added during workout session</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-exercises">No exercises added yet. Click "Add Exercise" to get started.</p>
            )}
          </div>

          {showExerciseForm && (
            <div className="modal-overlay">
              <div className="modal exercise-modal">
                <h3>Add Exercise</h3>
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={exerciseFormData.name}
                  onChange={(e) => setExerciseFormData({ name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addExercise()}
                  autoFocus
                />
                <div className="modal-actions">
                  <button onClick={addExercise}>Add</button>
                  <button onClick={() => setShowExerciseForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
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
        </div>
      )}
    </div>
  );
}
