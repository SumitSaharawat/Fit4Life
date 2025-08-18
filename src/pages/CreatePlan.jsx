import React, { useRef, useState } from "react";
import "../Styles/CreatePlan.css";
import { useNavigate } from "react-router-dom";

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
  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const navigate = useNavigate();

  // stable picker across renders
  const pickImageRef = useRef(makeImagePicker(IMAGE_POOL));

  const handleCardClick = (workout) => {
    if (editingWorkoutId) return;
    localStorage.setItem("selectedWorkout", JSON.stringify(workout));
    navigate(`/workout/${workout.id}`);
  };

  const addWorkoutCard = () => {
    if (!newWorkoutName.trim()) return;
    const newWorkout = {
      id: Date.now(),
      name: newWorkoutName.trim(),
      exercises: [],
      image: pickImageRef.current(), // ✅ assign random image here
    };
    setWorkouts((prev) => [...prev, newWorkout]);
    setNewWorkoutName("");
    setShowModal(false);
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

  return (
    <div className="create-plan">
      <h2>Create Your Workout Plan</h2>

      <div className="card-container">
        {workouts.map((workout) => (
        <div
          key={workout.id}
          className="workout-card"
          onClick={() => handleCardClick(workout)}
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

                {/* Actions at top-right of the card */}
                <div className="card-actions">
                  <button
                    className="edit-btn"
                    aria-label="Edit workout name"
                    title="Edit name"
                    onClick={(e) => startEditing(e, workout)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.8" fill="currentColor"/>
                      <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                    </svg>
                  </button>

                  <button
                    className="delete-btn"
                    aria-label="Delete workout"
                    title="Delete workout"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetch(`${API}/api/workouts/${workout.id}`, { method: "DELETE" })
                        .then(() => setWorkouts(prev => prev.filter(w => w.id !== workout.id)))
                        .catch(console.error);
                    }}
                  >
                    ✕
                  </button>
                </div>
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
            />
            <div className="modal-actions">
              <button onClick={addWorkoutCard}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
