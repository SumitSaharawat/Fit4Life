import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Exercises from "./pages/Exercises";
import CreatePlan from "./pages/CreatePlan";
import WorkoutDetails from "./pages/WorkoutDetails";
import Workouts from "./pages/Workouts";
import "./App.css";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header">
        <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
          Fit4Life
        </Link>
        {!isHomePage && (
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/exercises">Exercises</Link></li>
            <li><Link to="/workouts">Workouts</Link></li>
            <li><Link to="/create-plan">CreatePlan</Link></li>
          </ul>
        )}
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
       <Route path="/" element={<Home />} />  
       <Route path="Exercises" element={<Exercises />} />  
       <Route path="/create-plan" element={<CreatePlan />} />
       <Route path="/workouts" element={<Workouts />} />
       <Route path="/workout/:id" element={<WorkoutDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
