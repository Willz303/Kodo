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
    if (!user) return;
    setFetchStatus("loading");

    const { data, error } = await supabase
      .from("kodo_members")
      .select("full_name, phone_number, emergency_contact_name, emergency_contact_email, emergency_contact_phone, emergency_contact_method, check_in_interval_hours")
      .eq("email", user.email)
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") {
        await supabase.from("kodo_members").insert({
          id: user.id,
          email: user.email,
        });
        setFetchStatus("loaded");
        return;
      }
      setFetchStatus("error");
      return;
    }

    setFullName(data.full_name || "");
    setPhoneNumber(data.phone_number || "");
    setEcName(data.emergency_contact_name || "");
    setEcEmail(data.emergency_contact_email || "");
    setEcPhone(data.emergency_contact_phone || "");
    setEcMethod(data.emergency_contact_method || "email");
    setIntervalHours(data.check_in_interval_hours || 72);
    setFetchStatus("loaded");
  };

  // Fetch on mount
  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Refetch when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        fetchProfile();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSave = async () => {
    if (ecMethod === "email" && ecEmail && !isValidEmail(ecEmail)) {
      setSaveStatus("error");
      setSaveMessage("Please enter a valid emergency contact email.");
      return;
    }
    const hours = parseInt(intervalHours);
    if (!hours || hours < 1 || hours > 72) {
      setSaveStatus("error");
      setSaveMessage("Check-in interval must be between 1 and 72 hours.");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    const { error } = await supabase
      .from("kodo_members")
      .update({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        emergency_contact_name: ecName.trim(),
        emergency_contact_email: ecEmail.trim(),
        emergency_contact_phone: ecPhone.trim(),
        emergency_contact_method: ecMethod,
        check_in_interval_hours: hours,
      })
      .eq("email", user.email);

    if (error) {
      setSaveStatus("error");
      setSaveMessage("Could not save profile. Please try again.");
      return;
    }

    setSaveStatus("success");
    setSaveMessage("Profile saved.");
    setTimeout(() => { setSaveStatus("idle"); setSaveMessage(""); }, 3000);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
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
      return;
    }

    setPasswordStatus("success");
    setPasswordMessage("Password updated successfully.");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => { setPasswordStatus("idle"); setPasswordMessage(""); }, 3000);
  };

  const isSaving = saveStatus === "saving";
  const isChangingPassword = passwordStatus === "saving";

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
          <div>
            <p style={s.sectionLabel}>Personal Details</p>
            <div style={s.fieldGroup}>
              <div>
                <label style={s.label}>Full Name</label>
                <input style={s.input} type="text" value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson" disabled={isSaving} />
              </div>
              <div>
                <label style={s.label}>Your Phone Number</label>
                <input style={s.input} type="tel" value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +44 7700 900000" disabled={isSaving} />
              </div>
            </div>
          </div>

          <hr style={s.divider} />

          <div>
            <p style={s.sectionLabel}>⏱ Check-in Interval</p>
            <div style={s.intervalRow}>
              <input
                style={s.intervalInput}
                type="number"
                min="1"
                max="72"
                value={intervalHours}
                onChange={(e) => setIntervalHours(e.target.value)}
                disabled={isSaving}
              />
              <span style={s.intervalLabel}>hours (1–72)</span>
            </div>
            <div style={{ ...s.infoBox, marginTop: "10px" }}>
              If you don't check in within this window, your emergency contact will be alerted.
            </div>
          </div>

          <hr style={s.divider} />

          <div>
            <p style={s.sectionLabel}>🚨 Emergency Contact</p>
            <div style={s.fieldGroup}>
              <div>
                <label style={s.label}>Contact Name</label>
                <input style={s.input} type="text" value={ecName}
                  onChange={(e) => setEcName(e.target.value)}
                  placeholder="e.g. Sarah Johnson" disabled={isSaving} />
              </div>
              <div>
                <label style={s.label}>Alert Method</label>
                <div style={s.methodRow}>
                  <button style={s.methodBtn(ecMethod === "email")}
                    onClick={() => setEcMethod("email")}>
                    📧 Email
                  </button>
                  <button style={s.methodBtn(ecMethod === "phone")}
                    onClick={() => setEcMethod("phone")}>
                    📱 Phone (SMS)
                  </button>
                </div>
              </div>
              {ecMethod === "email" && (
                <div>
                  <label style={s.label}>Contact Email</label>
                  <input style={s.input} type="email" value={ecEmail}
                    onChange={(e) => setEcEmail(e.target.value)}
                    placeholder="e.g. sarah@example.com" disabled={isSaving} />
                </div>
              )}
              {ecMethod === "phone" && (
                <div>
                  <label style={s.label}>Contact Phone Number</label>
                  <input style={s.input} type="tel" value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                    placeholder="e.g. +44 7700 900000" disabled={isSaving} />
                  <p style={{ ...s.subtext, marginTop: "6px", fontSize: "0.75rem" }}>
                    SMS alerts require a Twilio integration (coming soon).
                  </p>
                </div>
              )}
            </div>
          </div>

          {saveStatus === "success" && <p style={s.successText} role="status">✓ {saveMessage}</p>}
          {saveStatus === "error" && <p style={s.errorText} role="alert">⚠ {saveMessage}</p>}

          <button style={s.saveButton(isSaving)} onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Profile"}
          </button>

          <hr style={s.divider} />

          <div>
            <p style={s.sectionLabel}>🔐 Change Password</p>
            <div style={s.fieldGroup}>
              <div>
                <label style={s.label}>New Password</label>
                <input style={s.input} type="password" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordStatus("idle"); }}
                  placeholder="Min. 6 characters" disabled={isChangingPassword} />
              </div>
              <div>
                <label style={s.label}>Confirm New Password</label>
                <input style={s.input} type="password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordStatus("idle"); }}
                  placeholder="Repeat new password" disabled={isChangingPassword} />
              </div>
            </div>

            {passwordStatus === "success" && <p style={{ ...s.successText, marginTop: "8px" }} role="status">✓ {passwordMessage}</p>}
            {passwordStatus === "error" && <p style={{ ...s.errorText, marginTop: "8px" }} role="alert">⚠ {passwordMessage}</p>}

            <button
              style={{ ...s.saveButton(isChangingPassword), marginTop: "12px", backgroundColor: colors.borderLight, color: colors.textSecond, border: `1.5px solid ${colors.border}` }}
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Updating…" : "Update Password"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}