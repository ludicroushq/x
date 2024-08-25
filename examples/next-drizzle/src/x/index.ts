import {X} from '@xframework/next'
import { createDrizzleModule } from '@xframework/db/drizzle'
import { db } from '../db'

export const x = X({
  modules: {
    db: createDrizzleModule(db)
  }
})
