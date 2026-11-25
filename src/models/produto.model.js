import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { categorias } from './categoria.model.js';

export const produtos = pgTable('produtos', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 120 }).notNull(),
  precoCentavos: integer('preco_centavos').notNull(),
  categoriaId: integer('categoria_id').notNull().references(() => categorias.id),
}, (tabela) => [
  check('produtos_preco_positivo', sql`${tabela.precoCentavos} > 0`),
  index('produtos_categoria_id_idx').on(tabela.categoriaId),
]);
