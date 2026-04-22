import React from 'react';
import htmlContent from './serviceform.html?raw';

export default function ServiceForm() {
  // We use srcDoc to inject the raw HTML securely into an iframe.
  // This completely encapsulates the vanilla JS and prevents the 
  // raw HTML file from being hosted as a standalone file on the server.
  return (
    <iframe
      title="HRV Service Form"
      srcDoc={htmlContent}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block'
      }}
    />
  );
}
