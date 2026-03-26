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
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px 80px",
      boxSizing: "border-box",
      transition: "background-color 0.3s ease",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: "480px",
      marginBottom: "40px",
    },
    logo: { fontSize: "2rem", fontWeight: "800", color: colors.textPrimary, margin: 0 },
    logoAccent: { color: colors.primary },
    topBarRight: { display: "flex", gap: "8px", alignItems: "center" },
    btn: {
      padding: "6px 12px",
      borderRadius: "7px",
      border: `1.5px solid ${colors.border}`,
      backgroundColor: colors.surface,
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
      margin: "0 0 6px",
      textAlign: "center"
    },
    loading: {
      minHeight: "100vh",
      backgroundColor: colors.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: colors.textSecond,
    },
  };

  if (authLoading) return <div style={s.loading}>Loading Kodo…</div>;
  if (!user) return <Auth colors={colors} toggleDark={() => setDark(!dark)} dark={dark} />;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.logo}>Ko<span style={s.logoAccent}>do</span></h1>
        </div>
        <div style={s.topBarRight}>
          <button style={s.btn} onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button style={s.btn} onClick={signOut}>Sign Out</button>
        </div>
      </div>

      <main style={s.main}>
        <section style={{ width: "100%" }}>
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