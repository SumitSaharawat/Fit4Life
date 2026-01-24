import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import CreatePlan from "./pages/CreatePlan";
import WorkoutDetails from "./pages/WorkoutDetails";
import Workouts from "./pages/Workouts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, logout } = useAuth();

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
            <li><Link to="/workouts">Workouts</Link></li>
            <li><Link to="/create-plan">CreatePlan</Link></li>
          </ul>
        )}
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="user-info" title={user.email}>{user.email}</span>
              <button type="button" className="logout-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-plan" element={<CreatePlan />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workout/:id" element={<WorkoutDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
