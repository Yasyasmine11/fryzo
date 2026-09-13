import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { AvatarScene } from "./AvatarScene";
import { AvatarPicker } from "./AvatarPicker";
import "./App.css";

const SYSTEM_PROMPT =
  "You are Fryzo, a friendly and fun virtual companion. " +
  "You chat with the user to entertain them and keep them company. " +
  "Always reply in English, in a natural, warm and playful way. " +
  "Keep your answers short: 1 to 3 sentences maximum.";

function Chat({ session }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | picking | ready

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // Charge le bot de l'utilisateur au démarrage
  useEffect(() => {
    async function loadBot() {
      const { data } = await supabase
        .from("bots")
        .select("avatar")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data?.avatar) {
        setAvatarUrl(data.avatar);
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

  async function handlePicked(url) {
    await supabase.from("bots").upsert({
      user_id: session.user.id,
      avatar: url,
      updated_at: new Date().toISOString(),
    });
    setAvatarUrl(url);
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
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...newMessages],
            temperature: 0.8,
            max_tokens: 300,
          }),
        }
      );

      if (!res.ok) throw new Error(`API error (${res.status})`);

      const data = await res.json();
      const reply = data.choices[0].message.content;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setError("Oops, Fryzo couldn't reply. Check your API key and connection.");
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
    return <AvatarPicker onPicked={handlePicked} initialUrl={avatarUrl} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Fryzo</h1>
        <span className="user-email">{session.user.email}</span>
        <button className="change-avatar" onClick={() => setStatus("picking")}>
          Change avatar
        </button>
        <button className="logout" onClick={logout}>Log out</button>
      </header>

      <div className="stage">
        <AvatarScene url={avatarUrl} />

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