export interface SpotifyOEmbedResponse {
  thumbnail_url: string;
  title?: string;
  author_name?: string;
  provider_name?: string;
  html?: string;
  [key: string]: any; // Allow for other fields
}

export interface TextureLoadResult {
  texture: any; // THREE.Texture - using any to avoid import dependency
  imageUrl: string;
}

export interface PublishedReview {
  id: string;
  spotifyUrl: string;
  albumTitle: string;
  albumArtist: string;
  albumImageUrl: string;
  rating: number;
  comment: string;
  publishedAt: string;
}
