import './index.css';
import CheckInButton from './components/CheckInButton';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', margin: '0', color: '#333' }}>Kodo</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Personal Safety Monitor</p>
      
      {/* Here is where we load our custom component */}
      <CheckInButton />
      
    </div>
  );
}

export default App;