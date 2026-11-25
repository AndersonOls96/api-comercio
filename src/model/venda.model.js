import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, primaryKey, serial, timestamp } from 'drizzle-orm/pg-core';
import { produtos } from './produto.model.js';

export const vendas = pgTable('vendas', {
  id: serial('id').primaryKey(),
  totalCentavos: integer('total_centavos').notNull(),
  criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
}, (tabela) => [
  check('vendas_total_positivo', sql`${tabela.totalCentavos} > 0`),
]);

export const itensVenda = pgTable('itens_venda', {
  vendaId: integer('venda_id').notNull().references(() => vendas.id),
  produtoId: integer('produto_id').notNull().references(() => produtos.id),
  quantidade: integer('quantidade').notNull(),
  precoUnitarioCentavos: integer('preco_unitario_centavos').notNull(),
}, (tabela) => [
  primaryKey({ columns: [tabela.vendaId, tabela.produtoId] }),
  index('itens_venda_produto_id_idx').on(tabela.produtoId),
  check('itens_venda_quantidade_positiva', sql`${tabela.quantidade} > 0`),
  check('itens_venda_preco_positivo', sql`${tabela.precoUnitarioCentavos} > 0`),
]);
