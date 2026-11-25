import { asc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { categorias } from '../models/categoria.model.js';
import { nomeValido, validarCampos } from './validacao.js';

const regras = { nome: nomeValido };

function naoEncontrado(res) {
  return res.status(404).json({ erro: 'Categoria com esse ID não existe.' });
}

export async function listar(_req, res) {
  res.json(await db.select().from(categorias).orderBy(asc(categorias.id)));
}

export async function buscar(req, res) {
  const [registro] = await db.select().from(categorias).where(eq(categorias.id, req.recursoId));
  return registro ? res.json(registro) : naoEncontrado(res);
}

export async function criar(req, res) {
  const valores = validarCampos(req.body, regras);
  if (!valores) return res.status(400).json({ erro: 'Campos inválidos para criação.' });

  const [registro] = await db.insert(categorias).values(valores).returning();
  res.location(`/categorias/${registro.id}`).status(201).json(registro);
}

export async function atualizar(req, res) {
  const valores = validarCampos(req.body, regras, true);
  if (!valores) return res.status(400).json({ erro: 'Campos inválidos para atualização.' });

  const [registro] = await db.update(categorias).set(valores)
    .where(eq(categorias.id, req.recursoId)).returning();
  return registro ? res.json(registro) : naoEncontrado(res);
}

export async function remover(req, res) {
  const [registro] = await db.delete(categorias).where(eq(categorias.id, req.recursoId))
    .returning({ id: categorias.id });
  return registro ? res.status(204).end() : naoEncontrado(res);
}
