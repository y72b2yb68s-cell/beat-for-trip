#!/bin/sh
# Demo-only startup wrapper for Railway. Links the app's storage locations to
# the persistent Volume mounted at /data, applies migrations, seeds the 5
# real demo beats (metadata only — audio files are uploaded to the volume
# separately via `railway volume files upload`), then starts the server.
# Not used anywhere outside this Railway service; local dev is untouched.
set -e

echo "=== DEBUG: pwd and pre-state ==="
pwd
echo "storage/beats before:" && ls -la storage/beats 2>&1 || echo "  (missing)"
echo "=== DEBUG: /data/storage/beats contents at boot ==="
ls -la /data/storage/beats 2>&1 || echo "/data/storage/beats missing"
echo "=== END DEBUG ==="

mkdir -p /data/storage/beats /data/public/covers /data/public/previews

# Parent dirs aren't guaranteed to exist in the uploaded build (empty dirs
# with only a .gitkeep can be dropped depending on how the deploy source was
# packaged), so create them explicitly before symlinking into them.
mkdir -p storage public
rm -rf storage/beats public/covers public/previews
ln -s /data/storage/beats storage/beats
ln -s /data/public/covers public/covers
ln -s /data/public/previews public/previews

echo "=== DEBUG: post-symlink state ==="
readlink -f storage/beats
ls -la storage/beats
echo "=== END DEBUG ==="

npx prisma migrate deploy
npx tsx prisma/seed-demo.ts

exec npx next start
