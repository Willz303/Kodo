import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

const USER_EMAIL = "Miloabara@gmail.com";

const styles = {
  card: {
    backgroundcolour: "#1e293b",
    borderRadius: "16px",
    padding: "24px 28px",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  heading: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "600",
    colour: "#e2e8f0",
    letterSpacing: "0.3px",
  },
  subtext: {
    margin: 0,
    fontSize: "0.8rem",
    colour: "#64748b",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #334155",
    backgroundcolour: "#0f172a",
    colour: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-colour 0.2s",
  },
  row: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  saveButton: (disabled) => ({
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundcolour: disabled ? "#334155" : "#3b82f6",
    colour: disabled ? "#64748b" : "#ffffff",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-colour 0.2s",
    whiteSpace: "nowrap",
  }),
  successText: {
    colour: "#22c55e",
    fontSize: "0.82rem",
    margin: 0,
  },
  errorText: {
    colour: "#ef4444",
    fontSize: "0.82rem",
    margin: 0,
  },
  loadingText: {
    colour: "#94a3b8",
    fontSize: "0.82rem",
    margin: 0,
  },
};

export default function EmergencyContact() {
  const [contactEmail, setContactEmail] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [fetchStatus, setFetchStatus] = useState("loading"); // loading | loaded | error
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | success | error
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchContact = async () => {
      setFetchStatus("loading");

      const { data, error } = await supabase
        .from("kodo_members")
        .select("emergency_contact_email")
        .eq("email", USER_EMAIL)
        .single();

      if (error || !data) {
        setFetchStatus("error");
        return;
      }

      const existing = data.emergency_contact_email || "";
      setContactEmail(existing);
      setInputValue(existing);
      setFetchStatus("loaded");
    };

    fetchContact();
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!isValidEmail(inputValue)) {
      setSaveStatus("error");
      setSaveMessage("Please enter a valid email address.");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    const { error } = await supabase
      .from("kodo_members")
      .update({ emergency_contact_email: inputValue.trim() })
      .eq("email", USER_EMAIL);

    if (error) {
      setSaveStatus("error");
      setSaveMessage("Could not save. Please try again.");
      return;
    }

    setContactEmail(inputValue.trim());
    setSaveStatus("success");
    setSaveMessage("Emergency contact saved successfully.");

    setTimeout(() => {
      setSaveStatus("idle");
      setSaveMessage("");
    }, 4000);
  };

  const isSaving = saveStatus === "saving";
  const isUnchanged = inputValue.trim() === contactEmail;
  const saveDisabled = isSaving || isUnchanged || !inputValue.trim();

  return (
    <div style={styles.card}>
      <div>
        <p style={styles.heading}>🚨 Emergency Contact</p>
        <p style={styles.subtext}>
          If you miss a check-in, this person will be notified automatically.
        </p>
      </div>

      {fetchStatus === "loading" && (
        <p style={styles.loadingText}>Fetching contact details…</p>
      )}

      {fetchStatus === "error" && (
        <p style={styles.errorText}>
          ⚠ Could not load contact. Check your connection.
        </p>
      )}

      {fetchStatus === "loaded" && (
        <>
          <div style={styles.row}>
            <input
              style={styles.input}
              type="email"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (saveStatus !== "idle") setSaveStatus("idle");
              }}
              placeholder="e.g. trusted.friend@email.com"
              aria-label="Emergency contact email address"
              disabled={isSaving}
            />
            <button
              style={styles.saveButton(saveDisabled)}
              onClick={handleSave}
              disabled={saveDisabled}
              aria-label="Save emergency contact"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>

          {saveStatus === "success" && (
            <p style={styles.successText} role="status">
              ✓ {saveMessage}
            </p>
          )}
          {saveStatus === "error" && (
            <p style={styles.errorText} role="alert">
              ⚠ {saveMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}