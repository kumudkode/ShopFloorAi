import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './backend/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './factory.sqlite',
  },
})
