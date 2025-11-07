import { CONFIG } from '../config';

interface SpotifyAlbumResponse {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Get access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string | null> {
  const clientId = CONFIG.spotify.clientId;
  const clientSecret = CONFIG.spotify.clientSecret;

  console.log('Checking Spotify credentials...', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId?.length || 0,
  });

  if (!clientId || !clientSecret) {
    console.warn('Spotify credentials not configured. Please add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to your .env file and restart the dev server.');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get access token:', response.status, response.statusText, errorText);
      return null;
    }

    const data = (await response.json()) as SpotifyTokenResponse;
    console.log('Successfully obtained access token');
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Extract ID and type from Spotify URL
 */
function extractSpotifyId(spotifyUrl: string): { id: string; type: 'album' | 'track' } | null {
  try {
    console.log('Extracting Spotify ID from URL:', spotifyUrl);
    
    // Handle album URLs
    // https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa
    // https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa?si=...
    let match = spotifyUrl.match(/\/album\/([a-zA-Z0-9]+)/);
    if (match) {
      console.log('Found album ID:', match[1]);
      return { id: match[1], type: 'album' };
    }
    
    match = spotifyUrl.match(/spotify:album:([a-zA-Z0-9]+)/);
    if (match) {
      console.log('Found album ID (URI format):', match[1]);
      return { id: match[1], type: 'album' };
    }
    
    // Handle track URLs
    // https://open.spotify.com/track/4u7vj352S98d9iA7ac1EVG?si=...
    match = spotifyUrl.match(/\/track\/([a-zA-Z0-9]+)/);
    if (match) {
      console.log('Found track ID:', match[1]);
      return { id: match[1], type: 'track' };
    }
    
    match = spotifyUrl.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (match) {
      console.log('Found track ID (URI format):', match[1]);
      return { id: match[1], type: 'track' };
    }
    
    console.error('Could not extract ID from URL:', spotifyUrl);
    return null;
  } catch (error) {
    console.error('Error extracting Spotify ID:', error);
    return null;
  }
}

interface SpotifyTrackResponse {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
}

/**
 * Get album details from Spotify Web API
 * Handles both album and track URLs
 * References:
 * - https://developer.spotify.com/documentation/web-api/reference/get-an-album
 * - https://developer.spotify.com/documentation/web-api/reference/get-track
 */
export async function getSpotifyAlbum(spotifyUrl: string): Promise<{
  title: string;
  artist: string;
  imageUrl: string;
} | null> {
  const spotifyData = extractSpotifyId(spotifyUrl);
  if (!spotifyData) {
    console.error('Could not extract ID from URL');
    return null;
  }

  // Get access token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.warn('Could not get access token, falling back to oEmbed');
    return null;
  }

  try {
    if (spotifyData.type === 'track') {
      // Fetch track first, then get album info from track
      console.log('Fetching track from Spotify API, track ID:', spotifyData.id);
      const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${spotifyData.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!trackResponse.ok) {
        const errorText = await trackResponse.text();
        console.error('Failed to fetch track:', trackResponse.status, trackResponse.statusText, errorText);
        return null;
      }

      const track = (await trackResponse.json()) as SpotifyTrackResponse;
      console.log('Successfully fetched track:', track.name, 'by', track.artists.map(a => a.name).join(', '));

      // Extract artist name from track
      const artistName = track.artists.map((artist) => artist.name).join(', ');

      // Get album image (use track's album)
      const imageUrl =
        track.album.images.length > 0
          ? track.album.images.sort((a, b) => (b.width || 0) - (a.width || 0))[0].url
          : '';

      return {
        title: track.album.name, // Use album name, not track name
        artist: artistName || 'Unknown Artist',
        imageUrl: imageUrl,
      };
    } else {
      // Fetch album directly
      console.log('Fetching album from Spotify API, album ID:', spotifyData.id);
      const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${spotifyData.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!albumResponse.ok) {
        const errorText = await albumResponse.text();
        console.error('Failed to fetch album:', albumResponse.status, albumResponse.statusText, errorText);
        return null;
      }

      const album = (await albumResponse.json()) as SpotifyAlbumResponse;
      console.log('Successfully fetched album:', album.name, 'by', album.artists.map(a => a.name).join(', '));

      // Extract artist name (albums can have multiple artists, join them)
      const artistName = album.artists.map((artist) => artist.name).join(', ');

      // Get the largest image
      const imageUrl =
        album.images.length > 0
          ? album.images.sort((a, b) => (b.width || 0) - (a.width || 0))[0].url
          : '';

      return {
        title: album.name,
        artist: artistName || 'Unknown Artist',
        imageUrl: imageUrl,
      };
    }
  } catch (error) {
    console.error('Error fetching from Spotify API:', error);
    return null;
  }
}

