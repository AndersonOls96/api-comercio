import { boolean, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const tarefas = pgTable('tarefas', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 200 }).notNull(),
  concluida: boolean('concluida').notNull().default(false),
  criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
});
