import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

const EmergencyContact = () => {
  const currentUserEmail = "Miloabara@gmail.com";

  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEmergencyContact = async () => {
      setFetching(true);
      setMessage("");

      const { data, error } = await supabase
        .from("kodo_members")
        .select("emergency_contact_email")
        .eq("email", currentUserEmail)
        .single();

      if (error) {
        console.error("Error fetching emergency contact:", error);
        setMessage("Failed to load emergency contact.");
      } else if (data && data.emergency_contact_email) {
        setContactEmail(data.emergency_contact_email);
      }

      setFetching(false);
    };

    fetchEmergencyContact();
  }, []);

  const handleSave = async () => {
    if (!contactEmail) {
      setMessage("Please enter an email.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("kodo_members")
      .update({ emergency_contact_email: contactEmail })
      .eq("email", currentUserEmail);

    if (error) {
      console.error("Error saving emergency contact:", error);
      setMessage("Failed to save contact. Please try again.");
    } else {
      setMessage("Emergency contact saved successfully.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Emergency Contact
      </h2>

      {fetching ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : (
        <>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Emergency Contact Email
          </label>

          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="xwillixmx@gmail.com"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          {message && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default EmergencyContact;