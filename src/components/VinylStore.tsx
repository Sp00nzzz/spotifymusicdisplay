import { useState, useRef, useEffect } from 'react';
import { AlbumCard } from './AlbumCard';
import { getOEmbed } from '../utils/getOEmbed';

interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  spotifyUrl: string;
}

export function VinylStore() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const storeRef = useRef<HTMLDivElement>(null);

  // Sample albums for the store (you can replace with real Spotify API data)
  const sampleAlbums: Album[] = [
    {
      id: '1',
      title: 'Random Access Memories',
      artist: 'Daft Punk',
      imageUrl: '',
      spotifyUrl: 'https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa',
    },
    {
      id: '2',
      title: 'Abbey Road',
      artist: 'The Beatles',
      imageUrl: '',
      spotifyUrl: 'https://open.spotify.com/album/0ETFjACtuP2ADo6LFhL6HN',
    },
    {
      id: '3',
      title: 'The Dark Side of the Moon',
      artist: 'Pink Floyd',
      imageUrl: '',
      spotifyUrl: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv',
    },
    {
      id: '4',
      title: 'Kind of Blue',
      artist: 'Miles Davis',
      imageUrl: '',
      spotifyUrl: 'https://open.spotify.com/album/1weenld61qoidwYuZ1GESA',
    },
    {
      id: '5',
      title: 'Thriller',
      artist: 'Michael Jackson',
      imageUrl: '',
      spotifyUrl: 'https://open.spotify.com/album/2ANVost0y2y52ema1E9xAZ',
    },
    {
      id: '6',
      title: 'The Wall',
      artist: 'Pink Floyd',
      imageUrl: '',
      spotifyUrl: 'https://open.spotify.com/album/5Dbax7G8SWrP9xyzkOvy2F',
    },
  ];

  useEffect(() => {
    // Load sample albums initially
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd fetch from Spotify API
      // For now, we'll use sample data and try to fetch real images
      const loadedAlbums = await Promise.all(
        sampleAlbums.map(async (album) => {
          try {
            const oEmbed = await getOEmbed(album.spotifyUrl);
            if (oEmbed?.thumbnail_url) {
              return { ...album, imageUrl: oEmbed.thumbnail_url };
            }
          } catch (err) {
            console.warn(`Failed to load image for ${album.title}`);
          }
          return album;
        })
      );
      setAlbums(loadedAlbums);
    } catch (err) {
      console.error('Error loading albums:', err);
      setAlbums(sampleAlbums);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleAddFromUrl = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const oEmbed = await getOEmbed(searchQuery.trim());
      if (oEmbed?.thumbnail_url) {
        const newAlbum: Album = {
          id: Date.now().toString(),
          title: oEmbed.title || 'Unknown Album',
          artist: oEmbed.author_name || 'Unknown Artist',
          imageUrl: oEmbed.thumbnail_url,
          spotifyUrl: searchQuery.trim(),
        };
        setAlbums([...albums, newAlbum]);
        setSelectedAlbum(newAlbum);
        setSearchQuery('');
      } else {
        alert('Could not fetch album from Spotify URL');
      }
    } catch (err) {
      console.error('Error adding album:', err);
      alert('Failed to add album');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={storeRef}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff',
        fontFamily: "'Georgia', serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Store Header */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '20px 40px',
          borderBottom: '2px solid #8b4513',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#d4af37', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              🎵 VINYL RECORDS 🎵
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#ccc', fontStyle: 'italic' }}>
              Since 1972 • Authentic Records • Rare Finds
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search albums or add Spotify URL..."
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                border: '2px solid #8b4513',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                minWidth: '300px',
                outline: 'none',
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery.includes('spotify.com')) {
                  handleAddFromUrl();
                }
              }}
            />
            {searchQuery.includes('spotify.com') && (
              <button
                onClick={handleAddFromUrl}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  backgroundColor: '#8b4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                Add to Store
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedAlbum ? '1fr 400px' : '1fr',
          gap: '30px',
          padding: '40px',
          maxWidth: '1600px',
          margin: '0 auto',
          transition: 'grid-template-columns 0.3s ease',
        }}
      >
        {/* Album Shelves */}
        <div>
          <h2
            style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#d4af37',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Browse Our Collection
          </h2>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Loading records...
            </div>
          )}

          {/* Album Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '25px',
              marginBottom: '40px',
            }}
          >
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() => handleAlbumClick(album)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: selectedAlbum?.id === album.id ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08) translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = selectedAlbum?.id === album.id ? 'scale(1.05)' : 'scale(1)';
                }}
              >
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '8px',
                    padding: '15px',
                    border: selectedAlbum?.id === album.id ? '3px solid #d4af37' : '2px solid #444',
                    boxShadow: selectedAlbum?.id === album.id
                      ? '0 8px 25px rgba(212, 175, 55, 0.4)'
                      : '0 4px 15px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      background: '#222',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {album.imageUrl ? (
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          fontSize: '12px',
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#fff',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {album.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#aaa',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {album.artist}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAlbums.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>No albums found</p>
              <p style={{ fontSize: '14px' }}>Try searching or add a Spotify URL</p>
            </div>
          )}
        </div>

        {/* Selected Album Display */}
        {selectedAlbum && (
          <div
            style={{
              position: 'sticky',
              top: '120px',
              height: 'fit-content',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '12px',
              padding: '30px',
              border: '2px solid #8b4513',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h3
                style={{
                  fontSize: '20px',
                  color: '#d4af37',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                }}
              >
                Selected Record
              </h3>
              <button
                onClick={() => setSelectedAlbum(null)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <AlbumCard imageUrl={selectedAlbum.imageUrl} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: '8px',
                }}
              >
                {selectedAlbum.title}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#aaa',
                  marginBottom: '20px',
                }}
              >
                {selectedAlbum.artist}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  fontStyle: 'italic',
                  marginBottom: '20px',
                }}
              >
                💿 Vinyl LP • $24.99
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#8b4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a0522d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b4513';
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Store Footer */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          textAlign: 'center',
          borderTop: '2px solid #8b4513',
          marginTop: '40px',
        }}
      >
        <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
          🎵 Welcome to our vinyl store • Browse our collection of classic and rare records 🎵
        </p>
      </div>
    </div>
  );
}

