import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import type { StorageProvider } from "./types";

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const PROTECTED_DIR = path.join(PROJECT_ROOT, "storage", "beats");

function safeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .slice(0, 60);
  return `${randomUUID()}-${base || "file"}${ext}`;
}

export class LocalStorageProvider implements StorageProvider {
  async savePublicFile(
    folder: "covers" | "previews" | "media",
    filename: string,
    data: Buffer
  ): Promise<string> {
    const dir = path.join(PUBLIC_DIR, folder);
    await mkdir(dir, { recursive: true });
    const name = safeFilename(filename);
    await writeFile(path.join(dir, name), data);
    return `/${folder}/${name}`;
  }

  async saveProtectedFile(filename: string, data: Buffer): Promise<string> {
    await mkdir(PROTECTED_DIR, { recursive: true });
    const name = safeFilename(filename);
    await writeFile(path.join(PROTECTED_DIR, name), data);
    return name;
  }

  async readProtectedFile(key: string): Promise<Buffer> {
    const safeKey = path.basename(key);
    return readFile(path.join(PROTECTED_DIR, safeKey));
  }

  async deletePublicFile(url: string): Promise<void> {
    if (!url) return;
    const relative = url.replace(/^\/+/, "");
    const filePath = path.join(PUBLIC_DIR, relative);
    if (!filePath.startsWith(PUBLIC_DIR)) return;
    await unlink(filePath).catch(() => {});
  }

  async deleteProtectedFile(key: string): Promise<void> {
    if (!key) return;
    const safeKey = path.basename(key);
    await unlink(path.join(PROTECTED_DIR, safeKey)).catch(() => {});
  }
}
