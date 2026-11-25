import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '../db.js';
import { produtos } from '../models/produto.model.js';
import { itensVenda, vendas } from '../models/venda.model.js';
import { inteiroPositivo, MAX_INTEIRO, objeto } from './validacao.js';

const camposItem = new Set(['produtoId', 'quantidade']);

export async function listar(_req, res) {
  res.json(await db.select().from(vendas).orderBy(asc(vendas.id)));
}

export async function buscar(req, res) {
  const [venda] = await db.select().from(vendas).where(eq(vendas.id, req.recursoId));
  if (!venda) return res.status(404).json({ erro: 'Venda não encontrada.' });

  const itens = await db.select().from(itensVenda).where(eq(itensVenda.vendaId, venda.id))
    .orderBy(asc(itensVenda.produtoId));
  res.json({ ...venda, itens });
}

export async function criar(req, res) {
  const body = req.body;
  if (!objeto(body) || Object.keys(body).length !== 1 || !Array.isArray(body.itens) || !body.itens.length) {
    return res.status(400).json({ erro: 'Envie uma lista não vazia em itens.' });
  }

  const quantidades = new Map();
  for (const item of body.itens) {
    if (!objeto(item) || Object.keys(item).some((campo) => !camposItem.has(campo))
        || !inteiroPositivo(item.produtoId) || !inteiroPositivo(item.quantidade)
        || quantidades.has(item.produtoId)) {
      return res.status(400).json({ erro: 'Informe produtoId único e quantidade inteira positiva para cada item.' });
    }
    quantidades.set(item.produtoId, item.quantidade);
  }

  const resultado = await db.transaction(async (tx) => {
    const registros = await tx.select({ id: produtos.id, preco: produtos.precoCentavos })
      .from(produtos).where(inArray(produtos.id, [...quantidades.keys()]))
      .orderBy(asc(produtos.id)).for('share');

    if (registros.length !== quantidades.size) {
      return { status: 404, erro: 'Produto da venda não encontrado.' };
    }

    const itens = registros.map(({ id, preco }) => ({
      produtoId: id,
      quantidade: quantidades.get(id),
      precoUnitarioCentavos: preco,
    }));
    let totalCentavos = 0;
    for (const item of itens) {
      totalCentavos += item.precoUnitarioCentavos * item.quantidade;
      if (totalCentavos > MAX_INTEIRO) {
        return { status: 400, erro: 'O total da venda excede o limite permitido.' };
      }
    }

    const [venda] = await tx.insert(vendas).values({ totalCentavos }).returning();
    const itensGravados = await tx.insert(itensVenda)
      .values(itens.map((item) => ({ ...item, vendaId: venda.id }))).returning();
    return { venda: { ...venda, itens: itensGravados } };
  });

  if (resultado.erro) return res.status(resultado.status).json({ erro: resultado.erro });
  res.location(`/vendas/${resultado.venda.id}`).status(201).json(resultado.venda);
}
