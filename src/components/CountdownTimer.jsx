import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { colours } from "../theme";

const s = {
  card: {
    backgroundcolour: colours.surface,
    borderRadius: "16px",
    border: `1px solid ${colours.border}`,
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
    colour: colours.textMuted,
  },
  timerDisplay: (colour) => ({
    margin: 0,
    fontSize: "2.6rem",
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
    colour,
    lineHeight: 1.2,
    letterSpacing: "-1px",
  }),
  subtext: (colour) => ({
    margin: 0,
    fontSize: "0.8rem",
    colour,
  }),
  progressBarTrack: {
    width: "100%",
    height: "5px",
    backgroundcolour: colours.bg,
    borderRadius: "999px",
    overflow: "hidden",
    marginTop: "4px",
  },
  progressBarFill: (pct, colour) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundcolour: colour,
    borderRadius: "999px",
    transition: "width 1s linear, background-colour 0.5s ease",
  }),
  intervalNote: {
    fontSize: "0.72rem",
    colour: colours.textMuted,
    margin: 0,
  },
  loadingText: { colour: colours.textSecond, fontSize: "0.85rem", margin: 0 },
  errorText: { colour: colours.danger, fontSize: "0.85rem", margin: 0 },
};

function getTimercolour(pct) {
  if (pct <= 0) return colours.timerDanger;
  if (pct < 20) return colours.timerWarn;
  return colours.timerSafe;
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

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
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

    fetch();
  }, [user]);

  useEffect(() => {
    if (lastCheckInOverride) {
      setLastCheckIn(lastCheckInOverride);
      setFetchStatus("loaded");
    }
  }, [lastCheckInOverride]);

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
  const timercolour = getTimercolour(pct);
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
              <p style={s.timerDisplay(colours.timerDanger)}>TIME EXPIRED</p>
              <p style={s.subtext(colours.timerDanger)}>⚠ Your emergency contact has been notified.</p>
            </>
          ) : (
            <>
              <p style={s.timerDisplay(timercolour)}>
                {formatted ?? "Calculating…"}
              </p>
              <p style={s.subtext(colours.textSecond)}>remaining before alert is triggered</p>
              <div style={s.progressBarTrack}>
                <div style={s.progressBarFill(pct, timercolour)} />
              </div>
              <p style={s.intervalNote}>window set to {intervalHours}h — change in profile</p>
            </>
          )}
        </>
      )}
    </div>
  );
}