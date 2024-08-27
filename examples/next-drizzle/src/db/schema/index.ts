import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pageLoads = sqliteTable('page_loads', {
  id: text('id'),
  loadedAt: integer('loaded_at', { mode: 'timestamp' }),
})
