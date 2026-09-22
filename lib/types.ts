export type BeatStatus = "published" | "unpublished";

export type Beat = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  bpm: number;
  key: string;
  duration: number; // seconds
  price: number; // major currency unit, e.g. 29.99
  currency: string; // always "EUR" — see lib/currency.ts
  coverUrl: string;
  previewUrl: string;
  status: BeatStatus;
  createdAt: string;
  updatedAt: string;
};

export type BeatSortOption = "newest" | "price-asc" | "price-desc";
