import React from 'react';
import htmlContent from './installassessment.html?raw';

export default function InstallAssessment() {
  // We use srcDoc to inject the raw HTML securely into an iframe.
  return (
    <iframe
      title="Install Assessment"
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
