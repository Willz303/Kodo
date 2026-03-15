import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";

const USER_EMAIL = "Miloabara@gmail.com";
const WINDOW_HOURS = 72;
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

const styles = {
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "24px 28px",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },
  label: {
    margin: 0,
    fontSize: "0.78rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#64748b",
  },
  timerDisplay: (isExpired) => ({
    margin: 0,
    fontSize: "2.2rem",
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
    color: isExpired ? "#ef4444" : "#38bdf8",
    lineHeight: 1.2,
  }),
  subtext: (isExpired) => ({
    margin: 0,
    fontSize: "0.82rem",
    color: isExpired ? "#ef4444" : "#64748b",
    fontWeight: isExpired ? "600" : "400",
  }),
  progressBarTrack: {
    width: "100%",
    height: "6px",
    backgroundColor: "#0f172a",
    borderRadius: "999px",
    overflow: "hidden",
    marginTop: "6px",
  },
  progressBarFill: (pct, isExpired) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: isExpired ? "#ef4444" : pct < 25 ? "#f59e0b" : "#38bdf8",
    borderRadius: "999px",
    transition: "width 1s linear, background-color 0.5s ease",
  }),
  loadingText: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    margin: 0,
  },
  errorText: {
    color: "#ef4444",
    fontSize: "0.85rem",
    margin: 0,
  },
};

function formatTimeRemaining(ms) {
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    display: `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`,
    hours,
    minutes,
    seconds,
  };
}

export default function CountdownTimer({ lastCheckInOverride }) {
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const intervalRef = useRef(null);

  // Fetch last_check_in from Supabase on mount
  useEffect(() => {
    const fetchLastCheckIn = async () => {
      setFetchStatus("loading");

      const { data, error } = await supabase
        .from("kodo_members")
        .select("last_check_in")
        .eq("email", USER_EMAIL)
        .single();

      if (error || !data) {
        setFetchStatus("error");
        return;
      }

      setLastCheckIn(data.last_check_in);
      setFetchStatus("loaded");
    };

    fetchLastCheckIn();
  }, []);

  // If parent passes an updated check-in (after button press), use that
  useEffect(() => {
    if (lastCheckInOverride) {
      setLastCheckIn(lastCheckInOverride);
      setFetchStatus("loaded");
    }
  }, [lastCheckInOverride]);

  // Tick countdown every second
  useEffect(() => {
    if (fetchStatus !== "loaded" || !lastCheckIn) return;

    const tick = () => {
      const checkInTime = new Date(lastCheckIn).getTime();
      const deadline = checkInTime + WINDOW_MS;
      const now = Date.now();
      const remaining = deadline - now;
      setTimeRemaining(remaining);
    };

    tick(); // Run immediately
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [lastCheckIn, fetchStatus]);

  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const formatted = timeRemaining !== null ? formatTimeRemaining(timeRemaining) : null;

  // Percentage of window elapsed (inverted for "remaining")
  const percentRemaining =
    timeRemaining !== null && timeRemaining > 0
      ? Math.min(100, (timeRemaining / WINDOW_MS) * 100)
      : 0;

  return (
    <div style={styles.card}>
      <p style={styles.label}>Check-in Window</p>

      {fetchStatus === "loading" && (
        <p style={styles.loadingText}>Loading timer…</p>
      )}

      {fetchStatus === "error" && (
        <p style={styles.errorText}>⚠ Could not load check-in data.</p>
      )}

      {fetchStatus === "loaded" && !lastCheckIn && (
        <p style={styles.loadingText}>No check-in recorded yet. Tap the button above.</p>
      )}

      {fetchStatus === "loaded" && lastCheckIn && (
        <>
          {isExpired ? (
            <>
              <p style={styles.timerDisplay(true)}>TIME EXPIRED</p>
              <p style={styles.subtext(true)}>
                ⚠ Your emergency contact has been notified.
              </p>
            </>
          ) : (
            <>
              <p style={styles.timerDisplay(false)}>
                {formatted ? formatted.display : "Calculating…"}
              </p>
              <p style={styles.subtext(false)}>remaining before alert is triggered</p>
              <div style={styles.progressBarTrack}>
                <div style={styles.progressBarFill(percentRemaining, isExpired)} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}