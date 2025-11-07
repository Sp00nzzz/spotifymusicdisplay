import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlbumCard } from './AlbumCard';
import { supabase } from '../lib/supabase';
import { getUserId } from '../utils/userId';
import type { PublishedReview } from '../types';

export function Gallery() {
  const [reviews, setReviews] = useState<PublishedReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PublishedReview | null>(null);
  const location = useLocation();

  const deleteAllReviews = async () => {
    try {
      const currentUserId = getUserId();
      
      // Delete only reviews that belong to the current user
      // First, fetch all reviews by this user to get their IDs
      const { data: userReviews, error: fetchError } = await (supabase
        .from('reviews')
        .select('id')
        .eq('user_id', currentUserId) as any);

      if (!fetchError && userReviews && userReviews.length > 0) {
        // Delete only the current user's reviews by their IDs
        const ids = userReviews.map((r: any) => r.id);
        const { error: supabaseError } = await (supabase
          .from('reviews')
          .delete()
          .in('id', ids) as any);

        if (supabaseError) {
          console.error('Error deleting from Supabase:', supabaseError);
        } else {
          console.log(`Deleted ${userReviews.length} review(s) from Supabase`);
        }
      } else if (fetchError) {
        console.error('Error fetching reviews for deletion:', fetchError);
      } else {
        console.log('No reviews found for current user');
      }

      // Clear localStorage (only for current user's reviews)
      const storedReviews = JSON.parse(localStorage.getItem('publishedReviews') || '[]') as PublishedReview[];
      const filteredReviews = storedReviews.filter((r: any) => r.userId !== currentUserId);
      localStorage.setItem('publishedReviews', JSON.stringify(filteredReviews));
      console.log('User reviews deleted from localStorage');

      // Reload reviews to update the display
      loadReviews();
    } catch (err) {
      console.error('Error deleting reviews:', err);
    }
  };

  const loadReviews = async () => {
    try {
      // Try to load from Supabase first
      const { data, error } = await (supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (error) {
        console.error('Error loading from Supabase:', error);
        // Fallback to localStorage
        const storedReviews = JSON.parse(localStorage.getItem('publishedReviews') || '[]') as PublishedReview[];
        setReviews(storedReviews);
        return;
      }

      if (data && data.length > 0) {
        // Transform Supabase data to PublishedReview format
        const reviews: PublishedReview[] = data.map((item: any) => ({
          id: item.id.toString(),
          spotifyUrl: item.spotify_url,
          albumTitle: item.album_title,
          albumArtist: item.album_artist,
          albumImageUrl: item.album_image_url,
          rating: item.rating,
          comment: item.comment,
          publishedAt: item.created_at || new Date().toISOString(),
          created_at: item.created_at,
          userId: item.user_id,
        }));
        setReviews(reviews);
      } else {
        // Fallback to localStorage if no Supabase data
        const storedReviews = JSON.parse(localStorage.getItem('publishedReviews') || '[]') as PublishedReview[];
        setReviews(storedReviews);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      // Fallback to localStorage
      const storedReviews = JSON.parse(localStorage.getItem('publishedReviews') || '[]') as PublishedReview[];
      setReviews(storedReviews);
    }
  };

  useEffect(() => {
    // Delete all reviews on mount
    deleteAllReviews();

    // Set up real-time subscription to Supabase
    const channel = (supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
        },
        () => {
          loadReviews();
        }
      ) as any)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location]); // Reload when location changes

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedReview(null);
      }
    };

    if (selectedReview) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedReview]);

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
                onClick={() => setSelectedReview(review)}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                  border: '0.5px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 16px rgba(0, 0, 0, 0.04)';
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

      {/* Modal Overlay */}
      {selectedReview && (
        <div
          onClick={() => setSelectedReview(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              animation: 'slideUp 0.3s ease-out',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedReview(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                color: '#86868b',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ×
            </button>

            {/* Album Cover */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <AlbumCard imageUrl={selectedReview.albumImageUrl} size={0.6} />
            </div>

            {/* Album Info */}
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '8px',
                  letterSpacing: '-0.3px',
                  lineHeight: '1.2',
                }}
              >
                {selectedReview.albumTitle}
              </h2>
              <p
                style={{
                  fontSize: '17px',
                  color: '#86868b',
                  margin: '0 0 20px 0',
                  letterSpacing: '-0.2px',
                }}
              >
                {selectedReview.albumArtist}
              </p>

              {/* Rating */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  marginBottom: '20px',
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: '24px',
                      color: star <= selectedReview.rating ? '#ff9500' : '#d2d2d7',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <div
                style={{
                  background: '#f5f5f7',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '20px',
                }}
              >
                <p
                  style={{
                    fontSize: '17px',
                    color: '#1d1d1f',
                    margin: 0,
                    lineHeight: '1.5',
                    letterSpacing: '-0.2px',
                    fontStyle: 'italic',
                  }}
                >
                  "{selectedReview.comment}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

