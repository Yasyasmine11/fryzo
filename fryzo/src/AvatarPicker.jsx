import { useState } from "react";
import { AvatarScene } from "./AvatarScene";
import { AVATARS } from "./avatars";
import "./App.css";

export function AvatarPicker({ onPicked, initialUrl }) {
  const [selected, setSelected] = useState(initialUrl || AVATARS[0].url);
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    await onPicked(selected);
  }

  return (
    <div className="app">
      <header className="header"><h1>Choose your Fryzo</h1></header>

      <div className="stage">
        <AvatarScene url={selected} />
      </div>

      <div className="picker-bar">
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
        <button className="confirm" onClick={confirm} disabled={saving}>
          {saving ? "Saving…" : "Choose this one"}
        </button>
      </div>
    </div>
  );
}