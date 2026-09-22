import type { Beat, BeatSortOption } from "./types";

export type BeatFilters = {
  search: string;
  genre: string;
  key: string;
  bpmMin: number;
  bpmMax: number;
  priceMin: number;
  priceMax: number;
  sort: BeatSortOption;
};

export function getFilterBounds(beats: Beat[]) {
  const bpms = beats.map((b) => b.bpm);
  const prices = beats.map((b) => b.price);
  return {
    bpmMin: beats.length ? Math.min(...bpms) : 0,
    bpmMax: beats.length ? Math.max(...bpms) : 300,
    priceMin: beats.length ? Math.min(...prices) : 0,
    priceMax: beats.length ? Math.max(...prices) : 1000,
  };
}

export function defaultFilters(beats: Beat[]): BeatFilters {
  const bounds = getFilterBounds(beats);
  return {
    search: "",
    genre: "all",
    key: "all",
    bpmMin: bounds.bpmMin,
    bpmMax: bounds.bpmMax,
    priceMin: bounds.priceMin,
    priceMax: bounds.priceMax,
    sort: "newest",
  };
}

export function applyFilters(beats: Beat[], filters: BeatFilters): Beat[] {
  const search = filters.search.trim().toLowerCase();

  const filtered = beats.filter((beat) => {
    if (beat.status !== "published") return false;
    if (search && !beat.title.toLowerCase().includes(search)) return false;
    if (filters.genre !== "all" && beat.genre !== filters.genre) return false;
    if (filters.key !== "all" && beat.key !== filters.key) return false;
    if (beat.bpm < filters.bpmMin || beat.bpm > filters.bpmMax) return false;
    if (beat.price < filters.priceMin || beat.price > filters.priceMax) return false;
    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return filtered.sort((a, b) => a.price - b.price);
    case "price-desc":
      return filtered.sort((a, b) => b.price - a.price);
    case "newest":
    default:
      return filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}
