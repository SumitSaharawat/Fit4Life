import ExerciseCard from "../components/ExerciseCard";
import "../Styles/Exercises.css";
import pushupImg from "/Users/sumitsaharawat/Desktop/fit4life/public/mainpage.jpg";

export default function Exercises() {
  const exercises = [
    {
      name: "Push-Up",
      bodyPart: "Chest",
      image: pushupImg,
    },
    {
      name: "Squat",
      bodyPart: "Legs",
      image: "https://via.placeholder.com/220x150?text=Squat",
    },
    {
      name: "Bench Press",
      bodyPart: "Chest",
      image: "https://via.placeholder.com/220x150?text=Bench+Press",
    },
    {
      name: "Deadlift",
      bodyPart: "Back",
      image: "https://via.placeholder.com/220x150?text=Deadlift",
    },
  ];

  return (
    <div className="exercises-page">
      <h1>Exercises</h1>
      <div className="exercise-grid">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            name={ex.name}
            image={ex.image}
            bodyPart={ex.bodyPart}
          />
        ))}
      </div>
    </div>
  );
}

