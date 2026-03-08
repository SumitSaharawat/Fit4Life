import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loadWorkouts, saveWorkouts } from "../lib/workoutsDb";
import { getExerciseByIdFromApi, getApiExerciseImageUrl, getApiImageUrlFromPath } from "../lib/exerciseDbApi";
import { useSettings } from "../contexts/SettingsContext";
import ExercisePicker from "../components/ExercisePicker";
import "../Styles/WorkoutDetails.css";

export default function Workouts() {
  const { user, loading } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [howToPopup, setHowToPopup] = useState(null);
  const [howToLoading, setHowToLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [pausedWorkout, setPausedWorkout] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const timerIntervalRef = useRef(null);
  const { weightUnit, restTimerSeconds } = useSettings();
  const weightLabel = weightUnit === "kg" ? "Weight (kg)" : "Weight (lbs)";
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerRemaining, setRestTimerRemaining] = useState(0);
  const restTimerIntervalRef = useRef(null);
  const howToImageRef = useRef(null);
  const howToImageIntervalRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [supersetPickerForId, setSupersetPickerForId] = useState(null);

  const playRestDoneSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  };

  // Rest timer countdown (effect runs only when rest timer is started)
  useEffect(() => {
    if (!restTimerActive) {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
        restTimerIntervalRef.current = null;
      }
      return;
    }
    restTimerIntervalRef.current = setInterval(() => {
      setRestTimerRemaining((prev) => {
        if (prev <= 1) {
          if (restTimerIntervalRef.current) {
            clearInterval(restTimerIntervalRef.current);
            restTimerIntervalRef.current = null;
          }
          playRestDoneSound();
          setRestTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
        restTimerIntervalRef.current = null;
      }
    };
  }, [restTimerActive]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Save current workout session to localStorage whenever it changes
  useEffect(() => {
    if (selectedWorkout && exercises.length >= 0) {
      const sessionData = {
        workout: selectedWorkout,
        exercises: exercises,
        timer: timer,
        isTimerRunning: isTimerRunning,
        timestamp: Date.now()
      };
      localStorage.setItem("activeWorkoutSession", JSON.stringify(sessionData));
    }
  }, [selectedWorkout, exercises, timer, isTimerRunning]);

  // Load workouts from Firestore (when logged in) or localStorage; handle paused/auto-start on mount
  useEffect(() => {
    if (loading) return;
    loadWorkouts(user?.uid ?? null).then((parsed) => {
      setWorkouts(parsed);

      // Check for paused workout session
      const savedSession = localStorage.getItem("activeWorkoutSession");
      if (savedSession && !selectedWorkout) {
        try {
          const session = JSON.parse(savedSession);
          const hoursSincePause = (Date.now() - session.timestamp) / (1000 * 60 * 60);
          if (hoursSincePause < 24) {
            setPausedWorkout(session);
            return;
          }
          localStorage.removeItem("activeWorkoutSession");
        } catch (e) {
          console.error("Error loading saved session:", e);
        }
      }

      // Auto-start from URL ?start=id
      const startWorkoutId = searchParams.get("start");
      if (startWorkoutId && !selectedWorkout && !pausedWorkout) {
        const workout = parsed.find((w) => w.id === parseInt(startWorkoutId));
        if (workout) {
          startWorkout(workout);
          navigate("/workouts", { replace: true });
          return;
        }
      }

      // Auto-start from localStorage (e.g. from Create Plan "Start")
      const saved = localStorage.getItem("selectedWorkout");
      if (saved && !selectedWorkout && !pausedWorkout) {
        const workout = JSON.parse(saved);
        const latestWorkout = parsed.find((w) => w.id === workout.id) || workout;
        startWorkout(latestWorkout);
        localStorage.removeItem("selectedWorkout");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.uid, searchParams, navigate]);

  const startWorkout = (workout) => {
    setSelectedWorkout(workout);
    setTimer(0);
    setIsTimerRunning(true);
    
    // Initialize exercises with tracking fields (no targetReps)
    const initialExercises = (workout.exercises || []).map((ex) => {
      if (ex.setsArray && Array.isArray(ex.setsArray) && ex.setsArray.length > 0) {
        return {
          ...ex,
          setsArray: ex.setsArray.map(set => ({
            id: set.id || Date.now(),
            setNumber: set.setNumber || 1,
            actualReps: set.actualReps || "",
            weight: set.weight || "",
            completed: set.completed || false
          }))
        };
      } else {
        // Exercise with no sets - start with empty array (user will add sets during workout)
        return {
          ...ex,
          setsArray: []
        };
      }
    });
    setExercises(initialExercises);
  };

  const updateSetValue = (exerciseId, setId, field, value) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              setsArray: ex.setsArray.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  };

  const toggleSetCompletion = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              setsArray: ex.setsArray.map((set) =>
                set.id === setId ? { ...set, completed: !set.completed } : set
              ),
            }
          : ex
      )
    );
  };

  // Add a new set to an exercise
  const addSetToExercise = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.setsArray[ex.setsArray.length - 1];
          const newSet = {
            id: Date.now(),
            setNumber: ex.setsArray.length + 1,
            actualReps: "",
            weight: "",
            completed: false
          };
          return {
            ...ex,
            setsArray: [...ex.setsArray, newSet]
          };
        }
        return ex;
      })
    );
  };

  // Delete a set from an exercise
  const deleteSetFromExercise = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const filteredSets = ex.setsArray.filter(set => set.id !== setId);
          // Renumber sets after deletion
          const renumberedSets = filteredSets.map((set, index) => ({
            ...set,
            setNumber: index + 1
          }));
          return {
            ...ex,
            setsArray: renumberedSets
          };
        }
        return ex;
      })
    );
  };

  // Add a new exercise during workout (from library or custom via ExercisePicker)
  const onPickExercise = (exercise) => {
    setExercises((prev) => [...prev, { ...exercise, setsArray: exercise.setsArray || [] }]);
    setShowExerciseForm(false);
  };

  // Delete an exercise during workout
  const deleteExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  // Override rest time for this exercise (current workout only; empty = use default)
  const setExerciseRest = (exerciseId, value) => {
    if (value === "" || value == null) {
      setExercises((prev) =>
        prev.map((ex) => (ex.id === exerciseId ? { ...ex, restTimerSeconds: undefined } : ex))
      );
      return;
    }
    const num = parseInt(String(value), 10);
    if (Number.isNaN(num)) return;
    const sec = Math.min(600, Math.max(0, num));
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, restTimerSeconds: sec } : ex))
    );
  };

  const getSupersetPartner = (exs, exercise) => {
    if (!exercise?.supersetGroupId) return null;
    return exs.find((e) => e.id !== exercise.id && e.supersetGroupId === exercise.supersetGroupId) || null;
  };

  const pairSupersetWith = (currentId, partnerId) => {
    const currentIdx = exercises.findIndex((e) => e.id === currentId);
    const partnerIdx = exercises.findIndex((e) => e.id === partnerId);
    if (currentIdx === -1 || partnerIdx === -1) return;
    setOpenMenuId(null);
    setSupersetPickerForId(null);
    const groupId = "ss-" + Date.now();
    setExercises((prev) => {
      const withGroup = prev.map((ex) =>
        ex.id === currentId || ex.id === partnerId ? { ...ex, supersetGroupId: groupId } : ex
      );
      const partnerEx = withGroup.find((e) => e.id === partnerId);
      const withoutPartner = withGroup.filter((e) => e.id !== partnerId);
      const insertAt = withoutPartner.findIndex((e) => e.id === currentId) + 1;
      return [...withoutPartner.slice(0, insertAt), partnerEx, ...withoutPartner.slice(insertAt)];
    });
  };

  const removeSupersetWorkout = (exerciseId) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    const partner = getSupersetPartner(exercises, ex);
    if (!ex?.supersetGroupId && !partner) return;
    const idToClear = ex?.supersetGroupId || partner?.supersetGroupId;
    setExercises((prev) =>
      prev.map((e) => (e.supersetGroupId === idToClear ? { ...e, supersetGroupId: undefined } : e))
    );
    setOpenMenuId(null);
    setSupersetPickerForId(null);
  };

  // Open "How to do it" popup (library: fetch from API; custom: use instruction)
  const openHowTo = async (exercise) => {
    if (exercise.libraryId) {
      setHowToLoading(true);
      setHowToPopup({ title: exercise.name, steps: [], imageUrls: [] });
      try {
        const apiEx = await getExerciseByIdFromApi(exercise.libraryId);
        if (apiEx) {
          const steps = (apiEx.instructions || []).filter(Boolean);
          const imageUrls = (apiEx.images || [])
            .map((path) => getApiImageUrlFromPath(path))
            .filter(Boolean);
          setHowToPopup({ title: apiEx.name, steps, imageUrls });
        } else {
          setHowToPopup({ title: exercise.name, steps: ["No instructions found."], imageUrls: [] });
        }
      } catch {
        setHowToPopup({ title: exercise.name, steps: ["Could not load instructions."], imageUrls: [] });
      } finally {
        setHowToLoading(false);
      }
    } else if (exercise.instruction) {
      const steps = exercise.instruction.split("\n").map((s) => s.trim()).filter(Boolean);
      setHowToPopup({ title: exercise.name, steps: steps.length ? steps : ["No instructions."], imageUrls: [] });
    }
  };

  // Cycle "How to do it" popup images (gif-style) when multiple images
  useEffect(() => {
    if (!howToPopup?.imageUrls || howToPopup.imageUrls.length <= 1 || !howToImageRef.current) return;
    const urls = howToPopup.imageUrls;
    let idx = 0;
    howToImageRef.current.src = urls[0];
    howToImageIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % urls.length;
      if (howToImageRef.current) howToImageRef.current.src = urls[idx];
    }, 1500);
    return () => {
      if (howToImageIntervalRef.current) {
        clearInterval(howToImageIntervalRef.current);
        howToImageIntervalRef.current = null;
      }
    };
  }, [howToPopup?.title, howToPopup?.imageUrls?.length]);

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimer(0);
  };

  // Pause and leave workout (save state, allow navigation)
  const pauseAndLeaveWorkout = () => {
    setIsTimerRunning(false);
    // State is already saved via useEffect
    setSelectedWorkout(null);
    // Keep exercises and timer in pausedWorkout state
    setPausedWorkout({
      workout: selectedWorkout,
      exercises: exercises,
      timer: timer,
      isTimerRunning: false,
      timestamp: Date.now()
    });
  };

  // Resume paused workout
  const resumeWorkout = () => {
    if (pausedWorkout) {
      setSelectedWorkout(pausedWorkout.workout);
      setExercises(pausedWorkout.exercises);
      setTimer(pausedWorkout.timer);
      setIsTimerRunning(false); // Start paused, user can resume manually
      setPausedWorkout(null);
    }
  };

  // Discard paused workout
  const discardPausedWorkout = () => {
    if (window.confirm("Are you sure you want to discard the paused workout? All progress will be lost.")) {
      setPausedWorkout(null);
      localStorage.removeItem("activeWorkoutSession");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveWorkoutProgress = () => {
    if (!selectedWorkout) return;

    // Update workout with progress (use current state; persist via saveWorkouts)
    const updatedWorkouts = workouts.map((w) => {
      if (w.id === selectedWorkout.id) {
        // Save exercises with progress (no targetReps)
        const updatedExercises = exercises.map((ex) => {
          return {
            ...ex,
            setsArray: ex.setsArray.map(set => ({
              id: set.id,
              setNumber: set.setNumber,
              actualReps: set.actualReps || "",
              weight: set.weight || "",
              completed: set.completed || false
            }))
          };
        });
        
        return {
          ...w,
          exercises: updatedExercises,
          lastCompleted: new Date().toISOString(),
          totalTime: timer
        };
      }
      return w;
    });

    setWorkouts(updatedWorkouts);
    saveWorkouts(updatedWorkouts, user?.uid ?? null);

    // Clear paused workout if it exists
    setPausedWorkout(null);
    localStorage.removeItem("activeWorkoutSession");
    
    // Return to workouts list
    setSelectedWorkout(null);
    setExercises([]);
    setTimer(0);
    setIsTimerRunning(false);
  };

  const finishWorkout = () => {
    if (window.confirm("Finish workout and save progress?")) {
      saveWorkoutProgress();
    }
  };

  // Get all workout dates from all workouts for calendar display
  const getAllWorkoutDates = () => {
    const allDates = new Set();
    workouts.forEach(workout => {
      if (workout.workoutDates && Array.isArray(workout.workoutDates)) {
        workout.workoutDates.forEach(date => allDates.add(date));
      }
    });
    return Array.from(allDates);
  };

  // Get workouts done on a specific date
  const getWorkoutsForDate = (dateStr) => {
    return workouts.filter(workout => 
      workout.workoutDates && workout.workoutDates.includes(dateStr)
    );
  };

  // Past workout entries for the scrollable history (date desc)
  const getPastWorkoutEntries = () => {
    const allDates = getAllWorkoutDates();
    if (allDates.length === 0) return [];
    const sorted = [...allDates].sort((a, b) => b.localeCompare(a));
    return sorted.map((dateStr) => {
      const list = getWorkoutsForDate(dateStr);
      const dateFormatted = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const workoutsWithDuration = list.map((w) => {
        let mins = null;
        if (w.lastCompleted && String(w.lastCompleted).split("T")[0] === dateStr && typeof w.totalTime === "number") {
          mins = Math.round(w.totalTime / 60);
        }
        const exerciseNames = (w.exercises || []).map((e) => e.name).filter(Boolean);
        return { id: w.id, name: w.name, mins, exerciseNames };
      });
      return { dateStr, dateFormatted, workouts: workoutsWithDuration };
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Go to current month
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  // Get month name
  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
  };

  // Render monthly calendar
  const renderMonthlyCalendar = (workoutDates) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get days from previous month to fill the first week
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const calendarDays = [];
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const dateStr = date.toISOString().split('T')[0];
      calendarDays.push({
        day: prevMonthLastDay - i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWorkoutDay: workoutDates.includes(dateStr)
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      calendarDays.push({
        day,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWorkoutDay: workoutDates.includes(dateStr)
      });
    }
    
    // Add next month's leading days to complete the last week
    const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      const dateStr = date.toISOString().split('T')[0];
      calendarDays.push({
        day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWorkoutDay: workoutDates.includes(dateStr)
      });
    }
    
    // Weekday headers
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    return (
      <div className="monthly-calendar-compact">
        <div className="calendar-header-compact">
          <button className="calendar-nav-btn-small" onClick={goToPreviousMonth} title="Previous month">
            ‹
          </button>
          <span className="calendar-month-year-compact">
            {getMonthName(currentMonth).substring(0, 3)} {currentYear}
          </span>
          <button className="calendar-nav-btn-small" onClick={goToNextMonth} title="Next month">
            ›
          </button>
          <button className="calendar-today-btn-small" onClick={goToCurrentMonth} title="Today">
            •
          </button>
        </div>
        
        <div className="calendar-weekdays-compact">
          {weekdays.map(day => (
            <div key={day} className="weekday-header-compact">{day.substring(0, 1)}</div>
          ))}
        </div>
        
        <div className="calendar-days-grid-compact">
          {calendarDays.map((dayInfo, index) => {
            const className = `calendar-day-compact 
              ${dayInfo.isCurrentMonth ? 'current-month' : 'other-month'} 
              ${dayInfo.isWorkoutDay ? 'workout-day' : ''} 
              ${dayInfo.isToday ? 'today' : ''}`;
            
            const workoutsOnDate = dayInfo.isWorkoutDay ? getWorkoutsForDate(dayInfo.dateStr) : [];
            const workoutNames = workoutsOnDate.map(w => w.name).join(', ');
            
            return (
              <div
                key={`${dayInfo.dateStr}-${index}`}
                className={className.trim()}
                title={dayInfo.isWorkoutDay ? `${workoutNames} on ${dayInfo.dateStr}` : dayInfo.dateStr}
                onMouseEnter={() => dayInfo.isWorkoutDay && setHoveredDate(dayInfo.dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => dayInfo.isWorkoutDay && setSelectedDate(dayInfo.dateStr)}
                style={{ cursor: dayInfo.isWorkoutDay ? 'pointer' : 'default' }}
              >
                {dayInfo.day}
                {dayInfo.isWorkoutDay && hoveredDate === dayInfo.dateStr && (
                  <div className="calendar-hover-tooltip">
                    {workoutNames}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleStartWorkout = (workout) => {
    // Record workout date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const workoutDates = workout.workoutDates || [];
    if (!workoutDates.includes(today)) {
      const updatedWorkouts = workouts.map((w) =>
        w.id === workout.id
          ? { ...w, workoutDates: [...workoutDates, today] }
          : w
      );
      setWorkouts(updatedWorkouts);
      saveWorkouts(updatedWorkouts, user?.uid ?? null);
    }

    // Start the workout
    startWorkout(workout);
  };

  if (!selectedWorkout) {
    const allWorkoutDates = getAllWorkoutDates();
    const pastEntries = getPastWorkoutEntries();
    return (
      <div className="workout-detail-container">
        <div className="workout-header-with-calendar">
          <div className="header-content-wrapper">
            <div className="header-content">
              <h2>Select a Workout to Start</h2>
              <p style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
                Choose a workout plan below to begin your session.
              </p>
            </div>
            {pausedWorkout && (
              <div className="paused-workout-indicator-side">
                <div className="paused-workout-info-side">
                  <span className="paused-workout-name-side">{pausedWorkout.workout.name}</span>
                  <span className="paused-workout-time-side">{formatTime(pausedWorkout.timer)}</span>
                </div>
                <div className="paused-workout-actions-side">
                  <button className="resume-workout-btn-side" onClick={resumeWorkout} title="Resume workout">
                    ▶ Resume
                  </button>
                  <button className="discard-workout-btn-side" onClick={discardPausedWorkout} title="Discard workout">
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="calendar-past-row">
            <div className="workouts-calendar-compact-wrapper">
              {renderMonthlyCalendar(allWorkoutDates)}
            </div>
            <section className="past-workouts-section">
              <h3 className="past-workouts-title">Past Workouts</h3>
              <div className="past-workouts-scroll">
                {pastEntries.length > 0 ? (
                  pastEntries.map(({ dateStr, dateFormatted, workouts: list }) => (
                    <div key={dateStr} className="past-workouts-entry">
                      <span className="past-workouts-date">{dateFormatted}</span>
                      <div className="past-workouts-workouts">
                        {list.map((w) => (
                          <div key={`${dateStr}-${w.id}`} className="past-workouts-workout">
                            <span className="past-workouts-workout-name">
                              {w.name}{w.mins != null ? ` (${w.mins} min)` : ""}
                            </span>
                            {w.exerciseNames && w.exerciseNames.length > 0 && (
                              <span className="past-workouts-exercises"> — {w.exerciseNames.join(", ")}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="past-workouts-empty">No past workouts yet. Start one to see it here.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Date Workout Details Popup */}
        {selectedDate && (
          <div className="date-workout-popup-overlay" onClick={() => setSelectedDate(null)}>
            <div className="date-workout-popup" onClick={(e) => e.stopPropagation()}>
              <div className="date-workout-popup-header">
                <h3>Workout Details - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <button className="close-popup-btn" onClick={() => setSelectedDate(null)}>
                  ✕
                </button>
              </div>
              <div className="date-workout-popup-content">
                {getWorkoutsForDate(selectedDate).length > 0 ? (
                  getWorkoutsForDate(selectedDate).map((workout) => (
                    <div key={workout.id} className="date-workout-item">
                      <h4>{workout.name}</h4>
                      {workout.exercises && workout.exercises.length > 0 && (
                        <div className="date-workout-exercises">
                          <p><strong>Exercises:</strong> {workout.exercises.length}</p>
                          <ul>
                            {workout.exercises.map((ex) => (
                              <li key={ex.id}>{ex.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No workouts found for this date.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Workouts List */}
        {workouts.length > 0 ? (
          <div className="workouts-list-container">
            {workouts.map((workout) => (
              <div key={workout.id} className="workout-list-card">
                <div
                  className="workout-list-card-bg"
                  style={{
                    backgroundImage: workout.image ? `url(${workout.image})` : undefined,
                  }}
                >
                  <div className="workout-list-card-content">
                    <h3>{workout.name}</h3>
                    {workout.exercises && workout.exercises.length > 0 && (
                      <span className="workout-exercise-count">
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      className="start-workout-btn-list"
                      onClick={() => handleStartWorkout(workout)}
                      aria-label={`Start ${workout.name}`}
                      title={`Start ${workout.name}`}
                    >
                      ▶ Start Workout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-workouts-message">
            <p>No workouts available. Go to Create Plan page to create a workout.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="workout-detail-container">
      <div className="workout-header">
        <button className="back-to-workouts-btn" onClick={pauseAndLeaveWorkout} title="Back to workouts">
          ← Back
        </button>
        <h2 className="workout-title">{selectedWorkout.name}</h2>
        <div className="timer-display">
          <span className="timer-icon">⏱</span>
          <span className="timer-text">{formatTime(timer)}</span>
          {isTimerRunning ? (
            <button className="timer-control-btn" onClick={pauseTimer} title="Pause timer">
              ⏸
            </button>
          ) : (
            <button className="timer-control-btn" onClick={resumeTimer} title="Resume timer">
              ▶
            </button>
          )}
          <button className="timer-control-btn stop-btn" onClick={stopTimer} title="Stop timer">
            ⏹
          </button>
        </div>
      </div>

      {restTimerActive && (
        <div className="workout-rest-bar">
          <span className="workout-rest-bar-label">Rest</span>
          <span className="workout-rest-bar-count">{restTimerRemaining}s</span>
          <button
            type="button"
            className="workout-rest-bar-skip"
            onClick={() => {
              setRestTimerActive(false);
              setRestTimerRemaining(0);
            }}
          >
            Skip
          </button>
        </div>
      )}

      <div className="exercises-list">
        <div className="add-exercise-section">
          {!showExerciseForm ? (
            <button
              className="add-exercise-btn-workout"
              onClick={() => setShowExerciseForm(true)}
              title="Add new exercise"
            >
              + Add Exercise
            </button>
          ) : (
            <ExercisePicker
              onSelect={onPickExercise}
              onCancel={() => setShowExerciseForm(false)}
            />
          )}
        </div>

        {exercises.length > 0 ? (
          (() => {
            const workoutItems = [];
            for (let i = 0; i < exercises.length; i++) {
              const ex = exercises[i];
              const next = exercises[i + 1];
              if (ex.supersetGroupId && next?.supersetGroupId === ex.supersetGroupId) {
                workoutItems.push({ type: "superset", exercises: [ex, next] });
                i++;
              } else {
                workoutItems.push({ type: "single", exercise: ex });
              }
            }
            return workoutItems.map((item) =>
              item.type === "superset" ? (
                <div key={item.exercises.map((e) => e.id).join("-")} className="workout-superset-group">
                  <div className="workout-superset-label">Superset</div>
                  {item.exercises.map((exercise) => {
                    const workoutPartner = getSupersetPartner(exercises, exercise);
                    const workoutMenuOpen = openMenuId === exercise.id;
                    return (
                    <div key={exercise.id} className="exercise-card workout-superset-card">
                      <div className="exercise-card-header">
                        <h3>{exercise.name}</h3>
                        <div className="exercise-card-header-actions">
                          {(exercise.libraryId || exercise.instruction) && (
                            <button
                              type="button"
                              className="how-to-do-it-btn-workout"
                              onClick={() => openHowTo(exercise)}
                              title="How to do it"
                            >
                              How to do it
                            </button>
                          )}
                          <div className="workout-card-menu-wrap">
                            <button
                              type="button"
                              className="workout-card-menu-btn"
                              onClick={() => setOpenMenuId(workoutMenuOpen ? null : exercise.id)}
                              aria-label="Options"
                              title="Timer & Superset"
                            >
                              ⋮
                            </button>
                            {workoutMenuOpen && (
                              <>
                                <div className="workout-card-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                                <div className="workout-card-menu-dropdown">
                                  <div className="workout-card-menu-item workout-card-menu-timer">
                                    <label>Rest (sec)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="600"
                                      step="5"
                                      placeholder={`Default (${restTimerSeconds})`}
                                      value={exercise.restTimerSeconds ?? ""}
                                      onChange={(e) => setExerciseRest(exercise.id, e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <button type="button" className="workout-card-menu-item" onClick={() => setSupersetPickerForId(exercise.id)}>
                                    Superset
                                  </button>
                                  {workoutPartner && (
                                    <button type="button" className="workout-card-menu-item" onClick={() => removeSupersetWorkout(exercise.id)}>
                                      Remove superset
                                    </button>
                                  )}
                                  <button type="button" className="workout-card-menu-item workout-card-menu-delete" onClick={() => { deleteExercise(exercise.id); setOpenMenuId(null); }}>
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="exercise-rest-row-workout">
                        <label htmlFor={`rest-${exercise.id}`} className="exercise-rest-label-workout">
                          Rest between sets (sec)
                        </label>
                        <input
                          id={`rest-${exercise.id}`}
                          type="number"
                          min="0"
                          max="600"
                          step="5"
                          placeholder={`Default (${restTimerSeconds})`}
                          value={exercise.restTimerSeconds ?? ""}
                          onChange={(e) => setExerciseRest(exercise.id, e.target.value)}
                          className="exercise-rest-input-workout"
                          title="Leave empty for universal default from Settings"
                        />
                        <span className="exercise-rest-hint-workout">empty = default</span>
                      </div>
                      <div className="exercise-table-container">
                        <div className="exercise-table-header-actions">
                          <button
                            className="add-set-btn-workout"
                            onClick={() => addSetToExercise(exercise.id)}
                            title="Add set to this exercise"
                          >
                            + Add Set
                          </button>
                        </div>
                        <table className="exercise-table">
                          <thead>
                            <tr>
                              <th>Set</th>
                              <th>Reps</th>
                              <th>{weightLabel}</th>
                              <th>Complete</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exercise.setsArray && exercise.setsArray.length > 0 ? (
                              exercise.setsArray.map((set) => (
                                <tr key={set.id} className={set.completed ? "completed-row" : ""}>
                                  <td>{set.setNumber}</td>
                                  <td>
                                    <input
                                      type="number"
                                      className="set-input-small"
                                      placeholder="Reps"
                                      min="0"
                                      value={set.actualReps}
                                      onChange={(e) => updateSetValue(exercise.id, set.id, "actualReps", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="set-input-small"
                                      placeholder={weightUnit === "kg" ? "kg" : "lbs"}
                                      min="0"
                                      step="0.5"
                                      value={set.weight}
                                      onChange={(e) => updateSetValue(exercise.id, set.id, "weight", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <button
                                      className={`complete-set-btn ${set.completed ? "checked" : ""}`}
                                      onClick={() => {
                                        const wasCompleted = set.completed;
                                        toggleSetCompletion(exercise.id, set.id);
                                        const idx = exercises.findIndex((e) => e.id === exercise.id);
                                        const nextEx = exercises[idx + 1];
                                        const isSupersetPartner = nextEx?.supersetGroupId === exercise.supersetGroupId;
                                        if (!wasCompleted && !isSupersetPartner) {
                                          const restSec = exercise.restTimerSeconds != null ? exercise.restTimerSeconds : restTimerSeconds;
                                          if (restSec > 0) {
                                            setRestTimerRemaining(restSec);
                                            setRestTimerActive(true);
                                          }
                                        }
                                      }}
                                      aria-label={`Mark set ${set.setNumber} as ${set.completed ? "incomplete" : "complete"}`}
                                    >
                                      {set.completed ? "✓" : ""}
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      className="delete-set-btn-workout"
                                      onClick={() => deleteSetFromExercise(exercise.id, set.id)}
                                      aria-label="Delete set"
                                      title="Delete set"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                  No sets yet. Click "Add Set" above.
                                </td>
                              </tr>
                            )}
                          </tbody>
                </table>
              </div>
            </div>
                  );
                  })}
                </div>
              ) : (
                (() => {
                  const exercise = item.exercise;
                  const workoutPartner = getSupersetPartner(exercises, exercise);
                  const workoutMenuOpen = openMenuId === exercise.id;
                  return (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-card-header">
                <h3>{exercise.name}</h3>
                <div className="exercise-card-header-actions">
                  {(exercise.libraryId || exercise.instruction) && (
                    <button
                      type="button"
                      className="how-to-do-it-btn-workout"
                      onClick={() => openHowTo(exercise)}
                      title="How to do it"
                    >
                      How to do it
                    </button>
                  )}
                  <div className="workout-card-menu-wrap">
                    <button
                      type="button"
                      className="workout-card-menu-btn"
                      onClick={() => setOpenMenuId(workoutMenuOpen ? null : exercise.id)}
                      aria-label="Options"
                      title="Timer & Superset"
                    >
                      ⋮
                    </button>
                    {workoutMenuOpen && (
                      <>
                        <div className="workout-card-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                        <div className="workout-card-menu-dropdown">
                          <div className="workout-card-menu-item workout-card-menu-timer">
                            <label>Rest (sec)</label>
                            <input
                              type="number"
                              min="0"
                              max="600"
                              step="5"
                              placeholder={`Default (${restTimerSeconds})`}
                              value={exercise.restTimerSeconds ?? ""}
                              onChange={(e) => setExerciseRest(exercise.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <button type="button" className="workout-card-menu-item" onClick={() => setSupersetPickerForId(exercise.id)}>
                            Superset
                          </button>
                          {workoutPartner && (
                            <button type="button" className="workout-card-menu-item" onClick={() => removeSupersetWorkout(exercise.id)}>
                              Remove superset
                            </button>
                          )}
                          <button type="button" className="workout-card-menu-item workout-card-menu-delete" onClick={() => { deleteExercise(exercise.id); setOpenMenuId(null); }}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="exercise-rest-row-workout">
                <label htmlFor={`rest-${exercise.id}`} className="exercise-rest-label-workout">
                  Rest between sets (sec)
                </label>
                <input
                  id={`rest-${exercise.id}`}
                  type="number"
                  min="0"
                  max="600"
                  step="5"
                  placeholder={`Default (${restTimerSeconds})`}
                  value={exercise.restTimerSeconds ?? ""}
                  onChange={(e) => setExerciseRest(exercise.id, e.target.value)}
                  className="exercise-rest-input-workout"
                  title="Leave empty for universal default from Settings"
                />
                <span className="exercise-rest-hint-workout">empty = default</span>
              </div>
              <div className="exercise-table-container">
                <div className="exercise-table-header-actions">
                  <button
                    className="add-set-btn-workout"
                    onClick={() => addSetToExercise(exercise.id)}
                    title="Add set to this exercise"
                  >
                    + Add Set
                  </button>
                </div>
                <table className="exercise-table">
                  <thead>
                    <tr>
                      <th>Set</th>
                      <th>Reps</th>
                      <th>{weightLabel}</th>
                      <th>Complete</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.setsArray && exercise.setsArray.length > 0 ? (
                      exercise.setsArray.map((set) => (
                        <tr key={set.id} className={set.completed ? 'completed-row' : ''}>
                          <td>{set.setNumber}</td>
                          <td>
                            <input
                              type="number"
                              className="set-input-small"
                              placeholder="Reps"
                              min="0"
                              value={set.actualReps}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'actualReps', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="set-input-small"
                              placeholder={weightUnit === "kg" ? "kg" : "lbs"}
                              min="0"
                              step="0.5"
                              value={set.weight}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'weight', e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              className={`complete-set-btn ${set.completed ? "checked" : ""}`}
                              onClick={() => {
                                const wasCompleted = set.completed;
                                toggleSetCompletion(exercise.id, set.id);
                                const idx = exercises.findIndex((e) => e.id === exercise.id);
                                const nextEx = exercises[idx + 1];
                                const isSupersetPartner = nextEx?.supersetGroupId === exercise.supersetGroupId;
                                if (!wasCompleted && !isSupersetPartner) {
                                  const restSec = exercise.restTimerSeconds != null ? exercise.restTimerSeconds : restTimerSeconds;
                                  if (restSec > 0) {
                                    setRestTimerRemaining(restSec);
                                    setRestTimerActive(true);
                                  }
                                }
                              }}
                              aria-label={`Mark set ${set.setNumber} as ${set.completed ? "incomplete" : "complete"}`}
                            >
                              {set.completed ? "✓" : ""}
                            </button>
                          </td>
                          <td>
                            <button
                              className="delete-set-btn-workout"
                              onClick={() => deleteSetFromExercise(exercise.id, set.id)}
                              aria-label="Delete set"
                              title="Delete set"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                          No sets yet. Click "Add Set" above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
                  );
                })()
              )
            );
          })()
        ) : (
          <p className="no-exercises">No exercises in this workout.</p>
        )}
      </div>

      <div className="workout-actions">
        <button className="finish-workout-btn" onClick={finishWorkout}>
          Finish Workout & Save Progress
        </button>
      </div>

      {howToPopup && (
        <div className="workout-how-to-overlay" onClick={() => setHowToPopup(null)}>
          <div className="workout-how-to-popup" onClick={(e) => e.stopPropagation()}>
            <div className="workout-how-to-header">
              <h3>{howToPopup.title}</h3>
              <button
                type="button"
                className="workout-how-to-close"
                onClick={() => setHowToPopup(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <h4 className="workout-how-to-subtitle">How to do it</h4>
            {howToLoading ? (
              <p className="workout-how-to-loading">Loading…</p>
            ) : (
              <>
                {howToPopup.imageUrls && howToPopup.imageUrls.length > 0 && (
                  <div className="workout-how-to-image-wrap">
                    <img
                      ref={howToImageRef}
                      src={howToPopup.imageUrls[0]}
                      alt=""
                      className="workout-how-to-image"
                      loading="eager"
                    />
                  </div>
                )}
                <ol className="workout-how-to-steps">
                  {howToPopup.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </>
            )}
            <div className="workout-how-to-footer">
              <button type="button" className="workout-how-to-close-btn" onClick={() => setHowToPopup(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {supersetPickerForId != null && (
        <div className="workout-how-to-overlay" onClick={() => setSupersetPickerForId(null)}>
          <div className="workout-how-to-popup superset-picker-popup" onClick={(e) => e.stopPropagation()}>
            <div className="workout-how-to-header">
              <h3>Pair with exercise (superset)</h3>
              <button type="button" className="workout-how-to-close" onClick={() => setSupersetPickerForId(null)} aria-label="Close">✕</button>
            </div>
            <p className="workout-how-to-loading" style={{ marginBottom: "1rem", opacity: 0.9 }}>Select an exercise to pair with. They will be done back-to-back with minimal rest.</p>
            <ul className="superset-picker-list-workout">
              {exercises
                .filter((ex) => ex.id !== supersetPickerForId)
                .map((ex) => (
                  <li key={ex.id}>
                    <button type="button" className="superset-picker-item-workout" onClick={() => pairSupersetWith(supersetPickerForId, ex.id)}>
                      {ex.name}
                    </button>
                  </li>
                ))}
            </ul>
            <div className="workout-how-to-footer">
              <button type="button" className="workout-how-to-close-btn" onClick={() => setSupersetPickerForId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
