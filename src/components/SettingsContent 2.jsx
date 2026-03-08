import React from "react";
import { useSettings } from "../contexts/SettingsContext";

export default function SettingsContent() {
  const { setSetting, weightUnit, distanceUnit, restTimerSeconds } = useSettings();

  return (
    <div className="settings-sections">
      <section className="settings-section">
        <h2 className="settings-section-title">Units</h2>
        <div className="settings-group">
          <label className="settings-label">Weight</label>
          <div className="settings-options">
            <label className="settings-radio">
              <input
                type="radio"
                name="weightUnit"
                value="lbs"
                checked={weightUnit === "lbs"}
                onChange={() => setSetting("weightUnit", "lbs")}
              />
              <span>lbs (pounds)</span>
            </label>
            <label className="settings-radio">
              <input
                type="radio"
                name="weightUnit"
                value="kg"
                checked={weightUnit === "kg"}
                onChange={() => setSetting("weightUnit", "kg")}
              />
              <span>kg (kilograms)</span>
            </label>
          </div>
          <p className="settings-hint">Used for weight in workout sets.</p>
        </div>
        <div className="settings-group">
          <label className="settings-label">Distance</label>
          <div className="settings-options">
            <label className="settings-radio">
              <input
                type="radio"
                name="distanceUnit"
                value="miles"
                checked={distanceUnit === "miles"}
                onChange={() => setSetting("distanceUnit", "miles")}
              />
              <span>Miles</span>
            </label>
            <label className="settings-radio">
              <input
                type="radio"
                name="distanceUnit"
                value="km"
                checked={distanceUnit === "km"}
                onChange={() => setSetting("distanceUnit", "km")}
              />
              <span>Kilometers</span>
            </label>
          </div>
          <p className="settings-hint">Used for distance when shown in the app.</p>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">Workout</h2>
        <div className="settings-group">
          <label className="settings-label" htmlFor="restTimer">
            Default rest timer (seconds)
          </label>
          <input
            id="restTimer"
            type="number"
            min={0}
            max={600}
            step={5}
            value={restTimerSeconds}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v) && v >= 0) setSetting("restTimerSeconds", Math.min(600, v));
            }}
            className="settings-input"
          />
          <p className="settings-hint">Default rest between sets (0 = off).</p>
        </div>
      </section>
    </div>
  );
}
