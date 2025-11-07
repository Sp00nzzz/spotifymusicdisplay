import type { SpotifyOEmbedResponse } from '../types';

export async function getOEmbed(spotifyUrl: string): Promise<SpotifyOEmbedResponse | null> {
  try {
    const encodedUrl = encodeURIComponent(spotifyUrl);
    const response = await fetch(`https://open.spotify.com/oembed?url=${encodedUrl}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as SpotifyOEmbedResponse;
    
    // Log the response to help debug what fields are available
    console.log('Spotify oEmbed response:', data);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch oEmbed:', error);
    return null;
  }
}

