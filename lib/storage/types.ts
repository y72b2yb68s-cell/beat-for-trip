export interface StorageProvider {
  /** Save a publicly-servable file (cover art, preview audio, or CMS media) and return its public URL. */
  savePublicFile(folder: "covers" | "previews" | "media", filename: string, data: Buffer): Promise<string>;

  /** Save a protected file (the full, purchasable beat) and return an opaque storage key. */
  saveProtectedFile(filename: string, data: Buffer): Promise<string>;

  /** Read a protected file's bytes by its storage key. Only call after verifying payment. */
  readProtectedFile(key: string): Promise<Buffer>;

  /** Delete a previously saved public file, given the public URL returned by savePublicFile. */
  deletePublicFile(url: string): Promise<void>;

  /** Delete a previously saved protected file, given its storage key. */
  deleteProtectedFile(key: string): Promise<void>;
}
