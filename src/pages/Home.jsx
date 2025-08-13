import "../Styles/Home.css";
import { Link } from "react-router-dom";


export default function Home() {
  return (
    <div className="home">
      <section className="hero-combined">
        <section className="hero">
          <h1>Welcome to Fit4Life </h1>
          <p>Your ultimate fitness companion – explore exercises, track workouts, and create custom plans.</p>
        </section>

        <section className="features">
          <Link to="/exercises" className="feature-card">
            <h3> Exercises </h3>
            <p>Find exercises for all body parts, categorized by equipment.</p>
          </Link>

          <Link to="/workouts" className="feature-card">
            <h3> Workouts </h3>
            <p>Find the pre-build workout plan to save time and provide better results</p>
          </Link>

          <Link to="/create-plan" className="feature-card">
            <h3> Create Plans </h3>
            <p>Build your own workout plans at your own comfort.</p>
          </Link>
        </section>
      </section>
    </div>
  );
}
