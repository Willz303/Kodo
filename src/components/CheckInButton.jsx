import { useState } from "react";
import { supabase } from "../services/supabaseClient";

const USER_EMAIL = "Miloabara@gmail.com";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
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
    boxShadow:
      status === "success"
        ? "0 0 0 8px rgba(34, 197, 94, 0.25)"
        : "0 0 0 8px rgba(59, 130, 246, 0.25)",
    backgroundColor:
      status === "success"
        ? "#22c55e"
        : status === "loading"
        ? "#93c5fd"
        : "#3b82f6",
    transition: "background-color 0.4s ease, box-shadow 0.4s ease, transform 0.1s ease",
    transform: status === "loading" ? "scale(0.97)" : "scale(1)",
    outline: "none",
  }),
  errorText: {
    color: "#ef4444",
    fontSize: "0.85rem",
    maxWidth: "260px",
    textAlign: "center",
  },
  subtitleText: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    textAlign: "center",
  },
};

function getButtonLabel(status) {
  if (status === "loading") return "Updating…";
  if (status === "success") return "✓ Safe";
  return "I'm Safe";
}

export default function CheckInButton({ onCheckIn }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckIn = async () => {
    if (status === "loading" || status === "success") return;

    setStatus("loading");
    setErrorMsg("");

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("kodo_members")
      .update({ last_check_in: now })
      .eq("email", USER_EMAIL);

    if (error) {
      setStatus("error");
      setErrorMsg("Failed to update check-in. Please try again.");
      return;
    }

    setStatus("success");
    if (onCheckIn) onCheckIn(now);

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  };

  return (
    <div style={styles.wrapper}>
      <button
        style={styles.button(status)}
        onClick={handleCheckIn}
        disabled={status === "loading" || status === "success"}
        aria-label="Check in to confirm you are safe"
      >
        {getButtonLabel(status)}
      </button>

      <p style={styles.subtitleText}>
        Tap to confirm you're safe. Required every 72 hours.
      </p>

      {status === "error" && (
        <p style={styles.errorText} role="alert">
          ⚠ {errorMsg}
        </p>
      )}
    </div>
  );
}