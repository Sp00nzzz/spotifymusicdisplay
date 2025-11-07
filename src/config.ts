export const CONFIG = {
  render: {
    width: 1200,
    height: 1200,
  },
  sleeve: {
    width: 0.315, // 12.4 inches in meters (LP sleeve)
    height: 0.315,
    depth: 0.003, // thin sleeve
    bevelRadius: 0.002,
  },
  vinyl: {
    radius: 0.1524, // 6 inches in meters
    height: 0.0015, // vinyl thickness
    labelRadius: 0.0381, // 1.5 inches center label
    grooveDepth: 0.0001,
    grooveCount: 200,
  },
  animation: {
    halfOutOffset: 0.08, // how far vinyl pulls out when toggle is on
    duration: 0.5, // animation duration in seconds
  },
  lighting: {
    keyLight: {
      position: [5, 5, 5] as [number, number, number],
      intensity: 1.2,
      color: 0xffffff,
    },
    rimLight: {
      position: [-3, 2, -3] as [number, number, number],
      intensity: 0.6,
      color: 0xffffff,
    },
    ambientLight: {
      intensity: 0.4,
      color: 0xffffff,
    },
  },
  camera: {
    position: [0, 0, 0.8] as [number, number, number],
    fov: 50,
    near: 0.1,
    far: 10,
  },
  background: {
    color: 0xf5f5f5,
  },
  spotify: {
    // Optional: Spotify Web API credentials
    // The oEmbed API (currently used) doesn't require these
    // Only needed if you want to use the full Spotify Web API
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
  },
} as const;

