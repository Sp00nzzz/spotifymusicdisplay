# Album Review Gallery

A TypeScript + React web app for reviewing Spotify albums. Share your reviews with others through a beautiful gallery powered by Supabase.

## Features

- **Spotify Integration**: Automatically fetches album artwork, title, and artist from Spotify URLs
- **Album Reviews**: Rate albums (1-5 stars) and write comments (up to 50 characters)
- **Shared Gallery**: View all published reviews from everyone in real-time
- **Apple Design**: Clean, minimalist UI inspired by Apple's design language
- **Real-time Updates**: See new reviews appear instantly as they're published

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Add your credentials to `.env`:
   ```
   # Spotify API (Optional but recommended for better data)
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here

   # Supabase (Required for shared gallery)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   - **Spotify API**: Get credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - **Supabase**: Get credentials from your [Supabase Project Settings](https://supabase.com/dashboard/project/_/settings/api)

**Note:** For production apps, never expose API secrets in client-side code. Use a backend proxy instead.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase-setup.sql` to create the `reviews` table
4. Copy your project URL and anon key from Project Settings → API
5. Add them to your `.env` file

The app will fall back to localStorage if Supabase is not configured, but reviews won't be shared across users.

## Project Structure

- `src/components/AlbumReview.tsx` - Main review interface
- `src/components/Gallery.tsx` - Gallery displaying all published reviews
- `src/components/AlbumCard.tsx` - Album cover card with tilt and shine effects
- `src/lib/supabase.ts` - Supabase client configuration
- `src/utils/getSpotifyAlbum.ts` - Spotify Web API integration
- `src/utils/getOEmbed.ts` - Spotify oEmbed API fallback
- `src/types.ts` - TypeScript type definitions
- `src/config.ts` - Configuration constants

## Usage

1. Enter a Spotify URL (album or track)
2. Click "Load Album" to fetch the album artwork
3. Rate the album (1-5 stars)
4. Write a comment (up to 50 characters)
5. Click "Publish" to share your review
6. View all reviews in the Gallery

## Routes

- `/` - Album Review page
- `/gallery` - Gallery of all published reviews

