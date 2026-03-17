import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { colours } from "../theme";

const s = {
  page: {
    minHeight: "100vh",
    backgroundcolour: colours.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    colour: colours.textPrimary,
  },
  card: {
    backgroundcolour: colours.surface,
    borderRadius: "20px",
    border: `1px solid ${colours.border}`,
    padding: "36px 32px",
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  logo: {
    textAlign: "center",
    fontSize: "2.2rem",
    fontWeight: "800",
    colour: colours.textPrimary,
    margin: 0,
    letterSpacing: "-1px",
  },
  logoAccent: { colour: colours.primary },
  tagline: {
    textAlign: "center",
    fontSize: "0.82rem",
    colour: colours.textSecond,
    margin: 0,
    lineHeight: "1.6",
  },
  tabRow: {
    display: "flex",
    backgroundcolour: colours.bg,
    borderRadius: "10px",
    padding: "4px",
    gap: "4px",
  },
  tab: (active) => ({
    flex: 1,
    padding: "8px",
    borderRadius: "7px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: "600",
    backgroundcolour: active ? colours.primary : "transparent",
    colour: active ? "#ffffff" : colours.textSecond,
    transition: "all 0.2s",
  }),
  label: {
    fontSize: "0.75rem",
    fontWeight: "600",
    colour: colours.textSecond,
    marginBottom: "6px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${colours.border}`,
    backgroundcolour: colours.bg,
    colour: colours.textPrimary,
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primaryButton: (disabled) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundcolour: disabled ? colours.borderLight : colours.primary,
    colour: disabled ? colours.textMuted : "#ffffff",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-colour 0.2s",
  }),
  successText: {
    colour: colours.success,
    fontSize: "0.85rem",
    textAlign: "center",
    margin: 0,
    lineHeight: "1.6",
  },
  errorText: {
    colour: colours.danger,
    fontSize: "0.85rem",
    textAlign: "center",
    margin: 0,
  },
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const reset = () => { setStatus("idle"); setMessage(""); };

  const handleSubmit = async () => {
    if (!email || !password) {
      setStatus("error");
      setMessage("Please fill in both fields.");
      return;
    }
    setStatus("loading");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setStatus("error"); setMessage(error.message); return; }
      setStatus("success");
      setMessage("Account created! You can now log in.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setStatus("error"); setMessage(error.message); }
  };

  const isLoading = status === "loading";

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div>
          <p style={s.logo}>Ko<span style={s.logoAccent}>do</span></p>
          <p style={s.tagline}>A quiet safety net for people living alone.</p>
        </div>

        <div style={s.tabRow}>
          <button style={s.tab(mode === "login")} onClick={() => { setMode("login"); reset(); }}>Log In</button>
          <button style={s.tab(mode === "signup")} onClick={() => { setMode("signup"); reset(); }}>Sign Up</button>
        </div>

        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); reset(); }}
              placeholder="you@example.com" disabled={isLoading} />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); reset(); }}
              placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
              disabled={isLoading} />
          </div>
        </div>

        {status === "success" && <p style={s.successText} role="status">✓ {message}</p>}
        {status === "error" && <p style={s.errorText} role="alert">⚠ {message}</p>}

        {status !== "success" && (
          <button style={s.primaryButton(isLoading)} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Please wait…" : mode === "signup" ? "Create Account" : "Log In"}
          </button>
        )}
      </div>
    </div>
  );
}