import { useState } from "react";
import CheckInButton from "./components/CheckInButton";
import CountdownTimer from "./components/CountdownTimer";
import EmergencyContact from "./components/EmergencyContact";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 20px 80px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
    maxWidth: "480px",
  },
  logo: {
    fontSize: "2.4rem",
    fontWeight: "800",
    letterSpacing: "-1px",
    color: "#f8fafc",
    margin: "0 0 6px",
  },
  logoAccent: {
    color: "#3b82f6",
  },
  tagline: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: "0 0 16px",
    lineHeight: "1.6",
  },
  divider: {
    width: "40px",
    height: "3px",
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: "999px",
    margin: "0 auto",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
    width: "100%",
    maxWidth: "480px",
  },
  sectionLabel: {
    fontSize: "0.7rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "#334155",
    textAlign: "center",
    marginBottom: "4px",
  },
  footer: {
    marginTop: "60px",
    textAlign: "center",
    color: "#1e293b",
    fontSize: "0.75rem",
  },
};

export default function App() {
  // When the user checks in, lift the new timestamp up to CountdownTimer
  const [lastCheckIn, setLastCheckIn] = useState(null);

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.logo}>
          Ko<span style={styles.logoAccent}>do</span>
        </h1>
        <p style={styles.tagline}>
          A quiet safety net for people living alone. Check in every 72 hours
          so your emergency contact knows you're okay. No news is good news.
        </p>
        <hr style={styles.divider} />
      </header>

      {/* ── Main Content ── */}
      <main style={styles.main}>

        {/* Check-In Button */}
        <section style={{ textAlign: "center", width: "100%" }}>
          <p style={styles.sectionLabel}>Your daily check-in</p>
          <CheckInButton onCheckIn={(timestamp) => setLastCheckIn(timestamp)} />
        </section>

        {/* Countdown Timer */}
        <section style={{ width: "100%" }}>
          <p style={styles.sectionLabel}>Time remaining</p>
          <CountdownTimer lastCheckInOverride={lastCheckIn} />
        </section>

        {/* Emergency Contact */}
        <section style={{ width: "100%" }}>
          <EmergencyContact />
        </section>

      </main>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <p>Kodo — designed with care for people living alone.</p>
      </footer>

    </div>
  );
}