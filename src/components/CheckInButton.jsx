import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { getColors } from "../theme";

const colors = getColors(false);

const s = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  button: (status) => ({
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    border: "none",
    cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "0.5px",
    boxShadow: status === "success"
      ? `0 0 0 10px ${colors.successGlow}`
      : `0 0 0 10px ${colors.primaryGlow}`,
    backgroundColor: status === "success"
      ? colors.success
      : status === "loading"
      ? colors.borderLight
      : colors.primary,
    transition: "background-color 0.4s ease, box-shadow 0.4s ease, transform 0.1s ease",
    transform: status === "loading" ? "scale(0.97)" : "scale(1)",
    outline: "none",
  }),
  subtitle: {
    color: colors.textSecond,
    fontSize: "0.8rem",
    textAlign: "center",
    margin: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: "0.85rem",
    maxWidth: "260px",
    textAlign: "center",
    margin: 0,
  },
};

export default function CheckInButton({ onCheckIn }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckIn = async () => {
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMsg("");

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("kodo_members")
      .update({ last_check_in: now })
      .eq("email", user.email);

    if (error) {
      setStatus("error");
      setErrorMsg("Failed to update check-in. Please try again.");
      return;
    }

    setStatus("success");
    if (onCheckIn) onCheckIn(now);
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div style={s.wrapper}>
      <button
        style={s.button(status)}
        onClick={handleCheckIn}
        disabled={status === "loading" || status === "success"}
        aria-label="Check in to confirm you are safe"
      >
        {status === "loading" ? "Updating…" : status === "success" ? "✓ Safe" : "I'm Safe"}
      </button>
      <p style={s.subtitle}>Tap to confirm you're safe.</p>
      {status === "error" && <p style={s.errorText} role="alert">⚠ {errorMsg}</p>}
    </div>
  );
}