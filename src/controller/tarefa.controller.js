import { asc, eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { tarefas } from '../model/tarefa.model.js';

export function validarTarefa(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ erro: 'Envie um objeto JSON.' });
  }

  const campos = Object.keys(body);
  if (!campos.length || campos.some((campo) => campo !== 'titulo' && campo !== 'concluida')) {
    return res.status(400).json({ erro: 'Informe titulo ou concluida.' });
  }

  const valores = {};
  if (req.method === 'POST' || Object.hasOwn(body, 'titulo')) {
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : '';
    if (!titulo || [...titulo].length > 200 || titulo.includes('\0')) {
      return res.status(400).json({ erro: 'Informe um título válido de até 200 caracteres.' });
    }
    valores.titulo = titulo;
  }
  if (Object.hasOwn(body, 'concluida')) {
    if (typeof body.concluida !== 'boolean') {
      return res.status(400).json({ erro: 'concluida deve ser um booleano.' });
    }
    valores.concluida = body.concluida;
  }

  req.valoresTarefa = valores;
  next();
}

function tarefaNaoEncontrada(res) {
  return res.status(404).json({ erro: 'Tarefa não encontrada.' });
}

export async function listar(_req, res) {
  res.json(await db.select().from(tarefas).orderBy(asc(tarefas.id)));
}

export async function criar(req, res) {
  const [tarefa] = await db.insert(tarefas).values(req.valoresTarefa).returning();
  res.location(`/tarefas/${tarefa.id}`).status(201).json(tarefa);
}

export async function buscar(req, res) {
  const [tarefa] = await db.select().from(tarefas).where(eq(tarefas.id, req.recursoId));
  return tarefa ? res.json(tarefa) : tarefaNaoEncontrada(res);
}

export async function atualizar(req, res) {
  const [tarefa] = await db.update(tarefas).set(req.valoresTarefa)
    .where(eq(tarefas.id, req.recursoId)).returning();
  return tarefa ? res.json(tarefa) : tarefaNaoEncontrada(res);
}

export async function remover(req, res) {
  const [tarefa] = await db.delete(tarefas).where(eq(tarefas.id, req.recursoId))
    .returning({ id: tarefas.id });
  return tarefa ? res.status(204).end() : tarefaNaoEncontrada(res);
}
