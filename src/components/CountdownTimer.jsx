import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { getColors } from "../theme";

const colors = getColors(false);

const s = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: "16px",
    border: `1px solid ${colors.border}`,
    padding: "24px 28px",
    width: "100%",
    maxWidth: "480px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    textAlign: "center",
  },
  label: {
    margin: 0,
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1.8px",
    color: colors.textMuted,
  },
  timerDisplay: (color) => ({
    margin: 0,
    fontSize: "2.6rem",
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
    color,
    lineHeight: 1.2,
    letterSpacing: "-1px",
  }),
  subtext: (color) => ({
    margin: 0,
    fontSize: "0.8rem",
    color,
  }),
  progressBarTrack: {
    width: "100%",
    height: "5px",
    backgroundColor: colors.bg,
    borderRadius: "999px",
    overflow: "hidden",
    marginTop: "4px",
  },
  progressBarFill: (pct, color) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: color,
    borderRadius: "999px",
    transition: "width 1s linear, background-color 0.5s ease",
  }),
  intervalNote: {
    fontSize: "0.72rem",
    color: colors.textMuted,
    margin: 0,
  },
  loadingText: { color: colors.textSecond, fontSize: "0.85rem", margin: 0 },
  errorText: { color: colors.danger, fontSize: "0.85rem", margin: 0 },
};

function getTimerColor(pct) {
  if (pct <= 0) return colors.timerDanger;
  if (pct < 20) return colors.timerWarn;
  return colors.timerSafe;
}

function formatTime(ms) {
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
}

export default function CountdownTimer({ lastCheckInOverride }) {
  const { user } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [intervalHours, setIntervalHours] = useState(72);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    if (!user) return;
    setFetchStatus("loading");

    const { data, error } = await supabase
      .from("kodo_members")
      .select("last_check_in, check_in_interval_hours")
      .eq("email", user.email)
      .single();

    if (error || !data) { setFetchStatus("error"); return; }

    setLastCheckIn(data.last_check_in);
    setIntervalHours(data.check_in_interval_hours || 72);
    setFetchStatus("loaded");
  };

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [user]);

  // Refetch when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  // If parent passes a fresh check-in timestamp after button press
  useEffect(() => {
    if (lastCheckInOverride) {
      setLastCheckIn(lastCheckInOverride);
      setFetchStatus("loaded");
    }
  }, [lastCheckInOverride]);

  // Tick every second
  useEffect(() => {
    if (fetchStatus !== "loaded" || !lastCheckIn) return;

    const windowMs = intervalHours * 60 * 60 * 1000;

    const tick = () => {
      const deadline = new Date(lastCheckIn).getTime() + windowMs;
      setTimeRemaining(deadline - Date.now());
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [lastCheckIn, fetchStatus, intervalHours]);

  const windowMs = intervalHours * 60 * 60 * 1000;
  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const pct = timeRemaining > 0 ? Math.min(100, (timeRemaining / windowMs) * 100) : 0;
  const timerColor = getTimerColor(pct);
  const formatted = timeRemaining !== null ? formatTime(timeRemaining) : null;

  return (
    <div style={s.card}>
      <p style={s.label}>Check-in Window</p>

      {fetchStatus === "loading" && <p style={s.loadingText}>Loading timer…</p>}
      {fetchStatus === "error" && <p style={s.errorText}>⚠ Could not load check-in data.</p>}
      {fetchStatus === "loaded" && !lastCheckIn && (
        <p style={s.loadingText}>No check-in yet. Tap the button above.</p>
      )}

      {fetchStatus === "loaded" && lastCheckIn && (
        <>
          {isExpired ? (
            <>
              <p style={s.timerDisplay(colors.timerDanger)}>TIME EXPIRED</p>
              <p style={s.subtext(colors.timerDanger)}>
                ⚠ Your emergency contact has been notified.
              </p>
            </>
          ) : (
            <>
              <p style={s.timerDisplay(timerColor)}>
                {formatted ?? "Calculating…"}
              </p>
              <p style={s.subtext(colors.textSecond)}>
                remaining before alert is triggered
              </p>
              <div style={s.progressBarTrack}>
                <div style={s.progressBarFill(pct, timerColor)} />
              </div>
              <p style={s.intervalNote}>
                window set to {intervalHours}h — change in profile
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}