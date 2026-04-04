import React, { useState, useEffect } from 'react';
import DrawingWorkspace from './components/DrawingWorkspace';
import './App.css';

function App() {
  const [params, setParams] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Extract query parameters
    const address = urlParams.get('address') || '';
    const token = urlParams.get('token') || '';
    const quoteId = urlParams.get('quoteID') || '';
    const guid = urlParams.get('guid') || '';
    const s1 = urlParams.get('s1') || urlParams.get('S1');
    const s2 = urlParams.get('s2') || urlParams.get('S2');
    const d1 = urlParams.get('d1') || urlParams.get('D1');
    const d2 = urlParams.get('d2') || urlParams.get('D2');

    // Token Validation Logic (Secret Formula: length of address * 314)
    const expectedToken = String(address.length * 314);
    
    if (address && token === expectedToken) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    setParams({
        address, quoteId, guid, s1, s2, d1, d2
    });
    setIsLoading(false);

  }, []);

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#d9534f' }}>Unauthorized Access</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          Invalid or missing security token. Please launch the drawing tool directly from the CRM application.
        </p>
      </div>
    );
  }

  return (
    <DrawingWorkspace 
      quoteId={params.quoteId} 
      address={params.address} 
      guid={params.guid} 
      s1={params.s1} 
      s2={params.s2} 
      d1={params.d1} 
      d2={params.d2} 
    />
  );
}

export default App;
