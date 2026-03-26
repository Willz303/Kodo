import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function CheckInButton({ onCheckIn }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckIn = async () => {
    if (status === "loading" || !user) return;
    
    setStatus("loading");
    setErrorMsg("");

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("kodo_members")
        .update({ last_check_in: now })
        .eq("email", user.email);

      if (error) throw error;

      setStatus("success");
      if (onCheckIn) onCheckIn(now);
      
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Check-in Error:", error);
      setStatus("error");
      setErrorMsg(error.message || "Failed to update check-in.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <button 
        onClick={handleCheckIn}
        disabled={status === "loading"}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          border: "none",
          backgroundColor: status === "success" ? "#3A8A4A" : "#1a1a1a",
          color: "white",
          fontWeight: "700",
          fontSize: "1.1rem",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          transition: "all 0.2s ease"
        }}
      >
        {status === "loading" ? "Updating..." : status === "success" ? "✓ I'm Safe" : "I'm Safe"}
      </button>
      {errorMsg && <p style={{ color: "#ff4d4d", fontSize: "0.8rem", marginTop: "8px" }}>{errorMsg}</p>}
    </div>
  );
}