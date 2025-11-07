import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOEmbed } from '../utils/getOEmbed';
import { getSpotifyAlbum } from '../utils/getSpotifyAlbum';
import { AlbumCard } from './AlbumCard';
import type { PublishedReview } from '../types';

export function AlbumReview() {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [albumImageUrl, setAlbumImageUrl] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumArtist, setAlbumArtist] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const navigate = useNavigate();

  const handleLoadAlbum = async () => {
    if (!spotifyUrl.trim()) {
      setError('Please enter a Spotify URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRating(0);
    setComment('');
    setIsPublished(false);

    try {
      // Try to get album details from Spotify Web API first (has artist info)
      console.log('Attempting to fetch album from Spotify Web API...');
      const albumData = await getSpotifyAlbum(spotifyUrl.trim());
      
      if (albumData) {
        // Successfully got data from Web API
        console.log('Successfully loaded from Spotify Web API:', albumData);
        setAlbumImageUrl(albumData.imageUrl);
        setAlbumTitle(albumData.title);
        setAlbumArtist(albumData.artist);
      } else {
        console.log('Spotify Web API failed, falling back to oEmbed...');
        // Fallback to oEmbed API
        const oEmbedData = await getOEmbed(spotifyUrl.trim());
        
        if (oEmbedData?.thumbnail_url) {
          setAlbumImageUrl(oEmbedData.thumbnail_url);
          
          // Parse title and artist from the response
          const title = oEmbedData.title || '';
          let albumTitle = title;
          let albumArtist = oEmbedData.author_name || '';
          
          // If no author_name, try to extract from title (format: "Artist - Album" or "Album by Artist")
          if (!albumArtist && title) {
            // Try "Artist - Album" format
            if (title.includes(' - ')) {
              const parts = title.split(' - ');
              if (parts.length >= 2) {
                albumArtist = parts[0].trim();
                albumTitle = parts.slice(1).join(' - ').trim();
              }
            }
            // Try "Album by Artist" format
            else if (title.toLowerCase().includes(' by ')) {
              const parts = title.split(/ by /i);
              if (parts.length >= 2) {
                albumTitle = parts[0].trim();
                albumArtist = parts.slice(1).join(' by ').trim();
              }
            }
          }
          
          // Fallback if still no artist
          if (!albumArtist) {
            albumArtist = 'Unknown Artist';
          }
          if (!albumTitle) {
            albumTitle = 'Unknown Album';
          }
          
          setAlbumTitle(albumTitle);
          setAlbumArtist(albumArtist);
        } else {
          setError('Could not fetch album artwork from Spotify URL. Make sure you have Spotify API credentials in .env file for full functionality.');
          setAlbumImageUrl(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load album');
      setAlbumImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setComment(value);
    }
  };

  const handlePublish = () => {
    if (!albumImageUrl) {
      setError('Please load an album first');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length === 0) {
      setError('Please write a comment');
      return;
    }

    // Create review object
    const review: PublishedReview = {
      id: Date.now().toString(),
      spotifyUrl,
      albumTitle,
      albumArtist,
      albumImageUrl,
      rating,
      comment,
      publishedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingReviews = JSON.parse(localStorage.getItem('publishedReviews') || '[]') as PublishedReview[];
    existingReviews.unshift(review); // Add to beginning
    localStorage.setItem('publishedReviews', JSON.stringify(existingReviews));

    console.log('Published review:', review);

    setIsPublished(true);
    setError(null);
    
    // Navigate to gallery after 1 second
    setTimeout(() => {
      navigate('/gallery');
    }, 1000);
  };

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
            Album Review
          </h1>
          <Link
            to="/gallery"
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
            Gallery
          </Link>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'start',
        }}
      >
        {/* Left Side - Input Form */}
        <div>
          {/* Spotify URL Input Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
              border: '0.5px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '12px',
                letterSpacing: '-0.1px',
              }}
            >
              Spotify Album URL
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/album/..."
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: '17px',
                  border: '1px solid #d2d2d7',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fbfbfd',
                  color: '#1d1d1f',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007aff';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d2d2d7';
                  e.target.style.backgroundColor = '#fbfbfd';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLoadAlbum();
                  }
                }}
              />
              <button
                onClick={handleLoadAlbum}
                disabled={isLoading}
                style={{
                  padding: '14px 28px',
                  fontSize: '17px',
                  fontWeight: '600',
                  backgroundColor: isLoading ? '#d2d2d7' : '#007aff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.2px',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0051d5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#007aff';
                  }
                }}
              >
                {isLoading ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>

          {/* Rating Card */}
          {albumImageUrl && (
            <>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '32px',
                  marginBottom: '24px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                  border: '0.5px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1d1d1f',
                    marginBottom: '16px',
                    letterSpacing: '-0.1px',
                  }}
                >
                  Rating
                </label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        fontSize: '32px',
                        lineHeight: 1,
                        color: star <= rating ? '#ff9500' : '#d2d2d7',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (star > rating) {
                          e.currentTarget.style.color = '#ffb340';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (star > rating) {
                          e.currentTarget.style.color = '#d2d2d7';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span
                      style={{
                        marginLeft: '16px',
                        fontSize: '17px',
                        color: '#86868b',
                        fontWeight: '400',
                        letterSpacing: '-0.2px',
                      }}
                    >
                      {rating} of 5
                    </span>
                  )}
                </div>
              </div>

              {/* Comment Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '32px',
                  marginBottom: '24px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                  border: '0.5px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1d1d1f',
                      letterSpacing: '-0.1px',
                    }}
                  >
                    Comment
                  </label>
                  <span
                    style={{
                      fontSize: '13px',
                      color: comment.length === 50 ? '#ff3b30' : '#86868b',
                      fontWeight: '400',
                    }}
                  >
                    {comment.length}/50
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="Share your thoughts..."
                  maxLength={50}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '14px 18px',
                    fontSize: '17px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '12px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fbfbfd',
                    color: '#1d1d1f',
                    lineHeight: '1.47059',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007aff';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d2d2d7';
                    e.target.style.backgroundColor = '#fbfbfd';
                  }}
                />
              </div>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={isPublished}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '17px',
                  fontWeight: '600',
                  backgroundColor: isPublished ? '#34c759' : '#007aff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isPublished ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.2px',
                }}
                onMouseEnter={(e) => {
                  if (!isPublished) {
                    e.currentTarget.style.backgroundColor = '#0051d5';
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPublished) {
                    e.currentTarget.style.backgroundColor = '#007aff';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isPublished ? '✓ Published' : 'Publish Review'}
              </button>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px 20px',
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                borderRadius: '12px',
                fontSize: '15px',
                border: '0.5px solid rgba(211, 47, 47, 0.2)',
              }}
            >
              {error}
            </div>
          )}

          {!albumImageUrl && (
            <div
              style={{
                marginTop: '24px',
                padding: '40px',
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                textAlign: 'center',
                color: '#86868b',
                fontSize: '15px',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                border: '0.5px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🎵</div>
              <p style={{ margin: 0, letterSpacing: '-0.1px' }}>
                Enter a Spotify URL and click Load to get started
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Album Display */}
        <div
          style={{
            position: 'sticky',
            top: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {albumImageUrl ? (
            <>
              {/* Album cover without card wrapper */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <AlbumCard imageUrl={albumImageUrl} />
              </div>
              {/* Album text card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '24px 32px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                  border: '0.5px solid rgba(0, 0, 0, 0.08)',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#1d1d1f',
                    marginBottom: '8px',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {albumTitle}
                </h2>
                <p
                  style={{
                    fontSize: '17px',
                    color: '#86868b',
                    margin: 0,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {albumArtist}
                </p>
              </div>
            </>
          ) : (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '80px 40px',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                border: '0.5px solid rgba(0, 0, 0, 0.08)',
                width: '100%',
                textAlign: 'center',
                color: '#86868b',
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>🎵</div>
              <p style={{ fontSize: '17px', margin: 0, letterSpacing: '-0.2px' }}>
                Album will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

