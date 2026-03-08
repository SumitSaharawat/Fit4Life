import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "fit4life-settings";

const DEFAULTS = {
  weightUnit: "lbs",
  distanceUnit: "miles",
  restTimerSeconds: 60,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      weightUnit: parsed.weightUnit === "kg" ? "kg" : DEFAULTS.weightUnit,
      distanceUnit: parsed.distanceUnit === "km" ? "km" : DEFAULTS.distanceUnit,
      restTimerSeconds:
        typeof parsed.restTimerSeconds === "number" && parsed.restTimerSeconds >= 0
          ? parsed.restTimerSeconds
          : DEFAULTS.restTimerSeconds,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Could not save settings", e);
  }
}

const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setSetting = (key, value) => {
    setSettingsState((prev) => {
      if (!(key in DEFAULTS)) return prev;
      return { ...prev, [key]: value };
    });
  };

  const setSettings = (updates) => {
    setSettingsState((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((key) => {
        if (key in DEFAULTS) next[key] = updates[key];
      });
      return next;
    });
  };

  const value = {
    settings,
    setSetting,
    setSettings,
    weightUnit: settings.weightUnit,
    distanceUnit: settings.distanceUnit,
    restTimerSeconds: settings.restTimerSeconds,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export { DEFAULTS };
