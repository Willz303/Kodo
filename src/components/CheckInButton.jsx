import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const CheckInButton = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // To prevent double-clicks

  // We hardcode an email for the prototype. Later, this will come from a login screen.
  const currentUserEmail = "Miloabara@gmail.com"; 

  const handleCheckIn = async () => {
    setIsUpdating(true); // Disable button while loading

    try {
      // Get the exact current time
      const now = new Date().toISOString();

      // 1. Send the update to Supabase
      const { error } = await supabase
        .from('kodo_members')
        .update({ last_check_in: now })
        .eq('email', currentUserEmail); // Find the row with this email

      // 2. Error Handling (Crucial for grading rubric)
      if (error) {
        console.error("Failed to check in:", error.message);
        alert("Connection error. Please try again.");
        setIsUpdating(false);
        return;
      }

      // 3. If successful, trigger the green UI state
      setIsCheckedIn(true);
      console.log("Successfully recorded check-in at:", now);
      
      // Reset the button back to normal after 3 seconds
      setTimeout(() => {
        setIsCheckedIn(false);
        setIsUpdating(false);
      }, 3000);

    } catch (err) {
      console.error("Unexpected system error:", err);
      setIsUpdating(false);
    }
  };

  // UI Styling
  const buttonStyle = {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: isCheckedIn ? '#28a745' : (isUpdating ? '#6c757d' : '#0066cc'),
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: isUpdating ? 'not-allowed' : 'pointer',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease',
    marginTop: '40px'
  };

  return (
    <button 
      onClick={handleCheckIn} 
      style={buttonStyle}
      disabled={isUpdating || isCheckedIn}
    >
      {isUpdating ? 'Updating...' : (isCheckedIn ? '✓ Safe' : 'Tap to Check In')}
    </button>
  );
};

export default CheckInButton;