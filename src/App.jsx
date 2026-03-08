import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import SettingsContent from "./components/SettingsContent";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";
import "./Styles/Settings.css";

const CreatePlan = lazy(() => import("./pages/CreatePlan"));
const WorkoutDetails = lazy(() => import("./pages/WorkoutDetails"));
const Workouts = lazy(() => import("./pages/Workouts"));
const Exercises = lazy(() => import("./pages/Exercises"));
const ExerciseDetail = lazy(() => import("./pages/ExerciseDetail"));
const Settings = lazy(() => import("./pages/Settings"));

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, logout } = useAuth();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
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
              <li><Link to="/exercises">Exercises</Link></li>
            </ul>
          )}
          <div className="auth-buttons">
            <button
              type="button"
              className="navbar-settings-btn"
              onClick={() => setShowSettingsModal(true)}
              aria-label="Settings"
              title="Settings"
            >
              <SettingsIcon />
            </button>
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

      {showSettingsModal && (
        <div className="settings-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2 className="settings-modal-title">Settings</h2>
              <button
                type="button"
                className="settings-modal-close"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="settings-modal-body">
              <SettingsContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <main className={`app-content ${isHome ? "app-content--home" : ""}`}>
      <Suspense fallback={<div className="app-loading">Loading…</div>}>
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create-plan" element={<CreatePlan />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workout/:id" element={<WorkoutDetails />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/exercise/:id" element={<ExerciseDetail />} />
              <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Navbar />
          <AppContent />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
