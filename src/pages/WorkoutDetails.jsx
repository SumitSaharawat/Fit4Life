import { useState } from "react";
import "../Styles/WorkoutDetails.css";

export default function WorkoutDetails() {
  const [exercises, setExercises] = useState([]);
  const [showExerciseForm, setShowExerciseForm] = useState(true);
  const [exerciseName, setExerciseName] = useState("");
  const [showSetForm, setShowSetForm] = useState(false);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(null);
  const [setFormData, setSetFormData] = useState({
    sets: "",
    reps: "",
    weight: "",
    type: "",
  });

  // Add new exercise
  const addExercise = () => {
    if (!exerciseName.trim()) return;
    setExercises([...exercises, { name: exerciseName.trim(), sets: [] }]);
    setExerciseName("");
    setShowExerciseForm(false);
    setCurrentExerciseIdx(exercises.length); // index of newly added exercise
  };

  // Add set to current exercise
  const addSet = () => {
    if (currentExerciseIdx === null) return;
    const updatedExercises = [...exercises];
    updatedExercises[currentExerciseIdx].sets.push({ ...setFormData, id: Date.now() });
    setExercises(updatedExercises);
    setSetFormData({ sets: "", reps: "", weight: "", type: "" });
    setShowSetForm(false);
  };

  // Delete set
  const deleteSet = (setId) => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExerciseIdx].sets = updatedExercises[currentExerciseIdx].sets.filter(
      (s) => s.id !== setId
    );
    setExercises(updatedExercises);
  };

  return (
    <div className="workout-detail-container">
      <h2 className="workout-title">Add Exercise</h2>
      {showExerciseForm ? (
        <div className="modal1">
          <input
            name="exerciseName"
            type="text"
            placeholder="Exercise Name"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
          />
          <div className="modal-actions1">
            <button onClick={addExercise}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <h3>{exercises[currentExerciseIdx]?.name}</h3>
          <div className="exercise-list">
            {exercises[currentExerciseIdx]?.sets.length > 0 && (
              <table className="exercise-table">
                <thead>
                  <tr>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Weight (lbs)</th>
                    <th>Type</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises[currentExerciseIdx].sets.map((set) => (
                    <tr key={set.id}>
                      <td>{set.sets}</td>
                      <td>{set.reps}</td>
                      <td>{set.weight}</td>
                      <td>{set.type}</td>
                      <td>
                        <button
                          className="delete-btn"
                          aria-label="Delete Set"
                          title="Delete Set"
                          onClick={() => deleteSet(set.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button className="plus-btn" onClick={() => setShowSetForm(true)}>+</button>
          {/* Add Exercise Button */}
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button
              style={{
                background: "orange",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer"
              }}
              onClick={() => {
                setShowExerciseForm(true);
                setCurrentExerciseIdx(null);
              }}
            >
              Add Another Exercise
            </button>
          </div>
          {showSetForm && (
            <div className="modal-overlay1">
              <div className="modal1">
                <h3>Add Set</h3>
                <input
                  name="sets"
                  type="number"
                  placeholder="Sets"
                  value={setFormData.sets}
                  onChange={(e) => setSetFormData({ ...setFormData, sets: e.target.value })}
                />
                <input
                  name="reps"
                  type="number"
                  placeholder="Reps"
                  value={setFormData.reps}
                  onChange={(e) => setSetFormData({ ...setFormData, reps: e.target.value })}
                />
                <input
                  name="weight"
                  type="number"
                  placeholder="Weight in lbs"
                  value={setFormData.weight}
                  onChange={(e) => setSetFormData({ ...setFormData, weight: e.target.value })}
                />
                <select
                  name="type"
                  value={setFormData.type}
                  onChange={(e) => setSetFormData({ ...setFormData, type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Barbell">Barbell</option>
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="Machine">Machine</option>
                  <option value="Bodyweight">Bodyweight</option>
                </select>
                <div className="modal-actions1">
                  <button onClick={addSet}>Save</button>
                  <button onClick={() => setShowSetForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}