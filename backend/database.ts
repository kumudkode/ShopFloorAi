import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { join } from "node:path";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { workers, workstations, events } from "./schema";
import type { Worker, Workstation, AIEvent, EventType } from "./types";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteInstance: Database | null = null;

function getDb() {
  if (!dbInstance) {
    const dbPath = join(process.cwd(), "factory.sqlite");
    console.log("[DB] Connecting to:", dbPath);
    try {
      sqliteInstance = new Database(dbPath, { create: true });
      dbInstance = drizzle(sqliteInstance);
      initializeDatabase();
    } catch (e) {
      console.error("[DB] Failed to initialize:", e);
      throw e;
    }
  }
  return dbInstance;
}

function getSqlite() {
  if (!sqliteInstance) {
    getDb(); // This will initialize both instances
  }
  return sqliteInstance!;
}

const validEventTypes = ["working", "idle", "absent", "product_count"] as const;

function mapRowToAIEvent(row: Record<string, unknown>): AIEvent {
  if (!row) return undefined as unknown as AIEvent;
  const evtType = row.event_type as unknown as string;
  const event_type = validEventTypes.includes(evtType as any)
    ? (evtType as EventType)
    : (() => {
        throw new Error(`Invalid event_type from DB: ${evtType}`);
      })();

  return {
    id: typeof row.id === "number" ? row.id : undefined,
    timestamp: String(row.timestamp),
    worker_id: String(row.worker_id),
    workstation_id: String(row.workstation_id),
    event_type,
    confidence:
      typeof row.confidence === "number"
        ? row.confidence
        : Number(row.confidence),
    count: row.count == null ? undefined : (row.count as number),
    created_at: row.created_at == null ? undefined : String(row.created_at),
  };
}

// Database initialization
export function initializeDatabase() {
  const sqlite = getSqlite();
  // Create tables if they don't exist
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS workers (
      worker_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS workstations (
      station_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      worker_id TEXT NOT NULL,
      workstation_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      confidence REAL NOT NULL,
      count INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Worker CRUD operations
export function createWorker(worker: Worker): Worker {
  getDb().insert(workers).values(worker).run();
  return worker;
}

export function getWorkers(): Worker[] {
  return getDb().select().from(workers).all();
}

export function getWorkerById(workerId: string): Worker | undefined {
  return getDb()
    .select()
    .from(workers)
    .where(eq(workers.worker_id, workerId))
    .get();
}

// Workstation CRUD operations
export function createWorkstation(station: Workstation): Workstation {
  getDb().insert(workstations).values(station).run();
  return station;
}

export function getWorkstations(): Workstation[] {
  return getDb().select().from(workstations).all();
}

export function getWorkstationById(stationId: string): Workstation | undefined {
  return getDb()
    .select()
    .from(workstations)
    .where(eq(workstations.station_id, stationId))
    .get();
}

// Event CRUD operations
export function createEvent(
  event: Omit<AIEvent, "id" | "created_at">,
): AIEvent {
  const result = getDb()
    .insert(events)
    .values({
      timestamp: event.timestamp,
      worker_id: event.worker_id,
      workstation_id: event.workstation_id,
      event_type: event.event_type,
      confidence: event.confidence,
      count: event.count ?? null,
    })
    .returning()
    .get();

  return mapRowToAIEvent(result as Record<string, unknown>);
}

export function getEvents(filters?: {
  worker_id?: string;
  workstation_id?: string;
  event_type?: EventType;
  start_time?: string;
  end_time?: string;
}): AIEvent[] {
  const db = getDb();
  let query = db.select().from(events);

  const conditions = [];

  if (filters?.worker_id) {
    conditions.push(eq(events.worker_id, filters.worker_id));
  }
  if (filters?.workstation_id) {
    conditions.push(eq(events.workstation_id, filters.workstation_id));
  }
  if (filters?.event_type) {
    conditions.push(eq(events.event_type, filters.event_type));
  }
  if (filters?.start_time) {
    conditions.push(gte(events.timestamp, filters.start_time));
  }
  if (filters?.end_time) {
    conditions.push(lte(events.timestamp, filters.end_time));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = query.all() as Array<Record<string, unknown>>;
  console.log(`[DB] getEvents filters:`, filters, `Count:`, results.length);

  return results.map(mapRowToAIEvent);
}

export function getLatestEventByWorker(workerId: string): AIEvent | undefined {
  const row = getDb()
    .select()
    .from(events)
    .where(eq(events.worker_id, workerId))
    .orderBy(desc(events.timestamp))
    .limit(1)
    .get() as Record<string, unknown> | undefined;

  if (!row) return undefined;
  return mapRowToAIEvent(row);
}

export function getLatestEventByStation(
  stationId: string,
): AIEvent | undefined {
  const row = getDb()
    .select()
    .from(events)
    .where(eq(events.workstation_id, stationId))
    .orderBy(desc(events.timestamp))
    .limit(1)
    .get() as Record<string, unknown> | undefined;

  if (!row) return undefined;
  return mapRowToAIEvent(row);
}

export function clearAllData() {
  const db = getDb();
  db.delete(events).run();
  db.delete(workers).run();
  db.delete(workstations).run();
}

export function getEventCount(): number {
  const sqlite = getSqlite();
  const result = sqlite.query("SELECT COUNT(*) as count FROM events").get() as {
    count: number;
  };
  return result.count;
}

export function getWorkerCount(): number {
  const sqlite = getSqlite();
  const result = sqlite
    .query("SELECT COUNT(*) as count FROM workers")
    .get() as { count: number };
  return result.count;
}

export function getWorkstationCount(): number {
  const sqlite = getSqlite();
  const result = sqlite
    .query("SELECT COUNT(*) as count FROM workstations")
    .get() as { count: number };
  return result.count;
}
