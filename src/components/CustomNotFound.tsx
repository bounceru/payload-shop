// src/components/CustomNotFound.tsx
import React from 'react'

const CustomNotFound: React.FC = () => {
  const handleBackToList = () => {
    window.history.back() // Navigate back to the previous page
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Nothing found</h1>
      <p>Sorry—there is nothing to correspond with your request.</p>
      <button
        onClick={handleBackToList}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Back to List
      </button>
    </div>
  )
}

export default CustomNotFound
