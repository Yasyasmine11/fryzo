import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setMessage("");

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setMessage(error.message);
    // On success, the auth listener in App switches to the chat automatically.
    setLoading(false);
  }

  return (
    <div className="app">
      <div className="auth-box">
        <h1>Fryzo</h1>
        <p>{isSignUp ? "Create your account" : "Welcome back"}</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait…" : isSignUp ? "Sign up" : "Log in"}
        </button>

        {message && <div className="error">{message}</div>}

        <button className="link" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp
            ? "Already have an account? Log in"
            : "No account yet? Sign up"}
        </button>
      </div>
    </div>
  );
}

export default Auth;