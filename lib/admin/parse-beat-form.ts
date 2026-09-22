const TEXT_FIELDS = [
  "title",
  "slug",
  "description",
  "genre",
  "bpm",
  "key",
  "duration",
  "price",
  "status",
] as const;

export function extractBeatFields(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const key of TEXT_FIELDS) {
    const val = formData.get(key);
    if (typeof val === "string") obj[key] = val;
  }
  return obj;
}

export function extractFile(formData: FormData, key: string): File | null {
  const val = formData.get(key);
  return val instanceof File && val.size > 0 ? val : null;
}
