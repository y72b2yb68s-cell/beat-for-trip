import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local-storage";

/**
 * Storage is provider-agnostic. LocalStorageProvider is used for local dev and
 * simple single-server deployments. Swap this for an S3Provider, R2Provider or
 * SupabaseStorageProvider later by implementing StorageProvider and changing
 * this one export — no callers need to change.
 */
export const storage: StorageProvider = new LocalStorageProvider();

export type { StorageProvider } from "./types";
