# Spotify Album Sleeve Mockup Generator

A TypeScript + React web app that generates 3D album sleeve mockups from Spotify URLs using Three.js.

## Features

- **Spotify Integration**: Automatically fetches album artwork from Spotify URLs via oEmbed API
- **Image Upload Fallback**: Upload custom images if Spotify oEmbed fails
- **3D Rendering**: Beautiful 3D album sleeve with realistic lighting and shadows
- **PNG Export**: Download high-resolution PNG images of the mockup

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables (Optional)

The app uses Spotify's public oEmbed API which **doesn't require any credentials**. However, if you want to use the full Spotify Web API, you can optionally add credentials:

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Add your Spotify API credentials to `.env`:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

   Get your credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

**Note:** For production apps, never expose API secrets in client-side code. Use a backend proxy instead.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

- `src/config.ts` - Configuration constants (dimensions, lighting, etc.)
- `src/types.ts` - TypeScript type definitions
- `src/utils/getOEmbed.ts` - Spotify oEmbed API integration
- `src/utils/fetchCover.ts` - Image fetching with CORS handling
- `src/scene/createSleeve.ts` - Sleeve 3D model creation
- `src/scene/createScene.ts` - Main scene setup and rendering
- `src/App.tsx` - Main React component with UI

## Usage

1. Enter a Spotify URL (e.g., `https://open.spotify.com/album/...`)
2. Click "Generate" to fetch the album artwork and create the mockup
3. Click "Download PNG" to export a high-resolution image

If the Spotify URL doesn't work, you can upload an image directly using the file input.

