import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Styles/WorkoutDetails.css";

export default function Workouts() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem("workouts");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [pausedWorkout, setPausedWorkout] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const timerIntervalRef = useRef(null);

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

  // Load workout and sync workouts on mount
  useEffect(() => {
    // Sync workouts from localStorage
    const stored = localStorage.getItem("workouts");
    if (stored) {
      const parsed = JSON.parse(stored);
      setWorkouts(parsed);
      
      // Check for paused workout session
      const savedSession = localStorage.getItem("activeWorkoutSession");
      if (savedSession && !selectedWorkout) {
        try {
          const session = JSON.parse(savedSession);
          // Check if session is recent (within 24 hours)
          const hoursSincePause = (Date.now() - session.timestamp) / (1000 * 60 * 60);
          if (hoursSincePause < 24) {
            setPausedWorkout(session);
          } else {
            localStorage.removeItem("activeWorkoutSession");
          }
        } catch (e) {
          console.error("Error loading saved session:", e);
        }
      }
      
      // Check if workout should be auto-started from URL
      const startWorkoutId = searchParams.get("start");
      if (startWorkoutId && !selectedWorkout && !pausedWorkout) {
        const workout = parsed.find((w) => w.id === parseInt(startWorkoutId));
        if (workout) {
          startWorkout(workout);
          // Clear URL parameter after starting
          navigate("/workouts", { replace: true });
        }
      } else {
        // Check if workout should be auto-started from localStorage
        const saved = localStorage.getItem("selectedWorkout");
        if (saved && !selectedWorkout && !pausedWorkout) {
          const workout = JSON.parse(saved);
          const latestWorkout = parsed.find((w) => w.id === workout.id) || workout;
          startWorkout(latestWorkout);
          localStorage.removeItem("selectedWorkout");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

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

  // Add a new exercise during workout
  const addExercise = () => {
    if (!newExerciseName.trim()) return;
    const newExercise = {
      id: Date.now(),
      name: newExerciseName.trim(),
      setsArray: []
    };
    setExercises((prev) => [...prev, newExercise]);
    setNewExerciseName("");
    setShowExerciseForm(false);
  };

  // Delete an exercise during workout
  const deleteExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

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
    
    // Get latest workouts from localStorage
    const latestWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    
    // Update workout with progress data (keep original plan structure, update exercises with progress)
    const updatedWorkouts = latestWorkouts.map((w) => {
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
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
    
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
      localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
    }
    
    // Start the workout
    startWorkout(workout);
  };

  if (!selectedWorkout) {
    const allWorkoutDates = getAllWorkoutDates();
    return (
      <div className="workout-detail-container">
        <div className="workout-header-with-calendar">
          {workouts.length > 0 && (
            <div className="workouts-calendar-compact-wrapper">
              {renderMonthlyCalendar(allWorkoutDates)}
            </div>
          )}
          <div className="header-content-wrapper">
            <div className="header-content">
              <h2>Select a Workout to Start</h2>
              <p style={{ marginBottom: "2rem", fontSize: "0.9rem", opacity: 0.8 }}>
                Choose a workout plan below to begin your session.
              </p>
            </div>
            {/* Paused Workout Resume Button - Under text, right side of calendar */}
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
            <div className="add-exercise-form">
              <input
                type="text"
                className="exercise-name-input"
                placeholder="Enter exercise name"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addExercise();
                  } else if (e.key === 'Escape') {
                    setShowExerciseForm(false);
                    setNewExerciseName("");
                  }
                }}
                autoFocus
              />
              <div className="add-exercise-form-actions">
                <button className="confirm-exercise-btn" onClick={addExercise}>
                  Add
                </button>
                <button
                  className="cancel-exercise-btn"
                  onClick={() => {
                    setShowExerciseForm(false);
                    setNewExerciseName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-card-header">
                <h3>{exercise.name}</h3>
                <button
                  className="delete-exercise-btn-workout"
                  onClick={() => deleteExercise(exercise.id)}
                  aria-label="Delete exercise"
                  title="Delete exercise"
                >
                  ✕
                </button>
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
                      <th>Weight (lbs)</th>
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
                              placeholder="Weight"
                              min="0"
                              step="0.5"
                              value={set.weight}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'weight', e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              className={`complete-set-btn ${set.completed ? 'checked' : ''}`}
                              onClick={() => toggleSetCompletion(exercise.id, set.id)}
                              aria-label={`Mark set ${set.setNumber} as ${set.completed ? 'incomplete' : 'complete'}`}
                            >
                              {set.completed ? '✓' : ''}
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
                        <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                          No sets yet. Click "Add Set" above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="no-exercises">No exercises in this workout.</p>
        )}
      </div>

      <div className="workout-actions">
        <button className="finish-workout-btn" onClick={finishWorkout}>
          Finish Workout & Save Progress
        </button>
      </div>
    </div>
  );
}
