import { useState } from "react";
import { AvatarScene } from "./AvatarScene";
import { AVATARS } from "./avatars";
import { PERSONALITIES } from "./personalities";
import "./App.css";

export function AvatarPicker({ onPicked, initialUrl, initialPersonality }) {
  const [selected, setSelected] = useState(initialUrl || AVATARS[0].url);
  const [personality, setPersonality] = useState(initialPersonality || "shy");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    await onPicked(selected, personality);
  }

  return (
    <div className="app">
      <header className="header"><h1>Customize your Fryzo</h1></header>

      <div className="stage">
        <AvatarScene url={selected} />
      </div>

      <div className="picker-bar">
        <div className="picker-section">
          <span className="picker-label">Character</span>
          <div className="picker-choices">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                className={`choice ${selected === a.url ? "active" : ""}`}
                onClick={() => setSelected(a.url)}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="picker-section">
          <span className="picker-label">Personality</span>
          <div className="picker-choices">
            {Object.entries(PERSONALITIES).map(([key, p]) => (
              <button
                key={key}
                className={`choice ${personality === key ? "active" : ""}`}
                onClick={() => setPersonality(key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button className="confirm" onClick={confirm} disabled={saving}>
          {saving ? "Saving…" : "Choose this one"}
        </button>
      </div>
    </div>
  );
}