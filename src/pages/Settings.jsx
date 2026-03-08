import React from "react";
import SettingsContent from "../components/SettingsContent";
import "../Styles/Settings.css";

export default function Settings() {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">Change units and preferences used across the app.</p>
      </div>
      <SettingsContent />
    </div>
  );
}
