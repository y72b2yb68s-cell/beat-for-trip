import type { Beat } from "./types";

/**
 * Placeholder catalog shown until real beats are uploaded through /admin.
 * coverUrl/previewUrl/fileUrl are intentionally empty — BeatCard/AudioPlayer
 * render graceful fallbacks rather than pointing at files that don't exist.
 */
export const demoBeats: Beat[] = [
  {
    id: "demo-1",
    title: "Midnight Trip",
    slug: "midnight-trip",
    description:
      "Dark, hypnotic trap instrumental built around a moody piano loop and rolling 808s. Perfect for late-night vocals and introspective bars.",
    genre: "Trap",
    bpm: 140,
    key: "F#m",
    duration: 161,
    price: 29.99,
    currency: "EUR",
    coverUrl: "",
    previewUrl: "",
    status: "published",
    createdAt: "2026-09-18T12:00:00.000Z",
    updatedAt: "2026-09-18T12:00:00.000Z",
  },
  {
    id: "demo-2",
    title: "Neon Drift",
    slug: "neon-drift",
    description:
      "Smooth boom-bap drums layered with warped synth chords. A laid-back groove for storytelling flows.",
    genre: "Hip Hop",
    bpm: 92,
    key: "Cm",
    duration: 192,
    price: 24.99,
    currency: "EUR",
    coverUrl: "",
    previewUrl: "",
    status: "published",
    createdAt: "2026-09-17T12:00:00.000Z",
    updatedAt: "2026-09-17T12:00:00.000Z",
  },
  {
    id: "demo-3",
    title: "Glass City",
    slug: "glass-city",
    description:
      "Dusty lo-fi keys over a relaxed swing beat. Ideal for chill vocals, vlogs, or lo-fi playlists.",
    genre: "Lo-Fi",
    bpm: 78,
    key: "Am",
    duration: 178,
    price: 19.99,
    currency: "EUR",
    coverUrl: "",
    previewUrl: "",
    status: "published",
    createdAt: "2026-09-16T12:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
  },
  {
    id: "demo-4",
    title: "Velvet Rage",
    slug: "velvet-rage",
    description:
      "Aggressive, distorted 808s with a cinematic string stab. High-energy trap for hard-hitting hooks.",
    genre: "Trap",
    bpm: 150,
    key: "Gm",
    duration: 145,
    price: 34.99,
    currency: "EUR",
    coverUrl: "",
    previewUrl: "",
    status: "published",
    createdAt: "2026-09-15T12:00:00.000Z",
    updatedAt: "2026-09-15T12:00:00.000Z",
  },
  {
    id: "demo-5",
    title: "Solar Flare",
    slug: "solar-flare",
    description:
      "Silky RnB chords, live-feel bass, and soft trap percussion. Built for smooth, melodic vocals.",
    genre: "RnB",
    bpm: 88,
    key: "Dm",
    duration: 214,
    price: 27.99,
    currency: "EUR",
    coverUrl: "",
    previewUrl: "",
    status: "published",
    createdAt: "2026-09-14T12:00:00.000Z",
    updatedAt: "2026-09-14T12:00:00.000Z",
  },
];
