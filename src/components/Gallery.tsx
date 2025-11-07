import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlbumCard } from './AlbumCard';
import type { PublishedReview } from '../types';

export function Gallery() {
  const [reviews, setReviews] = useState<PublishedReview[]>([]);
  const location = useLocation();

  const loadReviews = () => {
    // Load reviews from localStorage
    const storedReviews = JSON.parse(localStorage.getItem('publishedReviews') || '[]') as PublishedReview[];
    setReviews(storedReviews);
  };

  useEffect(() => {
    loadReviews();
    
    // Listen for storage changes (when reviews are published from another tab/window)
    const handleStorageChange = () => {
      loadReviews();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]); // Reload when location changes

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
          padding: '20px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '600',
              letterSpacing: '-0.5px',
              color: '#1d1d1f',
              margin: 0,
            }}
          >
            Gallery
          </h1>
          <Link
            to="/"
            style={{
              fontSize: '17px',
              color: '#007aff',
              textDecoration: 'none',
              fontWeight: '400',
              letterSpacing: '-0.2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Album Review
          </Link>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 40px',
        }}
      >
        {reviews.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '80px 40px',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
              border: '0.5px solid rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              color: '#86868b',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>🖼️</div>
            <p style={{ fontSize: '17px', margin: 0, letterSpacing: '-0.2px' }}>
              No reviews yet. Publish your first review to see it here!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '16px',
            }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                  border: '0.5px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Album Cover */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AlbumCard imageUrl={review.albumImageUrl} size={0.3} />
                </div>

                {/* Album Info */}
                <div style={{ textAlign: 'center' }}>
                  <h2
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1d1d1f',
                      marginBottom: '4px',
                      letterSpacing: '-0.1px',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {review.albumTitle}
                  </h2>
                  <p
                    style={{
                      fontSize: '10px',
                      color: '#86868b',
                      margin: '0 0 6px 0',
                      letterSpacing: '-0.1px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {review.albumArtist}
                  </p>

                  {/* Rating */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '1px',
                      marginBottom: '6px',
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '10px',
                          color: star <= review.rating ? '#ff9500' : '#d2d2d7',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Comment */}
                  <p
                    style={{
                      fontSize: '10px',
                      color: '#1d1d1f',
                      margin: 0,
                      lineHeight: '1.4',
                      letterSpacing: '-0.05px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    "{review.comment}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

