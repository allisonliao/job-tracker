import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState<string>('loading...');

  useEffect(() => {
    fetch('http://localhost:8080/ping')
        .then((res) => res.json())
        .then((data) => setStatus(data.status))
        .catch((err) => setStatus('error: ' + err.message));
  }, []);

  return (
      <div>
        <h1>Job Tracker</h1>
        <p>Backend status: {status}</p>
      </div>
  );
}

export default App;