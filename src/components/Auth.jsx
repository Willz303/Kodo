import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { getColors } from "../theme";

const colors = getColors(false);

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: "20px",
    border: `1px solid ${colors.border}`,
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
    color: colors.textPrimary,
    margin: 0,
    letterSpacing: "-1px",
  },
  logoAccent: { color: colors.primary },
  tagline: {
    textAlign: "center",
    fontSize: "0.82rem",
    color: colors.textSecond,
    margin: 0,
    lineHeight: "1.6",
  },
  tabRow: {
    display: "flex",
    backgroundColor: colors.bg,
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
    backgroundColor: active ? colors.primary : "transparent",
    color: active ? "#ffffff" : colors.textSecond,
    transition: "all 0.2s",
  }),
  label: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: colors.textSecond,
    marginBottom: "6px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.textPrimary,
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
    backgroundColor: disabled ? colors.borderLight : colors.primary,
    color: disabled ? colors.textMuted : "#ffffff",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s",
  }),
  forgotLink: {
    background: "none",
    border: "none",
    color: colors.textSecond,
    fontSize: "0.78rem",
    cursor: "pointer",
    textAlign: "right",
    padding: 0,
    textDecoration: "underline",
    alignSelf: "flex-end",
  },
  successText: {
    color: colors.success,
    fontSize: "0.85rem",
    textAlign: "center",
    margin: 0,
    lineHeight: "1.6",
  },
  errorText: {
    color: colors.danger,
    fontSize: "0.85rem",
    textAlign: "center",
    margin: 0,
  },
  backLink: {
    background: "none",
    border: "none",
    color: colors.textSecond,
    fontSize: "0.78rem",
    cursor: "pointer",
    textAlign: "center",
    padding: 0,
    textDecoration: "underline",
  },
};

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const reset = () => { setStatus("idle"); setMessage(""); };

  const handleSubmit = async () => {
    if (mode === "forgot") {
      if (!email) {
        setStatus("error");
        setMessage("Please enter your email address.");
        return;
      }
      setStatus("loading");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173",
      });
      if (error) { setStatus("error"); setMessage(error.message); return; }
      setStatus("success");
      setMessage("Password reset email sent. Check your inbox and click the link.");
      return;
    }

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

        {/* Logo */}
        <div>
          <p style={s.logo}>Ko<span style={s.logoAccent}>do</span></p>
          <p style={s.tagline}>A quiet safety net for people living alone.</p>
        </div>

        {/* Forgot password view */}
        {mode === "forgot" ? (
          <>
            <div style={s.fieldGroup}>
              <div>
                <label style={s.label}>Email address</label>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); reset(); }}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {status === "success" && <p style={s.successText} role="status">✓ {message}</p>}
            {status === "error" && <p style={s.errorText} role="alert">⚠ {message}</p>}

            {status !== "success" && (
              <button style={s.primaryButton(isLoading)} onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Sending…" : "Send Reset Email"}
              </button>
            )}

            <button style={s.backLink} onClick={() => { setMode("login"); reset(); }}>
              ← Back to login
            </button>
          </>
        ) : (
          <>
            {/* Login / Signup toggle */}
            <div style={s.tabRow}>
              <button style={s.tab(mode === "login")} onClick={() => { setMode("login"); reset(); }}>
                Log In
              </button>
              <button style={s.tab(mode === "signup")} onClick={() => { setMode("signup"); reset(); }}>
                Sign Up
              </button>
            </div>

            {/* Fields */}
            <div style={s.fieldGroup}>
              <div>
                <label style={s.label}>Email address</label>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); reset(); }}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label style={s.label}>Password</label>
                <input
                  style={s.input}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); reset(); }}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                  disabled={isLoading}
                />
              </div>
              {mode === "login" && (
                <button style={s.forgotLink} onClick={() => { setMode("forgot"); reset(); }}>
                  Forgot password?
                </button>
              )}
            </div>

            {status === "success" && <p style={s.successText} role="status">✓ {message}</p>}
            {status === "error" && <p style={s.errorText} role="alert">⚠ {message}</p>}

            {status !== "success" && (
              <button
                style={s.primaryButton(isLoading)}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Please wait…" : mode === "signup" ? "Create Account" : "Log In"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}