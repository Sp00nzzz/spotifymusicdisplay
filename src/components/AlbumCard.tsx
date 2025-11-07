import { useState, useRef, useEffect } from 'react';

interface AlbumCardProps {
  imageUrl: string | null;
  size?: number; // Size multiplier (1.0 = 100%, 0.3 = 30%)
}

export function AlbumCard({ imageUrl, size = 1.0 }: AlbumCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shinePosition, setShinePosition] = useState({ x: 50, y: 50 });
  
  const cardSize = 315 * size;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate tilt based on mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Normalize to -1 to 1 range
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);

    // Apply tilt (max 15 degrees)
    const maxTilt = 15;
    setTilt({
      x: normalizedY * maxTilt, // Rotate around X axis based on Y position
      y: normalizedX * maxTilt, // Rotate around Y axis based on X position
    });

    // Update shine position (0-100% for CSS)
    const shineX = ((e.clientX - rect.left) / rect.width) * 100;
    const shineY = ((e.clientY - rect.top) / rect.height) * 100;
    setShinePosition({ x: shineX, y: shineY });
  };

  const handleMouseLeave = () => {
    // Reset tilt when mouse leaves
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${cardSize}px`,
        height: `${cardSize}px`,
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out',
        transform: `perspective(1000px) rotateX(${-tilt.x}deg) rotateY(${tilt.y}deg)`,
        cursor: 'pointer',
      }}
    >
      {/* Card container with shadow and border */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* Album cover image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Album cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No image loaded
          </div>
        )}

        {/* Shine effect overlay - follows cursor */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle 250px at ${shinePosition.x}% ${shinePosition.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)`,
            pointerEvents: 'none',
            transition: 'background 0.15s ease-out',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Additional shine highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse 150px 300px at ${shinePosition.x}% ${shinePosition.y}%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)`,
            pointerEvents: 'none',
            transition: 'background 0.15s ease-out',
          }}
        />
      </div>
    </div>
  );
}

