import express from 'express';
import { asc, eq, sql } from 'drizzle-orm';
import { db, pool } from './db.js';
import { tarefas } from './schema.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'indisponivel' });
  }
});

app.param('id', (req, res, next, value) => {
  const id = Number(value);
  if (!/^[1-9]\d*$/.test(value) || id > 2147483647) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  req.tarefaId = id;
  next();
});

function validarTarefa(req, res, next) {
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

app.get('/tarefas', async (_req, res) => {
  res.json(await db.select().from(tarefas).orderBy(asc(tarefas.id)));
});

app.post('/tarefas', validarTarefa, async (req, res) => {
  const [tarefa] = await db.insert(tarefas).values(req.valoresTarefa).returning();
  res.location(`/tarefas/${tarefa.id}`).status(201).json(tarefa);
});

app.get('/tarefas/:id', async (req, res) => {
  const [tarefa] = await db.select().from(tarefas).where(eq(tarefas.id, req.tarefaId));
  return tarefa ? res.json(tarefa) : tarefaNaoEncontrada(res);
});

app.patch('/tarefas/:id', validarTarefa, async (req, res) => {
  const [tarefa] = await db.update(tarefas).set(req.valoresTarefa)
    .where(eq(tarefas.id, req.tarefaId)).returning();
  return tarefa ? res.json(tarefa) : tarefaNaoEncontrada(res);
});

app.delete('/tarefas/:id', async (req, res) => {
  const [tarefa] = await db.delete(tarefas).where(eq(tarefas.id, req.tarefaId))
    .returning({ id: tarefas.id });
  return tarefa ? res.status(204).end() : tarefaNaoEncontrada(res);
});

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ erro: 'Corpo ou formato da requisição inválido.' });
  }
  console.error('Falha ao processar requisição', error.cause?.code ?? error.code ?? error.name);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API escutando na porta ${server.address().port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(async (error) => {
      if (error) process.exitCode = 1;
      await pool.end();
    });
  });
}
