import React, { useState } from 'react';
import VerificationModal from '../components/VerificationModal';

const TestModal = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Modal Test Page</h1>
      
      <button 
        onClick={() => {
          console.log('🔧 Opening test modal...');
          setShowModal(true);
        }}
        style={{
          padding: '20px 40px',
          background: '#FF7F50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🧪 Open Verification Modal
      </button>

      <div style={{ marginTop: '20px' }}>
        <p>Modal State: {showModal ? 'OPEN' : 'CLOSED'}</p>
        <p>If the modal appears, then VerificationModal component works!</p>
      </div>

      <VerificationModal 
        isOpen={showModal}
        userEmail="test@example.com"
        onClose={() => {
          console.log('🔧 Closing test modal...');
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default TestModal;