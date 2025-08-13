import { useState } from "react";
import "../Styles/WorkoutDetails.css";

export default function WorkoutDetails() {
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
    type: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addExercise = () => {
    setExercises([...exercises, formData]);
    setFormData({ name: "", sets: "", reps: "", weight: "", type: "" });
    setShowForm(false);
  };

  return (
    <div className="workout-detail-container">
      <h2 className="workout-title">Add Exercises</h2>

      <div className="exercise-list">
        {exercises.map((ex, index) => (
          <div key={index} className="exercise-card">
            <h4>
              {ex.name} - {ex.sets} sets x {ex.reps} reps @ { ex.weight} lbs ({ex.type})
            </h4>
          </div>
        ))}
      </div>

      {/* Floating Plus Button */}
      <button className="plus-btn" onClick={() => setShowForm(true)}>+</button>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay1">
          <div className="modal1">
            <h3>Add Exercise</h3>
            <input
              name="name"
              type="text"
              placeholder="Exercise Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              name="sets"
              type="number"
              placeholder="Sets"
              value={formData.sets}
              onChange={handleChange}
            />
            <input
              name="reps"
              type="number"
              placeholder="Reps"
              value={formData.reps}
              onChange={handleChange}
            />
            <input
              name="weight"
              type="number"
              placeholder="weight in lbs"
              value={formData.weight}
              onChange={handleChange}
            />
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="Barbell">Barbell</option>
              <option value="Dumbbell">Dumbbell</option>
              <option value="Machine">Machine</option>
              <option value="Bodyweight">Bodyweight</option>
            </select>
            <div className="modal-actions1">
              <button onClick={addExercise}>Save</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}