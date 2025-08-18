import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";  // ✅ Keep this import
import Exercises from "./pages/Exercises";
import CreatePlan from "./pages/CreatePlan";
import WorkoutDetails from "./pages/WorkoutDetails";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="navbar">
      <div className="header"><Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
            Fit4Life
          </Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/exercises">Exercises</Link></li>
        <li><Link to="/workouts">Workouts</Link></li>
        <li><Link to="/create-plan">CreatePlan</Link></li>
      </ul>
      </div>
    </nav>

      <Routes>
       <Route path="/" element={<Home />} />  
       <Route path="Exercises" element={<Exercises />} />  
       <Route path="/create-plan" element={<CreatePlan />} />
       <Route path="/workout/:id" element={<WorkoutDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
