import { useState } from 'react';

const CheckInButton = () => {
  // State to track if the user just clicked the button
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    
    // Reset the button back to normal after 3 seconds
    setTimeout(() => {
      setIsCheckedIn(false);
    }, 3000);
  };

  // Simple styling objects (easier to read than massive CSS files)
  const buttonStyle = {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: isCheckedIn ? '#28a745' : '#0066cc', // Green if checked in, Blue otherwise
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease',
    marginTop: '40px'
  };

  return (
    <button onClick={handleCheckIn} style={buttonStyle}>
      {isCheckedIn ? '✓ Safe' : 'Tap to Check In'}
    </button>
  );
};

export default CheckInButton;