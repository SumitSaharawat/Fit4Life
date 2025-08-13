import "../Styles/ExerciseCard.css";
import { Link } from "react-router-dom";

export default function ExerciseCard({ name, image, bodyPart }) {
  return (
    <Link
      to={`/exercises/${name.toLowerCase().replace(/\s+/g, "-")}`}
      className="exercise-card"
    >
      <img src={image} alt={name} className="exercise-img" />
      <h3>{name}</h3>
      <p>{bodyPart}</p>
    </Link>
  );
}
