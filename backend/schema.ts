import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const workers = sqliteTable('workers', {
  worker_id: text('worker_id').primaryKey(),
  name: text('name').notNull(),
  created_at: text('created_at').notNull(),
})

export const workstations = sqliteTable('workstations', {
  station_id: text('station_id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  created_at: text('created_at').notNull(),
})

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: text('timestamp').notNull(),
  worker_id: text('worker_id').notNull(),
  workstation_id: text('workstation_id').notNull(),
  event_type: text('event_type').notNull(),
  confidence: real('confidence').notNull(),
  count: integer('count'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
})
