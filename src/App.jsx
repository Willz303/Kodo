import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./components/Auth";
import CheckInButton from "./components/CheckInButton";
import CountdownTimer from "./components/CountdownTimer";
import Profile from "./components/Profile";
import { colours } from "./theme";

const s = {
  page: {
    minHeight: "100vh",
    backgroundcolour: colours.bg,
    colour: colours.textPrimary,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px 80px",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "480px",
    marginBottom: "40px",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "800",
    letterSpacing: "-1px",
    colour: colours.textPrimary,
    margin: 0,
  },
  logoAccent: { colour: colours.primary },
  tagline: {
    fontSize: "0.8rem",
    colour: colours.textSecond,
    margin: "3px 0 0",
  },
  signOutBtn: {
    padding: "6px 14px",
    borderRadius: "7px",
    border: `1.5px solid ${colours.border}`,
    backgroundcolour: "transparent",
    colour: colours.textSecond,
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    width: "100%",
    maxWidth: "480px",
  },
  sectionLabel: {
    fontSize: "0.66rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "2px",
    colour: colours.textMuted,
    textAlign: "center",
    margin: "0 0 6px",
  },
  footer: {
    marginTop: "60px",
    textAlign: "center",
    colour: colours.textMuted,
    fontSize: "0.72rem",
  },
  loading: {
    minHeight: "100vh",
    backgroundcolour: colours.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    colour: colours.textSecond,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

function Dashboard() {
  const { user, authLoading, signOut } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState(null);

  if (authLoading) return <div style={s.loading}>Loading Kodo…</div>;
  if (!user) return <Auth />;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.logo}>Ko<span style={s.logoAccent}>do</span></h1>
          <p style={s.tagline}>Your quiet safety net.</p>
        </div>
        <button style={s.signOutBtn} onClick={signOut}>Sign Out</button>
      </div>

      <main style={s.main}>
        <section style={{ textAlign: "center", width: "100%" }}>
          <p style={s.sectionLabel}>Your check-in</p>
          <CheckInButton onCheckIn={(ts) => setLastCheckIn(ts)} />
        </section>

        <section style={{ width: "100%" }}>
          <p style={s.sectionLabel}>Time remaining</p>
          <CountdownTimer lastCheckInOverride={lastCheckIn} />
        </section>

        <section style={{ width: "100%" }}>
          <p style={s.sectionLabel}>Settings</p>
          <Profile />
        </section>
      </main>

      <footer style={s.footer}>
        <p>Kodo — designed with care for people living alone.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}