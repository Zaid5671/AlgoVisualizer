import React from 'react';

export function ResizeHandle({ onResize }) {
  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    // We calculate the new width based on the distance from the right edge of the window
    const newWidth = window.innerWidth - e.clientX;
    onResize(Math.max(200, Math.min(newWidth, window.innerWidth - 300))); // Min 200px, max window - 300px
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        width: '8px',
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        borderLeft: '2px solid var(--border-color)',
        borderRight: '2px solid var(--border-color)',
        height: '100%',
        margin: '0 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-yellow)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      {/* Little gripper dots */}
      <div style={{ width: '4px', height: '4px', backgroundColor: 'black', borderRadius: '50%' }} />
      <div style={{ width: '4px', height: '4px', backgroundColor: 'black', borderRadius: '50%' }} />
      <div style={{ width: '4px', height: '4px', backgroundColor: 'black', borderRadius: '50%' }} />
    </div>
  );
}
