import { asc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { produtos } from '../models/produto.model.js';
import { inteiroPositivo, nomeValido, validarCampos } from './validacao.js';

const regras = { nome: nomeValido, precoCentavos: inteiroPositivo, categoriaId: inteiroPositivo };

function naoEncontrado(res) {
  return res.status(404).json({ erro: 'Produto com esse ID não existe.' });
}

export async function listar(_req, res) {
  res.json(await db.select().from(produtos).orderBy(asc(produtos.id)));
}

export async function buscar(req, res) {
  const [registro] = await db.select().from(produtos).where(eq(produtos.id, req.recursoId));
  return registro ? res.json(registro) : naoEncontrado(res);
}

export async function criar(req, res) {
  const valores = validarCampos(req.body, regras);
  if (!valores) return res.status(400).json({ erro: 'Campos inválidos para criação.' });

  const [registro] = await db.insert(produtos).values(valores).returning();
  res.location(`/produtos/${registro.id}`).status(201).json(registro);
}

export async function atualizar(req, res) {
  const valores = validarCampos(req.body, regras, true);
  if (!valores) return res.status(400).json({ erro: 'Campos inválidos para atualização.' });

  const [registro] = await db.update(produtos).set(valores)
    .where(eq(produtos.id, req.recursoId)).returning();
  return registro ? res.json(registro) : naoEncontrado(res);
}

export async function remover(req, res) {
  const [registro] = await db.delete(produtos).where(eq(produtos.id, req.recursoId))
    .returning({ id: produtos.id });
  return registro ? res.status(204).end() : naoEncontrado(res);
}
