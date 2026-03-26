import { useState, useEffect } from "react";
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
    gap: "16px",
  },
  heading: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtext: {
    margin: "2px 0 0",
    fontSize: "0.78rem",
    color: colors.textSecond,
  },
  divider: {
    height: "1px",
    backgroundColor: colors.border,
    border: "none",
    margin: "2px 0",
  },
  sectionLabel: {
    fontSize: "0.68rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: colors.textMuted,
    margin: "0 0 10px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: colors.textSecond,
    marginBottom: "5px",
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
  methodRow: {
    display: "flex",
    gap: "8px",
  },
  methodBtn: (active) => ({
    flex: 1,
    padding: "9px",
    borderRadius: "8px",
    border: `1.5px solid ${active ? colors.primary : colors.border}`,
    backgroundColor: active ? `rgba(58,138,74,0.12)` : "transparent",
    color: active ? colors.primary : colors.textSecond,
    fontWeight: "600",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  saveButton: (disabled) => ({
    width: "100%",
    padding: "11px",
    borderRadius: "9px",
    border: "none",
    backgroundColor: disabled ? colors.borderLight : colors.primary,
    color: disabled ? colors.textMuted : "#ffffff",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s",
  }),
  successText: {
    color: colors.success,
    fontSize: "0.82rem",
    margin: 0,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: "0.82rem",
    margin: 0,
    textAlign: "center",
  },
  loadingText: {
    color: colors.textSecond,
    fontSize: "0.82rem",
    margin: 0,
  },
  emailBadge: {
    backgroundColor: colors.bg,
    borderRadius: "7px",
    padding: "8px 12px",
    fontSize: "0.82rem",
    color: colors.textSecond,
    fontFamily: "monospace",
    border: `1px solid ${colors.border}`,
  },
  intervalRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  intervalInput: {
    width: "80px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.textPrimary,
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    textAlign: "center",
  },
  intervalLabel: {
    fontSize: "0.85rem",
    color: colors.textSecond,
  },
  infoBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "0.78rem",
    color: colors.textSecond,
    lineHeight: "1.6",
    border: `1px solid ${colors.border}`,
  },
};

export default function Profile() {
  const { user } = useAuth();

  const [fetchStatus, setFetchStatus] = useState("loading");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ecName, setEcName] = useState("");
  const [ecEmail, setEcEmail] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [ecMethod, setEcMethod] = useState("email");
  const [intervalHours, setIntervalHours] = useState(72);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [passwordMessage, setPasswordMessage] = useState("");

  const fetchProfile = async () => {
    if (!user?.email) return;
    setFetchStatus("loading");

    const { data, error } = await supabase
      .from("kodo_members")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (error) {
      setFetchStatus("error");
      return;
    }

    if (data) {
      setFullName(data.full_name || "");
      setPhoneNumber(data.phone_number || "");
      setEcName(data.emergency_contact_name || "");
      setEcEmail(data.emergency_contact_email || "");
      setEcPhone(data.emergency_contact_phone || "");
      setEcMethod(data.emergency_contact_method || "email");
      setIntervalHours(data.check_in_interval_hours || 72);
    }
    setFetchStatus("loaded");
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.email]);

  const handleSave = async () => {
    const hours = parseInt(intervalHours);
    setSaveStatus("saving");

    const { error } = await supabase
      .from("kodo_members")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        emergency_contact_name: ecName.trim(),
        emergency_contact_email: ecEmail.trim(),
        emergency_contact_phone: ecPhone.trim(),
        emergency_contact_method: ecMethod,
        check_in_interval_hours: hours,
      }, { onConflict: 'email' });

    if (error) {
      setSaveStatus("error");
      setSaveMessage("Could not save profile.");
    } else {
      setSaveStatus("success");
      setSaveMessage("Profile saved.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Passwords do not match.");
      return;
    }
    setPasswordStatus("saving");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus("error");
      setPasswordMessage(error.message);
    } else {
      setPasswordStatus("success");
      setPasswordMessage("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const isSaving = saveStatus === "saving";

  return (
    <div style={s.card}>
      <div>
        <p style={s.heading}>👤 Your Profile</p>
        <p style={s.subtext}>Keep your details up to date.</p>
      </div>

      <div>
        <span style={s.label}>Logged in as</span>
        <div style={s.emailBadge}>{user?.email}</div>
      </div>

      <hr style={s.divider} />

      {fetchStatus === "loading" && <p style={s.loadingText}>Loading profile…</p>}
      {fetchStatus === "error" && <p style={s.errorText}>⚠ Could not load profile.</p>}

      {fetchStatus === "loaded" && (
        <>
          <p style={s.sectionLabel}>Personal Details</p>
          <div style={s.fieldGroup}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            
            <label style={s.label}>Phone</label>
            <input style={s.input} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>

          <hr style={s.divider} />

          <p style={s.sectionLabel}>⏱ Interval (Hours)</p>
          <div style={s.intervalRow}>
            <input style={s.intervalInput} type="number" value={intervalHours} onChange={(e) => setIntervalHours(e.target.value)} />
          </div>

          <hr style={s.divider} />

          <p style={s.sectionLabel}>🚨 Emergency Contact</p>
          <div style={s.fieldGroup}>
            <input style={s.input} placeholder="Contact Name" value={ecName} onChange={(e) => setEcName(e.target.value)} />
            <div style={s.methodRow}>
              <button style={s.methodBtn(ecMethod === "email")} onClick={() => setEcMethod("email")}>Email</button>
              <button style={s.methodBtn(ecMethod === "phone")} onClick={() => setEcMethod("phone")}>Phone</button>
            </div>
            {ecMethod === "email" ? 
              <input style={s.input} placeholder="Email" value={ecEmail} onChange={(e) => setEcEmail(e.target.value)} /> :
              <input style={s.input} placeholder="Phone" value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} />
            }
          </div>

          <button style={s.saveButton(isSaving)} onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Profile"}
          </button>
          
          {saveStatus === "success" && <p style={s.successText}>{saveMessage}</p>}
        </>
      )}
    </div>
  );
}