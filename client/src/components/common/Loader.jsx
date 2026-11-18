import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--slate-200)',
          borderTopColor: 'var(--primary-600)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: '500' }}>{message}</p>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
