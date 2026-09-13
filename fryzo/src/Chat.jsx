import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { AvatarScene } from "./AvatarScene";
import { AvatarPicker } from "./AvatarPicker";
import { buildSystemPrompt } from "./personalities";
import "./App.css";

// Lecture robuste de la réponse (JSON, JSON entre ```, ou texte brut)
function parseReply(raw) {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const obj = JSON.parse(match ? match[0] : cleaned);
    return { reply: obj.reply ?? raw, emotion: obj.emotion ?? "neutral" };
  } catch {
    return { reply: raw, emotion: "neutral" };
  }
}

function Chat({ session }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [personality, setPersonality] = useState("shy");
  const [status, setStatus] = useState("loading"); // loading | picking | ready

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emotion, setEmotion] = useState({ name: "neutral", key: 0 });
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadBot() {
      const { data } = await supabase
        .from("bots")
        .select("avatar, personality")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data?.avatar) {
        setAvatarUrl(data.avatar);
        setPersonality(data.personality || "shy");
        setStatus("ready");
      } else {
        setStatus("picking");
      }
    }
    loadBot();
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handlePicked(url, pers) {
    await supabase.from("bots").upsert({
      user_id: session.user.id,
      avatar: url,
      personality: pers,
      updated_at: new Date().toISOString(),
    });
    setAvatarUrl(url);
    setPersonality(pers);
    setStatus("ready");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: buildSystemPrompt(personality) },
              ...newMessages,
            ],
            temperature: 0.8,
            max_tokens: 300,
          }),
        }
      );

      if (!res.ok) {
        const detail = await res.text();
        console.error("🔴 Groq error body:", detail);
        throw new Error(detail || `API error (${res.status})`);
      }

      const data = await res.json();
      const raw = data.choices[0].message.content;
      const { reply, emotion: emo } = parseReply(raw);

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setEmotion({ name: emo, key: Date.now() });
    } catch (err) {
      console.error(err);
      setError(err.message || "Oops, Fryzo couldn't reply.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  if (status === "loading") {
    return <div className="app"><div className="empty" style={{ margin: "auto" }}>Loading…</div></div>;
  }

  if (status === "picking") {
    return (
      <AvatarPicker
        onPicked={handlePicked}
        initialUrl={avatarUrl}
        initialPersonality={personality}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Fryzo</h1>
        <span className="user-email">{session.user.email}</span>
        <button className="change-avatar" onClick={() => setStatus("picking")}>
          Customize
        </button>
        <button className="logout" onClick={logout}>Log out</button>
      </header>

      <div className="stage">
        <AvatarScene url={avatarUrl} emotion={emotion} />

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
          ))}
          {loading && <div className="bubble assistant typing">Fryzo is thinking…</div>}
          {error && <div className="error">{error}</div>}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="input-bar">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message to Fryzo…"
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

export default Chat;