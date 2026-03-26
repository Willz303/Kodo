import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./components/Auth";
import CheckInButton from "./components/CheckInButton";
import CountdownTimer from "./components/CountdownTimer";
import Profile from "./components/Profile";
import { getColors } from "./theme";

function Dashboard() {
  const { user, authLoading, signOut } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [dark, setDark] = useState(false);
  const colors = getColors(dark);

  const s = {
    page: {
      minHeight: "100vh",
      backgroundColor: colors.bg,
      color: colors.textPrimary,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px 80px",
      boxSizing: "border-box",
      transition: "background-color 0.3s ease, color 0.3s ease",
      overflowY: "auto", // Ensure scrolling is enabled
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
      color: colors.textPrimary,
      margin: 0,
    },
    logoAccent: { color: colors.primary },
    tagline: {
      fontSize: "0.8rem",
      color: colors.textSecond,
      margin: "3px 0 0",
    },
    topBarRight: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    toggleBtn: {
      padding: "6px 12px",
      borderRadius: "7px",
      border: `1.5px solid ${colors.border}`,
      backgroundColor: colors.surface,
      color: colors.textSecond,
      fontSize: "0.78rem",
      fontWeight: "600",
      cursor: "pointer",
    },
    signOutBtn: {
      padding: "6px 14px",
      borderRadius: "7px",
      border: `1.5px solid ${colors.border}`,
      backgroundColor: "transparent",
      color: colors.textSecond,
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
      color: colors.textMuted,
      textAlign: "center",
      margin: "0 0 6px",
    },
    footer: {
      marginTop: "60px",
      textAlign: "center",
      color: colors.textMuted,
      fontSize: "0.72rem",
    },
    loading: {
      minHeight: "100vh",
      backgroundColor: colors.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: colors.textSecond,
      fontFamily: "'Inter', system-ui, sans-serif",
    },
  };

  // 1. Guard Clause: If still checking session
  if (authLoading) {
    return <div style={s.loading}>Loading Kodo…</div>;
  }

  // 2. Guard Clause: If not logged in
  if (!user) {
    return <Auth colors={colors} toggleDark={() => setDark(!dark)} dark={dark} />;
  }

  // 3. Main Dashboard
  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.logo}>Ko<span style={s.logoAccent}>do</span></h1>
          <p style={s.tagline}>Your quiet safety net.</p>
        </div>
        <div style={s.topBarRight}>
          <button style={s.toggleBtn} onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button style={s.signOutBtn} onClick={signOut}>Sign Out</button>
        </div>
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