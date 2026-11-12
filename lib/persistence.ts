import fs from "fs";
import path from "path";
import { BengkelStore } from "./store";
import { createAdminClient } from "./supabase";

export interface PersistedSnapshot {
  version: number;
  updatedAt: string;
  store: BengkelStore;
}

declare global {
  // eslint-disable-next-line no-var
  var __bengkelStoreVersion: number | undefined;
}

function getStorageFilePath(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return "/tmp/bengkelpro-store.json";
  }
  return path.join(process.cwd(), ".bengkelpro-data", "store.json");
}

export function isPersistenceEnabled(): boolean {
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

export function readSnapshotFromDisk(): PersistedSnapshot | null {
  if (!isPersistenceEnabled()) return null;
  try {
    const filePath = getStorageFilePath();
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw) as PersistedSnapshot;
    if (!parsed || !parsed.store || !Array.isArray(parsed.store.workOrders)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSnapshotToDisk(snapshot: PersistedSnapshot): void {
  if (!isPersistenceEnabled()) return;
  try {
    const filePath = getStorageFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(snapshot), "utf8");
    fs.renameSync(tmpPath, filePath);
  } catch {
    // Non-fatal fallback to in-memory/Supabase
  }
}

export async function hydrateRuntimeStore(
  getCurrentVersion: () => number,
  applyStore: (nextStore: BengkelStore, version: number) => void
): Promise<void> {
  if (!isPersistenceEnabled()) return;

  const currentVersion = getCurrentVersion();

  // 1. Check Supabase primary runtime state if configured with service role
  const admin = createAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from("app_runtime_state")
        .select("version, payload, updated_at")
        .eq("id", "primary")
        .maybeSingle();

      if (!error && data && data.payload && typeof data.version === "number") {
        if (data.version > currentVersion) {
          applyStore(data.payload as BengkelStore, data.version);
          writeSnapshotToDisk({
            version: data.version,
            updatedAt: data.updated_at || new Date().toISOString(),
            store: data.payload as BengkelStore,
          });
          return;
        }
      }
    } catch {
      // Graceful fallback to disk snapshot
    }
  }

  // 2. Fallback to atomic disk snapshot (/tmp on Vercel or .bengkelpro-data locally)
  const disk = readSnapshotFromDisk();
  if (disk && disk.version > currentVersion) {
    applyStore(disk.store, disk.version);
  }
}

export async function persistRuntimeStore(
  store: BengkelStore,
  nextVersion: number
): Promise<void> {
  if (!isPersistenceEnabled()) return;

  const snapshot: PersistedSnapshot = {
    version: nextVersion,
    updatedAt: new Date().toISOString(),
    store: JSON.parse(JSON.stringify(store)) as BengkelStore,
  };

  writeSnapshotToDisk(snapshot);

  const admin = createAdminClient();
  if (admin) {
    try {
      await admin.from("app_runtime_state").upsert(
        {
          id: "primary",
          version: nextVersion,
          payload: snapshot.store,
          updated_at: snapshot.updatedAt,
        },
        { onConflict: "id" }
      );
    } catch {
      // Non-blocking fallback: disk snapshot already written
    }
  }
}
